# 📁 Estructura del Proyecto — VIISION ERP

## 🌳 Árbol de Directorios

```
proyectologin/
│
├── 📂 docs/                               # Documentación del proyecto (10 docs)
│   ├── ANALISIS_BASE_DE_DATOS.md          # Esquema SQL y modelo relacional Supabase
│   ├── DOC_IDENTIDAD_VIISION.md           # Identidad y visión de VIISION
│   ├── ESTILOS_MARCA_VIISION.md           # Manual de estilos y paleta de marca
│   ├── ESTRUCTURA.md                      # Este archivo — árbol y arquitectura
│   ├── FASES_DESARROLLO.md                # Proceso de desarrollo (8 fases)
│   ├── GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md  # Guía de evaluación
│   ├── INSTRUCCIONES.md                   # Instalación y ejecución paso a paso
│   ├── LIMPIEZA.md                        # Historial de limpieza y organización
│   ├── REQUERIMIENTOS.md                  # Requerimientos originales
│   └── RESUMEN.md                         # Resumen ejecutivo del proyecto
│
├── 📂 data/                               # (Legacy) JSON de fallback
│   ├── users.json                         # Usuarios (no activo con Supabase)
│   ├── otp.json                           # OTPs temporales (no activo con Supabase)
│   └── audit.json                         # Auditoría (no activo con Supabase)
│
├── 📂 server/                             # Backend Node.js + Express
│   ├── server.js                          # Servidor API principal (~311 líneas)
│   ├── package.json                       # Dependencias del servidor
│   ├── .env                               # Variables de entorno (NO en Git)
│   └── node_modules/                      # Dependencias instaladas
│
├── 📂 src/                                # Frontend React + Vite + TypeScript
│   │
│   ├── 📂 app/                            # Aplicación principal
│   │   │
│   │   ├── 📂 components/
│   │   │   │
│   │   │   ├── 📂 auth/                   # Módulo de autenticación
│   │   │   │   ├── LoginView.tsx              # Pantalla de inicio de sesión
│   │   │   │   ├── RegisterView.tsx            # Pantalla de registro
│   │   │   │   ├── OTPVerificationView.tsx     # Verificación de código OTP
│   │   │   │   ├── ForceChangePassword.tsx     # Cambio obligatorio de contraseña
│   │   │   │   ├── DashboardView.tsx           # Dashboard de usuario (deprecated/legacy)
│   │   │   │   ├── AuditView.tsx               # Módulo de auditoría de seguridad
│   │   │   │   └── ProtectedRoute.tsx          # Guardia de rutas por rol
│   │   │   │
│   │   │   ├── 📂 erp/                    # Módulos ERP del sistema
│   │   │   │   ├── MainDashboard.tsx          # Dashboard principal del ERP
│   │   │   │   ├── HRMView.tsx                # Recursos Humanos (CRUD empleados)
│   │   │   │   ├── HRMTabs.tsx                # Tabs de navegación RRHH
│   │   │   │   ├── HRMDesempenoView.tsx        # Subvista: Desempeño
│   │   │   │   ├── HRMObjetivosView.tsx        # Subvista: Objetivos
│   │   │   │   ├── HRMAuditoriaView.tsx        # Subvista: Auditoría RRHH
│   │   │   │   ├── AnalyticsView.tsx           # Analítica web con gráficos
│   │   │   │   ├── InternalManagementView.tsx  # Gestión Interna
│   │   │   │   ├── SalesView.tsx               # Módulo de Ventas
│   │   │   │   └── DevOpsView.tsx              # Módulo DevOps
│   │   │   │
│   │   │   └── 📂 ui/                     # Componentes UI reutilizables (~50)
│   │   │       ├── button.tsx, card.tsx, input.tsx, label.tsx
│   │   │       ├── input-otp.tsx, dialog.tsx, table.tsx
│   │   │       ├── ShinyText.tsx + ShinyText.css  # Texto animado VIISION
│   │   │       ├── sidebar.tsx               # Sidebar del ERP
│   │   │       └── ... (shadcn/ui + Radix UI)
│   │   │
│   │   ├── routes.tsx                     # Definición de 13 rutas (React Router)
│   │   └── App.tsx                        # Componente raíz
│   │
│   ├── 📂 controllers/                    # Lógica de negocio (MVC)
│   │   └── AuthController.ts              # Controlador de autenticación
│   │
│   ├── 📂 models/                         # Modelos de datos (MVC)
│   │   ├── User.ts                        # Interfaces: User, OTPData, Session
│   │   └── AuthService.ts                 # Servicio: llamadas a API backend
│   │
│   ├── 📂 styles/                         # Estilos globales
│   │   ├── theme.css                      # Paleta VIISION, tokens semánticos, modo oscuro
│   │   └── index.css                      # CSS de entrada (importa theme.css)
│   │
│   ├── main.tsx                           # Punto de entrada React
│   └── vite-env.d.ts                      # Tipos Vite
│
├── 📂 public/                             # Assets estáticos públicos
│   └── logo/
│       └── viision-logo.png               # Logo oficial VIISION
│
├── 📄 .env                                # Variables para frontend (VITE_SUPABASE_*)
├── 📄 .gitignore                          # Excluye node_modules, .env, dist
├── 📄 index.html                          # HTML principal (título, fuentes, favicon)
├── 📄 package.json                        # Dependencias frontend + scripts
├── 📄 vite.config.ts                      # Configuración Vite
├── 📄 tsconfig.json                       # Config TypeScript
├── 📄 postcss.config.mjs                  # PostCSS (Tailwind)
├── 📄 reset-db.sh                         # Script limpieza JSON (Bash)
├── 📄 reset-db.ps1                        # Script limpieza JSON (PowerShell)
└── 📄 README.md                           # Descripción del proyecto
```

