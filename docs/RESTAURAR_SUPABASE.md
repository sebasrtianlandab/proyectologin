# Restaurar conexión a Supabase

Este documento describe los pasos para volver a usar **Supabase** como base de datos cuando tengas las claves correctas (Anon Key y, recomendado, Service Role Key). Mientras tanto el proyecto puede funcionar con **datos mock en JSON** en `server/data/`.

---

## 1. Estado actual (modo Mock)

- En `server/.env` está **`USE_MOCK_DATA=true`**.
- El backend usa los archivos en **`server/data/`**:
  - `users.json` – usuarios (incluye admin: `admin@erp.com` / `admin123`)
  - `otp.json` – códigos OTP
  - `audit_logs.json` – auditoría
  - `employees.json` – empleados
  - `analytics_tracking.json` – tracking
- No se requiere Supabase ni claves para que el login y el resto de la app funcionen.

---

## 2. Qué necesitas para restaurar Supabase

1. **URL del proyecto**  
   Ej: `https://xxxxx.supabase.co`

2. **Anon Key (pública)**  
   Para el frontend y, si no usas Service Role, para el backend. Suele ser un JWT largo que empieza por `eyJ...` (o la “Publishable Key” si Supabase la ofrece y es la que usáis).

3. **Service Role Key (secreta)** – recomendada para el backend  
   En el dashboard: **Settings → API → Project API keys → `service_role`**.  
   Permite al servidor leer/escribir sin restricciones de RLS. **No uses esta clave en el frontend.**

---

## 3. Pasos para restaurar Supabase

### 3.1 Configurar variables de entorno

**En la raíz del proyecto (`.env`)** – frontend (Vite):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...   # Anon Key (JWT)
```

**En `server/.env`** – backend:

1. Poner **`USE_MOCK_DATA=false`** (o borrar la línea; por defecto se usará Supabase si hay URL y clave).

2. Completar Supabase:

```env
USE_MOCK_DATA=false

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...        # misma Anon Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # clave service_role (recomendado)

GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

- Si no pones **`SUPABASE_SERVICE_ROLE_KEY`**, el servidor usará **`SUPABASE_ANON_KEY`**. En ese caso en Supabase deben existir políticas RLS que permitan al rol `anon` leer (y si aplica escribir) en las tablas que usa el backend (`users`, `otp_codes`, `audit_logs`, `employees`, `analytics_tracking`).
- Si pones **`SUPABASE_SERVICE_ROLE_KEY`**, el backend ignora RLS y no necesitas políticas especiales para el servidor.

### 3.2 Reiniciar servidor y frontend

- Reinicia el servidor (por ejemplo `npm run server` desde la raíz o `npm run server` dentro de `server/`).
- Si cambiaste `.env` del frontend, reinicia también el dev server (`npm run dev`).

Al arrancar, en la consola del backend deberías ver:

- **Modo Supabase:**  
  `Servidor Supabase corriendo en http://localhost:3001`
- **Modo Mock:**  
  `Servidor en modo MOCK (JSON) en http://localhost:3001`

---

## 4. Comprobar que Supabase está bien configurado

1. Login con un usuario que exista en Supabase (ej. el admin que creaste en la BD).
2. Revisar en el dashboard de Supabase que en **Table Editor** (o SQL) se ven los datos de `users`, `audit_logs`, etc., según lo que use tu flujo.
3. Si el login falla con Supabase:
   - Revisa que **Anon Key** (y si aplica **Service Role Key**) sean las correctas y sin espacios.
   - Si usas solo Anon Key, revisa **RLS** en las tablas `users`, `otp_codes`, etc.: debe haber políticas que permitan al rol `anon` (o al que use tu app) hacer SELECT/INSERT/UPDATE/DELETE según lo que haga el backend.

---

## 5. Migrar datos del mock a Supabase (opcional)

Si creaste usuarios o datos útiles en modo mock (archivos en `server/data/`), puedes migrarlos a Supabase:

1. Revisar `server/data/users.json`, `employees.json`, `audit_logs.json`, etc.
2. En Supabase: **SQL Editor** o **Table Editor** e insertar esos datos a mano o con un script que lea los JSON y haga `INSERT` en las tablas correspondientes.
3. Las estructuras en `server/data/*.json` siguen los mismos nombres de columnas que usa el código (snake_case: `user_id`, `created_at`, `must_change_password`, etc.), para que puedas mapear fácil a las tablas de Supabase.

No es obligatorio migrar; puedes dejar el mock solo para desarrollo y usar Supabase en producción con datos creados ahí.

---

## 6. Resumen rápido

| Objetivo                         | Acción                                                                 |
|----------------------------------|-------------------------------------------------------------------------|
| Seguir usando solo JSON (mock)   | Mantener `USE_MOCK_DATA=true` en `server/.env`.                        |
| Pasar a Supabase                 | Poner `USE_MOCK_DATA=false` y configurar URL + Anon Key (+ Service Role recomendado) en `server/.env` y en `.env` del frontend las variables `VITE_*`. |
| Volver a mock                    | Poner de nuevo `USE_MOCK_DATA=true` y reiniciar el servidor.           |

Cuando tengas las claves correctas, basta con seguir la sección 3 y reiniciar los servicios.
