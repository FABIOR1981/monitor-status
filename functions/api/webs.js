// GET /api/webs  -> lista de sitios (KV; si está vacío, data/webs.json)
// POST /api/webs -> guarda { data: [...] } en KV. Binding: WEBS.

const KEY = 'webs';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });

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
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });

export async function onRequestGet({ request, env }) {
  const guardada = await env.WEBS?.get(KEY);
  if (guardada) {
    return new Response(guardada, { headers: { ...HEADERS, 'X-Origen-Lista': 'kv' } });
  }

  // primera vez (o sin KV): el archivo del repo hace de lista inicial
  const archivo = await env.ASSETS?.fetch(new URL('/data/webs.json', request.url));
  if (archivo?.ok) {
    return new Response(await archivo.text(), { headers: { ...HEADERS, 'X-Origen-Lista': 'archivo' } });
  }
  return json({ error: 'No hay lista de sitios disponible' }, 404);
}

export async function onRequestPost({ request, env }) {
  if (!env.WEBS) {
    return json({ error: 'KV no configurado', help: 'Enlazá un KV con el nombre WEBS (Settings > Bindings)' }, 501);
  }

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'El cuerpo debe ser JSON' }, 400);

  const problema = checkLista(body.data);
  if (problema) return json({ error: problema }, 400);

  await env.WEBS.put(KEY, JSON.stringify(body.data, null, 2));
  return json({ success: true, total: body.data.length, guardado: new Date().toISOString() });
}

export const onRequest = () => json({ error: 'Método no permitido' }, 405);
