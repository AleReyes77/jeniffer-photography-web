# Referencia de la API

El sitio ya no recibe datos de los visitantes: las reservas se hacen por WhatsApp.
La única ruta de la API sirve para que el hosting o un monitor de disponibilidad comprueben que el servidor está vivo.

## `GET /api/salud`

**200 OK**

```json
{
  "estado": "ok",
  "version": "2.1.0",
  "entorno": "production",
  "hora": "2026-11-23T12:00:00.000Z"
}
```

- Cabecera `Cache-Control: no-store` (nunca se guarda en caché).
- Úsala en UptimeRobot, Better Stack u otro monitor gratuito: si deja de responder 200, te avisan por correo o WhatsApp.

## Cualquier otra ruta bajo `/api/`

`404` en JSON: `{ "ok": false, "mensaje": "Ruta no encontrada." }`.
