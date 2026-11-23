# Mantenimiento, seguridad y operación

Cómo el proyecto evita los errores más comunes de seguridad, deuda técnica y producción.

## Seguridad

| Riesgo | Cómo se evita aquí |
|--------|--------------------|
| Exponer credenciales | No hay contraseñas en el código. `.env`, llaves (`*.pem`, `*.key`), bases de datos y respaldos están en `.gitignore`. GitHub *secret scanning* y *push protection* bloquean subidas con secretos. |
| Confiar en datos del usuario | El sitio ya no recibe datos (no hay formulario ni base de datos), así que no existen inyecciones SQL. Contra XSS: CSP estricta (`script-src 'self'`, `script-src-attr 'none'`), nada de `innerHTML` con datos externos. |
| Control de acceso solo en el frontend | No hay paneles privados ni datos por usuario. `dotfiles: 'ignore'` impide descargar `.env` o `.htaccess` (probado). |
| Contraseñas débiles / sin 2FA | Activa la verificación en dos pasos en GitHub, en el panel del hosting, en el registrador del dominio y en tu correo. |

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
