// Carga los scripts del navegador (config.js, medicion.js, ...) en un contexto aislado de Node
// para poder probar sus funciones sin abrir un navegador.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');

function almacenEnMemoria() {
  const datos = {};
  return {
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => {
      datos[k] = String(v);
    },
    removeItem: (k) => {
      delete datos[k];
    },
  };
}

function cargar(archivos, extra = {}) {
  const almacen = almacenEnMemoria();
  const contexto = vm.createContext({
    console,
    URLSearchParams,
    AbortController,
    performance,
    clearTimeout,
    // Sin esperas reales: los reintentos con pausa se resuelven al instante
    setTimeout: (fn) => {
      fn();
      return 0;
    },
    window: { location: { search: '' }, localStorage: almacen },
    location: { protocol: 'https:' },
    ...extra,
  });
  archivos.forEach((archivo) => {
    const codigo = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    vm.runInContext(codigo, contexto, { filename: archivo });
  });
  return contexto;
}

// Lee una variable `let`/`const` del contexto cargado (no quedan como propiedades)
function leer(contexto, nombre) {
  return vm.runInContext(nombre, contexto);
}

module.exports = { cargar, leer };
