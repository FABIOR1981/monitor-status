======================================================
GUÍA DE SOLUCIÓN DE PROBLEMAS (TROUBLESHOOTING.md)
======================================================

Este documento cubre los problemas más comunes encontrados durante
el despliegue y la operación del monitor de disponibilidad.

---

1. PROBLEMAS DE DESPLIEGUE Y CONFIGURACIÓN

---

### Problema 1.1: El sitio web está en blanco tras el despliegue.

**Causa:** Netlify no encontró los archivos del frontend o
no ejecutó correctamente la función Serverless.

**Verificación y Solución:**

1.  **Revisar Netlify Logs:** Vaya al panel de Netlify, sección
    **Deploys**. Busque el último despliegue y asegúrese de que
    no hay errores en la fase de "Building" o "Deploying".
2.  **Verificar netlify.toml:** Confirme que el archivo
    `netlify.toml` exista y apunte correctamente:
    `functions = "netlify/functions"`
3.  **Verificar package.json:** Asegúrese de que `package.json`
    contenga la dependencia `node-fetch`.

### Problema 1.2: La tabla se carga, pero aparece un error 404/500

en la consola al intentar verificar una URL.

**Causa:** La función Serverless no está desplegada correctamente
o la ruta de invocación es incorrecta.

**Verificación y Solución:**

1.  **Ruta de la Función:** Confirme que el archivo
    `check-status.js` está en la ruta exacta:
    `monitor-status-test/netlify/functions/check-status.js`
2.  **Ruta de Llamada (config.js):** Verifique que la constante
    `PROXY_ENDPOINT` en `js/config.js` esté configurada
    correctamente:
    > const PROXY_ENDPOINT = "/.netlify/functions/check-status";

---

2. PROBLEMAS DE DISPONIBILIDAD Y LATENCIA

---

### Problema 2.1: Un sitio reporta "CAÍDA 🔴" (Estado 0 o 599)

aunque sé que está en línea.

**Causa A: Fallo de Conexión / DNS.**

- **Diagnóstico:** El entorno Node.js del Serverless no pudo
  resolver el nombre de host o establecer la conexión.
- **Solución:** Revise el archivo `webs.json` (ubicado en la raíz)
  y confirme que la URL esté escrita perfectamente (incluyendo
  `http://` o `https://`).

**Causa B: Timeout del Proxy.**

- **Diagnóstico:** La función Serverless (`check-status.js`)
  tiene un límite de 9 segundos (9000 ms) antes de que se
  cierre la conexión. Si el servidor de destino tarda más
  de ese tiempo en enviar los encabezados, la función devuelve
  un `status: 0`.
- **Solución:** Es una **caída por rendimiento**. El servidor
  está demasiado lento. La solución es optimizar el
  servidor de destino. Nota: El proxy ignora errores de
  certificado SSL para poder medir disponibilidad de servicios
  con certificados autofirmados o expirados.

**Causa C: Demasiados Redirects (Redirecciones).**

- **Diagnóstico:** El `check-status.js` tiene un límite de
  seguimiento de redirecciones (`follow: 20`). Si la URL
  supera ese número de saltos, fallará.
- **Solución:** Utilice la URL de destino final en `data/webs.json`.

### Problema 2.2: El estado de latencia siempre es 'LENTO' o 'CRÍTICO'.

**Causa:** La constante `UMBRALES_LATENCIA` está demasiado
ajustada o el servidor está bajo carga.

**Solución:**

1.  **Revisar Justificación:** Consulte `JUSTIFICACION_RANGOS_LATENCIA.md`
    para entender los umbrales (300ms, 500ms, etc.).
2.  **Ajuste:** Si el rendimiento del servidor no puede mejorar,
    considere ajustar los valores en `script.js` (si no están
    centralizados) para que se adapten a la realidad operativa.

---

3. PROBLEMAS DEL FRONTEND Y DATOS

---

### Problema 3.1: Los promedios históricos no se reinician

después de cambiar una URL o arreglar un sitio.

**Causa:** El historial de latencia se almacena en el
navegador local (`sessionStorage`) y no en el servidor.
El promedio se sigue calculando con los datos antiguos.

**Solución:**

1.  **Botón Reiniciar:** Presione el botón "🔄 Reiniciar Monitoreo"
    junto al selector de duración. Esto limpiará todo el
    historial y reiniciará las mediciones.
2.  **Manualmente - Abrir Consola:** Vaya a las herramientas de desarrollo
    (F12), pestaña **Application** (Aplicación) o **Storage**
    (Almacenamiento).
3.  **Limpiar:** En `Session Storage`, busque las claves que comienzan
    con `historial_`, `promedio_`, `errores_` y bórrelas.
    Esto forzará al monitor a empezar a calcular los promedios
    desde cero en la siguiente ejecución.

### Problema 3.2: El Tema PRO (`monitor_pro.css`) no se aplica.

**Causa:** El parámetro de la URL está mal escrito o el archivo
no se carga.

**Solución:**

1.  **Verificar URL:** Asegúrese de que la URL termine exactamente
    con **`/?tema=pro`**.
