import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as mockStore from './mockStore.js';

dotenv.config();

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

// Inicializar Supabase solo si no usamos mock (service_role en backend para bypass RLS)
const supabase = !USE_MOCK_DATA && process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  : null;

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Registrar evento de auditoría
async function logAudit(action, userId, email, req) {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const user_agent = req.headers['user-agent'];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (USE_MOCK_DATA) {
      console.log(`📝 [Mock] Auditoría: ${action} para ${email}`);
      await mockStore.insertAudit({ user_id: isUUID ? userId : null, email: email || 'N/A', action, ip, user_agent });
      return;
    }
    console.log(`📝 Registrando auditoría en Supabase: ${action} para ${email}`);
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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    if (USE_MOCK_DATA) {
      const { data: existingUser } = await mockStore.getExistingUserByEmail(email);
      if (existingUser) return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      const { data: newUser, error: createError } = await mockStore.createUser({ name, email, password, role: 'user', verified: false });
      if (createError) throw createError;
      await logAudit('USER_REGISTERED', newUser.id, email, req);
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await mockStore.insertOtp({ user_id: newUser.id, code: otpCode, expires_at: expiresAt });
      if (process.env.GMAIL_USER) {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Código de Verificación OTP',
          html: `<h2>¡Bienvenido!</h2><p>Tu código es: <b style="font-size: 24px;">${otpCode}</b></p>`,
        });
      }
      return res.json({ success: true, message: 'Usuario registrado. Verifica tu email.', userId: newUser.id });
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
    const { email, password } = req.body;
    let user;

    if (USE_MOCK_DATA) {
      const { data: u, error } = await mockStore.getUserByEmail(email);
      if (error || !u) {
        await logAudit('LOGIN_FAILED', null, email, req);
        return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
      }
      user = u;
    } else {
      const { data: u, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error) {
        console.error('🔴 Supabase login error:', error.message, error.code);
        await logAudit('LOGIN_FAILED', null, email, req);
        return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
      }
      user = u;
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
    const { email, code } = req.body;

    if (USE_MOCK_DATA) {
      const { data: user, error: userError } = await mockStore.getUserByEmail(email);
      if (userError || !user) return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
      const { data: otpData, error: otpError } = await mockStore.getLatestOtpByUserId(user.id);
      if (otpError || !otpData) return res.status(400).json({ success: false, message: 'OTP no solicitado' });
      if (new Date() > new Date(otpData.expires_at)) {
        await mockStore.deleteOtpById(otpData.id);
        return res.status(400).json({ success: false, message: 'Código expirado' });
      }
      const newAttempts = (otpData.attempts || 0) + 1;
      await mockStore.updateOtpAttempts(otpData.id, newAttempts);
      if (code !== otpData.code) {
        if (newAttempts >= otpData.max_attempts) await mockStore.deleteOtpById(otpData.id);
        return res.status(400).json({ success: false, message: `Código incorrecto. Intentos: ${newAttempts}/${otpData.max_attempts}` });
      }
      await mockStore.updateUserById(user.id, { verified: true });
      await mockStore.deleteOtpsByUserId(user.id);
      await logAudit('OTP_VERIFIED_SUCCESS', user.id, email, req);
      return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }

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
  if (USE_MOCK_DATA) {
    const { data, error } = await mockStore.getEmployees();
    return res.json({ success: !error, employees: data || [] });
  }
  const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
  res.json({ success: !error, employees: data || [] });
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, employeeType, department, position, hireDate, status } = req.body;
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

    if (USE_MOCK_DATA) {
      const { data: newUser, error: userError } = await mockStore.createUser({
        name, email, password: tempPassword, role: 'user', verified: true, must_change_password: true
      });
      if (userError) return res.status(400).json({ success: false, message: 'Error al crear credenciales' });
      await mockStore.createEmployee({
        user_id: newUser.id, name, email, phone,
        employee_type: employeeType, department, position, hire_date: hireDate, status
      });
      await logAudit('EMPLOYEE_REGISTERED', newUser.id, email, req);
      if (process.env.GMAIL_USER) {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: '🎉 Bienvenido al Sistema',
          html: `<h3>Hola ${name}</h3><p>Tu clave temporal es: <code>${tempPassword}</code></p>`
        });
      }
      return res.json({ success: true, message: 'Empleado creado' });
    }

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
  const { id } = req.params;
  if (USE_MOCK_DATA) {
    const { error } = await mockStore.deleteEmployeeById(id);
    return res.json({ success: !error });
  }
  const { error } = await supabase.from('employees').delete().eq('id', id);
  res.json({ success: !error });
});

// ==================== OTROS ====================

app.get('/api/audit', async (req, res) => {
  if (USE_MOCK_DATA) {
    const { data, error } = await mockStore.getAuditLogs(100);
    return res.json({ success: !error, audits: data || [] });
  }
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  res.json({ success: !error, audits: data || [] });
});

app.get('/api/users/count', async (req, res) => {
  if (USE_MOCK_DATA) {
    const { count, error } = await mockStore.getUsersCount();
    return res.json({ success: !error, count: count || 0 });
  }
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
  res.json({ success: !error, count: count || 0 });
});

app.post('/api/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (USE_MOCK_DATA) {
    const { error } = await mockStore.updateUserByEmail(email, { password: newPassword, must_change_password: false });
    return res.json({ success: !error });
  }
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

    if (USE_MOCK_DATA) {
      const a = await mockStore.getAnalyticsCount();
      const u = await mockStore.getUsersCount();
      totalVisits = a.count || 0;
      registeredUsers = u.count || 0;
      const { data: rows } = await mockStore.getAnalyticsTracking();
      const built = buildAnalyticsSummary(rows || [], days);
      dailyVisits = built.dailyVisits;
      topPages = built.topPages;
      const total = dailyVisits.reduce((s, d) => s + d.visitas, 0) || 1;
      devices = { desktop: Math.round((total * 0.9) / total * 100), mobile: Math.round((total * 0.1) / total * 100), other: 0 };
    } else if (supabase) {
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
  if (USE_MOCK_DATA) {
    await mockStore.insertAnalyticsTracking(payload);
  } else {
    await supabase.from('analytics_tracking').insert([payload]);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(USE_MOCK_DATA
    ? `🚀 Servidor en modo MOCK (JSON) en http://localhost:${PORT}`
    : `🚀 Servidor Supabase corriendo en http://localhost:${PORT}`);
});
