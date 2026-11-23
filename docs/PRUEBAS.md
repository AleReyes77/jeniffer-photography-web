# Pruebas

## Cómo ejecutarlas

```bash
npm test                 # 45 pruebas
npm run test:cobertura   # con cobertura de código
npm run verificar        # HTML + recursos + pruebas (igual que la CI)
```

Se usa el ejecutor de pruebas nativo de Node (`node:test`) y Supertest, que envía peticiones HTTP a la app
sin abrir un puerto. Cada prueba crea su propio archivo de reservas en una carpeta temporal y un correo falso,
así que nunca se tocan datos reales ni se envían correos.

## Qué se prueba

| Archivo | Cubre |
|---------|-------|
| `tests/validacion.test.js` | Reglas de cada campo, limpieza de texto, fechas reales y bisiestas, zona horaria, honeypot, tipos no textuales. |
| `tests/api.test.js` | `/api/salud`; reserva válida (201, guardada y enviada); 422 por campo; spam descartado; 400 JSON roto; 413 cuerpo grande; formulario sin JS (303); correo caído; límite 429; 10 reservas simultáneas sin mezclar líneas. |
| `tests/sitio.test.js` | Página principal, cabeceras de seguridad, HSTS solo en producción, redirección `/index.html`, caché de imágenes, robots/sitemap/manifest, 404 HTML y JSON, archivos ocultos no expuestos, integridad de recursos y SEO (canonical, descripción, `h1`, JSON-LD, FAQ visible = FAQ estructurada, `alt`, sin `on*=`). |
| `tests/config-correo.test.js` | Valores por defecto, números inválidos, escape de HTML en el correo, SMTP no configurado y envío con transporte falso. |

## Pruebas manuales realizadas antes de publicar

Con el servidor real (`npm start`) y el navegador:

- Página completa sin errores de consola ni violaciones de la CSP; 0 recursos externos no permitidos.
- Formulario vacío: muestra errores por campo y enfoca el primero.
- Formulario completo: respuesta 201, mensaje de éxito, formulario limpio y línea guardada en `data/reservas.jsonl`.
- Enlace directo `/#quinceanos`: abre la galería de quinceaños.
- Botones de precios sin archivos: cambian a "Pídelos en el formulario" y apuntan a `#reservar`.
- Vista de celular (375 × 812): sin desplazamiento horizontal; formulario en una columna.
