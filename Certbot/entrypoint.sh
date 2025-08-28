#!/bin/sh
set -e

WEBROOT="/var/www/certbot"
DOMAIN1="shmooz.space"
DOMAIN2="www.shmooz.space"
EMAIL="levan.kukhaleishvili14@gmail.com"
LIVE_DIR="/etc/letsencrypt/live/${DOMAIN1}"

mkdir -p "$WEBROOT"

if [ ! -d "$LIVE_DIR" ]; then
  echo "[certbot] Initial certificate request for ${DOMAIN1}, ${DOMAIN2} ..."
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w "$WEBROOT" \
    -d "$DOMAIN1" -d "$DOMAIN2"
fi

echo "[certbot] Renewal loop started (every 12h)"
while true; do
  certbot renew --webroot -w "$WEBROOT" --quiet || true
  sleep 12h
done
