import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppDePrueba, reservaValida } from './ayudantes.js';

describe('GET /api/salud', () => {
  const prueba = crearAppDePrueba();
  after(prueba.limpiar);

  it('responde 200 con el estado del servidor', async () => {
    const r = await request(prueba.app).get('/api/salud');
    assert.equal(r.status, 200);
    assert.equal(r.body.estado, 'ok');
    assert.equal(r.body.version, '2.0.0');
    assert.equal(r.headers['cache-control'], 'no-store');
  });
});

describe('POST /api/reservas', () => {
  const prueba = crearAppDePrueba();
  after(prueba.limpiar);

  it('guarda una reserva válida, envía el correo y responde 201', async () => {
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida());
    assert.equal(r.status, 201);
    assert.equal(r.body.ok, true);
    assert.match(r.body.id, /^[0-9a-f-]{36}$/);

    const guardadas = await prueba.almacen.leerTodas();
    assert.equal(guardadas.length, 1);
    assert.equal(guardadas[0].id, r.body.id);
    assert.equal(guardadas[0].datos.email, 'maria@example.com');
    assert.equal(prueba.enviados.length, 1);
  });

  it('responde 422 con los errores por campo si los datos son inválidos', async () => {
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida({ email: 'no-es-correo', mensaje: 'corto' }));
    assert.equal(r.status, 422);
    assert.ok(r.body.errores.email);
    assert.ok(r.body.errores.mensaje);
  });

  it('descarta en silencio el spam (campo trampa lleno) sin guardarlo', async () => {
    const antes = (await prueba.almacen.leerTodas()).length;
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida({ website: 'spam' }));
    assert.equal(r.status, 201);
    assert.equal((await prueba.almacen.leerTodas()).length, antes);
  });

  it('responde 400 si el JSON está mal formado', async () => {
    const r = await request(prueba.app).post('/api/reservas').set('Content-Type', 'application/json').send('{"nombre":');
    assert.equal(r.status, 400);
    assert.equal(r.body.ok, false);
  });

  it('responde 413 si el cuerpo supera 10 KB', async () => {
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida({ mensaje: 'x'.repeat(20_000) }));
    assert.equal(r.status, 413);
  });

  it('acepta el formulario HTML clásico (sin JavaScript) y redirige con 303', async () => {
    const r = await request(prueba.app).post('/api/reservas').type('form').set('Accept', 'text/html').send(reservaValida());
    assert.equal(r.status, 303);
    assert.equal(r.headers.location, '/?reserva=enviada#reservar');
  });

  it('redirige con ?reserva=error si el formulario clásico tiene errores', async () => {
    const r = await request(prueba.app).post('/api/reservas').type('form').set('Accept', 'text/html').send({ nombre: 'A' });
    assert.equal(r.status, 303);
    assert.equal(r.headers.location, '/?reserva=error#reservar');
  });
});

describe('POST /api/reservas — resiliencia', () => {
  it('confirma la reserva aunque el correo falle (queda guardada)', async () => {
    const prueba = crearAppDePrueba({ correoFalla: true });
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida());
    assert.equal(r.status, 201);
    assert.equal((await prueba.almacen.leerTodas()).length, 1);
    prueba.limpiar();
  });

  it('aplica el límite de solicitudes por IP (429)', async () => {
    const prueba = crearAppDePrueba({ env: { RATE_LIMIT_MAX: '2' } });
    await request(prueba.app).post('/api/reservas').send(reservaValida());
    await request(prueba.app).post('/api/reservas').send(reservaValida());
    const r = await request(prueba.app).post('/api/reservas').send(reservaValida());
    assert.equal(r.status, 429);
    assert.ok(r.headers.ratelimit || r.headers['ratelimit-policy']);
    prueba.limpiar();
  });

  it('guarda correctamente reservas simultáneas sin mezclar líneas', async () => {
    const prueba = crearAppDePrueba();
    await Promise.all(Array.from({ length: 10 }, (_, i) => request(prueba.app).post('/api/reservas').send(reservaValida({ nombre: `Cliente ${i}` }))));
    const guardadas = await prueba.almacen.leerTodas();
    assert.equal(guardadas.length, 10);
    assert.equal(new Set(guardadas.map((g) => g.id)).size, 10);
    prueba.limpiar();
  });
});
