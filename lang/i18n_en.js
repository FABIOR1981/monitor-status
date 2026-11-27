// Translation file - English
// This file only contains English texts
// Should not contain logic, only data
const TEXTOS_EN = {
  general: {
    PAGE_TITLE: 'Service Status Monitor',
    LAST_UPDATE: 'Last Update:',
    LOADING: 'Loading...',
    INFO_BAR:
      'Data is automatically updated every 5 minutes using a Serverless Proxy.',
    ADVERTENCIA_FALLO_GLOBAL_HTML:
      'Monitoring data unavailable/unreliable. Widespread critical latency detected, possibly due to a monitoring system overload. Please wait for the next cycle or refresh the page.',
    MOTIVO_FALLO_PRO: 'Pro Reason:',
    FALLO_CRITICO_GRUPO: '100% of the critical group failed:',
    FALLO_CRITICO_LATENCIA_PARTE1: '% of services exceeded the threshold of',
    FALLO_CRITICO_RED: 'No results available (Total network failure)',
    DURACION_LABEL: 'History duration:',
    DURACION_HORA_SINGULAR: 'hour',
    DURACION_HORA_PLURAL: 'hours',
    DURACION_MEDICIONES: 'measurements',
    BTN_REINICIAR: 'Restart Monitoring',
    BTN_COPIAR: 'Copy',
    BTN_COPIADO: 'Copied!',
    BTN_CERRAR: 'Close',
  },

  velocidad: {
    VERY_FAST: 'VERY FAST',
    FAST: 'FAST',
    NORMAL: 'NORMAL',
    SLOW: 'SLOW',
    CRITICAL: 'CRITICAL',
    RISK: 'RISK',
    EXTREME_RISK: 'EXTREME RISK',
  },

  estados: {
    DOWN: 'DOWN',
    DOWN_ERROR: 'DOWN/ERROR',
  },
  httpCodes: [
    {
      code: 0,
      label: 'No connection',
      description:
        'Network failure, DNS, timeout, CORS blocking, or server did not respond.',
    },
    {
      code: 301,
      label: 'Moved permanently',
      description: 'The resource has been permanently moved to a new URL.',
    },
    {
      code: 302,
      label: 'Moved temporarily',
      description: 'The resource is temporarily located at a different URL.',
    },
    {
      code: 304,
      label: 'Not modified',
      description: 'The resource has not changed since the last request.',
    },
    {
      code: 400,
      label: 'Bad request',
      description: 'Malformed or invalid request.',
    },
    {
      code: 401,
      label: 'Unauthorized',
      description: 'Authentication required to access the resource.',
    },
    {
      code: 402,
      label: 'Payment required',
      description: 'Reserved for future use in payment systems.',
    },
    {
      code: 403,
      label: 'Forbidden',
      description: 'Access denied, even with valid authentication.',
    },
    {
      code: 404,
      label: 'Not found',
      description: 'The requested resource does not exist on the server.',
    },
    {
      code: 405,
      label: 'Method not allowed',
      description: 'The HTTP method used is not allowed for this resource.',
    },
    {
      code: 406,
      label: 'Not acceptable',
      description:
        'The server cannot generate an acceptable response according to Accept headers.',
    },
    {
      code: 408,
      label: 'Request timeout',
      description: 'The server timed out waiting for the request.',
    },
    {
      code: 409,
      label: 'Conflict',
      description:
        'The request conflicts with the current state of the server.',
    },
    {
      code: 410,
      label: 'Gone',
      description:
        'The resource was permanently deleted and has no forwarding address.',
    },
    {
      code: 418,
      label: "I'm a teapot",
      description:
        'Humorous code (RFC 2324). Some services use it to reject requests.',
    },
    {
      code: 429,
      label: 'Too many requests',
      description: 'The service rate limit was exceeded.',
    },
    {
      code: 500,
      label: 'Internal server error',
      description: 'Generic internal server error.',
    },
    {
      code: 501,
      label: 'Not implemented',
      description:
        'The server does not support the functionality required to complete the request.',
    },
    {
      code: 502,
      label: 'Bad gateway',
      description:
        'A proxy/gateway received an invalid response from the origin server.',
    },
    {
      code: 503,
      label: 'Service unavailable',
      description:
        'The server is temporarily overloaded, under maintenance, or offline.',
    },
    {
      code: 504,
      label: 'Gateway timeout',
      description:
        'A proxy/gateway did not receive a timely response from the origin server.',
    },
    {
      code: 599,
      label: 'Unexpected content',
      description:
        'The page responds, but does not contain the expected text (it may be showing an error or maintenance page).',
    },
  ],
};

