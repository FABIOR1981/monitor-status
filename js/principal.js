// Orquesta el tablero: idioma, tema, ciclo de medición y dibujo.
// Decidir caído/no caído: medicion.js. Guardado: historial.js. Vista: estado.js y pizarron.js.

let websitesData = [];
let temporizadorMonitoreo = null;
let ticker = null;

function cargarAlertas() {
  const s = document.createElement('script');
  s.src = 'js/alertas_error.js';
  document.head.appendChild(s);
}

// Los de orden=1 primero; el resto por nombre
function ordenarServicios(servicios) {
  const fijos = servicios.filter((s) => s.orden === 1);
  const resto = servicios
    .filter((s) => s.orden !== 1)
    .sort((a, b) => a.nombre.toUpperCase().localeCompare(b.nombre.toUpperCase()));
  return fijos.concat(resto);
}

async function cargarLista() {
  return ordenarServicios(await leerListaSitios());
}

function determinarFalloGlobal(webs, resultados) {
  const g = window.TEXTOS_ACTUAL.general;
  if (resultados.length === 0 || webs.length === 0) {
    return { esFallo: true, motivo: g.FALLO_CRITICO_RED };
  }

  const porUrl = {};
  resultados.forEach((r) => {
    porUrl[r.url] = r;
  });

  const criticos = webs.filter((w) => w.grupo === GRUPO_CRITICO_NOMBRE);
  if (criticos.length > 0) {
    const caidos = criticos.filter(
      (w) => porUrl[w.url] && porUrl[w.url].time > UMBRAL_FALLO_GLOBAL_MS
    ).length;
    if (caidos === criticos.length) {
      return {
        esFallo: true,
        motivo: `${g.FALLO_CRITICO_GRUPO} "${GRUPO_CRITICO_NOMBRE}".`,
      };
    }
  }

  const lentos = resultados.filter((r) => r.time > UMBRAL_FALLO_GLOBAL_MS).length;
  const proporcion = lentos / webs.length;
  if (proporcion >= PORCENTAJE_FALLO_GLOBAL) {
    const porcentaje = Math.round(proporcion * 100);
    return {
      esFallo: true,
      motivo: `${porcentaje}${g.FALLO_CRITICO_LATENCIA_PARTE1} ${UMBRAL_FALLO_GLOBAL_MS}ms.`,
    };
  }
  return { esFallo: false, motivo: '' };
}

function programarSiguiente(demoraMs) {
  clearTimeout(temporizadorMonitoreo);
  temporizadorMonitoreo = setTimeout(medirTodos, demoraMs);
}

function avisarAlertas(web, res) {
  if (res.status === 0 || res.status >= 400) {
    if (window.registrarErrorSitio) {
      window.registrarErrorSitio(
        web.nombre || web.url,
        web.url,
        res.time,
        res.status,
        res.error || '',
        res.diagnostics || res.attempts || null
      );
    }
  } else if (res.status === 200 && window.limpiarErrorSitio) {
    window.limpiarErrorSitio(web.nombre || web.url);
  }
}

async function medirTodos() {
  if (medicionEnCurso) return;
  clearTimeout(temporizadorMonitoreo);
  medicionEnCurso = true;

  try {
    // La lista se vuelve a leer en cada ciclo: si se edita en el ABM, se toma sola
    try {
      websitesData = await cargarLista();
    } catch (e) {
      console.error('Error al cargar la lista de sitios.', e);
      if (websitesData.length === 0) {
        mostrarAdvertenciaGlobal(true, window.TEXTOS_ACTUAL.pizarron.error_lista);
        return;
      }
    }

    const midiendo = new Set(websitesData.map((w) => w.url));
    dibujarTablero(websitesData, midiendo);
    actualizarFrescura();

    // allSettled: si un sitio revienta, los demás se miden igual
    const salidas = await Promise.allSettled(
      websitesData.map((w) => verificarEstado(w.url, w.contiene))
    );

    const resultados = salidas.map((salida, i) => {
      const res =
        salida.status === 'fulfilled'
          ? salida.value
          : { time: UMBRALES_LATENCIA.PENALIZACION_FALLO, status: ESTADO_ERROR_CONEXION };
      return { ...res, url: websitesData[i].url, _sinProxy: !!res._sinProxy };
    });

    const { esFallo, motivo } = determinarFalloGlobal(websitesData, resultados);
    mostrarAdvertenciaGlobal(esFallo, motivo);

    // Si el propio monitor se quedó sin conexión (ningún sitio pudo consultar al servidor)
    // no se guarda nada: sería castigar a los sitios por un problema de esta pantalla.
    const monitorSinConexion = resultados.length > 0 && resultados.every((r) => r._sinProxy);
    if (esFallo && monitorSinConexion) {
      console.warn('El monitor no tiene conexión con el servidor: se omite esta medición.');
      return;
    }

    const ahora = Date.now();
    resultados.forEach((res, i) => {
      agregarMedicion(res.url, res, ahora);
      avisarAlertas(websitesData[i], res);
    });
  } finally {
    medicionEnCurso = false;
    if (websitesData.length) dibujarTablero(websitesData);
    actualizarFrescura();
    programarSiguiente(FRECUENCIA_MONITOREO_MS);
  }
}

