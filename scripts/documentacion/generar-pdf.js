/**
 * generar-pdf.js — Genera docs/explicacion-del-codigo.pdf
 *
 * Recorre los archivos del proyecto y produce un documento con cada línea de código
 * junto a su explicación. Prioridad de las explicaciones:
 *   1) anotaciones escritas a mano línea por línea (anotaciones/backend.js, frontend-propio.js)
 *   2) diccionarios de configuración (anotaciones/configuracion.js)
 *   3) explicaciones automáticas por tipo de archivo (explicadores.js)
 * Además, las explicaciones profundas por bloque (anotaciones/bloques.js) se insertan
 * como encabezados donde empieza cada bloque.
 *
 * Uso:  npm run docs:pdf   (necesita Microsoft Edge o Google Chrome instalado)
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { explicarCss, explicarHtml, explicarJs, esc } from './explicadores.js';
import backend from './anotaciones/backend.js';
import frontendPropio from './anotaciones/frontend-propio.js';
import configuracion from './anotaciones/configuracion.js';
import bloques from './anotaciones/bloques.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SALIDA_HTML = path.join(RAIZ, 'docs', 'explicacion-del-codigo.html');
const SALIDA_PDF = path.join(RAIZ, 'docs', 'explicacion-del-codigo.pdf');
const version = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8')).version;

/* ---------------------------------------------------------------------------
   Orden del documento
   --------------------------------------------------------------------------- */
const CAPITULOS = [
  { titulo: 'Configuración del proyecto', intro: 'Archivos que definen cómo se instala, ejecuta, prueba, formatea y publica el proyecto.', archivos: ['package.json', '.env.example', '.gitignore', '.gitattributes', '.editorconfig', '.htmlvalidate.json', '.vscode/settings.json', '.vscode/extensions.json', '.nvmrc', '.npmrc', 'Dockerfile', '.dockerignore', 'ecosystem.config.cjs', '.github/workflows/ci.yml', '.github/workflows/codeql.yml', '.github/dependabot.yml', 'deploy/nginx.conf', 'deploy/Caddyfile', 'deploy/firewall-ufw.sh'] },
  { titulo: 'Backend (servidor)', intro: 'El servidor Node.js + Express: configuración, registro, seguridad, ruta de salud, aplicación y arranque. Explicado línea por línea.', archivos: ['server/config.js', 'server/lib/registro.js', 'server/middleware/seguridad.js', 'server/middleware/limite.js', 'server/routes/api.js', 'server/app.js', 'server/index.js'] },
  { titulo: 'Herramientas', intro: 'Scripts de apoyo para el control de calidad.', archivos: ['scripts/preparar-recursos.js', 'scripts/verificar-recursos.js'] },
  { titulo: 'Pruebas automáticas', intro: '50 pruebas con el ejecutor nativo de Node (node:test) y Supertest.', archivos: ['tests/ayudantes.js', 'tests/api.test.js', 'tests/seguridad.test.js', 'tests/sitio.test.js'] },
  { titulo: 'Frontend: página y archivos públicos', intro: 'Lo que descarga el navegador del visitante (carpeta public/).', archivos: ['public/index.html', 'public/404.html', 'public/robots.txt', 'public/sitemap.xml', 'public/site.webmanifest', 'public/_headers', 'public/.htaccess'] },
  { titulo: 'Frontend: JavaScript', intro: 'Scripts del sitio, en el orden en que se cargan.', archivos: ['public/js/fotos.js', 'public/js/main.js', 'public/js/sitio.js'] },
  { titulo: 'Frontend: estilos', intro: 'La hoja de estilos completa, línea por línea, y las fuentes.', archivos: ['public/css/fuentes.css', 'public/css/styles.css'] },
];

/* ---------------------------------------------------------------------------
   Explicaciones de archivos de configuración (diccionarios)
   --------------------------------------------------------------------------- */
