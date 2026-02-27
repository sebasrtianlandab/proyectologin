# Guía de pruebas para el profesor

Este documento describe cómo ejecutar y probar el sistema de forma correcta para la evaluación del proyecto. Siga los pasos en orden.

---

## Requisitos previos

- **Node.js** instalado (recomendado v18 o superior).
- **npm** (viene con Node.js).
- Tener las **variables de entorno** configuradas (ver sección siguiente).

---

## 1. Variables de entorno

El proyecto usa **Supabase** como base de datos y, para el envío de correos (claves temporales), **Gmail**.

- **Raíz del proyecto**  
  Debe existir un archivo `.env` en la raíz con:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

- **Carpeta `server/`**  
  Debe existir un archivo `server/.env` con:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - (Opcional pero recomendado para probar correos) `GMAIL_USER` y `GMAIL_APP_PASSWORD` (contraseña de aplicación de Google, no la contraseña normal del correo).

Si las variables de Supabase no están configuradas, el backend responderá con error y no se podrá iniciar sesión ni registrar empleados. Si Gmail no está configurado, el flujo de “agregar empleado” funcionará pero **no** se enviará el correo con la clave temporal.

---

## 2. Instalación de dependencias

En la **raíz del proyecto** ejecute:

```bash
npm install
```

Luego, en la carpeta del servidor:

```bash
cd server
npm install
cd ..
```

(O desde la raíz puede ejecutar `npm install` y luego `cd server && npm install`.)

---

## 3. Ejecutar el proyecto (dos terminales en paralelo)

Es necesario tener **dos procesos** corriendo al mismo tiempo: el **backend** y el **frontend**.

### Terminal 1 — Backend (servidor API)

Desde la **raíz del proyecto**:

```bash
npm run server
```

Debe aparecer algo como: `Servidor en http://localhost:3001` y, si Supabase está bien configurado, `Supabase conectado correctamente`.  
**Deje esta terminal abierta.**

### Terminal 2 — Frontend (aplicación web)

Desde la **raíz del proyecto**, en **otra terminal**:

```bash
npm run dev
```

Debe indicar que la app está en **http://localhost:5173** (o el puerto que muestre Vite).  
**Deje esta terminal abierta.**

---

## 4. Acceso inicial como administrador

1. Abra el navegador y vaya a: **http://localhost:5173** (o la URL que indique Vite).
2. En la pantalla de **Iniciar sesión** use las credenciales de administrador:
   - **Correo:** `admin@erp.com`
   - **Contraseña:** `admin123`
3. Tras iniciar sesión verá el **dashboard** de la empresa (ficticia). Ahí puede navegar por los módulos.

---

## 5. Prueba principal: claves temporales y flujo de empleado

El objetivo es probar el **registro de un empleado**, el **envío de la clave temporal por correo** y el **primer acceso del empleado** (cambio de contraseña obligatorio).

### Paso A — Crear un empleado (como admin)

1. En el menú / dashboard, entre a **Recursos Humanos** (por ejemplo desde el enlace “Recursos Humanos” o la ruta `/crm/rrhh`).
2. Pulse **“Agregar Empleado”** (o similar).
3. Rellene el formulario:
   - **Nombre completo** (ej.: Juan Pérez).
   - **Correo electrónico**: use un **correo real y accesible**, preferiblemente **Gmail** (necesario para recibir la clave temporal si Gmail está configurado en `server/.env`).
   - **Teléfono** y el resto de campos (tipo de empleado, departamento, puesto, fecha de contratación, estado, etc.).
4. Pulse **“Agregar Empleado”**.
5. Debe aparecer una **notificación (toast)** indicando que el empleado fue registrado exitosamente.

### Paso B — Revisar el correo

1. Abra la bandeja del **correo electrónico** que puso en el formulario.
2. Debe llegar un mensaje con el **nombre del empleado** y la **clave temporal** generada por el sistema.  
   (Si no llega, compruebe la configuración de Gmail en `server/.env` y la carpeta de spam.)

