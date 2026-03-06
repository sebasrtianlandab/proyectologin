import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl
  ? createClient(supabaseUrl, serviceRoleKey || anonKey)
  : null;

if (supabase && !serviceRoleKey && anonKey) {
  console.warn('⚠️  Usando SUPABASE_ANON_KEY. Para evitar "permission denied" usa SUPABASE_SERVICE_ROLE_KEY en .env (Supabase → Settings → API → service_role).');
}

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

// POST /api/register - Registro de usuario (ERP). Crea en Auth + public.users; opcional OTP si existe tabla otp_codes.
app.post('/api/register', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { name, email, password } = req.body;
    const emailNorm = (email || '').trim().toLowerCase();
    if (!name || !emailNorm || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', emailNorm).single();
    if (existingUser) return res.status(400).json({ success: false, message: 'El email ya está registrado' });

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (authErr) {
      if (authErr.message?.includes('already') || authErr.message?.includes('registered')) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      }
      return res.status(400).json({ success: false, message: authErr.message || 'Error al crear usuario' });
    }
    const userId = authData?.user?.id;
    if (!userId) return res.status(500).json({ success: false, message: 'Error al crear usuario' });

    const userPayload = {
      id: userId,
      full_name: (name || '').trim(),
      email: emailNorm,
      password,
      role: 'user',
      origin: 'erp',
      email_verified: false,
      updated_at: new Date().toISOString(),
    };
    const { error: userErr } = await supabase.from('users').upsert(userPayload, { onConflict: 'id' });
    if (userErr) {
      const { error: insErr } = await supabase.from('users').insert(userPayload);
      if (insErr) return res.status(400).json({ success: false, message: insErr.message || 'Error al crear perfil' });
    }
    await logAudit('USER_REGISTERED', userId, emailNorm, req);

    let requiresOTP = false;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: otpError } = await supabase.from('otp_codes').insert([{ user_id: userId, code: otpCode, expires_at: expiresAt }]);
    if (!otpError) {
      requiresOTP = true;
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: emailNorm,
            subject: 'Código de Verificación OTP',
            html: `<h2>¡Bienvenido!</h2><p>Tu código es: <b style="font-size: 24px;">${otpCode}</b></p>`,
          });
        } catch (_) {}
      }
    }

    res.json({
      success: true,
      message: requiresOTP ? 'Usuario registrado. Verifica tu email.' : 'Usuario registrado. Ya puedes iniciar sesión.',
      userId,
      requiresOTP,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/register-client - Registro desde la Platform (landing). Crea en Auth + public.users (id FK a auth.users).
app.post('/api/register-client', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { full_name, email, password, phone, company } = req.body;
    const emailNorm = (email || '').trim().toLowerCase();

    if (!full_name || !emailNorm || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', emailNorm).single();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { full_name: (full_name || '').trim() },
    });
    if (authErr) {
      if (authErr.message?.includes('already') || authErr.message?.includes('registered')) {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      }
      return res.status(400).json({ success: false, message: authErr.message || 'Error al crear la cuenta' });
    }
    const userId = authData?.user?.id;
    if (!userId) return res.status(500).json({ success: false, message: 'Error al crear la cuenta' });

    const fullNameTrim = (full_name || '').trim();
    const userPayload = {
      id: userId,
      full_name: fullNameTrim,
      name: fullNameTrim,
      email: emailNorm,
      password,
      role: 'client',
      origin: 'landing',
      email_verified: false,
      updated_at: new Date().toISOString(),
    };
    if (phone != null && String(phone).trim()) userPayload.phone = String(phone).trim();
    if (company != null && String(company).trim()) userPayload.company = String(company).trim();

    const { error: userErr } = await supabase.from('users').upsert(userPayload, { onConflict: 'id' });
    if (userErr) {
      const { error: insErr } = await supabase.from('users').insert(userPayload);
      if (insErr) {
        return res.status(400).json({ success: false, message: insErr.message || 'Error al crear el perfil' });
      }
    }
    await logAudit('USER_REGISTERED', userId, emailNorm, req);
    res.status(201).json({
      success: true,
      message: 'Cuenta creada. Ya puedes iniciar sesión.',
      userId,
    });
  } catch (error) {
    console.error('Error en register-client:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error al crear la cuenta'
    });
  }
});

