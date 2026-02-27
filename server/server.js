import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  : null;

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Registrar evento de auditoría
async function logAudit(action, userId, email, req) {
  if (!supabase) return;
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const user_agent = req.headers['user-agent'];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const { error } = await supabase.from('audit_logs').insert([{
      user_id: isUUID ? userId : null,
      email: email || 'N/A',
      action,
      ip,
      user_agent
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
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    const { data: newUser, error: createError } = await supabase.from('users').insert([{ name, email, password, role: 'user', verified: false }]).select().single();
    if (createError) throw createError;
    await logAudit('USER_REGISTERED', newUser.id, email, req);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: otpError } = await supabase.from('otp_codes').insert([{ user_id: newUser.id, code: otpCode, expires_at: expiresAt }]);
    if (otpError) throw otpError;
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
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) {
      console.error('🔴 Supabase login error:', error.message, error.code);
      await logAudit('LOGIN_FAILED', null, email, req);
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!user || user.password !== password) {
      if (!user) console.error('🔴 No se encontró usuario para email:', email);
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
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { email, code } = req.body;
    const { data: user, error: userError } = await supabase.from('users').select('id, name, email, role').eq('email', email).single();
    if (userError || !user) return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    const { data: otpData, error: otpError } = await supabase.from('otp_codes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
    if (otpError || !otpData) return res.status(400).json({ success: false, message: 'OTP no solicitado' });
    if (new Date() > new Date(otpData.expires_at)) {
      await supabase.from('otp_codes').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: 'Código expirado' });
    }
    const newAttempts = (otpData.attempts || 0) + 1;
    await supabase.from('otp_codes').update({ attempts: newAttempts }).eq('id', otpData.id);
    if (code !== otpData.code) {
      if (newAttempts >= otpData.max_attempts) await supabase.from('otp_codes').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: `Código incorrecto. Intentos: ${newAttempts}/${otpData.max_attempts}` });
    }
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
  if (!supabase) return res.status(503).json({ success: false, employees: [] });
  const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
  res.json({ success: !error, employees: data || [] });
});

app.post('/api/employees', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { name, email, phone, employeeType, department, position, hireDate, status } = req.body;
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;
    const { data: newUser, error: userError } = await supabase.from('users').insert([{
      name, email, password: tempPassword, role: 'user', verified: true, must_change_password: true
    }]).select().single();
    if (userError) return res.status(400).json({ success: false, message: 'Error al crear credenciales' });
    const { error: empError } = await supabase.from('employees').insert([{
      user_id: newUser.id, name, email, phone, employee_type: employeeType, department, position, hire_date: hireDate, status
    }]);
    if (empError) throw empError;
    await logAudit('EMPLOYEE_REGISTERED', newUser.id, email, req);
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
  if (!supabase) return res.status(503).json({ success: false });
  const { id } = req.params;
  const { error } = await supabase.from('employees').delete().eq('id', id);
  res.json({ success: !error });
});

// ==================== OTROS ====================

app.get('/api/audit', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, audits: [] });
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  res.json({ success: !error, audits: data || [] });
});

app.get('/api/users/count', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, count: 0 });
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
  res.json({ success: !error, count: count || 0 });
});

app.post('/api/change-password', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { email, newPassword } = req.body;
  const { error } = await supabase.from('users').update({
    password: newPassword,
    must_change_password: false
  }).eq('email', email);
  res.json({ success: !error });
});

// Clave de día en fecha local (YYYY-MM-DD) para que total y gráfico usen el mismo criterio
function toLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildAnalyticsSummary(rows, days = 7) {
  const daysNum = Math.min(parseInt(days, 10) || 7, 30);
  const now = new Date();
  const byDay = {};
  for (let i = 0; i < daysNum; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (daysNum - 1 - i));
    const key = toLocalDateKey(d);
    byDay[key] = {
      key,
      date: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      visitas: 0,
      sesiones: 0,
      uniqueIps: new Set()
    };
  }

  const byPath = {};
  (rows || []).forEach((r) => {
    const t = r.timestamp ? new Date(r.timestamp) : null;
    const path = (r.path || '/').replace(/^https?:\/\/[^/]+/, '') || '/';
    if (t) {
      const key = toLocalDateKey(t);
      if (byDay[key] !== undefined) {
        byDay[key].visitas += 1;
        if (r.ip) byDay[key].uniqueIps.add(r.ip);
      }
    }
    byPath[path] = (byPath[path] || 0) + 1;
  });

  const dailyVisits = Object.values(byDay)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ date, visitas, uniqueIps }) => ({
      date,
      visitas,
      sesiones: uniqueIps.size
    }));

  const topPages = Object.entries(byPath)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return { dailyVisits, topPages };
}

app.get('/api/analytics/summary', async (req, res) => {
  try {
    const days = req.query.days || '7';
    let totalVisits = 0, registeredUsers = 0, dailyVisits = [], topPages = [], devices = { desktop: 100, mobile: 0, other: 0 };

    if (supabase) {
      const { data: rows } = await supabase.from('analytics_tracking').select('path, timestamp, ip');
      totalVisits = (rows && rows.length) || 0;
      const { count: ru } = await supabase.from('users').select('*', { count: 'exact', head: true });
      registeredUsers = ru || 0;
      const built = buildAnalyticsSummary(rows || [], days);
      dailyVisits = built.dailyVisits;
      topPages = built.topPages;
    }

    res.json({
      totalVisits,
      uniqueSessions: Math.floor(totalVisits * 0.6) || 0,
      registeredUsers,
      pagesPerSession: totalVisits ? (totalVisits / (Math.floor(totalVisits * 0.6) || 1)).toFixed(1) : '2.5',
      dailyVisits,
      topPages,
      devices: devices.desktop !== undefined ? devices : { desktop: 100, mobile: 0, other: 0 }
    });
  } catch (e) {
    console.error('Analytics summary error:', e);
    res.json({ success: false });
  }
});

app.post('/api/analytics/track', async (req, res) => {
  const payload = {
    path: req.headers.referer || '/',
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    user_agent: req.headers['user-agent']
  };
  if (supabase) await supabase.from('analytics_tracking').insert([payload]);
  res.json({ success: true });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) throw error;
      console.log('✅ Supabase conectado correctamente (tabla users accesible)');
    } catch (err) {
      console.error('❌ Error conectando a Supabase:', err.message);
    }
  }
});
