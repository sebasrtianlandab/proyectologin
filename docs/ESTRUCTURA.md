# 📁 Estructura del Proyecto - Sistema de Autenticación OTP

## 🌳 Árbol de Directorios

```
Login-con-verificación-OTP/
│
├── 📂 docs/                          # Documentación del proyecto
│   ├── ESTRUCTURA.md                 # Este archivo - Estructura del proyecto
│   ├── FASES_DESARROLLO.md          # Documentación de fases de desarrollo
│   ├── INSTRUCCIONES.md             # Guía de instalación y ejecución
│   └── REQUERIMIENTOS.md            # Requerimientos originales del proyecto
│
├── 📂 data/                          # Persistencia de datos (JSON)
│   ├── users.json                    # Base de datos de usuarios
│   ├── otp.json                      # Códigos OTP temporales
│   └── audit.json                    # Auditoría (pospuesto)
│
├── 📂 server/                        # Backend Node.js + Express
│   ├── server.js                     # Servidor API principal
│   ├── package.json                  # Dependencias del servidor
│   ├── .env                          # Variables de entorno (NO en Git)
│   └── node_modules/                 # Dependencias instaladas
│
├── 📂 src/                           # Frontend React + Vite
│   │
│   ├── 📂 app/                       # Componentes de la aplicación
│   │   ├── 📂 components/
│   │   │   ├── 📂 auth/             # Componentes de autenticación
│   │   │   │   ├── RegisterView.tsx     # Vista de registro
│   │   │   │   ├── LoginView.tsx        # Vista de login
│   │   │   │   ├── OTPVerificationView.tsx  # Vista verificación OTP
│   │   │   │   ├── DashboardView.tsx    # Dashboard protegido
│   │   │   │   └── ProtectedRoute.tsx   # Guardia de rutas
│   │   │   │
│   │   │   └── 📂 ui/               # Componentes UI reutilizables
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       └── input-otp.tsx
│   │   │
│   │   ├── routes.tsx                # Definición de rutas (React Router)
│   │   └── App.tsx                   # Componente raíz
│   │
│   ├── 📂 controllers/               # Lógica de negocio (MVC)
│   │   └── AuthController.ts         # Controlador de autenticación
│   │
│   ├── 📂 models/                    # Modelos de datos (MVC)
│   │   ├── User.ts                   # Interfaces de Usuario, OTP, Session
│   │   └── AuthService.ts            # Servicio de autenticación (API calls)
│   │
│   ├── 📂 styles/                    # Estilos globales
│   │   └── index.css                 # CSS principal (Tailwind)
│   │
│   └── main.tsx                      # Punto de entrada React
│
├── 📂 public/                        # Archivos estáticos públicos
│
├── 📄 .gitignore                     # Archivos ignorados por Git
├── 📄 package.json                   # Dependencias frontend
├── 📄 vite.config.ts                 # Configuración Vite
├── 📄 index.html                     # HTML principal
├── 📄 reset-db.sh                    # Script limpieza BD (Bash)
├── 📄 reset-db.ps1                   # Script limpieza BD (PowerShell)
└── 📄 README.md                      # Descripción del proyecto

```

---

## 📋 Descripción de Directorios Principales

### 🗂️ `/docs`
Contiene toda la documentación del proyecto:
- **Estructura del proyecto** (árbol de directorios)
- **Fases de desarrollo** (proceso de creación)
- **Instrucciones de instalación y ejecución**
- **Requerimientos del proyecto**

### 🗄️ `/data`
Almacena la persistencia de datos en formato JSON:
- `users.json`: Usuarios registrados (id, nombre, email, contraseña, verificado, fecha)
- `otp.json`: Códigos OTP temporales (código, intentos, expiración)
- `audit.json`: Logs de auditoría (funcionalidad pospuesta)

