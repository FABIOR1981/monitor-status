// El idioma sale de ?lang= (o DEFAULT_LANG) y se carga como un <script> que define TEXTOS_ACTUAL.

function obtenerIdiomaSeleccionado() {
  const lang = new URLSearchParams(window.location.search).get('lang');
  return I18N_FILES[lang] ? lang : DEFAULT_LANG;
}

function cargarIdiomaScript(idioma) {
  const archivo = I18N_FILES[idioma];
  if (!archivo) return Promise.reject(new Error(`Idioma sin archivo definido: ${idioma}`));

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = archivo;
    script.onload = () => {
      if (window.TEXTOS_ACTUAL) resolve();
      else reject(new Error(`${archivo} no definió TEXTOS_ACTUAL`));
    };
    script.onerror = () => reject(new Error(`No se pudo cargar ${archivo}`));
    document.head.appendChild(script);
  });
}

// Si el idioma pedido falla se prueba con el default
async function cargarIdioma() {
  const pedido = obtenerIdiomaSeleccionado();
  try {
    await cargarIdiomaScript(pedido);
  } catch (err) {
    if (pedido === DEFAULT_LANG) throw err;
    console.warn(`Falló el idioma ${pedido}, se usa ${DEFAULT_LANG}.`, err);
    await cargarIdiomaScript(DEFAULT_LANG);
  }
}