// Construir el objeto httpStatus automáticamente desde el array de códigos
// Esto evita duplicar la información y mantiene todo sincronizado
TEXTOS_EN.httpStatus = {};
TEXTOS_EN.httpCodes.forEach((item) => {
  TEXTOS_EN.httpStatus[item.code] = item.label;
});
TEXTOS_EN.httpStatus.GENERIC = 'HTTP Error';

TEXTOS_EN.tabla = {
  HEADER_SERVICE: 'Service',
  HEADER_URL: 'URL',
  HEADER_LATENCY_ACTUAL: 'Current Latency',
  HEADER_STATUS_ACTUAL: 'Current Status',
  HEADER_PROMEDIO_MS: 'Average',
  HEADER_PROMEDIO_STATUS: 'Average Status',
  HEADER_ACTION: 'Action',
};

TEXTOS_EN.pizarron = {
  titulo: 'Service Monitor',
  subtitulo: 'Status as seen from your connection, double-checked from the server',
  resumen_texto: 'services working',
  resumen_de: 'of',
  sin_datos_resumen: 'Measuring for the first time…',
  estados: {
    ok: 'OPERATIONAL',
    lento: 'DEGRADED',
    caido: 'DOWN',
    'sin-datos': 'NO DATA',
  },
  seccion_criticos: 'CRITICAL',
  seccion_otros: 'OTHER SERVICES',
  origen_navegador: 'from your network',
  origen_servidor: 'from the server',
  origen_navegador_tip: 'Measured by your browser: closest to what a user experiences.',
  origen_estimado: 'estimated',
  origen_estimado_tip: 'The site does not let your browser read the response: latency is how long it took to reject it (approximate). The data center shown only confirmed the site is up.',
  origen_servidor_tip: 'Your browser could not measure it; the response comes from the monitor server (US) and is usually slower.',
  hace: 'ago',
  recien: 'just measured',
  midiendo: 'measuring…',
  freshness_label: 'Last measurement',
  freshness_next: 'next in',
  freshness_viejo: 'Outdated data: the monitor does not measure while this screen is closed.',
  freshness_sin: 'No measurements yet',
  detalle: 'Details',
  detalle_promedio: 'Average',
  detalle_fallos: 'Failures in window',
  detalle_mediciones: 'Measurements',
  detalle_errores: 'Latest errors',
  detalle_sin_errores: 'No errors in this window.',
  detalle_motivo_contenido: 'The page answered but does not have the expected content.',
  detalle_motivo_sin_respuesta: 'The site did not respond.',
  detalle_motivo_http: 'The site returned code',
  detalle_servidor: 'Your browser could not measure this site: the value comes from the monitor server (US) and is usually slower than what you see from home.',
  psi: 'Analyze on PageSpeed',
  leyenda_barras: 'Each bar is one measurement',
  clave_ok: 'operational',
  clave_lento: 'degraded',
  clave_caido: 'down',
  clave_hueco: 'not measured',
  btn_leyenda: 'Legend',
  btn_abm: 'Manage sites',
  btn_pantalla: 'Full screen',
  btn_medir: 'Measure now',
  btn_tema_claro: 'Switch to light theme',
  btn_tema_oscuro: 'Switch to dark theme',
  error_lista: 'Could not read the site list (data/webs.json).',
  error_idioma: 'Could not load the language. Check the console.',
};

