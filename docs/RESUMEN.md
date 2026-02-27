# 📊 Resumen del Proyecto — VIISION ERP

## 🎯 Objetivo del Proyecto

Desarrollar un sistema ERP completo bajo la marca **VIISION**, que incluya autenticación segura con OTP, gestión de Recursos Humanos, analítica web, auditoría de seguridad y múltiples módulos empresariales, con persistencia real en **Supabase (PostgreSQL)**.

---

## ✅ Estado Actual del Proyecto

### Completado

- ✅ **Backend Node.js + Express** — Puerto 3001, integrado con Supabase
- ✅ **Frontend React + Vite + TypeScript** — Puerto 5173
- ✅ **Autenticación 2FA** — OTP de 6 dígitos por email (Gmail SMTP) en registro
- ✅ **Login directo** — validación de credenciales contra Supabase
- ✅ **Supabase (PostgreSQL)** — Base de datos real con tablas `users`, `employees`, `otp_codes`, `audit_logs`, `analytics_tracking`
- ✅ **Módulo RRHH** — Alta, listado, baja de empleados; clave temporal automática por correo
- ✅ **Flujo "primer acceso"** — Cambio obligatorio de contraseña para empleados (`/change-password`)
- ✅ **Auditoría de seguridad** — Eventos en tiempo real: registros, logins, OTP, cambios de clave
- ✅ **Analítica Web** — Tráfico diario, sesiones únicas, páginas más visitadas (Recharts)
- ✅ **Control de roles** — Admin y usuario; rutas protegidas por rol (`ProtectedRoute`)
- ✅ **Identidad de marca VIISION** — Paleta propia, Inter, modo oscuro premium, ShinyText, logo
- ✅ **Múltiples módulos ERP** — RRHH (desempeño, objetivos, auditoría), Ventas, DevOps, Gestión Interna, Analítica
- ✅ **Documentación completa** — 10 documentos en `docs/`

---

## 📂 Documentación Disponible

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **README.md** | Inicio rápido y descripción general | `/README.md` |
| **ESTRUCTURA.md** | Árbol de directorios y arquitectura | `/docs/ESTRUCTURA.md` |
| **FASES_DESARROLLO.md** | Proceso de desarrollo completo (8 fases) | `/docs/FASES_DESARROLLO.md` |
| **INSTRUCCIONES.md** | Guía de instalación y ejecución | `/docs/INSTRUCCIONES.md` |
| **REQUERIMIENTOS.md** | Requerimientos originales del proyecto | `/docs/REQUERIMIENTOS.md` |
| **RESUMEN.md** | Este documento — Resumen ejecutivo | `/docs/RESUMEN.md` |
| **ANALISIS_BASE_DE_DATOS.md** | Esquema SQL Supabase y modelo relacional | `/docs/ANALISIS_BASE_DE_DATOS.md` |
| **GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md** | Guía de evaluación del proyecto | `/docs/GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md` |
| **DOC_IDENTIDAD_VIISION.md** | Identidad, visión y misión de VIISION | `/docs/DOC_IDENTIDAD_VIISION.md` |
| **ESTILOS_MARCA_VIISION.md** | Manual de estilos y paleta de marca | `/docs/ESTILOS_MARCA_VIISION.md` |

---

## 🔑 Información Técnica Clave

### Tecnologías

| Capa | Tecnologías |
|------|------------|
| **Frontend** | React 18.3, Vite 6, TypeScript, Tailwind CSS 4, Motion, React Router 7, Recharts, Sonner, Radix UI, MUI 7 |
| **Backend** | Node.js, Express, Nodemailer, dotenv, @supabase/supabase-js |
| **Base de datos** | Supabase (PostgreSQL) |
| **Email** | Gmail SMTP con App Password |

### Puertos

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`

### Equipo y Correos

| Integrante | Correo | Rol |
|-----------|--------|-----|
| Sebastián Landa | rlandabazan@gmail.com | Líder / Backend |
| Eduardo Vega | vegasoft09@gmail.com | Frontend |
| Ignacio Hernández | hernandz.j2004@gmail.com | Frontend / QA |

### Credenciales de Demo

- **Admin**: `admin@erp.com` / `admin123`

---

## 🚀 Cómo Ejecutar

```bash
# Terminal 1 — Backend
npm run server        # → http://localhost:3001