function obtenerDuracionSeleccionada() {
  let guardado = null;
  try {
    guardado = localStorage.getItem('duracionMonitoreo');
  } catch {
    // sin almacenamiento
  }
  return guardado && DURACION_OPCIONES[guardado] ? guardado : DURACION_DEFAULT;
}

function inicializarSelectorDuracion() {
  const g = window.TEXTOS_ACTUAL.general;
  const selector = document.getElementById('duracion-selector');
  selector.replaceChildren();
  Object.keys(DURACION_OPCIONES).forEach((clave) => {
    const horas = parseInt(clave, 10);
    const opcion = document.createElement('option');
    opcion.value = clave;
    opcion.textContent = `${horas} ${horas === 1 ? g.DURACION_HORA_SINGULAR : g.DURACION_HORA_PLURAL}`;
    selector.appendChild(opcion);
  });

  const elegida = obtenerDuracionSeleccionada();
  selector.value = elegida;
  ajustarVentana(DURACION_OPCIONES[elegida].mediciones);

  selector.addEventListener('change', (e) => {
    const nueva = e.target.value;
    try {
      localStorage.setItem('duracionMonitoreo', nueva);
    } catch {
      // no es grave
    }
    // Es una ventana móvil: si se achica, se descarta lo más viejo; si se agranda, se llena sola
    ajustarVentana(DURACION_OPCIONES[nueva].mediciones);
    guardarHistorial();
    if (websitesData.length) dibujarTablero(websitesData);
  });
}

function reiniciarMonitoreo() {
  borrarHistorial();
  if (websitesData.length) dibujarTablero(websitesData);
  actualizarFrescura();
  medirTodos();
}

function alternarPantallaCompleta() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

function escribirTextosEstaticos() {
  const tx = window.TEXTOS_ACTUAL.pizarron;
  const g = window.TEXTOS_ACTUAL.general;
  document.title = tx.titulo;
  document.documentElement.lang = obtenerIdiomaSeleccionado();
  const poner = (id, texto) => {
    const nodo = document.getElementById(id);
    if (nodo) nodo.textContent = texto;
  };
  poner('titulo-principal', tx.titulo);
  poner('subtitulo', tx.subtitulo);
  poner('titulo-criticos', tx.seccion_criticos);
  poner('duracion-label', g.DURACION_LABEL);
  poner('texto-btn-reiniciar', g.BTN_REINICIAR);
  poner('texto-btn-pantalla', tx.btn_pantalla);
  poner('texto-btn-medir', tx.btn_medir);
  poner('enlace-leyenda', `📊 ${tx.btn_leyenda}`);
  poner('enlace-abm', `⚙️ ${tx.btn_abm}`);
  poner('leyenda-barras', `${tx.leyenda_barras}:`);
  poner('clave-ok', tx.clave_ok);
  poner('clave-lento', tx.clave_lento);
  poner('clave-caido', tx.clave_caido);
  poner('clave-hueco', tx.clave_hueco);
}

document.addEventListener('DOMContentLoaded', async () => {
  const tema = obtenerTemaInicial();
  document.getElementById('boton-tema').dataset.tema = tema;
  cargarHistorial();
  cargarAlertas();

  try {
    await cargarIdioma();
  } catch (e) {
    console.error('Fallo crítico: no se pudo cargar el idioma.', e);
    document.getElementById('aviso-global').textContent =
      'ERROR: no se pudo cargar el idioma. / Could not load the language.';
    document.getElementById('aviso-global').classList.add('visible');
    return;
  }

  escribirTextosEstaticos();
  aplicarTema(tema);
  inicializarSelectorDuracion();

  document.getElementById('boton-tema').addEventListener('click', alternarTema);
  document.getElementById('btn-medir').addEventListener('click', () => medirTodos());
  document.getElementById('btn-reiniciar').addEventListener('click', reiniciarMonitoreo);
  document.getElementById('btn-pantalla').addEventListener('click', alternarPantallaCompleta);
  document.addEventListener('fullscreenchange', () => {
    document
      .getElementById('pizarron')
      .classList.toggle('pantalla-completa', !!document.fullscreenElement);
  });

  // Muestra de inmediato lo guardado (sin esperar a que termine una medición)
  try {
    websitesData = await cargarLista();
    dibujarTablero(websitesData);
  } catch (e) {
    console.error('Error al cargar la lista de sitios.', e);
    mostrarAdvertenciaGlobal(true, window.TEXTOS_ACTUAL.pizarron.error_lista);
    return;
  }

  ticker = setInterval(actualizarFrescura, 1000);
  // Cada medio minuto se redibuja para que el "hace N min" de cada mosaico no se quede viejo
  setInterval(() => {
    if (!medicionEnCurso && websitesData.length) dibujarTablero(websitesData);
  }, 30000);
  actualizarFrescura();

  // Si ya hay una medición reciente (recarga de la página) se espera al próximo ciclo
  const ultima = ultimaMedicionGlobal();
  const edad = ultima === null ? Infinity : Date.now() - ultima;
  if (edad < 2 * 60 * 1000) {
    programarSiguiente(FRECUENCIA_MONITOREO_MS - edad);
  } else {
    medirTodos();
  }

  // Los navegadores frenan los temporizadores de las pestañas ocultas: al volver, se mide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || medicionEnCurso) return;
    const u = ultimaMedicionGlobal();
    if (u === null || Date.now() - u >= FRECUENCIA_MONITOREO_MS) medirTodos();
    else dibujarTablero(websitesData);
  });
});
