#!/usr/bin/env bash
set -euo pipefail

DOMAIN="shmooz.space"
LE_DIR="/etc/letsencrypt/live/${DOMAIN}"
CERT="${LE_DIR}/fullchain.pem"
KEY="${LE_DIR}/privkey.pem"

mkdir -p /var/www/certbot

if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "[nginx] No certs found yet, generating temporary self-signed cert..."
  mkdir -p "$LE_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$KEY" -out "$CERT" -subj "/CN=${DOMAIN}" >/dev/null 2>&1 || true
fi

(
  while true; do
    inotifywait -e close_write,create,move,delete "$LE_DIR" >/dev/null 2>&1 || true
    echo "[nginx] Certificate change detected, reloading..."
    nginx -s reload || true
  done
) &

exec nginx -g "daemon off;"
