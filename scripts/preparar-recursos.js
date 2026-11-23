/**
 * preparar-recursos.js — Prepara los recursos que el sitio sirve desde su propio dominio.
 *
 * 1. Copia Three.js y GSAP (instalados con npm) a public/vendor/, con la versión en la ruta.
 * 2. Copia las fuentes (paquetes @fontsource) a public/vendor/fonts/ y genera public/css/fuentes.css.
 * 3. Recorta Bootstrap con PurgeCSS: solo deja las reglas que el sitio realmente usa.
 * 4. Genera miniaturas de 480 px (con sharp) para las galerías donde las fotos se ven pequeñas.
 *
 * Uso:  npm run recursos   (volver a ejecutarlo al actualizar three, gsap, bootstrap o las fotos)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PurgeCSS } from 'purgecss';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULOS = path.join(RAIZ, 'node_modules');
const PUBLICA = path.join(RAIZ, 'public');
const VENDOR = path.join(PUBLICA, 'vendor');
/** Las búsquedas por patrón (glob) necesitan barras normales, también en Windows. */
const patron = (ruta) => ruta.split(path.sep).join('/');
const version = (paquete) => JSON.parse(readFileSync(path.join(MODULOS, paquete, 'package.json'), 'utf8')).version;

function copiar(origen, destino) {
  mkdirSync(path.dirname(destino), { recursive: true });
  copyFileSync(origen, destino);
  console.log(`  ${path.relative(RAIZ, destino)}`);
}

/* ---- 1. Librerías JavaScript ---- */
export const LIBRERIAS = {
  three: `vendor/three-${version('three')}/three.min.js`,
  gsap: `vendor/gsap-${version('gsap')}/gsap.min.js`,
  scrollTrigger: `vendor/gsap-${version('gsap')}/ScrollTrigger.min.js`,
  bootstrap: `vendor/bootstrap-${version('bootstrap')}/bootstrap.min.css`,
};

/* ---- 2. Fuentes: [paquete, familia CSS, pesos] ---- */
const FUENTES = [
  ['poppins', 'Poppins', [300, 500, 600, 700, 900]],
  ['dancing-script', 'Dancing Script', [400, 700]],
  ['inter-tight', 'Inter Tight', [500, 800]],
  ['inter', 'Inter', [400, 600]],
  ['monoton', 'Monoton', [400]],
];
// Rango «latin» de Google Fonts: incluye español completo (á é í ó ú ñ ü ¿ ¡).
const RANGO_LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

async function principal() {
  console.log('Librerías:');
  rmSync(VENDOR, { recursive: true, force: true });
  copiar(path.join(MODULOS, 'three/build/three.min.js'), path.join(PUBLICA, LIBRERIAS.three));
  copiar(path.join(MODULOS, 'gsap/dist/gsap.min.js'), path.join(PUBLICA, LIBRERIAS.gsap));
  copiar(path.join(MODULOS, 'gsap/dist/ScrollTrigger.min.js'), path.join(PUBLICA, LIBRERIAS.scrollTrigger));

  console.log('Fuentes:');
  const reglas = [];
  for (const [paquete, familia, pesos] of FUENTES) {
    for (const peso of pesos) {
      const archivo = `${paquete}-latin-${peso}-normal.woff2`;
      copiar(path.join(MODULOS, `@fontsource/${paquete}/files/${archivo}`), path.join(VENDOR, 'fonts', archivo));
      reglas.push(`@font-face {\n  font-family: '${familia}';\n  font-style: normal;\n  font-weight: ${peso};\n  font-display: swap;\n  src: url('../vendor/fonts/${archivo}') format('woff2');\n  unicode-range: ${RANGO_LATIN};\n}`);
    }
  }
  writeFileSync(path.join(PUBLICA, 'css/fuentes.css'), `/* Generado por scripts/preparar-recursos.js — no editar a mano. */\n${reglas.join('\n')}\n`);
  console.log('  public/css/fuentes.css');

  console.log('Bootstrap recortado:');
  const [resultado] = await new PurgeCSS().purge({
    content: [patron(path.join(PUBLICA, '*.html')), patron(path.join(PUBLICA, 'js/*.js'))],
    css: [patron(path.join(MODULOS, 'bootstrap/dist/css/bootstrap.min.css'))],
    // Variables :root y estilos base de etiquetas se conservan siempre.
    variables: false,
    keyframes: true,
  });
  const destinoBootstrap = path.join(PUBLICA, LIBRERIAS.bootstrap);
  mkdirSync(path.dirname(destinoBootstrap), { recursive: true });
  writeFileSync(destinoBootstrap, `/*! Bootstrap v${version('bootstrap')} (MIT) — recortado con PurgeCSS a las reglas usadas por el sitio */\n${resultado.css}`);
  const original = readFileSync(path.join(MODULOS, 'bootstrap/dist/css/bootstrap.min.css')).length;
  console.log(`  ${path.relative(RAIZ, destinoBootstrap)} (${Math.round(original / 1024)} KB → ${Math.round(resultado.css.length / 1024)} KB)`);

  console.log('Miniaturas (480 px):');
  const fotos = readFileSync(path.join(PUBLICA, 'js/fotos.js'), 'utf8');
  const lista = fotos.slice(0, fotos.indexOf('JF_SPIRAL_PHOTOS')).match(/img\/[^"']+\.webp/g) || [];
  let total = 0;
  for (const ruta of lista) {
    const destino = path.join(PUBLICA, ruta.replace(/^img\//, 'img/miniaturas/'));
    mkdirSync(path.dirname(destino), { recursive: true });
    if (!existsSync(destino) || process.argv.includes('--forzar')) {
      await sharp(path.join(PUBLICA, ruta)).resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(destino);
    }
    total += readFileSync(destino).length;
  }
  console.log(`  ${lista.length} miniaturas en public/img/miniaturas/ (${Math.round(total / 1024)} KB en total)`);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
