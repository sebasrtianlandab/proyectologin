# 📚 Fases de Desarrollo — VIISION ERP

Este documento detalla el proceso completo de desarrollo del sistema, desde los requerimientos iniciales hasta el producto final (ERP empresarial con Supabase).

---

## 📋 Fase 1: Análisis de Requerimientos

### Objetivo
Entender los requerimientos del proyecto y el código existente.

### Actividades Realizadas
1. **Revisión del código fuente** inicial del proyecto React
2. **Análisis de requerimientos** especificados (sistema MVC con OTP y auditoría)
3. **Identificación de gaps** entre implementación actual y requerimientos

### Resultados
- ✅ Proyecto base en React con autenticación simulada (localStorage)
- ✅ Interfaz moderna con diseño dark mode y animaciones
- ❌ Sin envío real de correos electrónicos
- ❌ Sin persistencia real de datos
- ❌ Sin backend para manejo de lógica de negocio

### Duración
30 minutos

---

## 🏗️ Fase 2: Diseño de la Solución

### Objetivo
Diseñar una arquitectura que cumpla con todos los requerimientos sin romper el frontend existente.

### Decisiones de Arquitectura

#### Backend
- **Stack elegido**: Node.js + Express
- **Razón**: Rápido de implementar, compatible con el ecosistema JavaScript
- **Persistencia inicial**: Archivos JSON (simula BD, fácil de migrar)
- **Email**: Nodemailer + Gmail SMTP

#### Frontend
- **Mantener**: Diseño y componentes UI existentes
- **Actualizar**: Modelos y controladores para comunicarse con backend
- **Agregar**: Campo "Nombre" en registro

#### Flujo de Datos (v1)
```
Usuario → React Frontend → Express API → JSON Files
                                ↓
                        Gmail SMTP (OTP)
```

### Duración
20 minutos

---

## ⚙️ Fase 3: Implementación del Backend

### Objetivo
Crear un servidor backend funcional con todas las rutas API necesarias.

### Actividades

#### 3.1 Configuración Inicial
- Creación de carpeta `server/`
- Inicialización de `package.json`
- Instalación de dependencias:
  ```bash
  npm install express cors nodemailer dotenv
  ```

#### 3.2 Desarrollo del Servidor (`server/server.js`)
Implementación de rutas API:

1. **POST /api/register** — valida datos, crea usuario en JSON, genera OTP, envía email
2. **POST /api/login** — valida credenciales, genera OTP (2FA obligatorio)
3. **POST /api/verify-otp** — valida código, controla intentos (3) y expiración (10 min)
4. **GET /api/user/:email** — obtiene datos de usuario (sin contraseña)

#### 3.3 Configuración de Gmail
- Archivo `.env` con credenciales
- Nodemailer con Gmail SMTP
- App Password de Google

#### 3.4 Persistencia de Datos
- `data/users.json` — usuarios
- `data/otp.json` — códigos temporales
- `data/audit.json` — auditoría

### Archivos Creados
`server/server.js`, `server/package.json`, `server/.env`, `data/users.json`, `data/otp.json`, `data/audit.json`

### Duración
1 hora 30 minutos

---

## 🎨 Fase 4: Integración Frontend-Backend

### Objetivo
Conectar el frontend React existente con el nuevo backend sin romper el diseño.

### Actividades

#### 4.1 Actualización de Modelos (`/src/models/`)
- `User.ts` — campo `name` agregado
- `AuthService.ts` — refactorizado de localStorage a llamadas API `async/await`

#### 4.2 Actualización de Controladores
- `AuthController.ts` — métodos convertidos a async, parámetro `name` en registro

#### 4.3 Actualización de Vistas
- `RegisterView.tsx` — input de nombre agregado
- `LoginView.tsx` — flujo async actualizado
- `OTPVerificationView.tsx` — llamada async a verify
- `DashboardView.tsx` — usa datos de sesión (localStorage)

