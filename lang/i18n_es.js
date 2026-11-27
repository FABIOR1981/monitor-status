// Archivo de traducción - Español
// Este archivo solo contiene los textos en español
// No debe contener lógica, solo datos
const TEXTOS_ES = {
  general: {
    PAGE_TITLE: 'Monitor de Estado de Servicios',
    LAST_UPDATE: 'Última actualización:',
    LOADING: 'Cargando...',
    INFO_BAR:
      'Los datos se actualizan automáticamente cada 5 minutos usando un Proxy Serverless.',
    ADVERTENCIA_FALLO_GLOBAL_HTML:
      'Datos de monitoreo no disponibles/no confiables. Se detectó una latencia crítica generalizada, posiblemente debido a una sobrecarga del sistema de monitoreo. Por favor, espere el próximo ciclo o actualice la página.',
    MOTIVO_FALLO_PRO: 'Motivo Pro:',
    FALLO_CRITICO_GRUPO: 'Falló el 100% del grupo crítico:',
    FALLO_CRITICO_LATENCIA_PARTE1: '% de los servicios superaron el umbral de',
    FALLO_CRITICO_RED: 'No hay resultados disponibles (Fallo de red total)',
    DURACION_LABEL: 'Duración del historial:',
    DURACION_HORA_SINGULAR: 'hora',
    DURACION_HORA_PLURAL: 'horas',
    DURACION_MEDICIONES: 'mediciones',
    BTN_REINICIAR: 'Reiniciar Monitoreo',
    BTN_COPIAR: 'Copiar',
    BTN_COPIADO: '¡Copiado!',
    BTN_CERRAR: 'Cerrar',
  },
  velocidad: {
    VERY_FAST: 'MUY RÁPIDO',
    FAST: 'RÁPIDO',
    NORMAL: 'NORMAL',
    SLOW: 'LENTO',
    CRITICAL: 'CRÍTICO',
    RISK: 'RIESGO',
    EXTREME_RISK: 'RIESGO EXTREMO',
  },
  estados: {
    DOWN: 'CAÍDA',
    DOWN_ERROR: 'CAÍDA/ERROR',
  },
  httpCodes: [
    {
      code: 0,
      label: 'Sin conexión',
      description:
        'No se pudo establecer conexión con el servidor (timeout, DNS, red).',
    },
    {
      code: 301,
      label: 'Redireccionamiento permanente',
      description: 'El recurso se ha movido permanentemente a una nueva URL.',
    },
    {
      code: 302,
      label: 'Redireccionamiento temporal',
      description: 'El recurso está temporalmente en una URL diferente.',
    },
    {
      code: 304,
      label: 'No modificado',
      description: 'El recurso no ha cambiado desde la última solicitud.',
    },
    {
      code: 400,
      label: 'Solicitud incorrecta',
      description: 'Solicitud mal formada o inválida.',
    },
    {
      code: 401,
      label: 'No autorizado',
      description: 'Se requiere autenticación para acceder al recurso.',
    },
    {
      code: 402,
      label: 'Pago requerido',
      description: 'Reservado para uso futuro en sistemas de pago.',
    },
    {
      code: 403,
      label: 'Acceso prohibido',
      description: 'Acceso prohibido, incluso con autenticación válida.',
    },
    {
      code: 404,
      label: 'No encontrado',
      description: 'El recurso solicitado no existe en el servidor.',
    },
    {
      code: 405,
      label: 'Método no permitido',
      description: 'El método HTTP usado no está permitido para este recurso.',
    },
    {
      code: 406,
      label: 'No aceptable',
      description:
        'El servidor no puede generar una respuesta aceptable según los headers Accept.',
    },
    {
      code: 408,
      label: 'Tiempo agotado',
      description: 'El servidor agotó el tiempo de espera para la solicitud.',
    },
    {
      code: 409,
      label: 'Conflicto',
      description:
        'La solicitud entra en conflicto con el estado actual del servidor.',
    },
    {
      code: 410,
      label: 'Ya no disponible',
      description:
        'El recurso fue eliminado permanentemente y no tiene dirección de reenvío.',
    },
    {
      code: 418,
      label: 'Soy una tetera',
      description:
        'Código humorístico (RFC 2324). Algunos servicios lo usan para rechazar solicitudes.',
    },
    {
      code: 429,
      label: 'Demasiadas solicitudes',
      description:
        'Se ha superado el límite de tasa (Rate Limit) del servicio.',
    },
    {
      code: 500,
      label: 'Error del servidor',
      description: 'Error interno genérico del servidor.',
    },
    {
      code: 501,
      label: 'No implementado',
      description:
        'El servidor no soporta la funcionalidad requerida para completar la solicitud.',
    },
    {
      code: 502,
      label: 'Puerta de enlace incorrecta',
      description:
        'Un proxy/gateway recibió una respuesta inválida del servidor de origen.',
    },
    {
      code: 503,
      label: 'Servicio no disponible',
      description:
        'El servidor está temporalmente sobrecargado, en mantenimiento o inactivo.',
    },
    {
      code: 504,
      label: 'Tiempo agotado de puerta de enlace',
      description:
        'Un proxy/gateway no recibió respuesta a tiempo del servidor de origen.',
    },
    {
      code: 599,
      label: 'Contenido inesperado',
      description:
        'La página responde, pero no contiene el texto esperado (puede mostrar un error o una página de mantenimiento).',
    },
  ],
};

