/**
 * ayudantes.js — Utilidades compartidas por las pruebas.
 * Crea una app real con un registro silencioso, sin abrir puertos ni tocar la red.
 */
import { cargarConfiguracion } from '../server/config.js';
import { crearApp } from '../server/app.js';
import { crearRegistro } from '../server/lib/registro.js';

/**
 * Crea una app lista para probar.
 * @param {{ env?: object }} [opciones]
 */
export function crearAppDePrueba({ env = {} } = {}) {
  const config = cargarConfiguracion({ NODE_ENV: 'test', ...env });
  const registro = crearRegistro({ nivel: 'silencio' });
  const app = crearApp({ config, registro });
  return { app, config };
}
