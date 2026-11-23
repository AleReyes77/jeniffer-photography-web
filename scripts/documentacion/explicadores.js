/**
 * explicadores.js — Genera una explicación para cualquier línea de CSS, HTML o JavaScript.
 *
 * Se usa en los archivos extensos (styles.css, main.js, index.html) para que cada línea
 * tenga su explicación. Funciona con diccionarios de propiedades, etiquetas y patrones;
 * las explicaciones escritas a mano (anotaciones/*.js) siempre tienen prioridad.
 */

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const c = (t) => `<code>${esc(t)}</code>`;

/* =========================================================================
   CSS
   ========================================================================= */
export const PROPIEDADES_CSS = {
  'position': 'Define el esquema de posicionamiento (static, relative, absolute, fixed o sticky).',
  'top': 'Distancia desde el borde superior del contenedor de referencia.',
  'right': 'Distancia desde el borde derecho del contenedor de referencia.',
  'bottom': 'Distancia desde el borde inferior del contenedor de referencia.',
  'left': 'Distancia desde el borde izquierdo del contenedor de referencia.',
  'inset': 'Atajo de top, right, bottom y left a la vez.',
  'z-index': 'Orden de apilamiento: un número mayor queda por encima.',
  'display': 'Tipo de caja: block, inline, flex, grid, none (oculto), etc.',
  'flex': 'Atajo de flex-grow, flex-shrink y flex-basis: cuánto crece o se encoge el elemento en un contenedor flex.',
  'flex-direction': 'Dirección del eje principal del contenedor flex (fila o columna).',
  'flex-wrap': 'Permite (wrap) o impide (nowrap) que los hijos flex pasen a otra línea.',
  'flex-flow': 'Atajo de flex-direction y flex-wrap.',
  'justify-content': 'Alineación de los hijos a lo largo del eje principal (flex/grid).',
  'align-items': 'Alineación de los hijos en el eje transversal (flex/grid).',
  'align-self': 'Alineación de este elemento en el eje transversal, ignorando align-items del padre.',
  'place-items': 'Atajo de align-items y justify-items (centra en ambos ejes con center).',
  'gap': 'Espacio entre filas y columnas de flex o grid.',
  'grid-template-columns': 'Define las columnas de la cuadrícula (cantidad y ancho).',
  'grid-column': 'Columnas que ocupa el elemento en la cuadrícula (1 / -1 = todo el ancho).',
  'width': 'Ancho del elemento.',
  'height': 'Alto del elemento.',
  'min-width': 'Ancho mínimo; el elemento nunca será más angosto.',
  'max-width': 'Ancho máximo; evita que el elemento crezca de más.',
  'min-height': 'Alto mínimo.',
  'max-height': 'Alto máximo.',
  'aspect-ratio': 'Proporción ancho/alto que mantiene el elemento.',
  'margin': 'Espacio exterior alrededor del elemento.',
  'margin-top': 'Margen superior.', 'margin-bottom': 'Margen inferior.', 'margin-left': 'Margen izquierdo.', 'margin-right': 'Margen derecho.',
  'margin-inline': 'Margen izquierdo y derecho (auto centra el bloque).',
  'padding': 'Relleno interior entre el borde y el contenido.',
  'padding-top': 'Relleno superior.', 'padding-bottom': 'Relleno inferior.', 'padding-left': 'Relleno izquierdo.', 'padding-right': 'Relleno derecho.',
  'padding-inline': 'Relleno izquierdo y derecho.', 'padding-block': 'Relleno superior e inferior.',
  'box-sizing': 'border-box hace que el ancho incluya relleno y borde (más predecible).',
  'overflow': 'Qué pasa con el contenido que no cabe: visible, hidden (se recorta) o auto (barra de desplazamiento).',
  'overflow-x': 'Desbordamiento horizontal.', 'overflow-y': 'Desbordamiento vertical.',
  'overscroll-behavior': 'Evita que el desplazamiento "se contagie" al elemento padre o a la página.',
  'color': 'Color del texto.',
  'background': 'Atajo del fondo: color, imagen, posición, tamaño y repetición.',
  'background-color': 'Color de fondo.',
  'background-image': 'Imagen o degradado de fondo.',
  'background-size': 'Tamaño del fondo: cover (cubre recortando), contain (completo) o medidas.',
  'background-position': 'Punto de la imagen de fondo que se alinea con el elemento.',
  'background-repeat': 'Si la imagen de fondo se repite como mosaico.',
  'border': 'Atajo del borde: grosor, estilo y color.',
  'border-top': 'Borde superior.', 'border-bottom': 'Borde inferior.', 'border-left': 'Borde izquierdo.', 'border-right': 'Borde derecho.',
  'border-color': 'Color del borde.',
  'border-radius': 'Redondea las esquinas.',
  'box-shadow': 'Sombra alrededor de la caja (desplazamiento, desenfoque, tamaño y color).',
  'text-shadow': 'Sombra detrás del texto para mejorar la legibilidad sobre fotos.',
  'opacity': 'Transparencia: 0 invisible, 1 opaco.',
  'visibility': 'Oculta el elemento conservando su espacio (hidden) o lo muestra (visible).',
  'filter': 'Efectos gráficos: desenfoque (blur), brillo, saturación, escala de grises, sombra.',
  'mix-blend-mode': 'Cómo se mezcla el color del elemento con lo que hay detrás (difference invierte).',
  'isolation': 'isolate crea un nuevo contexto de apilamiento para que z-index y mezclas no afecten al resto.',
  'transform': 'Transforma el elemento: mover (translate), rotar (rotate), escalar (scale), en 2D o 3D.',
  'transform-origin': 'Punto alrededor del cual se aplica la transformación.',
  'transform-style': 'preserve-3d hace que los hijos conserven su posición 3D.',
  'perspective': 'Distancia del observador para el efecto 3D (menor = más dramático).',
  'perspective-origin': 'Punto de fuga de la perspectiva.',
  'backface-visibility': 'Oculta la cara trasera de un elemento al girarlo.',
  'transition': 'Anima suavemente los cambios de propiedades (propiedad, duración, curva, retraso).',
  'transition-delay': 'Tiempo de espera antes de iniciar la transición.',
  'transition-timing-function': 'Curva de velocidad de la transición.',
  'animation': 'Aplica una animación @keyframes: nombre, duración, curva y repeticiones.',
  'will-change': 'Avisa al navegador qué propiedades cambiarán para que optimice el dibujado.',
  'cursor': 'Forma del puntero del ratón.',
  'pointer-events': 'none hace que el elemento ignore clics y toques (pasan a lo que hay debajo).',
  'user-select': 'Permite o impide seleccionar el texto.',
  'touch-action': 'Qué gestos táctiles maneja el navegador (pan-y permite desplazamiento vertical).',
  'font': 'Atajo de la tipografía: estilo, grosor, tamaño/interlineado y familia.',
  'font-family': 'Familia tipográfica, con alternativas si la primera no carga.',
  'font-size': 'Tamaño del texto.',
  'font-weight': 'Grosor del texto (300 fino … 900 muy grueso).',
  'font-style': 'Estilo de la fuente (normal o cursiva).',
  'font-variant': 'Variantes tipográficas, como versalitas (small-caps).',
  'line-height': 'Altura de cada línea de texto (interlineado).',
  'letter-spacing': 'Espacio entre letras.',
  'text-align': 'Alineación horizontal del texto.',
  'text-transform': 'Convierte el texto a mayúsculas, minúsculas o capitaliza.',
  'text-decoration': 'Subrayado u otras líneas del texto.',
  'text-indent': 'Sangría de la primera línea (-9999px esconde el texto conservando accesibilidad).',
  'white-space': 'Control de espacios y saltos de línea (nowrap impide cortar la línea).',
  'writing-mode': 'Dirección de escritura; vertical-lr escribe en vertical.',
  'overflow-wrap': 'anywhere permite cortar palabras largas para que no desborden.',
  'word-break': 'Reglas para cortar palabras.',
  'list-style': 'Viñetas de las listas (none las quita).',
  'resize': 'Permite al usuario cambiar el tamaño (vertical en el textarea).',
  'outline': 'Contorno de foco (accesibilidad con teclado); no ocupa espacio.',
  'outline-offset': 'Separación entre el contorno y el borde.',
  'content': 'Contenido generado por ::before o ::after.',
  'clip': 'Recorta el elemento (técnica de texto solo para lectores de pantalla).',
  'object-fit': 'Cómo se ajusta una imagen a su caja: cover (recorta) o contain (completa).',
  'object-position': 'Qué parte de la imagen se muestra al recortar.',
  'color-scheme': 'Indica al navegador si los controles nativos (calendario, barras) son claros u oscuros.',
  'scroll-behavior': 'smooth hace que los saltos a anclas se desplacen suavemente.',
  'appearance': 'Quita el estilo nativo de un control para personalizarlo.',
  'float': 'Saca el elemento del flujo y lo alinea a un lado (técnica antigua de maquetación).',
  'clear': 'Evita quedar al lado de elementos flotantes.',
  'vertical-align': 'Alineación vertical en línea o en celdas.',
  'table-layout': 'Algoritmo de ancho de columnas de tablas.',
  '-webkit-text-size-adjust': 'Impide que Safari en iPhone agrande el texto automáticamente.',
  'text-size-adjust': 'Impide el agrandado automático del texto en móviles.',
  '-webkit-tap-highlight-color': 'Quita el resaltado gris al tocar enlaces en móviles.',
  '-webkit-overflow-scrolling': 'Desplazamiento con inercia en iOS antiguos.',
  '-webkit-backface-visibility': 'Versión con prefijo de backface-visibility para Safari.',
  'animation-duration': 'Duración de la animación.', 'animation-iteration-count': 'Cuántas veces se repite la animación.',
  'transition-duration': 'Duración de la transición.',
  'scale': 'Escala el elemento (propiedad independiente de transform).',
  'translate': 'Desplaza el elemento (propiedad independiente de transform).',
  'rotate': 'Rota el elemento (propiedad independiente de transform).',
  'stroke': 'Color del trazo de un SVG.', 'fill': 'Color de relleno de un SVG.',
  'clip-path': 'Recorta el elemento con una forma.',
  'counter-reset': 'Reinicia un contador CSS.', 'counter-increment': 'Incrementa un contador CSS.',
  'border-collapse': 'Une los bordes de las celdas de una tabla.',
  'justify-items': 'Alineación horizontal de los hijos dentro de su celda de grid.',
  'grid-template-rows': 'Define las filas de la cuadrícula.',
  'row-gap': 'Espacio entre filas.', 'column-gap': 'Espacio entre columnas.',
  'border-width': 'Grosor del borde.', 'border-style': 'Estilo del borde (sólido, punteado…).',
  'border-top-color': 'Color del borde superior.', 'border-bottom-color': 'Color del borde inferior.',
  'border-left-color': 'Color del borde izquierdo.', 'border-right-color': 'Color del borde derecho.',
  'border-top-left-radius': 'Redondeo de la esquina superior izquierda.', 'border-top-right-radius': 'Redondeo de la esquina superior derecha.',
  'border-bottom-left-radius': 'Redondeo de la esquina inferior izquierda.', 'border-bottom-right-radius': 'Redondeo de la esquina inferior derecha.',
  'transform-box': 'Caja de referencia para transformar SVG.',
};

