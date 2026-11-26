// Convierte las mediciones guardadas en lo que muestra el tablero. Funciones puras, sin DOM.
// Estados: ok, lento (responde pero pasa el umbral NORMAL), caido (sin respuesta, error o
// contenido esperado ausente) y sin-datos.

const ESTADOS_ORDEN = ['ok', 'lento', 'caido', 'sin-datos'];

function clasificarEntrada(entrada) {
  if (!entrada) return 'sin-datos';
  if (esFalloEntrada(entrada)) return 'caido';
  if (entrada.t > UMBRALES_LATENCIA.NORMAL) return 'lento';
  return 'ok';
}

function motivoCaida(entrada) {
  if (!entrada || !esFalloEntrada(entrada)) return null;
  if (entrada.s === 599) return { tipo: 'contenido', codigo: 599 };
  if (entrada.s === ESTADO_ERROR_CONEXION || entrada.s === 200)
    return { tipo: 'sin-respuesta', codigo: entrada.s };
  return { tipo: 'http', codigo: entrada.s };
}

// Siempre en ms, no se convierte a segundos
function formatearLatencia(ms) {
  if (!Number.isFinite(ms)) return { valor: '—', unidad: '' };
  return { valor: String(Math.round(ms)), unidad: 'ms' };
}

function nivelLatencia(ms) {
  const u = UMBRALES_LATENCIA;
  if (ms <= u.MUY_RAPIDO) return 'VERY_FAST';
  if (ms <= u.RAPIDO) return 'FAST';
  if (ms <= u.NORMAL) return 'NORMAL';
  if (ms <= u.LENTO) return 'SLOW';
  if (ms <= u.CRITICO) return 'CRITICAL';
  if (ms <= u.RIESGO) return 'RISK';
  return 'EXTREME_RISK';
}

// Barras de la más vieja (izquierda) a la más nueva; lo no medido queda libre a la derecha.
// Un corte (tablero cerrado) entre dos mediciones es UN solo hueco, por largo que sea: así
// cada medición nueva se suma a la derecha y la fila se llena de izquierda a derecha.
// `alto` es el % de la altura del contenedor.
function construirBarras(entradas, ahora, cantidad, frecuenciaMs) {
  const barras = [];
  let referencia = ahora;
  for (let i = entradas.length - 1; i >= 0 && barras.length < cantidad; i--) {
    const entrada = entradas[i];
    const hayCorte = Math.round((referencia - entrada.ts) / frecuenciaMs) > 1;
    if (hayCorte) barras.push({ clase: 'hueco', alto: 12 });
    if (barras.length >= cantidad) break;
    const estado = clasificarEntrada(entrada);
    barras.push({
      clase: estado,
      ts: entrada.ts,
      t: entrada.t,
      s: entrada.s,
      alto:
        estado === 'caido'
          ? 100
          : Math.min(100, 22 + Math.round(Math.sqrt(entrada.t / 2000) * 78)),
    });
    referencia = entrada.ts;
  }
  barras.reverse();
  while (barras.length < cantidad) barras.push({ clase: 'vacio', alto: 12 });
  return barras;
}

function construirVista(web, entradas, ultimo, ahora, opciones) {
  const { cantidadBarras, frecuenciaMs } = opciones;
  const ultima = entradas.at(-1) || null;
  const estado = clasificarEntrada(ultima);
  const resumen = resumenDe(entradas);
  const latencia =
    estado === 'caido' || estado === 'sin-datos'
      ? { valor: '—', unidad: '' }
      : formatearLatencia(ultima.t);

  return {
    url: web.url,
    nombre: web.nombre,
    critico: web.grupo === GRUPO_CRITICO_NOMBRE,
    referencia: web.grupo === GRUPO_REFERENCIA_NOMBRE,
    estado,
    motivo: motivoCaida(ultima),
    valor: latencia.valor,
    unidad: latencia.unidad,
    nivel: estado === 'ok' || estado === 'lento' ? nivelLatencia(ultima.t) : null,
    origen: ultima ? ultima.o : null,
    haceMs: ultima ? Math.max(0, ahora - ultima.ts) : null,
    barras: construirBarras(entradas, ahora, cantidadBarras, frecuenciaMs),
    promedio: resumen.promedio,
    tasaFallos: resumen.tasaFallos,
    totalMediciones: resumen.total,
    errores: erroresDe(entradas).slice(-10).reverse(),
    error: ultimo ? ultimo.error : null,
    diagnostics: ultimo ? ultimo.diagnostics : null,
  };
}

// "Funcionando" = todo lo que no está caído: un sitio lento igual responde
function resumirVistas(vistas) {
  const conteo = { ok: 0, lento: 0, caido: 0, 'sin-datos': 0 };
  for (const v of vistas) conteo[v.estado]++;
  const medidos = vistas.length - conteo['sin-datos'];
  return {
    total: vistas.length,
    medidos,
    funcionando: conteo.ok + conteo.lento,
    conteo,
  };
}