// GET /api/users/by-email - Obtener usuario por email (para flujos que usan getUser)
app.get('/api/users/by-email', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, user: null });
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, user: null });
    const { data: user, error } = await supabase.from('users').select('id, full_name, email, role').eq('email', email).single();
    if (error || !user) return res.json({ success: false, user: null });
    res.json({
      success: true,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ success: false, user: null });
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
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.must_change_password ?? false,
      },
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
    const emailNorm = (email || '').trim().toLowerCase();
    const { data: user, error: userError } = await supabase.from('users').select('id, full_name, email, role').eq('email', emailNorm).single();
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
      if (newAttempts >= (otpData.max_attempts || 5)) await supabase.from('otp_codes').delete().eq('id', otpData.id);
      return res.status(400).json({ success: false, message: `Código incorrecto. Intentos: ${newAttempts}/${otpData.max_attempts || 5}` });
    }
    await supabase.from('users').update({ email_verified: true, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('otp_codes').delete().eq('user_id', user.id);
    await logAudit('OTP_VERIFIED_SUCCESS', user.id, emailNorm, req);
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error de verificación' });
  }
});

// ==================== EMPLEADOS ====================

app.get('/api/employees', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, employees: [] });
  const { data: rows, error } = await supabase
    .from('employees')
    .select('id, user_id, name, email, phone, employee_type_id, department_id, position_id, hire_date, status, verified, must_change_password, created_at, updated_at, employee_types(name), departments(name), positions(name)')
    .order('created_at', { ascending: false });
  if (error) return res.json({ success: false, employees: [] });
  const employees = (rows || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    employee_type: r.employee_types?.name ?? '',
    department: r.departments?.name ?? '',
    position: r.positions?.name ?? '',
    hire_date: r.hire_date,
    status: r.status,
    verified: r.verified,
    must_change_password: r.must_change_password,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
  res.json({ success: true, employees });
});

