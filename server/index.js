/**
 * index.js — Punto de entrada: crea las dependencias reales, abre el puerto
 * y cierra el servidor de forma ordenada cuando el hosting lo detiene.
 *
 * Uso:  npm start            (producción)
 *       npm run dev          (desarrollo, se reinicia al guardar)
 */
import { cargarConfiguracion } from './config.js';
import { crearApp } from './app.js';
import { crearAlmacen } from './lib/almacen.js';
import { crearCorreo } from './lib/correo.js';
import { crearRegistro } from './lib/registro.js';

const config = cargarConfiguracion();
const registro = crearRegistro({ nivel: config.esProduccion ? 'info' : 'debug' });
const almacen = crearAlmacen(config.archivoReservas);
const correo = crearCorreo(config);

if (!correo.configurado) {
  registro.warn('correo-sin-configurar', { detalle: 'Las reservas se guardan en el archivo, pero no se envían por correo. Revisa SMTP_* en .env' });
}

const app = crearApp({ config, almacen, correo, registro });

const servidor = app.listen(config.puerto, () => {
  registro.info('servidor-iniciado', { url: `http://localhost:${config.puerto}`, entorno: config.entorno });
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
