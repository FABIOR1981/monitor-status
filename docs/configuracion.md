# Configuración y Personalización

Guía completa para ajustar y personalizar el monitor según tus necesidades.

---

## Configurar Servicios a Monitorear

### Archivo: `data/webs.json`

```json
[
  {
    "nombre": "Mi API",
    "url": "https://api.miempresa.com/health",
    "grupo": "CRITICO",
    "orden": 1
  },
  {
    "nombre": "Sitio Web",
    "url": "https://www.miempresa.com",
    "grupo": "PRODUCCION",
    "orden": 2
  },
  {
    "nombre": "Panel Admin",
    "url": "https://admin.miempresa.com",
    "grupo": "INTERNO",
    "orden": 3
  }
]
```

### Propiedades

| Campo    | Tipo   | Requerido | Descripción                             |
| -------- | ------ | --------- | --------------------------------------- |
| `nombre` | String | ✅        | Nombre visible del servicio             |
| `url`    | String | ✅        | URL completa a verificar (con https://) |
| `grupo`  | String | ✅        | Categoría para agrupar servicios        |
| `orden`  | Number | ✅        | Posición en la tabla (menor = arriba)   |

### Recomendaciones

- **Grupos**: Usa categorías lógicas como `CRITICO`, `PRODUCCION`, `STAGING`, `DESARROLLO`
- **Orden**: Coloca servicios críticos primero (orden: 1, 2, 3...)
- **URLs**: Preferentemente endpoints `/health` o `/ping` sin autenticación
- **Límite**: No exceder 20-30 servicios (impacto en rendimiento)

---

## Ajustar Umbrales de Latencia

### Archivo: `js/config.js`

```javascript
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300, // < 300ms
  RAPIDO: 500, // 300-500ms
  NORMAL: 800, // 500-800ms
  LENTO: 1500, // 800-1500ms
  CRITICO: 3000, // 1500-3000ms
  RIESGO: 5000, // 3000-5000ms
  // > 5000ms = RIESGO_EXTREMO
};
```

### ¿Cuándo modificar?

**Servicios internos/corporativos:**

```javascript
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 200,
  RAPIDO: 400,
  NORMAL: 700,
  LENTO: 1200,
  CRITICO: 2500,
  RIESGO: 4000,
};
```

Expectativas más estrictas para redes internas rápidas.

**APIs de terceros/microservicios distribuidos:**

```javascript
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 500,
  RAPIDO: 800,
  NORMAL: 1200,
  LENTO: 2000,
  CRITICO: 4000,
  RIESGO: 7000,
};
```

Tolerancia mayor para servicios externos.

> 💡 Ver [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md) para entender los valores por defecto.

---

## Cambiar Intervalo de Monitoreo

### Archivo: `netlify/functions/check-status.js`

Por defecto el monitoreo se ejecuta cada **5 minutos**.

Para cambiar el intervalo, modifica la configuración de Netlify Scheduled Functions o usa un servicio externo (cron-job.org, GitHub Actions) para activar el endpoint.

**⚠️ Importante**: Intervalos muy cortos pueden:

- Exceder límites de Netlify Functions
- Sobrecargar servicios monitoreados
- Generar falsos positivos por rate limiting

**Recomendado**: 3-10 minutos

---

## Agregar Nuevos Idiomas

### 1. Crear archivo de idioma

Copia `lang/i18n_es.js` a `lang/i18n_XX.js` (donde XX es el código ISO del idioma):

```bash
# Ejemplo: Francés
cp lang/i18n_es.js lang/i18n_fr.js
```

### 2. Traducir contenido

```javascript
// lang/i18n_fr.js
const I18N_FR = {
  titulo: 'Moniteur de Disponibilité',
  estado: 'État',
  latencia: 'Latence',
  promedio: 'Moyenne',
  // ... traducir todos los campos
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18N_FR;
}
```

### 3. Registrar en configuración

**Archivo: `js/config.js`**

```javascript
const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
  fr: 'lang/i18n_fr.js', // Nuevo idioma
  de: 'lang/i18n_de.js', // Alemán
  pt: 'lang/i18n_pt.js', // Portugués
};

const IDIOMA_DEFAULT = 'es'; // Cambiar si lo deseas
```

### 4. Usar el nuevo idioma

```
https://tu-monitor.netlify.app/?lang=fr
```

---

## Personalizar Temas Visuales

### Crear un nuevo tema

1. Copia `css/monitor_def.css` a `css/monitor_TUNOM.css`
2. Modifica las variables CSS:

```css
/* css/monitor_TUNOM.css */
:root {
  --bg: #1a1a2e; /* Fondo principal */
  --container-bg: #16213e; /* Fondo de contenedores */
  --text: #eaeaea; /* Color de texto */
  --accent: #0f3460; /* Color de acento */
  --header-bg: #0f3460; /* Fondo del header */
  --border: #2d3748; /* Bordes */

  /* Estados de latencia */
  --muy-rapido: #10b981;
  --rapido: #22c55e;
  --normal: #84cc16;
  --lento: #eab308;
  --critico: #f97316;
  --riesgo: #ef4444;
  --riesgo-extremo: #dc2626;
  --caida: #991b1b;
}
```

3. Registrar en `js/config.js`:

```javascript
const TEMA_TUNOM = 'tunom';

const TEMA_FILES = {
  def: 'css/monitor_def.css',
  osc: 'css/monitor_osc.css',
  pro: 'css/monitor_pro.css',
  pro2: 'css/monitor_pro2.css',
  min: 'css/monitor_min.css',
  tunom: 'css/monitor_TUNOM.css', // Tu nuevo tema
};
```

4. Acceder:

```
https://tu-monitor.netlify.app/?tema=tunom
```

### Agregar alternancia claro/oscuro

Si creas dos variantes (clara y oscura), agrégalas a `TEMA_TOGGLE_PAIRS`:

```javascript
const TEMA_TOGGLE_PAIRS = {
  [TEMA_DEFAULT]: TEMA_OSC,
  [TEMA_PRO2]: TEMA_PRO,
  [TEMA_OSC]: TEMA_DEFAULT,
  [TEMA_PRO]: TEMA_PRO2,
  ['tunom_light']: 'tunom_dark', // Tu tema claro → oscuro
  ['tunom_dark']: 'tunom_light', // Tu tema oscuro → claro
};
```

---

## Configurar Detección de Fallo Global

### Archivo: `js/script.js`

Función `detectarFalloGlobal()`:

```javascript
function detectarFalloGlobal(webs) {
  const websCriticas = webs.filter((w) =>
    w.grupo.toUpperCase().includes('CRITICO')
  );
  const websCriticasCaidas = websCriticas.filter((w) => !w.online);

  const websSuperlentas = webs.filter((w) => w.latencia > 9000);

  const todosCriticosCaidos =
    websCriticas.length > 0 &&
    websCriticasCaidas.length === websCriticas.length;

  const mayoriaSuperlenta =
    webs.length > 0 && websSuperlentas.length / webs.length >= 0.8;

  return todosCriticosCaidos || mayoriaSuperlenta;
}
```

### Ajustar condiciones

**Cambiar umbral de "superlento":**

```javascript
const websSuperlentas = webs.filter((w) => w.latencia > 12000); // 12 segundos
```

**Cambiar porcentaje de mayoría:**

```javascript
const mayoriaSuperlenta = websSuperlentas.length / webs.length >= 0.7; // 70%
```

**Agregar más condiciones:**

```javascript
const demasiasErrores =
  webs.filter((w) => !w.online).length / webs.length >= 0.5;
return todosCriticosCaidos || mayoriaSuperlenta || demasiasErrores;
```

---

## Configuración de Netlify

### Archivo: `netlify.toml`

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### Variables de entorno (opcional)

Si necesitas configuración sensible (API keys, tokens):

1. En Netlify: **Site settings** → **Environment variables**
2. Agregar variables (ej: `MONITORING_API_KEY`)
3. Acceder en `check-status.js`:

```javascript
const apiKey = process.env.MONITORING_API_KEY;
```

---

## Desarrollo Local

### Requisitos

- Node.js 14+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone <tu-repo>
cd monitor-status-test

# Instalar dependencias
npm install

# Instalar Netlify CLI (si no lo tienes)
npm install -g netlify-cli
```

### Ejecutar localmente

```bash
netlify dev
```

Accede en: `http://localhost:8888`

### Probar funciones serverless

```bash
netlify functions:serve
```

Las funciones estarán en: `http://localhost:9999/.netlify/functions/check-status`

---

## Configuración Avanzada de Historial

### Archivo: `js/script.js`

Variable `maxRegistros`:

```javascript
const maxRegistros = Math.min(Math.max(horas * 12, 12), 108);
```

**Fórmula**: `horas × 12` mediciones/hora (máximo 108 = 9 horas)

### Permitir más de 9 horas

1. Cambiar límite en `index.html`:

```html
<select id="horas-historial">
  <option value="1">1 hora</option>
  <!-- ... -->
  <option value="12">12 horas</option>
  <option value="24">24 horas</option>
</select>
```

2. Ajustar máximo en `script.js`:

```javascript
const maxRegistros = Math.min(Math.max(horas * 12, 12), 288); // 24h × 12
```

**⚠️ Advertencia**: Más de 12 horas puede saturar localStorage y afectar rendimiento.

---

## Personalizar Textos y Etiquetas

### Archivo: `lang/i18n_es.js`

Modifica cualquier texto visible:

```javascript
const I18N_ES = {
  // Títulos
  titulo: 'Monitor de Disponibilidad',
  subtitulo: 'Servicios en Tiempo Real',

  // Estados personalizados
  estado_muy_rapido: '🚀 Súper Rápido',
  estado_rapido: '⚡ Veloz',
  // ...

  // Mensajes
  ultima_actualizacion: 'Última verificación',
  sin_datos: 'Esperando primera medición...',
  // ...
};
```

---

## Resumen de Archivos Configurables

| Archivo                             | Qué configura                        |
| ----------------------------------- | ------------------------------------ |
| `data/webs.json`                    | Servicios a monitorear               |
| `js/config.js`                      | Umbrales, temas, idiomas, constantes |
| `js/script.js`                      | Lógica de detección y comportamiento |
| `lang/i18n_*.js`                    | Textos e idiomas                     |
| `css/monitor_*.css`                 | Temas visuales                       |
| `netlify.toml`                      | Despliegue y funciones               |
| `netlify/functions/check-status.js` | Lógica de verificación HTTP          |

---

¿Necesitas ayuda con alguna configuración específica? Revisa [resolución de problemas.md](resolución%20de%20problemas.md).