# Terminal 2 — Frontend
npm run dev           # → http://localhost:5173

# Variables de entorno requeridas:
# .env (raíz): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# server/.env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#              GMAIL_USER, GMAIL_APP_PASSWORD
```

---

## 🗺️ Módulos y Rutas del Sistema

| Ruta | Módulo | Rol |
|------|--------|-----|
| `/login` | Inicio de sesión | Público |
| `/verify-otp` | Verificación OTP | Público |
| `/change-password` | Cambio de clave temporal | Público |
| `/dashboard` | Dashboard principal | Autenticado |
| `/crm/rrhh` | Recursos Humanos | Admin |
| `/crm/rrhh/desempeno` | Desempeño de empleados | Admin |
| `/crm/rrhh/objetivos` | Objetivos RRHH | Admin |
| `/crm/rrhh/auditoria` | Auditoría RRHH | Admin |
| `/analytics` | Analítica Web | Admin |
| `/audit` | Auditoría de seguridad | Admin |
| `/gestion-interna` | Gestión Interna | Admin |
| `/ventas` | Ventas | Autenticado |
| `/devops` | DevOps | Autenticado |

---

## 🔐 Flujos de Autenticación y Operación

### Registro de usuario público

```
Formulario (nombre/email/contraseña) → Supabase crea usuario
→ OTP generado → Email enviado → Usuario verifica OTP → Dashboard
```

### Login

```
Email + contraseña → Validación Supabase → Acceso directo al Dashboard
```

### Alta de empleado (Admin)

```
Admin rellena formulario RRHH → Supabase crea usuario + empleado
→ Clave temporal generada → Email al empleado
→ Empleado inicia sesión → Redirige a /change-password
→ Empleado establece contraseña → Dashboard normal
```

### Seguridad OTP

- 🔒 Código de 6 dígitos
- ⏱️ Expiración: 10 minutos
- 🔄 Límite: 3 intentos
- 📧 Envío por Gmail SMTP real

---

## 🗄️ Estructura de Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (id, name, email, password, role, verified, must_change_password) |
| `employees` | Empleados con perfil extendido (phone, department, position, hire_date, status) |
| `otp_codes` | Códigos OTP temporales (code, attempts, max_attempts, expires_at) |
| `audit_logs` | Registro de eventos de seguridad (action, email, ip, user_agent, timestamp) |
| `analytics_tracking` | Tráfico web (path, ip, user_agent, timestamp) |

### Eventos Auditados

| Evento | Descripción |
|--------|-------------|
| `USER_REGISTERED` | Nuevo usuario registrado |
| `EMPLOYEE_REGISTERED` | Nuevo empleado dado de alta |
| `LOGIN_FAILED` | Intento de login fallido |
| `LOGIN_SUCCESS_DIRECT` | Login exitoso |
| `OTP_VERIFIED_SUCCESS` | OTP verificado correctamente |

---

## 📈 Métricas del Proyecto

### Esfuerzo de Desarrollo

| Fase | Actividad | Tiempo |
|------|-----------|--------|
| 1 | Análisis de requerimientos | 30 min |
| 2 | Diseño de arquitectura | 20 min |
| 3 | Backend (Express + JSON) | 1 h 30 min |
| 4 | Integración Frontend-Backend | 1 h |
| 5 | 2FA obligatorio | 20 min |
| 6 | Limpieza de interfaz | 15 min |
| 7 | Módulo de auditoría integral | 1 h |
| 8 | Documentación | 45 min |
| 9 | Migración a Supabase + ERP completo | ~4 h |
| **Total** | | **~10 horas** |

### Código

| Capa | Líneas aprox. | Lenguaje |
|------|--------------|---------|
| Backend (`server.js`) | ~311 | JavaScript |
| Componentes auth | ~55,000 bytes | TypeScript/TSX |
| Componentes ERP | ~83,000 bytes | TypeScript/TSX |
| Documentación | ~68,000 bytes | Markdown |

### Archivos del Proyecto

| Categoría | Cantidad |
|-----------|---------|
| Componentes React (auth + ERP) | 17 |
| Endpoints API | 10 |
| Rutas del frontend | 13 |
| Documentos MD | 10 |
| Tablas en Supabase | 5 |

---

## 🎨 Características de la Interfaz

- ✨ **Tema oscuro premium** — Paleta VIISION (viision-50 a viision-950)
- 🎭 **Animaciones fluidas** — Motion (Framer Motion)
- 📱 **Responsive design** — Mobile-first con Tailwind CSS
- 🎨 **Identidad de marca** — Logo, ShinyText, Inter, gradientes VIISION
- 🔔 **Notificaciones toast** — Sonner
- 🎯 **Navegación SPA** — React Router v7
- � **Gráficos interactivos** — Recharts con paleta VIISION
- 🃏 **Componentes Radix/shadcn** — Accesibles y personalizables

---

## 🔧 Scripts Útiles

```bash
# Frontend
npm run dev            # Desarrollo (puerto 5173)
npm run build          # Producción
npm run preview        # Preview del build

