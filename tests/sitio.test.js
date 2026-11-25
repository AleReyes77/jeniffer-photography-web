import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppDePrueba } from './ayudantes.js';
import { verificarRecursos, extraerRutas } from '../scripts/verificar-recursos.js';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const PUBLICA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const { app } = crearAppDePrueba();
const paginaPrincipal = () => request(app).get('/');

describe('Archivos del sitio', () => {
  it('sirve la página principal con su título y sin caché fija', async () => {
    const r = await paginaPrincipal();
    assert.equal(r.status, 200);
    assert.match(r.headers['content-type'], /text\/html/);
    assert.match(r.text, /<title>Jeniffer Photography \| Bodas, Quinceaños y Cumpleaños en Nicaragua<\/title>/);
    assert.equal(r.headers['cache-control'], 'no-cache');
  });

  it('comprime las respuestas con gzip', async () => {
    const r = await request(app).get('/css/styles.css').set('Accept-Encoding', 'gzip');
    assert.equal(r.headers['content-encoding'], 'gzip');
  });

  it('redirige /index.html a / con 301', async () => {
    const r = await request(app).get('/index.html');
    assert.equal(r.status, 301);
    assert.equal(r.headers.location, '/');
  });

  it('sirve imágenes .webp con caché de 30 días', async () => {
    const r = await request(app).get('/img/hero/jeniffer-valle-fotografa-de-bodas.webp');
    assert.equal(r.status, 200);
    assert.equal(r.headers['content-type'], 'image/webp');
    assert.equal(r.headers['cache-control'], 'public, max-age=2592000');
  });

  it('sirve las fuentes y librerías locales con caché de un año', async () => {
    for (const ruta of ['/vendor/fonts/poppins-latin-900-normal.woff2', '/vendor/three-0.128.0/three.min.js', '/vendor/gsap-3.12.5/gsap.min.js', '/vendor/bootstrap-5.3.2/bootstrap.min.css']) {
      const r = await request(app).get(ruta);
      assert.equal(r.status, 200, ruta);
      assert.match(r.headers['cache-control'], /max-age=31536000, immutable/, ruta);
    }
  });

  it('sirve robots.txt, sitemap.xml y el manifest', async () => {
    assert.equal((await request(app).get('/robots.txt')).status, 200);
    const mapa = await request(app).get('/sitemap.xml');
    assert.equal(mapa.status, 200);
    assert.match(mapa.text, /<urlset/);
    const manifest = await request(app).get('/site.webmanifest');
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers['content-type'], /application\/manifest\+json/);
  });

  it('responde la página 404 para rutas inexistentes', async () => {
    const r = await request(app).get('/no-existe');
    assert.equal(r.status, 404);
    assert.match(r.text, /Página no encontrada/);
  });

  it('no expone archivos ocultos como .htaccess ni .env', async () => {
    assert.equal((await request(app).get('/.htaccess')).status, 404);
    assert.equal((await request(app).get('/.env')).status, 404);
  });
});