function explicarValorCss(valor) {
  const notas = [];
  if (/!important/.test(valor)) notas.push('<b>!important</b> le da prioridad sobre reglas anteriores (necesario para corregir estilos más específicos).');
  if (/var\(--/.test(valor)) notas.push('Usa una variable CSS (<code>var(--…)</code>) definida en <code>:root</code>.');
  if (/clamp\(/.test(valor)) notas.push('<code>clamp(mín, ideal, máx)</code>: tamaño fluido que se adapta a la pantalla sin pasar de los límites.');
  if (/calc\(/.test(valor)) notas.push('<code>calc()</code> combina unidades distintas en una operación.');
  if (/env\(safe-area/.test(valor)) notas.push('<code>env(safe-area-inset-…)</code> respeta el notch y las barras del iPhone.');
  if (/\b\d+(\.\d+)?(svh|dvh)\b/.test(valor)) notas.push('<code>svh/dvh</code>: alto real visible en móviles (sin la barra del navegador).');
  if (/\b\d+(\.\d+)?vw\b/.test(valor)) notas.push('<code>vw</code> = % del ancho de la ventana.');
  if (/\b\d+(\.\d+)?vh\b/.test(valor)) notas.push('<code>vh</code> = % del alto de la ventana.');
  if (/url\(/.test(valor)) notas.push('<code>url()</code> carga un archivo (imagen o SVG incrustado).');
  if (/linear-gradient|radial-gradient/.test(valor)) notas.push('Degradado de color generado por el navegador (no es una imagen).');
  if (/cubic-bezier/.test(valor)) notas.push('<code>cubic-bezier</code> define una curva de aceleración personalizada.');
  if (/rgba\(/.test(valor)) notas.push('<code>rgba()</code>: color con transparencia (el último número es la opacidad).');
  return notas.join(' ');
}

function explicarDeclaracion(decl) {
  const i = decl.indexOf(':');
  if (i < 0) return '';
  const prop = decl.slice(0, i).trim().toLowerCase();
  const valor = decl.slice(i + 1).trim();
  if (prop.startsWith('--')) return `Define la variable CSS ${c(prop)} = ${c(valor)}, reutilizable con <code>var(${esc(prop)})</code>.`;
  const base = PROPIEDADES_CSS[prop] || `Propiedad ${c(prop)}.`;
  const extra = explicarValorCss(valor);
  return `${c(prop)}: ${c(valor.length > 70 ? `${valor.slice(0, 70)}…` : valor)} — ${base}${extra ? ` ${extra}` : ''}`;
}

export function explicarSelector(selector) {
  const s = selector.trim();
  const partes = [];
  if (s === ':root') return 'Selector <code>:root</code>: el elemento raíz (html); aquí se definen variables globales.';
  if (/^(html|body)\b/.test(s)) partes.push('afecta a la página completa');
  const clases = [...new Set((s.match(/\.[a-zA-Z_][\w-]*/g) || []).map((x) => x.slice(1)))].slice(0, 6);
  const ids = (s.match(/#[a-zA-Z_][\w-]*/g) || []).map((x) => x.slice(1));
  if (ids.length) partes.push(`elemento con id ${ids.map(c).join(', ')}`);
  if (clases.length) partes.push(`clases ${clases.map(c).join(', ')}`);
  if (/::before|::after/.test(s)) partes.push('pseudo-elementos <code>::before/::after</code> (capas decorativas generadas por CSS)');
  if (/:hover/.test(s)) partes.push('al pasar el ratón (<code>:hover</code>)');
  if (/:focus/.test(s)) partes.push('al recibir el foco del teclado');
  if (/:nth-of-type|:nth-child/.test(s)) partes.push('según su posición entre hermanos (<code>:nth-of-type</code>)');
  if (/\[aria-invalid/.test(s)) partes.push('campos marcados como inválidos');
  if (/body\.[a-z]+-on/.test(s)) partes.push('cuando JavaScript agrega a &lt;body&gt; la clase que abre un panel');
  if (/\.is-open|\.selfie-mode|\.hidden|\.on\b/.test(s)) partes.push('en un estado activado por JavaScript');
  const varios = s.includes(',') ? ' (varios selectores separados por comas comparten las mismas reglas)' : '';
  return `Regla CSS para ${partes.length ? partes.join('; ') : c(s.slice(0, 80))}${varios}.`;
}

function explicarMedia(linea) {
  const cond = [];
  const m = (re, f) => { const r = linea.match(re); if (r) cond.push(f(r)); };
  m(/max-width:\s*([\d.]+)(px)/, (r) => `ancho de pantalla de hasta ${r[1]}px`);
  m(/min-width:\s*([\d.]+)(px)/, (r) => `ancho de al menos ${r[1]}px`);
  m(/max-height:\s*([\d.]+)px/, (r) => `alto de hasta ${r[1]}px`);
  if (/orientation:\s*landscape/.test(linea)) cond.push('teléfono en horizontal');
  if (/hover:\s*none/.test(linea)) cond.push('dispositivos sin ratón (táctiles)');
  if (/pointer:\s*coarse/.test(linea)) cond.push('puntero impreciso (dedo)');
  if (/prefers-reduced-motion/.test(linea)) cond.push('personas que pidieron reducir animaciones en su sistema (accesibilidad)');
  if (/prefers-color-scheme/.test(linea)) cond.push('tema claro u oscuro del sistema');
  return `Consulta de medios (<code>@media</code>): las reglas de dentro solo se aplican con ${cond.join(' y ') || esc(linea)}. Es la base del diseño adaptable (responsive).`;
}

/**
 * Explica una línea de CSS.
 * @param {string} linea
 */
export function explicarCss(linea) {
  const t = linea.trim();
  if (!t) return '';
  if (t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) return 'Comentario: título o nota para organizar la hoja de estilos (el navegador lo ignora).';
  if (t.startsWith('@media')) return explicarMedia(t) + (t.includes('}') ? ` Contiene: ${explicarBloqueEnLinea(t.slice(t.indexOf('{') + 1))}` : '');
  if (t.startsWith('@keyframes')) return `Define la animación ${c(t.split(/\s+/)[1])}: una lista de pasos (porcentajes del tiempo) con los estilos de cada momento.`;
  if (t.startsWith('@supports')) return 'Consulta de soporte (<code>@supports</code>): aplica las reglas solo si el navegador entiende esa característica (mejora progresiva).';
  if (/^(\d+(\.\d+)?%|from|to)(\s*,\s*\d+%)*\s*\{/.test(t)) return `Paso de la animación en el ${t.replace(/\s*\{.*/, '')} del tiempo total.${t.includes(':') ? ` ${explicarBloqueEnLinea(t.slice(t.indexOf('{') + 1))}` : ''}`;
  if (/^\}+$/.test(t)) return 'Cierra el bloque de reglas abierto arriba.';
  if (t.includes('{') && t.includes('}')) {
    const selector = t.slice(0, t.indexOf('{'));
    return `${explicarSelector(selector)} ${explicarBloqueEnLinea(t.slice(t.indexOf('{') + 1))}`;
  }
  if (t.endsWith('{')) return explicarSelector(t.slice(0, -1));
  if (t.includes(':')) return t.split(';').map((d) => d.trim()).filter(Boolean).map(explicarDeclaracion).join('<br>');
  if (t.endsWith(',')) return `Parte de una lista de selectores: ${explicarSelector(t.slice(0, -1))}`;
  return 'Continuación de la regla anterior.';
}

function explicarBloqueEnLinea(cuerpo) {
  const decls = cuerpo.replace(/\}+\s*$/, '').split(';').map((d) => d.trim()).filter((d) => d && d.includes(':') && !d.includes('{'));
  if (!decls.length) return '';
  return `Declaraciones:<br>${decls.map((d) => `• ${explicarDeclaracion(d)}`).join('<br>')}`;
}

/* =========================================================================
   HTML
   ========================================================================= */
const META = {
  viewport: 'Ajusta el ancho al de la pantalla del dispositivo (imprescindible para que el sitio sea adaptable en celulares); viewport-fit=cover usa toda la pantalla del iPhone.',
  description: 'Descripción que Google muestra bajo el título en los resultados (ideal 120–160 caracteres).',
  author: 'Autora del sitio.',
  robots: 'Instrucciones para buscadores: indexar la página, seguir enlaces y permitir vistas previas grandes de imágenes y texto.',
  googlebot: 'Las mismas instrucciones, dirigidas específicamente a Google.',
  'theme-color': 'Color de la barra del navegador en Android.',
  'color-scheme': 'Indica que el sitio es oscuro para que los controles nativos combinen.',
  'format-detection': 'Evita que iOS convierta números en enlaces de teléfono automáticamente.',
  referrer: 'Qué información de origen se envía al seguir un enlace (privacidad).',
  'application-name': 'Nombre si se fija el sitio en Windows o Android.',
  'apple-mobile-web-app-title': 'Nombre al agregar el sitio a la pantalla de inicio del iPhone.',
  'mobile-web-app-capable': 'Permite abrir el sitio a pantalla completa desde el inicio del celular.',
  'apple-mobile-web-app-capable': 'Lo mismo para iPhone.',
  'apple-mobile-web-app-status-bar-style': 'Estilo de la barra de estado del iPhone (translúcida).',
  'twitter:card': 'Tipo de tarjeta al compartir en X/Twitter (imagen grande).',
  'twitter:title': 'Título de la tarjeta en X/Twitter.', 'twitter:description': 'Descripción de la tarjeta en X/Twitter.',
  'twitter:image': 'Imagen de la tarjeta en X/Twitter.', 'twitter:image:alt': 'Texto alternativo de esa imagen.',
};
const ETIQUETAS = {
  html: 'Raíz del documento; lang="es" indica a Google y a los lectores de pantalla que está en español.',
  head: 'Cabecera: metadatos, estilos y datos para buscadores (no se ve en la página).',
  body: 'Cuerpo: todo lo visible de la página.',
  title: 'Título de la pestaña y del resultado en Google (el factor SEO más importante de la página).',
  main: 'Contenido principal de la página (punto de referencia para accesibilidad).',
  nav: 'Bloque de navegación.',
  section: 'Sección temática de la página.',
  article: 'Contenido independiente (aquí, cada tarjeta de servicio).',
  footer: 'Pie de página.',
  header: 'Encabezado.',
  h1: 'Título principal (solo uno por página, clave para SEO).',
  h2: 'Título de sección.', h3: 'Subtítulo.',
  p: 'Párrafo de texto.',
  a: 'Enlace.',
  button: 'Botón (accesible con teclado por defecto).',
  img: 'Imagen.',
  form: 'Formulario.',
  input: 'Campo de entrada.',
  select: 'Lista desplegable.', option: 'Opción de la lista desplegable.',
  textarea: 'Campo de texto de varias líneas.',
  label: 'Etiqueta asociada a un campo (al tocarla se enfoca el campo; la leen los lectores de pantalla).',
  details: 'Bloque desplegable nativo (sin JavaScript).', summary: 'Texto visible del desplegable; al pulsarlo se abre o cierra.',
  video: 'Reproductor de video (aquí muestra la cámara en vivo).',
  canvas: 'Lienzo donde JavaScript dibuja gráficos (WebGL/Three.js).',
  svg: 'Gráfico vectorial (ícono).', path: 'Trazo del ícono SVG.', circle: 'Círculo del ícono SVG.',
  span: 'Contenedor en línea sin significado propio.',
  div: 'Contenedor genérico para agrupar y dar estilo.',
  ul: 'Lista sin orden.', li: 'Elemento de la lista.',
  noscript: 'Contenido que solo se muestra si el navegador tiene JavaScript desactivado.',
  script: 'Script de JavaScript.',
  link: 'Vínculo a un recurso externo.',
  meta: 'Metadato.',
  table: 'Tabla.', tr: 'Fila.', th: 'Encabezado de celda.', td: 'Celda.',
  b: 'Texto en negrita.', strong: 'Texto importante.', em: 'Énfasis.', br: 'Salto de línea.', small: 'Texto pequeño.',
};

/**
 * Explica una línea de HTML.
 * @param {string} linea
 */
export function explicarHtml(linea) {
  const t = linea.trim();
  if (!t) return '';
  if (t.startsWith('<!DOCTYPE')) return 'Declara HTML5 para que el navegador use el modo estándar (no el modo de compatibilidad antiguo).';
  if (t.startsWith('<!--')) return `Comentario HTML: ${esc(t.replace(/<!--|-->/g, '').trim()).slice(0, 160)} (no se muestra).`;
  if (/^<\/[a-z0-9]+>/i.test(t) && t.replace(/<\/[a-z0-9]+>/gi, '').trim() === '') return `Cierra ${t.match(/<\/([a-z0-9]+)>/gi).map((x) => c(x)).join(' ')}.`;
  const tag = (t.match(/^<([a-z0-9]+)/i) || [])[1]?.toLowerCase();
  if (!tag) {
    if (/^[{}"\[\]]/.test(t)) return 'Parte del bloque de datos estructurados JSON-LD (explicado en su sección).';
    return `Texto visible: «${esc(t.replace(/<[^>]+>/g, '').slice(0, 120))}».`;
  }
  const attr = (n) => (t.match(new RegExp(`\\s${n}="([^"]*)"`)) || [])[1];
  const notas = [];
  if (tag === 'meta') {
    const name = attr('name'); const prop = attr('property'); const charset = attr('charset');
    if (charset) return 'Codificación UTF-8: permite tildes, ñ y emojis sin errores.';
    if (prop?.startsWith('og:')) return `Open Graph ${c(prop)}: lo que muestran Facebook, WhatsApp e Instagram al compartir el enlace (${esc((attr('content') || '').slice(0, 60))}).`;
    if (name && META[name]) return `<code>meta ${esc(name)}</code>: ${META[name]}`;
    return `Metadato ${c(name || prop || '')}.`;
  }
  if (tag === 'link') {
    const rel = attr('rel'); const href = attr('href');
    const R = {
      canonical: 'URL oficial de la página: evita contenido duplicado en Google.',
      alternate: 'Versión de idioma de la página (hreflang) para buscadores.',
      sitemap: 'Indica dónde está el mapa del sitio.',
      icon: 'Ícono de la pestaña (favicon).',
      'apple-touch-icon': 'Ícono al agregar el sitio a la pantalla de inicio del iPhone.',
      manifest: 'Manifiesto web: nombre, colores e íconos al instalar el sitio en el celular.',
      preconnect: 'Abre la conexión con ese servidor antes de necesitarlo (carga más rápida).',
      'dns-prefetch': 'Resuelve el dominio por adelantado (carga más rápida).',
      preload: 'Descarga con prioridad alta la imagen principal (mejora el LCP, una métrica de Google).',
      stylesheet: 'Carga una hoja de estilos.',
    };
    return `<code>link rel="${esc(rel)}"</code>: ${R[rel] || 'recurso vinculado.'}${href ? ` → ${c(href.length > 70 ? `${href.slice(0, 70)}…` : href)}` : ''}${attr('media') ? ` Solo para ${c(attr('media'))}.` : ''}`;
  }
  if (tag === 'script') {
    if (attr('type') === 'application/ld+json') return 'Abre el bloque de datos estructurados JSON-LD (Schema.org) que Google lee para entender el negocio.';
    if (attr('src')) return `Carga el script ${c(attr('src'))}. Al estar al final del body, no bloquea el dibujo de la página.`;
  }
  notas.push(ETIQUETAS[tag] || `Elemento ${c(`<${tag}>`)}.`);
  const id = attr('id'); const clase = attr('class');
  if (id) notas.push(`id ${c(id)} (lo usan JavaScript, CSS o los enlaces #${esc(id)}).`);
  if (clase) notas.push(`Clases ${c(clase)} (estilos en styles.css).`);
  if (attr('href')) notas.push(`Destino ${c(attr('href'))}.`);
  if (attr('src')) notas.push(`Archivo ${c(attr('src'))}.`);
  if (attr('alt') !== undefined) notas.push(attr('alt') ? `Texto alternativo «${esc(attr('alt'))}» (accesibilidad y SEO de imágenes).` : 'alt vacío: imagen decorativa que los lectores de pantalla ignoran.');
  if (/loading="lazy"/.test(t)) notas.push('<code>loading="lazy"</code>: se descarga al acercarse a la pantalla.');
  if (attr('aria-label')) notas.push(`<code>aria-label</code> «${esc(attr('aria-label'))}»: nombre para lectores de pantalla.`);
  if (/aria-hidden="true"/.test(t)) notas.push('<code>aria-hidden</code>: oculto para lectores de pantalla.');
  if (/aria-live/.test(t)) notas.push('<code>aria-live</code>: los lectores de pantalla anuncian los cambios de este texto.');
  if (/data-open=/.test(t)) notas.push(`<code>data-open</code>: al pulsarlo, JavaScript abre el panel «${esc(attr('data-open'))}».`);
  if (attr('name')) notas.push(`Nombre del dato enviado: ${c(attr('name'))}.`);
  if (/\srequired/.test(t)) notas.push('Obligatorio.');
  if (attr('role')) notas.push(`<code>role="${esc(attr('role'))}"</code> le da significado para la accesibilidad.`);
  const texto = t.replace(/<[^>]+>/g, '').trim();
  if (texto) notas.push(`Texto: «${esc(texto.slice(0, 120))}».`);
  return notas.join(' ');
}

/* =========================================================================
   JAVASCRIPT
   ========================================================================= */
const THREE = {
  Scene: 'la escena 3D que contiene todos los objetos', PerspectiveCamera: 'la cámara virtual con perspectiva',
  WebGLRenderer: 'el motor que dibuja la escena con la tarjeta gráfica (WebGL)', Mesh: 'un objeto 3D (geometría + material)',
  PlaneGeometry: 'una superficie plana subdividida', BufferGeometry: 'una geometría eficiente en memoria',
  ShaderMaterial: 'un material con código de GPU propio (shaders)', CanvasTexture: 'una textura a partir de un canvas',
  Group: 'un grupo para mover varios objetos juntos', AmbientLight: 'luz ambiental uniforme', DirectionalLight: 'luz direccional (como el sol)',
  TextureLoader: 'un cargador de imágenes como texturas', Sprite: 'una imagen plana que siempre mira a la cámara',
  SpriteMaterial: 'el material de un sprite', Vector2: 'un vector 2D', Vector3: 'un vector 3D', Color: 'un color', Clock: 'un reloj para medir el tiempo entre cuadros',
  OrthographicCamera: 'una cámara sin perspectiva', BoxGeometry: 'una caja', MeshStandardMaterial: 'un material con iluminación realista',
};

/** Quita los marcadores de comentario y deja solo el texto. */
function textoDeComentario(t) {
  const INICIO = new RegExp('^(//|/\\*\\*?|\\*/?)\\s?');
  const FIN = new RegExp('\\*/$');
  return t.replace(INICIO, '').replace(FIN, '').trim().slice(0, 170) || '(separador visual)';
}

/**
 * Explica una línea de JavaScript.
 * @param {string} linea
 */
export function explicarJs(linea) {
  const t = linea.trim();
  if (!t) return '';
  if (/^(\/\/|\/\*|\*|\*\/)/.test(t)) return 'Comentario: ' + esc(textoDeComentario(t));
  if (/^['"]use strict['"]/.test(t)) return 'Modo estricto: el motor de JavaScript rechaza errores silenciosos (variables sin declarar, etc.).';
  if (/^\}?\)?\(?\)?\)?;?$/.test(t) || /^[}\])]+[;,)]*$/.test(t)) return 'Cierra el bloque, objeto, lista o llamada abierta arriba.';
  if (/^\}\)\(.*\);?$/.test(t)) return 'Cierra y ejecuta inmediatamente la función envolvente (IIFE): su código corre una vez y sus variables no contaminan el ámbito global.';
  if (/^\(function\s*\(/.test(t) || /^;?\(\(\)\s*=>/.test(t)) return 'Inicia una función que se ejecuta de inmediato (IIFE) para aislar sus variables del resto de la página.';
  let m;
  if ((m = t.match(/^import\s+(.+)\s+from\s+['"](.+)['"]/))) return `Importa ${c(m[1])} desde el módulo ${c(m[2])}.`;
  if ((m = t.match(/^(export\s+)?(async\s+)?function\s+([\w$]+)\s*\(([^)]*)\)/))) return `Declara la función${m[2] ? ' asíncrona' : ''} ${c(m[3])}(${esc(m[4])})${m[1] ? ', exportada para usarla desde otros archivos' : ''}.`;
  if ((m = t.match(/^class\s+([\w$]+)/))) return `Declara la clase ${c(m[1])}: un molde para crear objetos con datos y métodos propios.`;
  if (/^constructor\s*\(/.test(t)) return 'Constructor: se ejecuta al crear un objeto nuevo de la clase y prepara su estado inicial.';
  if ((m = t.match(/^(async\s+)?([\w$]+)\s*\(([^)]*)\)\s*\{$/)) && !/^(if|for|while|switch|catch|function)$/.test(m[2])) return `Método ${c(m[2])}(${esc(m[3])}) de la clase u objeto.`;
  if ((m = t.match(/^(export\s+)?(const|let|var)\s+(\{[^}]+\}|\[[^\]]+\]|[\w$]+)\s*=\s*(.*)$/))) {
    const tipo = m[2] === 'const' ? 'la constante' : 'la variable';
    const nombre = m[3]; const valor = m[4];
    let que = '';
    if (/^document\.getElementById\(['"]([^'"]+)/.test(valor)) que = ` con el elemento del HTML cuyo id es ${c(valor.match(/getElementById\(['"]([^'"]+)/)[1])}`;
    else if (/^document\.querySelectorAll\(/.test(valor)) que = ` con todos los elementos que coinciden con ${c(valor.match(/querySelectorAll\((.+?)\)/)?.[1] || '')}`;
    else if (/^document\.querySelector\(/.test(valor)) que = ` con el primer elemento que coincide con ${c(valor.match(/querySelector\((.+?)\)/)?.[1] || '')}`;
    else if ((m = valor.match(/^new THREE\.(\w+)/))) que = ` con ${THREE[m[1]] ? THREE[m[1]] : `un objeto THREE.${esc(m[1])}`} (Three.js)`;
    else if (/^new\s+(\w+)/.test(valor)) que = ` con un objeto nuevo de tipo ${c(valor.match(/^new\s+(\w+)/)[1])}`;
    else if (/^\[/.test(valor)) que = ' con una lista (array)';
    else if (/^\{/.test(valor)) que = ' con un objeto de configuración';
    else if (/=>/.test(valor) || /^function/.test(valor)) que = ' con una función';
    else if (/^await\s/.test(valor)) que = ' con el resultado de una operación asíncrona (espera a que termine)';
    else if (/^(-?\d|['"`]|true|false|null)/.test(valor)) que = ` con el valor ${c(valor.replace(/;$/, '').slice(0, 60))}`;
    else que = `: ${c(valor.replace(/;$/, '').slice(0, 90))}`;
    const multi = /^[{[]/.test(nombre) ? ' (desestructuración: extrae varios valores a la vez)' : '';
    return `Declara ${tipo} ${c(nombre)}${multi}${que}.`;
  }
  if ((m = t.match(/^(\w[\w.]*)\.addEventListener\(['"]([\w:-]+)['"]/))) return `Escucha el evento ${c(m[2])} en ${c(m[1])} y ejecuta la función indicada cuando ocurre.`;
  if ((m = t.match(/^\$\((.+?)\)\.on\(['"](\w+)['"]/))) return `jQuery: al hacer ${c(m[2])} sobre ${c(m[1])}, ejecuta la función.`;
  if (/^(\}\s*)?else\s+if\s*\(/.test(t)) return `Si no se cumplió lo anterior, comprueba: ${c(t.replace(/^\}?\s*else\s+if\s*/, '').replace(/\)\s*\{?$/, ')').slice(0, 110))}.`;
  if (/^(\}\s*)?else\b/.test(t)) return 'En caso contrario (ninguna condición anterior se cumplió).';
  if (/^if\s*\(/.test(t)) return `Condición: solo continúa si se cumple ${c(t.replace(/^if\s*/, '').replace(/\{?\s*$/, '').slice(0, 120))}.`;
  if (/^for\s*\(/.test(t)) return `Bucle: repite el bloque ${c(t.slice(0, 100))}.`;
  if (/^while\s*\(/.test(t)) return 'Bucle que se repite mientras la condición sea verdadera.';
  if (/^switch\s*\(/.test(t)) return 'Elige un camino según el valor indicado.';
  if (/^case\s/.test(t) || /^default:/.test(t)) return `Caso ${c(t)} del switch.`;
  if (/^try\s*\{/.test(t)) return 'Intenta ejecutar el bloque; si algo lanza un error, salta al catch.';
  if (/^\}?\s*catch\s*\(?/.test(t)) return 'Captura el error del bloque try para manejarlo sin que se detenga el programa.';
  if (/^\}?\s*finally/.test(t)) return 'Se ejecuta siempre al final, haya o no error.';
  if (/^throw\b/.test(t)) return 'Lanza un error para detener la operación y avisar a quien la llamó.';
  if (/^return\b/.test(t)) return `Devuelve el resultado: ${c(t.replace(/^return\s*/, '').replace(/;$/, '').slice(0, 110) || '(nada, termina la función)')}.`;
  if (/^(await\s+)?describe\(['"](.+?)['"]/.test(t)) return `Grupo de pruebas «${esc(t.match(/describe\(['"](.+?)['"]/)[1])}».`;
  if (/^it\(['"](.+?)['"]/.test(t)) return `Caso de prueba: ${esc(t.match(/it\(['"](.+?)['"]/)[1])}.`;
  if (/^after\(/.test(t)) return 'Al terminar el grupo de pruebas, borra los archivos temporales.';
  if (/^assert\.(equal|strictEqual)\(/.test(t)) return `Comprueba que dos valores sean iguales: ${c(t.slice(0, 110))}. Si no, la prueba falla.`;
  if (/^assert\.deepEqual\(/.test(t)) return 'Comprueba que dos objetos o listas tengan exactamente el mismo contenido.';
  if (/^assert\.match\(/.test(t)) return 'Comprueba que el texto cumpla la expresión regular indicada.';
  if (/^assert\.doesNotMatch\(/.test(t)) return 'Comprueba que el texto NO contenga el patrón indicado.';
  if (/^assert\.ok\(/.test(t)) return 'Comprueba que el valor sea verdadero (exista).';
  if (/gsap\.(to|set|from|timeline)\(/.test(t)) return `GSAP: ${/\.set\(/.test(t) ? 'fija propiedades al instante' : 'anima propiedades de forma fluida'} sobre ${c(t.match(/gsap\.\w+\(([^,]+)/)?.[1] || '')}.`;
  if (/requestAnimationFrame\(/.test(t)) return 'Pide al navegador ejecutar la función en el próximo cuadro de pantalla (~60 por segundo), sincronizado con el refresco.';
  if (/\.classList\.(add|remove|toggle)\(/.test(t)) return `${{ add: 'Agrega', remove: 'Quita', toggle: 'Alterna' }[t.match(/classList\.(\w+)/)[1]]} la clase CSS ${c(t.match(/classList\.\w+\(([^)]*)\)/)?.[1] || '')}, lo que cambia el estilo según styles.css.`;
  if (/\.style\.setProperty\(|\.style\.\w+\s*=/.test(t)) return 'Cambia un estilo directamente desde JavaScript.';
  if (/\bfetch\(/.test(t)) return 'Hace una petición HTTP al servidor (API fetch) y continúa sin bloquear la página.';
  if (/\.then\(/.test(t)) return 'Cuando la operación asíncrona anterior termina, ejecuta esta función con su resultado.';
  if (/\.catch\(/.test(t)) return 'Si la operación asíncrona falla, ejecuta esta función.';
  if (/^console\./.test(t)) return 'Escribe un mensaje en la consola (en el navegador, para diagnóstico; en Node, en la terminal para informar el progreso).';
  if (/^(this\.)?[\w$.\[\]'"]+\s*(\+|-|\*|\/)?=\s*/.test(t) && !/^(\w+)\s*\(/.test(t)) return `Asigna un valor: ${c(t.replace(/;$/, '').slice(0, 120))}.`;
  if ((m = t.match(/^['"]?([\w$-]+)['"]?\s*:\s*(.+?),?$/))) return `Propiedad ${c(m[1])} del objeto, con valor ${c(m[2].replace(/,$/, '').slice(0, 90))}.`;
  if (/^\{.*\}[,;]?$/.test(t)) return `Elemento de la lista: ${c(t.slice(0, 120))}.`;
  if (/^['"`]/.test(t)) return `Valor de texto de la lista: ${c(t.replace(/,$/, '').slice(0, 100))}.`;
  if (/^[\w$.]+\(/.test(t) || /^await\s/.test(t) || /^new\s/.test(t)) return `Ejecuta ${c(t.replace(/;$/, '').slice(0, 120))}.`;
  if (/^\./.test(t)) return `Continúa la cadena de llamadas: ${c(t.slice(0, 100))}.`;
  return `Instrucción que forma parte del bloque explicado arriba: ${c(t.slice(0, 120))}.`;
}

export { esc };
