# Referencia de la API

Base: misma URL del sitio (`https://TU-DOMINIO.com/api`). Todas las respuestas son JSON en UTF-8.

## `GET /api/salud`

Estado del servidor. Lo usan Render, Docker (`HEALTHCHECK`) y cualquier monitor de disponibilidad.

**200 OK**

```json
{
  "estado": "ok",
  "version": "2.0.0",
  "entorno": "production",
  "correoConfigurado": true,
  "hora": "2026-11-23T12:00:00.000Z"
}
```

Cabecera `Cache-Control: no-store` (nunca se guarda en caché).

## `POST /api/reservas`

Recibe una solicitud de reserva del formulario.

### Cuerpo

`Content-Type: application/json` (desde JavaScript) o `application/x-www-form-urlencoded` (formulario sin JavaScript).
Tamaño máximo: **10 KB**.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `nombre` | texto | sí | 2–80 caracteres; los espacios repetidos se unen. |
| `email` | texto | sí | Formato de correo, máx. 254; se guarda en minúsculas. |
| `telefono` | texto | no | 7–20 caracteres: dígitos, espacios, `+ - ( ) .` |
| `tipoEvento` | texto | sí | `boda`, `quinceanos`, `cumpleanos`, `sesion` u `otro`. |
| `fecha` | texto | no | `AAAA-MM-DD`, fecha real, no en el pasado. |
| `mensaje` | texto | sí | 10–2000 caracteres. |
| `website` | texto | — | Campo trampa: debe llegar vacío. |

Todos los textos se limpian de caracteres de control y espacios en los extremos.

### Respuestas (petición JSON)

| Código | Cuándo | Cuerpo |
|--------|--------|--------|
| **201** | Reserva guardada (o spam descartado en silencio). | `{ "ok": true, "id": "uuid", "mensaje": "Solicitud recibida." }` |
| **400** | JSON mal formado. | `{ "ok": false, "mensaje": "Solicitud mal formada." }` |
| **413** | Cuerpo mayor a 10 KB. | `{ "ok": false, "mensaje": "Solicitud demasiado grande." }` |
| **422** | Datos inválidos. | `{ "ok": false, "mensaje": "Datos inválidos.", "errores": { "email": "Escribe un correo válido." } }` |
| **429** | Más de `RATE_LIMIT_MAX` envíos por IP en la ventana. | `{ "ok": false, "mensaje": "Demasiadas solicitudes..." }` + cabeceras `RateLimit` y `RateLimit-Policy` |
| **500** | Error inesperado (por ejemplo, disco lleno). | `{ "ok": false, "mensaje": "Error interno del servidor." }` |

### Respuestas (formulario sin JavaScript)

Redirección **303** a `/?reserva=enviada#reservar` o `/?reserva=error#reservar`;
`reservas.js` lee ese parámetro y muestra el mensaje.

### Qué ocurre al recibir una reserva válida

1. Se crea un `id` (UUID v4) y la fecha `recibidaEn` (ISO 8601).
2. Se agrega una línea JSON a `RESERVAS_FILE` con los datos, la IP y el navegador (recortado a 200 caracteres).
3. Se envía el correo a `CONTACT_TO` con `Reply-To` del visitante. Si el SMTP falla o no está configurado,
   la reserva **igual** se confirma y queda en el archivo; el fallo se registra en el log.

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@example.com","tipoEvento":"boda","mensaje":"Quiero cotizar mi boda."}'
```

## Errores 404

- Rutas inexistentes bajo `/api/`: `404` en JSON.
- Cualquier otra ruta: `404` con la página `public/404.html`.
