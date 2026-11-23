# Jeniffer Valle Fotografía — sitio web

Portafolio de fotografía de bodas, quinceaños y cumpleaños.

## Estructura

```
jeniffer-photography/
├── index.html              ← página principal
├── 404.html                ← página de error
├── favicon.svg
├── robots.txt              ← instrucciones para Google
├── sitemap.xml             ← mapa del sitio con todas las fotos
├── site.webmanifest        ← ícono y nombre al instalar en el celular
├── .htaccess               ← HTTPS, caché y compresión (hosting Apache)
├── _headers                ← lo mismo para Netlify
├── css/
│   └── styles.css
├── js/
│   ├── fotos.js            ← lista de fotos de sliders y galerías
│   └── main.js             ← animaciones, galerías, cámara 3D
├── img/
│   ├── hero/               ← portada y "A través del lente" (+ versiones para celular)
│   ├── bodas/
│   ├── quinceanos/
│   ├── cumpleanos/
│   ├── desfiles/
│   ├── sesiones/
│   ├── og/og-image.jpg     ← imagen que aparece al compartir en WhatsApp/Facebook
│   └── icons/
├── descargas/              ← pon aquí precios-servicios.pdf y precios-servicios.jpg
└── .vscode/                ← configuración recomendada de VS Code
```

## Abrir en VS Code

1. Abre VS Code → **Archivo → Abrir carpeta…** → elige la carpeta `jeniffer-photography`.
2. VS Code te sugerirá instalar las extensiones recomendadas. Instala **Live Server**.
3. Abre `index.html` y haz clic en **Go Live** (abajo a la derecha). El sitio se abre en `http://127.0.0.1:5500`.

> **Importante:** usa siempre Live Server (o el sitio publicado). Si abres `index.html` con doble clic,
> la galería en espiral, la galería 3D y la cámara para tomarse la foto **no funcionan**,
> porque el navegador bloquea esas funciones en archivos locales.

## Antes de publicar (obligatorio para el SEO)

1. **Tu dominio:** en VS Code presiona `Ctrl + Shift + H`, busca `https://TU-DOMINIO.com` y reemplázalo
   por tu dominio real (por ejemplo `https://jeniffervalle.com`) en **todos** los archivos.
2. **Precios:** pon `precios-servicios.pdf` y `precios-servicios.jpg` dentro de `descargas/`.
3. **Ciudad y país (muy importante para salir en búsquedas locales):** en `index.html`, dentro del bloque
   `application/ld+json`, agrega al objeto `ProfessionalService`:
   ```json
   "address": { "@type": "PostalAddress", "addressLocality": "TU CIUDAD", "addressCountry": "HN" },
   "areaServed": ["TU CIUDAD", "TU DEPARTAMENTO"],
   "telephone": "+504 0000-0000"
   ```
   y menciona tu ciudad en el `<title>` y en la `meta description`
   (ej.: "Fotógrafa de bodas en San Pedro Sula").
4. Publica el sitio con **HTTPS** (la cámara para selfies solo funciona con https).

## Después de publicar: cómo aparecer en las primeras búsquedas

1. **Google Search Console** (https://search.google.com/search-console): agrega tu dominio, pega el código
   de verificación en `index.html` (hay un comentario preparado) y envía `https://TU-DOMINIO.com/sitemap.xml`.
2. **Google Business Profile** (https://business.google.com): crea el perfil de "Jeniffer Valle Fotografía"
   con la misma dirección/teléfono y el enlace a tu web. Es lo que más ayuda para búsquedas como
   "fotógrafa de bodas cerca de mí".
3. **Bing Webmaster Tools**: puedes importar el sitio desde Search Console.
4. Pon el enlace de la web en tu Instagram y Facebook.
5. Pide a tus clientes reseñas en Google.
6. Revisa la velocidad en https://pagespeed.web.dev y los datos estructurados en
   https://search.google.com/test/rich-results.

## SEO incluido

- Título, descripción, canonical, hreflang, robots y metadatos para Google y Bing.
- Open Graph y Twitter Cards con imagen 1200×630 (`img/og/og-image.jpg`).
- Datos estructurados (JSON-LD): WebSite, WebPage, Person, ProfessionalService con servicios,
  galería de imágenes (ImageGallery) y preguntas frecuentes (FAQPage).
- Sección visible de servicios y preguntas frecuentes con texto e imágenes que Google puede leer.
- Fotos en **.webp** con nombres descriptivos, `alt`, `width/height` y carga diferida.
- `sitemap.xml` con imágenes, `robots.txt`, `site.webmanifest`, íconos y página 404.
- Precarga de la imagen principal (distinta para celular y computadora).
- `.htaccess` / `_headers` con HTTPS, compresión y caché.

## Cambiar fotos

- Las fotos de los sliders y galerías están listadas en `js/fotos.js`.
- Usa formato **.webp**, nombres en minúsculas con guiones (ej.: `boda-primer-baile-iglesia.webp`)
  y un ancho máximo de ~1600 px.
