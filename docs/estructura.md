======================================================
ESTRUCTURA DEL PROYECTO monitor-status-test (CORREGIDA)
======================================================

monitor-status-test/
├── index.html <-- Frontend HTML (Estructura principal del monitor)
├── leyenda.html <-- Página de leyenda de umbrales
├── webs.json <-- URLs a monitorizar (ubicado en raíz)
├── package.json <-- Dependencias de Node (node-fetch, abort-controller)
├── netlify.toml <-- Configuración Netlify (funciones serverless)
├── README.md <-- Documentación principal del proyecto
|
├── .vscode/ <-- Configuración de VS Code
│ └── settings.json <-- Configuración de cSpell (diccionario español)
|
├── js/ <-- Directorio de scripts JavaScript
│ ├── script.js <-- Lógica principal (Monitorización, Historial, Temas)
│ ├── config.js <-- Constantes de configuración (umbrales, temas, etc.)
│ ├── i18n_es.js <-- Textos en español
│ ├── i18n_en.js <-- Textos en inglés
│ └── leyenda_script.js <-- Lógica de la página de leyenda
|
├── css/ <-- Directorio de estilos CSS
│ ├── monitor_base.css <-- Estilos base compartidos
│ ├── monitor_def.css <-- Tema estándar (default)
│ ├── monitor_pro.css <-- Tema PRO (información avanzada)
│ ├── monitor_min.css <-- Tema minimalista
│ ├── leyenda_base.css <-- Estilos base de la leyenda
│ ├── leyenda_def.css <-- Tema estándar para leyenda
│ ├── leyenda_pro.css <-- Tema PRO para leyenda
│ └── leyenda_min.css <-- Tema minimalista para leyenda
|
├── netlify/ <-- Carpeta de configuración de Netlify
│ └── functions/
│ └── check-status.js <-- Función Serverless (Proxy HTTP para verificación)
|
└── docs/ <-- Directorio de documentación
├── readme.md <-- Índice principal de documentación
├── arquitectura.md <-- Flujo de datos y arquitectura del sistema
├── estructura.md <-- Este archivo - estructura del proyecto
├── justificacion_rangos_latencia.md <-- Justificación de umbrales
└── resolución de problemas.md <-- Guía de troubleshooting

======================================================
DESCRIPCIÓN DE ARCHIVOS PRINCIPALES
======================================================

## index.html

Archivo HTML principal que contiene:

- Selector de tema (?tema=def, ?tema=pro, ?tema=min)
- Selector de duración (12h, 1d, 3d, 7d)
- Selector de idioma (?lang=es, ?lang=en)
- Tabla de monitoreo con columnas: URL, Estado Actual, Latencia Actual, Estado Promedio, Latencia Promedio
- Botones de control (Pausar/Reanudar, Reiniciar, Detalles PSI)
- Botón toggle de expansión de errores (▼/▲)
- Sistema de expansión que muestra últimos 10 errores
- Contador de errores "⚠️ X/Y" (X = errores, Y = total)
- Enlaces a leyenda y footer con información del proyecto

## leyenda.html

Página que explica los estados de monitoreo:

- Tabla con colores, nombres y descripciones de cada estado
- Soporte para los 3 temas (def, pro, min)
- Sistema de internacionalización (es, en)
- Botón "Volver al Monitor"

## webs.json

Archivo de configuración JSON ubicado en la raíz que contiene:

- Array de objetos con URLs a monitorear
- Cada objeto tiene: url, titulo, descripcion, psi

## CSS Files

### monitor_base.css

Estilos compartidos por todos los temas:

- Layout general de la tabla
- Estilos de botones base (toggle, pausar, reiniciar, PSI)
- Tipografía y espaciado general
- Sistema de expansión de errores
- Contador de errores

### monitor_def.css, monitor_pro.css, monitor_min.css

Temas específicos con variaciones de:

- Colores de fondo y texto
- Gradientes y sombras
- Colores de estados (MUY_RAPIDO, RAPIDO, NORMAL, LENTO, CRITICO, RIESGO, CAIDO)
- Estilo del botón PSI

### leyenda_base.css, leyenda_def.css, leyenda_pro.css, leyenda_min.css

Estilos para la página de leyenda:

- Layout de tabla explicativa
- Colores correspondientes a cada tema
- Estilos del botón "Volver al Monitor"

## JS Files

### script.js

Lógica principal del monitor:

- Carga de configuración desde webs.json
- Sistema de monitoreo con intervalos configurables
- Almacenamiento de historial en sessionStorage
- Registro y expansión de errores
- Cálculo de promedios y estadísticas
- Control de selector de duración (12h, 1d, 3d, 7d)
- Integración con sistema i18n
- Gestión de temas dinámicos

### leyenda_script.js

Lógica de la página de leyenda:

- Carga de traducciones dinámicas
- Aplicación de tema desde URL
- Renderizado de tabla de estados

### config.js

Configuración centralizada:

- UMBRALES_LATENCIA (7 niveles)
- TEMA_FILES (mapeado de temas a archivos CSS)
- DURACION_OPCIONES (12h, 1d, 3d, 7d con límites)
- PROXY_ENDPOINT (URL de función serverless)
- INTERVALO_MONITOREO (5 minutos)
- LIMITE_ERRORES_MOSTRADOS (10)

### i18n_es.js, i18n_en.js

Sistema de internacionalización:

- Traducciones de interfaz (botones, etiquetas, mensajes)
- Traducciones de estados (MUY_RAPIDO, RAPIDO, etc.)
- Traducciones de página de leyenda
- Carga dinámica según parámetro ?lang=

## Función Serverless

### check-status.js

Función desplegada en Netlify Functions:

- Recibe URL como parámetro query
- Ejecuta petición HTTP GET con timeout de 9s
- Mide latencia completa (DNS + TCP + SSL + procesamiento)
- Maneja certificados SSL inválidos
- Registra errores con timestamp, código HTTP y mensaje
- Retorna status, latencia y detalles de error
