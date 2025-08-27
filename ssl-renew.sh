#!/bin/bash

# SSL Certificate Renewal Script
# This script renews Let's Encrypt certificates and reloads Nginx

set -e

echo "🔄 Renewing SSL certificates..."
echo "==============================="

# Check if certificates exist
if [ ! -f "./Volume/certbot/conf/live/shmooz.space/fullchain.pem" ]; then
    echo "❌ No existing certificates found. Run ./ssl-setup.sh first."
    exit 1
fi

# Show current certificate expiration
echo "📅 Current certificate expires:"
openssl x509 -enddate -noout -in ./Volume/certbot/conf/live/shmooz.space/fullchain.pem | cut -d= -f2

# Renew certificates (this only renews if expiring within 30 days)
echo "🔄 Attempting certificate renewal..."
docker-compose -f docker-compose.certbot.yml run --rm certbot renew --quiet

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ Certificate renewal check completed"

    # Test Nginx configuration before reloading
    echo "🧪 Testing Nginx configuration..."
    if docker-compose exec nginx nginx -t > /dev/null 2>&1; then
        echo "✅ Nginx configuration is valid"

        # Graceful reload (zero downtime)
        echo "🔄 Gracefully reloading Nginx (zero downtime)..."
        docker-compose exec nginx nginx -s reload

        if [ $? -eq 0 ]; then
            echo "✅ SSL certificate renewal successful!"
            echo "📅 Certificate now expires:"
            openssl x509 -enddate -noout -in ./Volume/certbot/conf/live/shmooz.space/fullchain.pem | cut -d= -f2
        else
            echo "⚠️  Nginx reload failed, but certificates were renewed"
        fi
    else
        echo "❌ Nginx configuration test failed - NOT reloading"
        echo "Check Nginx config and reload manually when fixed"
        exit 1
    fi
else
    echo "❌ Certificate renewal failed"
    echo "Check logs: docker-compose -f docker-compose.certbot.yml logs certbot"
    exit 1
fi
