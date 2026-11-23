/**
 * validacion.js — Limpieza y validación de las solicitudes de reserva.
 *
 * Es la fuente de verdad: el navegador también valida, pero nunca se confía en él.
 * Devuelve los datos ya limpios para que el resto del backend no repita comprobaciones.
 */
import { TIPOS_EVENTO } from '../config.js';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO_VALIDO = /^[+\d][\d\s().-]{6,19}$/;
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
// Caracteres de control (excepto salto de línea y tabulador) que no deben guardarse ni enviarse.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Convierte cualquier valor en texto limpio: sin caracteres de control y sin espacios en los extremos.
 * @param {unknown} valor
 */
export function limpiarTexto(valor) {
  if (typeof valor !== 'string') return '';
  return valor.replace(CONTROL, '').trim();
}

/**
 * Indica si un texto con formato AAAA-MM-DD es una fecha real del calendario.
 * @param {string} texto
 */
export function esFechaReal(texto) {
  if (!FECHA_ISO.test(texto)) return false;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

/**
 * Valida una solicitud de reserva.
 * @param {Record<string, unknown>} entrada  Cuerpo recibido (JSON o formulario).
 * @param {Date} [ahora]  Fecha actual; se inyecta en las pruebas.
 * @returns {{ valido: boolean, esSpam: boolean, errores: Record<string, string>, datos: object }}
 */
export function validarReserva(entrada, ahora = new Date()) {
  const cuerpo = entrada && typeof entrada === 'object' ? entrada : {};

  const datos = {
    nombre: limpiarTexto(cuerpo.nombre).replace(/\s+/g, ' '),
    email: limpiarTexto(cuerpo.email).toLowerCase(),
    telefono: limpiarTexto(cuerpo.telefono),
    tipoEvento: limpiarTexto(cuerpo.tipoEvento),
    fecha: limpiarTexto(cuerpo.fecha),
    mensaje: limpiarTexto(cuerpo.mensaje),
  };

  // Campo trampa (honeypot): las personas no lo ven; los robots suelen llenarlo.
  const esSpam = limpiarTexto(cuerpo.website) !== '';

  const errores = {};
  if (datos.nombre.length < 2 || datos.nombre.length > 80) {
    errores.nombre = 'Escribe tu nombre (de 2 a 80 caracteres).';
  }
  if (datos.email.length > 254 || !EMAIL_VALIDO.test(datos.email)) {
    errores.email = 'Escribe un correo válido.';
  }
  if (datos.telefono && !TELEFONO_VALIDO.test(datos.telefono)) {
    errores.telefono = 'Escribe un teléfono válido.';
  }
  if (!TIPOS_EVENTO.includes(datos.tipoEvento)) {
    errores.tipoEvento = 'Elige un tipo de evento válido.';
  }
  if (datos.fecha) {
    // Se compara con "ayer" en UTC para no rechazar a quien está en una zona horaria detrás de UTC.
    const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (!esFechaReal(datos.fecha)) errores.fecha = 'Escribe una fecha válida.';
    else if (datos.fecha < ayer) errores.fecha = 'La fecha no puede estar en el pasado.';
  }
  if (datos.mensaje.length < 10 || datos.mensaje.length > 2000) {
    errores.mensaje = 'El mensaje debe tener de 10 a 2000 caracteres.';
  }

  return { valido: Object.keys(errores).length === 0, esSpam, errores, datos };
}