const SCHEMA = {
  '@context': 'Vocabulario usado: Schema.org.', '@graph': 'Lista de entidades relacionadas entre sí.', '@type': 'Tipo de entidad de Schema.org.',
  '@id': 'Identificador único de la entidad, para enlazarla desde otras.', url: 'Dirección web.', name: 'Nombre.', alternateName: 'Nombre alternativo.',
  inLanguage: 'Idioma.', publisher: 'Quién publica.', description: 'Descripción.', isPartOf: 'Entidad a la que pertenece.', about: 'De qué trata.',
  primaryImageOfPage: 'Imagen principal de la página.', contentUrl: 'URL del archivo.', width: 'Ancho en píxeles.', height: 'Alto en píxeles.', caption: 'Pie de foto.',
  jobTitle: 'Profesión.', image: 'Imagen o imágenes.', email: 'Correo.', knowsAbout: 'Temas en los que es experta.', sameAs: 'Perfiles oficiales en otras webs (redes sociales).',
  worksFor: 'Negocio para el que trabaja.', logo: 'Logotipo.', founder: 'Fundadora.', knowsLanguage: 'Idioma de atención.', hasOfferCatalog: 'Catálogo de servicios.',
  itemListElement: 'Elementos del catálogo.', itemOffered: 'Servicio ofrecido.', serviceType: 'Tipo de servicio.', provider: 'Quién lo presta.',
  author: 'Autora.', associatedMedia: 'Fotos de la galería.', creator: 'Creadora de la foto.', creditText: 'Crédito de la foto.', copyrightNotice: 'Aviso de derechos de autor.',
  mainEntity: 'Preguntas de la página.', acceptedAnswer: 'Respuesta aceptada.', text: 'Texto de la respuesta.',
};

function claveDeLinea(archivo, t) {
  let m;
  if (/\.json$|webmanifest$/.test(archivo)) return (m = t.match(/^"([^"]+)"\s*:/)) ? m[1] : (m = t.match(/^"([^"]+)",?$/)) ? m[1] : null;
  if (archivo === '.env.example') return (m = t.match(/^([A-Z_]+)=/)) ? m[1] : null;
  if (archivo === '.editorconfig') return t.startsWith('[') ? t : (m = t.match(/^(\w+)\s*=/)) ? m[1] : null;
  if (archivo === 'Dockerfile') return (m = t.match(/^([A-Z]+)\b/)) ? m[1] : null;
  if (/\.ya?ml$/.test(archivo)) return (m = t.match(/^-?\s*([\w-]+):/)) ? m[1] : null;
  if (archivo === 'public/robots.txt') return (m = t.match(/^([\w-]+):/)) ? m[1] : null;
  if (archivo === 'public/_headers') return (m = t.match(/^([\w-]+):/)) ? m[1] : t;
  if (archivo === 'public/.htaccess') return t.split(/\s+/)[0];
  if (archivo === '.gitattributes') return t.split(/\s+/)[0];
  return t; // .gitignore, .dockerignore: la línea completa es el patrón
}

function explicarConfig(archivo, t, dic) {
  if (t.startsWith('#')) return `Comentario: ${esc(t.replace(/^#+\s?/, '')) || '(separador)'}`;
  if (/^[{}[\],]+$/.test(t) || /^[}\]],?$/.test(t)) return 'Cierra o abre un objeto o lista.';
  const clave = claveDeLinea(archivo, t);
  if (clave && dic[clave]) return dic[clave];
  if (/^- run:|^run:/.test(t)) return `Ejecuta el comando ${esc(t.replace(/^-?\s*run:\s*/, ''))}.`;
  if (/^- uses:|^uses:/.test(t)) return `Usa la acción ${esc(t.replace(/^-?\s*uses:\s*/, ''))} (actions/checkout descarga el código; actions/setup-node instala Node).`;
  if (archivo === 'Dockerfile' && /^\s*CMD wget/.test(t)) return 'Comando del chequeo de salud: descarga /api/salud; si falla, devuelve error.';
  if (/^"[^"]+"\s*:/.test(t)) return `Propiedad ${esc(clave)}: ${esc(t.slice(t.indexOf(':') + 1).trim().replace(/,$/, ''))}.`;
  return 'Valor de la configuración del elemento anterior.';
}

