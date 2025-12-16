const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const https = require('https');
const http = require('http');

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
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      // Usamos un agente que permite cambiar entre HTTPS y HTTP sin que falle por el cambio de protocolo
      agent: (_parsedURL) => {
        if (_parsedURL.protocol === 'http:') {
          return httpAgent;
        } else {
          return httpsAgent;
        }
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Monitor-Status-Check)',
      },
    });

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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 0,
        time: 99999,
        error: `${error.name}: ${error.message}`,
      }),
    };
  }
};
