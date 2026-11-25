# Publicación (despliegue)

## Lista previa

- [ ] `npm run verificar` pasa en tu computadora.
- [ ] `https://TU-DOMINIO.com` reemplazado por el dominio real en todo el proyecto.
- [ ] `public/descargas/precios-servicios.pdf` y `precios-servicios.jpg` agregados.
- [ ] El hosting tiene **Node.js 22.9 o superior** y certificado **HTTPS** (Let's Encrypt suele ser gratuito).

## Opción A — Hosting compartido con «Setup Node.js App» (cPanel)

Es lo más común en hostings de Nicaragua y Latinoamérica.

1. En cPanel abre **Setup Node.js App → Create Application**.
2. Node.js version: 22 o superior. Application mode: **Production**.
3. Application root: la carpeta donde subirás el proyecto (por ejemplo `jeniffer-photography`).
4. Application URL: tu dominio. Application startup file: `server/index.js`.
5. Variables de entorno: `NODE_ENV=production`, `TRUST_PROXY=true`, `SITE_URL=https://tu-dominio`.
6. Sube el proyecto **sin** `node_modules` ni `.env` (con Git o el administrador de archivos).
7. Pulsa **Run NPM Install** y después **Restart**.
8. Abre `https://tu-dominio/api/salud`: debe responder `"estado":"ok"`.

## Opción B — VPS (servidor propio) con PM2

```bash
git clone https://github.com/AleReyes77/jeniffer-photography-web.git
cd jeniffer-photography-web
npm ci --omit=dev
npm install -g pm2
pm2 start ecosystem.config.cjs   # mantiene el sitio encendido y lo reinicia si falla
pm2 save && pm2 startup          # lo enciende solo al reiniciar el VPS
```

Delante pon **Nginx** o **Caddy** con HTTPS que reenvíe al puerto 3000: hay configuraciones listas en `deploy/nginx.conf` y `deploy/Caddyfile`.
El sitio escucha solo en `127.0.0.1` (variable `HOST`), así el puerto 3000 nunca queda abierto a internet.
Activa el firewall con `deploy/firewall-ufw.sh` (solo SSH, 80 y 443) y entra por SSH con llaves, no con contraseña.

### Varios sitios en el mismo VPS

Cada sitio usa su propio `PORT` (3000, 3001, 3002…) y su propio bloque en Nginx o Caddy, que reparte el tráfico por dominio.
Cada proyecto instala sus dependencias en su propia carpeta (`npm ci`), con la versión de Node fijada en `.nvmrc`: así uno no rompe al otro.

## Opción C — Docker

```bash
docker build -t jeniffer-web .
docker run -d --name jeniffer-web -p 3000:3000 -e TRUST_PROXY=true --restart unless-stopped jeniffer-web
```

## Opción D — Hosting solo estático (sin Node)

Sube únicamente el contenido de `public/`. `.htaccess` (Apache) y `_headers` (Netlify) aplican las mismas
cabeceras de seguridad y caché. Todo funciona igual porque el sitio ya no necesita al servidor para nada esencial.

## Actualizar el sitio publicado

1. Trabaja en una rama (`git switch -c cambio/descripcion`) y prueba en local (`npm run dev`).
2. Abre un Pull Request: la CI debe quedar en verde.
3. Une el PR a `main` y en el hosting: `git pull`, `npm ci --omit=dev` y reinicia la app.
Nunca edites archivos directamente en el servidor en vivo.

## Después de publicar

- Monitor gratuito de disponibilidad (UptimeRobot) apuntando a `/api/salud`.
- <https://pagespeed.web.dev> para medir la velocidad real.
- Pasos de SEO en [SEO.md](SEO.md).
