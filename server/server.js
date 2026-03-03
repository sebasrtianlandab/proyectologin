import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { sendQuoteEmail } from './utils/mailer.js';

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
    const { error } = await supabase.from('registros_auditoria').insert([{
      usuario_id: isUUID ? userId : null,
      correo: email || 'N/A',
      accion: action,
      ip,
      agente_usuario: user_agent
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

    const { data: existingUser } = await supabase.from('usuarios').select('id').eq('correo', email).single();
    if (existingUser) return res.status(400).json({ success: false, message: 'El email ya está registrado' });

    // Lógica de roles por dominio
    const userRole = email.toLowerCase().endsWith('@senati.pe') ? 'admin' : 'cliente';

    const { data: newUser, error: createError } = await supabase.from('usuarios').insert([{
      nombre: name,
      correo: email,
      contrasena: password,
      rol: userRole,
      verificado: false
    }]).select().single();
    if (createError) throw createError;
    await logAudit('USER_REGISTERED', newUser.id, email, req);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: otpError } = await supabase.from('codigos_otp').insert([{ usuario_id: newUser.id, codigo: otpCode, expira_en: expiresAt }]);
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
    const { data: user, error } = await supabase.from('usuarios').select('*').eq('correo', email).single();
    if (error) {
      console.error('🔴 Supabase login error:', error.message, error.code);
      await logAudit('LOGIN_FAILED', null, email, req);
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!user || user.contrasena !== password) {
      if (!user) console.error('🔴 No se encontró usuario para email:', email);
      await logAudit('LOGIN_FAILED', null, email, req);
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    await logAudit('LOGIN_SUCCESS_DIRECT', user.id, email, req);
    res.json({
      success: true,
      user: { id: user.id, name: user.nombre, email: user.correo, role: user.rol, mustChangePassword: user.debe_cambiar_contrasena }
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
    const { data: user, error: userError } = await supabase.from('usuarios').select('id, nombre, correo, rol').eq('correo', email).single();
    if (userError || !user) return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    const { data: otpData, error: otpError } = await supabase.from('codigos_otp').select('*').eq('usuario_id', user.id).order('creado_en', { ascending: false }).limit(1).single();
    if (otpError || !otpData) return res.status(400).json({ success: false, message: 'OTP no solicitado' });
    if (new Date() > new Date(otpData.expira_en)) {
      await supabase.from('codigos_otp').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: 'Código expirado' });
    }
    const newAttempts = (otpData.intentos || 0) + 1;
    await supabase.from('codigos_otp').update({ intentos: newAttempts }).eq('id', otpData.id);
    if (code !== otpData.codigo) {
      if (newAttempts >= otpData.max_intentos) await supabase.from('codigos_otp').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: `Código incorrecto. Intentos: ${newAttempts}/${otpData.max_intentos}` });
    }
    await supabase.from('usuarios').update({ verificado: true }).eq('id', user.id);
    await supabase.from('codigos_otp').delete().eq('usuario_id', user.id);
    await logAudit('OTP_VERIFIED_SUCCESS', user.id, email, req);
    res.json({ success: true, user: { id: user.id, name: user.nombre, email: user.correo, role: user.rol } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de verificación' });
  }
});

// ==================== EMPLEADOS ====================

app.get('/api/employees', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, employees: [] });
  const { data, error } = await supabase.from('empleados').select('*').order('creado_en', { ascending: false });
  const mappedEmployees = (data || []).map(emp => ({
    ...emp,
    name: emp.nombre,
    email: emp.correo,
    phone: emp.telefono,
    employeeType: emp.tipo_empleado,
    department: emp.departamento,
    position: emp.cargo,
    hireDate: emp.fecha_contratacion,
    status: emp.estado,
    createdAt: emp.creado_en
  }));
  res.json({ success: !error, employees: mappedEmployees });
});

app.post('/api/employees', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { name, email, phone, employeeType, departamento, position, hireDate, status } = req.body;
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

    // Si es registro manual de empleado, forzar rol administrativo si es de senati
    const userRole = email.toLowerCase().endsWith('@senati.pe') ? 'admin' : 'cliente';

    const { data: newUser, error: userError } = await supabase.from('usuarios').insert([{
      nombre: name, correo: email, contrasena: tempPassword, rol: userRole, verificado: true, debe_cambiar_contrasena: true
    }]).select().single();
    if (userError) {
      console.error('🔴 Error al crear credenciales de usuario:', userError);
      return res.status(400).json({ success: false, message: `Error al crear credenciales: ${userError.message}` });
    }
    const { error: empError } = await supabase.from('empleados').insert([{
      usuario_id: newUser.id, nombre: name, correo: email, telefono: phone, tipo_empleado: employeeType, departamento: departamento || req.body.department, cargo: position, fecha_contratacion: hireDate, estado: status
    }]);

    if (empError) {
      console.error('🔴 Error al crear ficha de empleado:', empError);
      // Rollback manual: eliminar el usuario si no se pudo crear el empleado
      await supabase.from('usuarios').delete().eq('id', newUser.id);
      return res.status(400).json({ success: false, message: `Error al crear ficha de empleado: ${empError.message}` });
    }

    await logAudit('EMPLOYEE_REGISTERED', newUser.id, email, req);

    // Intentar enviar correo, pero no bloquear el registro si falla el correo
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: '🎉 Bienvenido al Sistema',
        html: `<h3>Hola ${name}</h3><p>Tu clave temporal es: <code>${tempPassword}</code></p>`
      });
    } catch (mailErr) {
      console.error('⚠️ Error enviando correo de bienvenida:', mailErr.message);
    }

    res.json({ success: true, message: 'Empleado creado correctamente.' });
  } catch (error) {
    console.error('🔴 Error crítico en registro de empleado:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al registrar' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { id } = req.params;
  const { error } = await supabase.from('empleados').delete().eq('id', id);
  res.json({ success: !error });
});