// Construir el objeto httpStatus automáticamente desde el array de códigos
// Esto evita duplicar la información y mantiene todo sincronizado
TEXTOS_ES.httpStatus = {};
TEXTOS_ES.httpCodes.forEach((item) => {
  TEXTOS_ES.httpStatus[item.code] = item.label;
});
TEXTOS_ES.httpStatus.GENERIC = 'Error HTTP';

TEXTOS_ES.tabla = {
  HEADER_SERVICE: 'Servicio',
  HEADER_URL: 'URL',
  HEADER_LATENCY_ACTUAL: 'Latencia Actual',
  HEADER_STATUS_ACTUAL: 'Estado Actual',
  HEADER_PROMEDIO_MS: 'Promedio ',
  HEADER_PROMEDIO_STATUS: 'Estado Promedio',
  HEADER_ACTION: 'Acción',
};

TEXTOS_ES.pizarron = {
  titulo: 'Monitor de Servicios',
  subtitulo: 'Estado visto desde tu conexión, con verificación desde el servidor',
  resumen_texto: 'servicios funcionando',
  resumen_de: 'de',
  sin_datos_resumen: 'Midiendo por primera vez…',
  estados: {
    ok: 'OPERATIVO',
    lento: 'DEGRADADO',
    caido: 'CAÍDO',
    'sin-datos': 'SIN DATOS',
  },
  seccion_criticos: 'CRÍTICOS',
  seccion_otros: 'OTROS SERVICIOS',
  origen_navegador: 'desde tu red',
  origen_servidor: 'desde el servidor',
  origen_navegador_tip: 'Medido por tu navegador: lo más parecido a lo que vive un usuario.',
  origen_estimado: 'estimado',
  origen_estimado_tip: 'El sitio no deja que tu navegador lea la respuesta; la latencia es el tiempo hasta que la rechazó y es aproximada.',
  origen_servidor_tip: 'Tu navegador no pudo medirlo; la respuesta viene del servidor del monitor y puede diferir de lo que ves desde tu red.',
  hace: 'hace',
  recien: 'recién medido',
  midiendo: 'midiendo…',
  freshness_label: 'Última medición',
  freshness_next: 'próxima en',
  freshness_viejo: 'Datos desactualizados: el monitor no mide cuando esta pantalla está cerrada.',
  freshness_sin: 'Sin mediciones todavía',
  detalle: 'Detalle',
  detalle_promedio: 'Promedio',
  detalle_fallos: 'Fallos en la ventana',
  detalle_mediciones: 'Mediciones',
  detalle_errores: 'Últimos errores',
  detalle_sin_errores: 'Sin errores en esta ventana.',
  detalle_motivo_contenido: 'La página respondió pero no tiene el contenido esperado.',
  detalle_motivo_sin_respuesta: 'No hubo respuesta del sitio.',
  detalle_motivo_http: 'El sitio devolvió el código',
  detalle_servidor: 'Tu navegador no pudo medir este sitio: el dato viene del servidor del monitor y puede diferir de lo que ves desde tu casa.',
  psi: 'Analizar en PageSpeed',
  leyenda_barras: 'Cada barra es una medición',
  clave_ok: 'operativo',
  clave_lento: 'degradado',
  clave_caido: 'caído',
  clave_hueco: 'sin medición',
  btn_leyenda: 'Leyenda',
  btn_abm: 'Administrar sitios',
  btn_pantalla: 'Pantalla completa',
  btn_medir: 'Medir ahora',
  btn_tema_claro: 'Cambiar a tema claro',
  btn_tema_oscuro: 'Cambiar a tema oscuro',
  error_lista: 'No se pudo leer la lista de sitios (data/webs.json).',
  error_idioma: 'No se pudo cargar el idioma. Verifique la consola.',
};

