# 🚀 Instrucciones de Ejecución — VIISION ERP

## Prerrequisitos

- **Node.js** v18 o superior
- **npm** (viene con Node.js)
- Proyecto en **Supabase** con las tablas creadas (ver [ANALISIS_BASE_DE_DATOS.md](ANALISIS_BASE_DE_DATOS.md))
- Cuenta de **Gmail** con App Password configurado (para OTP y claves temporales)

---

## Paso 1: Configurar Supabase

1. Crea un proyecto en https://supabase.com
2. En el editor SQL de Supabase, ejecuta el script de [ANALISIS_BASE_DE_DATOS.md](ANALISIS_BASE_DE_DATOS.md) para crear las tablas
3. Inserta el usuario administrador inicial ejecutando en el SQL Editor:
   ```sql
   INSERT INTO users (name, email, password, role, verified)
   VALUES ('Administrador', 'admin@erp.com', 'admin123', 'admin', true);
   ```
4. Obtén tus credenciales desde Settings → API:
   - `Project URL` → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Paso 2: Configurar Variables de Entorno

### Archivo `.env` en la **raíz del proyecto** (para el frontend Vite)

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Archivo `server/.env` (para el backend Node.js)

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Opcional — requerido para envío de OTP y claves temporales
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Cómo obtener la Contraseña de Aplicación de Gmail

1. Ve a https://myaccount.google.com/security
2. Activa **"Verificación en dos pasos"** (si no está activa)
3. Busca **"Contraseñas de aplicaciones"** (App Passwords)
4. Genera una nueva para **"Correo"** → Dispositivo: **"Otro (Node.js)"**
5. Copia los **16 caracteres** y pégalos en `GMAIL_APP_PASSWORD`

> ⚠️ **Nunca subas el archivo `.env` a Git.** Ya está excluido por `.gitignore`.

---

## Paso 3: Instalar Dependencias

### Dependencias del frontend (desde la raíz del proyecto):

```bash
npm install
```

### Dependencias del backend:

```bash
cd server
npm install
cd ..
```

---

## Paso 4: Ejecutar el Proyecto

Es necesario tener **dos terminales** corriendo simultáneamente.

### Terminal 1 — Backend (API)

Desde la **raíz del proyecto**:

```bash
npm run server
```

Deberías ver:
```
🚀 Servidor en http://localhost:3001
✅ Supabase conectado correctamente (tabla users accesible)
```

> Si ves `❌ Error conectando a Supabase`, revisa las variables en `server/.env`.

### Terminal 2 — Frontend

Desde la **raíz del proyecto**, en **otra terminal**:

```bash
npm run dev
```

Deberías ver que la app está disponible en `http://localhost:5173`.

---

## Paso 5: Acceder al Sistema

1. Abre el navegador en **http://localhost:5173**
2. Inicia sesión con las credenciales de administrador:
   - **Correo:** `admin@erp.com`
   - **Contraseña:** `admin123`

---

## ✅ Resumen: 2 Terminales Siempre Activas

| Terminal | Comando | Puerto |
|----------|---------|--------|
| **Terminal 1** (Backend) | `npm run server` | 3001 |
| **Terminal 2** (Frontend) | `npm run dev` | 5173 |

---

## 🔧 Scripts Adicionales

```bash
# Ver build de producción
npm run build
npm run preview

# Limpiar archivos JSON legacy (si se usan)
./reset-db.sh       # Git Bash / Linux / Mac
.\reset-db.ps1      # PowerShell (Windows)
```

---

## 🔍 Resolución de Problemas Frecuentes

| Problema | Posible causa | Solución |
|---------|--------------|---------|
| Backend no arranca | `server/.env` mal configurado | Verificar `SUPABASE_URL` y claves |
| "Servicio no configurado" en login | `SUPABASE_URL` vacío en `server/.env` | Revisar variables de entorno |
| No llegan correos OTP | Gmail no configurado | Agregar `GMAIL_USER` y `GMAIL_APP_PASSWORD` |
| Error 403 en rutas admin | Rol del usuario no es `'admin'` | Verificar campo `role` en Supabase → tabla `users` |
| Frontend en blanco | `VITE_SUPABASE_URL` no está en `.env` raíz | Crear `.env` en raíz del proyecto |
