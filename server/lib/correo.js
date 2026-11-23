/**
 * correo.js — Envía por correo electrónico cada nueva solicitud de reserva.
 *
 * Usa Nodemailer con un servidor SMTP (Gmail, Outlook, Zoho, el del hosting, etc.).
 * Si el SMTP no está configurado, no falla: la reserva queda guardada en el archivo
 * y se informa "smtp-no-configurado", así el sitio funciona desde el primer día.
 */
import nodemailer from 'nodemailer';

const NOMBRES_EVENTO = {
  boda: 'Boda',
  quinceanos: 'Quinceaños',
  cumpleanos: 'Cumpleaños',
  sesion: 'Sesión de fotos',
  otro: 'Otro evento',
};

/**
 * Escapa los caracteres especiales de HTML para que el texto del visitante
 * no pueda inyectar etiquetas en el correo.
 * @param {string} texto
 */
export function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Construye el asunto y el cuerpo (texto y HTML) del correo.
 * @param {{ id: string, recibidaEn: string, datos: object }} reserva
 */
export function construirMensaje(reserva) {
  const { datos } = reserva;
  const evento = NOMBRES_EVENTO[datos.tipoEvento] || datos.tipoEvento;
  const filas = [
    ['Nombre', datos.nombre],
    ['Correo', datos.email],
    ['Teléfono', datos.telefono || '—'],
    ['Evento', evento],
    ['Fecha', datos.fecha || 'Sin definir'],
    ['Recibida', reserva.recibidaEn],
    ['Referencia', reserva.id],
  ];

  const texto = `${filas.map(([clave, valor]) => `${clave}: ${valor}`).join('\n')}\n\nMensaje:\n${datos.mensaje}\n`;
  const html = `<h2 style="font-family:Arial,sans-serif">Nueva solicitud de reserva</h2>
<table style="font-family:Arial,sans-serif;border-collapse:collapse">${filas
    .map(([clave, valor]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${clave}</th><td>${escaparHtml(valor)}</td></tr>`)
    .join('')}</table>
<p style="font-family:Arial,sans-serif;white-space:pre-wrap">${escaparHtml(datos.mensaje)}</p>`;

  return {
    asunto: `Nueva reserva: ${evento} — ${datos.nombre}`.slice(0, 150),
    texto,
    html,
  };
}

/**
 * Crea el servicio de correo a partir de la configuración.
 * @param {ReturnType<import('../config.js').cargarConfiguracion>} config
 * @param {{ crearTransporte?: typeof nodemailer.createTransport }} [opciones]
 */
export function crearCorreo(config, opciones = {}) {
  const { smtp, correoDestino, correoRemitente } = config;
  const configurado = Boolean(smtp.host && correoDestino && correoRemitente);
  const crearTransporte = opciones.crearTransporte || nodemailer.createTransport.bind(nodemailer);

  const transporte = configurado
    ? crearTransporte({
        host: smtp.host,
        port: smtp.puerto,
        secure: smtp.seguro,
        auth: smtp.usuario ? { user: smtp.usuario, pass: smtp.clave } : undefined,
      })
    : null;

  /**
   * Envía la notificación de una reserva.
   * @returns {Promise<{ enviado: boolean, motivo?: string }>}
   */
  async function enviarReserva(reserva) {
    if (!transporte) return { enviado: false, motivo: 'smtp-no-configurado' };
    const mensaje = construirMensaje(reserva);
    await transporte.sendMail({
      from: correoRemitente,
      to: correoDestino,
      replyTo: reserva.datos.email,
      subject: mensaje.asunto,
      text: mensaje.texto,
      html: mensaje.html,
    });
    return { enviado: true };
  }

  return { configurado, enviarReserva };
}