TEXTOS_EN.leyenda = {
  title_browser: 'Status Monitor Legend',
  main_header: 'Latency Thresholds and Operational Justification',
  subtitulo: 'How to read the board: statuses, speed and marks',
  estados_title: 'The four statuses',
  estados: [
    { key: 'ok', texto: 'The site responds and takes 800 ms or less.' },
    { key: 'lento', texto: 'The site responds, but takes longer than 800 ms.' },
    { key: 'caido', texto: 'A real failure: no response, server error or unexpected content. The measurement is repeated after 3 seconds first.' },
    { key: 'sin-datos', texto: 'There are no measurements for that site yet.' },
  ],
  escala_title: 'Speed scale',
  escala_grupos: { ok: 'OPERATIONAL · up to 800 ms', lento: 'DEGRADED · from 800 ms', caido: 'DOWN · real failure' },
  codigos_headers: ['Code', 'Range/Common Name', 'Operational Meaning'],
  intro:
    'This is the latency (response time) scale used on the board: each card shows, next to the number in milliseconds, its matching level (VERY FAST, NORMAL, SLOW, CRITICAL…). The justification is based on Interaction Psychology and the Operational Meaning of performance. The card status is simpler: OPERATIONAL up to 800 ms, DEGRADED above 800 ms, and DOWN only with clear evidence of failure.',
  umbrales: [
    {
      key: 'very_fast',
      className: 'status-very-fast',
      emoji: '',
      label: 'VERY FAST',
      range_text: '< 300 ms',
      summary: 'Optimal Performance (Instantaneous to the User)',
      details:
        "Golden Standard. The human brain perceives responses under 100 ms as instant (Nielsen's guideline). Keeping the threshold up to 300 ms ensures a smooth experience. Operational Meaning: The system is operating in optimal conditions.",
    },
    {
      key: 'fast',
      className: 'status-fast',
      emoji: '',
      label: 'FAST',
      range_text: '300 ms ≤ Latency < 500 ms',
      summary: 'Fluid Interaction without Noticeable Wait',
      details:
        'Limit of Unconscious Perception. The delay is noticeable but not perceived as a bothersome wait. Operational Meaning: Excellent performance; good control point for fast backend processes.',
    },
    {
      key: 'normal',
      className: 'status-normal',
      emoji: '',
      label: 'NORMAL',
      range_text: '500 ms ≤ Latency < 800 ms',
      summary: 'Acceptable Performance (User Maintains Focus)',
      details:
        'Begin of Distraction. From 500 ms the user may start to divert attention, although they can maintain their thought flow. Operational Meaning: Acceptable performance but approaching where wait sensation consolidates.',
    },
    {
      key: 'slow',
      className: 'status-slow',
      emoji: '',
      label: 'SLOW',
      range_text: '800 ms ≤ Latency < 1500 ms',
      summary: 'Annoying Delay (Active Distractor / Early Alert)',
      details:
        '1 second limit. The delay becomes an active distractor. Experience is noticeably degraded. Operational Meaning: Early Alert. Server or network under stress; investigate.',
    },
    {
      key: 'critical',
      className: 'status-critical',
      emoji: '',
      label: 'CRITICAL',
      range_text: '1500 ms ≤ Latency < 3000 ms',
      summary: 'Abandonment Risk (3 Seconds / Imminent Failure)',
      details:
        'Loss of Focus and Frustration. The critical boundary (3 seconds) where users may abandon pages. Operational Meaning: Imminent Failure. Heavy load or severe bottlenecks.',
    },
    {
      key: 'risk',
      className: 'status-risk',
      emoji: '',
      label: 'RISK',
      range_text: '3000 ms ≤ Latency < 5000 ms',
      summary: 'Functional Failure and Collapse (5 Seconds / Alarm)',
      details:
        'Functional Failure. Delays longer than 5 seconds are often considered a functional failure. Operational Meaning: ALARM. Service near collapse or unreliable request handling.',
    },
    {
      key: 'extreme_risk',
      className: 'status-extreme-risk',
      emoji: '',
      label: 'EXTREME RISK',
      range_text: '5000 ms ≤ Latency < 99999 ms',
      summary: 'Unacceptable Latency (Chaos / Guaranteed Abandonment)',
      details:
        'Chaos/Limbo. Range before maximum timeout. The user likely abandoned the action. Operational Meaning: Server cannot process requests in reasonable time. Immediate attention required.',
    },
    {
      key: 'down',
      className: 'status-down',
      emoji: '',
      label: 'DOWN',
      range_text: '≥ 99999 ms',
      summary: 'Confirmed Outage (Timeout Exceeded)',
      details:
        'Confirmed Outage. The PENALIZACION_FALLO value was exceeded. Operational Meaning: Service is down, route is unreachable, or server refused to respond.',
    },
  ],
  medicion_title: 'How to read a board card',
  medicion_description:
    'Each service is a card. Latency is measured from the browser of whoever is looking at the board (median of up to 3 samples) and the monitor server checks the HTTP code, the certificate validity and the content. A site is only marked down with clear evidence.',
  medicion_headers: ['Mark', 'Meaning'],
  medicion: [
    { marca: 'Status and speed', texto: 'The status depends on speed, except DOWN. Up to 800 ms (levels VERY FAST, FAST and NORMAL) the card is OPERATIONAL. From 800 ms (SLOW, CRITICAL, RISK and EXTREME RISK) it is DEGRADED. DOWN does not depend on how long it takes: it is a real failure (no response, server error or unexpected content). The grey level next to the number tells the speed in more detail.' },
    { marca: 'Number and grey text', texto: 'The number is the latency of the latest measurement, always in milliseconds. The grey text on the right is its level on the scale above.' },
    { marca: 'History bars', texto: 'Each bar is one measurement: oldest on the left, newest on the right; the free space on the right fills up with each measurement. Color is the status at that moment and height shows latency (taller = slower; a failure takes the full height). The time of the first and last bar is shown below, and hovering a bar shows its date, time and value.' },
    { marca: 'Grey dash with no color', texto: 'A «not measured» gap: the board was closed at that moment. Each dash equals one 5-minute cycle without measuring.' },
    { marca: 'from your network', texto: 'Latency measured from your own browser (Uruguay). It is the closest to what a real user experiences.' },
    { marca: 'from the server', texto: 'Your browser could not measure this site, so the monitor server time is used. It includes the trip to that server, so it may be higher than real. The status is computed the same way, but treat it as a reference.' },
    { marca: '▸ Details', texto: 'Expands on each card: average latency, failure percentage in the chosen window, reason for the outage, latest errors and a link to analyze the site on PageSpeed.' },
    { marca: 'Critical and other services', texto: 'Critical services go on top and larger; the rest under «Other services». Sites in the REFERENCE group (e.g. Google, to compare with your connection) always go last. The group is chosen in the admin panel.' },
    { marca: 'Top summary', texto: '«N of M services working» counts everything that is not down (operational or degraded). The colored circles show how many are in each status.' },
    { marca: 'Last-measurement clock', texto: 'Shows the time of the last measurement and when the next one is (every 5 minutes). If the data is old, the clock turns red and warns you.' },
    { marca: '⚡ Measure now', texto: 'Forces an immediate measurement of all sites without deleting history.' },
    { marca: '🔄 Restart Monitoring', texto: 'Deletes the history and starts measuring from scratch.' },
    { marca: 'History length', texto: 'How long the board remembers (1 to 9 hours, 12 measurements per hour). It is stored in this browser, so it survives reloading the page.' },
    { marca: 'Site available, measured by the server', texto: 'If the browser fails but the server sees the site fine, it is not marked down: the failure was in your browser or your network towards that site.' },
    { marca: '599 Unexpected content', texto: 'The site responds, but the page does not contain the text it should (field «Text it must contain»). Usually indicates an error page with code 200.' },
    { marca: '401 / 403 / 429', texto: 'The site rejects the monitoring server. If the browser does reach it, it is considered available.' },
    { marca: 'Scope', texto: 'The monitor only measures while the board is open; it does not record what happens when nobody is looking.' },
  ],
  http_codes_toggle: 'Show all codes',
  http_codes_title: 'HTTP Status Codes and System Failures',
  http_codes_description:
    'When a service returns a status code outside the 2xx (Success) range, the monitor marks it as DOWN and shows the real code in the card details (e.g. HTTP 404).',
};

TEXTOS_EN.leyenda.codigos_error = [
  {
    code: '2xx',
    label: 'OK / Success',
    description:
      'The connection and service responded correctly (latency measured).',
  },
];

TEXTOS_EN.httpCodes
  .filter((item) => item.code === 0 || item.code >= 400)
  .forEach((item) => {
    TEXTOS_EN.leyenda.codigos_error.push({
      code: item.code.toString(),
      label: item.label,
      description: item.description,
    });
  });

// Solo asignar los textos a la variable global
// La lógica de carga está en i18n.js
window.TEXTOS_ACTUAL = TEXTOS_EN;
