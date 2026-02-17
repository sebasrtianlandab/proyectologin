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
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

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
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!user.verified) {
      // Generar OTP
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

      // Enviar email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Código de Verificación OTP',
        html: `
          <h2>Código de Verificación</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="font-size: 32px; color: #4CAF50;">${otpCode}</h1>
          <p>Este código expira en 10 minutos.</p>
        `,
      });

      return res.json({
        success: true,
        message: 'Usuario no verificado. Se ha enviado un código OTP a tu email.',
        requiresOTP: true,
        userId: user.id,
      });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      requiresOTP: false,
      user: { id: user.id, name: user.name, email: user.email },
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

    res.json({
      success: true,
      message: 'Verificación exitosa',
      user: { id: user.id, name: user.name, email: user.email },
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