function explicarXml(t) {
  if (t.startsWith('<?xml')) return 'Declaración XML con codificación UTF-8.';
  if (t.startsWith('<urlset')) return 'Raíz del sitemap; declara el estándar sitemaps.org.';
  if (t.startsWith('xmlns:image')) return 'Agrega la extensión de imágenes de Google.';
  if (t.startsWith('<url>')) return 'Inicio de la entrada de una página.';
  if (t.startsWith('<loc>')) return 'URL de la página.';
  if (t.startsWith('<lastmod>')) return 'Fecha de la última modificación.';
  if (t.startsWith('<changefreq>')) return 'Frecuencia estimada de cambios (orientativa para Google).';
  if (t.startsWith('<priority>')) return 'Prioridad relativa dentro del sitio (1.0 = máxima).';
  if (t.startsWith('<image:image>')) return `Foto para Google Imágenes: ${esc((t.match(/\/img\/([^<]+)/) || [])[1] || '')}.`;
  return 'Cierra la entrada.';
}

/* ---------------------------------------------------------------------------
   Render de un archivo
   --------------------------------------------------------------------------- */
const estadisticas = { archivos: 0, lineas: 0, aMano: 0, automaticas: 0, sinEmparejar: [] };

function renderArchivo(rel) {
  const ruta = path.join(RAIZ, rel);
  if (!existsSync(ruta)) throw new Error(`No existe ${rel}`);
  const lineas = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const mano = backend[rel] || frontendPropio[rel];
  const dic = configuracion[rel];
  const bloq = bloques[rel];
  const resumen = (mano || dic || bloq || {}).resumen || '';
  const ext = path.extname(rel).toLowerCase();

  let puntero = 0;
  let bloqueIdx = 0;
  let enLdJson = false;
  let enEstilo = false;
  const filas = [];

  lineas.forEach((linea, i) => {
    const t = linea.trim();
    if (!t) return;

    // Encabezado de bloque
    if (bloq?.bloques && bloqueIdx < bloq.bloques.length && linea.includes(bloq.bloques[bloqueIdx][0])) {
      const [, titulo, texto] = bloq.bloques[bloqueIdx];
      filas.push(`<tr class="bloque"><td colspan="3"><div class="bt">▸ ${esc(titulo)}</div><div class="bx">${texto}</div></td></tr>`);
      bloqueIdx += 1;
    }

    let explicacion = null;
    if (mano) {
      const lista = mano.lineas;
      for (let k = puntero; k < Math.min(puntero + 4, lista.length); k += 1) {
        if (t.startsWith(lista[k][0]) || t.includes(lista[k][0])) {
          for (let s = puntero; s < k; s += 1) estadisticas.sinEmparejar.push(`${rel}: «${lista[s][0]}»`);
          explicacion = lista[k][1];
          puntero = k + 1;
          estadisticas.aMano += 1;
          break;
        }
      }
    } else if (dic) {
      explicacion = explicarConfig(rel, t, dic.claves);
      estadisticas.aMano += 1;
    }

    if (explicacion === null) {
      estadisticas.automaticas += 1;
      if (ext === '.html') {
        if (/<script type="application\/ld\+json">/.test(t)) enLdJson = true;
        if (/^<style>/.test(t)) enEstilo = true;
        if (enLdJson && !t.startsWith('<script')) {
          const clave = (t.match(/^"([^"]+)"\s*:/) || [])[1];
          explicacion = t.startsWith('</script') ? 'Cierra el bloque JSON-LD.' : clave ? `JSON-LD — ${c(clave)}: ${SCHEMA[clave] || 'propiedad de Schema.org.'}${/:\s*"/.test(t) ? ` Valor: ${esc(t.split(/:\s*/).slice(1).join(':').replace(/,$/, '').slice(0, 90))}` : ''}` : /^"/.test(t) ? `JSON-LD — valor de la lista: ${esc(t.replace(/,$/, '').slice(0, 100))}` : 'JSON-LD — abre o cierra un objeto o lista.';
          if (t.startsWith('</script')) enLdJson = false;
        } else if (enEstilo && !t.startsWith('<style')) {
          explicacion = t.startsWith('</style') ? 'Cierra los estilos incrustados.' : explicarCss(t);
          if (t.startsWith('</style')) enEstilo = false;
        } else {
          explicacion = explicarHtml(t);
        }
      } else if (ext === '.css') explicacion = explicarCss(t);
      else if (ext === '.xml') explicacion = explicarXml(t);
      else if (ext === '.js' || ext === '.cjs') explicacion = explicarJs(t);
      else explicacion = 'Línea de configuración.';
      if (mano && !/^(\/\/|\/\*|\*)/.test(t) && !/^[}\])]+[;,)]*$/.test(t)) estadisticas.sinEmparejar.push(`${rel}:${i + 1} (automática) ${t.slice(0, 60)}`);
    }

    const sangria = linea.match(/^\s*/)[0].replace(/\t/g, '  ').length;
    const codigo = esc(t.length > 600 ? `${t.slice(0, 600)} … [línea de ${t.length} caracteres]` : t);
    filas.push(`<tr><td class="n">${i + 1}</td><td class="c" style="padding-left:${4 + Math.min(sangria, 24) * 3}px">${codigo}</td><td class="e">${explicacion}</td></tr>`);
    estadisticas.lineas += 1;
  });

  if (bloq?.bloques && bloqueIdx < bloq.bloques.length) for (let s = bloqueIdx; s < bloq.bloques.length; s += 1) estadisticas.sinEmparejar.push(`${rel}: bloque no encontrado «${bloq.bloques[s][0]}»`);
  if (mano && puntero < mano.lineas.length) for (let s = puntero; s < mano.lineas.length; s += 1) estadisticas.sinEmparejar.push(`${rel}: sin usar «${mano.lineas[s][0]}»`);
  estadisticas.archivos += 1;
  const id = rel.replace(/[^a-z0-9]/gi, '-');
  return `<section class="archivo" id="${id}">
  <h3>${esc(rel)} <span class="meta">${lineas.length} líneas</span></h3>
  ${resumen ? `<p class="resumen">${resumen}</p>` : ''}
  ${bloq?.resumen && bloq !== mano && bloq !== dic && resumen !== bloq.resumen ? `<p class="resumen">${bloq.resumen}</p>` : ''}
  <table><thead><tr><th>#</th><th>Código</th><th>Explicación</th></tr></thead><tbody>${filas.join('\n')}</tbody></table>
</section>`;
}
const c = (t) => `<code>${esc(t)}</code>`;

