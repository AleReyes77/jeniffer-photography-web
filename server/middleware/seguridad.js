/**
 * seguridad.js — Cabeceras HTTP de seguridad con Helmet.
 *
 * La Content-Security-Policy (CSP) solo permite cargar código y recursos desde
 * este mismo sitio y desde los CDN que realmente usa la página, lo que bloquea
 * la mayoría de ataques de inyección de scripts (XSS).
 */
import helmet from 'helmet';

/**
 * @param {{ esProduccion: boolean }} config
 */
export function seguridad({ esProduccion }) {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://code.jquery.com'],
        scriptSrcAttr: ["'none'"],
        // 'unsafe-inline' en estilos: la página usa atributos style="" y las animaciones
        // los modifican desde JavaScript. No permite ejecutar código.
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        // data: para los SVG decorativos; blob: para la foto tomada con la cámara.
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: esProduccion ? [] : null,
      },
    },
    // Las fuentes y librerías vienen de CDN sin cabeceras CORP; esta política las bloquearía.
    crossOriginEmbedderPolicy: false,
    // Solo se activa HSTS en producción (en localhost forzaría HTTPS).
    strictTransportSecurity: esProduccion ? { maxAge: 15552000, includeSubDomains: true } : false,
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
