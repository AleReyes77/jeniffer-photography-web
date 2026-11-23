# Política de seguridad

## Reportar una vulnerabilidad

No abras un *issue* público. Escribe a **jenifferariana95@gmail.com** con el asunto
"Seguridad sitio web", describiendo el problema y cómo reproducirlo. Se responderá en un plazo de 7 días.

## Medidas implementadas

- Content-Security-Policy estricta: scripts, estilos y fuentes solo del propio dominio; sin scripts en línea; sin formularios.
- HSTS en producción, Permissions-Policy (solo cámara), X-Content-Type-Options y Referrer-Policy.
- El sitio no recibe ni guarda datos de visitantes (reservas por WhatsApp).
- Sin secretos en el repositorio; .env, llaves y bases de datos ignorados por Git; secret scanning de GitHub.
- Dependabot, CodeQL y npm audit en cada cambio.
