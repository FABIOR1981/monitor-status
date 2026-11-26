// Mide un sitio y decide su estado; no toca la pantalla.
// Latencia: desde el navegador de quien mira (lo más parecido a un usuario en Uruguay).
// Código HTTP y contenido: los aporta /api/check-status.
// Regla: solo se marca CAÍDO con evidencia clara.

// Con no-cors no se lee el código HTTP, pero sí cuánto tardó la respuesta o si falló la red
// (incluye certificados inválidos, que el navegador rechaza).
async function muestra(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SONDA_TIMEOUT_MS);
  const t0 = performance.now();
  try {
    await fetch(url, {
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      signal: ctrl.signal,
    });
    return { ok: true, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    const error =
      e.name === 'AbortError'
        ? `Timeout: sin respuesta en ${SONDA_TIMEOUT_MS} ms (desde el navegador)`
        : 'Sin respuesta desde el navegador (red, DNS o certificado)';
    return { ok: false, ms: null, error };
  } finally {
    clearTimeout(timer);
    ctrl.abort(); // corta la descarga del cuerpo
  }
}

function medianaDe(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mid] : Math.round((orden[mid - 1] + orden[mid]) / 2);
}

// Mediana de varias muestras para que un pico aislado no distorsione. Si la primera falla
// falla la medición; si ya es lenta no se insiste. La primera incluye DNS/TLS, las otras no.
// null si no se puede medir (http:// desde una página https://).
async function medirDesdeNavegador(url) {
  if (location.protocol === 'https:' && url.startsWith('http:')) return null;

  const primera = await muestra(url);
  if (!primera.ok) return primera;

  const muestras = [primera.ms];
  let fallidas = 0;
  if (primera.ms <= MUESTRAS_LENTO_MS) {
    for (let i = 1; i < MUESTRAS_NAVEGADOR; i++) {
      const m = await muestra(url);
      if (m.ok) muestras.push(m.ms);
      else fallidas++;
    }
  }
  return { ok: true, ms: medianaDe(muestras), muestras, fallidas };
}

// null si la función no respondió
async function consultarServidor(url, contiene) {
  const extra = contiene ? `&contiene=${encodeURIComponent(contiene)}` : '';
  try {
    const res = await fetch(`${RUTA_PROXY}?url=${encodeURIComponent(url)}${extra}`);
    if (!res.ok) return null;
    const data = await res.json();
    const status = Number(data?.status);
    const time = Number(data?.time);
    return {
      status: Number.isFinite(status) ? status : ESTADO_ERROR_CONEXION,
      time: Number.isFinite(time) ? time : UMBRALES_LATENCIA.PENALIZACION_FALLO,
      error: data?.error ?? null,
      tlsError: data?.tlsError ?? null,
      contenidoOk: data?.contenidoOk ?? null,
      punto: data?.punto ?? null,
    };
  } catch (err) {
    console.error(`No se pudo consultar el servidor para ${url}:`, err);
    return null;
  }
}

const esOk = (status) => status >= 200 && status < 400;

// Respuesta de la aplicación, no caída de infraestructura (401/403/429 = login o bloqueo a bots)
const servidorLlego = (s) => !!s && (esOk(s.status) || CODIGOS_BLOQUEO.includes(s.status));

