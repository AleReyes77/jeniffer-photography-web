/**
 * almacen.js — Guarda cada reserva como una línea JSON en un archivo (formato JSON Lines).
 *
 * Por qué un archivo y no una base de datos: el volumen de un portafolio es bajo,
 * no hay servicios externos que mantener y el archivo se puede abrir con cualquier editor.
 * Las escrituras se encadenan en una cola para que dos solicitudes simultáneas
 * nunca mezclen sus líneas.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Crea un almacén que escribe en la ruta indicada.
 * @param {string} archivo  Ruta absoluta del archivo .jsonl
 */
export function crearAlmacen(archivo) {
  let cola = Promise.resolve();

  /**
   * Agrega una reserva al final del archivo.
   * @param {object} registro
   * @returns {Promise<void>}
   */
  function guardar(registro) {
    const linea = `${JSON.stringify(registro)}\n`;
    const tarea = cola.then(async () => {
      await mkdir(path.dirname(archivo), { recursive: true });
      await appendFile(archivo, linea, 'utf8');
    });
    // La cola continúa aunque una escritura falle; el error se informa a quien llamó.
    cola = tarea.catch(() => {});
    return tarea;
  }

  /**
   * Lee todas las reservas guardadas (útil para pruebas y administración).
   * @returns {Promise<object[]>}
   */
  async function leerTodas() {
    try {
      const contenido = await readFile(archivo, 'utf8');
      return contenido.split('\n').filter(Boolean).map((linea) => JSON.parse(linea));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  return { guardar, leerTodas, archivo };
}
