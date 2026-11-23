/**
 * sitio.js — Mejoras pequeñas de la página principal.
 *
 * 1. Enlaces directos a galerías: /#boda, /#quinceanos y /#cumpleanos abren su galería.
 * 2. Botón de ayuda de la galería espiral (reemplaza el antiguo onclick en línea).
 * 3. Botones de precios: si el archivo todavía no existe en /descargas, el botón
 *    se desactiva y se invita a usar el formulario de reservas, en lugar de llevar a un 404.
 */
(function () {
  'use strict';

  /** Relación entre el ancla de la URL y la clase que abre cada galería en <body>. */
  var GALERIAS = { boda: 'travel', quinceanos: 'wildlife', cumpleanos: 'nature' };
  var CLASES_ABIERTAS = /\b(about|contact|travel|wildlife|nature)-on\b/g;

  /** Abre la galería indicada por el ancla actual (si corresponde a una galería). */
  function abrirGaleriaDesdeAncla() {
    var ancla = decodeURIComponent(window.location.hash.slice(1));
    var clave = GALERIAS[ancla];
    if (!clave) return;
    document.body.className = document.body.className.replace(CLASES_ABIERTAS, '').trim();
    document.body.classList.add(clave + '-on');
  }

  /** El aviso de la espiral se oculta al pulsarlo (con ratón, toque o teclado). */
  function prepararAvisoEspiral() {
    var aviso = document.getElementById('spiralInfos');
    if (!aviso) return;
    aviso.addEventListener('click', function () {
      aviso.classList.add('hidden');
    });
  }

  /**
   * Comprueba con una petición HEAD si los archivos de precios existen.
   * Si no existen, el botón queda desactivado con un texto claro y enlaza al formulario.
   */
  function revisarArchivosDePrecios() {
    var botones = document.querySelectorAll('.pricing-card__btn[href^="descargas/"]');
    if (!botones.length || !window.fetch || window.location.protocol === 'file:') return;

    botones.forEach(function (boton) {
      fetch(boton.getAttribute('href'), { method: 'HEAD', cache: 'no-store' })
        .then(function (respuesta) {
          if (respuesta.ok) return;
          marcarNoDisponible(boton);
        })
        .catch(function () {
          marcarNoDisponible(boton);
        });
    });
  }

  function marcarNoDisponible(boton) {
    boton.removeAttribute('download');
    boton.setAttribute('href', '#reservar');
    boton.classList.add('pricing-card__btn--pendiente');
    boton.setAttribute('aria-label', 'Lista de precios disponible pronto. Solicita los precios con el formulario de reservas');
    boton.lastChild.textContent = ' Pídelos en el formulario';
  }

  function iniciar() {
    prepararAvisoEspiral();
    revisarArchivosDePrecios();
    abrirGaleriaDesdeAncla();
    window.addEventListener('hashchange', abrirGaleriaDesdeAncla);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
