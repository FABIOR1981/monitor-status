// Avisos flotantes de error: una vez por sitio, hasta que se recupera (por sesión).
// Los llama principal.js con registrarErrorSitio / limpiarErrorSitio.
(function () {
  const CLAVE = 'erroresNotificadosMonitor';

  function leerNotificados() {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE)) || {};
    } catch {
      return {};
    }
  }

  function guardarNotificados(obj) {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(obj));
    } catch (err) {
      console.warn('No se pudo guardar los avisos ya mostrados:', err);
    }
  }

  function cargarCss() {
    if (document.getElementById('alertas-error-css')) return;
    const link = document.createElement('link');
    link.id = 'alertas-error-css';
    link.rel = 'stylesheet';
    link.href = 'css/alertas_error.css';
    document.head.appendChild(link);
  }

  function copiarConFallback(texto) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.readOnly = true;
    area.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }

  async function copiar(texto) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (err) {
        console.warn('Clipboard API falló, se usa el método alternativo:', err);
      }
    }
    return copiarConFallback(texto);
  }

  function mostrarNotificacion(mensaje) {
    if (!document.body) return;
    cargarCss();

    let cont = document.getElementById('notificaciones-errores');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'notificaciones-errores';
      document.body.appendChild(cont);
    }

    const general = window.TEXTOS_ACTUAL?.general;
    const labelCopiar = general?.BTN_COPIAR || 'Copiar';
    const labelCopiado = general?.BTN_COPIADO || '¡Copiado!';

    const notif = document.createElement('div');
    notif.classList.add('notif-alarma');

    const texto = document.createElement('div');
    texto.classList.add('texto');
    texto.textContent = mensaje;

    const btnCopiar = document.createElement('button');
    btnCopiar.classList.add('btn-copiar');
    btnCopiar.textContent = labelCopiar;
    btnCopiar.onclick = async () => {
      if (!(await copiar(mensaje))) return;
      btnCopiar.textContent = labelCopiado;
      setTimeout(() => (btnCopiar.textContent = labelCopiar), ALERTAS_COPY_LABEL_RESET_MS);
    };

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('btn-cerrar');
    btnCerrar.textContent = '×';
    btnCerrar.setAttribute('aria-label', 'Cerrar notificación');
    btnCerrar.onclick = () => notif.remove();

    notif.append(texto, btnCopiar, btnCerrar);
    cont.appendChild(notif);
    setTimeout(() => notif.remove(), ALERTAS_AUTO_CLOSE_MS);
  }

  window.limpiarErrorSitio = function (nombre) {
    const notificados = leerNotificados();
    if (!notificados[nombre]) return;
    delete notificados[nombre];
    guardarNotificados(notificados);
  };

  window.registrarErrorSitio = function (nombre, url, latencia, codigo, descripcion, diagnostics) {
    const notificados = leerNotificados();
    if (notificados[nombre]) return;
    notificados[nombre] = true;
    guardarNotificados(notificados);

    const info = window.TEXTOS_ACTUAL?.httpCodes?.find((e) => e.code === codigo);

    let msg = `ALERTA: Error detectado en "${nombre}"\nURL: ${url}\n`;
    if (latencia !== undefined) msg += `Latencia: ${latencia} ms\n`;
    msg += `Código: ${codigo}${info ? ` - ${info.label}` : ''}\n`;
    // la descripción que manda la medición pesa más que la genérica del código
    const desc = descripcion || info?.description;
    if (desc) msg += `Descripción: ${desc}`;
    if (diagnostics) msg += `\n\nDiagnostics: ${JSON.stringify(diagnostics)}`;

    mostrarNotificacion(msg);
  };
})();
