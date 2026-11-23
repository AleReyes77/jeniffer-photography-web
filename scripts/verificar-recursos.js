/**
 * verificar-recursos.js — Busca enlaces rotos a archivos locales.
 *
 * Revisa el HTML, el CSS, los JS de fotos, el manifest y el sitemap, y comprueba
 * que cada imagen, hoja de estilos o script referenciado exista dentro de /public.
 * Uso:  npm run check:recursos   (sale con código 1 si falta algo)
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICA = path.join(RAIZ, 'public');

/** Archivos que se pueden enlazar pero que la fotógrafa agrega después (no son error). */
const OPCIONALES = new Set(['descargas/precios-servicios.pdf', 'descargas/precios-servicios.jpg']);

/**
 * Extrae las rutas locales de un texto según el tipo de archivo.
 * @param {string} texto
 * @param {'html'|'css'|'js'|'json'|'xml'} tipo
 */
export function extraerRutas(texto, tipo) {
  const patrones = {
    html: /(?:src|href)="([^"#?]+)"/g,
    css: /url\(["']?([^"')?#]+)["']?\)/g,
    js: /["'](img\/[^"']+)["']/g,
    json: /"src":\s*"([^"]+)"/g,
    xml: /<(?:image:)?loc>https?:\/\/[^/]+\/([^<]*)<\//g,
  };
  const rutas = [];
  for (const coincidencia of texto.matchAll(patrones[tipo])) rutas.push(coincidencia[1]);
  return rutas.filter((ruta) => ruta && !/^(https?:|data:|mailto:|tel:|blob:|\/\/)/.test(ruta));
}

/**
 * Devuelve la lista de referencias que apuntan a archivos inexistentes.
 * @param {string} [carpetaPublica]
 */
export function verificarRecursos(carpetaPublica = PUBLICA) {
  const fuentes = [
    ['index.html', 'html', '.'],
    ['404.html', 'html', '.'],
    ['css/styles.css', 'css', 'css'],
    ['css/fuentes.css', 'css', 'css'],
    ['vendor/bootstrap-5.3.2/bootstrap.min.css', 'css', 'vendor/bootstrap-5.3.2'],
    ['js/fotos.js', 'js', '.'],
    ['js/main.js', 'js', '.'],
    ['site.webmanifest', 'json', '.'],
    ['sitemap.xml', 'xml', '.'],
  ];
  const faltantes = [];
  let revisadas = 0;

  for (const [archivo, tipo, base] of fuentes) {
    const texto = readFileSync(path.join(carpetaPublica, archivo), 'utf8');
    for (const ruta of extraerRutas(texto, tipo)) {
      const limpia = ruta.replace(/^\//, '');
      const relativa = path.posix.normalize(path.posix.join(base, limpia)).replace(/^\.\//, '');
      if (relativa === '' || relativa === '.' || OPCIONALES.has(relativa)) continue;
      revisadas += 1;
      if (!existsSync(path.join(carpetaPublica, relativa))) faltantes.push({ archivo, ruta });
    }
  }
  // Las miniaturas no aparecen escritas en ningún archivo: se derivan de JF_PHOTOS en fotos.js.
  const fotos = readFileSync(path.join(carpetaPublica, 'js/fotos.js'), 'utf8');
  for (const ruta of fotos.slice(0, fotos.indexOf('JF_SPIRAL_PHOTOS')).match(/img\/[^"']+\.webp/g) || []) {
    const miniatura = ruta.replace(/^img\//, 'img/miniaturas/');
    revisadas += 1;
    if (!existsSync(path.join(carpetaPublica, miniatura))) faltantes.push({ archivo: 'js/fotos.js (miniatura)', ruta: miniatura });
  }
  return { revisadas, faltantes };
}

// Ejecución directa desde la terminal.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { revisadas, faltantes } = verificarRecursos();
  if (faltantes.length) {
    console.error(`✖ ${faltantes.length} recursos no encontrados (de ${revisadas} revisados):`);
    for (const { archivo, ruta } of faltantes) console.error(`  ${archivo} → ${ruta}`);
    process.exit(1);
  }
  console.log(`✔ ${revisadas} referencias revisadas, todas existen.`);
}
