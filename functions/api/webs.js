// GET /api/webs  -> lista de sitios (KV; si está vacío, data/webs.json)
// POST /api/webs -> guarda { data: [...] } en KV (header X-Clave). Binding: WEBS.

const KEY = 'webs';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });

// Clave provisoria: la fecha de hoy en Uruguay (AAAAMMDD)
export const claveDelDia = (ahora = Date.now()) =>
  new Date(ahora - 3 * 3600 * 1000).toISOString().slice(0, 10).replaceAll('-', '');

export function checkLista(data) {
  if (!Array.isArray(data)) return 'Los datos deben ser una lista';
  if (data.length > 200) return 'Demasiados sitios (máximo 200)';
  for (const s of data) {
    if (!s || typeof s !== 'object') return 'Cada sitio debe ser un objeto';
    if (!s.nombre || !s.url) return 'Cada sitio debe tener nombre y url';
    if (!/^https?:\/\//i.test(String(s.url))) {
      return `La url de "${s.nombre}" debe empezar con http:// o https://`;
    }
  }
  return null;
}

export const onRequestOptions = () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Clave',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });

// KV; si está vacío (primera vez o sin KV), el archivo del repo hace de lista inicial
export async function leerLista(request, env) {
  const guardada = await env.WEBS?.get(KEY);
  if (guardada) return { texto: guardada, origen: 'kv' };

  const archivo = await env.ASSETS?.fetch(new URL('/data/webs.json', request.url));
  if (archivo?.ok) return { texto: await archivo.text(), origen: 'archivo' };
  return null;
}

export async function onRequestGet({ request, env }) {
  const lista = await leerLista(request, env);
  if (!lista) return json({ error: 'No hay lista de sitios disponible' }, 404);
  return new Response(lista.texto, { headers: { ...HEADERS, 'X-Origen-Lista': lista.origen } });
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('X-Clave') !== claveDelDia()) {
    return json({ error: 'Clave incorrecta' }, 401);
  }

  if (!env.WEBS) {
    return json({ error: 'KV no configurado', help: 'Enlazá un KV con el nombre WEBS (Settings > Bindings)' }, 501);
  }

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'El cuerpo debe ser JSON' }, 400);
  if (body.verificar) return json({ success: true });

  const problema = checkLista(body.data);
  if (problema) return json({ error: problema }, 400);

  await env.WEBS.put(KEY, JSON.stringify(body.data, null, 2));
  return json({ success: true, total: body.data.length, guardado: new Date().toISOString() });
}

export const onRequest = () => json({ error: 'Método no permitido' }, 405);
