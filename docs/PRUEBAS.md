# Pruebas

```bash
npm test                 # pruebas automáticas
npm run verificar        # HTML válido + recursos + pruebas (igual que la CI)
npm run test:cobertura   # con cobertura de código
```

Se usa el ejecutor nativo de Node (`node:test`) y Supertest, que envía peticiones HTTP a la app sin abrir un puerto.

| Archivo | Cubre |
|---------|-------|
| `tests/api.test.js` | `/api/salud`; que la antigua ruta de reservas ya no exista; configuración por defecto y valores inválidos; caché por tipo de archivo; registro JSON por niveles. |
| `tests/seguridad.test.js` | Dirección de escucha 127.0.0.1, varios sitios en distintos puertos, redirección a HTTPS (y sus excepciones), límite de peticiones por IP (429, Retry-After, IPs separadas, nueva ventana, protección sin TRUST_PROXY), ausencia de CORS, URLs mal formadas sin detalles internos y registro de respuestas 5xx. |
| `tests/sitio.test.js` | Página principal, gzip, redirección `/index.html`, caché de fotos, fuentes y librerías, robots/sitemap/manifest, 404, archivos ocultos (`.env`, `.htaccess`); seguridad (CSP solo `'self'`, sin servidores externos, HSTS en producción, sin `on*=`); rendimiento (sin recursos externos, `defer`, sin jQuery); botón de WhatsApp y ausencia del formulario; sintaxis de los scripts del navegador; integridad de recursos y miniaturas; SEO (canonical, descripción, un `h1`, marca, JSON-LD con Nicaragua, FAQ, `alt`). |

## Pruebas manuales antes de publicar (realizadas)

- Comparación de la versión anterior y la nueva a 1280 × 800: tipografías, tamaños y posiciones idénticos
  (solo cambian la marca «photography» y la sección de reservas).
- Carga inicial: 70 → 33 peticiones, 6,4 MB → 1,0 MB, 5 → 0 servidores externos.
- Galerías: la espiral y el parallax se inician al acercarse; el slider de quinceaños descarga sus fotos al abrirse.
- Botón de WhatsApp y vista de celular (375 × 812) sin desplazamiento horizontal.

## Auditoría de accesibilidad y robustez (realizada)

- **axe-core** (el motor de accesibilidad de Lighthouse) en la página y en los paneles abiertos: 0 problemas, 44 reglas superadas.
- **Sin WebGL** (Edge con `--disable-webgl`): la galería parallax muestra un aviso y el resto del sitio funciona. En la versión anterior, la navegación por teclado y las fotos de «Momentos que se abren» se perdían.