app.post('/api/employees', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { name, email, phone, employeeType, department, position, hireDate, status } = req.body;
    // Resolver nombres a IDs (tablas employee_types, departments, positions)
    const { data: etRows } = await supabase.from('employee_types').select('id').ilike('name', (employeeType || '').trim()).limit(1);
    const { data: deptRows } = await supabase.from('departments').select('id').ilike('name', (department || '').trim()).limit(1);
    const { data: posRows } = await supabase.from('positions').select('id').ilike('name', (position || '').trim()).limit(1);
    const et = etRows?.[0];
    const dept = deptRows?.[0];
    const pos = posRows?.[0];
    const employeeTypeId = et?.id;
    const departmentId = dept?.id;
    const positionId = pos?.id ?? null;
    if (!employeeTypeId || !departmentId) {
      return res.status(400).json({ success: false, message: 'Tipo de empleado o departamento no encontrado en catálogo' });
    }
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;
    // Crear usuario en Auth (necesario si public.users.id FK a auth.users)
    let userId;
    try {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (authErr) {
        if (authErr.message?.includes('already been registered')) {
          const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).single();
          userId = existing?.id;
          if (!userId) return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        } else throw authErr;
      } else {
        userId = authUser?.user?.id;
      }
    } catch (authE) {
      const msg = authE?.message || '';
      if (msg.includes('already') || msg.includes('registered')) {
        const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).single();
        userId = existing?.id;
        if (!userId) return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      } else {
        return res.status(400).json({ success: false, message: authE?.message || 'Error al crear usuario' });
      }
    }
    const userPayload = {
      id: userId,
      full_name: name,
      email: email.trim().toLowerCase(),
      phone: phone || null,
      role: 'employee',
      origin: 'erp',
      email_verified: true,
      must_change_password: true,
      updated_at: new Date().toISOString(),
      password: tempPassword,
    };
    const { error: userUpErr } = await supabase.from('users').upsert(userPayload, { onConflict: 'id' });
    if (userUpErr) {
      const { error: insErr } = await supabase.from('users').insert(userPayload);
      if (insErr) return res.status(400).json({ success: false, message: insErr.message || 'Error al crear perfil' });
    }
    const { error: empError } = await supabase.from('employees').insert([{
      user_id: userId,
      name,
      email: email.trim().toLowerCase(),
      phone: phone || null,
      employee_type_id: employeeTypeId,
      department_id: departmentId,
      position_id: positionId,
      hire_date: hireDate || null,
      status: status || 'Activo',
      verified: true,
      must_change_password: true,
    }]);
    if (empError) return res.status(400).json({ success: false, message: empError.message || 'Error al crear empleado' });
    await logAudit('EMPLOYEE_REGISTERED', userId, email, req);
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: '🎉 Bienvenido al Sistema',
          html: `<h3>Hola ${name}</h3><p>Tu clave temporal es: <code>${tempPassword}</code></p>`
        });
      } catch (_) {}
    }
    res.json({ success: true, message: 'Empleado creado' });
  } catch (error) {
    console.error('POST /api/employees', error);
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
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
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
        const uid = r.ip || r.session_id;
        if (uid) byDay[key].uniqueIps.add(uid);
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

app.post('/api/analytics/track', async (req, res) => {
  const body = req.body || {};
  const payload = {
    session_id: body.session_id || null,
    user_id: body.user_id || null,
    event_type: 'page_view',
    page_path: body.path || req.headers.referer || '/',
    service_id: body.service_id || null,
    referrer: body.referrer || null,
    device_type: body.metadata?.device_type || null,
    metadata: body.metadata || null
  };
  if (supabase) await supabase.from('events').insert([payload]);
  res.json({ success: true });
});

// ==================== COTIZACIONES (Platform → ERP) ====================

/**
 * POST /api/quotes
 * Body: { user_id, service_id | service_code, message?, modules: [{ module_template_id | code, unit_price }], total }
 * Acepta UUIDs o códigos (service_code, module code) para integrar con la plataforma.
 */
app.post('/api/quotes', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const body = req.body || {};
    const user_id = body.user_id;
    const service_id = body.service_id;
    const service_code = body.service_code;
    const message = body.message;
    const modules = body.modules;
    const total = body.total;
    if (!user_id || total == null) {
      return res.status(400).json({ success: false, message: 'Faltan user_id o total' });
    }
    let resolvedServiceId = service_id && /^[0-9a-f-]{36}$/i.test(String(service_id)) ? service_id : null;
    const codeParam = [service_code, service_id].find((v) => v != null && String(v).trim() && !/^[0-9a-f-]{36}$/i.test(String(v)));
    if (!resolvedServiceId && codeParam) {
      const codeStr = String(codeParam).trim().toLowerCase();
      let { data: svc } = await supabase.from('services').select('id').eq('code', codeStr).maybeSingle();
      if (!svc?.id) {
        const res2 = await supabase.from('services').select('id').ilike('code', codeStr).limit(1).maybeSingle();
        svc = res2.data;
      }
      resolvedServiceId = svc?.id;
    }
    if (!resolvedServiceId) {
      const hint = codeParam ? ` (código enviado: "${String(codeParam).trim()}")` : '';
      return res.status(400).json({
        success: false,
        message: 'No se encontró el servicio en la base de datos. Ejecuta en Supabase el script supabase-seed-static.sql para cargar servicios (erp, crm, etc.).' + hint,
      });
    }

    const mods = Array.isArray(modules) ? modules : [];
    const totalNum = Number(total);
    if (isNaN(totalNum) || totalNum < 0) {
      return res.status(400).json({ success: false, message: 'total inválido' });
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        user_id,
        service_id: resolvedServiceId,
        message: message || null,
        status: 'pendiente',
        total: totalNum,
        observations: null
      }])
      .select('id')
      .single();
    if (quoteError) throw quoteError;
    if (!quote) throw new Error('No se creó la cotización');

    for (const m of mods) {
      let mid = m.module_template_id;
      const code = m.code;
      const price = Number(m.unit_price);
      if (isNaN(price)) continue;
      if (!mid && code) {
        const { data: tmpl } = await supabase.from('module_templates').select('id').eq('code', String(code)).single();
        mid = tmpl?.id;
      }
      if (!mid) continue;
      await supabase.from('quote_modules').insert([{
        quote_id: quote.id,
        module_template_id: mid,
        unit_price: price
      }]);
    }

    const { data: userRow } = await supabase.from('users').select('email, full_name').eq('id', user_id).single();
    const toEmail = userRow?.email;
    if (transporter && toEmail) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: toEmail,
          subject: 'Cotización registrada - VIISION',
          html: `<p>Hola${userRow?.full_name ? ` ${userRow.full_name}` : ''},</p><p>Tu cotización ha sido registrada correctamente. Total: S/ ${totalNum.toLocaleString('es-PE')}.</p><p>Nos pondremos en contacto contigo pronto.</p>`
        });
      } catch (mailErr) {
        console.error('Error enviando email de cotización:', mailErr.message);
      }
    }

    res.status(201).json({ success: true, quote_id: quote.id });
  } catch (error) {
    console.error('Error POST /api/quotes:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error del servidor' });
  }
});

