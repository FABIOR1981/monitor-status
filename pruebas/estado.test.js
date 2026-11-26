const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, leer } = require('./cargar');
const plano = (x) => JSON.parse(JSON.stringify(x));

const ctx = cargar(['js/config.js', 'js/historial.js', 'js/estado.js']);
const FREC = leer(ctx, 'FRECUENCIA_MONITOREO_MS');
assert.equal(FREC, 300000);
const ahora = 1_800_000_000_000;
const entrada = (t, s, minAtras, extra = {}) => ({ t, s, ts: ahora - minAtras * 60000, o: 'navegador', ...extra });

test('clasificarEntrada: ok, lento, caído y sin datos (un dato medido por el servidor también es ok/lento)', () => {
  assert.equal(ctx.clasificarEntrada(entrada(120, 200, 1)), 'ok');
  assert.equal(ctx.clasificarEntrada(entrada(800, 200, 1)), 'ok');
  assert.equal(ctx.clasificarEntrada(entrada(801, 200, 1)), 'lento');
  assert.equal(ctx.clasificarEntrada(entrada(310, 200, 1, { nc: true })), 'ok');
  assert.equal(ctx.clasificarEntrada(entrada(120, 503, 1)), 'caido');
  assert.equal(ctx.clasificarEntrada(entrada(99999, 0, 1)), 'caido');
  assert.equal(ctx.clasificarEntrada(entrada(120, 599, 1)), 'caido');
  assert.equal(ctx.clasificarEntrada(null), 'sin-datos');
});

test('motivoCaida distingue contenido, sin respuesta y código HTTP', () => {
  assert.equal(ctx.motivoCaida(entrada(120, 599, 1)).tipo, 'contenido');
  assert.equal(ctx.motivoCaida(entrada(99999, 0, 1)).tipo, 'sin-respuesta');
  assert.deepEqual(
    JSON.parse(JSON.stringify(ctx.motivoCaida(entrada(120, 503, 1)))),
    { tipo: 'http', codigo: 503 }
  );
  assert.equal(ctx.motivoCaida(entrada(120, 200, 1)), null);
});

test('formatearLatencia muestra siempre milisegundos', () => {
  assert.deepEqual({ ...ctx.formatearLatencia(310) }, { valor: '310', unidad: 'ms' });
  assert.deepEqual({ ...ctx.formatearLatencia(1820) }, { valor: '1820', unidad: 'ms' });
  assert.deepEqual({ ...ctx.formatearLatencia(NaN) }, { valor: '—', unidad: '' });
});

test('nivelLatencia sigue los umbrales de la leyenda', () => {
  assert.equal(ctx.nivelLatencia(299), 'VERY_FAST');
  assert.equal(ctx.nivelLatencia(300), 'VERY_FAST');
  assert.equal(ctx.nivelLatencia(450), 'FAST');
  assert.equal(ctx.nivelLatencia(700), 'NORMAL');
  assert.equal(ctx.nivelLatencia(1200), 'SLOW');
  assert.equal(ctx.nivelLatencia(2500), 'CRITICAL');
  assert.equal(ctx.nivelLatencia(4000), 'RISK');
  assert.equal(ctx.nivelLatencia(8000), 'EXTREME_RISK');
});

test('construirBarras: siempre devuelve la cantidad pedida, de la más vieja a la más nueva', () => {
  const entradas = [entrada(100, 200, 10), entrada(120, 200, 5), entrada(900, 200, 0)];
  const barras = ctx.construirBarras(entradas, ahora, 6, FREC);
  assert.equal(barras.length, 6);
  assert.deepEqual(plano(barras.slice(0, 3).map((b) => b.clase)), ['ok', 'ok', 'lento']);
  assert.ok(barras.slice(3).every((b) => b.clase === 'vacio'));
});

test('construirBarras: un corte entre mediciones es un solo hueco, sin importar cuánto dure', () => {
  const corto = ctx.construirBarras([entrada(100, 200, 20), entrada(100, 200, 0)], ahora, 6, FREC);
  assert.deepEqual(plano(corto.map((b) => b.clase).slice(0, 4)), ['ok', 'hueco', 'ok', 'vacio']);

  const largo = ctx.construirBarras([entrada(100, 200, 600), entrada(100, 200, 0)], ahora, 6, FREC);
  assert.deepEqual(plano(largo.map((b) => b.clase).slice(0, 4)), ['ok', 'hueco', 'ok', 'vacio']);
});

test('construirBarras: pequeñas demoras del ciclo no inventan huecos', () => {
  // ciclos de 5 min + 15 s de medición, varias veces seguidas
  const entradas = [];
  for (let i = 5; i >= 0; i--) {
    entradas.push({ t: 100, s: 200, ts: ahora - i * (FREC + 15000), o: 'navegador' });
  }
  const barras = ctx.construirBarras(entradas, ahora, 6, FREC);
  assert.ok(barras.every((b) => b.clase === 'ok'));
});

test('construirBarras: una caída ocupa toda la altura', () => {
  const barras = ctx.construirBarras([entrada(99999, 0, 0)], ahora, 3, FREC);
  assert.equal(barras[0].clase, 'caido');
  assert.equal(barras[0].alto, 100);
});

test('construirVista arma el mosaico con origen y errores', () => {
  const entradas = [entrada(99999, 0, 10, { e: 'timeout' }), entrada(310, 200, 0, { o: 'servidor', nc: true })];
  const vista = ctx.construirVista(
    { nombre: 'Notas', url: 'https://n.uy', grupo: 'CRITICO' },
    entradas,
    { error: 'no concluyente', diagnostics: { navegador: 'x' } },
    ahora,
    { cantidadBarras: 24, frecuenciaMs: FREC }
  );
  assert.equal(vista.estado, 'ok');
  assert.equal(vista.critico, true);
  assert.equal(vista.origen, 'servidor');
  assert.equal(vista.errores.length, 1);
  assert.equal(vista.tasaFallos, 50);
  assert.equal(vista.promedio, 310);
  assert.equal(vista.barras.length, 24);
});

test('construirVista de un sitio caído no muestra latencia', () => {
  const vista = ctx.construirVista(
    { nombre: 'X', url: 'https://x.uy' },
    [entrada(99999, 503, 0)],
    null,
    ahora,
    { cantidadBarras: 12, frecuenciaMs: FREC }
  );
  assert.equal(vista.estado, 'caido');
  assert.equal(vista.valor, '—');
  assert.equal(vista.motivo.codigo, 503);
});

test('construirVista sin mediciones: sin datos', () => {
  const vista = ctx.construirVista({ nombre: 'X', url: 'u' }, [], null, ahora, { cantidadBarras: 12, frecuenciaMs: FREC });
  assert.equal(vista.estado, 'sin-datos');
  assert.equal(vista.haceMs, null);
});

test('resumirVistas: "funcionando" cuenta todo lo que no está caído', () => {
  const v = (estado) => ({ estado });
  const r = ctx.resumirVistas([v('ok'), v('ok'), v('lento'), v('ok'), v('caido'), v('sin-datos')]);
  assert.equal(r.total, 6);
  assert.equal(r.funcionando, 4);
  assert.equal(r.medidos, 5);
  assert.equal(r.conteo.caido, 1);
});
