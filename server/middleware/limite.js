/**
 * limite.js — Límite de peticiones por IP (rate limiting), sin librerías externas.
 *
 * Cuenta las peticiones de cada IP en una ventana de tiempo fija. Si una IP supera
 * el máximo, responde 429 «Too Many Requests» hasta que empieza la ventana siguiente.
 * Protege contra bots que intentan saturar el servidor (DDoS básico) o descargar el
 * sitio entero en segundos. Una visita normal hace unas 30–100 peticiones: el máximo
 * por defecto (300 por minuto) nunca afecta a una persona real.
 */

/** IP que indica que el visitante llega a través de un proxy local (Nginx, Apache, Caddy). */
const LOCALES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * @param {{ ventanaSegundos: number, maximoPeticiones: number, confiarEnProxy: boolean,
 *           registro: object, ahora?: () => number }} opciones
 */
export function crearLimitador({ ventanaSegundos, maximoPeticiones, confiarEnProxy, registro, ahora = Date.now }) {
  const ventanaMs = ventanaSegundos * 1000;
  /** @type {Map<string, { inicio: number, cuenta: number }>} */
  const contadores = new Map();
  let avisoProxyDado = false;

  // Limpieza periódica de IPs antiguas para que la memoria no crezca sin fin.
  // unref(): este temporizador no impide que el proceso termine.
  const limpieza = setInterval(() => {
    const limite = ahora() - ventanaMs;
    for (const [ip, datos] of contadores) if (datos.inicio < limite) contadores.delete(ip);
  }, ventanaMs);
  limpieza.unref();

  function limitar(peticion, respuesta, siguiente) {
    const ip = peticion.ip || 'desconocida';

    // Detrás de un proxy SIN TRUST_PROXY=true, todas las visitas parecerían venir de 127.0.0.1
    // y se bloquearían todas juntas. En ese caso no se limita y se avisa una sola vez en el log.
    if (LOCALES.has(ip) && !confiarEnProxy) {
      if (!avisoProxyDado && peticion.get('x-forwarded-for')) {
        avisoProxyDado = true;
        registro.warn('limite-desactivado-sin-trust-proxy', { detalle: 'Hay un proxy delante: define TRUST_PROXY=true para limitar por IP real.' });
      }
      return siguiente();
    }

    const momento = ahora();
    let datos = contadores.get(ip);
    if (!datos || momento - datos.inicio >= ventanaMs) {
      datos = { inicio: momento, cuenta: 0 };
      contadores.set(ip, datos);
    }
    datos.cuenta += 1;

    const restantes = Math.max(0, maximoPeticiones - datos.cuenta);
    const segundosParaReinicio = Math.ceil((datos.inicio + ventanaMs - momento) / 1000);
    // Cabeceras estándar (borrador IETF) para que clientes y bots educados sepan su estado.
    respuesta.setHeader('RateLimit-Policy', `${maximoPeticiones};w=${ventanaSegundos}`);
    respuesta.setHeader('RateLimit', `limit=${maximoPeticiones}, remaining=${restantes}, reset=${segundosParaReinicio}`);

    if (datos.cuenta > maximoPeticiones) {
      if (datos.cuenta === maximoPeticiones + 1) registro.warn('limite-de-peticiones-superado', { ip });
      respuesta.setHeader('Retry-After', String(segundosParaReinicio));
      return respuesta.status(429).type('text/plain; charset=utf-8').send('Demasiadas peticiones. Espera un momento e inténtalo de nuevo.');
    }
    return siguiente();
  }

  return { limitar, contadores };
}
