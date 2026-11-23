import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppDePrueba } from './ayudantes.js';
import { cargarConfiguracion } from '../server/config.js';
import { cacheParaArchivo } from '../server/app.js';
import { crearRegistro } from '../server/lib/registro.js';

describe('GET /api/salud', () => {
  const { app } = crearAppDePrueba();

  it('responde 200 con el estado y la versión del servidor', async () => {
    const r = await request(app).get('/api/salud');
    assert.equal(r.status, 200);
    assert.equal(r.body.estado, 'ok');
    assert.match(r.body.version, /^\d+\.\d+\.\d+$/);
    assert.equal(r.headers['cache-control'], 'no-store');
  });

  it('ya no existe la ruta del antiguo formulario de reservas', async () => {
    const r = await request(app).post('/api/reservas').send({ nombre: 'x' });
    assert.equal(r.status, 404);
    assert.equal(r.body.ok, false);
  });
});

describe('cargarConfiguracion', () => {
  it('usa valores por defecto seguros', () => {
    const c = cargarConfiguracion({});
    assert.equal(c.puerto, 3000);
    assert.equal(c.entorno, 'development');
    assert.equal(c.esProduccion, false);
    assert.equal(c.confiarEnProxy, false);
    assert.ok(Object.isFrozen(c));
  });

  it('ignora puertos inválidos y quita la barra final de SITE_URL', () => {
    const c = cargarConfiguracion({ PORT: 'abc', SITE_URL: 'https://ejemplo.com.ni///', TRUST_PROXY: 'true' });
    assert.equal(c.puerto, 3000);
    assert.equal(c.sitioUrl, 'https://ejemplo.com.ni');
    assert.equal(c.confiarEnProxy, true);
  });
});

describe('cacheParaArchivo', () => {
  it('guarda un año las librerías y fuentes de /vendor', () => {
    assert.match(cacheParaArchivo('C:\\sitio\\public\\vendor\\three-0.128.0\\three.min.js'), /max-age=31536000, immutable/);
    assert.match(cacheParaArchivo('/sitio/public/vendor/fonts/poppins-latin-900-normal.woff2'), /immutable/);
  });

  it('guarda 30 días las fotos y revalida HTML, CSS y JS propios', () => {
    assert.equal(cacheParaArchivo('/public/img/bodas/boda.webp'), 'public, max-age=2592000');
    assert.equal(cacheParaArchivo('/public/css/styles.css'), 'no-cache');
    assert.equal(cacheParaArchivo('/public/js/main.js'), 'no-cache');
    assert.equal(cacheParaArchivo('/public/index.html'), 'no-cache');
  });
});

describe('crearRegistro', () => {
  it('escribe una línea JSON por evento y respeta el nivel mínimo', () => {
    const lineas = [];
    const registro = crearRegistro({ nivel: 'warn', salida: (l) => lineas.push(l) });
    registro.info('ignorado');
    registro.error('fallo', { codigo: 7 });
    assert.equal(lineas.length, 1);
    const evento = JSON.parse(lineas[0]);
    assert.equal(evento.nivel, 'error');
    assert.equal(evento.mensaje, 'fallo');
    assert.equal(evento.codigo, 7);
  });
});
