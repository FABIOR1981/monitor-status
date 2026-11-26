// GET /api/check-status?url=...&contiene=texto
// Mide desde el servidor de Cloudflare. La latencia real la mide el navegador (js/medicion.js);
// esto aporta el código HTTP y, si se pide, si la página contiene un texto.
// Un certificado inválido llega como error de conexión (status 0): Cloudflare no da el motivo.

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const MAX_BYTES = 256 * 1024;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: HEADERS });

const norm = (txt) =>
  String(txt)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// true/false, o null si se cortó la lectura antes de poder concluir
export async function bodyHas(body, texto) {
  if (!body) return false;
  const buscado = norm(texto);
  const reader = body.getReader();
  const utf8 = new TextDecoder('utf-8');
  const latin1 = new TextDecoder('latin1');
  const chunks = [];
  let total = 0;
  let found = false;

  try {
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;

      // se decodifica todo lo leído: el texto puede quedar partido entre dos chunks
      const buf = new Uint8Array(total);
      let pos = 0;
      for (const c of chunks) {
        buf.set(c, pos);
        pos += c.length;
      }
      if (norm(utf8.decode(buf)).includes(buscado) || norm(latin1.decode(buf)).includes(buscado)) {
        found = true;
        break;
      }
    }
  } catch {
    found = null;
  }

  await reader.cancel().catch(() => {});
  return found;
}

export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;
  const target = params.get('url');
  if (!target) return json({ error: "Parámetro 'url' requerido." }, 400);

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    parsed = null;
  }
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return json({ error: 'La URL debe ser http o https.' }, 400);
  }

  const contiene = (params.get('contiene') || '').slice(0, 100).trim();
  const timeout = parseInt(env.REQUEST_TIMEOUT_MS || '8000', 10);
  const punto = request.cf?.colo || null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const t0 = Date.now();

  try {
    const res = await fetch(target, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'es-UY,es;q=0.9',
      },
    });
    const time = Date.now() - t0; // hasta los headers, no incluye bajar el cuerpo
    const ok = res.status >= 200 && res.status < 400;

    let contenidoOk = null;
    if (contiene && ok) {
      contenidoOk = await bodyHas(res.body, contiene);
    } else {
      await res.body?.cancel().catch(() => {});
    }

    return json({ status: res.status, ok, time, origen: 'servidor', tlsError: null, contenidoOk, punto });
  } catch (err) {
    const error =
      err.name === 'AbortError' ? `Timeout: sin respuesta en ${timeout} ms` : `${err.name}: ${err.message}`;
    // 200 con status 0: distingue "falló el sitio" de "falló la función"
    return json({
      status: 0,
      ok: false,
      time: 99999,
      origen: 'servidor',
      error,
      errorCode: null,
      punto,
      diagnostics: { errorName: err.name, errorMessage: err.message },
    });
  } finally {
    clearTimeout(timer);
  }
}
