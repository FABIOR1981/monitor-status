const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const net = require('net');

// No validamos los certificados SSL porque lo importante es saber si el servicio responde, no si el certificado es válido
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const httpAgent = new http.Agent({
  keepAlive: false,
});

exports.handler = async (event, context) => {
  const targetUrl = event.queryStringParameters.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parámetro 'url' requerido." }),
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const controller = new AbortController();
  const timeoutMs = 12000; // aumentar timeout para diagnosticar timeouts intermitentes
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startTime = Date.now();

    // Determinar el agente según el protocolo del target inicial.
    // Evitamos pasar una función agent a node-fetch porque en algunos entornos
    // las redirecciones HTTP->HTTPS pueden intentar reutilizar un agente
    // incorrecto y provocar errores. Seleccionamos el agente antes del fetch.
    let agentToUse;
    try {
      const parsed = new URL(targetUrl);
      agentToUse = parsed.protocol === 'http:' ? httpAgent : httpsAgent;

      // Diagnósticos: resolver DNS y probar conexión TCP al host antes del fetch
      let dnsInfo = null;
      try {
        const lookup = await dns.lookup(parsed.hostname);
        dnsInfo = { address: lookup.address, family: lookup.family };
        console.log(`DNS lookup for ${parsed.hostname}: ${lookup.address}`);
      } catch (e) {
        dnsInfo = { error: e.message };
        console.warn(`DNS lookup failed for ${parsed.hostname}: ${e.message}`);
      }

      // Prueba TCP simple al puerto según esquema
      const port = parsed.protocol === 'http:' ? 80 : 443;
      const tcpResult = await (async function testTcp(host, port, tmo) {
        return new Promise((resolve) => {
          const socket = net.createConnection({ host, port }, () => {
            socket.destroy();
            resolve({ ok: true });
          });
          socket.setTimeout(Math.min(5000, tmo - 1000));
          socket.on('error', (err) => {
            socket.destroy();
            resolve({ ok: false, error: err.message });
          });
          socket.on('timeout', () => {
            socket.destroy();
            resolve({ ok: false, error: 'tcp_timeout' });
          });
        });
      })(parsed.hostname, port, timeoutMs);

      console.log(`TCP test for ${parsed.hostname}:${port} -> ${JSON.stringify(tcpResult)}`);
    } catch (e) {
      // Si la URL no es válida, dejar agentToUse undefined y permitir el comportamiento por defecto
      agentToUse = undefined;
    }

    // Intentos con reintentos y UA alternativo para mitigar bloqueos o fallos transitorios
    const defaultUA = 'Mozilla/5.0 (Monitor-Status-Check)';
    const altUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36';

    const attemptConfigs = [
      { agent: agentToUse, ua: defaultUA },
      { agent: undefined, ua: defaultUA },
      { agent: undefined, ua: altUA },
    ];

    let lastError = null;
    let attemptIndex = 0;
    const attemptsDiagnostics = [];

    for (const cfg of attemptConfigs) {
      attemptIndex++;
      const attemptStart = Date.now();
      try {
        console.log(`Attempt ${attemptIndex} for ${targetUrl} (agent=${cfg.agent ? 'yes' : 'no'}, ua=${cfg.ua})`);
        const resp = await fetch(targetUrl, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
          agent: cfg.agent,
          headers: {
            'User-Agent': cfg.ua,
          },
        });

        const attemptEnd = Date.now();
        const attemptTime = attemptEnd - attemptStart;
        attemptsDiagnostics.push({ attempt: attemptIndex, status: resp.status, time: attemptTime, ua: cfg.ua, agent: !!cfg.agent });

        // Consideramos éxito si responde con cualquier código HTTP (incluso 4xx/5xx)
        clearTimeout(timeoutId);
        console.log(`Success attempt ${attemptIndex} for ${targetUrl} - status ${resp.status}`);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ status: resp.status, time: attemptTime, attempts: attemptsDiagnostics }),
        };
      } catch (errAttempt) {
        const attemptEnd = Date.now();
        const attemptTime = attemptEnd - attemptStart;
        attemptsDiagnostics.push({ attempt: attemptIndex, error: errAttempt.message, time: attemptTime, ua: cfg.ua, agent: !!cfg.agent });
        console.warn(`Attempt ${attemptIndex} failed for ${targetUrl}: ${errAttempt.message}`);
        lastError = errAttempt;
        // Backoff entre intentos
        if (attemptIndex < attemptConfigs.length) {
          await new Promise((r) => setTimeout(r, 500 * attemptIndex));
        }
      }
    }

    // Si llegamos acá, todos los intentos fallaron
    throw lastError || new Error('All attempts failed');

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(
      `URL: ${targetUrl} - Status: ${response.status} - Time: ${responseTime}ms`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: response.status,
        time: responseTime,
      }),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    console.error(
      `Error de conexión para ${targetUrl}: ${error.name} - ${error.message}`
    );

    // Siempre devolvemos HTTP 200 con status=0 para que se pueda saber si:
    // - Falló la función serverless (sería un HTTP 500 real)
    // - Falló el servicio que estamos monitoreando (status: 0)
    // Incluir diagnósticos en la respuesta para facilitar el debug desde el frontend
    const diagnostics = {};
    try {
      // si la excepción contiene información útil, añadirla
      diagnostics.errorName = error.name;
      diagnostics.errorMessage = error.message;
    } catch (e) {
      // ignore
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 0,
        time: 99999,
        error: `${error.name}: ${error.message}`,
        diagnostics,
      }),
    };
  }
};