/* ---------------------------------------------------------------------------
   Árbol de carpetas
   --------------------------------------------------------------------------- */
const DESCRIPCION = {
  '.github': 'Configuración de GitHub: integración continua y plantillas.', '.github/workflows': 'Flujos de GitHub Actions.', '.github/ISSUE_TEMPLATE': 'Plantillas para reportar errores.',
  '.vscode': 'Ajustes y extensiones recomendadas de VS Code.', docs: 'Documentación técnica (Markdown) y este PDF.', public: 'El sitio web: todo lo que se envía al navegador.',
  'public/css': 'Hoja de estilos.', 'public/js': 'Scripts del navegador.', 'public/img': 'Fotografías e íconos en WebP, PNG y JPG.', 'public/img/hero': 'Portada y «A través del lente» (con versiones para celular).',
  'public/img/bodas': 'Fotos de bodas.', 'public/img/quinceanos': 'Fotos de quinceaños.', 'public/img/cumpleanos': 'Fotos de cumpleaños.', 'public/img/desfiles': 'Fotos de desfiles y bandas.',
  'public/img/sesiones': 'Sesiones de bebé y paisaje.', 'public/img/og': 'Imagen para compartir en redes (1200×630).', 'public/img/icons': 'Íconos del sitio y de la app instalable.', 'public/descargas': 'Archivos de precios descargables.', 'public/vendor': 'Librerías y fuentes servidas desde el propio dominio (generado con npm run recursos).', 'public/vendor/fonts': 'Fuentes .woff2 (Poppins, Dancing Script, Inter, Inter Tight, Monoton).', 'public/img/miniaturas': 'Miniaturas de 480 px para las galerías donde las fotos se ven pequeñas.', 'docs/MANTENIMIENTO.md': 'Seguridad, red, deuda técnica y operación.', 'docs/auditoria-seguridad.pdf': 'Auditoría completa del sitio y sus correcciones.', deploy: 'Configuraciones de servidor: Nginx, Caddy y firewall.', 'deploy/LEEME.md': 'Explica los archivos de despliegue.', '.nvmrc': 'Versión de Node del proyecto.', '.node-version': 'Versión de Node (formato de otras herramientas).', '.npmrc': 'Configuración de npm (engine-strict, save-exact).', 'docs/guia-buenas-practicas.pdf': 'Guía explicada desde cero: seguridad, repositorio público, publicación.', 'ecosystem.config.cjs': 'Configuración de PM2 para mantener el servidor encendido en un VPS.', 'public/css/fuentes.css': 'Reglas @font-face de las fuentes locales (generado).',
  scripts: 'Herramientas de desarrollo.', 'scripts/documentacion': 'Generador de este PDF.', 'scripts/documentacion/anotaciones': 'Explicaciones escritas a mano usadas por el generador.',
  server: 'Backend Node.js + Express.', 'server/lib': 'Utilidades: validación, almacén, correo y registro.', 'server/middleware': 'Middlewares de seguridad.', 'server/routes': 'Rutas de la API.', tests: 'Pruebas automáticas.',
  'README.md': 'Documentación principal del repositorio.', 'CHANGELOG.md': 'Registro de cambios por versión.', 'SECURITY.md': 'Cómo reportar vulnerabilidades.', 'CONTRIBUTING.md': 'Cómo contribuir.', LICENSE: 'Licencia: todos los derechos reservados.',
  'package-lock.json': 'Versiones exactas de cada dependencia instalada (generado por npm; garantiza instalaciones idénticas). No se edita a mano.',
  'docs/API.md': 'Referencia de la API.', 'docs/ARQUITECTURA.md': 'Arquitectura y decisiones.', 'docs/DESPLIEGUE.md': 'Cómo publicar.', 'docs/PRUEBAS.md': 'Estrategia de pruebas.', 'docs/SEO.md': 'Guía de SEO.',
  'docs/explicacion-del-codigo.pdf': 'Este documento.', 'docs/explicacion-del-codigo.html': 'Versión HTML de este documento (fuente del PDF).',
  'public/favicon.svg': 'Ícono vectorial de la pestaña.', 'public/descargas/LEEME.txt': 'Instrucciones para los archivos de precios.',
  '.github/PULL_REQUEST_TEMPLATE.md': 'Plantilla de Pull Request.', '.github/ISSUE_TEMPLATE/reporte-de-error.md': 'Plantilla para reportar errores.',
};
/** Archivos que forman parte del repositorio (lo que Git versiona, sin los ignorados). */
const VERSIONADOS = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: RAIZ, encoding: 'utf8' })
  .split('\n').filter(Boolean).filter((r) => existsSync(path.join(RAIZ, r)));
