# Arquitectura

## Visión general

```
Navegador ──HTTPS──► Express (server/app.js)
                       ├─ registro de respuestas 5xx
                       ├─ Helmet: CSP solo 'self', HSTS, nosniff, Referrer-Policy
                       ├─ Permissions-Policy (solo cámara)
                       ├─ límite de peticiones por IP (429)
                       ├─ HTTP → HTTPS (301) en producción detrás del proxy
                       ├─ compression (gzip, > 1 KB)
                       ├─ /index.html → / (301)
                       ├─ /api/salud
                       ├─ express.static(public/) con Cache-Control por tipo de archivo
                       ├─ 404 (JSON en /api, 404.html en el resto)
                       └─ manejador de errores (sin detalles al visitante)

Visitante ──toca «Escríbeme por WhatsApp»──► wa.me/50584329491 (fuera del sitio)
```

## Decisiones de diseño

| Decisión | Motivo |
|----------|--------|
| **Reservas por WhatsApp en vez de formulario** | Es el canal que usan los clientes en Nicaragua. Elimina toda entrada de datos al servidor: sin validación, sin base de datos, sin correo SMTP ni contraseñas que proteger. Menos código = menos riesgo. |
| **Servidor Node.js mínimo** | Solo sirve archivos con seguridad, compresión y caché correctas. Tres dependencias de producción (express, helmet, compression). |
| **Todo desde el propio dominio** | Fuentes, Three.js, GSAP y Bootstrap viven en `public/vendor/`. Sin conexiones a terceros: carga más rápida, el sitio no se cae si un CDN falla y la CSP puede ser estricta (`'self'`). |
| **Recursos generados con un script** (`npm run recursos`) | Las librerías se instalan con npm (versiones exactas en `package-lock.json`) y un script las copia. Actualizar = cambiar la versión + volver a ejecutarlo. |
| **Carga diferida de galerías** | La espiral y el parallax se inician al acercarse (IntersectionObserver); los sliders descargan sus fotos al abrirse; la galería parallax usa miniaturas de 480 px. |
| **`app.js` separado de `index.js`** | La app se prueba con Supertest sin abrir puertos. |
| **Configuración inmutable** | `Object.freeze` impide cambios accidentales en tiempo de ejecución. |
| **CSS y JS con `no-cache`, `/vendor` con caché de 1 año** | Los archivos propios no llevan huella en el nombre: se revalidan (304) y los cambios se ven al instante. Los de `/vendor` llevan la versión en la ruta, así que nunca cambian. |

## Frontend

Scripts cargados con `defer` al final del `<body>`, en este orden:

1. `vendor/three-0.128.0/three.min.js`, `vendor/gsap-3.12.5/gsap.min.js`, `ScrollTrigger.min.js`
2. `js/fotos.js`: `JF_PHOTOS`, `JF_SPIRAL_PHOTOS` y `JF_PHOTOS_MINI` (miniaturas).
3. `js/main.js`: comportamiento visual. El bloque 0 define `JF_alAcercarse` para la carga diferida.
4. `js/sitio.js`: enlaces directos a galerías, aviso de la espiral y botones de precios.

Estilos: `css/fuentes.css` (generado), `vendor/bootstrap-5.3.2/bootstrap.min.css` (recortado) y `css/styles.css`.
