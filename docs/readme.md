# Monitor de Disponibilidad de Servicios 🚀

## ¿Qué es?

Un sistema de monitoreo en tiempo real que verifica automáticamente cada 5 minutos el **estado** y **tiempo de respuesta** de tus servicios web. Te alerta cuando algo va mal antes de que tus usuarios lo noten.

## Características principales

- ✅ **Monitoreo automático** cada 5 minutos
- 📊 **7 niveles de clasificación** desde "Muy Rápido" hasta "Caído"
- 🎨 **5 temas visuales** con alternancia claro/oscuro
- 🌍 **Multiidioma** (Español, Inglés, extensible)
- 📈 **Historial configurable** de 1 a 9 horas
- 🚨 **Detección inteligente** de fallos globales vs individuales
- 📱 **Diseño responsive** para cualquier dispositivo
- 🔍 **Expansión de errores** con detalles completos (temas avanzados)

---

El sistema revisa automáticamente tus servicios y te muestra su estado de forma visual e intuitiva, para que siempre sepas si todo funciona bien.

## Inicio Rápido

### Desplegar en Netlify

1. Sube el código a tu repositorio (GitHub, GitLab, Bitbucket)
2. Conecta con [Netlify](https://netlify.com)
3. Netlify detecta `netlify.toml` automáticamente

✅ ¡Tu monitor estará online en minutos!

### Configurar tus servicios

Edita `data/webs.json` con las URLs que quieres monitorear:

```json
[
  {
    "nombre": "Mi API",
    "url": "https://api.miempresa.com/health",
    "grupo": "CRITICO",
    "orden": 1
  },
  {
    "nombre": "Sitio Principal",
    "url": "https://miempresa.com",
    "grupo": "PRODUCCION",
    "orden": 2
  }
]
```

### Acceder al monitor

```
https://tu-monitor.netlify.app/              → Tema estándar
https://tu-monitor.netlify.app/?tema=pro     → Tema profesional oscuro
https://tu-monitor.netlify.app/?tema=pro2    → Tema profesional claro
https://tu-monitor.netlify.app/?lang=en      → English version
```

## Clasificación de Estados

El monitor asigna un estado según el tiempo de respuesta:

| Estado         | Tiempo        | Color | Significado                    |
| -------------- | ------------- | ----- | ------------------------------ |
| 🚀 Muy Rápido  | < 300 ms      | Verde | Rendimiento óptimo             |
| ⭐ Rápido      | 300-500 ms    | Verde | Interacción fluida             |
| ✅ Normal      | 500-800 ms    | Verde | Aceptable                      |
| ⚠️ Lento       | 800-1500 ms   | Ambar | Alerta temprana                |
| 🐌 Crítico     | 1500-3000 ms  | Rojo  | Riesgo de abandono de usuarios |
| 🚨 Riesgo      | 3000-5000 ms  | Rojo  | Fallo inminente                |
| 🔥 Riesgo Ext. | 5000-99999 ms | Rojo  | Abandono seguro                |
| ❌ Caída       | Error/Timeout | Rojo  | Servicio no responde           |

> 💡 Los rangos están basados en estudios de UX sobre percepción de velocidad. Ver [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md)

## Temas Visuales

5 temas disponibles para diferentes necesidades:

| Tema              | URL          | Descripción                     |
| ----------------- | ------------ | ------------------------------- |
| Estándar          | `?tema=def`  | Vista clara y simple            |
| Oscuro            | `?tema=osc`  | Modo nocturno del estándar      |
| Profesional       | `?tema=pro`  | Análisis técnico (fondo oscuro) |
| Profesional Claro | `?tema=pro2` | Análisis técnico (fondo claro)  |
| Minimalista       | `?tema=min`  | Dashboard compacto sin adornos  |

**Alternancia automática**: DEF↔OSC y PRO↔PRO2 incluyen botón 🌙/☀️ para cambiar entre claro/oscuro.

**Funcionalidades por tipo**:

- **Básicos (DEF/OSC)**: Vista simple con botón PSI
- **Avanzados (PRO/PRO2/MIN)**: Expansión de errores + PSI + análisis detallado

## Idiomas

```
?lang=es  → Español (por defecto)
?lang=en  → English
```

Combina parámetros: `?tema=pro&lang=en`

> 🌍 Para agregar idiomas, ver [configuracion.md](configuracion.md)

## Interacción y Detalles

### Ver errores detallados

En temas avanzados (PRO/PRO2/MIN), cuando aparece un badge de error:

1. Haz **click en el badge** (ej: "CAÍDA/ERROR")
2. Se expande una fila con:
   - Fecha y hora exacta
   - Código HTTP
   - Mensaje del error
   - Latencia registrada

### Historial configurable

Selector en la interfaz: **1 a 9 horas** de historial (12 mediciones/hora = máximo 108 puntos de datos)

### Botón PSI

Calcula PageSpeed Insights de Google para ese servicio (abre en nueva pestaña).

## Detección Inteligente de Fallos

El monitor distingue entre:

- **Fallo individual**: Un servicio específico tiene problemas
- **Fallo global**: Problema de conectividad general (descarta medición)

**Fallo global detectado cuando**:

- 100% de servicios críticos caídos
- ≥80% de servicios con latencia >9 segundos

**Resultado**: Muestra alerta 🚨, descarta datos erróneos, reintenta en el próximo ciclo.

## Limitaciones Conocidas

Este monitor es ideal para **visibilidad rápida** de disponibilidad, pero tiene limitaciones:

- Medición desde **una sola ubicación** (servidor Netlify)
- Sujeto a "cold start" de funciones serverless
- No envía alertas automáticas (email, SMS, etc.)
- Medición cada 5 minutos (no es tiempo real)

💡 **Para producción crítica**: Complementa con servicios especializados (Pingdom, UptimeRobot, Datadog) que ofrecen múltiples ubicaciones geográficas, alertas integradas y SLA.

---

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

**¿Tienes dudas?** Consulta la [documentación completa](#-documentación-completa) o abre un issue en GitHub.

## Documentación Técnica

Para configuración avanzada, arquitectura interna y solución de problemas:

| Documento                                                                | Contenido                                   |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| **[configuracion.md](configuracion.md)**                                 | Ajustes, umbrales, idiomas, personalización |
| **[arquitectura.md](arquitectura.md)**                                   | Cómo funciona internamente el sistema       |
| **[estructura.md](estructura.md)**                                       | Organización de archivos y carpetas         |
| **[justificacion_rangos_latencia.md](justificacion_rangos_latencia.md)** | Base científica de los umbrales             |
| **[resolución de problemas.md](resolución%20de%20problemas.md)**         | Errores comunes y soluciones                |

---

## Licencia

MIT License - Úsalo libremente, modifícalo, distribúyelo.

---

**¿Dudas o problemas?** Revisa la documentación técnica o abre un issue en el repositorio
