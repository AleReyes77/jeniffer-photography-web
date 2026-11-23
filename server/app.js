/**
 * app.js — Construye la aplicación Express (sin abrir el puerto).
 *
 * Separar "crear la app" de "escuchar en un puerto" permite probarla con Supertest
 * y reemplazar el almacén o el correo por versiones falsas en las pruebas.
 */
import path from 'node:path';
import { readFileSync } from 'node:fs';
import express from 'express';
import compression from 'compression';
import { RAIZ_PROYECTO } from './config.js';
import { seguridad, permisos } from './middleware/seguridad.js';
import { crearRutasApi } from './routes/api.js';

const { version } = JSON.parse(readFileSync(path.join(RAIZ_PROYECTO, 'package.json'), 'utf8'));

/** Tiempo de caché por tipo de archivo (en segundos). */
const CACHE = {
  imagen: 60 * 60 * 24 * 30, // 30 días: las fotos casi nunca cambian
};

/**
 * @param {{ config: object, almacen: object, correo: object, registro: object }} dependencias
 */
export function crearApp({ config, almacen, correo, registro }) {
  const app = express();

  app.disable('x-powered-by');
  // Detrás de un proxy (Render, Nginx, Cloudflare) para obtener la IP real del visitante.
  if (config.confiarEnProxy) app.set('trust proxy', 1);

  app.use(seguridad(config));
  app.use(permisos);
  app.use(compression());

  // /index.html -> / (una sola URL por página: mejor para el SEO).
  app.get('/index.html', (_peticion, respuesta) => respuesta.redirect(301, '/'));

  // API: cuerpos pequeños (10 KB) para evitar abusos.
  app.use(
    '/api',
    express.json({ limit: '10kb' }),
    express.urlencoded({ extended: false, limit: '10kb' }),
    crearRutasApi({ config, almacen, correo, registro, version }),
  );

  // Archivos del sitio.
  app.use(
    express.static(config.carpetaPublica, {
      index: 'index.html',
      dotfiles: 'ignore',
      setHeaders(respuesta, rutaArchivo) {
        const extension = path.extname(rutaArchivo).toLowerCase();
        if (extension === '.html') {
          respuesta.setHeader('Cache-Control', 'no-cache');
        } else if (['.webp', '.jpg', '.jpeg', '.png', '.svg', '.ico'].includes(extension)) {
          respuesta.setHeader('Cache-Control', `public, max-age=${CACHE.imagen}`);
        } else if (['.css', '.js'].includes(extension)) {
          // CSS y JS no llevan huella en el nombre: el navegador revalida cada vez (304 si no cambiaron).
          respuesta.setHeader('Cache-Control', 'no-cache');
        }
        if (extension === '.webmanifest') respuesta.setHeader('Content-Type', 'application/manifest+json');
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
    const mensaje = estado === 400 ? 'Solicitud mal formada.' : estado === 413 ? 'Solicitud demasiado grande.' : 'Error interno del servidor.';
    respuesta.status(estado >= 400 && estado < 600 ? estado : 500).json({ ok: false, mensaje });
  });

  return app;
}
