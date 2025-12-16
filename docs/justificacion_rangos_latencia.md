======================================================
JUSTIFICACIÓN DE UMBRALES DE LATENCIA (script.js)
======================================================

NOTA SOBRE EL FORMATO:
El texto se ha limitado a un ancho cómodo (aprox. 70-80
caracteres por línea) para optimizar la legibilidad
en la mayoría de los editores de texto y terminales.
Este ancho es un estándar de diseño para lectura
en pantalla, ya que reduce la fatiga visual.

---

## CONSTANTE: UMBRALES_LATENCIA

// Umbrales de latencia para clasificar el rendimiento (en milisegundos)
const UMBRALES_LATENCIA = {
MUY_RAPIDO: 300,
RAPIDO: 500,
NORMAL: 800,
LENTO: 1500,
CRITICO: 3000,
RIESGO: 5000,
PENALIZACION_FALLO: 99999
};

// Nota: Los valores superiores a 5000ms se clasifican como
// RIESGO EXTREMO, y >= 99999ms como CAÍDA TOTAL.

---

## OBJETIVO DE LA ESCALA

La escala está diseñada para clasificar la respuesta
del servidor (TTFB) basándose en dos criterios: la
psicología de la experiencia del usuario (UX) y los
estándares de rendimiento web de la industria (Google
Core Web Vitals).

---

## JUSTIFICACIÓN INDIVIDUAL DE LOS UMBRALES

1. ## MUY_RAPIDO: <= 300 ms

   - CLASIFICACIÓN: EXCELENTE (🚀 Verde Intenso)
   - JUSTIFICACIÓN UX: Umbral agresivo que garantiza
     una respuesta percibida como INSTANTÁNEA. El cerebro
     humano percibe cualquier respuesta por debajo de
     100ms como instantánea (Regla de Nielsen). Mantener
     el umbral hasta 300ms asegura una experiencia fluida.
   - SIGNIFICADO OPERACIONAL: El sistema está operando
     en condiciones óptimas y con alta eficiencia.

2. ## RAPIDO: 300 ms < Latencia <= 500 ms

   - CLASIFICACIÓN: BUENO (⭐ Verde Claro)
   - JUSTIFICACIÓN UX: Límite de la Percepción Inconsciente.
     La demora es notable pero el usuario no la percibe
     como una espera molesta. Es un objetivo común en
     Acuerdos de Nivel de Servicio (SLA).
   - SIGNIFICADO OPERACIONAL: Rendimiento excelente, buen
     punto de control para procesos rápidos de backend.

3. ## NORMAL: 500 ms < Latencia <= 800 ms

   - CLASIFICACIÓN: ACEPTABLE (✅ Amarillo)
   - JUSTIFICACIÓN UX: La Distracción Comienza. A partir
     de 500ms el usuario puede comenzar a desviarse, aunque
     puede mantener su hilo de pensamiento.
   - JUSTIFICACIÓN ESTÁNDAR: Se alinea con el criterio
     de "BUENO" para el TTFB según Google PageSpeed Insights.
   - SIGNIFICADO OPERACIONAL: Rendimiento aceptable, pero
     acercándose a donde la sensación de espera se consolida.

4. ## LENTO: 800 ms < Latencia <= 1500 ms

   - CLASIFICACIÓN: ALERTA TEMPRANA (⚠️ Naranja)
   - JUSTIFICACIÓN UX: Límite del 1 Segundo. La demora se
     convierte en un distractor activo. La experiencia está
     notablemente degradada.
   - SIGNIFICADO OPERACIONAL: Alerta Temprana. El servidor
     o la red experimentan estrés. Momento de investigar.

5. ## CRÍTICO: 1500 ms < Latencia <= 3000 ms

   - CLASIFICACIÓN: RIESGO DE ABANDONO (🐌 Rojo)
   - JUSTIFICACIÓN UX: Pérdida de Foco y Frustración.
     El límite crítico (3 segundos) es donde los usuarios
     abandonan una página web según estudios de usabilidad.
   - SIGNIFICADO OPERACIONAL: Fallo Inminente. Indica carga
     extremadamente pesada o cuellos de botella severos.

6. ## RIESGO: 3000 ms < Latencia <= 5000 ms

   - CLASIFICACIÓN: FALLO FUNCIONAL (🚨 Rojo Intenso)
   - JUSTIFICACIÓN UX: Fallo Funcional. Las demoras
     superiores a 5 segundos son consideradas un fallo
     funcional en muchos sistemas.
   - SIGNIFICADO OPERACIONAL: ALARMA. El servicio está
     al borde del colapso o no sirve peticiones de manera
     confiable.

7. ## RIESGO EXTREMO: 5000 ms < Latencia < 99999 ms

   - CLASIFICACIÓN: CAOS/LIMBO (🔥 Rojo Crítico)
   - JUSTIFICACIÓN UX: CAOS/Limbo. Rango antes del timeout
     máximo. Es casi seguro que el usuario abandonó la acción.
   - SIGNIFICADO OPERACIONAL: El servidor no puede procesar
     la solicitud en un tiempo razonable. Requiere atención
     INMEDIATA.

8. ## CAÍDA TOTAL: >= 99999 ms o Error HTTP

   - CLASIFICACIÓN: SERVICIO CAÍDO (❌ Negro/Rojo)
   - JUSTIFICACIÓN UX: Caída Confirmada. El valor de
     PENALIZACION_FALLO ha sido superado.
   - SIGNIFICADO OPERACIONAL: El servicio está caído, la
     ruta es inaccesible, o el servidor se negó a responder.

9. ## PENALIZACION_FALLO: 99999 ms

   - PROPÓSITO: CÁLCULO DE PENALIZACIÓN
   - JUSTIFICACIÓN TÉCNICA: Este valor no es una latencia
     real. Se utiliza para marcar fallos cuando el servicio
     devuelve un código de error (4xx, 5xx) o un fallo de
     conexión. Cualquier valor >= a este se considera
     timeout o caída total.
   - NOTA IMPORTANTE: A partir de la versión actual, los
     fallos NO se incluyen en el cálculo del promedio.
     El promedio solo considera mediciones exitosas
     (status 200) para evitar distorsión de los datos.
     Si >50% de mediciones fallan, el estado promedio
     se marca como "CAÍDA/ERROR".
