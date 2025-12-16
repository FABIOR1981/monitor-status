// Umbrales de latencia (en milisegundos)
// Estos valores sirven para clasificar qué tan rápido o lento responde un servicio.
// Si querés saber más, mirá el archivo docs/justificacion_rangos_latencia.md
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300, // Excelente: responde casi al instante
  RAPIDO: 500, // Bueno: rápido, se nota poco el retraso
  NORMAL: 800, // Aceptable: algo lento pero usable
  LENTO: 1500, // Lento: se nota el retraso
  CRITICO: 3000, // Muy lento: ya es un problema serio
  RIESGO: 5000, // Al borde del fallo: casi no responde
  PENALIZACION_FALLO: 99999, // Valor especial para marcar fallos (no cuenta en el promedio)
};

const TEMA_DEFAULT = 'def';
const TEMA_PRO = 'pro';
const TEMA_PRO2 = 'pro2'; // Versión clara de PRO
const TEMA_MIN = 'min';
const TEMA_OSC = 'osc';

const TEMA_FILES = {
  [TEMA_DEFAULT]: 'css/monitor_def.css',
  [TEMA_PRO]: 'css/monitor_pro.css',
  [TEMA_PRO2]: 'css/monitor_pro2.css',
  [TEMA_MIN]: 'css/monitor_min.css',
  [TEMA_OSC]: 'css/monitor_osc.css',
};

// Temas que se pueden alternar con el botón de cambiar tema
// Si un tema no tiene pareja, el botón no se muestra
// El orden es: primero claros a oscuros, después oscuros a claros
const TEMA_TOGGLE_PAIRS = {
  [TEMA_DEFAULT]: TEMA_OSC, // def (claro) → osc (oscuro)
  [TEMA_OSC]: TEMA_DEFAULT, // osc (oscuro) → def (claro)
  [TEMA_PRO2]: TEMA_PRO, // pro2 (claro) → pro (oscuro)
  [TEMA_PRO]: TEMA_PRO2, // pro (oscuro) → pro2 (claro)
  // min no tiene pareja, entonces el botón se oculta
};

// Temas básicos: estos no tienen funciones avanzadas (no muestran detalles de errores ni botón PSI)
const TEMAS_BASICOS = [TEMA_DEFAULT];

const DEFAULT_LEYENDA_TEMA = TEMA_DEFAULT;
const LEYENDA_TEMA_FILES = {
  default: 'css/leyenda_claro.css',
  def: 'css/leyenda_claro.css',
  pro2: 'css/leyenda_claro.css',
  min: 'css/leyenda_claro.css',
  pro: 'css/leyenda_oscuro.css',
  osc: 'css/leyenda_oscuro.css',
};

const ESTADO_ERROR_CONEXION = 0;

const HTTP_STATUS_SUCCESS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
};

const HTTP_STATUS_ERROR = {
  NO_CONNECTION: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  IM_A_TEAPOT: 418,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const PROXY_ENDPOINT = '/.netlify/functions/check-status';
const FRECUENCIA_MONITOREO_MS = 5 * 60 * 1000;

const HORAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Armamos las opciones de duración del historial de forma automática
// Cada hora equivale a 12 mediciones (una cada 5 minutos)
const DURACION_OPCIONES = {};
HORAS_DISPONIBLES.forEach((horas) => {
  const key = `${horas}h`;
  DURACION_OPCIONES[key] = {
    mediciones: horas * 12, // 12 mediciones por cada hora (una cada 5 minutos)
    etiqueta: horas === 1 ? '1 hora' : `${horas} horas`,
  };
});

const DURACION_DEFAULT = '1h';

const MAX_HISTORIAL_ENTRIES = DURACION_OPCIONES[DURACION_DEFAULT].mediciones;
const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url=';
const WEBSITES_FILE = 'data/webs.json';

// Archivos de idioma disponibles
// Se cargan automáticamente según el parámetro ?lang=XX en la URL
const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
  fr: 'lang/i18n_fr.js',
};

const DEFAULT_LANG = 'es'; // Idioma por defecto si no se elige otro

// Configuración para detectar un fallo global
// Se activa si el 80% o más de los servicios críticos fallan o tardan más de 9 segundos
const GRUPO_CRITICO_NOMBRE = 'CRITICO'; // Nombre del grupo de servicios críticos
const UMBRAL_FALLO_GLOBAL_MS = 9000; // Si tarda más de 9 segundos, se considera fallo
const PORCENTAJE_FALLO_GLOBAL = 0.8; // Si falla el 80% de los servicios críticos, se activa la alerta global
