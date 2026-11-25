# Jeniffer Photography — sitio web

[![CI](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/ci.yml/badge.svg)](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/ci.yml)
[![CodeQL](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/codeql.yml/badge.svg)](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/codeql.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A522.9-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express)

Portafolio de **Jeniffer Valle**, fotógrafa de **bodas, quinceaños y cumpleaños en Nicaragua**.
Galerías animadas en 3D, cámara para tomarse una selfie, reservas por **WhatsApp** y SEO técnico completo.
Todo se sirve desde el propio dominio, sin depender de servicios de terceros.

---

## Contenido

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y uso local](#instalación-y-uso-local)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Seguridad](#seguridad)
- [Rendimiento](#rendimiento)
- [Publicación](#publicación)
- [Documentación](#documentación)
- [Licencia](#licencia)

## Características

- Portada con efecto de enfoque y versión recortada para celular.
- Sliders 3D de bodas, quinceaños y cumpleaños, con enlaces directos (`/#boda`, `/#quinceanos`, `/#cumpleanos`).
- Galería en espiral (Three.js), galería parallax, capas 3D y «Momentos que se abren».
- Cámara 3D hecha en CSS donde el visitante puede tomarse una selfie y verla en la pantalla de la cámara.
- Botón de reservas que abre WhatsApp con un mensaje preescrito (+505 8432 9491).
- Descarga de la lista de precios (PDF e imagen); si aún no está publicada, el botón lleva a WhatsApp.
- 50 fotografías en WebP + 33 miniaturas para las galerías pequeñas.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Sitio | HTML5, CSS3, JavaScript nativo, Three.js 0.128, GSAP 3.12 + ScrollTrigger, Bootstrap 5.3 (recortado) |
| Servidor | Node.js ≥ 22.9, Express 5, Helmet, compression |
| Calidad | `node:test`, Supertest, html-validate, GitHub Actions, CodeQL, Dependabot |

## Estructura del proyecto

```
jeniffer-photography-web/
├── public/                 Sitio que recibe el navegador (se sirve tal cual)
│   ├── index.html · 404.html
│   ├── css/                styles.css (diseño) · fuentes.css (generado)
│   ├── js/                 fotos.js · main.js · sitio.js
│   ├── img/                Fotos WebP por categoría, miniaturas, íconos, imagen para redes
│   ├── vendor/             Three.js, GSAP, Bootstrap recortado y fuentes (generado)
│   ├── descargas/          precios-servicios.pdf y precios-servicios.jpg
│   └── robots.txt · sitemap.xml · site.webmanifest · favicon.svg · .htaccess · _headers
├── server/                 Servidor Node.js (Express)
│   ├── index.js            Arranque y apagado ordenado
│   ├── app.js              Aplicación: seguridad, compresión, caché, archivos, 404
│   ├── config.js           Configuración desde variables de entorno
│   ├── middleware/         Cabeceras de seguridad
│   ├── routes/             API (/api/salud)
│   └── lib/                Registro (logs)
├── scripts/                Herramientas: recursos, verificación, PDF de documentación
├── tests/                  Pruebas automáticas
├── docs/                   Documentación técnica y PDFs
├── .github/                CI, CodeQL, Dependabot y plantillas
├── deploy/                 Nginx, Caddy (proxy inverso) y firewall
├── Dockerfile · ecosystem.config.cjs · .env.example · .nvmrc · .npmrc
└── package.json
```

## Instalación y uso local

Requisitos: **Node.js 22.9 o superior** y Git.

```bash
git clone https://github.com/AleReyes77/jeniffer-photography-web.git
cd jeniffer-photography-web
npm install
npm run dev
```

Abre <http://localhost:3000>. El servidor se reinicia solo al guardar cambios.
También funciona con la extensión **Live Server** de VS Code (la raíz ya apunta a `public/`).

## Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `npm start` | Inicia el servidor (producción). |
| `npm run dev` | Desarrollo: recarga automática y lee `.env` si existe. |
| `npm test` | Ejecuta las pruebas automáticas. |
| `npm run verificar` | HTML válido + recursos completos + pruebas (lo mismo que la CI). |
| `npm run recursos` | Regenera `public/vendor/`, `css/fuentes.css`, Bootstrap recortado y miniaturas. |
| `npm run docs:pdf` | Regenera `docs/explicacion-del-codigo.pdf`. |

## Variables de entorno

Copia `.env.example` como `.env`. Ninguna es obligatoria y hoy ninguna es secreta.

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `NODE_ENV` | `development` | `production` activa HSTS y `upgrade-insecure-requests`. |
| `PORT` | `3000` | Puerto del servidor. |
| `SITE_URL` | `http://localhost:3000` | URL pública del sitio. |
| `HOST` | `127.0.0.1` | Dirección de escucha. 127.0.0.1 = solo a través del proxy (recomendado); Docker usa 0.0.0.0. |
| `TRUST_PROXY` | `false` | `true` detrás de Nginx, Apache, Cloudflare o el panel del hosting. |
| `FORCE_HTTPS` | sí en producción con proxy | Redirige HTTP → HTTPS (301). |
| `RATE_LIMIT_WINDOW_SEC` / `RATE_LIMIT_MAX` | `60` / `300` | Límite de peticiones por IP. |

## Pruebas y calidad

```bash
npm run verificar
```

Cubre servidor (salud, 404, configuración, caché, compresión, registro), seguridad (CSP solo del propio
dominio, cabeceras, HSTS, archivos ocultos), rendimiento (sin servidores externos, scripts con `defer`,
sin jQuery), WhatsApp, sintaxis de los scripts del navegador, integridad de más de 180 referencias a
archivos y SEO (canonical, descripción, un `h1`, JSON-LD con Nicaragua, FAQ visible = FAQ estructurada, `alt`).
La CI repite todo en Node 22 y 24 en cada cambio. Detalle en [docs/PRUEBAS.md](docs/PRUEBAS.md).

## Seguridad

- Content-Security-Policy: scripts, estilos y fuentes **solo del propio dominio**; sin formularios (`form-action 'none'`).
- HTTPS obligatorio (301) y HSTS en producción, Permissions-Policy (solo cámara), `nosniff`, sin `X-Powered-By`.
- Límite de peticiones por IP (429), servidor escuchando solo en 127.0.0.1 detrás de un proxy, registro de errores 5xx.
- Accesibilidad verificada con axe-core: 0 problemas (contraste WCAG AA, nombres accesibles, regiones).
- Sin contraseñas en el código; `.env`, llaves y bases de datos están en `.gitignore`.
- Dependabot (actualizaciones semanales), CodeQL (análisis de seguridad) y `npm audit` en la CI.
- Ver [SECURITY.md](SECURITY.md).

## Rendimiento

Carga inicial medida en el navegador, antes y después de la optimización (sin desplazarse por la página):

| | Antes | Después |
|---|---|---|
| Peso descargado | 6,4 MB* | 1,0 MB |
| Peticiones | 70 | 33 |
| Servidores externos | 5 | 0 |
| Fotos descargadas | 49 | 11 |

\* Sin contar lo descargado de los CDN externos, que el navegador no permite medir.

Claves: galerías que cargan al acercarse, miniaturas de 480 px, fotos de los sliders al abrirlos,
fuentes y librerías locales, Bootstrap recortado (227 KB → 11 KB), sin jQuery y scripts con `defer`.

## Publicación

Guía completa en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) (hosting con Node.js en Nicaragua, VPS con PM2 o Docker).
Antes de publicar:

1. Reemplaza `https://TU-DOMINIO.com` por tu dominio en todo el proyecto (`Ctrl + Shift + H` en VS Code).
2. Coloca `precios-servicios.pdf` y `precios-servicios.jpg` en `public/descargas/` (se puede hacer desde ya).
3. Publica con **HTTPS** y registra el sitio en Google Search Console y Google Business Profile ([docs/SEO.md](docs/SEO.md)).

## Documentación

- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) · [docs/API.md](docs/API.md) · [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)
- [docs/PRUEBAS.md](docs/PRUEBAS.md) · [docs/SEO.md](docs/SEO.md) · [docs/MANTENIMIENTO.md](docs/MANTENIMIENTO.md)
- [docs/explicacion-del-codigo.pdf](docs/explicacion-del-codigo.pdf): cada línea del código explicada.
- [docs/guia-buenas-practicas.pdf](docs/guia-buenas-practicas.pdf): seguridad, mantenimiento y publicación explicados desde cero.
- [docs/auditoria-seguridad.pdf](docs/auditoria-seguridad.pdf): auditoría completa del sitio y correcciones, con diagramas.
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

## Licencia

El código es visible públicamente, pero **no es de uso libre**: código y fotografías © Jeniffer Photography.
Todos los derechos reservados. Ver [LICENSE](LICENSE).