---

## 📋 Descripción de Directorios y Módulos

### 🗂️ `/docs`
10 documentos de soporte que cubren todos los aspectos del proyecto: arquitectura, desarrollo, estilos, base de datos, guía de pruebas e identidad de marca.

### 📂 `/server`
Backend Node.js + Express con las siguientes responsabilidades:
- **Autenticación**: registro, login, verificación OTP, cambio de contraseña
- **RRHH**: CRUD de empleados con generación de claves temporales y envío por email
- **Auditoría**: registra eventos de seguridad en Supabase
- **Analítica**: rastreo de visitas y resumen de tráfico
- **Integración Supabase**: todas las operaciones de base de datos

### 🎨 `/src`
Frontend React con arquitectura **MVC-like**:

#### Módulo `auth/` — Autenticación
| Componente | Función |
|-----------|---------|
| `LoginView.tsx` | Formulario email + contraseña |
| `RegisterView.tsx` | Formulario nombre + email + contraseña |
| `OTPVerificationView.tsx` | Input de 6 dígitos para verificar OTP |
| `ForceChangePassword.tsx` | Cambio obligatorio de clave temporal |
| `AuditView.tsx` | Dashboard de eventos de seguridad |
| `ProtectedRoute.tsx` | HOC que verifica sesión y rol |

#### Módulo `erp/` — ERP VIISION
| Componente | Función |
|-----------|---------|
| `MainDashboard.tsx` | Panel principal con KPIs y acceso rápido |
| `HRMView.tsx` | RRHH: listado y alta de empleados |
| `HRMDesempenoView.tsx` | Desempeño de empleados |
| `HRMObjetivosView.tsx` | Objetivos del equipo |
| `HRMAuditoriaView.tsx` | Auditoría específica de RRHH |
| `AnalyticsView.tsx` | Analítica web con gráficos Recharts |
| `InternalManagementView.tsx` | Gestión interna empresarial |
| `SalesView.tsx` | Módulo de ventas |
| `DevOpsView.tsx` | Módulo DevOps |

---

