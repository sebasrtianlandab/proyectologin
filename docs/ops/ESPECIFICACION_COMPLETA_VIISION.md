# Especificación completa – Ecosistema VIISION

Documento único que define todo lo conceptualizado: plataforma (landing), ERP, base de datos y flujos.  
**Orden de ejecución:** primero se implementa todo el front-end de la **plataforma** en este proyecto (con datos mockeados si hace falta); cuando la plataforma esté cubierta, se pasa al backend y al proyecto **ERP**.

---

## Orden de ejecución

| Fase | Dónde | Qué |
|------|--------|-----|
| **1** | **Este proyecto (plataforma)** | Front-end completo: modal de cotización, selección de módulos (mockeado), botones Cotizar/Ver Demo, quitar formulario contacto, registro ampliado, flujo login preparado, etc. La plataforma debe funcionar de punta a punta; si no hay backend, se usa data mockeada. |
| **2** | **Backend + proyecto ERP** | Base de datos, APIs, y en el repo del ERP: front-end del módulo Gestión de ventas (tabs, cotizaciones, métricas, servicios). |

---

# PARTE A – ESTE PROYECTO (PLATAFORMA / LANDING)

Todo lo que se tiene que realizar en el repositorio de la plataforma (viision-platform).

---

## A.1 Front-end – Plataforma

Implementar en este proyecto todo lo siguiente. Si el backend aún no existe, usar datos mockeados (módulos por servicio, precios, envío de cotización simulado).

### A.1.1 Vista de un servicio (ProductDetail)

- **Botón principal:** «Cotizar»  
  - Estilo: destacado (color viision, como el actual «Ver Demo»).  
  - Al hacer clic: si el usuario **no** está logueado → redirigir a **login** o **registro** con return URL para volver a esta página del servicio y abrir el modal después. Si está logueado → abrir el **modal de cotización**.
- **Botón secundario:** «Ver Demo»  
  - Estilo: más opaco/outline (como el actual «Solicitar información»).  
  - Lleva a la sección de contacto o a un video/demo (por ahora puede quedar sin destino final).
- **Eliminar** el botón «Solicitar información».

### A.1.2 Modal de cotización

- **Aparición:** overlay sobre la página; fondo de la plataforma en **blur** y gradiente oscuro semitransparente.
- **Contenido:**
  - Nombre del **servicio** que se está cotizando.
  - **Datos del usuario** en solo lectura (nombre, email, teléfono, empresa) — no se piden de nuevo.
  - **Sección de módulos:** lista o cards de los **módulos disponibles para ese servicio**. Cada ítem muestra: nombre del módulo, descripción breve, **precio**. El usuario **selecciona** los que quiere (checkbox o card seleccionable).
  - **Cálculo en tiempo real:** subtotal / **total** según los módulos elegidos.
  - Campo opcional: **mensaje o necesidades** (textarea).
  - Botón **«Confirmar cotización»**: al pulsar, se simula/envía la cotización (mockeado o API); se muestra un **resumen final** en el mismo modal (como “detalle de la cotización”: servicio, módulos con precio, total, datos del cliente).
  - Botón **«Abrir WhatsApp»** con mensaje prearmado (incluir servicio, total y correo del usuario). Puede mostrarse después de confirmar o junto al resumen.
- **Datos para el modal:** si hay backend, se piden servicios y módulos por servicio desde API; si no, se usan **datos mockeados** (lista de módulos por servicio y precios estándar definidos en este documento, sección General).

### A.1.3 Listado de servicios (ProductCard)

- Mantener botón **«Ver más detalles»** (navega al detalle del servicio).
- Añadir botón **«Cotizar»**:  
  - Sin sesión → redirigir a login/registro con return URL al servicio correspondiente (para abrir el modal al volver).  
  - Con sesión → navegar al detalle del producto y abrir el modal de cotización (o abrir el modal desde la card si se prefiere en la implementación).

### A.1.4 Formulario de contacto

