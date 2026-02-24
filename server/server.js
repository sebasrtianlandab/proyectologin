import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const USERS_FILE = path.join(__dirname, '../data/users.json');
const OTP_FILE = path.join(__dirname, '../data/otp.json');
const AUDIT_FILE = path.join(__dirname, '../data/audit.json');

// Helper: Registrar evento de auditoría
async function logAudit(action, userId, email, req) {
  try {
    console.log(`📝 Registrando auditoría: ${action} para ${email}`);
    const audits = await readJSON(AUDIT_FILE);
    const newEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      userId: userId || 'N/A',
      email: email || 'N/A',
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    audits.push(newEntry);
    await writeJSON(AUDIT_FILE, audits);
  } catch (error) {
    console.error('Error al guardar auditoría:', error);
  }
}

// Helper: Read JSON file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper: Write JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Configurar Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // rlandabazan@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación
  },
});

// ==================== RUTAS ====================

// POST /api/register - Registro de usuario
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    const users = await readJSON(USERS_FILE);
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Crear usuario
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // En producción, hashear
      verified: false,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

    await logAudit('USER_REGISTERED', newUser.id, email, req);

    // Generar OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      userId: newUser.id,
      email,
      code: otpCode,
      attempts: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    const otps = await readJSON(OTP_FILE);
    const filtered = otps.filter(o => o.email !== email);
    filtered.push(otpData);
    await writeJSON(OTP_FILE, filtered);

    // Enviar email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de Verificación OTP',
      html: `
        <h2>¡Bienvenido!</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="font-size: 32px; color: #4CAF50;">${otpCode}</h1>
        <p>Este código expira en 10 minutos.</p>
        <p>Tienes 3 intentos para ingresar el código correcto.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Usuario registrado. Verifica tu email para obtener el código OTP.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Error en /api/register:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/login - Iniciar sesión
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      await logAudit('LOGIN_FAILED', null, email, req);
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    await logAudit('LOGIN_SUCCESS_DIRECT', user.id, email, req);

    /* Lógica de OTP (Mantenida pero desactivada para acceso directo ERP)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      userId: user.id,
      email,
      code: otpCode,
      attempts: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    const otps = await readJSON(OTP_FILE);
    const filtered = otps.filter(o => o.email !== email);
    filtered.push(otpData);
    await writeJSON(OTP_FILE, filtered);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de Verificación OTP - Login',
      html: `...`,
    });
    */

    return res.json({
      success: true,
      message: user.mustChangePassword
        ? 'Credenciales correctas. Debes cambiar tu contraseña temporal.'
        : 'Inicio de sesión exitoso',
      requiresOTP: false,
      mustChangePassword: user.mustChangePassword || false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  } catch (error) {
    console.error('Error en /api/login:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/verify-otp - Verificar OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email y código son requeridos' });
    }

    const otps = await readJSON(OTP_FILE);
    const otpData = otps.find(o => o.email === email);

    if (!otpData) {
      return res.status(400).json({ success: false, message: 'No hay código OTP pendiente' });
    }

    // Verificar expiración
    if (new Date() > new Date(otpData.expiresAt)) {
      const filtered = otps.filter(o => o.email !== email);
      await writeJSON(OTP_FILE, filtered);
      return res.status(400).json({ success: false, message: 'El código OTP ha expirado' });
    }

    // Incrementar intentos
    otpData.attempts += 1;

    // Verificar código
    if (code !== otpData.code) {
      const attemptsLeft = otpData.maxAttempts - otpData.attempts;

      if (attemptsLeft === 0) {
        const filtered = otps.filter(o => o.email !== email);
        await writeJSON(OTP_FILE, filtered);
        return res.status(400).json({
          success: false,
          message: 'Código incorrecto. Límite de intentos excedido.',
        });
      }

      await writeJSON(OTP_FILE, otps);
      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Te quedan ${attemptsLeft} intentos.`,
        attemptsLeft,
      });
    }

    // OTP correcto - Marcar usuario como verificado
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === otpData.userId);

    if (user) {
      user.verified = true;
      await writeJSON(USERS_FILE, users);
    }

    // Limpiar OTP
    const filtered = otps.filter(o => o.email !== email);
    await writeJSON(OTP_FILE, filtered);

    await logAudit('OTP_VERIFIED_SUCCESS', user.id, email, req);

    res.json({
      success: true,
      message: 'Verificación exitosa',
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' },
    });
  } catch (error) {
    console.error('Error en /api/verify-otp:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /api/user/:email - Obtener datos del usuario
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error en /api/user:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /api/audit - Obtener registros de auditoría
app.get('/api/audit', async (req, res) => {
  try {
    const audits = await readJSON(AUDIT_FILE);
    res.json({ success: true, audits: [...audits].reverse().slice(0, 100) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener auditoría' });
  }
});

// GET /api/users/count - Total de usuarios registrados
app.get('/api/users/count', async (req, res) => {
  try {
    const users = await readJSON(USERS_FILE);
    res.json({ success: true, count: users.length });
  } catch {
    res.json({ success: true, count: 0 });
  }
});

// ==================== EMPLEADOS ====================

const EMPLOYEES_FILE = path.join(__dirname, '../data/employees.json');

// GET /api/employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await readJSON(EMPLOYEES_FILE);
    res.json({ success: true, employees });
  } catch {
    res.json({ success: true, employees: [] });
  }
});

// POST /api/employees - Alta de nuevo empleado
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, employeeType, department, position, hireDate, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nombre y email son requeridos' });
    }

    const employees = await readJSON(EMPLOYEES_FILE);
    const existing = employees.find(e => e.email === email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un empleado con ese email' });
    }

    // Generar contraseña temporal
    const tempPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`;

    const newEmployee = {
      id: `emp_${Date.now()}`,
      name, email, phone,
      employeeType: employeeType || 'Instructor',
      department: department || 'General',
      position: position || '',
      hireDate: hireDate || null,
      status: status || 'Activo',
      verified: false,
      mustChangePassword: true,
      tempPassword,
      createdAt: new Date().toISOString(),
    };

    employees.push(newEmployee);
    await writeJSON(EMPLOYEES_FILE, employees);

    // También crear usuario en el sistema para que pueda iniciar sesión
    const users = await readJSON(USERS_FILE);
    const userExists = users.find(u => u.email === email);
    if (!userExists) {
      const newUser = {
        id: `user_${Date.now()}`,
        name, email,
        password: tempPassword,
        role: 'user',
        verified: true,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await writeJSON(USERS_FILE, users);
    }

    await logAudit('EMPLOYEE_REGISTERED', newEmployee.id, email, req);

    // Enviar email con clave temporal
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: '🎉 Bienvenido al Sistema - Credenciales de Acceso',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3b82f6, #4f46e5); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">¡Bienvenido, ${name}!</h1>
              <p style="color: #bfdbfe; margin: 8px 0 0;">Tu cuenta ha sido creada exitosamente.</p>
            </div>
            <div style="padding: 32px;">
              <p style="color: #374151;">Has sido registrado como <strong>${employeeType}</strong> en el sistema ERP.</p>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #0369a1; font-weight: bold; text-transform: uppercase;">TUS CREDENCIALES TEMPORALES</p>
                <p style="margin: 4px 0; font-size: 14px; color: #1e40af;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0; font-size: 14px; color: #1e40af;"><strong>Contraseña temporal:</strong> <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
              </div>
              <p style="color: #dc2626; font-size: 13px;">⚠️ Por razones de seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.</p>
              <a href="http://localhost:5173/login" style="display: block; text-align: center; background: #3b82f6; color: white; padding: 12px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold;">Acceder al Sistema →</a>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('⚠️ No se pudo enviar el correo:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Empleado registrado exitosamente. Se ha enviado la clave temporal al correo.',
      employee: newEmployee,
    });
  } catch (error) {
    console.error('Error en /api/employees POST:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// DELETE /api/employees/:id - Eliminar empleado
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employees = await readJSON(EMPLOYEES_FILE);
    const employee = employees.find(e => e.id === id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    const filteredEmployees = employees.filter(e => e.id !== id);
    await writeJSON(EMPLOYEES_FILE, filteredEmployees);

    // También eliminar su usuario asociado
    const users = await readJSON(USERS_FILE);
    const filteredUsers = users.filter(u => u.email !== employee.email);
    await writeJSON(USERS_FILE, filteredUsers);

    await logAudit('EMPLOYEE_DELETED', id, employee.email, req);

    res.json({ success: true, message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error en /api/employees DELETE:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// ==================== CAMBIO DE CONTRASEÑA ====================

// POST /api/change-password
app.post('/api/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email y nueva contraseña requeridos' });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await writeJSON(USERS_FILE, users);

    // También actualizar en employees si existe
    const employees = await readJSON(EMPLOYEES_FILE);
    const emp = employees.find(e => e.email === email);
    if (emp) {
      emp.mustChangePassword = false;
      await writeJSON(EMPLOYEES_FILE, employees);
    }

    await logAudit('PASSWORD_CHANGED', user.id, email, req);

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en /api/change-password:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// ==================== ANALÍTICA WEB ====================

const ANALYTICS_FILE = path.join(__dirname, '../data/analytics.json');

// POST /api/analytics/track - Registrar visita
app.post('/api/analytics/track', async (req, res) => {
  try {
    const data = await readJSON(ANALYTICS_FILE).then(d => Array.isArray(d) ? d : []);
    const entry = {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      path: req.headers.referer || '/',
    };
    data.push(entry);
    await writeJSON(ANALYTICS_FILE, data);
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
});

// GET /api/analytics/summary - Resumen de analítica
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7');
    const raw = await readJSON(ANALYTICS_FILE).then(d => Array.isArray(d) ? d : []);
    const users = await readJSON(USERS_FILE);

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filtered = raw.filter(e => new Date(e.timestamp) >= cutoff);

    const uniqueIPs = new Set(filtered.map(e => e.ip));
    const uniqueSessions = uniqueIPs.size;

    // Pages per session
    const pagesPerSession = uniqueSessions > 0 ? (filtered.length / uniqueSessions).toFixed(1) : '0';

    // Daily breakdown
    const dailyMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      dailyMap[key] = { date: key, visitas: 0, sesiones: 0 };
    }
    filtered.forEach(e => {
      const key = new Date(e.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) dailyMap[key].visitas += 1;
    });
    Object.keys(dailyMap).forEach(key => {
      dailyMap[key].sesiones = Math.max(1, Math.floor(dailyMap[key].visitas * 0.7));
    });

    // Top pages
    const pageCounts = {};
    filtered.forEach(e => {
      const p = e.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Devices (from user-agent)
    let desktop = 0, mobile = 0, other = 0;
    filtered.forEach(e => {
      const ua = (e.userAgent || '').toLowerCase();
      if (/mobile|android|iphone|ipad/.test(ua)) mobile++;
      else if (/windows|mac|linux/.test(ua)) desktop++;
      else other++;
    });

    res.json({
      totalVisits: filtered.length,
      uniqueSessions,
      registeredUsers: users.length,
      pagesPerSession,
      dailyVisits: Object.values(dailyMap),
      topPages,
      devices: { desktop, mobile, other },
    });
  } catch (error) {
    console.error('Error en /api/analytics/summary:', error);
    res.json({ totalVisits: 0, uniqueSessions: 0, registeredUsers: 0, pagesPerSession: '0', dailyVisits: [], topPages: [], devices: { desktop: 0, mobile: 0, other: 0 } });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

