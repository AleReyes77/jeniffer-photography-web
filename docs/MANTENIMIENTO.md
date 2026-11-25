# Mantenimiento, seguridad y operación

Cómo el proyecto evita los errores más comunes de seguridad, deuda técnica y producción.

## Seguridad

| Riesgo | Cómo se evita aquí |
|--------|--------------------|
| Exponer credenciales | No hay contraseñas en el código. `.env`, llaves (`*.pem`, `*.key`), bases de datos y respaldos están en `.gitignore`. GitHub *secret scanning* y *push protection* bloquean subidas con secretos. |
| Confiar en datos del usuario | El sitio ya no recibe datos (no hay formulario ni base de datos), así que no existen inyecciones SQL. Contra XSS: CSP estricta (`script-src 'self'`, `script-src-attr 'none'`), nada de `innerHTML` con datos externos. |
| Control de acceso solo en el frontend | No hay paneles privados ni datos por usuario. `dotfiles: 'ignore'` impide descargar `.env` o `.htaccess` (probado). |
| Contraseñas débiles / sin 2FA | Activa la verificación en dos pasos en GitHub, en el panel del hosting, en el registrador del dominio y en tu correo. |

## Red, servidor y arquitectura

| Riesgo | Cómo se evita aquí |
|--------|--------------------|
| Conflictos de puertos entre sitios | `HOST=127.0.0.1` y un `PORT` por sitio detrás de Nginx o Caddy (`deploy/`). Si el puerto está ocupado, el log lo explica. |
| Contaminación de entornos | Node fijado en `.nvmrc`, `engine-strict` en `.npmrc`, dependencias exactas en `package-lock.json`, Docker opcional. |
| CORS abierto | No se envía `Access-Control-Allow-Origin` (probado). |
| Cookies y localStorage | El sitio no usa ninguno. |
| Sin límite de peticiones | Límite por IP de 300/min (429). Recomendado: Cloudflare delante como WAF/CDN. |
| Subida de archivos | No existe: la selfie nunca sale del navegador. |
| Errores detallados | Mensajes genéricos al visitante; pila solo en el log. |
| Sin HTTPS | Redirección 301 y HSTS en producción. |
| Mínimo privilegio | Docker corre como el usuario `node`; el servidor avisa si se ejecuta como root. No hay base de datos. |
| Galerías que fallan | Comprobación de WebGL con aviso; indicadores de carga y error. |

## Deuda técnica

| Riesgo | Cómo se evita aquí |
|--------|--------------------|
| Librerías para todo | 3 dependencias de producción. Se eliminaron jQuery, Nodemailer y express-rate-limit al dejar de necesitarlos. |
| Código repetido | Configuración en un solo lugar (`config.js`), lista de fotos en `fotos.js`, función `JF_alAcercarse` reutilizada por las galerías. |
| Sin documentación | README, `docs/`, CHANGELOG y dos PDFs explicativos. |
| Dependencias sin actualizar | **Dependabot** abre PRs semanales; la CI y CodeQL los prueban. Para actualizar librerías del navegador: cambia la versión en `package.json` y ejecuta `npm run recursos`. |

## Producción

| Riesgo | Cómo se evita aquí |
|--------|--------------------|
| Cambios directos en el servidor | Flujo Git: rama → PR con CI verde → `main` → `git pull` en el hosting. |
| Sin pruebas ni monitoreo | `npm run verificar` + CI en cada cambio. Monitorea `/api/salud` con UptimeRobot. Los errores se registran en JSON (visibles en el panel del hosting o con `pm2 logs`). |
| Sin respaldos | El código completo está en GitHub. Activa los respaldos automáticos del hosting y guarda una copia de `public/descargas` y de las fotos originales en la nube. No hay base de datos que respaldar. |
| Imágenes pesadas / no adaptado al celular | WebP, miniaturas, carga diferida, versiones recortadas para celular y diseño adaptable probado a 375 px. |

## Tareas periódicas

- **Cada semana:** revisar y unir los PRs de Dependabot si la CI está en verde.
- **Cada mes:** revisar Google Search Console y la pestaña *Security* de GitHub.
- **Al cambiar fotos:** WebP, nombre descriptivo, `alt`, entrada en `sitemap.xml` y `npm run recursos` (miniaturas).
