/**
 * config.js — Configuración del servidor leída desde variables de entorno.
 *
 * Todas las opciones tienen un valor por defecto seguro, de modo que el sitio
 * arranca en desarrollo sin crear un archivo .env. En producción se definen en
 * el panel del hosting o en un archivo .env (ver .env.example).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Carpeta raíz del proyecto (la que contiene package.json). */
export const RAIZ_PROYECTO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Convierte un texto en un entero positivo; si no es válido devuelve el valor por defecto.
 * @param {string | undefined} valor
 * @param {number} porDefecto
 */
function enteroPositivo(valor, porDefecto) {
  const numero = Number.parseInt(valor ?? '', 10);
  return Number.isInteger(numero) && numero > 0 ? numero : porDefecto;
}

/**
 * Construye el objeto de configuración (inmutable).
 * Recibe el entorno como parámetro para poder probarlo sin tocar process.env.
 * @param {NodeJS.ProcessEnv} env
 */
export function cargarConfiguracion(env = process.env) {
  const entorno = env.NODE_ENV || 'development';

  return Object.freeze({
    entorno,
    esProduccion: entorno === 'production',
    puerto: enteroPositivo(env.PORT, 3000),
    sitioUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    confiarEnProxy: env.TRUST_PROXY === 'true',
    carpetaPublica: path.join(RAIZ_PROYECTO, 'public'),
  });
}
