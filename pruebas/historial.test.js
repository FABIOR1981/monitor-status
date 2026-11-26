const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, leer } = require('./cargar');

const plano = (x) => JSON.parse(JSON.stringify(x));
const nuevo = () => cargar(['js/config.js', 'js/historial.js']);
const ok = (t = 100) => ({ time: t, status: 200, _source: 'navegador' });
const falla = { time: 99999, status: 503, error: 'caído', _source: 'servidor' };

test('la ventana es móvil: al llenarse se descarta lo más viejo y se sigue midiendo', () => {
  const c = nuevo();
  c.ajustarVentana(3);
  for (let i = 1; i <= 5; i++) c.agregarMedicion('u', ok(i * 10), 1000 + i);
  const guardadas = leer(c, 'historial')['u'];
  assert.equal(guardadas.length, 3);
  assert.deepEqual(plano(guardadas.map((e) => e.t)), [30, 40, 50]);
});

test('achicar la ventana recorta el historial existente', () => {
  const c = nuevo();
  c.ajustarVentana(10);
  for (let i = 1; i <= 6; i++) c.agregarMedicion('u', ok(i), 1000 + i);
  c.ajustarVentana(2);
  assert.equal(leer(c, 'historial')['u'].length, 2);
});

test('el historial sobrevive a una recarga (se guarda en el navegador)', () => {
  const c = nuevo();
  c.agregarMedicion('u', ok(77), 5000);
  const crudo = c.window.sessionStorage.getItem('monitorStatusHistorial2');

  const c2 = nuevo();
  c2.window.sessionStorage.setItem('monitorStatusHistorial2', crudo);
  c2.cargarHistorial();
  assert.equal(leer(c2, 'historial')['u'][0].t, 77);
});

test('datos guardados dañados no rompen la carga', () => {
  const c = nuevo();
  c.window.sessionStorage.setItem('monitorStatusHistorial2', '{no es json');
  c.cargarHistorial();
  assert.deepEqual(plano(Object.keys(leer(c, 'historial'))), []);
  c.window.sessionStorage.setItem('monitorStatusHistorial2', JSON.stringify({ u: [null, { t: 'x' }, { t: 5, ts: 1, s: 200 }] }));
  c.cargarHistorial();
  assert.equal(leer(c, 'historial')['u'].length, 1);
});

test('solo las fallas guardan el texto del error, recortado', () => {
  const c = nuevo();
  c.agregarMedicion('u', ok(), 1);
  c.agregarMedicion('u', { ...falla, error: 'x'.repeat(500) }, 2);
  const [bien, mal] = leer(c, 'historial')['u'];
  assert.equal(bien.e, undefined);
  assert.equal(mal.e.length, 140);
});

test('resumenDe: el promedio solo cuenta las mediciones exitosas', () => {
  const c = nuevo();
  const r = c.resumenDe([
    { t: 100, s: 200, ts: 1 },
    { t: 300, s: 200, ts: 2 },
    { t: 99999, s: 503, ts: 3 },
    { t: 99999, s: 0, ts: 4 },
  ]);
  assert.equal(r.promedio, 200);
  assert.equal(r.tasaFallos, 50);
  assert.equal(r.fallos, 2);
});

test('resumenDe sin mediciones exitosas no inventa un promedio', () => {
  const c = nuevo();
  assert.equal(c.resumenDe([{ t: 99999, s: 0, ts: 1 }]).promedio, null);
  assert.equal(c.resumenDe([]).tasaFallos, 0);
});

test('ultimaMedicionGlobal devuelve la más reciente de todos los sitios', () => {
  const c = nuevo();
  c.agregarMedicion('a', ok(), 100);
  c.agregarMedicion('b', ok(), 900);
  c.agregarMedicion('a', ok(), 500);
  assert.equal(c.ultimaMedicionGlobal(), 900);
});

test('se marca el resultado no concluyente', () => {
  const c = nuevo();
  c.agregarMedicion('u', { ...ok(), _source: 'servidor', noConcluyente: true }, 1);
  assert.equal(leer(c, 'historial')['u'][0].nc, true);
});
