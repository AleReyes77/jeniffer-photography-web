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

/** Tipos de evento aceptados por el formulario de reservas. */
export const TIPOS_EVENTO = Object.freeze(['boda', 'quinceanos', 'cumpleanos', 'sesion', 'otro']);

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
  const archivoReservas = env.RESERVAS_FILE || 'data/reservas.jsonl';

  return Object.freeze({
    entorno,
    esProduccion: entorno === 'production',
    puerto: enteroPositivo(env.PORT, 3000),
    sitioUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    confiarEnProxy: env.TRUST_PROXY === 'true',
    carpetaPublica: path.join(RAIZ_PROYECTO, 'public'),
    archivoReservas: path.isAbsolute(archivoReservas) ? archivoReservas : path.join(RAIZ_PROYECTO, archivoReservas),
    limite: Object.freeze({
      ventanaMinutos: enteroPositivo(env.RATE_LIMIT_WINDOW_MIN, 15),
      maximoSolicitudes: enteroPositivo(env.RATE_LIMIT_MAX, 5),
    }),
    smtp: Object.freeze({
      host: env.SMTP_HOST || '',
      puerto: enteroPositivo(env.SMTP_PORT, 587),
      seguro: env.SMTP_SECURE === 'true',
      usuario: env.SMTP_USER || '',
      clave: env.SMTP_PASS || '',
    }),
    correoDestino: env.CONTACT_TO || '',
    correoRemitente: env.CONTACT_FROM || env.SMTP_USER || '',
  });
}
