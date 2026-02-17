# 🔐 Sistema de Autenticación con Verificación OTP

Sistema completo de autenticación con verificación por código OTP (One-Time Password) enviado por email. Implementa autenticación de dos factores (2FA) tanto en registro como en login.

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Características

- 🔒 **Autenticación 2FA obligatoria** - OTP requerido en registro y login
- 📧 **Envío real de emails** - Códigos OTP enviados vía Gmail SMTP
- ⏱️ **Códigos con expiración** - 10 minutos de validez, 3 intentos máximo
- 🎨 **Interfaz moderna** - Diseño dark mode con animaciones fluidas
- 🔐 **Dashboard protegido** - Rutas protegidas con verificación de sesión
- 📱 **Responsive design** - Funciona en desktop, tablet y móvil

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 14.0.0
- npm o yarn
- Cuenta de Gmail con App Password configurado

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sebasrtianlandab/proyectologin.git
   cd proyectologin
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configurar variables de entorno**
   
   Crear archivo `server/.env`:
   ```env
   GMAIL_USER=tu_email@gmail.com
   GMAIL_APP_PASSWORD=tu_app_password_aqui
   ```
   
   > 💡 Ver [docs/INSTRUCCIONES.md](docs/INSTRUCCIONES.md) para obtener un App Password de Gmail

5. **Ejecutar el proyecto**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run server
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

---

## 📁 Estructura del Proyecto

```
Login-con-verificación-OTP/
├── docs/                    # Documentación completa
├── data/                    # Persistencia (JSON)
├── server/                  # Backend (Node.js + Express)
└── src/                     # Frontend (React + Vite)
    ├── app/components/      # Componentes React
    ├── controllers/         # Lógica de negocio
    ├── models/              # Modelos y servicios
    └── styles/              # Estilos globales
```

Ver estructura detallada en [docs/ESTRUCTURA.md](docs/ESTRUCTURA.md)

---

## 🔧 Tecnologías

### Frontend
- **React** 18.3.1 - Framework UI
- **Vite** - Build tool ultrarrápido
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Motion** - Animaciones
- **React Router** - Navegación

### Backend
- **Node.js** + **Express** - API RESTful
- **Nodemailer** - Envío de emails
- **dotenv** - Variables de entorno

---

## 📖 Documentación

- **[ESTRUCTURA.md](docs/ESTRUCTURA.md)** - Árbol de directorios y arquitectura
- **[FASES_DESARROLLO.md](docs/FASES_DESARROLLO.md)** - Proceso de desarrollo completo
- **[INSTRUCCIONES.md](docs/INSTRUCCIONES.md)** - Guía de instalación detallada
- **[REQUERIMIENTOS.md](docs/REQUERIMIENTOS.md)** - Requerimientos del proyecto

---

## 🔑 Flujo de Usuario

### Registro
1. Usuario ingresa **nombre, email y contraseña**
2. Sistema valida y crea cuenta
3. **Código OTP enviado por email** (6 dígitos)
4. Usuario ingresa código
5. ✅ Cuenta verificada → Acceso al Dashboard

### Login
1. Usuario ingresa **email y contraseña**
2. Sistema valida credenciales
3. **Código OTP enviado por email** (2FA)
4. Usuario ingresa código
5. ✅ OTP validado → Acceso al Dashboard

---

## 🛠️ Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo (puerto 5173)
npm run build        # Build de producción
npm run preview      # Preview del build
```

### Backend
```bash
npm run server       # Iniciar servidor backend (puerto 3001)
```

### Utilidades
```bash
npm run reset-db     # Limpiar base de datos (multiplataforma)
./reset-db.sh        # Limpiar BD (Bash/Linux/Mac)
.\reset-db.ps1       # Limpiar BD (PowerShell/Windows)
```

---

## 🔐 Seguridad

- ✅ Autenticación de dos factores (2FA)
- ✅ Códigos OTP de un solo uso
- ✅ Expiración automática (10 minutos)
- ✅ Límite de intentos (3 máximo)
- ✅ Variables sensibles en `.env` (no en Git)

> ⚠️ **Nota**: En desarrollo, las contraseñas **no están hasheadas**. Para producción, implementar bcrypt.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

- [ ] Implementar módulo de auditoría completo
- [ ] Hashear contraseñas con bcrypt
- [ ] Migrar a base de datos PostgreSQL/MongoDB
- [ ] Implementar JWT para sesiones
- [ ] Agregar recuperación de contraseña
- [ ] Tests unitarios y de integración
- [ ] Docker containerization
- [ ] Deploy en cloud (AWS/Vercel)

---

## 👥 Autores

- **Sebastián Landa** - [GitHub](https://github.com/sebasrtianlandab)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- Diseño de UI inspirado en tendencias modernas de dark mode
- Componentes UI basados en shadcn/ui
- Sistema de animaciones con Motion (Framer Motion)

---

## 📞 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la [documentación](docs/)
2. Abre un [issue](https://github.com/sebasrtianlandab/proyectologin/issues)
3. Contacta al equipo de desarrollo

---

<p align="center">
  Hecho con ❤️ por el equipo de desarrollo
</p>