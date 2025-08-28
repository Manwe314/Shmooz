#!/usr/bin/env bash
set -euo pipefail

DOMAIN="shmooz.space"
ALT_DOMAIN="www.shmooz.space"

LE_DIR="/etc/letsencrypt/live/${DOMAIN}"
CERT="${LE_DIR}/fullchain.pem"
KEY="${LE_DIR}/privkey.pem"

mkdir -p /var/www/certbot

if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "[nginx] No certs found, generating temporary self-signed cert (with SAN)..."
  mkdir -p "$LE_DIR"
  TMP_CNF="$(mktemp)"
  cat >"$TMP_CNF" <<EOF
[req]
distinguished_name=req_distinguished_name
x509_extensions=v3_req
prompt=no
[req_distinguished_name]
CN=${DOMAIN}
[v3_req]
subjectAltName=@alt_names
[alt_names]
DNS.1=${DOMAIN}
DNS.2=${ALT_DOMAIN}
EOF
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$KEY" -out "$CERT" -config "$TMP_CNF" >/dev/null 2>&1 || true
  rm -f "$TMP_CNF"
fi

(
  while true; do
    inotifywait -e close_write,create,move,delete -r /etc/letsencrypt/live >/dev/null 2>&1 || true
    echo "[nginx] Certificate change detected, reloading..."
    nginx -s reload || true
    sleep 1
  done
) &

exec nginx -g "daemon off;"
