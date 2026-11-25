/**
 * index.js — Punto de entrada: crea las dependencias reales, abre el puerto
 * y cierra el servidor de forma ordenada cuando el hosting lo detiene.
 *
 * Uso:  npm start            (producción)
 *       npm run dev          (desarrollo, se reinicia al guardar)
 */
import { cargarConfiguracion } from './config.js';
import { crearApp } from './app.js';
import { crearRegistro } from './lib/registro.js';

const config = cargarConfiguracion();
const registro = crearRegistro({ nivel: config.esProduccion ? 'info' : 'debug' });
const app = crearApp({ config, registro });

// Principio de mínimo privilegio: el servidor web nunca debe ejecutarse como administrador (root).
if (typeof process.getuid === 'function' && process.getuid() === 0) {
  registro.warn('ejecutando-como-root', { detalle: 'Ejecuta el sitio con un usuario sin privilegios (por ejemplo «node» o el usuario del hosting).' });
}

const servidor = app.listen(config.puerto, config.host, () => {
  registro.info('servidor-iniciado', { url: `http://${config.host}:${config.puerto}`, entorno: config.entorno, httpsForzado: config.forzarHttps });
});

// Si el puerto ya está ocupado por otra aplicación, se explica claramente en vez de fallar en silencio.
servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    registro.error('puerto-ocupado', { puerto: config.puerto, detalle: 'Otra aplicación usa este puerto. Asigna otro con PORT y apúntalo desde el proxy.' });
  } else {
    registro.error('error-del-servidor', { error: error.message });
  }
  process.exit(1);
});

/** Deja de aceptar conexiones, termina las que están en curso y sale. */
function apagar(senal) {
  registro.info('servidor-deteniendose', { senal });
  servidor.close(() => process.exit(0));
  // Si algo queda colgado, se fuerza la salida a los 10 segundos.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));
process.on('unhandledRejection', (motivo) => {
  registro.error('promesa-rechazada-sin-manejar', { motivo: String(motivo) });
});
process.on('uncaughtException', (error) => {
  // Un error no capturado deja el proceso en un estado incierto: se registra y se sale;
  // el hosting (PM2, systemd o Docker) lo vuelve a iniciar limpio.
  registro.error('excepcion-no-capturada', { error: error.message, pila: error.stack });
  process.exit(1);
});