// ==================== EVENTOS (Platform + analítica) ====================

/**
 * POST /api/events
 * Body: { event_type, page_path?, service_id?, session_id?, user_id?, referrer?, device_type?, metadata? }
 */
app.post('/api/events', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { event_type, page_path, service_id, session_id, user_id, referrer, device_type, metadata } = req.body || {};
    if (!event_type) return res.status(400).json({ success: false, message: 'event_type es requerido' });
    const allowed = ['page_view', 'click_servicio', 'click_cotizar', 'cotizacion_confirmada'];
    if (!allowed.includes(event_type)) {
      return res.status(400).json({ success: false, message: 'event_type inválido' });
    }
    const { error } = await supabase.from('events').insert([{
      session_id: session_id || null,
      user_id: user_id || null,
      event_type,
      page_path: page_path || null,
      service_id: service_id || null,
      referrer: referrer || null,
      device_type: device_type || null,
      metadata: metadata || null
    }]);
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error POST /api/events:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error del servidor' });
  }
});

// ==================== OBJETIVOS (RRHH) ====================

app.get('/api/objective-templates', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, templates: [] });
  const { data, error } = await supabase.from('objective_templates').select('*').order('sort_order');
  res.json({ success: !error, templates: data || [] });
});

app.get('/api/employee-objectives', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, objectives: [] });
  const { employee_id } = req.query;
  let q = supabase.from('employee_objectives').select('*');
  if (employee_id) q = q.eq('employee_id', employee_id);
  const { data, error } = await q.order('updated_at', { ascending: false });
  res.json({ success: !error, objectives: data || [] });
});

app.put('/api/employee-objectives', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { employee_id, objective_template_id, cumplido } = req.body;
    if (!employee_id || !objective_template_id) {
      return res.status(400).json({ success: false, message: 'Faltan employee_id u objective_template_id' });
    }
    const { error } = await supabase.from('employee_objectives').upsert(
      [{ employee_id, objective_template_id, cumplido: !!cumplido, updated_at: new Date().toISOString() }],
      { onConflict: 'employee_id,objective_template_id' }
    );
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error PUT /api/employee-objectives:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error del servidor' });
  }
});

// ==================== DESEMPEÑO (RRHH) ====================

app.get('/api/performance-evaluations', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, evaluations: [] });
  const { employee_id, periodo } = req.query;
  let q = supabase.from('performance_evaluations').select('*');
  if (employee_id) q = q.eq('employee_id', employee_id);
  if (periodo) q = q.eq('periodo', periodo);
  const { data, error } = await q.order('created_at', { ascending: false });
  res.json({ success: !error, evaluations: data || [] });
});

app.post('/api/performance-evaluations', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { employee_id, periodo, calificacion, estado, ultima_revision } = req.body;
    if (!employee_id || !periodo || calificacion == null) {
      return res.status(400).json({ success: false, message: 'Faltan employee_id, periodo o calificacion' });
    }
    const { data, error } = await supabase.from('performance_evaluations').insert([{
      employee_id,
      periodo,
      calificacion: Number(calificacion),
      estado: estado || 'Pendiente',
      ultima_revision: ultima_revision || null
    }]).select('id').single();
    if (error) throw error;
    res.status(201).json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Error POST /api/performance-evaluations:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error del servidor' });
  }
});

