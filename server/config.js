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
  const esProduccion = entorno === 'production';
  const confiarEnProxy = env.TRUST_PROXY === 'true';

  return Object.freeze({
    entorno,
    esProduccion,
    puerto: enteroPositivo(env.PORT, 3000),
    // 127.0.0.1 = solo accesible desde el mismo servidor (detrás de Nginx/Caddy/Apache).
    // Así el puerto 3000 nunca queda expuesto directamente a internet. Docker usa 0.0.0.0.
    host: env.HOST || '127.0.0.1',
    sitioUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    confiarEnProxy,
    // Redirigir HTTP → HTTPS solo tiene sentido detrás de un proxy que atiende HTTPS.
    forzarHttps: env.FORCE_HTTPS ? env.FORCE_HTTPS === 'true' : esProduccion && confiarEnProxy,
    limite: Object.freeze({
      ventanaSegundos: enteroPositivo(env.RATE_LIMIT_WINDOW_SEC, 60),
      maximoPeticiones: enteroPositivo(env.RATE_LIMIT_MAX, 300),
    }),
    carpetaPublica: path.join(RAIZ_PROYECTO, 'public'),
  });
}
