// Dibuja el tablero. Todo con textContent/createElement, nunca innerHTML: los nombres, URLs
// y errores vienen de la lista de sitios y de los propios sitios.

const MAX_BARRAS_VISIBLES = 60;
const AVISO_VIEJO_FACTOR = 2; // "datos desactualizados" si la última medición tiene más de 2 ciclos

function textosPz() {
  return window.TEXTOS_ACTUAL.pizarron;
}

function crear(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = texto;
  return nodo;
}

// Solo permite enlaces http(s); cualquier otra cosa (javascript:, data:) se anula
function urlSegura(url) {
  return /^https?:\/\//i.test(String(url)) ? String(url) : '#';
}

function urlPageSpeed(url) {
  return PSI_BASE_URL + encodeURIComponent(url).replace(/'/g, '%27');
}

function textoHace(ms) {
  const tx = textosPz();
  const seg = Math.round(ms / 1000);
  if (seg < 45) return tx.recien;
  const min = Math.round(seg / 60);
  if (min < 60) return `${tx.hace} ${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return `${tx.hace} ${h} h${resto ? ` ${resto} min` : ''}`;
}

function textoReloj(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function textoCuentaRegresiva(ms) {
  const seg = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(seg / 60);
  const s = String(seg % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Texto al pasar el mouse por una barra: hora de la medición y qué dio
function tituloBarra(b) {
  const tx = textosPz();
  if (b.clase === 'vacio') return '';
  if (b.clase === 'hueco') return tx.clave_hueco;
  const hora = `${new Date(b.ts).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${textoReloj(b.ts)}`;
  const dato = b.clase === 'caido' ? `HTTP ${b.s}` : `${b.t} ms`;
  return `${hora} · ${dato} · ${tx.estados[b.clase]}`;
}

function crearDetalle(vista) {
  const tx = textosPz();
  const det = crear('details', 'pz-detalle');
  det.dataset.url = vista.url;
  det.appendChild(crear('summary', null, tx.detalle));

  const cuerpo = crear('div', 'pz-detalle-cuerpo');

  if (vista.estado === 'caido' && vista.motivo) {
    let texto = tx.detalle_motivo_sin_respuesta;
    if (vista.motivo.tipo === 'contenido') texto = tx.detalle_motivo_contenido;
    if (vista.motivo.tipo === 'http')
      texto = `${tx.detalle_motivo_http} ${vista.motivo.codigo}.`;
    cuerpo.appendChild(crear('div', null, texto));
  }
  if (vista.origen === 'servidor' && vista.estado !== 'caido') {
    cuerpo.appendChild(crear('div', null, tx.detalle_servidor));
  }

  const datos = crear('div');
  if (vista.promedio !== null) {
    datos.appendChild(
      crear('div', null, `${tx.detalle_promedio}: ${vista.promedio} ms`)
    );
  }
  datos.appendChild(
    crear(
      'div',
      null,
      `${tx.detalle_fallos}: ${vista.tasaFallos}% (${vista.totalMediciones} ${tx.detalle_mediciones.toLowerCase()})`
    )
  );
  cuerpo.appendChild(datos);

  const errores = crear('div');
  errores.appendChild(crear('strong', null, tx.detalle_errores));
  if (vista.errores.length === 0) {
    errores.appendChild(crear('div', 'pz-suave', tx.detalle_sin_errores));
  } else {
    const lista = crear('ul');
    vista.errores.forEach((e) => {
      const partes = [textoReloj(e.ts), `HTTP ${e.s}`];
      if (e.e) partes.push(e.e);
      lista.appendChild(crear('li', null, partes.join(' · ')));
    });
    errores.appendChild(lista);
  }
  cuerpo.appendChild(errores);

  if (vista.diagnostics) {
    let texto = '';
    try {
      texto = JSON.stringify(vista.diagnostics, null, 1);
    } catch (e) {
      texto = '';
    }
    if (texto) cuerpo.appendChild(crear('pre', null, texto.slice(0, 700)));
  }

  const psi = crear('a', null, tx.psi);
  psi.href = urlPageSpeed(vista.url);
  psi.target = '_blank';
  psi.rel = 'noopener noreferrer';
  cuerpo.appendChild(psi);

  det.appendChild(cuerpo);
  return det;
}

function crearMosaico(vista, midiendo) {
  const tx = textosPz();
  const mosaico = crear(
    'article',
    `pz-mosaico estado-${vista.estado}${midiendo ? ' midiendo' : ''}`
  );
  mosaico.dataset.url = vista.url;

  const cab = crear('div', 'pz-m-cab');
  const nombre = crear('a', 'pz-nombre', vista.nombre);
  nombre.href = urlSegura(vista.url);
  nombre.target = '_blank';
  nombre.rel = 'noopener noreferrer';
  nombre.title = vista.url;
  cab.appendChild(nombre);
  cab.appendChild(crear('span', 'pz-chip', `● ${tx.estados[vista.estado]}`));
  mosaico.appendChild(cab);

  const valor = crear('div', 'pz-valor');
  valor.appendChild(crear('span', 'pz-num', vista.valor));
  if (vista.unidad) valor.appendChild(crear('span', 'pz-unidad', vista.unidad));
  if (vista.nivel) {
    valor.appendChild(
      crear('span', 'pz-nivel', window.TEXTOS_ACTUAL.velocidad[vista.nivel] || '')
    );
  }
  mosaico.appendChild(valor);

  const barras = crear('div', 'pz-barras');
  barras.setAttribute('aria-hidden', 'true');
  vista.barras.forEach((b) => {
    const barra = crear('span', `b-${b.clase}`);
    barra.style.height = `${b.alto}%`;
    barra.title = tituloBarra(b);
    barras.appendChild(barra);
  });
  mosaico.appendChild(barras);

  // Eje de tiempo: de cuándo es la barra más vieja hasta "ahora"
  const reales = vista.barras.filter((b) => b.clase !== 'hueco' && b.clase !== 'vacio');
  if (reales.length) {
    const eje = crear('div', 'pz-eje');
    // la hora de la derecha queda bajo la última barra medida, no al borde de la tarjeta
    const libres = vista.barras.filter((b) => b.clase === 'vacio').length;
    eje.style.paddingRight = `${(libres / vista.barras.length) * 100}%`;
    eje.appendChild(crear('span', null, textoReloj(reales[0].ts)));
    if (reales.length > 1) {
      eje.appendChild(crear('span', null, textoReloj(reales[reales.length - 1].ts)));
    }
    mosaico.appendChild(eje);
  }

  const meta = crear('div', 'pz-meta');
  const fila = crear('div');
  if (midiendo) {
    fila.textContent = tx.midiendo;
  } else if (vista.haceMs !== null) {
    fila.textContent = textoHace(vista.haceMs);
    if (vista.origen === 'navegador' || vista.origen === 'servidor') {
      const origen = crear(
        'span',
        `pz-origen-${vista.origen}`,
        ` · ${tx[`origen_${vista.origen}`]}${vista.origen === 'servidor' && vista.punto ? ` · ${nombreCentro(vista.punto)}` : ''}`
      );
      origen.title = tx[`origen_${vista.origen}_tip`];
      fila.appendChild(origen);
    }
  }
  meta.appendChild(fila);

  mosaico.appendChild(meta);

  mosaico.appendChild(crearDetalle(vista));
  return mosaico;
}

function dibujarResumen(vistas) {
  const tx = textosPz();
  const r = resumirVistas(vistas);
  const cont = document.getElementById('resumen');
  cont.replaceChildren();

  const fila = crear('div', 'pz-resumen-fila');
  const titulo = crear('div', 'pz-resumen-titulo');

  if (r.medidos === 0) {
    titulo.appendChild(crear('span', 'pz-resumen-texto', tx.sin_datos_resumen));
  } else {
    titulo.appendChild(
      crear(
        'span',
        `pz-resumen-n${r.conteo.caido > 0 ? ' hay-caidos' : ''}`,
        String(r.funcionando)
      )
    );
    titulo.appendChild(
      crear(
        'span',
        'pz-resumen-texto',
        `${tx.resumen_de} ${r.medidos} ${tx.resumen_texto}`
      )
    );
  }
  fila.appendChild(titulo);

  const chips = crear('div', 'pz-chips');
  ESTADOS_ORDEN.forEach((estado) => {
    if (!r.conteo[estado]) return;
    const chip = crear('span', 'pz-chip-resumen');
    const punto = crear('span', null, '●');
    punto.style.color = `var(--${estado === 'sin-datos' ? 'hueco' : estado})`;
    chip.appendChild(punto);
    chip.appendChild(crear('span', null, `${r.conteo[estado]} ${tx.estados[estado]}`));
    chips.appendChild(chip);
  });
  fila.appendChild(chips);
  cont.appendChild(fila);

  const segmentos = crear('div', 'pz-segmentos');
  segmentos.setAttribute('aria-hidden', 'true');
  vistas.forEach((v) => {
    const seg = crear('span');
    seg.style.background = `var(--${v.estado === 'sin-datos' ? 'hueco' : v.estado})`;
    segmentos.appendChild(seg);
  });
  cont.appendChild(segmentos);
}

function urlsAbiertas() {
  const abiertas = new Set();
  document.querySelectorAll('.pz-detalle[open]').forEach((d) => {
    abiertas.add(d.dataset.url);
  });
  return abiertas;
}

/**
 * Redibuja resumen y mosaicos con lo que haya guardado. `midiendo` es el conjunto de URLs
 * que se están midiendo en este momento (se muestran atenuadas).
 */
function dibujarTablero(webs, midiendo = new Set()) {
  const tx = textosPz();
  const ahora = Date.now();
  const abiertas = urlsAbiertas();
  const cantidadBarras = Math.min(maxHistorialActual, MAX_BARRAS_VISIBLES);

  // Los de grupo REFERENCIA (ej. Google) van siempre al final de su lista
  const ordenados = webs
    .filter((w) => w.grupo !== GRUPO_REFERENCIA_NOMBRE)
    .concat(webs.filter((w) => w.grupo === GRUPO_REFERENCIA_NOMBRE));

  const vistas = ordenados.map((web) =>
    construirVista(
      web,
      historial[web.url] || [],
      ultimoResultado[web.url] || null,
      ahora,
      { cantidadBarras, frecuenciaMs: FRECUENCIA_MONITOREO_MS }
    )
  );

  dibujarResumen(vistas);

  const criticos = document.getElementById('grid-criticos');
  const otros = document.getElementById('grid-otros');
  criticos.replaceChildren();
  otros.replaceChildren();

  vistas.forEach((vista) => {
    const mosaico = crearMosaico(vista, midiendo.has(vista.url));
    const det = mosaico.querySelector('.pz-detalle');
    if (abiertas.has(vista.url)) det.open = true;
    (vista.critico ? criticos : otros).appendChild(mosaico);
  });

  const hayCriticos = criticos.children.length > 0;
  const hayOtros = otros.children.length > 0;
  document.getElementById('seccion-criticos').hidden = !hayCriticos;
  document.getElementById('seccion-otros').hidden = !hayOtros;
  document.getElementById('titulo-otros').textContent = hayCriticos
    ? tx.seccion_otros
    : '';
  document.getElementById('titulo-otros').hidden = !hayCriticos;

}

let medicionEnCurso = false;

function actualizarFrescura() {
  const tx = textosPz();
  const btnMedir = document.getElementById('btn-medir');
  if (btnMedir) btnMedir.disabled = medicionEnCurso;
  const caja = document.getElementById('frescura');
  const texto = document.getElementById('frescura-texto');
  const barra = document.getElementById('frescura-barra');
  if (!caja || !texto || !barra) return;

  const ultima = ultimaMedicionGlobal();
  if (ultima === null) {
    texto.textContent = medicionEnCurso ? tx.midiendo : tx.freshness_sin;
    barra.style.width = '0%';
    caja.classList.remove('es-viejo');
    return;
  }

  const transcurrido = Math.max(0, Date.now() - ultima);
  const viejo =
    !medicionEnCurso && transcurrido > FRECUENCIA_MONITOREO_MS * AVISO_VIEJO_FACTOR;
  caja.classList.toggle('es-viejo', viejo);

  let detalle;
  if (medicionEnCurso) {
    detalle = tx.midiendo;
  } else if (viejo) {
    detalle = textoHace(transcurrido);
  } else {
    detalle = `${tx.freshness_next} ${textoCuentaRegresiva(FRECUENCIA_MONITOREO_MS - transcurrido)}`;
  }
  texto.textContent = `${tx.freshness_label} ${textoReloj(ultima)} · ${detalle}`;
  barra.style.width = `${Math.min(100, (transcurrido / FRECUENCIA_MONITOREO_MS) * 100)}%`;

  const nota = document.getElementById('nota-viejo');
  if (nota) {
    nota.textContent = viejo ? tx.freshness_viejo : '';
    nota.hidden = !viejo;
  }
}

function mostrarAdvertenciaGlobal(esFalloCritico, motivoFallo = '') {
  const aviso = document.getElementById('aviso-global');
  if (!aviso) return;
  aviso.replaceChildren();

  if (esFalloCritico) {
    aviso.appendChild(
      crear('div', null, `🚨 ${window.TEXTOS_ACTUAL.general.ADVERTENCIA_FALLO_GLOBAL_HTML}`)
    );
    if (motivoFallo) {
      aviso.appendChild(
        crear('small', null, `${window.TEXTOS_ACTUAL.general.MOTIVO_FALLO_PRO} ${motivoFallo}`)
      );
    }
    aviso.classList.add('visible');
  } else {
    aviso.classList.remove('visible');
  }
}

function aplicarTema(tema) {
  const tx = textosPz();
  const enlace = document.getElementById('estilo-tema');
  if (TEMA_ARCHIVOS[tema]) enlace.href = TEMA_ARCHIVOS[tema];

  const oscuro = TEMAS_OSCUROS.includes(tema);
  const boton = document.getElementById('boton-tema');
  if (boton) {
    boton.style.display = 'flex';
    boton.textContent = oscuro ? '☀️' : '🌙';
    const etiqueta = oscuro ? tx.btn_tema_claro : tx.btn_tema_oscuro;
    boton.title = etiqueta;
    boton.setAttribute('aria-label', etiqueta);
  }

  // Los enlaces a la leyenda y al ABM llevan el tema y el idioma elegidos
  const params = new URLSearchParams(window.location.search);
  params.set('tema', tema);
  ['enlace-leyenda', 'enlace-abm'].forEach((id) => {
    const a = document.getElementById(id);
    if (a) a.href = `${a.dataset.destino}?${params.toString()}`;
  });
}

function alternarTema() {
  const actual = document.getElementById('boton-tema').dataset.tema;
  const nuevo = TEMA_PAREJAS[actual] || TEMA_POR_DEFECTO;
  document.getElementById('boton-tema').dataset.tema = nuevo;
  recordarTema(nuevo);
  const params = new URLSearchParams(window.location.search);
  params.set('tema', nuevo);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  aplicarTema(nuevo);
}
