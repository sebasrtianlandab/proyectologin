Este es un resumen técnico estructurado del plan de desarrollo para el Sistema MVC con OTP y Auditoría, diseñado para que sirva como hoja de ruta funcional en tu integración con Antigravity. El enfoque principal es replicar la lógica de negocio y seguridad sin alterar las tecnologías que ya estás utilizando en tu proyecto actual.

1. Arquitectura y Lógica de Operación
El sistema se basa en el patrón Modelo-Vista-Controlador (MVC), donde la persistencia de datos se maneja a través de archivos JSON. El flujo de trabajo sugerido para replicar es el siguiente:
+1


Vista: El usuario interactúa con la interfaz (ej. formulario de registro).


Controlador: Procesa la solicitud, valida datos y coordina acciones.


Modelo: Gestiona la lectura y escritura de información en los archivos JSON (users.json, audit.json).

2. Requerimientos Técnicos por Módulo
A. Gestión de Usuarios y Acceso

Registro: Debe capturar Nombre y Correo Electrónico. Al registrar, se debe crear el registro en el JSON y disparar automáticamente el sistema OTP.
+2


Seguridad de Sesión: Implementar un middleware que verifique si el usuario está autenticado antes de permitir el acceso al Panel de Control (Dashboard).
+1


Cierre de Sesión: Función para destruir la sesión activa y redirigir al Login.

B. Sistema de Verificación OTP (One-Time Password)

Generación: Crear códigos de 6 dígitos con una fecha de expiración vinculada al correo del usuario.


Validación: Pantalla específica para ingresar el código. El sistema debe validar que el código coincida y que no haya expirado antes de crear la sesión definitiva (user_id).
+2

C. Sistema de Auditoría de Eventos
Es crucial para el monitoreo de seguridad registrar los siguientes eventos en un archivo audit.json:
+1


Eventos a trackear: Registros nuevos, envíos de OTP, intentos fallidos y logins exitosos.


Metadatos requeridos: Tipo de evento, Email del usuario, dirección IP, fecha/hora y User Agent (navegador/dispositivo).

3. Composición de Interfaz (Referencia para Antigravity)
Para el diseño en Antigravity, puedes basarte en la estructura visual propuesta en el documento:

Pantalla	Elementos Clave
Login / Registro	
Campos limpios para Nombre y Correo, botón de acción destacado y enlace de alternancia entre pantallas.
+1

Verificación	
Input para 6 dígitos, opción de "Reenviar código" y confirmación del correo al que se envió.
+1

Dashboard	
Saludo personalizado, visualización de datos (Nombre, Correo, Fecha de registro) y botón de Logout.

Auditoría	
Tabla con historial de actividad y estadísticas básicas (total de logins, IPs únicas).

4. Estrategia de Implementación Recomendada
Para asegurar la estabilidad del proyecto en Antigravity, se sugiere seguir un desarrollo por fases:


Fase 1: Validar el enrutamiento y la estructura base.


Fase 2: Establecer la lectura/escritura en archivos JSON.


Fase 3: Implementar el flujo de registro y generación de OTP.


Fase 4: Activar la validación de seguridad y protección de rutas.


Fase 5: Integrar el sistema de auditoría final.