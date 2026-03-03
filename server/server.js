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
    const defaultRole = email.endsWith('@erp.com') ? 'user' : 'customer';
    const { data: newUser, error: createError } = await supabase.from('users').insert([{ name, email, password, role: defaultRole, verified: false }]).select().single();
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

    // --- DOMAIN-BASED ROLE LOGIC ---
    // If the user logging in has a specific domain, they are treated as an employee in the frontend routing,
    // otherwise they are treated as a customer and will stay on the landing page.
    let computedRole = user.role; // Default from DB

    // Solo modificar el rol si NO son administradores ya asignados
    if (computedRole !== 'admin') {
      if (email.endsWith('@erp.com')) {
        computedRole = 'user'; // Mapeamos directo a 'user' para el layout ERP
      } else {
        // Regular customers (gmail, etc)
        computedRole = 'customer';
      }
    }

    await logAudit('LOGIN_SUCCESS_DIRECT', user.id, email, req);
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: computedRole, mustChangePassword: user.must_change_password }
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
    let { name, email, phone, employeeType, department, position, hireDate, status } = req.body;

    // Auto-generar dominio @erp.com para asegurar acceso al sistema interno
    // Si mandaron john@gmail.com -> lo convertimos a john@erp.com
    const originalEmail = email;
    if (!email.endsWith('@erp.com')) {
      const userPart = email.split('@')[0];
      // Agregamos sufijo numérico si es necesario o simplemente lo cambiamos
      email = `${userPart.toLowerCase()}@erp.com`;
    }

    // Primero, verificamos si el usuario ya existe (por ejemplo, si se registró como cliente antes)
    const { data: existingUser } = await supabase.from('users').select('id, role').eq('email', email).single();

    let userId;

    if (existingUser) {
      userId = existingUser.id;
      // Actualizamos su rol a 'user' si era 'customer', pero sin quitarle el 'admin' si lo es.
      if (existingUser.role !== 'admin') {
        await supabase.from('users').update({ role: 'user' }).eq('id', userId);
      }
    } else {
      // Si no existe, creamos el usuario con clave temporal
      const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;
      const { data: newUser, error: userError } = await supabase.from('users').insert([{
        name, email, password: tempPassword, role: 'user', verified: true, must_change_password: true
      }]).select().single();

      if (userError) {
        console.error('Error creando credenciales en DB:', userError.message);
        return res.status(400).json({ success: false, message: 'Error al crear credenciales: ' + userError.message });
      }

      userId = newUser.id;

      // Enviar correo a su correo original (personal) con su nueva credencial ERP
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: originalEmail,
        subject: '🎉 Bienvenido al Sistema ERP',
        html: `<h3>Hola ${name}</h3>
               <p>Te hemos habilitado el acceso como empleado del sistema.</p>
               <p>Para entrar al panel, usa tu <b>correo corporativo</b> recién creado:</p>
               <p><b>Usuario:</b> <code>${email}</code></p>
               <p><b>Clave Temporal:</b> <code>${tempPassword}</code></p>
               <p><small>Nota: Usa estas credenciales en el inicio de sesión para entrar directo al sistema.</small></p>`
      });
    }

    // Insertar el registro en la tabla employees
    const { error: empError } = await supabase.from('employees').insert([{
      user_id: userId, name, email, phone, employee_type: employeeType, department, position, hire_date: hireDate, status
    }]);

    if (empError) {
      console.error('Error insertando en employees:', empError.message);
      return res.status(400).json({ success: false, message: 'Error al registrar el perfil de empleado: ' + empError.message });
    }

    await logAudit('EMPLOYEE_REGISTERED', userId, email, req);

    res.json({ success: true, message: 'Empleado creado correctamente' });
  } catch (error) {
    console.error('Catch error en /api/employees:', error);
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

// ==================== PRODUCTOS Y VENTAS ====================

app.get('/api/products', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, products: [] });
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  res.json({ success: !error, products: data || [] });
});

app.get('/api/sales', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, sales: [] });
  // Hacemos join con productos para obtener el nombre
  const { data, error } = await supabase
    .from('sales')
    .select(`*, products(name, price)`)
    .order('created_at', { ascending: false });
  res.json({ success: !error, sales: data || [] });
});

app.post('/api/sales', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { product_id, customer_email, quantity, total_amount, status } = req.body;
  const { data, error } = await supabase.from('sales').insert([{
    product_id, customer_email, quantity, total_amount, status
  }]).select().single();

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.json({ success: true, sale: data });
});