### ⚙️ `/server`
Backend Node.js con Express:
- **API RESTful** para autenticación
- **Nodemailer** para envío de emails (Gmail SMTP)
- **Gestión de OTPs** y validación
- **Puerto**: 3001

### 🎨 `/src`
Frontend React con Vite:
- **Arquitectura MVC-like**: Separación en Models, Views, Controllers
- **React Router** para navegación
- **Componentes UI** modernos con animaciones
- **Tailwind CSS** para estilos
- **Puerto**: 5173

---

## 🔑 Componentes Clave

### Backend (`/server/server.js`)
Rutas API:
- `POST /api/register` - Registro de usuario + envío OTP
- `POST /api/login` - Validación credenciales + envío OTP (2FA)
- `POST /api/verify-otp` - Verificación código OTP
- `GET /api/user/:email` - Obtener datos de usuario

### Frontend - Arquitectura MVC

**Modelos** (`/src/models/`):
- `User.ts` - Interfaces: User, OTPData, Session
- `AuthService.ts` - Comunicación con API backend

**Controladores** (`/src/controllers/`):
- `AuthController.ts` - Lógica de registro, login, verificación

**Vistas** (`/src/app/components/auth/`):
- `RegisterView.tsx` - Formulario de registro
- `LoginView.tsx` - Formulario de inicio de sesión
- `OTPVerificationView.tsx` - Validación código OTP
- `DashboardView.tsx` - Panel protegido
- `ProtectedRoute.tsx` - Protección de rutas

---

## 🔧 Archivos de Configuración

| Archivo | Descripción |
|---------|-------------|
| `package.json` | Dependencias React, Vite, UI libs + script reset-db |
| `server/package.json` | Dependencias Express, Nodemailer, CORS |
| `vite.config.ts` | Configuración del bundler Vite |
| `server/.env` | Variables de entorno (Gmail credentials) |
| `.gitignore` | Excluye node_modules, .env, dist |
| `reset-db.*` | Scripts para limpiar base de datos (sh/ps1) |

### Scripts Útiles

**Limpieza de base de datos** (3 opciones):
```bash
# Opción 1: Script npm (multiplataforma)
npm run reset-db

# Opción 2: Bash (Git Bash / Linux / Mac)
./reset-db.sh

# Opción 3: PowerShell (Windows)
.\reset-db.ps1
```

---

## 📦 Dependencias Principales

### Frontend
- **React** - Framework UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Tailwind CSS** - Estilos utility-first
- **Motion** - Animaciones
- **Sonner** - Notificaciones toast
- **Lucide React** - Iconos

### Backend
- **Express** - Framework web Node.js
- **Nodemailer** - Envío de emails
- **CORS** - Manejo de CORS
- **dotenv** - Variables de entorno

---

## 🚀 Flujo de Datos

```
Usuario → Frontend (React) → API Backend (Express) → Data (JSON)
                                      ↓
                              Gmail SMTP (Nodemailer)
                                      ↓
                              Email Usuario (OTP)
```

---

## 🔐 Seguridad

- **Autenticación 2FA**: OTP obligatorio en login y registro
- **Expiración de códigos**: 10 minutos
- **Límite de intentos**: 3 máximo
- **Variables sensibles**: Almacenadas en `.env` (excluido de Git)
- **Códigos únicos**: Generados con `Math.random()`

---

## 📝 Notas Importantes

1. **Contraseñas**: Actualmente NO están hasheadas (solo desarrollo)
2. **Base de datos**: JSON files simulan BD (migrar a PostgreSQL/MongoDB para producción)
3. **Gmail App Password**: Necesario para envío de correos
4. **Node.js**: Se requiere versión 14+ para ejecutar el servidor

---

## 🎯 Estado Actual

✅ **Implementado:**
- Sistema completo de registro
- Login con autenticación 2FA
- Verificación OTP por email
- Dashboard protegido
- Interfaz profesional sin mensajes de desarrollo

⏸️ **Pospuesto:**
- Módulo de auditoría completo