const CARPETAS = new Set(VERSIONADOS.flatMap((r) => r.split('/').slice(0, -1).map((_, i, p) => p.slice(0, i + 1).join('/'))));
const visible = (rel) => VERSIONADOS.includes(rel) || CARPETAS.has(rel);

function arbol(dir = RAIZ, prefijo = '', rel = '') {
  const entradas = readdirSync(dir).filter((n) => visible(rel ? `${rel}/${n}` : n)).sort((a, b) => {
    const da = statSync(path.join(dir, a)).isDirectory(); const db = statSync(path.join(dir, b)).isDirectory();
    return da === db ? a.localeCompare(b) : da ? -1 : 1;
  });
  return entradas.map((n, i) => {
    const r = rel ? `${rel}/${n}` : n;
    const ult = i === entradas.length - 1;
    const esDir = statSync(path.join(dir, n)).isDirectory();
    let desc = DESCRIPCION[r] || '';
    if (!desc && /\.(webp|jpg|png)$/.test(n)) desc = `Foto: ${n.replace(/\.(webp|jpg|png)$/, '').replace(/-/g, ' ')}.`;
    if (!desc) {
      const todas = { ...backend, ...frontendPropio, ...configuracion, ...bloques };
      desc = todas[r]?.resumen?.replace(/<[^>]+>/g, '').split('. ')[0] || '';
      if (desc && !desc.endsWith('.')) desc += '.';
    }
    const linea = `<div class="t"><span class="tp">${prefijo}${ult ? '└── ' : '├── '}</span><b>${esc(n)}${esDir ? '/' : ''}</b>${desc ? ` <span class="td">— ${esc(desc)}</span>` : ''}</div>`;
    return linea + (esDir ? arbol(path.join(dir, n), prefijo + (ult ? '    ' : '│   '), r) : '');
  }).join('');
}

