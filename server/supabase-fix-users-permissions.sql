-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run
-- Soluciona "permission denied for table users" cuando ya usas SUPABASE_SERVICE_ROLE_KEY (JWT).

-- Dar permisos al rol que usa la API con la service_role key
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.users TO service_role;

-- Tablas que usa el servidor (empleados y auditoría). Crear si no existen:
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  employee_type TEXT,
  department TEXT,
  position TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'Activo',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  action TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT ALL ON TABLE public.employees TO service_role;
GRANT ALL ON TABLE public.audit_logs TO service_role;

-- Si la tabla users no existe, descomenta y ejecuta primero este bloque:
/*
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'user',
  verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  must_change_password BOOLEAN DEFAULT false,
  phone TEXT,
  company TEXT,
  origin TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
*/
