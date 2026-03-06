# Manual de estilos y marca – VIISION ERP

Documento de referencia para alinear el producto ERP con la identidad visual de **VIISION**. Sirve como guía sin depender del proyecto de referencia (página oficial). Actualizado en cada fase de implementación.

---

## 1. Identidad

| Elemento | Valor |
|----------|--------|
| **Producto / Marca** | VIISION |
| **Producto en app** | VIISION ERP |
| **Eslogan** | Transformamos procesos con tecnología accesible. |
| **Tipo** | Empresa tecnológica y consultora digital |

---

## 2. Paleta de color (VIISION)

Escala de marca usada en la página oficial y migrada al ERP. Los tokens están en `src/styles/theme.css` y se usan vía variables CSS y clases Tailwind.

### 2.1 Escala completa (hex)

| Token | Hex | Uso recomendado |
|-------|-----|------------------|
| `--viision-50`  | `#eeefff` | Fondos muy suaves, hover muy sutil |
| `--viision-100` | `#e0e2ff` | Fondos suaves |
| `--viision-200` | `#c7cbff` | Bordes suaves, iconos secundarios |
| `--viision-300` | `#a5aaff` | Iconos, texto secundario acento |
| `--viision-400` | `#8185ff` | **Nav activo, enlaces, texto acento** |
| `--viision-500` | `#6164ff` | Botones secundarios, bordes CTA |
| `--viision-600` | `#3413fc` | **Color principal de marca** – botones primarios, logo, subrayados |
| `--viision-700` | `#2c10d9` | Hover primario |
| `--viision-800` | `#230db3` | Estados activos oscuros |
| `--viision-900` | `#1c0a8c` | Bordes/sombras muy sutiles |
| `--viision-950` | `#130766` | Acentos en fondos oscuros |

### 2.2 Uso en Tailwind

Las variables se exponen en `@theme inline` como `--color-viision-*`. Ejemplos:

- `bg-viision-500`, `bg-viision-600`
- `text-viision-400`, `text-viision-600`
- `border-viision-500`, `border-viision-600`
- `shadow-viision-600/10`, `hover:shadow-viision-600/20`

### 2.3 Variables semánticas del tema (theme.css)

El tema oscuro por defecto mapea así:

| Variable | Uso | Valor por defecto (oscuro) |
|----------|-----|----------------------------|
| `--background` | Fondo general | `#0a0a0a` |
| `--foreground` | Texto principal | `#fafafa` |
| `--card` | Cards, header | `#141414` |
| `--primary` | Botones primarios, logo, acentos | `#3413fc` (viision-600) |
| `--primary-foreground` | Texto sobre primary | `#ffffff` |
| `--muted` | Fondos sutiles | `#262626` |
| `--muted-foreground` | Texto secundario | `#a3a3a3` |
| `--border` | Bordes | `#262626` |
| `--sidebar` | Fondo sidebar | `#0f0f0f` |
| `--sidebar-primary` | Acento en sidebar | `#3413fc` |
| `--chart-1` … `--chart-5` | Recharts | Tonos viision (#6164ff, #8185ff, #3413fc, …) |

---

## 3. Tipografía

| Elemento | Valor |
|----------|--------|
| **Familia** | **Inter** (Google Fonts) |
| **Pesos usados** | 400 (normal), 500 (medium), 600 (semibold), 700 (bold) |
| **Carga** | `index.html`: preconnect + link a Google Fonts |
| **Aplicación** | `theme.css` → `html { font-family: 'Inter', … }` |

Tamaños y pesos base (en `theme.css` @layer base) se mantienen; los componentes pueden sobrescribir con utilidades Tailwind.

---

## 4. Tema oscuro por defecto

- **:root** en `theme.css` define el tema **oscuro** como predeterminado (fondos #0a0a0a / #141414, texto claro, primary = viision-600).
- Opcional: añadir clase **`.light`** al `<html>` para tema claro; los tokens ya están definidos en `.light` en `theme.css`.
- **`.dark`** se mantiene por compatibilidad y replica los mismos valores que `:root` oscuro.

---

## 5. Componentes y patrones de UI

### 5.1 Navegación (sidebar / header)

- **Ítem activo:** fondo suave viision + texto viision-400 + borde izquierdo viision-500 (ej. `bg-viision-600/15 text-viision-400 border-l-2 border-viision-500`).
- **Ítem inactivo:** texto `sidebar-foreground`, hover `sidebar-accent`.
- **Grupos de navegación:** etiquetas en `text-muted-foreground`.

### 5.2 Botones

- **Primario:** `bg-primary text-primary-foreground` (viision-600 + blanco).
- **Secundario / outline:** borde y texto en viision cuando sea acento de marca.

### 5.3 Cards y contenedores

- Fondo: `bg-card` o `bg-background`.
- Bordes: `border-border`; acentos opcionales con `border-viision-600/30` o `shadow-viision-600/10` para “glow” sutil (ERP: uso moderado).

### 5.4 Gráficos (Recharts)

- Usar `--chart-1` a `--chart-5` (ya en tonos VIISION) en series y ejes para mantener coherencia con la marca.

---

## 6. Assets migrados (referencia → ERP)

| Asset | Origen | Destino en ERP | Uso |
|-------|--------|-----------------|-----|
| Logo | REFERNCIAS/pageViision/public/logo/viision-logo.png | `public/logo/viision-logo.png` | Login (arriba del card), sidebar |
| ShinyText | REFERNCIAS/pageViision/components/ui/ShinyText | `src/app/components/ui/ShinyText.tsx` + `ShinyText.css` | Login: texto "VIISION"; sidebar: "VIISION ERP" |

### 6.1 Ubicación del logo

- **Archivo:** `public/logo/viision-logo.png`.
- **Referencia en código:** siempre desde la raíz pública, ej. `src="/logo/viision-logo.png"` (no usar rutas a `REFERNCIAS`).
- **Dónde se usa:** pantalla de login (arriba del card) y cabecera del sidebar del ERP. Si se añade favicon, puede reutilizarse este asset o una variante en `public/`.

### 6.2 Cuándo usar ShinyText

- **Login:** título de marca "VIISION" encima del card (obligatorio para identidad).
- **Sidebar:** título "VIISION ERP" en la cabecera del panel (obligatorio).
- **Evitar:** en títulos de sección dentro del contenido, en botones o en textos largos; reservar para la marca principal (1–2 apariciones por pantalla como máximo).

### 6.3 Efectos sutiles (borde / glow) – clase `card-glow`

- **Implementado:** variante sutil tipo StarBorder (solo borde + glow con CSS, sin animaciones pesadas) en `theme.css` como clase **`.card-glow`**.
- **Qué hace:** borde fino viision-600 con baja opacidad y sombra suave en tono marca; en `:hover` el borde y la sombra se refuerzan un poco.
- **Cuándo usar:** para resaltar cards principales sin saturar:
  - Card de login (obligatorio).
  - Cards destacadas del dashboard (ej. Acceso Rápido, Actividad reciente, bloques de KPIs).
  - Cards principales en otras vistas (ej. Tráfico en el Tiempo en Analítica, Registro de Eventos en Auditoría, Auditoría de Gestión Interna).
- **Cómo usar:** añadir la clase `card-glow` al contenedor de la card (junto a `rounded-xl`, `border`, `shadow-sm`, etc.). No combinar con `border-viision-600/30` ni `shadow-viision-600/10` en la misma card para evitar duplicar el efecto.

---

## 7. Efectos y componentes especiales (referencia)

Resumen de lo que existe en la página oficial y cómo se usa (o se usará) en el ERP:

| Efecto / componente | En referencia | En ERP (plan) |
|---------------------|----------------|---------------|
| **ShinyText** | Logo “VIISION” en navbar y hero | Fase 2: título “VIISION” en login; Fase 4: título “VIISION ERP” en sidebar |
| **StarBorder** | Botón “Descubre más” (borde glow) | Opcional: variante sutil para CTA principal de login (Fase 3) |
| **Aurora (WebGL)** | Fondo hero | No migrar; en ERP usar gradientes CSS o blurs sutiles si hace falta |
| **Subrayado acento** | Títulos de sección (línea viision-600) | Títulos de vistas cuando se unifique (ej. `border-b-2 border-viision-600`) |

---

## 8. Módulos no modificados en la primera etapa

Para la presentación inicial, **no se cambia la estructura ni la lógica** de estos módulos; solo heredan el tema (colores/fondo) vía variables globales:

- Recursos Humanos (CRM / RRHH)
- Gestión interna
- Analítica web
- Auditoría

Cualquier cambio de layout o contenido en esos módulos queda fuera del alcance de la primera fase de alineación de marca.

---

## 9. Resumen de cambios – Fase 1

- **theme.css:** Paleta VIISION (--viision-50 … --viision-950), tema oscuro por defecto en `:root`, variables semánticas (background, primary, sidebar, chart-*, etc.), `.light` y `.dark` definidos.
- **Tailwind:** Colores viision expuestos en `@theme inline` como `--color-viision-*`.
- **Tipografía:** Inter cargada en `index.html`, aplicada en `theme.css` a `html`.
- **index.html:** Título “VIISION ERP · Panel de gestión”, `lang="es"`, preconnect y link a Google Fonts.
- **ERPLayout:** Uso de tokens (bg-background, bg-sidebar, text-foreground, text-viision-400, border-viision-500, etc.); texto “VIISION ERP” y “Panel de gestión” en el sidebar.

---

### Fase 2 + 3 (Login con marca)
- Logo en `public/logo/viision-logo.png`; ShinyText en `src/app/components/ui/ShinyText.tsx` + `.css`.
- LoginView: logo + "VIISION" con ShinyText arriba; fondo y card con paleta viision.

*Documento vivo: se actualizará en Fases 4–6.*