### Archivos Modificados
`src/models/User.ts`, `src/models/AuthService.ts`, `src/controllers/AuthController.ts`, componentes auth

### Duración
1 hora

---

## 🔐 Fase 5: Implementación de 2FA Obligatorio

### Objetivo
Asegurar que el login siempre requiera OTP, no solo en el registro.

### Cambios Realizados

**Backend**
- Eliminada condición `if (!user.verified)` — login **siempre** genera OTP
- Asunto de email: "Código de Verificación OTP - Login"

**Frontend**
- Ya estaba preparado para manejar `requiresOTP: true`

### Resultado
Autenticación de dos factores completa: credenciales → OTP → acceso.

### Duración
20 minutos

---

## ✨ Fase 6: Limpieza de Interfaz

### Objetivo
Eliminar mensajes de desarrollo y dejar una interfaz 100% profesional.

### Elementos Eliminados
- Banners "Modo desarrollo" en `OTPVerificationView.tsx`
- Sección "Arquitectura MVC" educativa en `DashboardView.tsx`
- Sección "Backend Integrado" en `DashboardView.tsx`

### Resultado
✅ Interfaz completamente profesional, sin referencias técnicas innecesarias.

### Duración
15 minutos

---

## 🛡️ Fase 7: Módulo de Auditoría Integral

### Objetivo
Implementar rastreo de seguridad que registre cada acción crítica en el servidor.

### Actividades

#### 7.1 Backend — Logging Automático
- Función helper `logAudit` en `server.js`
- Eventos registrados:
  - `USER_REGISTERED` — nueva cuenta creada
  - `LOGIN_FAILED` — credenciales incorrectas
  - `LOGIN_ATTEMPT_SUCCESS_WAITING_OTP` — login correcto, esperando 2FA
  - `OTP_VERIFIED_SUCCESS` — acceso concedido
- Metadatos capturados: IP del cliente, timestamp, User-Agent

#### 7.2 API de Auditoría
- Endpoint `GET /api/audit` — últimos 50 registros en orden cronológico inverso

#### 7.3 Frontend — Visualización
- Creación de `AuditView.tsx`
- Dashboard de Seguridad:
  - Estadísticas dinámicas (eventos totales, alertas críticas, IPs únicas)
  - Tabla interactiva con badges de estado
  - Actualización en tiempo real ("Live Logs")

### Archivos Creados/Modificados
`server/server.js`, `src/app/components/auth/AuditView.tsx`, `src/app/routes.tsx`

### Duración
1 hora

---

## 📚 Fase 8: Documentación y Organización

### Objetivo
Documentar el proyecto completo y organizar archivos.

### Actividades

#### 8.1 Creación de carpeta `docs/`
Centralización de toda la documentación.

#### 8.2 Documentos Creados
1. `ESTRUCTURA.md` — árbol de directorios
2. `FASES_DESARROLLO.md` — este documento
3. `INSTRUCCIONES.md` — guía de instalación
4. `REQUERIMIENTOS.md` — requerimientos originales
5. `RESUMEN.md` — resumen ejecutivo
6. `LIMPIEZA.md` — historial de organización

#### 8.3 Scripts de Utilidad
- `reset-db.sh` — limpieza JSON (Bash)
- `reset-db.ps1` — limpieza JSON (PowerShell)

### Duración
45 minutos

---

## 🚀 Fase 9: Migración a Supabase + ERP Completo

### Objetivo
Migrar la persistencia de JSON a Supabase (PostgreSQL real) y expandir el sistema a un ERP empresarial completo bajo la marca VIISION.

### Actividades

#### 9.1 Migración de Base de Datos
- Instalación de `@supabase/supabase-js` en frontend y backend
- Creación de tablas en Supabase (ver [ANALISIS_BASE_DE_DATOS.md](ANALISIS_BASE_DE_DATOS.md)):
  - `users` — usuarios del sistema
  - `employees` — perfiles extendidos de empleados
  - `otp_codes` — códigos OTP temporales
  - `audit_logs` — historial de eventos de seguridad
  - `analytics_tracking` — tráfico web