app.patch('/api/performance-evaluations/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no configurado' });
    const { id } = req.params;
    const { calificacion, estado, ultima_revision } = req.body;
    const updates = {};
    if (calificacion != null) updates.calificacion = Number(calificacion);
    if (estado != null) updates.estado = estado;
    if (ultima_revision != null) updates.ultima_revision = ultima_revision;
    updates.updated_at = new Date().toISOString();
    if (Object.keys(updates).length <= 1) return res.status(400).json({ success: false, message: 'Nada que actualizar' });
    const { error } = await supabase.from('performance_evaluations').update(updates).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error PATCH /api/performance-evaluations:', error);
    res.status(500).json({ success: false, message: error?.message || 'Error del servidor' });
  }
});

// ==================== CATÁLOGOS VENTAS (lectura) ====================

app.get('/api/categories', async (req, res) => {
  if (!supabase) return res.status(503).json([]);
  const { data } = await supabase.from('categories').select('id, name').order('name');
  res.json(data || []);
});

app.get('/api/technologies', async (req, res) => {
  if (!supabase) return res.status(503).json([]);
  const { data } = await supabase.from('technologies').select('id, name').order('name');
  res.json(data || []);
});

app.get('/api/module-templates', async (req, res) => {
  if (!supabase) return res.status(503).json([]);
  const { data } = await supabase.from('module_templates').select('*').order('sort_order');
  res.json((data || []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    precio_estandar: Number(r.precio_estandar),
    sort_order: r.sort_order ?? 0,
  })));
});

app.get('/api/benefit-templates', async (req, res) => {
  if (!supabase) return res.status(503).json([]);
  const { data } = await supabase.from('benefit_templates').select('id, text').order('id');
  res.json((data || []).map((r) => ({ id: r.id, text: r.text })));
});

// ==================== SERVICIOS ====================

app.get('/api/services', async (req, res) => {
  if (!supabase) return res.status(503).json([]);
  const { data } = await supabase.from('services').select('id, code, name, short_description, category_id, created_at, updated_at').order('code');
  res.json(data || []);
});

app.get('/api/services/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json(null);
    const { id } = req.params;
    const { data: service, error: sErr } = await supabase.from('services').select('*').eq('id', id).single();
    if (sErr || !service) return res.status(404).json(null);
    const [
      { data: mods },
      { data: techs },
      { data: benefits },
    ] = await Promise.all([
      supabase.from('service_modules').select('module_template_id, sort_order').eq('service_id', id).order('sort_order'),
      supabase.from('service_technologies').select('technology_id, sort_order').eq('service_id', id).order('sort_order'),
      supabase.from('service_benefits').select('benefit_template_id, sort_order').eq('service_id', id).order('sort_order'),
    ]);
    const moduleIds = (mods || []).map((m) => m.module_template_id);
    const { data: templates } = moduleIds.length
      ? await supabase.from('module_templates').select('*').in('id', moduleIds)
      : { data: [] };
    const byId = (templates || []).reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
    const modules = (mods || []).map((m) => ({
      module_template_id: m.module_template_id,
      sort_order: m.sort_order,
      module: byId[m.module_template_id] ? {
        id: byId[m.module_template_id].id,
        code: byId[m.module_template_id].code,
        name: byId[m.module_template_id].name,
        description: byId[m.module_template_id].description,
        precio_estandar: Number(byId[m.module_template_id].precio_estandar),
        sort_order: byId[m.module_template_id].sort_order,
      } : null,
    }));
    res.json({
      ...service,
      modules,
      technology_ids: (techs || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((t) => t.technology_id),
      benefit_ids: (benefits || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((b) => b.benefit_template_id),
    });
  } catch (e) {
    console.error('GET /api/services/:id', e);
    res.status(500).json(null);
  }
});

