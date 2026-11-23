# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [2.0.0] — 2026-11-23

### Agregado
- Backend con Express 5: `GET /api/salud` y `POST /api/reservas` (validación, honeypot, límite por IP, almacenamiento JSON Lines, correo SMTP).
- Formulario de reservas accesible, con soporte sin JavaScript.
- Cabeceras de seguridad (CSP, HSTS, Permissions-Policy), compresión y caché por tipo de archivo.
- Enlaces directos a galerías (`/#boda`, `/#quinceanos`, `/#cumpleanos`).
- Secciones de servicios y preguntas frecuentes, y JSON-LD `FAQPage` e `ImageGallery`.
- 45 pruebas automáticas, validación de HTML y verificación de recursos.
- CI en GitHub Actions, Dockerfile, `render.yaml` y documentación en `docs/`.

### Corregido
- Imágenes `src=""` en las capas de "A través del lente".
- Enlace y JSON-LD que apuntaban a `#galeria-fotografica`, que no existía.
- Enlaces `#boda`, `#quinceanos` y `#cumpleanos` sin destino.
- Aviso de la galería espiral con `onclick` en línea (inaccesible por teclado e incompatible con la CSP).
- Enlace de descarga de la selfie con `download` sin `href`; `autoplay` innecesario en el video.
- `aria-label` en elementos sin rol.
- Botones de precios que llevaban a un 404 si el archivo no existía.
- Imágenes de "Momentos que se abren" y de la cámara 3D que dependían de servicios externos (picsum.photos y Amazon S3).
- Meta descripción demasiado larga (220 → 156 caracteres).
- Diapositivas de respaldo sin usar que cargaban imágenes externas.

### Cambiado
- El sitio se movió a `public/`; Live Server apunta a esa carpeta.

## [1.0.0] — 2026-11-23

- Sitio estático: portafolio, sliders, galerías 3D, cámara con selfie, imágenes WebP y SEO base.
