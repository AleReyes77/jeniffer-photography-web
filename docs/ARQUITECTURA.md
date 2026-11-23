# Arquitectura

## Visión general

```
Navegador ──HTTP──► Express (server/app.js)
                      ├─ Helmet (CSP, HSTS, etc.) + Permissions-Policy
                      ├─ compression (gzip)
                      ├─ /api ─► json/urlencoded (10 KB) ─► routes/api.js
                      │            ├─ GET  /salud
                      │            └─ POST /reservas ─► rate limit ─► validacion.js
                      │                                   ├─► almacen.js  (data/reservas.jsonl)
                      │                                   └─► correo.js   (SMTP / Nodemailer)
                      ├─ express.static(public/)  con Cache-Control por tipo
                      ├─ 404 (JSON en /api, 404.html en el resto)
                      └─ manejador de errores
```

## Decisiones de diseño

| Decisión | Motivo |
|----------|--------|
| **Un solo servidor sirve sitio y API** | Mismo origen: sin CORS, una sola URL que mantener y un despliegue más simple. |
| **`app.js` separado de `index.js`** | La app se prueba con Supertest sin abrir puertos; `index.js` solo arranca y apaga. |
| **Inyección de dependencias** (`crearApp({ config, almacen, correo, registro })`) | Las pruebas reemplazan el correo y el almacén por versiones falsas sin tocar la red ni el disco real. |
| **Archivo JSON Lines en vez de base de datos** | El volumen de un portafolio es bajo. Sin servicios externos, sin costo y fácil de leer. Una cola interna evita que dos escrituras simultáneas mezclen líneas. Si el volumen crece se cambia `almacen.js` por una base de datos sin tocar el resto. |
| **El correo nunca bloquea la reserva** | Si el SMTP falla la reserva ya está guardada; se confirma al visitante y el error queda en el log. |
| **Validación en servidor como fuente de verdad** | El navegador valida para dar respuesta inmediata, pero el servidor vuelve a validar todo. |
| **Honeypot + rate limit** en lugar de CAPTCHA | Frena la mayoría del spam sin molestar a las personas ni cargar scripts de terceros. |
| **CSP estricta sin `unsafe-inline` en scripts** | Bloquea la inyección de código. Por eso no hay `onclick=""` en el HTML (está probado). |
| **CSS y JS con `Cache-Control: no-cache`** | No llevan huella en el nombre; el navegador revalida con ETag (304) y los cambios se ven al instante. Las imágenes se guardan 30 días. |
| **Configuración inmutable** (`Object.freeze`) | Ningún módulo puede cambiar la configuración por accidente en tiempo de ejecución. |
| **ESM (`"type": "module"`) y Node ≥ 22.9** | Sintaxis moderna, `--env-file` y `--watch` nativos: no hacen falta `dotenv` ni `nodemon`. |

## Frontend

El sitio es una sola página (`public/index.html`) con scripts clásicos cargados al final del `<body>`,
en este orden (el orden importa):

1. **CDN:** jQuery 3.7.1, Three.js r128, GSAP 3.12.5 y ScrollTrigger.
2. `js/fotos.js`: define `window.JF_PHOTOS` y `window.JF_SPIRAL_PHOTOS` (rutas de las fotos).
3. `js/main.js`: todo el comportamiento visual (cursor, paneles, sliders 3D, espiral, parallax, capas, cámara, selfie).
4. `js/sitio.js`: enlaces directos a galerías, aviso de la espiral y estado de los botones de precios.
5. `js/reservas.js`: formulario de reservas.

Los estilos están en un único `css/styles.css`, organizado en bloques numerados en el orden original de la cascada.

## Seguridad

- **Entrada:** límite de 10 KB, validación por lista blanca (tipo de evento), limpieza de caracteres de control,
  tipos estrictos (un objeto en vez de texto se rechaza).
- **Salida:** el contenido del visitante se escapa antes de ponerlo en el HTML del correo; nunca se insertan
  datos del visitante en la página con `innerHTML`.
- **Transporte:** HSTS y `upgrade-insecure-requests` en producción.
- **Errores:** el visitante nunca ve detalles internos; la pila completa va solo al log.
- **Secretos:** solo en variables de entorno; `.env` está en `.gitignore`.
- **Dependencias:** `npm audit` en la CI.
