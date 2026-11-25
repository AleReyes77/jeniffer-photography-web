/**
 * generar-guia.js — Convierte scripts/documentacion/guia.html en docs/guia-buenas-practicas.pdf
 * usando Microsoft Edge o Google Chrome en modo sin ventana (headless).
 *
 * Uso:  npm run docs:guia
 */
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Documentos disponibles: npm run docs:guia (por defecto) y npm run docs:auditoria. */
const DOCUMENTOS = {
  guia: ['guia.html', 'guia-buenas-practicas.pdf'],
  auditoria: ['auditoria.html', 'auditoria-seguridad.pdf'],
};
const [fuente, destino] = DOCUMENTOS[process.argv[2] || 'guia'] || DOCUMENTOS.guia;
const ENTRADA = path.join(RAIZ, 'scripts', 'documentacion', fuente);
const SALIDA = path.join(RAIZ, 'docs', destino);

const NAVEGADORES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const navegador = process.env.NAVEGADOR_PDF || NAVEGADORES.find((ruta) => existsSync(ruta));
if (!navegador) {
  console.error('No se encontró Edge ni Chrome. Define NAVEGADOR_PDF con la ruta del ejecutable.');
  process.exit(1);
}

execFileSync(navegador, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${SALIDA}`, pathToFileURL(ENTRADA).href], { stdio: 'ignore', timeout: 120_000 });
console.log(`✔ PDF generado: ${path.relative(RAIZ, SALIDA)}`);