### Paso C — Simular el primer acceso del empleado

1. Abra **otra pestaña** del navegador (o otra ventana) y vaya de nuevo a **http://localhost:5173**.
2. En la pantalla de **Iniciar sesión**:
   - **Correo:** el mismo que usó para el empleado.
   - **Contraseña:** la **clave temporal** que recibió por correo.
3. Inicie sesión. El sistema debe redirigir a la vista de **“Cambio de contraseña”** (obligatorio en el primer acceso).

### Paso D — Cambiar la contraseña (vista “Cambio de contraseña”)

1. En la pantalla de **Cambio de contraseña**, ingrese una **nueva contraseña** que cumpla los requisitos (mínimo 8 caracteres, mayúscula, número, etc.).
2. Confirme la contraseña y pulse **“Actualizar contraseña y continuar”** (o el botón equivalente).
3. Debe aparecer un mensaje de éxito y el empleado quedará dentro del **dashboard** (acceso normal).

### Paso E — Verificación en la pestaña del administrador

1. Vuelva a la **pestaña donde inició sesión como admin** (admin@erp.com).
2. **Recursos Humanos**: en la sección de listado/cards de empleados debe aparecer el **nuevo empleado** que acaba de acceder.
3. **Auditoría** (ruta `/audit`): en el registro de eventos debe aparecer la actividad del empleado (por ejemplo inicio de sesión, cambio de contraseña, etc.).

Con esto se habrá probado el flujo completo: alta de empleado → envío de clave temporal por correo → primer acceso con clave temporal → cambio de contraseña → acceso al dashboard y visibilidad en admin y auditoría.

---

## 6. Secciones que debe revisar el profesor

Además del flujo anterior, se recomienda revisar estas vistas del sistema (accediendo siempre como **admin@erp.com**):

| Sección            | Ruta / Dónde encontrarla |
|--------------------|--------------------------|
| Dashboard principal | Tras login, pantalla principal |
| Recursos Humanos   | Menú → Recursos Humanos (`/crm/rrhh`) — listado y “Agregar Empleado” |
| Desempeño          | Dentro de Recursos Humanos → pestaña/opción **Desempeño** (`/crm/rrhh/desempeno`) |
| Objetivos          | Dentro de Recursos Humanos → **Objetivos** (`/crm/rrhh/objetivos`) |
| Auditoría RRHH     | Dentro de Recursos Humanos → **Auditoría** (`/crm/rrhh/auditoria`) |
| Analítica Web      | Menú → **Analítica Web** (`/analytics`) |
| Gestión interna    | Menú → **Gestión interna** (`/gestion-interna`) |
| Auditoría (general)| Menú → **Auditoría** (`/audit`) — registro de eventos del sistema |

Estas pantallas corresponden a lo solicitado en el proyecto (RRHH, claves temporales, correo, auditoría y analítica).

---

## 7. Resumen rápido

1. **Requisitos:** Node.js, npm, variables de entorno en `.env` (raíz) y `server/.env` (Supabase y, para correos, Gmail).
2. **Instalación:** `npm install` en raíz y en `server/`.
3. **Ejecución:** dos terminales: `npm run server` y `npm run dev` (backend en 3001, frontend en 5173).
4. **Login admin:** http://localhost:5173 → `admin@erp.com` / `admin123`.
5. **Prueba clave:** Recursos Humanos → Agregar empleado con un Gmail real → revisar correo → en otra pestaña iniciar sesión con ese correo y la clave temporal → cambiar contraseña → comprobar en admin (Recursos Humanos y Auditoría) que el empleado aparece y que la auditoría registra los eventos.

Si algo no funciona (login, registro de empleado, correo, cambio de contraseña), conviene revisar que las dos terminales sigan corriendo y que las variables de entorno estén bien configuradas.

---

*Documento preparado para facilitar la revisión y evaluación del proyecto.*
