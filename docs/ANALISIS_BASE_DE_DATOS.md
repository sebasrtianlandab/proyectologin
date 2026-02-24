# Análisis de Requerimientos y Diseño de Base de Datos - Supabase

Este documento detalla el análisis de la estructura de datos actual (basada en JSON) y la propuesta de migración a una base de datos relacional en **Supabase (PostgreSQL)**.

## 1. Extracción de Requerimientos

El sistema actual gestiona cinco entidades principales. A continuación se detallan los campos y requerimientos detectados:

### A. Gestión de Usuarios (`users`)
*   **Identificación:** Se requiere un ID único (UUID recomendado).
*   **Seguridad:** Almacenamiento de email único y contraseña (se recomienda hasheo en la siguiente fase).
*   **Roles:** Diferenciación entre `admin` y `user` para control de acceso.
*   **Estado de Cuenta:** Flags para verificación (`verified`) y cambio obligatorio de contraseña (`must_change_password`).

### B. Gestión de Personal/Empleados (`employees`)
*   **Perfil Extendido:** Información detallada del trabajador (teléfono, tipo de empleado, departamento, cargo).
*   **Flujo de Contratación:** Fecha de ingreso y estado laboral (`Activo`/`Inactivo`).
*   **Relación:** Cada empleado debe estar vinculado a una cuenta de usuario para acceder al ERP.

### C. Seguridad y Verificación (`otp_codes`)
*   **Seguridad Efímera:** Almacenamiento temporal de códigos OTP vinculados a un usuario.
*   **Control de Fraude:** Contador de intentos fallidos y límite máximo de intentos.
*   **Expiración:** Timestamp de validez del código.

### D. Auditoría de Sistema (`audit_logs`)
*   **Trazabilidad:** Registro de cada acción crítica (Login, Registro, Cambios de Clave).
*   **Metadatos:** Captura de IP del cliente y User Agent para análisis forense.

### E. Analítica y Tráfico (`analytics_tracking`)
*   **Monitoreo:** Seguimiento de visitas por página, sesiones únicas y dispositivos.

---

## 2. Modelo Relacional Propuesto

Se ha diseñado un esquema normalizado para garantizar la integridad de los datos.

### Diagrama Lógico
1.  **Users (1) <---> (1) Employees**: Relación uno a uno (un empleado tiene un usuario).
2.  **Users (1) <---> (N) AuditLogs**: Un usuario genera múltiples registros de auditoría.
3.  **Users (1) <---> (N) OTPCodes**: Un usuario puede solicitar múltiples códigos (aunque solo uno esté activo).

---

## 3. Script SQL para Supabase (PostgreSQL)

```sql
-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    verified BOOLEAN DEFAULT false,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Empleados (Perfil extendido)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    employee_type TEXT DEFAULT 'Instructor',
    department TEXT DEFAULT 'General',
    position TEXT,
    hire_date DATE,
    status TEXT CHECK (status IN ('Activo', 'Inactivo')) DEFAULT 'Activo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Códigos OTP
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Auditoría
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email TEXT,
    action TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Analítica Web
CREATE TABLE analytics_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización de búsquedas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_email ON audit_logs(email);
CREATE INDEX idx_analytics_path ON analytics_tracking(path);
```

## 4. Próximos Pasos Recomendados

1.  **Cifrado:** Implementar `bcrypt` en el backend para no guardar las contraseñas en texto plano antes de subirlas a Supabase.
2.  **Migración de Datos:** Crear un script de migración que lea los archivos `.json` actuales y los inserte en estas nuevas tablas.
3.  **Cliente Supabase:** Reemplazar las funciones de `readJSON` y `writeJSON` en `server.js` por llamadas al cliente de Supabase (`@supabase/supabase-js`).