- **Eliminar** por completo la sección del formulario de contacto (#contacto) en la página de servicios. Todo el funnel pasa por **registro + cotización**.

### A.1.5 Registro

- Campos actuales: nombre completo, email, contraseña.
- **Añadir** (opcionales): **teléfono**, **empresa**.
- Sin DNI.
- Restricciones ya existentes (ej. dominio @senati.pe) se mantienen según criterio del negocio.

### A.1.6 Login

- Comportamiento a implementar (aunque el redirect real al ERP exista después):  
  - Si el correo es de **dominio de la empresa** (ej. @viision.com) → usuario **empleado** → en el futuro redirigir al **ERP**; mientras no exista ERP, se puede redirigir al home o a una ruta placeholder.  
  - Si el correo es **Gmail u otro** (no dominio empresa) → usuario **cliente** → quedarse en la **landing** (redirigir al home o a la página de servicios).
- En front-end: dejar la lógica de **diferenciación por dominio** preparada (variable de entorno o lista de dominios de empresa).

### A.1.7 Eventos / analítica (preparación en front)

- Donde aplique, **disparar** eventos que más adelante el backend persistirá (por ahora se pueden dejar como llamadas a una función o a un endpoint mock):  
  - `page_view` (vista de página).  
  - `click_servicio` (clic en un servicio, ej. Ver detalles o en la card).  
  - `click_cotizar` (clic en Cotizar).  
  - `cotizacion_confirmada` (después de confirmar en el modal).  
- Incluir en el evento: session_id o user_id si hay sesión, page_path, service_id si aplica. Así cuando exista backend y tabla `events`, solo se conecta el envío real.

### A.1.8 Resumen de entregables front-end (este proyecto)

- ProductDetail: Cotizar (principal), Ver Demo (secundario), sin «Solicitar información».
- ProductCard: Ver más detalles + Cotizar (con redirect a login si no hay sesión).
- Modal de cotización: overlay blur, datos usuario solo lectura, selección de módulos con precios, total en tiempo real, mensaje opcional, confirmar → resumen, WhatsApp.
- Registro: + teléfono y empresa opcionales.
- Login: diferenciación por dominio (empleado vs cliente) y redirect preparado.
- Sin formulario de contacto.
- Eventos de analítica preparados (mock o llamada futura a API).

---

## A.2 Consumos (APIs que usará la plataforma cuando existan)

No se implementan en este proyecto; el backend los expondrá. La plataforma los consumirá cuando estén disponibles.

- Registro de usuario (ampliado con phone, company).
- Login (respuesta con user + redirect según rol/dominio).
- Listado de servicios (con módulos y precios por servicio).
- Creación de cotización (quote + quote_modules + total).
- Registro de eventos (page_view, click_servicio, click_cotizar, cotizacion_confirmada).

---

# PARTE B – PROYECTO ERP

Todo lo que se tiene que realizar en el repositorio del ERP (no en la plataforma).

---

## B.1 Front-end – ERP

### B.1.1 Módulo Gestión de ventas

- **Sección / Tab Cotizaciones**
  - Listado de cotizaciones con **filtros**: servicio, estado, rango de fechas.
  - Columnas: fecha, cliente (nombre, email, teléfono, empresa), servicio, **total**, estado (editable por el ejecutivo), observaciones.
  - Detalle de una cotización: datos del usuario, mensaje, **módulos elegidos con precios**, total, observaciones del asesor, oferta comercial (opcional).
  - Acciones: ver, editar (estado, observaciones), eliminar si aplica.
  - **Informe de la venta:** informe o vista de detalle de la cotización (módulos, total, estado, historial si se implementa).

- **Sección / Tab Monitoreo (analítica)**
  - Alimentada por la tabla de **eventos** (events): cantidad de clicks por tipo, clicks por usuario/sesión, clicks por servicio, cotizaciones confirmadas por periodo.
  - Objetivo: medir uso de la landing y rendimiento de ventas.

- **Sección Servicios**
  - CRUD de los **servicios** que se muestran en la landing: título, descripción breve, categoría/etiqueta, tecnologías (select desde catálogo), **módulos** (selección de piezas del catálogo con orden), beneficios (select desde catálogo).
  - Los módulos son “piezas” predefinidas; el servicio solo elige cuáles mostrar y en qué orden.
  - Estadísticas (500+ empresas, etc.) pueden ser globales para todos los servicios.

### B.1.2 Login y acceso ERP

- Solo usuarios con **dominio de empresa** (o rol empleado/admin) deben poder acceder al ERP.
- Tras login con dominio empresa, redirigir al dashboard/sistema interno (no a la landing).

---

## B.2 Backend / APIs (proyecto ERP o backend compartido)

- APIs para el ERP: listado y detalle de cotizaciones, actualización de estado y observaciones, listado de eventos para Monitoreo, CRUD de servicios (y catálogos de módulos, tecnologías, beneficios).
- Envío de **email** al usuario cuando se crea una cotización (“Tu cotización está pendiente” con detalle).
- Notificación o sincronización en tiempo real con el ERP cuando se crea una cotización desde la plataforma (según arquitectura: misma BD, cola, o API llamada desde el backend de la plataforma).

---

# PARTE C – GENERAL

Base de datos, reglas de negocio, catálogos y flujos compartidos. El backend (en el proyecto que corresponda) implementa esto; la plataforma y el ERP lo consumen.

---

## C.1 Reglas de negocio

- **Una sola base de datos** para la plataforma y el ERP.
- **Login:** si `email` pertenece a dominio de empresa (configurado) → empleado → redirect ERP. Si no → cliente → redirect landing.
- **Cotización:** se crea con user_id, service_id, módulos elegidos (quote_modules), total (suma de precios de módulos), mensaje opcional, estado inicial «pendiente». No se piden de nuevo nombre, email ni empresa.
- **Cierre de venta:** vía WhatsApp y/o registro en ERP (estado, observaciones, oferta comercial).
- No existe tabla **leads**; el funnel es registro + cotización.

---

## C.2 Catálogo de módulos (piezas) y precios estándar

Precios en moneda local (ej. PEN), de referencia. Ajustar luego por proyecto.

| code | name | description | precio_estandar |
|------|------|-------------|-----------------|
| ventas_crm | Ventas / CRM | Pipeline, contactos, seguimiento, reportes de ventas | 1 200 |
| financiero | Financiero / Contabilidad | Cuentas por cobrar y pagar, estados financieros, conciliación | 1 500 |
| inventarios | Inventarios | Stock, almacenes, alertas, trazabilidad | 1 000 |
| compras_proveedores | Compras y proveedores | Órdenes de compra, proveedores, cotizaciones de compra | 1 100 |
| rrhh | Recursos humanos | Nómina, asistencia, evaluación, reclutamiento | 1 300 |
| facturacion | Facturación | Emisión de comprobantes, series, integración tributaria | 800 |
| logistica_transporte | Logística / Transporte | Rutas, entregas, flota, despacho | 1 400 |
| ecommerce_tienda | E-commerce (tienda) | Catálogo, carrito, checkout, pedidos online | 1 600 |
| bi_reportes | BI / Reportes | Dashboards, reportes gerenciales, exportación | 1 000 |

### Asignación de módulos por servicio

- **ERP (code: erp):** financiero, inventarios, rrhh, compras_proveedores, ventas_crm, facturacion, logistica_transporte, bi_reportes.
- **CRM (code: crm):** ventas_crm, bi_reportes, facturacion.
- **E-commerce (code: ecommerce):** ecommerce_tienda, inventarios, facturacion, bi_reportes.
- **BI (code: bi):** bi_reportes.

---

## C.3 Esquema de base de datos

El backend debe implementar esta estructura para que la plataforma y el ERP funcionen con datos reales.

### C.3.1 Usuarios

```text
users
  id                UUID PK
  full_name         VARCHAR NOT NULL
  email             VARCHAR UNIQUE NOT NULL
  password_hash     VARCHAR
  phone             VARCHAR
  company           VARCHAR
  role              VARCHAR   -- 'client' | 'employee' | 'admin'
  origin            VARCHAR   -- 'landing' | 'erp'
  email_domain      VARCHAR   -- para redirect empleado vs cliente
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
```

### C.3.2 Catálogos y servicios

```text
categories
  id                UUID PK
  name              VARCHAR NOT NULL

technologies
  id                UUID PK
  name              VARCHAR NOT NULL

module_templates
  id                UUID PK
  code              VARCHAR UNIQUE NOT NULL
  name              VARCHAR NOT NULL
  description       TEXT
  precio_estandar   DECIMAL(12,2) NOT NULL
  sort_order        INT DEFAULT 0

benefit_templates
  id                UUID PK
  text              VARCHAR NOT NULL

services
  id                UUID PK
  code              VARCHAR UNIQUE NOT NULL
  name              VARCHAR NOT NULL
  short_description TEXT
  category_id       UUID FK -> categories
  created_at       TIMESTAMPTZ
  updated_at       TIMESTAMPTZ

service_technologies
  service_id        UUID FK -> services
  technology_id     UUID FK -> technologies
  sort_order        INT
  PRIMARY KEY (service_id, technology_id)

service_modules
  service_id        UUID FK -> services
  module_template_id UUID FK -> module_templates
  sort_order        INT
  PRIMARY KEY (service_id, module_template_id)

service_benefits
  service_id        UUID FK -> services
  benefit_template_id UUID FK -> benefit_templates
  sort_order        INT
  PRIMARY KEY (service_id, benefit_template_id)
```

### C.3.3 Cotizaciones

```text
quotes
  id                UUID PK
  user_id           UUID FK -> users NOT NULL
  service_id        UUID FK -> services NOT NULL
  message           TEXT
  status            VARCHAR NOT NULL DEFAULT 'pendiente'
  total             DECIMAL(12,2) NOT NULL
  observations      TEXT
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

quote_modules
  id                UUID PK
  quote_id          UUID FK -> quotes NOT NULL
  module_template_id UUID FK -> module_templates NOT NULL
  unit_price        DECIMAL(12,2) NOT NULL
  UNIQUE (quote_id, module_template_id)
```

- `quotes.total` = suma de `quote_modules.unit_price` al crear (o recalculado desde quote_modules).

### C.3.4 Eventos (analítica web)

```text
events
  id                UUID PK
  session_id        VARCHAR
  user_id           UUID FK -> users NULLABLE
  event_type        VARCHAR NOT NULL
  page_path         VARCHAR
  service_id        UUID FK -> services NULLABLE
  metadata          JSONB
  created_at        TIMESTAMPTZ
```

- `event_type`: por ejemplo 'page_view', 'click_servicio', 'click_cotizar', 'cotizacion_confirmada'.

---

## C.4 Relación con requerimientos del profesor (Gestión de ventas)

| Requerimiento | Cómo se cumple |
|---------------|----------------|
| Módulo Gestión de ventas | ERP: Módulo Ventas (Cotizaciones + Monitoreo + Servicios). |
| Tab Monitoreo (analítica ventas/web) | Tab «Monitoreo» en ERP alimentada por tabla `events`. |
| Tab Ventas (registrar, editar, eliminar, informe) | Tab «Ventas»/Cotizaciones: CRUD en `quotes`; «Informe de la venta» = detalle de cotización. |
| Landing donde vendo productos | Landing de servicios; «venta» = cotización con módulos y precio. |
| Click en producto = evento | Eventos `click_servicio`, `click_cotizar`; acciones en landing → `events`. |
| Cantidad de veces cliente da clicks | Métrica desde `events` (por user_id o session_id). |
| Empleado = dominio; cliente = Gmail | Login: redirect por dominio (empleado → ERP, cliente → landing). |
| Dominio propio → sistema de gestión; Gmail → landing | Misma regla de redirect. |

---

## Resumen de segmentación

| Qué | Dónde |
|-----|--------|
| Modal cotización, botones Cotizar/Ver Demo, registro con teléfono/empresa, login por dominio, eliminación formulario contacto, eventos (mock o real) | **Este proyecto (plataforma)** – front-end |
| Módulo Gestión de ventas (tabs Cotizaciones, Monitoreo, Servicios), vistas ERP, informe de cotización | **Proyecto ERP** – front-end |
| Base de datos, APIs de registro/login/servicios/cotizaciones/eventos, email de cotización, lógica de redirect | **General / Backend** (implementado en backend que consumen plataforma y ERP) |