TEXTOS_ES.leyenda = {
  title_browser: 'Leyenda del Monitor de Estado',
  main_header: 'Umbrales de Latencia y Justificación Operacional',
  subtitulo: 'Cómo leer el tablero: estados, velocidad y marcas',
  estados_title: 'Los cuatro estados',
  estados: [
    { key: 'ok', texto: 'El sitio responde y tarda 800 ms o menos.' },
    { key: 'lento', texto: 'El sitio responde, pero tarda más de 800 ms.' },
    { key: 'caido', texto: 'Falla real: sin respuesta, error del servidor o contenido inesperado. Antes se repite la medición a los 3 segundos.' },
    { key: 'sin-datos', texto: 'Todavía no hay mediciones de ese sitio.' },
  ],
  escala_title: 'Escala de velocidad',
  escala_grupos: { ok: 'OPERATIVO · hasta 800 ms', lento: 'DEGRADADO · desde 800 ms', caido: 'CAÍDO · falla real' },
  codigos_headers: ['Código', 'Rango/Nombre Común', 'Significado Operacional'],
  intro:
    'Esta es la escala de latencia (tiempo de respuesta) que se usa en el tablero: cada tarjeta muestra, junto al número en milisegundos, el nivel que le corresponde (MUY RÁPIDO, NORMAL, LENTO, CRÍTICO…). La justificación se basa en la Psicología de la Interacción y el Significado Operacional del rendimiento. El estado de la tarjeta es más simple: OPERATIVO hasta 800 ms, DEGRADADO por encima de 800 ms, y CAÍDO solo cuando hay evidencia clara de falla.',
  umbrales: [
    {
      key: 'very_fast',
      className: 'status-very-fast',
      emoji: '',
      label: 'MUY RÁPIDO',
      range_text: '< 300 ms',
      summary: 'Rendimiento Óptimo (Instantáneo para el Usuario)',
      details:
        'Estándar Dorado. El cerebro humano percibe cualquier respuesta por debajo de los 100 ms como instantánea (Regla de Nielsen). Mantener el umbral hasta 300 ms asegura una experiencia fluida. Significado Operacional: El sistema está operando en condiciones óptimas y con alta eficiencia.',
    },
    {
      key: 'fast',
      className: 'status-fast',
      emoji: '',
      label: 'RÁPIDO',
      range_text: '300 ms ≤ Latencia < 500 ms',
      summary: 'Interacción Fluida sin Molestias (Percepción Inconsciente)',
      details:
        'Límite de la Percepción Inconsciente. La demora es notable pero el usuario no la percibe como una espera molesta. Significado Operacional: Rendimiento excelente, buen punto de control para procesos rápidos de backend.',
    },
    {
      key: 'normal',
      className: 'status-normal',
      emoji: '',
      label: 'NORMAL',
      range_text: '500 ms ≤ Latencia < 800 ms',
      summary: 'Rendimiento Aceptable (El Foco se Mantiene)',
      details:
        'La Distracción Comienza. A partir de 500 ms el usuario puede comenzar a desviarse, aunque puede mantener su hilo de pensamiento. Significado Operacional: Rendimiento aceptable, pero acercándose a donde la sensación de espera se consolida.',
    },
    {
      key: 'slow',
      className: 'status-slow',
      emoji: '',
      label: 'LENTO',
      range_text: '800 ms ≤ Latencia < 1500 ms',
      summary: 'Demora Molesta (Distractor Activo / Alerta Temprana)',
      details:
        'Límite del 1 Segundo. La demora se convierte en un distractor activo. La experiencia está notablemente degradada. Significado Operacional: Alerta Temprana. El servidor o la red experimentan estrés. Momento de investigar.',
    },
    {
      key: 'critical',
      className: 'status-critical',
      emoji: '',
      label: 'CRÍTICO',
      range_text: '1500 ms ≤ Latencia < 3000 ms',
      summary: 'Riesgo de Abandono del Usuario (3 Segundos / Fallo Inminente)',
      details:
        'Pérdida de Foco y Frustración. El límite crítico (3 segundos) donde los usuarios abandonan una página web. Significado Operacional: Fallo Inminente. Indica carga extremadamente pesada o cuellos de botella severos.',
    },
    {
      key: 'risk',
      className: 'status-risk',
      emoji: '',
      label: 'RIESGO',
      range_text: '3000 ms ≤ Latencia < 5000 ms',
      summary: 'Fallo Funcional y Colapso (5 Segundos / Alarma)',
      details:
        'Fallo Funcional. Las demoras superiores a 5 segundos son consideradas un fallo funcional en muchos sistemas. Significado Operacional: ALARMA. El servicio está al borde del colapso o no sirve peticiones de manera confiable.',
    },
    {
      key: 'extreme_risk',
      className: 'status-extreme-risk',
      emoji: '',
      label: 'RIESGO EXTREMO',
      range_text: '5000 ms ≤ Latencia < 99999 ms',
      summary: 'Latencia Inaceptable (CAOS / Abandono Asegurado)',
      details:
        'CAOS/Limbo. Rango antes del timeout máximo. Es casi seguro que el usuario abandonó la acción. Significado Operacional: El servidor no puede procesar la solicitud en un tiempo razonable. Requiere atención INMEDIATA.',
    },
    {
      key: 'down',
      className: 'status-down',
      emoji: '',
      label: 'CAÍDO',
      range_text: '≥ 99999 ms',
      summary: 'Caída Confirmada (Timeout Excedido)',
      details:
        'Caída Confirmada. El valor de PENALIZACION_FALLO ha sido superado. Significado Operacional: El servicio está caído, la ruta es inaccesible, o el servidor se negó a responder.',
    },
  ],
  medicion_title: 'Cómo leer una tarjeta del tablero',
  medicion_description:
    'Cada servicio es una tarjeta. La latencia se mide desde el navegador de quien mira el tablero (mediana de hasta 3 muestras) y el servidor del monitor verifica el código HTTP, la validez del certificado y el contenido. Un sitio solo se marca caído con evidencia clara.',
  medicion_headers: ['Marca', 'Qué significa'],
  medicion: [
    { marca: 'Estado y velocidad', texto: 'El estado depende de la velocidad, salvo CAÍDO. Hasta 800 ms (niveles MUY RÁPIDO, RÁPIDO y NORMAL) la tarjeta está OPERATIVA. Desde 800 ms (LENTO, CRÍTICO, RIESGO y RIESGO EXTREMO) está DEGRADADA. CAÍDO no depende de cuánto tarde: es una falla real (sin respuesta, error del servidor o contenido inesperado). El nivel gris junto al número dice la velocidad con más detalle.' },
    { marca: 'Número y texto gris', texto: 'El número es la latencia de la última medición, siempre en milisegundos. El texto gris de la derecha es su nivel en la escala de arriba.' },
    { marca: 'Barras de historial', texto: 'Cada barra es una medición: la más vieja a la izquierda y la más nueva a la derecha; el espacio libre de la derecha se va llenando con cada medición. El color es el estado que tuvo en ese momento y la altura indica la latencia (más alta = más lenta; una caída ocupa toda la altura). Debajo se ve la hora de la primera y la última barra, y al pasar el mouse sobre una barra aparecen su fecha, hora y valor.' },
    { marca: 'Rayita gris sin color', texto: 'Hueco «sin medición»: en ese momento el tablero estaba cerrado y no se midió. Cada rayita equivale a un ciclo de 5 minutos sin medir.' },
    { marca: 'desde tu red', texto: 'Latencia medida desde tu propio navegador (Uruguay). Es la más parecida a lo que vive un usuario real.' },
    { marca: 'desde el servidor', texto: 'Tu navegador no pudo medir este sitio, así que se usa el tiempo del servidor del monitor. Incluye el viaje hasta ese servidor, por lo que puede ser mayor que el real. El estado se calcula igual, pero conviene tomarlo como referencia.' },
    { marca: '▸ Detalle', texto: 'Se despliega en cada tarjeta: promedio de latencia, porcentaje de fallos de la ventana elegida, motivo de la caída, últimos errores y un enlace para analizar el sitio en PageSpeed.' },
    { marca: 'Críticos y otros servicios', texto: 'Los servicios críticos van arriba y en grande; el resto en «Otros servicios». Los sitios con grupo REFERENCIA (por ejemplo Google, para comparar con tu conexión) van siempre al final. El grupo se elige en el panel de administración.' },
    { marca: 'Resumen superior', texto: '«N de M servicios funcionando» cuenta todo lo que no está caído (operativo o degradado). Los círculos de colores indican cuántos hay en cada estado.' },
    { marca: 'Reloj de última medición', texto: 'Muestra la hora de la última medición y en cuánto será la próxima (cada 5 minutos). Si los datos son viejos, el reloj se pone en rojo y avisa.' },
    { marca: '⚡ Medir ahora', texto: 'Fuerza una medición inmediata de todos los sitios sin borrar el historial.' },
    { marca: '🔄 Reiniciar Monitoreo', texto: 'Borra el historial y empieza a medir de cero.' },
    { marca: 'Duración del historial', texto: 'Cuánto tiempo recuerda el tablero (de 1 a 9 horas, 12 mediciones por hora). Se guarda en este navegador, así que sobrevive a recargar la página.' },
    { marca: 'Sitio disponible, medido por el servidor', texto: 'Si el navegador falla pero el servidor ve el sitio bien, no se marca caído: la falla fue de tu navegador o de tu red hacia ese sitio.' },
    { marca: '599 Contenido inesperado', texto: 'El sitio responde, pero la página no contiene el texto que debería tener (campo «Texto que debe contener»). Suele indicar una página de error con código 200.' },
    { marca: '401 / 403 / 429', texto: 'El sitio rechaza al servidor de monitoreo. Si el navegador sí lo alcanza, se considera disponible.' },
    { marca: 'Alcance', texto: 'El monitor solo mide mientras el tablero está abierto; no registra lo que pasa cuando nadie lo mira.' },
  ],
  http_codes_toggle: 'Ver todos los códigos',
  http_codes_title: 'Códigos de Estado HTTP y Fallos del Sistema',
  http_codes_description:
    'Cuando un servicio devuelve un código de estado fuera del rango 2xx (Éxito), el monitor lo marca como CAÍDO y en el detalle de la tarjeta muestra el código real (ej: HTTP 404).',
};

TEXTOS_ES.leyenda.codigos_error = [
  {
    code: '2xx',
    label: 'OK / Éxito',
    description:
      'La conexión y el servicio respondieron correctamente (Latencia medida).',
  },
];

TEXTOS_ES.httpCodes
  .filter((item) => item.code === 0 || item.code >= 400)
  .forEach((item) => {
    TEXTOS_ES.leyenda.codigos_error.push({
      code: item.code.toString(),
      label: item.label,
      description: item.description,
    });
  });

// Solo asignar los textos a la variable global
// La lógica de carga está en i18n.js
window.TEXTOS_ACTUAL = TEXTOS_ES;