## 🔑 Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/register` | Registro usuario + OTP + email |
| `POST` | `/api/login` | Login con validación Supabase |
| `POST` | `/api/verify-otp` | Verificación código OTP |
| `POST` | `/api/change-password` | Cambio de contraseña (clave temporal) |
| `GET` | `/api/users/count` | Conteo total de usuarios |
| `GET` | `/api/employees` | Listado de empleados |
| `POST` | `/api/employees` | Alta de empleado + clave temporal |
| `DELETE` | `/api/employees/:id` | Baja de empleado |
| `GET` | `/api/audit` | Últimos 100 eventos de auditoría |
| `GET` | `/api/analytics/summary` | Resumen de analítica web |
| `POST` | `/api/analytics/track` | Registrar visita de página |

---

## 🗄️ Tablas Supabase (PostgreSQL)

| Tabla | Columnas clave |
|-------|---------------|
| `users` | id (UUID), name, email, password, role, verified, must_change_password, created_at |
| `employees` | id, user_id (FK), name, email, phone, employee_type, department, position, hire_date, status |
| `otp_codes` | id, user_id (FK), code, attempts, max_attempts, expires_at |
| `audit_logs` | id, user_id (FK), email, action, ip, user_agent, timestamp |
| `analytics_tracking` | id, path, ip, user_agent, timestamp |

---

## 🔧 Archivos de Configuración

| Archivo | Descripción |
|---------|-------------|
| `package.json` | Dependencias React, Vite, UI libs, scripts dev/build/server |
| `server/package.json` | Dependencias Express, Supabase, Nodemailer, CORS |
| `vite.config.ts` | Config Vite + plugin React |
| `.env` (raíz) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `server/.env` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` |
| `src/styles/theme.css` | Paleta VIISION, variables semánticas, modo oscuro, tokens chart |
| `.gitignore` | Excluye `node_modules/`, `.env`, `dist/` |

---

## 📦 Dependencias Principales

### Frontend
| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` | 18.3.1 | Framework UI |
| `vite` | 6.x | Build tool |
| `react-router` | 7.x | Navegación |
| `tailwindcss` | 4.x | Estilos |
| `motion` | 12.x | Animaciones |
| `recharts` | 2.x | Gráficos |
| `sonner` | 2.x | Toasts |
| `@radix-ui/*` | 1–2.x | Componentes accesibles |
| `@mui/material` | 7.x | Material UI |
| `lucide-react` | 0.487 | Iconos |
| `@supabase/supabase-js` | 2.x | Cliente Supabase (frontend) |

### Backend
| Paquete | Uso |
|---------|-----|
| `express` | Servidor HTTP |
| `@supabase/supabase-js` | Base de datos PostgreSQL |
| `nodemailer` | Envío de emails |
| `cors` | CORS middleware |
| `dotenv` | Variables de entorno |

---

## 🚀 Flujo de Datos

```
Usuario → Frontend React (Puerto 5173)
                ↓
          Express API (Puerto 3001)
                ↓                ↓
        Supabase (PostgreSQL)  Gmail SMTP
        (users, employees,     (OTP codes,
         audit_logs, etc.)      claves tmp)
```

---

## 🔐 Seguridad

- **Autenticación 2FA** en registro (OTP por email)
- **Roles**: `admin` y `user`, aplicados en `ProtectedRoute`
- **Expiración OTP**: 10 minutos, máximo 3 intentos
- **Claves temporales**: `TempXXXX!` generadas automáticamente, cambio obligatorio
- **Variables sensibles**: en `.env` (excluido de Git por `.gitignore`)
- **Auditoría**: todos los eventos críticos registrados en Supabase

---

## 🎯 Estado Actual (Febrero 2026)

✅ **Implementado y funcional:**
- Sistema completo de autenticación (registro + OTP + login)
- Dashboard ERP principal con identidad VIISION
- Módulo RRHH (alta, listado, baja, desempeño, objetivos, auditoría RRHH)
- Flujo de empleado (clave temporal → primer acceso → cambio de contraseña)
- Módulo de Auditoría de seguridad
- Analítica Web con gráficos
- Gestión Interna, Ventas, DevOps
- Control de roles y rutas protegidas
- Integración completa con Supabase (PostgreSQL)
- Identidad de marca VIISION en toda la interfaz
