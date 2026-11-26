// Umbrales de latencia en ms (justificación en docs/justificacion_rangos_latencia.md)
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300,
  RAPIDO: 500,
  NORMAL: 800,
  LENTO: 1500,
  CRITICO: 3000,
  RIESGO: 5000,
  PENALIZACION_FALLO: 99999, // marca un fallo; no entra en promedios
};

// Un solo modo de pantalla con dos colores. Los nombres viejos (?tema=pro, etc.) se siguen
// aceptando para no romper enlaces guardados.
const TEMA_CLARO = 'claro';
const TEMA_OSCURO = 'oscuro';
const TEMA_DEFAULT = TEMA_OSCURO;

const TEMAS_ANTIGUOS = {
  pro: TEMA_OSCURO,
  osc: TEMA_OSCURO,
  pro2: TEMA_CLARO,
  min: TEMA_CLARO,
  def: TEMA_CLARO,
};

const TEMA_FILES = {
  [TEMA_CLARO]: 'css/tema_claro.css',
  [TEMA_OSCURO]: 'css/tema_oscuro.css',
};

const TEMAS_OSCUROS = [TEMA_OSCURO];

const TEMA_TOGGLE_PAIRS = {
  [TEMA_CLARO]: TEMA_OSCURO,
  [TEMA_OSCURO]: TEMA_CLARO,
};

function normalizarTema(nombre) {
  return TEMA_FILES[nombre] ? nombre : TEMAS_ANTIGUOS[nombre] || null;
}

// Orden: ?tema= de la URL, último elegido en este navegador, oscuro.
// localStorage puede no estar disponible (modo privado, bloqueado).
function obtenerTemaInicial() {
  try {
    const enUrl = normalizarTema(new URLSearchParams(window.location.search).get('tema'));
    if (enUrl) return enUrl;
    const guardado = normalizarTema(window.localStorage.getItem('temaMonitor'));
    if (guardado) return guardado;
  } catch {
    // se usa el default
  }
  return TEMA_DEFAULT;
}

function recordarTema(tema) {
  try {
    window.localStorage.setItem('temaMonitor', tema);
  } catch {
    // no es grave
  }
}

const ESTADO_ERROR_CONEXION = 0;

const PROXY_ENDPOINT = '/api/check-status';
const FRECUENCIA_MONITOREO_MS = 5 * 60 * 1000;

const SONDA_TIMEOUT_MS = 8000;

// Si el navegador llega al sitio, estos códigos no son caída: son login o bloqueo a bots
const STATUS_BLOQUEO_ALCANZABLE = [401, 403, 429];

// Una caída se repite una vez tras esta espera y solo se marca si vuelve a fallar
const CONFIRMACION_ESPERA_MS = 3000;

// Muestras del navegador por medición (se usa la mediana). Si la primera ya pasa
// MUESTRAS_LENTO_MS no se toman más, para no cargar un sitio que ya anda mal.
const MUESTRAS_NAVEGADOR = 3;
const MUESTRAS_LENTO_MS = 3000;

const WEBSITES_FILE = 'data/webs.json';
const LISTA_ENDPOINT = '/api/webs';

// Lista guardada en KV; si /api/webs no responde (ej. en local) se usa el archivo
async function leerListaSitios() {
  const guardada = await fetch(LISTA_ENDPOINT, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  if (Array.isArray(guardada)) return guardada;

  const res = await fetch(WEBSITES_FILE, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const lista = await res.json();
  if (!Array.isArray(lista)) throw new Error('webs.json no es una lista');
  return lista;
}

const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url=';

// Una medición cada 5 minutos: 12 por hora
const DURACION_OPCIONES = {};
for (let horas = 1; horas <= 9; horas++) {
  DURACION_OPCIONES[`${horas}h`] = {
    mediciones: horas * 12,
    etiqueta: horas === 1 ? '1 hora' : `${horas} horas`,
  };
}

const DURACION_DEFAULT = '2h';
const MAX_HISTORIAL_ENTRIES = DURACION_OPCIONES[DURACION_DEFAULT].mediciones;

const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
};
const DEFAULT_LANG = 'es';

// Fallo global: 80% o más de los críticos caídos o con más de 9 s
const GRUPO_CRITICO_NOMBRE = 'CRITICO';
const GRUPO_REFERENCIA_NOMBRE = 'REFERENCIA'; // ej. Google: va al final de OTROS SERVICIOS
const UMBRAL_FALLO_GLOBAL_MS = 9000;
const PORCENTAJE_FALLO_GLOBAL = 0.8;

const ALERTAS_AUTO_CLOSE_MS = 30000;
const ALERTAS_COPY_LABEL_RESET_MS = 1500;

// Centros de datos de Cloudflare (código IATA) que se muestran con ciudad
const CENTROS_DATOS = {
  EZE: 'Buenos Aires',
  MVD: 'Montevideo',
  SCL: 'Santiago',
  GRU: 'São Paulo',
  GIG: 'Río de Janeiro',
  POA: 'Porto Alegre',
  CWB: 'Curitiba',
  LIM: 'Lima',
  BOG: 'Bogotá',
  UIO: 'Quito',
  PTY: 'Panamá',
  MIA: 'Miami',
  ATL: 'Atlanta',
  IAD: 'Washington',
  EWR: 'Nueva York',
  ORD: 'Chicago',
  DFW: 'Dallas',
  LAX: 'Los Ángeles',
  SJC: 'San José (EE. UU.)',
  MAD: 'Madrid',
  LHR: 'Londres',
  CDG: 'París',
  FRA: 'Fráncfort',
  AMS: 'Ámsterdam',
};

const nombreCentro = (sigla) => (CENTROS_DATOS[sigla] ? `${CENTROS_DATOS[sigla]} (${sigla})` : sigla);
