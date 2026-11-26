# Monitor de Estado de Servicios

Monitor visual y ligero que muestra el estado (OK / error) y la latencia (ms) de tus sitios web. Guarda el historial en el navegador (ventana móvil de 1 a 9 horas) y alerta cuando detecta fallos o latencias altas.

Características principales:

- Pizarrón de mosaicos: resumen arriba, servicios críticos en grande y el resto en mosaicos chicos, con barras de historial y huecos "sin medición".
- Estados: OPERATIVO, DEGRADADO (> 800 ms), CAÍDO y SIN DATOS. Si el navegador no puede medir un sitio se usa la medición del servidor y la tarjeta lo indica con "desde EE.UU.".
- Reloj de frescura: avisa cuando los datos están desactualizados (el monitor solo mide con la pantalla abierta).
- Modo pantalla completa para TV.
- Alertas visuales y registro de errores, con opción para copiar detalles.
- Temas claro/oscuro y leyenda de umbrales para interpretar latencias.

Estructura del código (`js/`): `medicion.js` (medir y decidir caído), `historial.js` (guardado), `estado.js` (qué se muestra, funciones puras), `pizarron.js` (pantalla), `principal.js` (ciclo). Pruebas de la lógica: `npm test`.

Uso rápido:

- Abrí `index.html` en el navegador para ver el tablero en tiempo real.
- Consultá la leyenda en `leyenda.html` para entender colores y umbrales.

Cómo se decide que un sitio está caído:

- La latencia se mide desde el navegador de quien mira el tablero; el código HTTP lo aporta el servidor del monitor.
- Antes de marcar caído se repite la medición una vez (a los 3 s). Una falla que se recupera queda como OK con nota.
- Opcional: en `data/webs.json` cada sitio puede tener `"contiene": "texto"`. Si la página responde pero no contiene ese texto, se marca como error (código 599).
- La latencia es la mediana de 3 muestras del navegador (si la primera ya es lenta, se usa una sola).
- Pasá el mouse sobre la latencia para ver el detalle de cada medición.

Dónde ver documentación y configuración:

- Manual de usuario (uso de la pantalla, sin datos técnicos): [MANUAL_USUARIO.md](https://github.com/FABIOR1981/documentacion-central/blob/main/monitor-status/documentacion/MANUAL_USUARIO.md) ([PDF](https://github.com/FABIOR1981/documentacion-central/blob/main/monitor-status/documentacion/MANUAL_USUARIO.pdf)).
- Documentación técnica y opciones de despliegue: en [documentacion-central](https://github.com/FABIOR1981/documentacion-central/tree/main/monitor-status/documentacion) (ver `readme.md`).
- Funciones serverless: `functions/api/` (Cloudflare Pages): `/api/check-status` (medición desde el servidor) y `/api/webs` (lista de sitios guardada en KV).
- Cloudflare Pages: Build command `npm run construir`, Output directory `dist`. Binding KV: variable `WEBS` (Settings > Bindings > KV namespace) para que el ABM guarde la lista. Opcional: variable `REQUEST_TIMEOUT_MS`.

Contribuir:

- Reportá issues o enviá pull requests si querés mejorar algo. Puedo agregar una guía corta de contribución si querés.
