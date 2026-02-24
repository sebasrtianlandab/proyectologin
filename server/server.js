import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Registrar evento de auditoría
async function logAudit(action, userId, email, req) {
  try {
    console.log(`📝 Registrando auditoría en Supabase: ${action} para ${email}`);

    // Validar si el userId es un UUID válido (formato 8-4-4-4-12)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: isUUID ? userId : null, // Solo enviamos si es UUID
        email: email || 'N/A',
        action,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      }]);

    if (error) console.error('Error en Supabase Audit:', error.message);
  } catch (error) {
    console.error('Error al guardar auditoría:', error);
  }
}

// Configurar Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ==================== RUTAS USUARIOS ====================

// POST /api/register - Registro de usuario
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    // Verificar si existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ name, email, password, role: 'user', verified: false }])
      .select()
      .single();

    if (createError) throw createError;

    await logAudit('USER_REGISTERED', newUser.id, email, req);

    // Generar OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert([{ user_id: newUser.id, code: otpCode, expires_at: expiresAt }]);

    if (otpError) throw otpError;

    // Enviar email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de Verificación OTP',
      html: `<h2>¡Bienvenido!</h2><p>Tu código es: <b style="font-size: 24px;">${otpCode}</b></p>`,
    });

    res.json({ success: true, message: 'Usuario registrado. Verifica tu email.', userId: newUser.id });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || user.password !== password) {
      await logAudit('LOGIN_FAILED', null, email, req);
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    await logAudit('LOGIN_SUCCESS_DIRECT', user.id, email, req);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.must_change_password }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de login' });
  }
});

// POST /api/verify-otp
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Buscar usuario por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    if (userError || !user) return res.status(400).json({ success: false, message: 'Usuario no encontrado' });

    // Buscar código OTP activo
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) return res.status(400).json({ success: false, message: 'OTP no solicitado' });

    // Verificar expiración
    if (new Date() > new Date(otpData.expires_at)) {
      await supabase.from('otp_codes').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: 'Código expirado' });
    }

    // Incrementar intentos
    const newAttempts = (otpData.attempts || 0) + 1;
    await supabase.from('otp_codes').update({ attempts: newAttempts }).eq('id', otpData.id);

    if (code !== otpData.code) {
      if (newAttempts >= otpData.max_attempts) {
        await supabase.from('otp_codes').delete().eq('id', otpData.id);
        return res.status(400).json({ success: false, message: 'Límite de intentos excedido' });
      }
      return res.status(400).json({ success: false, message: `Código incorrecto. Intentos: ${newAttempts}/${otpData.max_attempts}` });
    }

    // Correcto
    await supabase.from('users').update({ verified: true }).eq('id', user.id);
    await supabase.from('otp_codes').delete().eq('user_id', user.id);
    await logAudit('OTP_VERIFIED_SUCCESS', user.id, email, req);

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de verificación' });
  }
});

// ==================== EMPLEADOS ====================

app.get('/api/employees', async (req, res) => {
  const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
  res.json({ success: !error, employees: data || [] });
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, employeeType, department, position, hireDate, status } = req.body;
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

    // 1. Crear usuario en tabla users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: tempPassword,
        role: 'user',
        verified: true,
        must_change_password: true
      }])
      .select()
      .single();

    if (userError) return res.status(400).json({ success: false, message: 'Error al crear credenciales' });

    // 2. Crear perfil en tabla employees
    const { error: empError } = await supabase
      .from('employees')
      .insert([{
        user_id: newUser.id,
        name, email, phone,
        employee_type: employeeType,
        department, position,
        hire_date: hireDate,
        status
      }]);

    if (empError) throw empError;

    await logAudit('EMPLOYEE_REGISTERED', newUser.id, email, req);

    // Enviar email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: '🎉 Bienvenido al Sistema',
      html: `<h3>Hola ${name}</h3><p>Tu clave temporal es: <code>${tempPassword}</code></p>`
    });

    res.json({ success: true, message: 'Empleado creado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  // El borrado en cascada en Supabase se encargará de users si la FK está configurada así
  const { error } = await supabase.from('employees').delete().eq('id', id);
  res.json({ success: !error });
});

// ==================== OTROS ====================

app.get('/api/audit', async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  res.json({ success: !error, audits: data || [] });
});

app.get('/api/users/count', async (req, res) => {
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
  res.json({ success: !error, count: count || 0 });
});

app.post('/api/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const { error } = await supabase.from('users').update({
    password: newPassword,
    must_change_password: false
  }).eq('email', email);
  res.json({ success: !error });
});

app.get('/api/analytics/summary', async (req, res) => {
  try {
    const { count: totalVisits } = await supabase.from('analytics_tracking').select('*', { count: 'exact', head: true });
    const { count: registeredUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

    // Mock de datos para el dashboard por ahora ya que la tabla está vacía
    res.json({
      totalVisits: totalVisits || 0,
      uniqueSessions: Math.floor((totalVisits || 0) * 0.6),
      registeredUsers: registeredUsers || 0,
      pagesPerSession: '2.5',
      dailyVisits: [],
      topPages: [],
      devices: { desktop: 100, mobile: 0, other: 0 }
    });
  } catch {
    res.json({ success: false });
  }
});

app.post('/api/analytics/track', async (req, res) => {
  await supabase.from('analytics_tracking').insert([{
    path: req.headers.referer || '/',
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    user_agent: req.headers['user-agent']
  }]);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Servidor Supabase corriendo en http://localhost:${PORT}`));
