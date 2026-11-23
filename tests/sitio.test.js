import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppDePrueba } from './ayudantes.js';
import { verificarRecursos, extraerRutas } from '../scripts/verificar-recursos.js';

describe('Archivos del sitio', () => {
  const prueba = crearAppDePrueba();
  after(prueba.limpiar);

  it('sirve la página principal con su título y sin caché fija', async () => {
    const r = await request(prueba.app).get('/');
    assert.equal(r.status, 200);
    assert.match(r.headers['content-type'], /text\/html/);
    assert.match(r.text, /<title>Jeniffer Valle \| Fotógrafa de Bodas, Quinceaños y Cumpleaños<\/title>/);
    assert.equal(r.headers['cache-control'], 'no-cache');
  });

  it('envía las cabeceras de seguridad', async () => {
    const r = await request(prueba.app).get('/');
    assert.match(r.headers['content-security-policy'], /default-src 'self'/);
    assert.match(r.headers['content-security-policy'], /script-src-attr 'none'/);
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
    assert.equal(r.headers['x-powered-by'], undefined);
    assert.match(r.headers['permissions-policy'], /camera=\(self\)/);
    assert.equal(r.headers['strict-transport-security'], undefined, 'HSTS solo en producción');
  });

  it('activa HSTS en producción', async () => {
    const produccion = crearAppDePrueba({ env: { NODE_ENV: 'production' } });
    const r = await request(produccion.app).get('/');
    assert.match(r.headers['strict-transport-security'], /max-age=15552000/);
    produccion.limpiar();
  });

  it('redirige /index.html a / con 301', async () => {
    const r = await request(prueba.app).get('/index.html');
    assert.equal(r.status, 301);
    assert.equal(r.headers.location, '/');
  });

  it('sirve imágenes .webp con caché larga', async () => {
    const r = await request(prueba.app).get('/img/hero/jeniffer-valle-fotografa-de-bodas.webp');
    assert.equal(r.status, 200);
    assert.equal(r.headers['content-type'], 'image/webp');
    assert.match(r.headers['cache-control'], /max-age=2592000/);
  });

  it('sirve robots.txt, sitemap.xml y el manifest', async () => {
    assert.equal((await request(prueba.app).get('/robots.txt')).status, 200);
    const mapa = await request(prueba.app).get('/sitemap.xml');
    assert.equal(mapa.status, 200);
    assert.match(mapa.text, /<urlset/);
    const manifest = await request(prueba.app).get('/site.webmanifest');
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers['content-type'], /application\/manifest\+json/);
  });

  it('responde la página 404 para rutas inexistentes', async () => {
    const r = await request(prueba.app).get('/no-existe');
    assert.equal(r.status, 404);
    assert.match(r.text, /Página no encontrada/);
  });

  it('responde 404 en JSON para rutas de API inexistentes', async () => {
    const r = await request(prueba.app).get('/api/no-existe');
    assert.equal(r.status, 404);
    assert.equal(r.body.ok, false);
  });

  it('no expone archivos ocultos como .htaccess', async () => {
    const r = await request(prueba.app).get('/.htaccess');
    assert.equal(r.status, 404);
  });
});

describe('Integridad de recursos', () => {
  it('todas las imágenes, estilos y scripts enlazados existen', () => {
    const { revisadas, faltantes } = verificarRecursos();
    assert.ok(revisadas > 100, `se esperaban más de 100 referencias, hubo ${revisadas}`);
    assert.deepEqual(faltantes, []);
  });

  it('ignora enlaces externos, data: y mailto:', () => {
    const rutas = extraerRutas('<img src="data:image/png;base64,AA"><a href="mailto:a@b.c"></a><img src="img/a.webp"><a href="https://x.com"></a>', 'html');
    assert.deepEqual(rutas, ['img/a.webp']);
  });
});

describe('SEO del HTML', () => {
  const prueba = crearAppDePrueba();
  after(prueba.limpiar);

  it('incluye canonical, descripción, Open Graph y un solo h1', async () => {
    const { text } = await request(prueba.app).get('/');
    assert.match(text, /<link rel="canonical" href="https:\/\/[^"]+\/">/);
    assert.match(text, /<meta name="description" content="[^"]{120,170}">/);
    assert.match(text, /<meta property="og:image" content="[^"]+og-image\.jpg">/);
    assert.equal((text.match(/<h1[\s>]/g) || []).length, 1);
  });

  it('tiene JSON-LD válido con negocio y preguntas frecuentes iguales a las visibles', async () => {
    const { text } = await request(prueba.app).get('/');
    const bloque = text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const datos = JSON.parse(bloque);
    const tipos = datos['@graph'].map((nodo) => nodo['@type']);
    assert.ok(tipos.includes('ProfessionalService'));
    const faq = datos['@graph'].find((nodo) => nodo['@type'] === 'FAQPage');
    for (const pregunta of faq.mainEntity) {
      assert.ok(text.includes(`<summary>${pregunta.name}</summary>`), `pregunta visible: ${pregunta.name}`);
      assert.ok(text.includes(`<p>${pregunta.acceptedAnswer.text}</p>`), `respuesta visible: ${pregunta.name}`);
    }
  });

  it('todas las imágenes <img> tienen texto alternativo', async () => {
    const { text } = await request(prueba.app).get('/');
    const sinAlt = (text.match(/<img(?![^>]*\balt=)[^>]*>/g) || []);
    assert.deepEqual(sinAlt, []);
  });

  it('no contiene manejadores de eventos en línea (compatibles con la CSP)', async () => {
    const { text } = await request(prueba.app).get('/');
    assert.doesNotMatch(text, /\son(click|load|error|submit)=/i);
  });
});
