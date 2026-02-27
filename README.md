# VIISION ERP · Panel de Gestión Empresarial

Sistema ERP completo desarrollado para **VIISION**, empresa tecnológica peruana. Incluye autenticación segura con OTP, gestión de Recursos Humanos, auditoría de eventos, analítica web y múltiples módulos empresariales.

![Versión](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![Supabase](https://img.shields.io/badge/database-Supabase%20PostgreSQL-3ECF8E)

---

## ✨ Características Principales

- 🔒 **Autenticación 2FA con OTP** — código de 6 dígitos por email (Gmail SMTP) en registro y login
- 🗄️ **Base de datos Supabase** (PostgreSQL) — persistencia real y escalable
- 👥 **Módulo RRHH** — registro, gestión y baja de empleados con clave temporal automática por correo
- 🔑 **Flujo "primer acceso"** — cambio de contraseña obligatorio para empleados nuevos
- 🛡️ **Auditoría de seguridad** — registro de todos los eventos críticos (login, registros, OTP, cambios)
- 📊 **Analítica Web** — tráfico, sesiones únicas, páginas más visitadas con gráficos Recharts
- 🎯 **Control de roles** — rutas protegidas por rol (`admin` / `user`)
- 🎨 **Identidad VIISION** — paleta de marca, tipografía Inter, modo oscuro premium
- 📱 **Responsive design** — compatible con desktop, tablet y móvil

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm
- Proyecto en **Supabase** (PostgreSQL) con las tablas creadas (ver [docs/ANALISIS_BASE_DE_DATOS.md](docs/ANALISIS_BASE_DE_DATOS.md))
- Cuenta de Gmail con App Password (para envío de OTP y claves temporales)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sebasrtianlandab/proyectologin.git
   cd proyectologin
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configurar variables de entorno**

   Crear archivo `.env` en la **raíz del proyecto** (para el frontend/Vite):
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

   Crear archivo `server/.env` (para el backend):
   ```env
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   GMAIL_USER=tu_email@gmail.com
   GMAIL_APP_PASSWORD=tu_app_password_16_caracteres
   ```

   > 💡 Ver [docs/INSTRUCCIONES.md](docs/INSTRUCCIONES.md) para guía detallada paso a paso.

5. **Ejecutar el proyecto**

   **Terminal 1 — Backend:**
   ```bash
   npm run server
   ```

   **Terminal 2 — Frontend:**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

   Login de administrador por defecto:
   - **Correo:** `admin@erp.com`
   - **Contraseña:** `admin123`

---

## 📁 Estructura del Proyecto

```
proyectologin/
├── docs/                    # Documentación completa
├── data/                    # (legacy) Archivos JSON de fallback
├── server/                  # Backend (Node.js + Express + Supabase)
│   └── server.js            # API principal (~311 líneas)
└── src/                     # Frontend (React + Vite + TypeScript)
    ├── app/
    │   ├── components/
    │   │   ├── auth/        # Login, OTP, Dashboard, Auditoría, Cambio de clave
    │   │   ├── erp/         # RRHH, Analítica, Ventas, DevOps, Gestión Interna
    │   │   └── ui/          # Componentes de UI reutilizables (shadcn/ui + custom)
    │   └── routes.tsx       # Definición de rutas (React Router)
    ├── controllers/         # AuthController.ts
    ├── models/              # User.ts, AuthService.ts
    └── styles/              # theme.css, index.css
```

Ver estructura detallada en [docs/ESTRUCTURA.md](docs/ESTRUCTURA.md)

---

## 🔧 Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.3.1 | Framework UI |
| **Vite** | 6.x | Build tool |
| **TypeScript** | — | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utility-first |
| **Motion** | 12.x | Animaciones |
| **React Router** | 7.x | Navegación SPA |
| **Recharts** | 2.x | Gráficos analítica |
| **Sonner** | 2.x | Notificaciones toast |
| **Radix UI / shadcn** | — | Componentes accesibles |
| **MUI** | 7.x | Componentes adicionales |

### Backend
| Tecnología | Uso |
|-----------|-----|
| **Node.js + Express** | API RESTful (puerto 3001) |
| **Supabase** (`@supabase/supabase-js`) | Base de datos PostgreSQL |
| **Nodemailer** | Envío de emails (OTP + claves temporales) |
| **dotenv** | Variables de entorno |

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [README.md](README.md) | Este archivo — inicio rápido |
| [ESTRUCTURA.md](docs/ESTRUCTURA.md) | Árbol de directorios y arquitectura |
| [FASES_DESARROLLO.md](docs/FASES_DESARROLLO.md) | Proceso de desarrollo completo (8 fases) |
| [INSTRUCCIONES.md](docs/INSTRUCCIONES.md) | Guía de instalación y ejecución |
| [REQUERIMIENTOS.md](docs/REQUERIMIENTOS.md) | Requerimientos originales del proyecto |
| [RESUMEN.md](docs/RESUMEN.md) | Resumen ejecutivo del estado actual |
| [ANALISIS_BASE_DE_DATOS.md](docs/ANALISIS_BASE_DE_DATOS.md) | Esquema SQL Supabase y modelo relacional |
| [GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md](docs/GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md) | Guía de evaluación del proyecto |
| [DOC_IDENTIDAD_VIISION.md](docs/DOC_IDENTIDAD_VIISION.md) | Identidad y visión de la empresa |
| [ESTILOS_MARCA_VIISION.md](docs/ESTILOS_MARCA_VIISION.md) | Manual de estilos y paleta de marca |

---

## 🗺️ Rutas del Sistema

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` o `/login` | LoginView | Público |
| `/verify-otp` | OTPVerificationView | Público |
| `/change-password` | ForceChangePassword | Público (empleados) |
| `/dashboard` | MainDashboard | Autenticado |
| `/crm/rrhh` | HRMView | Admin |
| `/crm/rrhh/desempeno` | HRMDesempenoView | Admin |
| `/crm/rrhh/objetivos` | HRMObjetivosView | Admin |
| `/crm/rrhh/auditoria` | HRMAuditoriaView | Admin |
| `/analytics` | AnalyticsView | Admin |
| `/audit` | AuditView | Admin |
| `/gestion-interna` | InternalManagementView | Admin |
| `/ventas` | SalesView | Autenticado |
| `/devops` | DevOpsView | Autenticado |

---

## 🔑 Flujos Principales

### Registro de usuario
1. Formulario con nombre, email y contraseña
2. Backend crea usuario en Supabase, genera OTP
3. OTP enviado por Gmail al usuario
4. Usuario ingresa OTP → cuenta verificada → Dashboard

### Login (2FA)
1. Ingresa email y contraseña
2. Contraseña validada contra Supabase
3. Acceso directo al Dashboard (sin OTP en login actualmente)

### Alta de empleado (Admin → RRHH)
1. Admin ingresa datos del empleado
2. Backend crea usuario en Supabase con **clave temporal** (`TempXXXX!`)
3. Clave temporal enviada al correo del empleado
4. Empleado inicia sesión → sistema redirige a `/change-password`
5. Empleado establece contraseña definitiva → acceso normal

### Módulo de Auditoría
- Registra automáticamente: `USER_REGISTERED`, `LOGIN_FAILED`, `LOGIN_SUCCESS_DIRECT`, `OTP_VERIFIED_SUCCESS`, `EMPLOYEE_REGISTERED`
- Captura IP, User-Agent y timestamp
- Visible en `/audit` (admin)

---

## 🛠️ Scripts Disponibles

```bash
# Frontend
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build

# Backend (desde la raíz)
npm run server       # Inicia el backend en http://localhost:3001

# Utilidad (legacy, base de datos JSON)
./reset-db.sh        # Limpiar archivos JSON (Bash)
.\\reset-db.ps1      # Limpiar archivos JSON (PowerShell)
```

---

## 🔐 Seguridad

- ✅ Autenticación de dos factores (2FA) en registro
- ✅ Códigos OTP de 6 dígitos con expiración (10 min) y límite de intentos (3)
- ✅ Control de roles (`admin` / `user`) en rutas protegidas
- ✅ Claves temporales con cambio obligatorio en primer acceso
- ✅ Variables sensibles exclusivamente en `.env` (excluido de Git)
- ✅ Auditoría de todos los eventos críticos de seguridad

> ⚠️ **Nota**: Las contraseñas están en texto plano (apropiado para desarrollo académico). En producción implementar **bcrypt** + **JWT**.

---

## 👥 Equipo

| Integrante | Rol | Contacto |
|-----------|-----|---------|
| **Sebastián Landa** | Líder / Backend | rlandabazan@gmail.com |
| **Eduardo Vega** | Frontend | vegasoft09@gmail.com |
| **Ignacio Hernández** | Frontend / QA | hernandz.j2004@gmail.com |

**Empresa**: VIISION — *Transformamos procesos con tecnología accesible.*  
**Repositorio**: https://github.com/sebasrtianlandab/proyectologin  
**Período**: Febrero 2026

---

<p align="center">
  Desarrollado con ❤️ por el equipo <strong>VIISION</strong>
</p>