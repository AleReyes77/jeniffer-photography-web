# Archivos de despliegue

| Archivo | Para qué sirve |
|---------|----------------|
| `nginx.conf` | Proxy inverso con Nginx: HTTPS, redirecciones y reparto por dominio a puertos locales (varios sitios en un VPS sin conflictos). |
| `Caddyfile` | Alternativa más simple a Nginx, con HTTPS automático. Usa uno u otro, no ambos. |
| `firewall-ufw.sh` | Firewall: solo SSH, 80 y 443 abiertos. Revisa el puerto SSH antes de ejecutarlo. |

En el servidor, el sitio debe escuchar en `HOST=127.0.0.1` (valor por defecto) y con `TRUST_PROXY=true`.
Cada sitio adicional usa otro `PORT` (3001, 3002…) y su propio bloque en Nginx o Caddy.
Recomendaciones de SSH: acceso con llaves (no contraseña), usuario sin privilegios y `PermitRootLogin no`.
