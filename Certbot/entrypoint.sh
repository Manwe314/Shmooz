#!/bin/sh
set -e

WEBROOT="/var/www/certbot"
DOMAIN1="shmooz.space"
DOMAIN2="www.shmooz.space"
EMAIL="levan.kukhaleishvili14@gmail.com"

LIVE_DIR="/etc/letsencrypt/live/${DOMAIN1}"
ARCH_DIR="/etc/letsencrypt/archive/${DOMAIN1}"
RENEW_CONF="/etc/letsencrypt/renewal/${DOMAIN1}.conf"

mkdir -p "$WEBROOT"

if [ ! -f "$RENEW_CONF" ]; then
  echo "[certbot] No Let's Encrypt lineage found; preparing for initial issuance..."
  rm -rf "$LIVE_DIR" "$ARCH_DIR" 2>/dev/null || true

  echo "[certbot] Requesting initial certificate for ${DOMAIN1}, ${DOMAIN2} ..."
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w "$WEBROOT" \
    -d "$DOMAIN1" -d "$DOMAIN2"
fi

echo "[certbot] Renewal loop started (every 12h)"
while true; do
  certbot renew --webroot -w "$WEBROOT" --quiet || true
  sleep 12h
done
