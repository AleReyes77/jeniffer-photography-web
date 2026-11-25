#!/usr/bin/env sh
# ============================================================
#  Firewall básico para un VPS Ubuntu/Debian con UFW.
#  Deja abiertos SOLO: SSH, HTTP (80) y HTTPS (443).
#  El puerto 3000 de Node queda cerrado al exterior (solo lo usa el proxy local).
#
#  ANTES DE EJECUTARLO: confirma el puerto de SSH (abajo, PUERTO_SSH) o
#  te quedarás sin acceso al servidor. Ejecuta con: sudo sh firewall-ufw.sh
# ============================================================
set -e
PUERTO_SSH=22   # cámbialo si moviste SSH a otro puerto (recomendado, por ejemplo 2222)

ufw default deny incoming     # bloquea todo lo que entra…
ufw default allow outgoing    # …y permite lo que sale (actualizaciones, etc.)
ufw limit "$PUERTO_SSH"/tcp   # SSH con límite contra intentos repetidos (fuerza bruta)
ufw allow 80/tcp              # HTTP (solo para redirigir a HTTPS)
ufw allow 443/tcp             # HTTPS
ufw --force enable
ufw status verbose
