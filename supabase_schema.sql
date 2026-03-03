-- ==============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS PARA SUPABASE (POSTGRESQL)
-- Incluye: Módulo de Usuarios, Auditoría, Analíticas, Productos, Ventas, Cotizaciones y Pagos
-- Tablas en Español
-- ==============================================================================

-- Habilitamos la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. MÓDULO DE USUARIOS Y EMPLEADOS
-- ==============================================================================

-- Tabla: usuarios
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    rol TEXT DEFAULT 'usuario',
    verificado BOOLEAN DEFAULT false,
    debe_cambiar_contrasena BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: empleados
CREATE TABLE public.empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    telefono TEXT,
    tipo_empleado TEXT,
    departamento TEXT,
    cargo TEXT,
    fecha_contratacion DATE,
    estado TEXT DEFAULT 'Activo',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: codigos_otp (Para recuperación y verificación en 2 pasos)
CREATE TABLE public.codigos_otp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    intentos INT DEFAULT 0,
    max_intentos INT DEFAULT 3,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. MÓDULO DE CLIENTES
-- ==============================================================================

-- Tabla: clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_documento TEXT NOT NULL, -- DNI, RUC, Pasaporte
    numero_documento TEXT UNIQUE NOT NULL,
    nombre_razon_social TEXT NOT NULL,
    correo TEXT,
    telefono TEXT,
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. MÓDULO DE AUDITORÍA Y ANALÍTICAS (INCLUYE EVENTOS WEB)
-- ==============================================================================

-- Tabla: registros_auditoria (Historial de acciones del sistema)
CREATE TABLE public.registros_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accion TEXT NOT NULL,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    correo TEXT,
    ip TEXT,
    agente_usuario TEXT
);

-- Tabla: seguimiento_visitas (Para estadísticas generales de la web)
CREATE TABLE public.seguimiento_visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip TEXT,
    agente_usuario TEXT,
    ruta TEXT
);

-- Tabla: eventos_cliente (Conteo y seguimiento de clics, vistas, interacciones en la web por cliente)
CREATE TABLE public.eventos_cliente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL, -- Si el usuario está logueado como cliente
    sesion_id TEXT, -- Para identificar visitantes no logueados
    tipo_evento TEXT NOT NULL, -- Ej: 'clic_boton', 'vista_producto', 'descarga_pdf', 'formulario_completado'
    ruta TEXT,
    detalles JSONB, -- JSON para guardar detalles como { "producto_id": "123", "boton": "comprar" }
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. MÓDULO DE PRODUCTOS / INVENTARIO
-- ==============================================================================

-- Tabla: categorias
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: productos
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    codigo_sku TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_venta NUMERIC(10, 2) NOT NULL, -- Precio base
    stock_actual INT DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. MÓDULO DE COTIZACIONES
-- ==============================================================================

-- Tabla: cotizaciones
CREATE TABLE public.cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL, -- Quien generó la cotización
    nro_cotizacion TEXT UNIQUE NOT NULL,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_validez DATE,
    estado TEXT DEFAULT 'Borrador', -- Borrador, Enviada, Aceptada, Rechazada, Vencida
    subtotal NUMERIC(12, 2) DEFAULT 0,
    impuestos NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    observaciones TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: cotizaciones_detalles
CREATE TABLE public.cotizaciones_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    descuento_porcentaje NUMERIC(5, 2) DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- ==============================================================================
-- 6. MÓDULO DE VENTAS Y PAGOS
-- ==============================================================================

-- Tabla: ventas
CREATE TABLE public.ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT,
    cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL, -- Opcional, si viene de una cotización
    vendedor_id UUID REFERENCES public.empleados(id) ON DELETE SET NULL,
    nro_comprobante TEXT UNIQUE NOT NULL, -- Factura/Boleta
    tipo_comprobante TEXT NOT NULL, -- 'Factura' o 'Boleta'
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado TEXT DEFAULT 'Pendiente', -- Pendiente, Pagada, Anulada
    subtotal NUMERIC(12, 2) DEFAULT 0,
    impuestos NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: ventas_detalles
CREATE TABLE public.ventas_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    descuento_porcentaje NUMERIC(5, 2) DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- Tabla: pagos (Registro de abonos o cancelaciones de ventas)
CREATE TABLE public.pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID REFERENCES public.ventas(id) ON DELETE CASCADE,
    nro_operacion TEXT, -- Nro_Transaccion de banco o efectivo
    monto NUMERIC(12, 2) NOT NULL,
    metodo_pago TEXT NOT NULL, -- Efectivo, Transferencia, Tarjeta de Crédito
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado TEXT DEFAULT 'Completado',
    referencia TEXT,
    registrado_por UUID REFERENCES public.empleados(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
