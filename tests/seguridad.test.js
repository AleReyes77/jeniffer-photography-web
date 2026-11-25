import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppDePrueba } from './ayudantes.js';
import { cargarConfiguracion } from '../server/config.js';
import { crearLimitador } from '../server/middleware/limite.js';
import { crearRegistro } from '../server/lib/registro.js';
import { registrarErrores } from '../server/app.js';

/** App de producción detrás de un proxy (como quedará en el hosting). */
const produccion = (env = {}) => crearAppDePrueba({ env: { NODE_ENV: 'production', TRUST_PROXY: 'true', ...env } }).app;

describe('Conflictos de puertos y red', () => {
  it('por defecto escucha solo en 127.0.0.1 (el puerto no queda expuesto a internet)', () => {
    assert.equal(cargarConfiguracion({}).host, '127.0.0.1');
  });

  it('permite cambiar el puerto y la dirección para varios sitios o para Docker', () => {
    const c = cargarConfiguracion({ PORT: '3001', HOST: '0.0.0.0' });
    assert.equal(c.puerto, 3001);
    assert.equal(c.host, '0.0.0.0');
  });
});

describe('HTTPS obligatorio', () => {
  it('redirige HTTP a HTTPS con 301 en producción detrás de un proxy', async () => {
    const r = await request(produccion()).get('/galeria?x=1').set('X-Forwarded-Proto', 'http').set('Host', 'ejemplo.com.ni');
    assert.equal(r.status, 301);
    assert.equal(r.headers.location, 'https://ejemplo.com.ni/galeria?x=1');
  });

  it('usa SITE_URL como destino si es https (no confía en la cabecera Host)', async () => {
    const r = await request(produccion({ SITE_URL: 'https://jenifferphotography.com.ni' })).get('/').set('X-Forwarded-Proto', 'http').set('Host', 'sitio-falso.com');
    assert.equal(r.headers.location, 'https://jenifferphotography.com.ni/');
  });

  it('no redirige lo que ya llega por HTTPS', async () => {
    const r = await request(produccion()).get('/').set('X-Forwarded-Proto', 'https');
    assert.equal(r.status, 200);
  });

  it('no redirige /api/salud (los chequeos internos usan http://localhost)', async () => {
    const r = await request(produccion()).get('/api/salud').set('X-Forwarded-Proto', 'http');
    assert.equal(r.status, 200);
  });

  it('no redirige en desarrollo ni sin proxy (no habría HTTPS que atender)', async () => {
    assert.equal(cargarConfiguracion({}).forzarHttps, false);
    assert.equal(cargarConfiguracion({ NODE_ENV: 'production' }).forzarHttps, false);
    assert.equal(cargarConfiguracion({ NODE_ENV: 'production', TRUST_PROXY: 'true' }).forzarHttps, true);
    assert.equal(cargarConfiguracion({ NODE_ENV: 'production', TRUST_PROXY: 'true', FORCE_HTTPS: 'false' }).forzarHttps, false);
  });
});

describe('Límite de peticiones (rate limiting)', () => {
  it('responde 429 con Retry-After al superar el máximo por IP', async () => {
    const app = produccion({ RATE_LIMIT_MAX: '5' });
    const ip = '203.0.113.7';
    for (let i = 0; i < 5; i += 1) {
      const ok = await request(app).get('/api/salud').set('X-Forwarded-For', ip).set('X-Forwarded-Proto', 'https');
      assert.equal(ok.status, 200);
    }
    const r = await request(app).get('/api/salud').set('X-Forwarded-For', ip).set('X-Forwarded-Proto', 'https');
    assert.equal(r.status, 429);
    assert.match(r.headers['retry-after'], /^\d+$/);
    assert.match(r.headers['ratelimit-policy'], /^5;w=60$/);
  });

  it('cuenta cada IP por separado (un abusador no bloquea a los demás)', async () => {
    const app = produccion({ RATE_LIMIT_MAX: '2' });
    for (let i = 0; i < 3; i += 1) await request(app).get('/api/salud').set('X-Forwarded-For', '198.51.100.1');
    const otra = await request(app).get('/api/salud').set('X-Forwarded-For', '198.51.100.2');
    assert.equal(otra.status, 200);
  });

  it('reinicia la cuenta al empezar una nueva ventana de tiempo', () => {
    let reloj = 0;
    const { limitar } = crearLimitador({ ventanaSegundos: 60, maximoPeticiones: 1, confiarEnProxy: true, registro: crearRegistro({ nivel: 'silencio' }), ahora: () => reloj });
    const peticion = { ip: '192.0.2.9', get: () => undefined };
    const respuesta = () => { const r = { estado: 200, setHeader() {}, status(e) { r.estado = e; return r; }, type() { return r; }, send() { return r; } }; return r; };
    let pasa = 0;
    limitar(peticion, respuesta(), () => { pasa += 1; });
    const bloqueada = respuesta(); limitar(peticion, bloqueada, () => { pasa += 1; });
    assert.equal(bloqueada.estado, 429);
    reloj = 61_000;
    limitar(peticion, respuesta(), () => { pasa += 1; });
    assert.equal(pasa, 2);
  });

  it('no bloquea a todos juntos si falta TRUST_PROXY detrás de un proxy (avisa en el log)', async () => {
    const avisos = [];
    const config = cargarConfiguracion({ RATE_LIMIT_MAX: '1' });
    const { limitar } = crearLimitador({ ...config.limite, confiarEnProxy: false, registro: { warn: (m) => avisos.push(m) } });
    let pasa = 0;
    const peticion = { ip: '127.0.0.1', get: (h) => (h === 'x-forwarded-for' ? '203.0.113.1' : undefined) };
    for (let i = 0; i < 5; i += 1) limitar(peticion, {}, () => { pasa += 1; });
    assert.equal(pasa, 5);
    assert.deepEqual(avisos, ['limite-desactivado-sin-trust-proxy']);
  });
});

describe('CORS y errores', () => {
  it('no autoriza peticiones desde otros sitios (sin Access-Control-Allow-Origin)', async () => {
    const r = await request(produccion()).get('/api/salud').set('Origin', 'https://sitio-malo.com').set('X-Forwarded-Proto', 'https');
    assert.equal(r.headers['access-control-allow-origin'], undefined);
  });

  it('una URL mal formada no revela rutas, versiones ni la pila del error', async () => {
    const r = await request(produccion()).get('/%E0%A4%A').set('X-Forwarded-Proto', 'https');
    assert.ok(r.status >= 400 && r.status < 500);
    assert.doesNotMatch(r.text, /node_modules|at \w|[A-Z]:\\|\/home\/|Error:/);
  });

  it('registra en el log las respuestas 5xx (y no las demás)', async () => {
    const eventos = [];
    const registro = { error: (mensaje, extra) => eventos.push({ mensaje, ...extra }) };
    const express = (await import('express')).default;
    const app = express();
    app.use(registrarErrores(registro));
    app.get('/bien', (_p, r) => r.send('ok'));
    app.get('/mal', (_p, r) => r.status(503).send('caído'));
    await request(app).get('/bien');
    await request(app).get('/mal');
    assert.equal(eventos.length, 1);
    assert.equal(eventos[0].mensaje, 'respuesta-con-error');
    assert.equal(eventos[0].ruta, '/mal');
    assert.equal(eventos[0].estado, 503);
  });
});