app.patch('/api/services/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false });
    const { id } = req.params;
    const { name, short_description, category_id, module_template_ids, technology_ids, benefit_ids } = req.body || {};
    const { error: upErr } = await supabase.from('services').update({
      name: name ?? undefined,
      short_description: short_description ?? undefined,
      category_id: category_id ?? undefined,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (upErr) throw upErr;
    if (Array.isArray(module_template_ids)) {
      await supabase.from('service_modules').delete().eq('service_id', id);
      for (let i = 0; i < module_template_ids.length; i++) {
        await supabase.from('service_modules').insert([{ service_id: id, module_template_id: module_template_ids[i], sort_order: i + 1 }]);
      }
    }
    if (Array.isArray(technology_ids)) {
      await supabase.from('service_technologies').delete().eq('service_id', id);
      for (let i = 0; i < technology_ids.length; i++) {
        await supabase.from('service_technologies').insert([{ service_id: id, technology_id: technology_ids[i], sort_order: i + 1 }]);
      }
    }
    if (Array.isArray(benefit_ids)) {
      await supabase.from('service_benefits').delete().eq('service_id', id);
      for (let i = 0; i < benefit_ids.length; i++) {
        await supabase.from('service_benefits').insert([{ service_id: id, benefit_template_id: benefit_ids[i], sort_order: i + 1 }]);
      }
    }
    res.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/services/:id', e);
    res.status(500).json({ success: false, message: e?.message });
  }
});

// ==================== COTIZACIONES (listado y actualización) ====================

app.get('/api/quotes', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json([]);
    const { serviceId, status, dateFrom, dateTo } = req.query;
    let q = supabase.from('quotes').select(`
      id, user_id, service_id, message, status, total, observations, created_at, updated_at,
      users(full_name, email, phone, company),
      services(code, name)
    `).order('created_at', { ascending: false });
    if (serviceId && serviceId !== 'all') q = q.eq('service_id', serviceId);
    if (status && status !== 'all') q = q.eq('status', status);
    if (dateFrom) q = q.gte('created_at', new Date(dateFrom).toISOString());
    if (dateTo) q = q.lte('created_at', new Date(dateTo + 'T23:59:59.999Z').toISOString());
    const { data: rows, error } = await q;
    if (error) throw error;
    const quoteModulesByQuote = {};
    const { data: qmRows } = await supabase.from('quote_modules').select('id, quote_id, module_template_id, unit_price');
    (qmRows || []).forEach((qm) => {
      if (!quoteModulesByQuote[qm.quote_id]) quoteModulesByQuote[qm.quote_id] = [];
      quoteModulesByQuote[qm.quote_id].push(qm);
    });
    const list = (rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      service_id: r.service_id,
      message: r.message,
      status: r.status,
      total: Number(r.total),
      observations: r.observations,
      created_at: r.created_at,
      updated_at: r.updated_at,
      user_name: r.users?.full_name,
      user_email: r.users?.email,
      user_phone: r.users?.phone,
      user_company: r.users?.company,
      service_name: r.services?.name,
      service_code: r.services?.code,
      modules: (quoteModulesByQuote[r.id] || []).map((qm) => ({ id: qm.id, quote_id: r.id, module_template_id: qm.module_template_id, unit_price: Number(qm.unit_price) })),
    }));
    res.json(list);
  } catch (e) {
    console.error('GET /api/quotes', e);
    res.status(500).json([]);
  }
});

app.get('/api/quotes/counts-by-status', async (req, res) => {
  if (!supabase) return res.json({ pendiente: 0, en_proceso: 0, ganada: 0, perdida: 0 });
  const { data, error } = await supabase.from('quotes').select('status');
  if (error) return res.json({ pendiente: 0, en_proceso: 0, ganada: 0, perdida: 0 });
  const counts = { pendiente: 0, en_proceso: 0, ganada: 0, perdida: 0 };
  (data || []).forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
  res.json(counts);
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json(null);
    const { id } = req.params;
    const { data: quote, error } = await supabase.from('quotes').select(`
      *, users(full_name, email, phone, company), services(code, name)
    `).eq('id', id).single();
    if (error || !quote) return res.status(404).json(null);
    const { data: qm } = await supabase.from('quote_modules').select('id, quote_id, module_template_id, unit_price').eq('quote_id', id);
    res.json({
      id: quote.id,
      user_id: quote.user_id,
      service_id: quote.service_id,
      message: quote.message,
      status: quote.status,
      total: Number(quote.total),
      observations: quote.observations,
      created_at: quote.created_at,
      updated_at: quote.updated_at,
      user_name: quote.users?.full_name,
      user_email: quote.users?.email,
      user_phone: quote.users?.phone,
      user_company: quote.users?.company,
      service_name: quote.services?.name,
      service_code: quote.services?.code,
      modules: (qm || []).map((m) => ({ id: m.id, quote_id: quote.id, module_template_id: m.module_template_id, unit_price: Number(m.unit_price) })),
    });
  } catch (e) {
    console.error('GET /api/quotes/:id', e);
    res.status(500).json(null);
  }
});