// ==================== OTROS ====================

app.get('/api/audit', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, audits: [] });
  const { data, error } = await supabase.from('registros_auditoria').select('*').order('fecha_hora', { ascending: false }).limit(100);
  const mappedAudits = (data || []).map(a => ({
    ...a,
    timestamp: a.fecha_hora,
    action: a.accion,
    userId: a.usuario_id,
    email: a.correo,
    userAgent: a.agente_usuario
  }));
  res.json({ success: !error, audits: mappedAudits });
});

app.get('/api/users/count', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, count: 0 });
  const { count, error } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
  res.json({ success: !error, count: count || 0 });
});

app.post('/api/change-password', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { email, newPassword } = req.body;
  const { error } = await supabase.from('usuarios').update({
    contrasena: newPassword,
    debe_cambiar_contrasena: false
  }).eq('correo', email);
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
    const t = r.fecha_hora ? new Date(r.fecha_hora) : null;
    const path = (r.ruta || '/').replace(/^https?:\/\/[^/]+/, '') || '/';
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
      const { data: rows } = await supabase.from('seguimiento_visitas').select('ruta, fecha_hora, ip');
      totalVisits = (rows && rows.length) || 0;
      const { count: ru } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
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
    ruta: req.headers.referer || '/',
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    agente_usuario: req.headers['user-agent']
  };
  if (supabase) await supabase.from('seguimiento_visitas').insert([payload]);
  res.json({ success: true });
});

app.post('/api/analytics/events', async (req, res) => {
  const { tipo_evento, ruta, detalles, cliente_id, cliente_email, sesion_id } = req.body;

  // 🔥 IMPORTANTE: El backend separa usuario_id (auth) de cliente_id (tabla clientes)
  // Para evitar fallos de foreign key, guardamos la identidad en el JSON 'detalles'
  const payload = {
    tipo_evento,
    ruta: ruta || req.headers.referer || '/',
    detalles: {
      ...detalles,
      usuario_id: cliente_id,
      email: cliente_email,
      es_registrado: !!cliente_email
    },
    sesion_id,
    // Dejamos cliente_id nulo si viene de la tabla usuarios (identificado por email)
    // Esto evita que Supabase rechace la inserción por FK
    cliente_id: null
  };

  if (supabase) {
    const { error } = await supabase.from('eventos_cliente').insert([payload]);
    if (error) console.error('🔴 Error guardando evento:', error.message);
  }
  res.json({ success: true });
});

app.get('/api/sales/quotes', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, quotes: [] });
  const { data, error } = await supabase
    .from('cotizaciones')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) console.error('🔴 Error fetching quotes:', error);
  res.json({ success: !error, quotes: data || [] });
});

app.get('/api/sales/events', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, events: [] });
  const { data, error } = await supabase
    .from('eventos_cliente')
    .select('*')
    .order('fecha_hora', { ascending: false })
    .limit(50);
  res.json({ success: !error, events: data || [] });
});

// ==================== VENTAS & CHECKOUT ====================

app.post('/api/sales/checkout', async (req, res) => {
  try {
    const { customerName, customerEmail, items, total } = req.body;

    // 1. (Opcional) Guardar en Supabase en tabla de cotizaciones o ventas
    if (supabase) {
      try {
        // Ejemplo de guardar en base de datos si existe la tabla
        await supabase.from('cotizaciones').insert([{
          cliente_nombre: customerName,
          cliente_correo: customerEmail,
          total: total,
          estado: 'pendiente'
        }]);
      } catch (e) {
        console.log('Tabla de cotizaciones no existe o error guardando:', e.message);
      }
    }

    // 2. Enviar el correo al cliente usando la cuenta proporcionada
    await sendQuoteEmail({
      to: customerEmail,
      customerName: customerName,
      items: items,
      total: total
    });

    res.json({ success: true, message: 'Pedido procesado y correo enviado con éxito.' });
  } catch (error) {
    console.error('Error procesando checkout:', error);
    res.status(500).json({ success: false, message: 'Error procesando el pedido y enviando correo.' });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('usuarios').select('id').limit(1);
      if (error) throw error;
      console.log('✅ Supabase conectado correctamente (tabla usuarios accesible)');
    } catch (err) {
      console.error('❌ Error conectando a Supabase:', err.message);
    }
  }
});
