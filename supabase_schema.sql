-- Habilitar extensión para UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user', 'customer')) DEFAULT 'user',
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
