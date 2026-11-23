import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cargarConfiguracion } from '../server/config.js';
import { crearCorreo, construirMensaje, escaparHtml } from '../server/lib/correo.js';

describe('cargarConfiguracion', () => {
  it('usa valores por defecto seguros', () => {
    const c = cargarConfiguracion({});
    assert.equal(c.puerto, 3000);
    assert.equal(c.entorno, 'development');
    assert.equal(c.esProduccion, false);
    assert.equal(c.limite.maximoSolicitudes, 5);
    assert.ok(Object.isFrozen(c));
  });

  it('ignora números inválidos y quita la barra final de SITE_URL', () => {
    const c = cargarConfiguracion({ PORT: 'abc', RATE_LIMIT_MAX: '-3', SITE_URL: 'https://ejemplo.com///' });
    assert.equal(c.puerto, 3000);
    assert.equal(c.limite.maximoSolicitudes, 5);
    assert.equal(c.sitioUrl, 'https://ejemplo.com');
  });
});

describe('correo', () => {
  const reserva = {
    id: 'abc-123',
    recibidaEn: '2026-11-23T12:00:00.000Z',
    datos: { nombre: 'Ana <b>', email: 'ana@example.com', telefono: '', tipoEvento: 'quinceanos', fecha: '', mensaje: 'Hola <script>alert(1)</script>' },
  };

  it('escapa el HTML que escribe el visitante', () => {
    assert.equal(escaparHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
    const { html, asunto } = construirMensaje(reserva);
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
    assert.equal(asunto, 'Nueva reserva: Quinceaños — Ana <b>');
  });

  it('no intenta enviar si el SMTP no está configurado', async () => {
    const correo = crearCorreo(cargarConfiguracion({}));
    assert.equal(correo.configurado, false);
    assert.deepEqual(await correo.enviarReserva(reserva), { enviado: false, motivo: 'smtp-no-configurado' });
  });

  it('envía con los datos correctos cuando el SMTP está configurado', async () => {
    const enviados = [];
    const config = cargarConfiguracion({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'web@example.com', SMTP_PASS: 'x', CONTACT_TO: 'jeniffer@example.com' });
    const correo = crearCorreo(config, { crearTransporte: () => ({ sendMail: async (m) => enviados.push(m) }) });
    assert.equal(correo.configurado, true);
    assert.deepEqual(await correo.enviarReserva(reserva), { enviado: true });
    assert.equal(enviados[0].to, 'jeniffer@example.com');
    assert.equal(enviados[0].from, 'web@example.com');
    assert.equal(enviados[0].replyTo, 'ana@example.com');
  });
});
