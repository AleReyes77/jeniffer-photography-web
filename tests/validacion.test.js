import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarReserva, limpiarTexto, esFechaReal } from '../server/lib/validacion.js';
import { reservaValida } from './ayudantes.js';

const AHORA = new Date('2026-11-23T12:00:00Z');

describe('validarReserva', () => {
  it('acepta una reserva completa y correcta', () => {
    const r = validarReserva(reservaValida(), AHORA);
    assert.equal(r.valido, true);
    assert.deepEqual(r.errores, {});
    assert.equal(r.esSpam, false);
  });

  it('acepta una reserva sin teléfono ni fecha (son opcionales)', () => {
    const r = validarReserva(reservaValida({ telefono: '', fecha: '' }), AHORA);
    assert.equal(r.valido, true);
  });

  it('limpia espacios, normaliza el nombre y pone el correo en minúsculas', () => {
    const { datos } = validarReserva(reservaValida({ nombre: '  Ana    María  ', email: ' ANA@Example.COM ' }), AHORA);
    assert.equal(datos.nombre, 'Ana María');
    assert.equal(datos.email, 'ana@example.com');
  });

  it('marca como errores los campos obligatorios vacíos', () => {
    const r = validarReserva({}, AHORA);
    assert.equal(r.valido, false);
    assert.deepEqual(Object.keys(r.errores).sort(), ['email', 'mensaje', 'nombre', 'tipoEvento']);
  });

  it('rechaza un correo inválido', () => {
    assert.ok(validarReserva(reservaValida({ email: 'maria@' }), AHORA).errores.email);
    assert.ok(validarReserva(reservaValida({ email: 'maria example.com' }), AHORA).errores.email);
  });

  it('rechaza un teléfono con letras', () => {
    assert.ok(validarReserva(reservaValida({ telefono: 'llámame' }), AHORA).errores.telefono);
  });

  it('rechaza un tipo de evento que no existe', () => {
    assert.ok(validarReserva(reservaValida({ tipoEvento: 'bautizo<script>' }), AHORA).errores.tipoEvento);
  });

  it('rechaza fechas pasadas e inexistentes', () => {
    assert.ok(validarReserva(reservaValida({ fecha: '2020-01-01' }), AHORA).errores.fecha);
    assert.ok(validarReserva(reservaValida({ fecha: '2099-02-30' }), AHORA).errores.fecha);
    assert.ok(validarReserva(reservaValida({ fecha: 'mañana' }), AHORA).errores.fecha);
  });

  it('acepta la fecha de hoy aunque el visitante esté detrás de UTC', () => {
    assert.equal(validarReserva(reservaValida({ fecha: '2026-11-22' }), AHORA).errores.fecha, undefined);
  });

  it('rechaza mensajes demasiado cortos o largos', () => {
    assert.ok(validarReserva(reservaValida({ mensaje: 'hola' }), AHORA).errores.mensaje);
    assert.ok(validarReserva(reservaValida({ mensaje: 'x'.repeat(2001) }), AHORA).errores.mensaje);
  });

  it('detecta el campo trampa de robots', () => {
    assert.equal(validarReserva(reservaValida({ website: 'http://spam.example' }), AHORA).esSpam, true);
  });

  it('ignora valores que no son texto (por ejemplo objetos o números)', () => {
    const r = validarReserva(reservaValida({ nombre: { $ne: 1 }, mensaje: 12345678901 }), AHORA);
    assert.ok(r.errores.nombre);
    assert.ok(r.errores.mensaje);
  });
});

describe('limpiarTexto y esFechaReal', () => {
  it('elimina caracteres de control pero conserva saltos de línea', () => {
    assert.equal(limpiarTexto('a\u0000b\nc\u0007'), 'ab\nc');
  });

  it('reconoce fechas reales y bisiestos', () => {
    assert.equal(esFechaReal('2028-02-29'), true);
    assert.equal(esFechaReal('2027-02-29'), false);
    assert.equal(esFechaReal('2026-13-01'), false);
  });
});
