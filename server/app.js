/**
 * app.js — Construye la aplicación Express (sin abrir el puerto).
 *
 * Separar "crear la app" de "escuchar en un puerto" permite probarla con Supertest
 * y reemplazar el registro por uno silencioso en las pruebas.
 */
import path from 'node:path';
import { readFileSync } from 'node:fs';
import express from 'express';
import compression from 'compression';
import { RAIZ_PROYECTO } from './config.js';
import { seguridad, permisos } from './middleware/seguridad.js';
import { crearLimitador } from './middleware/limite.js';
import { crearRutasApi } from './routes/api.js';

const { version } = JSON.parse(readFileSync(path.join(RAIZ_PROYECTO, 'package.json'), 'utf8'));

/** Tiempo de caché por tipo de archivo (en segundos). */
const CACHE = {
  imagen: 60 * 60 * 24 * 30, // 30 días: las fotos casi nunca cambian
  inmutable: 60 * 60 * 24 * 365, // 1 año: fuentes y librerías con la versión en la ruta
};

/**
 * Elige la cabecera Cache-Control según el tipo de archivo.
 * @param {string} rutaArchivo
 */
export function cacheParaArchivo(rutaArchivo) {
  const ruta = rutaArchivo.replace(/\\/g, '/');
  const extension = path.extname(ruta).toLowerCase();
  if (ruta.includes('/vendor/') || ruta.includes('/fonts/')) return `public, max-age=${CACHE.inmutable}, immutable`;
  if (['.webp', '.jpg', '.jpeg', '.png', '.svg', '.ico'].includes(extension)) return `public, max-age=${CACHE.imagen}`;
  // HTML, CSS y JS propios no llevan huella en el nombre: el navegador revalida cada vez (304 si no cambiaron).
  return 'no-cache';
}

/**
 * Middleware que registra en el log cada respuesta con error de servidor (5xx),
 * con método, ruta y duración, para enterarse de un fallo antes que los clientes.
 * @param {{ error: Function }} registro
 */
export function registrarErrores(registro) {
  return (peticion, respuesta, siguiente) => {
    const inicio = process.hrtime.bigint();
    respuesta.on('finish', () => {
      if (respuesta.statusCode < 500) return;
      const milisegundos = Number(process.hrtime.bigint() - inicio) / 1e6;
      registro.error('respuesta-con-error', { metodo: peticion.method, ruta: peticion.path, estado: respuesta.statusCode, ms: Math.round(milisegundos) });
    });
    siguiente();
  };
}

/**
 * @param {{ config: object, registro: object }} dependencias
 */
export function crearApp({ config, registro }) {
  const app = express();

  app.disable('x-powered-by');
  // Detrás de un proxy (Nginx, Cloudflare, el panel del hosting) para obtener la IP real del visitante.
  if (config.confiarEnProxy) app.set('trust proxy', 1);

  app.use(registrarErrores(registro));

  app.use(seguridad(config));
  app.use(permisos);

  // Límite de peticiones por IP (lo antes posible, para frenar el abuso sin gastar recursos).
  app.use(crearLimitador({ ...config.limite, confiarEnProxy: config.confiarEnProxy, registro }).limitar);

  // HTTP → HTTPS (301). /api/salud se excluye para que los chequeos internos del hosting
  // o de Docker, que usan http://localhost, sigan funcionando.
  if (config.forzarHttps) {
    app.use((peticion, respuesta, siguiente) => {
      if (peticion.secure || peticion.path === '/api/salud') return siguiente();
      const base = config.sitioUrl.startsWith('https://') ? config.sitioUrl : `https://${peticion.hostname}`;
      return respuesta.redirect(301, base + peticion.originalUrl);
    });
  }
  // Comprime con gzip todo lo que pese más de 1 KB (HTML, CSS, JS y JSON pesan de 3 a 5 veces menos).
  app.use(compression({ threshold: 1024 }));

  // /index.html -> / (una sola URL por página: mejor para el SEO).
  app.get('/index.html', (_peticion, respuesta) => respuesta.redirect(301, '/'));

  app.use('/api', crearRutasApi({ config, version }));

  // Archivos del sitio.
  app.use(
    express.static(config.carpetaPublica, {
      index: 'index.html',
      dotfiles: 'ignore',
      setHeaders(respuesta, rutaArchivo) {
        respuesta.setHeader('Cache-Control', cacheParaArchivo(rutaArchivo));
        if (rutaArchivo.endsWith('.webmanifest')) respuesta.setHeader('Content-Type', 'application/manifest+json');
      },
    }),
  );

  // 404: JSON para la API, página 404.html para todo lo demás.
  app.use((peticion, respuesta) => {
    if (peticion.path.startsWith('/api/')) {
      return respuesta.status(404).json({ ok: false, mensaje: 'Ruta no encontrada.' });
    }
    return respuesta.status(404).sendFile(path.join(config.carpetaPublica, '404.html'));
  });

  // Manejador de errores: nunca muestra detalles internos al visitante.
  // eslint-disable-next-line no-unused-vars
  app.use((error, peticion, respuesta, _siguiente) => {
    const estado = error.status || error.statusCode || 500;
    if (estado >= 500) registro.error('error-no-controlado', { ruta: peticion.path, error: error.message, pila: error.stack });
    const mensaje = estado >= 500 ? 'Error interno del servidor.' : 'Solicitud no válida.';
    respuesta.status(estado >= 400 && estado < 600 ? estado : 500).json({ ok: false, mensaje });
  });

  return app;
}
