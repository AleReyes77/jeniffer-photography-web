# Política de seguridad

## Reportar una vulnerabilidad

No abras un *issue* público. Escribe a **jenifferariana95@gmail.com** con el asunto
"Seguridad sitio web", describiendo el problema y cómo reproducirlo. Se responderá en un plazo de 7 días.

## Medidas implementadas

- Content-Security-Policy estricta: scripts, estilos y fuentes solo del propio dominio; sin scripts en línea; sin formularios.
- HTTPS obligatorio (redirección 301) y HSTS; el servidor escucha solo en 127.0.0.1 detrás de un proxy.
- Límite de peticiones por IP (429 con Retry-After) y firewall de ejemplo en deploy/.
- Sin CORS: ningún otro sitio puede usar el servidor desde el navegador de un visitante.
- Errores genéricos al visitante y detalles solo en el log; registro de toda respuesta 5xx.
- HSTS en producción, Permissions-Policy (solo cámara), X-Content-Type-Options y Referrer-Policy.
- El sitio no recibe ni guarda datos de visitantes (reservas por WhatsApp).
- Sin secretos en el repositorio; .env, llaves y bases de datos ignorados por Git; secret scanning de GitHub.
- Dependabot, CodeQL y npm audit en cada cambio.