describe('Seguridad', () => {
  it('envía las cabeceras de seguridad', async () => {
    const r = await paginaPrincipal();
    const csp = r.headers['content-security-policy'];
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self';/, 'scripts solo del propio dominio');
    assert.match(csp, /script-src-attr 'none'/);
    assert.match(csp, /form-action 'none'/);
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
    assert.equal(r.headers['x-powered-by'], undefined);
    assert.match(r.headers['permissions-policy'], /camera=\(self\)/);
    assert.equal(r.headers['strict-transport-security'], undefined, 'HSTS solo en producción');
  });

  it('la CSP no permite ningún servidor externo', async () => {
    const csp = (await paginaPrincipal()).headers['content-security-policy'];
    assert.doesNotMatch(csp, /https?:\/\//);
  });

  it('activa HSTS en producción', async () => {
    const produccion = crearAppDePrueba({ env: { NODE_ENV: 'production' } });
    const r = await request(produccion.app).get('/');
    assert.match(r.headers['strict-transport-security'], /max-age=15552000/);
  });

  it('no contiene manejadores de eventos en línea (compatibles con la CSP)', async () => {
    const { text } = await paginaPrincipal();
    assert.doesNotMatch(text, /\son(click|load|error|submit)=/i);
  });
});

describe('Rendimiento', () => {
  it('no carga scripts, estilos ni fuentes de servidores externos', async () => {
    const { text } = await paginaPrincipal();
    const externos = [...text.matchAll(/<(?:script|link)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((url) => !url.startsWith('https://TU-DOMINIO.com'));
    assert.deepEqual(externos, []);
  });

  it('todos los scripts usan defer (no bloquean el dibujo de la página)', async () => {
    const { text } = await paginaPrincipal();
    const scripts = [...text.matchAll(/<script src="[^"]+"([^>]*)>/g)];
    assert.ok(scripts.length >= 6);
    for (const [, atributos] of scripts) assert.match(atributos, /\bdefer\b/);
  });

  it('ya no depende de jQuery', async () => {
    const { text } = await paginaPrincipal();
    const main = (await request(app).get('/js/main.js')).text;
    assert.doesNotMatch(text, /jquery/i);
    // Se buscan usos reales: la función $() o jQuery como código (no la palabra en un comentario).
    assert.doesNotMatch(main, /\$\(|jQuery\(|\(jQuery\)/);
  });
});

describe('Reservas por WhatsApp', () => {
  it('el botón abre WhatsApp con el número de Jeniffer en una pestaña nueva', async () => {
    const { text } = await paginaPrincipal();
    const boton = text.match(/<a class="whatsapp-btn[^>]*>/)[0];
    assert.match(boton, /href="https:\/\/wa\.me\/50584329491\?text=/);
    assert.match(boton, /target="_blank"/);
    assert.match(boton, /rel="noopener noreferrer"/);
  });

  it('ya no existe el formulario de reservas', async () => {
    const { text } = await paginaPrincipal();
    assert.doesNotMatch(text, /<form/);
    assert.doesNotMatch(text, /reservas\.js/);
  });
});

describe('Scripts del navegador', () => {
  it('todos los scripts propios tienen sintaxis válida', () => {
    for (const archivo of readdirSync(path.join(PUBLICA, 'js'))) {
      const codigo = readFileSync(path.join(PUBLICA, 'js', archivo), 'utf8');
      // vm.Script solo analiza el código (no lo ejecuta): falla si hay un error de sintaxis.
      assert.doesNotThrow(() => new vm.Script(codigo, { filename: archivo }), archivo);
    }
  });
});

describe('Integridad de recursos', () => {
  it('todas las imágenes, estilos, fuentes y scripts enlazados existen', () => {
    const { revisadas, faltantes } = verificarRecursos();
    assert.ok(revisadas > 150, `se esperaban más de 150 referencias, hubo ${revisadas}`);
    assert.deepEqual(faltantes, []);
  });

  it('ignora enlaces externos, data: y mailto:', () => {
    const rutas = extraerRutas('<img src="data:image/png;base64,AA"><a href="mailto:a@b.c"></a><img src="img/a.webp"><a href="https://x.com"></a>', 'html');
    assert.deepEqual(rutas, ['img/a.webp']);
  });
});

describe('SEO del HTML', () => {
  it('incluye canonical, descripción, Open Graph y un solo h1', async () => {
    const { text } = await paginaPrincipal();
    assert.match(text, /<link rel="canonical" href="https:\/\/[^"]+\/">/);
    assert.match(text, /<meta name="description" content="[^"]{120,170}">/);
    assert.match(text, /<meta property="og:image" content="[^"]+og-image\.jpg">/);
    assert.equal((text.match(/<h1[\s>]/g) || []).length, 1);
  });

  it('usa la marca Jeniffer Photography', async () => {
    const { text } = await paginaPrincipal();
    const sinAlternativo = text.replace(/"alternateName": "Jeniffer Valle Fotografía"/g, '');
    assert.doesNotMatch(sinAlternativo, /Jeniffer (Valle )?Fotografía/i, 'la marca antigua solo puede quedar como alternateName');
    assert.match(text, /<meta property="og:site_name" content="Jeniffer Photography">/);
  });

  it('tiene JSON-LD válido con negocio en Nicaragua y preguntas iguales a las visibles', async () => {
    const { text } = await paginaPrincipal();
    const bloque = text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const datos = JSON.parse(bloque);
    const negocio = datos['@graph'].find((nodo) => nodo['@type'] === 'ProfessionalService');
    assert.equal(negocio.name, 'Jeniffer Photography');
    assert.equal(negocio.telephone, '+50584329491');
    assert.equal(negocio.address.addressCountry, 'NI');
    const faq = datos['@graph'].find((nodo) => nodo['@type'] === 'FAQPage');
    for (const pregunta of faq.mainEntity) {
      assert.ok(text.includes(`<summary>${pregunta.name}</summary>`), `pregunta visible: ${pregunta.name}`);
      assert.ok(text.includes(`<p>${pregunta.acceptedAnswer.text}</p>`), `respuesta visible: ${pregunta.name}`);
    }
  });

  it('todas las imágenes <img> tienen texto alternativo', async () => {
    const { text } = await paginaPrincipal();
    const sinAlt = text.match(/<img(?![^>]*\balt=)[^>]*>/g) || [];
    assert.deepEqual(sinAlt, []);
  });
});

describe('Accesibilidad y robustez', () => {
  it('la portada está dentro de una región <header> y el fondo 3D decorativo se oculta a lectores de pantalla', async () => {
    const { text } = await paginaPrincipal();
    assert.match(text, /<header class="hero-perspective">[\s\S]*<h1>/);
    assert.match(text, /<div data-app-container aria-hidden="true"><\/div>/);
  });

  it('el botón de precios no usa un nombre accesible distinto de su texto visible', () => {
    const sitio = readFileSync(path.join(PUBLICA, 'js/sitio.js'), 'utf8');
    assert.doesNotMatch(sitio, /setAttribute\('aria-label'/);
  });

  it('no inserta textos en el HTML con innerHTML y plantillas (prevención de XSS)', () => {
    const main = readFileSync(path.join(PUBLICA, 'js/main.js'), 'utf8');
    assert.doesNotMatch(main, /\.innerHTML\s*=\s*`[^`]*\$\{\s*s\./);
  });

  it('cada galería 3D comprueba WebGL antes de crear su motor (sin WebGL, el resto del sitio sigue funcionando)', () => {
    const main = readFileSync(path.join(PUBLICA, 'js/main.js'), 'utf8');
    const creaciones = (main.match(/new THREE\.WebGLRenderer/g) || []).length;
    const comprobaciones = (main.match(/JF_webglDisponible/g) || []).length;
    assert.equal(creaciones, 3);
    assert.ok(comprobaciones >= 4, 'una definición + una comprobación por galería');
  });

  it('los textos pequeños violetas cumplen el contraste mínimo WCAG AA (4,5:1)', () => {
    const css = readFileSync(path.join(PUBLICA, 'css/styles.css'), 'utf8');
    const lum = (h) => {
      const [r, g, b] = h.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const colorDe = (regla) => css.match(regla)[1];
    assert.ok(contraste(colorDe(/\.sec__label \{[^}]*?color:\s*#([0-9a-f]{6})/i), '1f2029') >= 4.5, 'etiquetas de sección');
    assert.ok(contraste(colorDe(/\.site-footer \.footer-links a \{[^}]*?color:\s*#([0-9a-f]{6})/i), '0d0d14') >= 4.5, 'enlaces del pie');
    assert.ok(contraste('ffffff', css.match(/\.selfie-btn\{[^}]*background:#([0-9a-f]{6})/i)[1]) >= 4.5, 'botón de la selfie');
    assert.ok(contraste('ffffff', css.match(/\.pricing-card__btn\{[^}]*background:#([0-9a-f]{6})/i)[1]) >= 4.5, 'botón de precios');
  });
});
