-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Ventas (Asociadas a productos y opcionalmente a un usuario comprador)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    customer_email TEXT, -- Para vincular si es un usuario logueado con gmail u otro
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('Completado', 'Pendiente', 'Cancelado')) DEFAULT 'Completado',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Analítica de Clics en Productos (Landing Page)
CREATE TABLE IF NOT EXISTS product_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ip TEXT,
    user_agent TEXT,
    user_email TEXT, -- Email si el usuario estaba logueado
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar las consultas en los nuevos dashboards
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX idx_product_clicks_clicked_at ON product_clicks(clicked_at);

-- Insertar periféricos modernos para la Landing Page
INSERT INTO products (name, description, price, image_url, category) VALUES 
('Teclado Mecánico RGB Pro', 'Switches táctiles silenciosos, chasis de aluminio y retroiluminación personalizable por tecla.', 129.99, 'https://m.media-amazon.com/images/I/61NGLA8LrpL._AC_SL1500_.jpg', 'Periféricos'),
('Mouse Inalámbrico Ultra-Light', 'Sensor óptico de 25K DPI, peso pluma de 60g y batería de 70 horas.', 89.99, 'https://m.media-amazon.com/images/I/71wZqT-B92L._AC_SL1500_.jpg', 'Periféricos'),
('Memoria RAM Trident Z 32GB', 'Kit DDR5 a 6000MHz con disipador de calor de aluminio y RGB direccional.', 189.50, 'https://m.media-amazon.com/images/I/61EukqONX2L._AC_SL1000_.jpg', 'Componentes'),
('Monitor Gaming 27" 165Hz', 'Panel IPS con tiempo de respuesta de 1ms y compatibilidad G-Sync.', 349.99, 'https://m.media-amazon.com/images/I/81xD2Pux-GL._AC_SL1500_.jpg', 'Monitores'),
('Auriculares Hi-Fi Wireless', 'Sonido espacial 7.1, cancelación de ruido activa y 40h de autonomía.', 159.00, 'https://m.media-amazon.com/images/I/61xk6T6SclL._AC_SL1500_.jpg', 'Audio')
ON CONFLICT DO NOTHING;