/* ---------------------------------------------------------------------------
   Documento
   --------------------------------------------------------------------------- */
const capitulosHtml = CAPITULOS.map((cap, i) => `
<section class="capitulo"><h2>${i + 3}. ${esc(cap.titulo)}</h2><p>${esc(cap.intro)}</p>
${cap.archivos.map(renderArchivo).join('\n')}
</section>`).join('\n');

const indice = CAPITULOS.map((cap, i) => `<li><b>${i + 3}. ${esc(cap.titulo)}</b><ul>${cap.archivos.map((a) => `<li><a href="#${a.replace(/[^a-z0-9]/gi, '-')}">${esc(a)}</a></li>`).join('')}</ul></li>`).join('');

const GLOSARIO = [
  ['API', 'Conjunto de direcciones (rutas) que un programa ofrece para que otros le pidan datos o acciones. Aquí: /api/salud y /api/reservas.'],
  ['Backend / Frontend', 'Backend: lo que corre en el servidor (Node.js). Frontend: lo que corre en el navegador del visitante (HTML, CSS, JS).'],
  ['Middleware', 'Función que Express ejecuta en cadena para cada petición; puede modificarla, responder o pasar al siguiente con next().'],
  ['Promesa / async / await', 'Una promesa representa un resultado futuro (leer un archivo, una petición). await espera ese resultado sin bloquear el servidor.'],
  ['IIFE', 'Immediately Invoked Function Expression: función que se ejecuta al definirse; aísla variables.'],
  ['ESM', 'Módulos ES: sistema estándar de JavaScript con import/export.'],
  ['CSP', 'Content-Security-Policy: cabecera que limita de dónde puede cargar recursos la página; bloquea inyecciones de código.'],
  ['HSTS', 'Cabecera que obliga al navegador a usar siempre HTTPS con el dominio.'],
  ['Rate limit', 'Límite de peticiones por IP en un tiempo dado; frena abusos.'],
  ['Honeypot', 'Campo trampa invisible para personas que los robots suelen llenar.'],
  ['JSON / JSON Lines', 'JSON: formato de datos en texto. JSON Lines: un objeto JSON por línea, ideal para ir agregando registros.'],
  ['UUID', 'Identificador único universal de 128 bits; prácticamente imposible de repetir.'],
  ['SMTP', 'Protocolo para enviar correos.'],
  ['WebGL / Three.js', 'WebGL dibuja gráficos 3D con la tarjeta gráfica desde el navegador; Three.js es la librería que lo simplifica.'],
  ['Shader / Textura / UV', 'Shader: programa que corre en la GPU. Textura: imagen aplicada a un objeto 3D. UV: coordenadas que indican qué parte de la textura va en cada punto.'],
  ['GSAP / ScrollTrigger', 'Librería de animación; ScrollTrigger vincula animaciones al desplazamiento de la página.'],
  ['Responsive', 'Diseño que se adapta a cualquier tamaño de pantalla con @media, unidades relativas y clamp().'],
  ['SEO / JSON-LD / Schema.org', 'SEO: optimización para buscadores. JSON-LD: formato de datos estructurados. Schema.org: vocabulario estándar que entienden Google y Bing.'],
  ['LCP / Core Web Vitals', 'Métricas de experiencia que Google usa para posicionar; LCP mide cuánto tarda en aparecer el elemento más grande.'],
  ['CI', 'Integración continua: verificación automática del código en cada cambio (GitHub Actions).'],
  ['Inyección de dependencias', 'Pasar a una función los servicios que necesita en lugar de crearlos dentro; permite reemplazarlos en las pruebas.'],
  ['ARIA', 'Atributos de accesibilidad (role, aria-label, aria-live…) que ayudan a los lectores de pantalla.'],
];

