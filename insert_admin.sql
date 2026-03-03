-- Insertar el usuario administrador por defecto
INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    verified,
    must_change_password
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID fijo para el admin por defecto
    'Administrador',
    'admin@erp.com',
    'admin',
    'admin',
    true,
    false
)
ON CONFLICT (email) DO NOTHING;