app.post('/api/checkout', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, message: 'Servicio no disponible' });
  const { cart, customer_email } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'El carrito está vacío' });
  }

  try {
    const salesData = cart.map(item => ({
      product_id: item.product.id,
      customer_email: customer_email || 'invitado@web.com',
      quantity: item.quantity,
      total_amount: item.product.price * item.quantity,
      status: 'Completado'
    }));

    const { data: sales, error } = await supabase.from('sales').insert(salesData).select('*, products(name)');
    if (error) throw error;

    // Calcular total general
    const granTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    // Preparar el correo de confirmación
    const itemsHtml = cart.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #000; text-align: center;">¡Gracias por tu compra en VIISION!</h2>
        <p>Hola, hemos recibido tu pedido y ya lo estamos preparando.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Producto</th>
              <th style="padding: 10px; text-align: center;">Cant.</th>
              <th style="padding: 10px; text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 20px 10px; text-align: right; font-weight: bold;">TOTAL:</td>
              <td style="padding: 20px 10px; text-align: right; font-weight: bold; font-size: 1.2em;">$${granTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top: 30px; border-top: 2px solid #000; padding-top: 20px; text-align: center; color: #666; font-size: 0.8em;">
          <p>VIISION STORE - Próxima Generación de Hardware</p>
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    `;

    // Enviar el correo si hay un email válido
    if (customer_email && customer_email.includes('@')) {
      await transporter.sendMail({
        from: `VIISION STORE <${process.env.GMAIL_USER}>`,
        to: customer_email,
        subject: ' Confirmación de Pedido - VIISION STORE',
        html: emailHtml
      });
    }

    res.json({ success: true, message: 'Orden procesada con éxito', sales });
  } catch (err) {
    console.error('Error en checkout:', err);
    res.status(500).json({ success: false, message: 'Error procesando la compra' });
  }
});

app.put('/api/sales/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { id } = req.params;
  const { status, quantity, total_amount } = req.body;
  const { data, error } = await supabase.from('sales').update({
    status, quantity, total_amount, updated_at: new Date()
  }).eq('id', id).select().single();

  if (error) return res.status(400).json({ success: false, error: error.message });
  res.json({ success: true, sale: data });
});

app.delete('/api/sales/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { id } = req.params;
  const { error } = await supabase.from('sales').delete().eq('id', id);
  res.json({ success: !error });
});

app.get('/api/analytics/product-clicks', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false, count: 0 });
  const { count, error } = await supabase.from('product_clicks').select('*', { count: 'exact', head: true });
  res.json({ success: !error, count: count || 0 });
});

// Endpoint para rastrear clics en productos desde el Landing Page
app.post('/api/analytics/product-click', async (req, res) => {
  if (!supabase) return res.status(503).json({ success: false });
  const { product_id, user_email } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  const user_agent = req.headers['user-agent'];

  const { error } = await supabase.from('product_clicks').insert([{
    product_id, ip, user_agent, user_email
  }]);
  res.json({ success: !error });
});


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

// GET /api/products - Obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false }); // Usamos id como fallback si no hay created_at
    if (error) throw error;
    res.json({ success: true, products: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Crear producto
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body;
    const { data, error } = await supabase.from('products').insert([{ name, description, price, image_url, category }]).select().single();
    if (error) throw error;
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Editar producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category } = req.body;
    const { data, error } = await supabase.from('products').update({ name, description, price, image_url, category }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, product: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ANALYTICS: Ventas por Fecha =====
app.get('/api/analytics/sales-by-date', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('created_at, total_amount')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Agrupar por fecha
    const grouped = data.reduce((acc, sale) => {
      const date = new Date(sale.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + Number(sale.total_amount);
      return acc;
    }, {});

    const chartData = Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ANALYTICS: Top Productos =====
app.get('/api/analytics/top-products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('quantity, products(name)');

    if (error) throw error;

    const grouped = data.reduce((acc, item) => {
      const name = item.products?.name || 'Desconocido';
      acc[name] = (acc[name] || 0) + item.quantity;
      return acc;
    }, {});

    const chartData = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ANALYTICS: Auditoría Detallada de Tráfico =====
app.get('/api/analytics/detailed-traffic', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_clicks')
      .select(`
        id,
        clicked_at,
        ip,
        user_email,
        products (name)
      `)
      .order('clicked_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, traffic: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    }
  }
});
