# 🚀 Instrucciones de Ejecución

## Paso 1: Configurar Variables de Entorno

1. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y configura la **Contraseña de Aplicación de Gmail**:

   ### Cómo obtener la Contraseña de Aplicación:
   - Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Activa **"Verificación en dos pasos"** (si aún no está activa)
   - Busca **"Contraseñas de aplicaciones"** (App Passwords)
   - Genera una nueva para **"Correo"** > Dispositivo: **"Otro (Node.js)"**
   - Copia los **16 caracteres** y pégalos en el archivo `.env`

   Ejemplo del archivo `.env`:
   ```
   GMAIL_USER=rlandabazan@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```

## Paso 2: Instalar Dependencias del Servidor

Abre una terminal en la carpeta `server`:

```bash
cd server
npm install
```

## Paso 3: Ejecutar el Backend

Desde la carpeta `server`:

```bash
npm run server
```

Deberías ver: `🚀 Servidor corriendo en http://localhost:3001`

## Paso 4: Ejecutar el Frontend

Abre **OTRA TERMINAL** en la carpeta raíz del proyecto:

```bash
npm run dev
```

Esto iniciará el Frontend en: `http://localhost:5173`

---

## ✅ Resumen: Debes tener 2 terminales corriendo

1. **Terminal 1** (Backend): `server` → `npm run server` → Puerto 3001
2. **Terminal 2** (Frontend): Carpeta raíz → `npm run dev` → Puerto 5173

Abre el navegador en **http://localhost:5173** y prueba el registro/login. Los códigos OTP llegarán a los correos reales.