const fecha = new Date().toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Explicación del código — Jeniffer Valle Fotografía</title>
<style>
@page { size: A4; margin: 14mm 10mm 16mm 10mm; @bottom-center { content: "Página " counter(page) " de " counter(pages); font: 8pt Arial; color: #777; } }
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { background: #fff; }
td.e, td.n { background: #fff; color: #1d1d24; }
td.n { color: #999; }
body { font: 9pt/1.45 "Segoe UI", Arial, sans-serif; color: #1d1d24; margin: 0; }
h1 { font-size: 30pt; margin: 0 0 8px; color: #3b2a5c; } h2 { font-size: 17pt; color: #3b2a5c; border-bottom: 2px solid #866BAF; padding-bottom: 4px; margin: 0 0 8px; }
h3 { font-size: 11.5pt; color: #fff; background: #3b2a5c; padding: 6px 10px; margin: 18px 0 6px; border-radius: 4px; break-after: avoid; }
h3 .meta { font-weight: 400; font-size: 8.5pt; opacity: .8; float: right; }
.portada { height: 255mm; display: flex; flex-direction: column; justify-content: center; padding: 0 12mm; break-after: page;
  background: linear-gradient(160deg, #f3eefb 0%, #fff 60%); border-left: 8px solid #866BAF; }
.portada .sub { font-size: 14pt; color: #555; } .portada .dato { margin-top: 26px; font-size: 10pt; color: #444; line-height: 1.8; }
.capitulo { break-before: page; } .resumen { background: #f5f2fa; border-left: 3px solid #866BAF; padding: 6px 10px; margin: 6px 0; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
thead { display: table-header-group; } th { background: #ece6f6; text-align: left; font-size: 8pt; padding: 3px 5px; }
th:nth-child(1), td.n { width: 6%; } th:nth-child(2) { width: 44%; } th:nth-child(3) { width: 50%; }
tr { break-inside: avoid; } td { border-bottom: 1px solid #ebe8f0; vertical-align: top; padding: 2px 5px; }
td.n { color: #999; font: 7pt Consolas, monospace; text-align: right; padding-right: 6px; }
td.c { font: 7.3pt/1.35 Consolas, "Courier New", monospace; white-space: pre-wrap; word-break: break-all; color: #2b2340; background: #fbfaff; }
td.e { font-size: 7.9pt; } td.e code, p code, li code, .bx code { font: 7.3pt Consolas, monospace; background: #f0ecf7; padding: 0 2px; border-radius: 2px; }
tr.bloque td { background: #fff8e6; border-left: 4px solid #e0a526; padding: 6px 9px; }
.bt { font-weight: 700; color: #7a5300; font-size: 9pt; margin-bottom: 2px; } .bx { font-size: 8.2pt; }
.arbol { font: 7.8pt/1.55 Consolas, monospace; } .t { white-space: pre-wrap; } .tp { color: #aaa; } .td { color: #555; font-family: "Segoe UI", Arial; }
.indice ul { margin: 2px 0 8px; } .indice li { margin: 1px 0; } a { color: #4b3480; text-decoration: none; }
.glosario dt { font-weight: 700; margin-top: 6px; color: #3b2a5c; } .glosario dd { margin: 0 0 0 12px; }
.flujo { font: 8pt/1.5 Consolas, monospace; background: #f7f5fb; padding: 10px; border-radius: 6px; white-space: pre; }
</style></head><body>
<div class="portada">
  <h1>Explicación completa del código</h1>
  <div class="sub">Jeniffer Valle Fotografía — sitio web y backend</div>
  <div class="dato">Versión ${version} · ${fecha}<br>Repositorio: github.com/AleReyes77/jeniffer-photography-web<br>
  ${estadisticasTexto()}</div>
</div>

<section><h2>1. Cómo leer este documento</h2>
<p>Cada archivo aparece en una tabla de tres columnas: el <b>número de línea</b>, el <b>código</b> tal como está en el proyecto y su <b>explicación</b>. Las líneas en blanco se omiten (por eso a veces el número salta).</p>
<ul>
<li><b>Backend, scripts propios, sitio.js, reservas.js y archivos de configuración:</b> explicación escrita a mano, línea por línea.</li>
<li><b>index.html, main.js y styles.css</b> (código extenso, en parte heredado de la plantilla original): antes de cada bloque o función aparece un <b>recuadro amarillo</b> con una explicación profunda de qué hace ese bloque y cómo; además, cada línea tiene su propia explicación, generada con diccionarios de propiedades CSS, etiquetas y atributos HTML y patrones de JavaScript.</li>
<li><b>Pruebas:</b> resumen por archivo y explicación de cada línea (grupos, casos y comprobaciones).</li>
</ul>
<p>El documento se genera automáticamente con <code>npm run docs:pdf</code>, así que se puede volver a crear cada vez que cambie el código.</p>
<h2 style="margin-top:14px">Cómo viaja una visita por el sistema</h2>
<div class="flujo">Visitante escribe el dominio en el navegador
  └─► Servidor Node.js (server/index.js → server/app.js)
        ├─ Helmet: CSP solo del propio dominio, HSTS, nosniff…
        ├─ compression: comprime con gzip
        └─ express.static(public/) entrega index.html (no-cache)
  └─► El navegador lee index.html y pide, todo al mismo servidor:
        ├─ css/fuentes.css · vendor/bootstrap · css/styles.css
        ├─ foto de portada (precargada) y fuentes de la portada
        └─ scripts con defer: vendor/three · vendor/gsap · js/fotos · js/main · js/sitio
  └─► Al desplazarse: JF_alAcercarse inicia la espiral y el parallax (miniaturas)
  └─► Al abrir una galería: cargarFotosAlAbrir descarga sus fotos
  └─► «Escríbeme por WhatsApp» ──► wa.me/50584329491 (fuera del sitio)</div>
</section>

<section class="capitulo"><h2>2. Carpetas y archivos</h2>
<p>Estructura completa del proyecto. Se omiten node_modules (dependencias descargadas por npm), .git (historial) y data (reservas generadas en ejecución).</p>
<div class="arbol">${arbol()}</div></section>

<section class="capitulo indice"><h2>Índice de archivos explicados</h2><ul>${indice}</ul></section>
${capitulosHtml}
<section class="capitulo glosario"><h2>${CAPITULOS.length + 3}. Glosario</h2><dl>${GLOSARIO.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></section>
</body></html>`;

function estadisticasTexto() { return '__ESTADISTICAS__'; }

/* ---------------------------------------------------------------------------
   Escritura e impresión a PDF
   --------------------------------------------------------------------------- */
mkdirSync(path.dirname(SALIDA_HTML), { recursive: true });
const final = html.replace('__ESTADISTICAS__', `${estadisticas.archivos} archivos · ${estadisticas.lineas.toLocaleString('es')} líneas de código explicadas`);
writeFileSync(SALIDA_HTML, final);

const NAVEGADORES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const navegador = process.env.NAVEGADOR_PDF || NAVEGADORES.find((n) => existsSync(n));
if (!navegador) {
  console.error('No se encontró Edge ni Chrome. Define NAVEGADOR_PDF con la ruta del ejecutable.');
  process.exit(1);
}
execFileSync(navegador, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${SALIDA_PDF}`, pathToFileURL(SALIDA_HTML).href], { stdio: 'ignore', timeout: 300_000 });

console.log(`✔ PDF generado: ${path.relative(RAIZ, SALIDA_PDF)}`);
console.log(`  ${estadisticas.archivos} archivos, ${estadisticas.lineas} líneas (${estadisticas.aMano} a mano o por diccionario, ${estadisticas.automaticas} automáticas)`);
if (estadisticas.sinEmparejar.length) {
  console.log(`  Avisos de emparejamiento (${estadisticas.sinEmparejar.length}):`);
  for (const aviso of estadisticas.sinEmparejar) console.log(`   - ${aviso}`);
}