2.  **Verificar Archivo:** Confirme que el archivo `monitor_pro.css`
    existe en la carpeta **`css/`** del proyecto.
3.  **Verificar config.js:** La constante `TEMA_FILES` en `js/config.js`
    debe contener el mapeo correcto de temas a archivos CSS.
    Los temas disponibles son: def, pro, min.

---

4. PROBLEMAS CON EL SISTEMA DE EXPANSIÓN DE ERRORES

---

### Problema 4.1: El botón toggle (▼/▲) de errores no funciona.

**Causa:** La función de toggle no está cargada o los elementos
HTML no existen.

**Solución:**

1.  **Verificar script.js:** Confirme que la función `toggleErrores(url)`
    esté definida en `js/script.js`.
2.  **Verificar HTML:** El botón debe tener el atributo
    `onclick="toggleErrores('URL')"` donde URL es la dirección
    del sitio monitoreado.
3.  **Verificar CSS:** Los estilos `.error-details` deben estar
    definidos en `css/monitor_base.css`.
4.  **Abrir Consola:** Presione F12 y busque errores JavaScript.

### Problema 4.2: El contador de errores "⚠️ X/Y" no aparece.

**Causa:** No se han detectado errores o la función de contador
está deshabilitada.

**Solución:**

1.  **Provocar un Error:** Cambia temporalmente una URL en `webs.json`
    a una dirección inválida (ej: `http://sitio-inexistente.test`).
2.  **Verificar sessionStorage:** Abre la consola (F12), pestaña
    **Application** > **Session Storage** y busca claves que
    comiencen con `errores_`. Deben contener un array de errores.
3.  **Verificar config.js:** La constante `LIMITE_ERRORES_MOSTRADOS`
    debe estar definida (valor recomendado: 10).

---

5. PROBLEMAS CON EL SELECTOR DE DURACIÓN

---

### Problema 5.1: Cambiar la duración no afecta el historial.

**Causa:** El selector no está conectado correctamente o la
función de cambio no se ejecuta.

**Solución:**

1.  **Verificar HTML:** Confirme que existe
    `<select id="selector-duracion">` en `index.html`.
2.  **Verificar config.js:** El objeto `DURACION_OPCIONES` debe
    contener:
    ```javascript
    { '12h': 144, '1d': 288, '3d': 864, '7d': 2016 }
    ```
3.  **Verificar script.js:** La función que escucha el evento
    `change` del selector debe actualizar `sessionStorage` con
    la clave `duracion_seleccionada`.
4.  **Reiniciar Monitoreo:** Presione el botón "🔄 Reiniciar Monitoreo"
    después de cambiar la duración para limpiar el historial antiguo.

### Problema 5.2: El monitoreo no se pausa al alcanzar el límite.

**Causa:** La validación del límite de mediciones no funciona.

**Solución:**

1.  **Verificar script.js:** La función de monitoreo debe comprobar
    si el número de mediciones almacenadas es >= al límite
    configurado antes de realizar una nueva medición.
2.  **Verificar Consola:** Abre F12 y busca mensajes que indiquen
    "Límite de mediciones alcanzado" o similar.
3.  **Cambiar Duración:** Si el límite está mal configurado,
    cambia temporalmente a una duración mayor (ej: de 12h a 1d)
    y presiona "Reiniciar Monitoreo".

---

6. PROBLEMAS CON LA PÁGINA DE LEYENDA

---

### Problema 6.1: leyenda.html no carga o muestra estilos incorrectos.

**Causa:** Los archivos CSS de leyenda no existen o el tema
no se aplica correctamente.

**Solución:**

1.  **Verificar Archivos:** Confirme que existen `leyenda_base.css`,
    `leyenda_def.css`, `leyenda_pro.css`, `leyenda_min.css` en
    la carpeta **`css/`**.
2.  **Verificar URL:** La página debe recibir el parámetro `?tema=`
    (ej: `leyenda.html?tema=pro`).
3.  **Verificar leyenda_script.js:** Este archivo debe aplicar
    el tema dinámicamente al cargar la página.
4.  **Verificar i18n:** Si los textos aparecen en inglés cuando
    deberían estar en español, verifica que `?lang=es` esté
    en la URL.

---

7. PROBLEMAS CON INTERNACIONALIZACIÓN (i18n)

---

### Problema 7.1: Los textos aparecen en inglés cuando debería

ser español (o viceversa).

**Causa:** El parámetro de idioma no está en la URL o los
archivos de traducción no se cargan.

**Solución:**

1.  **Verificar URL:** Asegúrese de que la URL contenga `?lang=es`
    o `?lang=en`.
2.  **Verificar Archivos:** Confirme que `js/i18n_es.js` y
    `js/i18n_en.js` existan y estén correctamente formateados.
3.  **Verificar script.js:** La función que carga traducciones
    debe leer el parámetro `lang` de la URL y aplicar el
    objeto de traducciones correspondiente.
4.  **Abrir Consola:** Presione F12 y busque errores de carga
    de archivos JavaScript.
