/**
 * ayudantes.js — Utilidades compartidas por las pruebas.
 * Crea una app con un almacén temporal y un correo falso, sin tocar la red ni datos reales.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cargarConfiguracion } from '../server/config.js';
import { crearApp } from '../server/app.js';
import { crearAlmacen } from '../server/lib/almacen.js';
import { crearRegistro } from '../server/lib/registro.js';

/** Datos de una reserva válida; cada prueba cambia solo lo que necesita. */
export function reservaValida(cambios = {}) {
  return {
    nombre: 'María López',
    email: 'maria@example.com',
    telefono: '+504 9999-9999',
    tipoEvento: 'boda',
    fecha: '2099-06-15',
    mensaje: 'Hola, quiero cotizar la fotografía de mi boda en junio.',
    website: '',
    ...cambios,
  };
}

/**
 * Crea una app lista para probar.
 * @param {{ env?: object, correoFalla?: boolean }} [opciones]
 */
export function crearAppDePrueba({ env = {}, correoFalla = false } = {}) {
  const carpeta = mkdtempSync(path.join(tmpdir(), 'jeniffer-pruebas-'));
  const config = cargarConfiguracion({ NODE_ENV: 'test', RATE_LIMIT_MAX: '100', RESERVAS_FILE: path.join(carpeta, 'reservas.jsonl'), ...env });
  const almacen = crearAlmacen(config.archivoReservas);
  const enviados = [];
  const correo = {
    configurado: true,
    async enviarReserva(reserva) {
      if (correoFalla) throw new Error('SMTP caído');
      enviados.push(reserva);
      return { enviado: true };
    },
  };
  const registro = crearRegistro({ nivel: 'silencio' });
  const app = crearApp({ config, almacen, correo, registro });
  const limpiar = () => rmSync(carpeta, { recursive: true, force: true });
  return { app, almacen, enviados, config, limpiar };
}
