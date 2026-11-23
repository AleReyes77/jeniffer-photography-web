/**
 * api.js — Rutas de la API bajo /api.
 *
 *   GET  /api/salud     Estado del servidor (para el hosting y el monitoreo).
 *   POST /api/reservas  Recibe una solicitud de reserva del formulario.
 */
import { randomUUID } from 'node:crypto';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { validarReserva } from '../lib/validacion.js';

/**
 * @param {{ config: object, almacen: object, correo: object, registro: object, version: string }} dependencias
 */
export function crearRutasApi({ config, almacen, correo, registro, version }) {
  const rutas = express.Router();

  rutas.get('/salud', (_peticion, respuesta) => {
    respuesta.set('Cache-Control', 'no-store');
    respuesta.json({
      estado: 'ok',
      version,
      entorno: config.entorno,
      correoConfigurado: correo.configurado,
      hora: new Date().toISOString(),
    });
  });

  // Límite de envíos por IP para frenar abusos y spam.
  const limitarReservas = rateLimit({
    windowMs: config.limite.ventanaMinutos * 60 * 1000,
    limit: config.limite.maximoSolicitudes,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (peticion, respuesta) => {
      registro.warn('limite-de-reservas', { ip: peticion.ip });
      responder(peticion, respuesta, 429, { ok: false, mensaje: 'Demasiadas solicitudes. Inténtalo en unos minutos.' });
    },
  });

  rutas.post('/reservas', limitarReservas, async (peticion, respuesta, siguiente) => {
    try {
      const { valido, esSpam, errores, datos } = validarReserva(peticion.body);

      if (esSpam) {
        // Al robot se le responde como si todo hubiera salido bien, para no darle pistas.
        registro.warn('reserva-spam-descartada', { ip: peticion.ip });
        return responder(peticion, respuesta, 201, { ok: true, mensaje: 'Solicitud recibida.' });
      }
      if (!valido) {
        return responder(peticion, respuesta, 422, { ok: false, mensaje: 'Datos inválidos.', errores });
      }

      const reserva = {
        id: randomUUID(),
        recibidaEn: new Date().toISOString(),
        datos,
        origen: { ip: peticion.ip, agente: String(peticion.get('user-agent') || '').slice(0, 200) },
      };

      await almacen.guardar(reserva);

      // El correo no debe impedir confirmar la reserva: si falla, queda registrado y guardado.
      let envio = { enviado: false, motivo: 'error' };
      try {
        envio = await correo.enviarReserva(reserva);
      } catch (error) {
        registro.error('correo-fallido', { id: reserva.id, error: error.message });
      }

      registro.info('reserva-recibida', { id: reserva.id, tipoEvento: datos.tipoEvento, correo: envio.enviado ? 'enviado' : envio.motivo });
      return responder(peticion, respuesta, 201, { ok: true, id: reserva.id, mensaje: 'Solicitud recibida.' });
    } catch (error) {
      return siguiente(error);
    }
  });

  return rutas;
}

/**
 * Responde en JSON si la petición vino del JavaScript del sitio (fetch),
 * o redirige de vuelta al formulario si se envió sin JavaScript (formulario HTML clásico).
 */
function responder(peticion, respuesta, estado, cuerpo) {
  if (peticion.is('application/json') || peticion.accepts(['html', 'json']) === 'json') {
    return respuesta.status(estado).json(cuerpo);
  }
  const resultado = estado === 201 ? 'enviada' : 'error';
  return respuesta.redirect(303, `/?reserva=${resultado}#reservar`);
}