app.patch('/api/quotes/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false });
    const { id } = req.params;
    const { status, observations } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (observations !== undefined) updates.observations = observations;
    const { error } = await supabase.from('quotes').update(updates).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/quotes/:id', e);
    res.status(500).json({ success: false });
  }
});

// ==================== EVENTOS SUMMARY (Monitoreo) ====================

app.get('/api/events/summary', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();
    if (!supabase) {
      return res.json({
        byType: { page_view: 0, click_servicio: 0, click_cotizar: 0, cotizacion_confirmada: 0 },
        byService: {},
        cotizacionesConfirmadas: 0,
        totalEvents: 0,
        periodDays: days,
      });
    }
    const { data: rows } = await supabase.from('events').select('event_type, service_id').gte('created_at', sinceIso);
    const byType = { page_view: 0, click_servicio: 0, click_cotizar: 0, cotizacion_confirmada: 0 };
    const byService = {};
    let cotizacionesConfirmadas = 0;
    (rows || []).forEach((r) => {
      if (byType[r.event_type] !== undefined) byType[r.event_type]++;
      if (r.event_type === 'cotizacion_confirmada') cotizacionesConfirmadas++;
      if (r.service_id) byService[r.service_id] = (byService[r.service_id] || 0) + 1;
    });
    res.json({
      byType,
      byService,
      cotizacionesConfirmadas,
      totalEvents: rows?.length || 0,
      periodDays: days,
    });
  } catch (e) {
    console.error('GET /api/events/summary', e);
    res.status(500).json({ byType: {}, byService: {}, cotizacionesConfirmadas: 0, totalEvents: 0, periodDays: 7 });
  }
});

// ==================== ANALÍTICA DESDE events ====================

app.get('/api/analytics/summary', async (req, res) => {
  try {
    const days = req.query.days || '7';
    const daysNum = Math.min(parseInt(days, 10) || 7, 30);
    let totalVisits = 0, registeredUsers = 0, dailyVisits = [], topPages = [], devices = { desktop: 0, mobile: 0, other: 0 };

    if (supabase) {
      const since = new Date();
      since.setDate(since.getDate() - daysNum);
      const sinceIso = since.toISOString();
      const { data: eventRows } = await supabase
        .from('events')
        .select('event_type, page_path, created_at, device_type, session_id')
        .gte('created_at', sinceIso)
        .eq('event_type', 'page_view');
      const rows = (eventRows || []).map((r) => ({
        path: r.page_path || '/',
        timestamp: r.created_at,
        device_type: r.device_type,
        session_id: r.session_id
      }));
      totalVisits = rows.length;
      if (rows.length) {
        rows.forEach((r) => {
          if (r.device_type === 'desktop') devices.desktop++;
          else if (r.device_type === 'mobile') devices.mobile++;
          else devices.other++;
        });
        if (devices.desktop + devices.mobile + devices.other === 0) devices.desktop = totalVisits;
      } else {
        devices.desktop = 0;
      }
      const { count: ru } = await supabase.from('users').select('*', { count: 'exact', head: true });
      registeredUsers = ru || 0;
      const built = buildAnalyticsSummary(rows, daysNum);
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
      devices
    });
  } catch (e) {
    console.error('Analytics summary error:', e);
    res.json({ success: false });
  }
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
      if (err.message && err.message.includes('permission denied')) {
        console.error('   → Ejecuta en Supabase el SQL de: server/supabase-fix-users-permissions.sql');
        console.error('   → Supabase Dashboard → SQL Editor → pegar el contenido del archivo → Run.');
      }
    }
  }
});
