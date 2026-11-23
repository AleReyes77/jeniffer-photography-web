# Jeniffer Valle Fotografía — sitio web

[![CI](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/ci.yml/badge.svg)](https://github.com/AleReyes77/jeniffer-photography-web/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A522.9-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express)

Portafolio profesional de fotografía de **bodas, quinceaños y cumpleaños**, con galerías animadas en 3D,
cámara para tomarse una selfie, formulario de reservas con backend propio y SEO técnico completo.

---

## Contenido

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación y uso local](#instalación-y-uso-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Despliegue](#despliegue)
- [Antes de publicar](#antes-de-publicar)
- [Documentación adicional](#documentación-adicional)
- [Licencia](#licencia)

## Características

**Sitio (frontend)**
- Portada con efecto de enfoque y versión recortada para celular.
- Sliders 3D de bodas, quinceaños y cumpleaños, con enlaces directos (`/#boda`, `/#quinceanos`, `/#cumpleanos`).
- Galería en espiral (Three.js), galería parallax, capas 3D y "Momentos que se abren".
- Cámara 3D en CSS: la persona puede tomarse una selfie (con permiso de la cámara) y verla en la pantalla de la cámara.
- Botones de descarga de precios (PDF e imagen) que se desactivan solos si el archivo aún no existe.
- Formulario de reservas accesible, con validación y mensajes claros.
- 50 fotografías en **WebP** con nombres descriptivos.

**Servidor (backend)**
- API REST con **Express 5**: `GET /api/salud` y `POST /api/reservas`.
- Validación y limpieza de datos en el servidor, campo trampa contra robots y límite de envíos por IP.
- Guarda cada reserva en un archivo JSON Lines y la envía por correo (SMTP / Nodemailer).
- Funciona también sin JavaScript (formulario HTML clásico con redirección 303).
- Cabeceras de seguridad (CSP estricta, HSTS en producción, Permissions-Policy), compresión gzip y caché por tipo de archivo.
- Registro estructurado en JSON y apagado ordenado (SIGTERM).

**SEO**
- Título y descripción optimizados, canonical, hreflang, Open Graph y Twitter Cards.
- Datos estructurados JSON-LD: `WebSite`, `WebPage`, `Person`, `ProfessionalService`, `ImageGallery` y `FAQPage`.
- `sitemap.xml` con imágenes, `robots.txt`, `site.webmanifest`, íconos y página 404.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5 (CSS), jQuery 3, GSAP 3, Three.js r128 |
| Backend | Node.js ≥ 22.9, Express 5, Helmet, compression, express-rate-limit, Nodemailer |
| Pruebas | `node:test`, Supertest, html-validate |
| CI / despliegue | GitHub Actions, Docker, Render |

## Estructura del proyecto

```
jeniffer-photography-web/
├── public/                    Sitio que ve el visitante (se sirve tal cual)
│   ├── index.html             Página principal
│   ├── 404.html               Página de error
│   ├── css/styles.css         Estilos
│   ├── js/
│   │   ├── fotos.js           Lista de fotos de sliders y galerías
│   │   ├── main.js            Animaciones, galerías 3D, cámara
│   │   ├── sitio.js           Enlaces a galerías, aviso de la espiral, botones de precios
│   │   └── reservas.js        Formulario de reservas
│   ├── img/                   Fotos .webp por categoría, íconos e imagen para redes
│   ├── descargas/             Aquí van precios-servicios.pdf y precios-servicios.jpg
│   ├── robots.txt · sitemap.xml · site.webmanifest · favicon.svg
│   └── .htaccess · _headers   Configuración para hosting estático (Apache / Netlify)
├── server/                    Backend
│   ├── index.js               Punto de entrada (abre el puerto)
│   ├── app.js                 Aplicación Express
│   ├── config.js              Configuración desde variables de entorno
│   ├── middleware/seguridad.js
│   ├── routes/api.js
│   └── lib/                   validacion · almacen · correo · registro
├── tests/                     Pruebas automáticas (45)
├── scripts/verificar-recursos.js
├── docs/                      Documentación técnica y PDF explicativo
├── .github/                   CI y plantillas
├── Dockerfile · render.yaml · .env.example
└── package.json
```

## Requisitos

- **Node.js 22.9 o superior** (incluye npm). Comprueba con `node --version`.
- Git.

## Instalación y uso local

```bash
git clone https://github.com/AleReyes77/jeniffer-photography-web.git
cd jeniffer-photography-web
npm install
npm run dev
```

Abre <http://localhost:3000>. El servidor se reinicia solo al guardar cambios.

> Para editar solo el diseño puedes usar la extensión **Live Server** de VS Code (la carpeta raíz ya está
> configurada como `public/`), pero el formulario de reservas necesita el servidor (`npm run dev`).

## Variables de entorno

Copia `.env.example` como `.env` y completa los valores. Todas tienen un valor por defecto, así que el sitio
arranca sin `.env`; en ese caso las reservas se guardan pero no se envían por correo.

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `NODE_ENV` | `development` | `production` activa HSTS y `upgrade-insecure-requests`. |
| `PORT` | `3000` | Puerto del servidor. |
| `SITE_URL` | `http://localhost:3000` | URL pública del sitio. |
| `TRUST_PROXY` | `false` | `true` detrás de Render, Railway, Nginx o Cloudflare. |
| `RATE_LIMIT_WINDOW_MIN` | `15` | Ventana del límite de envíos, en minutos. |
| `RATE_LIMIT_MAX` | `5` | Máximo de reservas por IP en la ventana. |
| `RESERVAS_FILE` | `data/reservas.jsonl` | Archivo donde se guardan las reservas. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | — | Servidor de correo saliente. |
| `CONTACT_FROM`, `CONTACT_TO` | — | Remitente y destinatario de la notificación. |

## Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `npm start` | Inicia el servidor (producción). |
| `npm run dev` | Inicia en modo desarrollo con recarga automática y `.env` si existe. |
| `npm test` | Ejecuta las 45 pruebas automáticas. |
| `npm run test:cobertura` | Pruebas con informe de cobertura. |
| `npm run lint:html` | Valida el HTML con html-validate. |
| `npm run check:recursos` | Comprueba que existan todas las imágenes, estilos y scripts enlazados. |
| `npm run verificar` | Todo lo anterior junto (lo que corre la CI). |
| `npm run docs:pdf` | Regenera `docs/explicacion-del-codigo.pdf` (requiere Edge o Chrome). |

## Pruebas y calidad

```bash
npm run verificar
```

- **Unitarias:** validación de reservas, configuración, construcción y escape del correo.
- **Integración (Supertest):** API (201, 422, 400, 413, 429, spam, formulario sin JS), archivos estáticos,
  cabeceras de seguridad, caché, 404 y redirecciones.
- **SEO:** canonical, descripción de 120–170 caracteres, un solo `h1`, JSON-LD válido y FAQ idéntica a la visible,
  `alt` en todas las imágenes, sin manejadores de eventos en línea.
- **Integridad:** más de 120 referencias a archivos locales verificadas.

Detalle en [docs/PRUEBAS.md](docs/PRUEBAS.md).

## Despliegue

Opciones documentadas en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md):

1. **Render** (recomendado, plan gratuito): conecta el repositorio; `render.yaml` configura todo.
2. **Docker**: `docker build -t jeniffer-web . && docker run -p 3000:3000 --env-file .env jeniffer-web`.
3. **Hosting estático** (Hostinger, Netlify, GitHub Pages): sube solo `public/`. Todo funciona excepto el
   formulario, que mostrará el correo de contacto como alternativa.

## Antes de publicar

1. Reemplaza `https://TU-DOMINIO.com` por tu dominio en todo el proyecto (`Ctrl + Shift + H` en VS Code).
2. Pon `precios-servicios.pdf` y `precios-servicios.jpg` en `public/descargas/`.
3. Agrega ciudad, país y teléfono en el JSON-LD (`ProfessionalService`) de `public/index.html`.
4. Configura el SMTP para recibir las reservas por correo.
5. Publica con **HTTPS** (necesario para la cámara y para el SEO).
6. Registra el sitio en Google Search Console, envía el sitemap y crea tu perfil de Google Business.

Guía de SEO completa en [docs/SEO.md](docs/SEO.md).

## Documentación adicional

- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md): cómo está construido y por qué.
- [docs/API.md](docs/API.md): referencia de la API.
- [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md): publicación paso a paso.
- [docs/PRUEBAS.md](docs/PRUEBAS.md): estrategia de pruebas.
- [docs/SEO.md](docs/SEO.md): SEO técnico y local.
- [docs/explicacion-del-codigo.pdf](docs/explicacion-del-codigo.pdf): explicación detallada de todo el código.
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

## Licencia

Código y fotografías © Jeniffer Valle Fotografía. Todos los derechos reservados. Ver [LICENSE](LICENSE).
