const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, leer } = require('./cargar');

const ctx = cargar(['js/config.js', 'js/medicion.js']);
const decidir = (sonda, servidor, contiene) =>
  ctx.decidirEstado(sonda, servidor, contiene);

const navegadorOk = (ms = 120) => ({ ok: true, ms, muestras: [ms], fallidas: 0 });
const navegadorFalla = { ok: false, ms: null, error: 'Sin respuesta desde el navegador' };
const servidor = (status, extra = {}) => ({
  status,
  time: 300,
  error: null,
  tlsError: null,
  contenidoOk: null,
  ...extra,
});

test('navegador y servidor coinciden: sitio arriba con la latencia del navegador', () => {
  const r = decidir(navegadorOk(95), servidor(200));
  assert.equal(r.status, 200);
  assert.equal(r.time, 95);
  assert.equal(r._source, 'navegador');
  assert.equal(r.noConcluyente, undefined);
});

test('el navegador llega y el servidor ve un 404: error real de la aplicación', () => {
  const r = decidir(navegadorOk(), servidor(404));
  assert.equal(r.status, 404);
});

test('el navegador llega y el servidor recibe 401/403/429: se considera disponible', () => {
  for (const codigo of [401, 403, 429]) {
    const r = decidir(navegadorOk(), servidor(codigo));
    assert.equal(r.status, 200, `código ${codigo}`);
    assert.match(r.error, new RegExp(String(codigo)));
  }
});

test('el navegador llega y el servidor no pudo conectar: sigue arriba', () => {
  const r = decidir(navegadorOk(), servidor(0, { error: 'timeout' }));
  assert.equal(r.status, 200);
});

test('el navegador llega y el proxy no responde: arriba pero avisa que no se verificó', () => {
  const r = decidir(navegadorOk(), null);
  assert.equal(r.status, 200);
  assert.match(r.error, /no verificado/);
});

test('el navegador falla pero el servidor ve el sitio: NO es caída, es no concluyente', () => {
  const r = decidir(navegadorFalla, servidor(200, { time: 310 }));
  assert.equal(r.status, 200);
  assert.equal(r.time, 310);
  assert.equal(r._source, 'servidor');
  assert.equal(r.noConcluyente, true);
});

test('el navegador rechaza la respuesta y el servidor ve 200: latencia estimada, no caída', () => {
  const r = decidir({ ...navegadorFalla, rechazo: true, tras: 180 }, servidor(200, { time: 900 }));
  assert.equal(r.status, 200);
  assert.equal(r.time, 180);
  assert.equal(r._source, 'estimado');
});

test('timeout del navegador con el servidor en 200: sigue siendo no concluyente', () => {
  const r = decidir({ ...navegadorFalla, rechazo: false }, servidor(200, { time: 900 }));
  assert.equal(r._source, 'servidor');
  assert.equal(r.noConcluyente, true);
});

test('fallan el navegador y el servidor: caída confirmada', () => {
  const r = decidir(navegadorFalla, servidor(0, { error: 'ECONNREFUSED' }));
  assert.equal(r.status, 0);
  assert.equal(r.time, leer(ctx, 'UMBRALES_LATENCIA').PENALIZACION_FALLO);
});

test('el navegador falla y el servidor recibe un 5xx: error de aplicación', () => {
  const r = decidir(navegadorFalla, servidor(503));
  assert.equal(r.status, 503);
});

test('certificado inválido confirmado por el servidor: caída aunque el navegador falle', () => {
  const r = decidir(navegadorFalla, servidor(200, { tlsError: 'CERT_HAS_EXPIRED' }));
  assert.equal(r.status, 0);
  assert.match(r.error, /Certificado inválido/);
});

test('la página responde pero no tiene el texto esperado: contenido inesperado (599)', () => {
  const r = decidir(navegadorOk(), servidor(200, { contenidoOk: false }), 'Iniciar sesión');
  assert.equal(r.status, 599);
  assert.match(r.error, /Iniciar sesión/);
});

test('contenido encontrado: no cambia el resultado', () => {
  const r = decidir(navegadorOk(), servidor(200, { contenidoOk: true }), 'Iniciar sesión');
  assert.equal(r.status, 200);
});

test('sitio http desde página https (el navegador no puede medir): decide el servidor', () => {
  assert.equal(decidir(null, servidor(200)).status, 200);
  assert.equal(decidir(null, servidor(200, { tlsError: 'X' })).status, 0);
  assert.equal(decidir(null, null).status, 0);
  assert.equal(decidir(null, servidor(500)).status, 500);
});

test('el detalle de ambas mediciones queda en diagnostics', () => {
  const r = decidir(navegadorOk(80), servidor(200));
  assert.match(r.diagnostics.navegador, /80 ms/);
  assert.match(r.diagnostics.servidor, /HTTP 200/);
});

// ---- verificarEstado: confirmación antes de marcar caído ----

function conMediciones(resultados) {
  const c = cargar(['js/config.js', 'js/medicion.js']);
  let i = 0;
  c.medirUnaVez = async () => ({ ...resultados[Math.min(i++, resultados.length - 1)] });
  return c;
}
const caida = { time: 99999, status: 0, error: 'sin respuesta' };
const bien = { time: 100, status: 200, error: null };

test('una falla que se recupera en la confirmación queda como OK con nota', async () => {
  const c = conMediciones([caida, bien]);
  const r = await c.verificarEstado('https://x.uy');
  assert.equal(r.status, 200);
  assert.equal(r.transitoria, true);
  assert.match(r.error, /Falla transitoria/);
});

test('si la confirmación también falla, se marca caído', async () => {
  const c = conMediciones([caida, caida]);
  const r = await c.verificarEstado('https://x.uy');
  assert.equal(r.status, 0);
  assert.ok(r.diagnostics.primerIntento);
});

test('si la primera medición está bien no se repite', async () => {
  let llamadas = 0;
  const c = cargar(['js/config.js', 'js/medicion.js']);
  c.medirUnaVez = async () => {
    llamadas++;
    return { ...bien };
  };
  await c.verificarEstado('https://x.uy');
  assert.equal(llamadas, 1);
});

test('medianaDe ignora un valor anómalo', () => {
  assert.equal(ctx.medianaDe([80, 90, 2000]), 90);
  assert.equal(ctx.medianaDe([100, 200]), 150);
});
