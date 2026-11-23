# Política de seguridad

## Reportar una vulnerabilidad

No abras un *issue* público. Escribe a **jenifferariana95@gmail.com** con el asunto
"Seguridad sitio web", describiendo el problema y cómo reproducirlo. Se responderá en un plazo de 7 días.

## Medidas implementadas

- Content-Security-Policy estricta (sin scripts en línea), HSTS en producción y Permissions-Policy.
- Validación y limpieza de toda la entrada en el servidor; límite de 10 KB por petición.
- Límite de envíos por IP y campo trampa contra robots.
- Escape del contenido del visitante en los correos.
- Secretos solo en variables de entorno (`.env` está fuera del repositorio).
- `npm audit` en cada ejecución de la CI.
