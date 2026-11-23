/**
 * seguridad.js — Cabeceras HTTP de seguridad con Helmet.
 *
 * Todo el sitio (fuentes, librerías y fotos) se sirve desde su propio dominio, así que
 * la Content-Security-Policy (CSP) solo permite recursos de este mismo origen ('self').
 * Aunque alguien lograra inyectar HTML, el navegador se negaría a ejecutar su código
 * o a enviar datos a otro servidor.
 */
import helmet from 'helmet';

/** Directivas de la CSP; se exportan para reutilizarlas en las pruebas y en .htaccess/_headers. */
export function directivasCsp({ esProduccion }) {
  return {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'self'"],
    // El sitio no tiene formularios: ninguno puede enviar datos a ningún lado.
    formAction: ["'none'"],
    scriptSrc: ["'self'"],
    scriptSrcAttr: ["'none'"],
    // 'unsafe-inline' en estilos: la página usa atributos style="" y las animaciones
    // los modifican desde JavaScript. No permite ejecutar código.
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'"],
    // data: para los SVG decorativos; blob: para la foto tomada con la cámara.
    imgSrc: ["'self'", 'data:', 'blob:'],
    mediaSrc: ["'self'", 'blob:'],
    connectSrc: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: esProduccion ? [] : null,
  };
}

/**
 * @param {{ esProduccion: boolean }} config
 */
export function seguridad(config) {
  return helmet({
    contentSecurityPolicy: { useDefaults: false, directives: directivasCsp(config) },
    // Solo se activa HSTS en producción (en localhost forzaría HTTPS).
    strictTransportSecurity: config.esProduccion ? { maxAge: 15552000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

/**
 * Permissions-Policy: la página solo puede pedir la cámara (para la selfie);
 * micrófono, ubicación y pagos quedan bloqueados.
 */
export function permisos(_peticion, respuesta, siguiente) {
  respuesta.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=()');
  siguiente();
}
