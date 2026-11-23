/**
 * api.js — Rutas de la API bajo /api.
 *
 *   GET /api/salud   Estado del servidor (para el hosting y el monitoreo de disponibilidad).
 */
import express from 'express';

/**
 * @param {{ config: object, version: string }} dependencias
 */
export function crearRutasApi({ config, version }) {
  const rutas = express.Router();

  rutas.get('/salud', (_peticion, respuesta) => {
    respuesta.set('Cache-Control', 'no-store');
    respuesta.json({
      estado: 'ok',
      version,
      entorno: config.entorno,
      hora: new Date().toISOString(),
    });
  });

  return rutas;
}
