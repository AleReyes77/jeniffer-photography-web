/**
 * reservas.js — Formulario "Reserva tu sesión".
 *
 * Valida los datos en el navegador (la validación real y definitiva la hace el servidor),
 * los envía como JSON a POST /api/reservas y muestra el resultado de forma accesible.
 * Si el backend no está disponible (por ejemplo, abriendo el sitio con Live Server),
 * muestra cómo contactar por correo para que la persona no pierda su solicitud.
 */
(function () {
  'use strict';

  var formulario = document.getElementById('formReserva');
  if (!formulario) return;

  var estado = document.getElementById('reservaEstado');
  var botonEnviar = document.getElementById('reservaEnviar');
  var CORREO = 'jenifferariana95@gmail.com';
  var EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TELEFONO_VALIDO = /^[+\d][\d\s().-]{6,19}$/;
  var TIPOS = ['boda', 'quinceanos', 'cumpleanos', 'sesion', 'otro'];

  /** La fecha mínima del calendario es hoy (en la zona horaria del visitante). */
  var campoFecha = formulario.elements.fecha;
  var hoy = new Date();
  var hoyISO = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (campoFecha) campoFecha.min = hoyISO;

  /** Si el formulario se envió sin JavaScript, el servidor redirige con ?reserva=enviada|error. */
  var resultadoSinJs = new URLSearchParams(window.location.search).get('reserva');
  if (resultadoSinJs === 'enviada') mostrarEstado('¡Gracias! Recibí tu solicitud y te responderé pronto.', 'ok');
  if (resultadoSinJs === 'error') mostrarEstado('Revisa los datos del formulario e inténtalo de nuevo.', 'error');

  /** Reglas del lado del cliente. Devuelve un objeto { campo: 'mensaje de error' }. */
  function validar(datos) {
    var errores = {};
    if (datos.nombre.length < 2 || datos.nombre.length > 80) errores.nombre = 'Escribe tu nombre (de 2 a 80 caracteres).';
    if (!EMAIL_VALIDO.test(datos.email) || datos.email.length > 254) errores.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (datos.telefono && !TELEFONO_VALIDO.test(datos.telefono)) errores.telefono = 'Escribe un teléfono válido (solo números, espacios, +, - o paréntesis).';
    if (TIPOS.indexOf(datos.tipoEvento) === -1) errores.tipoEvento = 'Elige el tipo de evento.';
    if (datos.fecha && datos.fecha < hoyISO) errores.fecha = 'La fecha no puede estar en el pasado.';
    if (datos.mensaje.length < 10 || datos.mensaje.length > 2000) errores.mensaje = 'Cuéntame un poco más (de 10 a 2000 caracteres).';
    return errores;
  }

  /** Relación entre el nombre del dato y el id del párrafo de error. */
  var ID_ERROR = { nombre: 'r-nombre-error', email: 'r-email-error', telefono: 'r-telefono-error', tipoEvento: 'r-tipo-error', fecha: 'r-fecha-error', mensaje: 'r-mensaje-error' };

  function pintarErrores(errores) {
    Object.keys(ID_ERROR).forEach(function (campo) {
      var parrafo = document.getElementById(ID_ERROR[campo]);
      var control = formulario.elements[campo];
      var mensaje = errores[campo] || '';
      if (parrafo) parrafo.textContent = mensaje;
      if (control) control.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    });
    var primero = Object.keys(errores)[0];
    if (primero && formulario.elements[primero]) formulario.elements[primero].focus();
  }

  function mostrarEstado(texto, tipo) {
    estado.textContent = texto;
    estado.className = 'reserva__estado' + (tipo ? ' reserva__estado--' + tipo : '');
  }

  function leerDatos() {
    var f = formulario.elements;
    return {
      nombre: f.nombre.value.trim(),
      email: f.email.value.trim(),
      telefono: f.telefono.value.trim(),
      tipoEvento: f.tipoEvento.value,
      fecha: f.fecha.value,
      mensaje: f.mensaje.value.trim(),
      website: f.website.value
    };
  }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var datos = leerDatos();
    var errores = validar(datos);
    pintarErrores(errores);
    if (Object.keys(errores).length) {
      mostrarEstado('Revisa los campos marcados.', 'error');
      return;
    }

    botonEnviar.disabled = true;
    botonEnviar.setAttribute('aria-busy', 'true');
    mostrarEstado('Enviando…', '');

    fetch(formulario.getAttribute('action'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (respuesta) {
        return respuesta.json().catch(function () { return {}; }).then(function (cuerpo) {
          return { estado: respuesta.status, cuerpo: cuerpo };
        });
      })
      .then(function (r) {
        if (r.estado === 201) {
          formulario.reset();
          pintarErrores({});
          mostrarEstado('¡Gracias! Recibí tu solicitud y te responderé pronto a tu correo.', 'ok');
        } else if (r.estado === 422 && r.cuerpo.errores) {
          pintarErrores(r.cuerpo.errores);
          mostrarEstado('Revisa los campos marcados.', 'error');
        } else if (r.estado === 429) {
          mostrarEstado('Enviaste varias solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.', 'error');
        } else {
          throw new Error('Respuesta inesperada ' + r.estado);
        }
      })
      .catch(function () {
        mostrarEstado('No se pudo enviar en este momento. Escríbeme directamente a ' + CORREO + '.', 'error');
      })
      .then(function () {
        botonEnviar.disabled = false;
        botonEnviar.removeAttribute('aria-busy');
      });
  });
})();
