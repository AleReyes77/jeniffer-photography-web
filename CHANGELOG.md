# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [2.2.0] — 2026-11-24

### Seguridad
- Límite de peticiones por IP propio (300 por minuto, configurable), con 429 y Retry-After; protegido contra bloqueos masivos si falta TRUST_PROXY.
- Redirección permanente HTTP → HTTPS en producción detrás de un proxy (excepto /api/salud).
- El servidor escucha por defecto solo en 127.0.0.1: el puerto nunca queda expuesto directamente a internet.
- Registro en el log de toda respuesta 5xx; aviso si el puerto está ocupado o si se ejecuta como root.
- Textos de los sliders construidos con textContent en lugar de innerHTML.

### Robustez
- Sin WebGL, las galerías 3D muestran un aviso en lugar de detener el resto del JavaScript (antes se perdían la navegación por teclado y las fotos de «Momentos que se abren»).
- Indicador de carga y mensajes de error al abrir una galería y en la espiral.

### Accesibilidad (axe-core: 0 problemas)
- Contraste WCAG AA (≥ 4,5:1) en etiquetas, enlaces del pie, texto de derechos y botones.
- Nombres accesibles que coinciden con el texto visible (menú de la portada y botones de precios).
- Portada dentro de una región header; fondo 3D decorativo oculto a lectores de pantalla.

### Entornos y despliegue
- .nvmrc/.node-version (Node 22) y .npmrc con engine-strict y save-exact.
- deploy/: Nginx y Caddy como proxy inverso para varios sitios en un VPS, y firewall UFW.
- 19 pruebas nuevas (50 en total).

## [2.1.0] — 2026-11-23

### Cambiado
- Reservas por WhatsApp (+505 8432 9491) en lugar del formulario; los botones de precios sin archivo llevan a WhatsApp.
- Marca unificada como «Jeniffer Photography»; SEO local para Nicaragua (título, descripción, JSON-LD con teléfono y país).
- Servidor simplificado: solo sirve el sitio y /api/salud (3 dependencias de producción).
- CSP estricta: scripts, estilos y fuentes solo del propio dominio; form-action 'none'.

### Rendimiento
- Fuentes, Three.js, GSAP y Bootstrap servidos desde el propio dominio (0 servidores externos).
- Bootstrap recortado de 227 KB a 11 KB; jQuery eliminado; scripts con defer.
- Galerías espiral y parallax se inician al acercarse; los sliders descargan sus fotos al abrirse.
- 33 miniaturas de 480 px para las galerías donde las fotos se ven pequeñas.
- Carga inicial: 70 → 33 peticiones y 6,4 MB → 1,0 MB.

### Seguridad y mantenimiento
- Dependabot, CodeQL y .gitignore ampliado (llaves, bases de datos, respaldos).
- Prueba de sintaxis de los scripts del navegador (detectó un error real antes de publicar).
- Configuración de PM2 para VPS; se retiró render.yaml.

### Eliminado
- Formulario de reservas, API POST /api/reservas, validación, almacén JSON Lines y envío de correo.

## [2.0.0] — 2026-11-23

### Agregado
- Backend con Express 5: `GET /api/salud` y `POST /api/reservas` (validación, honeypot, límite por IP, almacenamiento JSON Lines, correo SMTP).
- Formulario de reservas accesible, con soporte sin JavaScript.
- Cabeceras de seguridad (CSP, HSTS, Permissions-Policy), compresión y caché por tipo de archivo.
- Enlaces directos a galerías (`/#boda`, `/#quinceanos`, `/#cumpleanos`).
- Secciones de servicios y preguntas frecuentes, y JSON-LD `FAQPage` e `ImageGallery`.
- 45 pruebas automáticas, validación de HTML y verificación de recursos.
- CI en GitHub Actions, Dockerfile, `render.yaml` y documentación en `docs/`.
- PDF con la explicación de cada línea del código (`docs/explicacion-del-codigo.pdf`) y su generador (`npm run docs:pdf`).

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
- La foto de «Sobre mí» (100 px) se reemplazaba por la imagen de 1920 px del lente, descargando un archivo grande sin necesidad.

### Cambiado
- El sitio se movió a `public/`; Live Server apunta a esa carpeta.

## [1.0.0] — 2026-11-23

- Sitio estático: portafolio, sliders, galerías 3D, cámara con selfie, imágenes WebP y SEO base.
