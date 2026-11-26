// Arma dist/ con lo que se publica en Cloudflare Pages. functions/ no entra: Pages las toma de la raíz.

const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const salida = path.join(raiz, 'dist');

const publicar = [
  'index.html',
  'abm-webs.html',
  'leyenda.html',
  'css',
  'js',
  'lang',
  'data',
];

fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida, { recursive: true });

for (const item of publicar) {
  const origen = path.join(raiz, item);
  if (!fs.existsSync(origen)) {
    console.error(`Falta ${item}: no se puede armar la publicación.`);
    process.exit(1);
  }
  fs.cpSync(origen, path.join(salida, item), { recursive: true });
}

console.log(`Publicación lista en dist/ (${publicar.join(', ')})`);