# Backend
npm run server         # Inicia el backend (puerto 3001)

# Utilidad (JSON legacy)
./reset-db.sh          # Limpiar archivos JSON (Bash)
.\reset-db.ps1         # Limpiar archivos JSON (PowerShell)
```

---

## 📊 Comparación: Versión 1.0 vs Versión 2.0

| Aspecto | v1.0 (OTP básico) | v2.0 (ERP VIISION) |
|---------|--------------------|---------------------|
| **Persistencia** | Archivos JSON | Supabase (PostgreSQL) |
| **Emails** | OTP solamente | OTP + Clave temporal empleados |
| **Módulos** | Auth (Login/Registro/OTP) | Auth + RRHH + Analítica + Auditoría + Ventas + DevOps + Gestión |
| **Rutas** | 4 | 13 |
| **Roles** | No | Sí (admin / user) |
| **Empleados** | No | Sí (CRUD completo + alta automática) |
| **Analítica** | No | Sí (tráfico, sesiones, páginas top) |
| **Marca** | Genérica | VIISION (paleta, logo, ShinyText) |
| **Docs** | 6 | 10 |
| **Endpoints API** | 5 | 10 |

---

## 🏆 Logros del Proyecto

1. ✅ **ERP funcional completo** con múltiples módulos empresariales
2. ✅ **Arquitectura escalable** con Supabase (PostgreSQL real)
3. ✅ **Identidad de marca** integrada (VIISION) en toda la interfaz
4. ✅ **Flujo HR completo** — alta de empleado con clave temporal automática por correo
5. ✅ **Auditoría de seguridad** en tiempo real con logging en base de datos
6. ✅ **Analítica web** con gráficos de tráfico y comportamiento
7. ✅ **Documentación exhaustiva** — 10 documentos cubriendo todos los aspectos
8. ✅ **Control de roles** — rutas protegidas por perfil de usuario

---

## 🎯 Próximos Pasos Recomendados

### Seguridad
1. Implementar hash de contraseñas (bcrypt)
2. JWT para gestión de sesiones sin localStorage
3. Rate limiting en API
4. HTTPS en producción

### Funcionalidad
1. Reenvío de OTP desde la vista de verificación
2. Recuperación de contraseña por email
3. Edición de perfil de empleado
4. Filtros avanzados en auditoría y analítica

### Infraestructura
1. Dockerizar la aplicación
2. CI/CD con GitHub Actions
3. Deploy en Vercel (frontend) + Railway/Render (backend)

### Testing
1. Tests unitarios (Jest + React Testing Library)
2. Tests de integración de API
3. Tests E2E (Playwright)

---

## 🔗 Enlaces Útiles

- **Repositorio GitHub**: https://github.com/sebasrtianlandab/proyectologin
- **Supabase Dashboard**: https://supabase.com
- **Gmail App Password**: https://support.google.com/accounts/answer/185833
- **Documentación completa**: `/docs/`

---

## 👥 Créditos

**Empresa**: VIISION  
**Integrantes**:
- Sebastián Landa (rlandabazan@gmail.com) — Líder / Backend
- Eduardo Vega (vegasoft09@gmail.com) — Frontend
- Ignacio Hernández (hernandz.j2004@gmail.com) — Frontend / QA

**Período**: Febrero 2026  
**Metodología**: Desarrollo ágil iterativo

---

**Estado**: ✅ **COMPLETADO Y FUNCIONAL**  
**Versión**: 2.0.0  
**Última actualización**: 26 de Febrero de 2026
