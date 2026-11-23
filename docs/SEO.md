# SEO

## Lo que ya está implementado

| Área | Implementación |
|------|----------------|
| Etiquetas | `<title>` con la marca y «Nicaragua», `meta description` de 152 caracteres, `robots`, `googlebot`, `canonical`, `hreflang`, `og:locale es_NI`. |
| Redes sociales | Open Graph y Twitter Card con imagen 1200 × 630 (`img/og/og-image.jpg`). |
| Datos estructurados | JSON-LD (negocio en Nicaragua con teléfono y WhatsApp) con `WebSite`, `WebPage`, `ImageObject`, `Person`, `ProfessionalService` (catálogo de servicios), `ImageGallery` (12 fotos) y `FAQPage`. |
| Contenido rastreable | Secciones de servicios, reservas y preguntas frecuentes con texto e imágenes `<img>` reales. |
| Imágenes | WebP, nombres descriptivos en español, `alt`, `width`/`height`, `loading="lazy"`, precarga de la portada. |
| Rastreo | `robots.txt`, `sitemap.xml` con 50 imágenes, URL única (`/index.html` → `/` con 301), página 404. |
| Velocidad | Compresión gzip, caché de imágenes de 30 días, imágenes livianas para celular. |
| Enlaces profundos | `/#boda`, `/#quinceanos`, `/#cumpleanos` abren cada galería. |

## Lo que debes completar (impacto alto)

1. **Dominio real** en lugar de `https://TU-DOMINIO.com`.
2. **SEO local**: el país (Nicaragua) y el teléfono ya están. Cuando definas tu ciudad, agrégala al JSON-LD de `ProfessionalService`:
   ```json
   "address": { "@type": "PostalAddress", "addressLocality": "Tu ciudad", "addressCountry": "NI" }
   ```
   y menciónala en el `<title>` y la descripción (ej.: *"Fotógrafa de bodas en Managua"*).
3. **Google Search Console**: verifica el dominio (hay un comentario preparado en `index.html`) y envía `sitemap.xml`.
4. **Google Business Profile**: el factor que más pesa en búsquedas locales ("fotógrafa cerca de mí").
   Usa exactamente el mismo nombre, teléfono y dirección que en el sitio.
5. **Reseñas** de clientes en Google.
6. **Enlaces**: pon la URL en Instagram, Facebook, WhatsApp Business y directorios de bodas.

## Mantenimiento

- Al agregar fotos: WebP, nombre descriptivo (`boda-ceremonia-iglesia-san-pedro.webp`), `alt` que describa la escena,
  y súmala a `sitemap.xml`.
- Actualiza `<lastmod>` en `sitemap.xml` cuando cambie el contenido.
- Revisa cada mes Search Console → Rendimiento y Cobertura.