- Refactorización completa de `server.js`: reemplazo de `readJSON`/`writeJSON` por cliente Supabase
- Nuevas variables de entorno: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

#### 9.2 Módulo RRHH (HRMView)
- CRUD completo de empleados:
  - Listado con filtros y cards visuales
  - Alta de empleado con generación automática de clave temporal (`TempXXXX!`)
  - Envío de clave temporal al correo del empleado por Gmail
  - Baja de empleado (elimina de Supabase)
- Subvistas: Desempeño (`HRMDesempenoView`), Objetivos (`HRMObjetivosView`), Auditoría RRHH (`HRMAuditoriaView`)

#### 9.3 Flujo "Primer Acceso" de Empleado
- Nuevo campo `must_change_password` en tabla `users`
- Nueva Vista `ForceChangePassword.tsx` — pantalla de cambio obligatorio en `/change-password`
- Endpoint `POST /api/change-password` — actualiza contraseña y limpia el flag
- `ProtectedRoute.tsx` verifica `mustChangePassword` y redirige si aplica

#### 9.4 Módulos ERP
- `MainDashboard.tsx` — panel principal con KPIs
- `AnalyticsView.tsx` — analítica web (gráficos Recharts: tráfico diario, páginas top)
- `InternalManagementView.tsx` — gestión interna empresarial
- `SalesView.tsx` — módulo de ventas
- `DevOpsView.tsx` — módulo DevOps
- Endpoints de analítica: `GET /api/analytics/summary`, `POST /api/analytics/track`
- Endpoint de conteo: `GET /api/users/count`

#### 9.5 Control de Roles
- Campo `role` en tabla `users` (`'admin'` / `'user'`)
- `ProtectedRoute` acepta prop `allowedRoles`
- Rutas admin-only: `/crm/rrhh/*`, `/analytics`, `/audit`, `/gestion-interna`
- Usuario de administrador insertado manualmente en Supabase: `admin@erp.com` / `admin123`

#### 9.6 Identidad de Marca VIISION
- Paleta de colores `viision-50` a `viision-950` en `src/styles/theme.css`
- Variables CSS semánticas: `--background`, `--primary`, `--sidebar`, `--chart-1..5`
- Modo oscuro por defecto en `:root`
- Tipografía **Inter** (Google Fonts) cargada en `index.html`
- Logo oficial en `public/logo/viision-logo.png`
- Componente `ShinyText.tsx` + `ShinyText.css` para texto de marca animado
- Clase `card-glow` — efecto borde/glow sutil en cards principales
- ERPLayout con sidebar usando tokens VIISION
- Login con logo + ShinyText "VIISION"

