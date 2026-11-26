// Historial de mediciones por sitio, en sessionStorage, como ventana móvil: al llenarse se
// descarta lo más viejo. Sobrevive a recargas, pero se borra al cerrar la pestaña o el navegador:
// cada vez que se abre el tablero empieza de cero.
// Entrada: { t: latencia ms, s: status, ts: momento, o: origen, nc: no concluyente, e: error }

let historialStatus = {};
let ultimoResultado = {}; // detalle de la última medición por sitio, para el panel de detalle
let maxHistorialActual = MAX_HISTORIAL_ENTRIES;

const CLAVE_HISTORIAL = 'monitorStatusHistorial2';
const CLAVE_ULTIMO = 'monitorStatusUltimo2';

const esFalloEntrada = (e) => e.s !== 200 || e.t >= UMBRALES_LATENCIA.PENALIZACION_FALLO;

function leerAlmacen(clave) {
  try {
    const datos = JSON.parse(window.sessionStorage.getItem(clave));
    return datos && typeof datos === 'object' && !Array.isArray(datos) ? datos : {};
  } catch {
    return {}; // sin acceso o JSON roto: se arranca de cero
  }
}

function escribirAlmacen(clave, datos) {
  try {
    window.sessionStorage.setItem(clave, JSON.stringify(datos));
  } catch (err) {
    console.warn('No se pudo guardar el historial en el navegador:', err);
  }
}

function cargarHistorial() {
  const guardado = leerAlmacen(CLAVE_HISTORIAL);
  historialStatus = {};
  for (const url of Object.keys(guardado)) {
    if (Array.isArray(guardado[url])) {
      historialStatus[url] = guardado[url].filter(
        (e) => e && Number.isFinite(e.t) && Number.isFinite(e.ts)
      );
    }
  }
  ultimoResultado = leerAlmacen(CLAVE_ULTIMO);
}

function guardarHistorial() {
  escribirAlmacen(CLAVE_HISTORIAL, historialStatus);
  escribirAlmacen(CLAVE_ULTIMO, ultimoResultado);
}

function borrarHistorial() {
  historialStatus = {};
  ultimoResultado = {};
  guardarHistorial();
}

function ajustarVentana(maximo) {
  maxHistorialActual = maximo;
  for (const url of Object.keys(historialStatus)) {
    historialStatus[url] = historialStatus[url].slice(-maximo);
  }
}

function agregarMedicion(url, resultado, ahora = Date.now()) {
  const entrada = {
    t: resultado.time,
    s: resultado.status,
    ts: ahora,
    o: resultado._source || null,
  };
  if (resultado.noConcluyente) entrada.nc = true;
  if (esFalloEntrada(entrada)) entrada.e = String(resultado.error || '').slice(0, 140);

  historialStatus[url] = [...(historialStatus[url] || []), entrada].slice(-maxHistorialActual);

  ultimoResultado[url] = {
    error: resultado.error || null,
    diagnostics: resultado.diagnostics || null,
    transitoria: !!resultado.transitoria,
    ts: ahora,
  };
  guardarHistorial();
  return entrada;
}

function ultimaMedicionGlobal() {
  let ultima = null;
  for (const lista of Object.values(historialStatus)) {
    const ts = lista.at(-1)?.ts;
    if (ts !== undefined && (ultima === null || ts > ultima)) ultima = ts;
  }
  return ultima;
}

// El promedio usa solo las mediciones exitosas
function resumenDe(entradas) {
  const total = entradas.length;
  const exitosas = entradas.filter((e) => !esFalloEntrada(e));
  const fallos = total - exitosas.length;
  const suma = exitosas.reduce((acc, e) => acc + e.t, 0);
  return {
    total,
    fallos,
    promedio: exitosas.length ? Math.round(suma / exitosas.length) : null,
    tasaFallos: total ? Math.round((fallos / total) * 100) : 0,
  };
}

const erroresDe = (entradas) => entradas.filter(esFalloEntrada);
