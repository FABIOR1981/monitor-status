// Leyenda: estados, escala de velocidad y marcas del tablero (mismo tema e idioma que el tablero).

function crear(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = texto;
  return nodo;
}

function aplicarTemaLeyenda(tema) {
  const tx = window.TEXTOS_ACTUAL.pizarron;
  document.getElementById('estilo-tema').href = TEMA_FILES[tema];
  const oscuro = TEMAS_OSCUROS.includes(tema);
  const boton = document.getElementById('boton-tema');
  boton.dataset.tema = tema;
  boton.style.display = 'flex';
  boton.textContent = oscuro ? '☀️' : '🌙';
  const etiqueta = oscuro ? tx.btn_tema_claro : tx.btn_tema_oscuro;
  boton.title = etiqueta;
  boton.setAttribute('aria-label', etiqueta);

  // El enlace de vuelta lleva el tema y el idioma elegidos
  const params = new URLSearchParams(window.location.search);
  params.set('tema', tema);
  document.getElementById('enlace-volver').href = `index.html?${params.toString()}`;
}

function alternarTemaLeyenda() {
  const actual = document.getElementById('boton-tema').dataset.tema;
  const nuevo = TEMA_TOGGLE_PAIRS[actual] || TEMA_DEFAULT;
  recordarTema(nuevo);
  const params = new URLSearchParams(window.location.search);
  params.set('tema', nuevo);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  aplicarTemaLeyenda(nuevo);
}

function seccion(titulo) {
  const sec = crear('section', 'ley-seccion');
  sec.appendChild(crear('h2', null, titulo));
  return sec;
}

function dibujarEstados(contenedor, ley, estadosTexto) {
  const sec = seccion(ley.estados_title);
  sec.appendChild(crear('p', 'ley-intro', ley.intro));

  const rejilla = crear('div', 'ley-rejilla');
  ley.estados.forEach((e) => {
    const tarjeta = crear('div', `ley-tarjeta ley-estado estado-${e.key}`);
    tarjeta.appendChild(crear('span', `ley-chip estado-${e.key}`, `● ${estadosTexto[e.key]}`));
    tarjeta.appendChild(crear('p', null, e.texto));
    rejilla.appendChild(tarjeta);
  });
  sec.appendChild(rejilla);

  // La primera fila de "medicion" explica cómo se relacionan estado y velocidad
  const nota = (ley.medicion || [])[0];
  if (nota) {
    const caja = crear('div', 'ley-tarjeta ley-nota');
    caja.appendChild(crear('strong', null, nota.marca));
    caja.appendChild(crear('p', null, nota.texto));
    sec.appendChild(caja);
  }
  contenedor.appendChild(sec);
}

function grupoDe(key) {
  if (['very_fast', 'fast', 'normal'].includes(key)) return 'ok';
  if (key === 'down') return 'caido';
  return 'lento';
}

function dibujarEscala(contenedor, ley) {
  const sec = seccion(ley.escala_title);
  ['ok', 'lento', 'caido'].forEach((grupo) => {
    const niveles = (ley.umbrales || []).filter((u) => grupoDe(u.key) === grupo);
    if (!niveles.length) return;
    const bloque = crear('div', `ley-grupo grupo-${grupo}`);
    bloque.appendChild(crear('h3', 'ley-grupo-titulo', ley.escala_grupos[grupo]));
    niveles.forEach((u) => {
      const det = crear('details', `ley-nivel nivel-${u.key}`);
      const resumen = crear('summary');
      resumen.appendChild(crear('span', 'ley-nivel-nombre', u.label));
      resumen.appendChild(crear('span', 'ley-nivel-rango', u.range_text));
      resumen.appendChild(crear('span', 'ley-nivel-resumen', u.summary));
      det.appendChild(resumen);
      det.appendChild(crear('p', null, u.details));
      bloque.appendChild(det);
    });
    sec.appendChild(bloque);
  });
  contenedor.appendChild(sec);
}

function dibujarMarcas(contenedor, ley) {
  const sec = seccion(ley.medicion_title);
  sec.appendChild(crear('p', 'ley-intro', ley.medicion_description));
  const rejilla = crear('div', 'ley-rejilla ley-rejilla--libre');
  (ley.medicion || []).slice(1).forEach((m) => {
    const tarjeta = crear('div', 'ley-tarjeta ley-marca');
    tarjeta.appendChild(crear('h3', null, m.marca));
    tarjeta.appendChild(crear('p', null, m.texto));
    rejilla.appendChild(tarjeta);
  });
  sec.appendChild(rejilla);
  contenedor.appendChild(sec);
}

function dibujarCodigos(contenedor, ley) {
  const sec = seccion(ley.http_codes_title);
  sec.appendChild(crear('p', 'ley-intro', ley.http_codes_description));

  const tabla = crear('table', 'ley-tabla');
  const cab = crear('tr');
  (ley.codigos_headers || []).forEach((h) => cab.appendChild(crear('th', null, h)));
  tabla.appendChild(crear('thead')).appendChild(cab);
  const cuerpo = crear('tbody');
  (ley.codigos_error || []).forEach((c) => {
    const fila = crear('tr');
    fila.appendChild(crear('td', null, c.code));
    fila.appendChild(crear('td', null, c.label));
    fila.appendChild(crear('td', null, c.description));
    cuerpo.appendChild(fila);
  });
  tabla.appendChild(cuerpo);

  const plegable = crear('details', 'ley-plegable');
  plegable.appendChild(
    crear('summary', null, `${ley.http_codes_toggle} (${(ley.codigos_error || []).length})`)
  );
  plegable.appendChild(tabla);
  sec.appendChild(plegable);
  contenedor.appendChild(sec);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarIdioma();
  } catch (err) {
    console.error('No se cargaron las traducciones para la leyenda.', err);
    return;
  }

  const textos = window.TEXTOS_ACTUAL;
  const ley = textos.leyenda;
  document.documentElement.lang = idiomaActual();
  document.getElementById('leyenda-titulo').textContent = ley.title_browser;
  document.getElementById('titulo-leyenda').textContent = ley.main_header;
  document.getElementById('subtitulo-leyenda').textContent = ley.subtitulo;
  document.getElementById('enlace-volver').textContent = ley.link_volver;

  const contenido = document.getElementById('contenido-leyenda');
  contenido.replaceChildren();
  contenido.style.display = 'flex';
  contenido.style.flexDirection = 'column';
  contenido.style.gap = '32px';
  dibujarEstados(contenido, ley, textos.pizarron.estados);
  dibujarEscala(contenido, ley);
  dibujarMarcas(contenido, ley);
  dibujarCodigos(contenido, ley);

  aplicarTemaLeyenda(obtenerTemaInicial());
  document.getElementById('boton-tema').addEventListener('click', alternarTemaLeyenda);
});