#### 9.7 Actualización de Rutas
Se expandieron de 4 a 13 rutas:

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/`, `/login` | LoginView | Público |
| `/verify-otp` | OTPVerificationView | Público |
| `/change-password` | ForceChangePassword | Público |
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

#### 9.8 Documentación Actualizada
- 10 documentos en `docs/` (se agregaron: `ANALISIS_BASE_DE_DATOS.md`, `GUIA_DE_PRUEBAS_PARA_EL_PROFESOR.md`, `DOC_IDENTIDAD_VIISION.md`, `ESTILOS_MARCA_VIISION.md`)
- Todos los docs existentes actualizados

### Archivos Creados/Modificados en Fase 9
- `server/server.js` — refactorización completa + nuevos endpoints
- `server/.env` — nuevas variables Supabase
- `.env` (raíz) — variables VITE_SUPABASE_* para frontend
- `src/app/components/auth/ForceChangePassword.tsx` — nuevo
- `src/app/components/erp/*.tsx` — 10 nuevos componentes
- `src/app/components/layout/*.tsx` — layout ERP con sidebar
- `src/app/components/ui/ShinyText.tsx` — nuevo
- `src/styles/theme.css` — paleta VIISION completa
- `src/app/routes.tsx` — 13 rutas
- `public/logo/viision-logo.png` — logo VIISION
- `docs/*.md` — 4 documentos nuevos + actualizaciones

### Duración
~4 horas

---

## 📊 Resumen del Proyecto

### Tiempo Total de Desarrollo
**~10 horas** (incluyendo análisis, implementación, migración a Supabase, ERP y documentación)

### Código

| Capa | Tamaño aprox. | Lenguaje |
|------|--------------|---------|
| Backend (`server.js`) | ~311 líneas | JavaScript |
| Componentes auth | ~55 KB | TypeScript/TSX |
| Componentes ERP | ~83 KB | TypeScript/TSX |
| Documentación | ~68 KB | Markdown |

### Tecnologías Utilizadas
- **Frontend**: React 18, Vite 6, TypeScript, Tailwind CSS 4, Motion, React Router 7, Recharts, Sonner, Radix UI, MUI 7
- **Backend**: Node.js, Express, @supabase/supabase-js, Nodemailer, dotenv
- **Base de datos**: Supabase (PostgreSQL)
- **Email**: Gmail SMTP (App Password)
- **Control de versiones**: Git + GitHub

### Características Implementadas

✅ Registro de usuarios con OTP por email real (Gmail)  
✅ Login con validación contra Supabase  
✅ Login 2FA con OTP obligatorio  
✅ Dashboard protegido con información del usuario  
✅ Límite de intentos OTP (3) y expiración (10 min)  
✅ Módulo RRHH: alta, listado, baja de empleados  
✅ Clave temporal automática para empleados nuevos (por correo)  
✅ Cambio de contraseña obligatorio en primer acceso  
✅ Sistema de auditoría con logs en Supabase  
✅ Analítica web con gráficos de tráfico  
✅ Control de roles (admin/user) y rutas protegidas  
✅ Identidad de marca VIISION (paleta, logo, tipografía)  
✅ Módulos ERP: Ventas, DevOps, Gestión Interna  
✅ Documentación completa (10 documentos)

---

## 🎯 Próximos Pasos Sugeridos

### A Corto Plazo
1. Hashear contraseñas con bcrypt
2. Reenvío de OTP desde la vista de verificación
3. Filtros avanzados en analítica y auditoría
4. Validación de formato de email en formularios

### A Mediano Plazo
1. JWT para gestión de sesiones (reemplazar localStorage)
2. Recuperación de contraseña por email
3. Edición de perfil de empleado
4. Panel de administración de usuarios

### A Largo Plazo
1. Dockerizar la aplicación
2. CI/CD con GitHub Actions
3. Deploy: Vercel (frontend) + Railway/Render (backend)
4. Monitoreo con Sentry

---

## 👥 Equipo de Desarrollo

| Integrante | Rol | Correo |
|-----------|-----|--------|
| Sebastián Landa | Líder / Backend | rlandabazan@gmail.com |
| Eduardo Vega | Frontend | vegasoft09@gmail.com |
| Ignacio Hernández | Frontend / QA | hernandz.j2004@gmail.com |

**Empresa**: VIISION  
**Metodología**: Desarrollo ágil iterativo  
**Período**: Febrero 2026

---

## 📝 Notas Finales

Este proyecto demuestra una implementación funcional y escalable de un ERP empresarial moderno, partiendo de un sistema de autenticación OTP hasta convertirse en una plataforma multi-módulo con base de datos real (Supabase PostgreSQL), gestión de RRHH, analítica web y auditoría de seguridad, todo bajo la identidad de marca VIISION.

El código está organizado siguiendo el patrón MVC, con componentes documentados y una arquitectura preparada para escalar a producción.
