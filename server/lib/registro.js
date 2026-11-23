/**
 * registro.js — Registro (logging) estructurado en formato JSON, una línea por evento.
 *
 * Los servicios de hosting (Render, Railway, Docker, etc.) leen la salida estándar,
 * por lo que basta con escribir en consola. En las pruebas se silencia.
 */
const NIVELES = { debug: 10, info: 20, warn: 30, error: 40, silencio: 100 };

/**
 * @param {{ nivel?: keyof NIVELES, salida?: (linea: string) => void }} [opciones]
 */
export function crearRegistro({ nivel = 'info', salida = (linea) => process.stdout.write(`${linea}\n`) } = {}) {
  const minimo = NIVELES[nivel] ?? NIVELES.info;

  function escribir(nombreNivel, mensaje, extra = {}) {
    if (NIVELES[nombreNivel] < minimo) return;
    salida(JSON.stringify({ hora: new Date().toISOString(), nivel: nombreNivel, mensaje, ...extra }));
  }

  return {
    debug: (mensaje, extra) => escribir('debug', mensaje, extra),
    info: (mensaje, extra) => escribir('info', mensaje, extra),
    warn: (mensaje, extra) => escribir('warn', mensaje, extra),
    error: (mensaje, extra) => escribir('error', mensaje, extra),
  };
}
