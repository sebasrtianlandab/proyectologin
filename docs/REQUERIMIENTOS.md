# 📋 Requerimientos del Proyecto — VIISION ERP

Este documento presenta los requerimientos originales del sistema MVC con OTP y Auditoría, junto con el estado de cumplimiento actual.

---

## 1. Arquitectura y Lógica de Operación

El sistema se basa en el patrón **Modelo-Vista-Controlador (MVC)**, donde la persistencia de datos se maneja a través de **Supabase (PostgreSQL)**. El flujo de trabajo implementado:

```
Vista: El usuario interactúa con la interfaz (formulario de registro, login, RRHH, etc.)
   ↓
Controlador: Procesa la solicitud, valida datos y coordina acciones (AuthController.ts)
   ↓
Modelo: Gestiona la comunicación con la API backend (AuthService.ts)
   ↓
API Backend (Express): Operaciones de lectura/escritura en Supabase
   ↓
Supabase (PostgreSQL): users, employees, otp_codes, audit_logs, analytics_tracking
```

**Estado**: ✅ Implementado completamente

---

## 2. Requerimientos Técnicos por Módulo

### A. Gestión de Usuarios y Acceso

| Requerimiento | Estado | Notas |
|--------------|--------|-------|
| Registro con Nombre y Correo Electrónico | ✅ | + Campo contraseña |
| Crear registro en BD al registrar | ✅ | Supabase tabla `users` |
| Disparar sistema OTP al registrar | ✅ | Gmail SMTP |
| Middleware de autenticación (sesión activa) | ✅ | `ProtectedRoute.tsx` + `allowedRoles` |
| Control de roles (admin / user) | ✅ | Campo `role` en tabla `users` |
| Cierre de sesión (destruir sesión, redirigir) | ✅ | Botón logout en Dashboard |
| Flujo "primer acceso" con clave temporal | ✅ | `ForceChangePassword.tsx` + `must_change_password` |

### B. Sistema de Verificación OTP

| Requerimiento | Estado | Notas |
|--------------|--------|-------|
| Códigos de 6 dígitos | ✅ | `Math.floor(100000 + Math.random() * 900000)` |
| Fecha de expiración vinculada al usuario | ✅ | Columna `expires_at` en `otp_codes` (10 min) |
| Pantalla específica para ingresar código | ✅ | `OTPVerificationView.tsx` |
| Validar coincidencia y no-expiración | ✅ | Endpoint `POST /api/verify-otp` |
| Limite de intentos (3 máximo) | ✅ | Columna `max_attempts` en `otp_codes` |
| Crear sesión definitiva tras OTP exitoso | ✅ | localStorage → Dashboard |

### C. Sistema de Auditoría de Eventos

| Requerimiento | Estado | Notas |
|--------------|--------|-------|
| Registros nuevos (`USER_REGISTERED`) | ✅ | `logAudit()` en endpoint register |
| Envíos de OTP (implícito en OTP_VERIFIED) | ✅ | — |
| Intentos fallidos (`LOGIN_FAILED`) | ✅ | `logAudit()` en endpoint login |
| Logins exitosos (`LOGIN_SUCCESS_DIRECT`) | ✅ | `logAudit()` en endpoint login |
| OTP verificado (`OTP_VERIFIED_SUCCESS`) | ✅ | `logAudit()` en endpoint verify-otp |
| Alta de empleado (`EMPLOYEE_REGISTERED`) | ✅ | `logAudit()` en endpoint employees POST |
| Metadatos: Tipo de evento | ✅ | Campo `action` en `audit_logs` |
| Metadatos: Email del usuario | ✅ | Campo `email` en `audit_logs` |
| Metadatos: Dirección IP | ✅ | Campo `ip` en `audit_logs` |
| Metadatos: Fecha/hora | ✅ | Campo `timestamp` en `audit_logs` |
| Metadatos: User Agent | ✅ | Campo `user_agent` en `audit_logs` |

---

## 3. Composición de Interfaz

| Pantalla | Elementos Requeridos | Estado |
|---------|---------------------|--------|
| **Login** | Campos email y contraseña, botón acción, enlace a registro | ✅ |
| **Registro** | Campos nombre, email y contraseña, botón acción, enlace a login | ✅ |
| **Verificación OTP** | Input 6 dígitos, confirmación del correo al que se envió | ✅ |
| **Dashboard** | Saludo personalizado, datos del usuario, botón Logout | ✅ |
| **Auditoría** | Tabla historial de actividad, estadísticas (total logins, IPs únicas) | ✅ |
| **RRHH** | Listado empleados, formulario "Agregar Empleado" | ✅ |
| **Analítica** | Gráficos de tráfico, páginas visitadas, sesiones únicas | ✅ |

---

## 4. Estrategia de Implementación (Cumplida)

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 1** | Validar el enrutamiento y la estructura base | ✅ React Router v7, 13 rutas |
| **Fase 2** | Establecer la lectura/escritura de datos | ✅ Supabase (antes JSON) |
| **Fase 3** | Implementar el flujo de registro y generación de OTP | ✅ Supabase + Gmail SMTP |
| **Fase 4** | Activar la validación de seguridad y protección de rutas | ✅ ProtectedRoute + roles |
| **Fase 5** | Integrar el sistema de auditoría final | ✅ `audit_logs` en Supabase |

---

## 5. Requerimientos Adicionales Implementados (Más Allá del Alcance Original)

Los siguientes requerimientos fueron identificados y desarrollados durante el proyecto para lograr un producto ERP completo:

| Requerimiento | Módulo |
|--------------|--------|
| Control de roles (admin / user) con rutas protegidas | Auth |
| Módulo RRHH con CRUD de empleados | ERP |
| Clave temporal automática + envío por correo al nuevo empleado | ERP / Auth |
| Cambio obligatorio de contraseña en primer acceso | Auth |
| Analítica web (tráfico, sesiones, páginas top) con gráficos | ERP |
| Identidad de marca VIISION (paleta, logo, tipografía, design system) | UI |
| Módulos Ventas, DevOps, Gestión Interna | ERP |
| Base de datos real Supabase (vs JSON en desarrollo) | Infraestructura |

---

**Última actualización**: 26 de Febrero de 2026