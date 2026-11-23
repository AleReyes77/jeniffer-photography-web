# Despliegue

## Lista de verificación previa

- [ ] `npm run verificar` pasa en tu computadora.
- [ ] `TU-DOMINIO.com` reemplazado en todo el proyecto.
- [ ] Archivos de precios en `public/descargas/`.
- [ ] Ciudad, país y teléfono agregados al JSON-LD.
- [ ] Variables SMTP listas (para Gmail: activa la verificación en dos pasos y crea una *contraseña de aplicación*).

## Opción 1 — Render (recomendada)

1. Entra a <https://render.com> e inicia sesión con GitHub.
2. **New → Blueprint** y elige el repositorio `jeniffer-photography-web`. Render lee `render.yaml`.
3. Completa las variables marcadas como secretas (`SITE_URL`, `SMTP_*`, `CONTACT_*`).
4. Al terminar, `https://<servicio>.onrender.com/api/salud` debe responder `"estado":"ok"`.
5. **Dominio propio:** Settings → Custom Domains → agrega tu dominio y crea en tu proveedor de DNS el registro que indique Render. El certificado HTTPS es automático.

> En el plan gratuito el disco no es permanente: el archivo de reservas se borra al reiniciar.
> Las reservas siguen llegando por **correo**, que es la copia principal. Para conservar el archivo,
> agrega un *Persistent Disk* montado en `/opt/render/project/src/data`.

## Opción 2 — Docker (VPS, Railway, Fly.io)

```bash
docker build -t jeniffer-web .
docker run -d --name jeniffer-web -p 3000:3000 --env-file .env -v jeniffer-datos:/app/data --restart unless-stopped jeniffer-web
```

- El contenedor corre como el usuario sin privilegios `node`.
- `HEALTHCHECK` consulta `/api/salud` cada 30 segundos.
- El volumen `jeniffer-datos` conserva las reservas entre reinicios.
- Pon delante un proxy con HTTPS (Caddy, Nginx o Cloudflare) y define `TRUST_PROXY=true`.

## Opción 3 — Hosting estático (Hostinger, Netlify, GitHub Pages)

Sube **solo** el contenido de `public/`. Ya incluye `.htaccess` (Apache) y `_headers` (Netlify) con HTTPS,
compresión, caché y cabeceras de seguridad. Todo funciona excepto el envío del formulario: al no haber
servidor, `reservas.js` muestra el correo de contacto como alternativa.

## Después de publicar

1. Abre el sitio en computadora y en celular; prueba el formulario y la cámara.
2. Revisa <https://pagespeed.web.dev> y <https://search.google.com/test/rich-results>.
3. Sigue los pasos de [SEO.md](SEO.md).