async function medirUnaVez(url, contiene) {
  const [sonda, servidor] = await Promise.all([
    medirDesdeNavegador(url),
    consultarServidor(url, contiene),
  ]);
  const resultado = decidirEstado(sonda, servidor, contiene);
  // distingue "el monitor perdió el servidor" de una caída real del sitio
  resultado._sinProxy = !servidor;
  resultado.punto = servidor?.punto || null;
  return resultado;
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Si la primera medición falla se espera y se repite; solo la segunda decide.
// Si se recupera queda OK con una nota de falla transitoria.
async function verificarEstado(url, contiene) {
  const primero = await medirUnaVez(url, contiene);
  if (primero.status === 200) return primero;

  await esperar(CONFIRMACION_ESPERA_MS);
  const segundo = await medirUnaVez(url, contiene);

  const fallo = primero.error || `HTTP ${primero.status}`;
  const diagnostics = { ...segundo.diagnostics, primerIntento: fallo };
  if (segundo.status === 200) {
    return {
      ...segundo,
      error: `Falla transitoria: el primer intento falló (${fallo}) y se recuperó`,
      diagnostics,
      transitoria: true,
    };
  }
  return { ...segundo, diagnostics };
}

function decidirEstado(sonda, servidor, contiene) {
  const diagnostics = {
    navegador: !sonda
      ? 'no medible (sitio http desde página https)'
      : sonda.ok
        ? `respondió en ${sonda.ms} ms${
            sonda.muestras?.length > 1
              ? ` (mediana de ${sonda.muestras.length}: ${sonda.muestras.join(' / ')} ms)`
              : ''
          }${sonda.fallidas ? `; ${sonda.fallidas} muestra(s) fallaron` : ''}`
        : sonda.error,
    servidor: !servidor
      ? 'el proxy no respondió'
      : servidor.status === ESTADO_ERROR_CONEXION
        ? servidor.error || 'sin conexión'
        : `HTTP ${servidor.status} en ${servidor.time} ms${
            servidor.tlsError ? ` (certificado: ${servidor.tlsError})` : ''
          }`,
  };

  const caido = (error, origen) => ({
    time: UMBRALES_LATENCIA.PENALIZACION_FALLO,
    status: ESTADO_ERROR_CONEXION,
    error,
    diagnostics,
    _source: origen,
  });

  const arriba = (time, error, origen) => ({ time, status: 200, error, diagnostics, _source: origen });

  // la página responde pero falta el texto esperado (solo si el sitio define `contiene`)
  if (servidor && esOk(servidor.status) && servidor.contenidoOk === false) {
    diagnostics.contenido = `no se encontró "${contiene}"`;
    return {
      time: sonda?.ok ? sonda.ms : servidor.time,
      status: 599,
      error: `La página responde pero no contiene "${contiene}"`,
      diagnostics,
      _source: sonda?.ok ? 'navegador' : 'servidor',
    };
  }

  // el navegador no puede medir: decide el servidor
  if (!sonda) {
    if (!servidor) return caido('El proxy no respondió', 'servidor');
    if (servidor.tlsError) return caido(`Certificado inválido (${servidor.tlsError})`, 'servidor');
    if (servidorLlego(servidor)) return arriba(servidor.time, null, 'servidor');
    return {
      time: servidor.time,
      status: servidor.status,
      error: servidor.error || `HTTP ${servidor.status}`,
      diagnostics,
      _source: 'servidor',
    };
  }

  if (sonda.ok) {
    // si el navegador llegó, el certificado le sirve: el servidor puede fallar por una cadena
    // incompleta que los navegadores sí completan
    if (!servidor) return arriba(sonda.ms, 'Estado HTTP no verificado (el proxy no respondió)', 'navegador');

    if (servidorLlego(servidor)) {
      const nota = esOk(servidor.status)
        ? null
        : `El servidor recibió ${servidor.status} (login o bloqueo a datacenter)`;
      const notaMuestras = sonda.fallidas
        ? `${sonda.fallidas} de ${sonda.muestras.length + sonda.fallidas} muestras del navegador fallaron (conexión inestable)`
        : null;
      return arriba(sonda.ms, nota || notaMuestras, 'navegador');
    }
    if (servidor.status === ESTADO_ERROR_CONEXION) {
      return arriba(sonda.ms, 'El servidor no pudo conectar pero el navegador sí', 'navegador');
    }
    // 404, 5xx: error real de la aplicación
    return {
      time: sonda.ms,
      status: servidor.status,
      error: `HTTP ${servidor.status}`,
      diagnostics,
      _source: 'navegador',
    };
  }

  // el navegador no llegó
  if (servidor?.tlsError) return caido(`Certificado inválido (${servidor.tlsError})`, 'navegador');

  // el servidor sí llegó: las mediciones se contradicen, no se declara caída
  if (servidorLlego(servidor)) {
    return {
      ...arriba(
        servidor.time,
        `Medición no concluyente: el navegador no pudo medir (${sonda.error}); dato del servidor`,
        'servidor'
      ),
      noConcluyente: true,
    };
  }

  if (servidor && servidor.status !== ESTADO_ERROR_CONEXION) {
    return {
      time: UMBRALES_LATENCIA.PENALIZACION_FALLO,
      status: servidor.status,
      error: `HTTP ${servidor.status}`,
      diagnostics,
      _source: 'servidor',
    };
  }

  return caido(
    `${sonda.error}; servidor: ${servidor ? servidor.error || 'sin conexión' : 'el proxy no respondió'}`,
    'navegador'
  );
}
