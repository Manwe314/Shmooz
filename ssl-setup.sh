#!/bin/bash

# SSL Certificate Setup Script for shmooz.space
# This script sets up Let's Encrypt SSL certificates using Certbot

set -e

echo "🔐 Setting up SSL certificates for shmooz.space"
echo "=============================================="

# Check if domain is pointing to this server
echo "🌐 Checking DNS configuration..."
DOMAIN_IP=$(dig +short shmooz.space)
SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$DOMAIN_IP" ]; then
    echo "❌ Error: shmooz.space does not resolve to any IP address"
    echo "Please configure your DNS to point shmooz.space to this server's IP: $SERVER_IP"
    exit 1
fi

echo "✅ Domain shmooz.space resolves to: $DOMAIN_IP"
echo "ℹ️  Server IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  Warning: Domain IP ($DOMAIN_IP) doesn't match server IP ($SERVER_IP)"
    echo "SSL certificate generation may fail if DNS is not properly configured"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating SSL directories..."
mkdir -p ./Volume/certbot/conf
mkdir -p ./Volume/certbot/www
mkdir -p ./Volume/certbot/logs

# Set proper permissions
chmod 755 ./Volume/certbot/conf
chmod 755 ./Volume/certbot/www
chmod 755 ./Volume/certbot/logs

# Start nginx first (needed for ACME challenge)
echo "🚀 Starting Nginx for ACME challenge..."
docker-compose up -d nginx

# Wait for nginx to be ready
echo "⏳ Waiting for Nginx to be ready..."
sleep 10

# Test if nginx is responding on port 80
if ! curl -f -s http://localhost/.well-known/acme-challenge/test > /dev/null 2>&1; then
    echo "⚠️  Nginx may not be ready for ACME challenge, but continuing..."
fi

# Generate SSL certificate
echo "📜 Generating SSL certificate..."
docker-compose -f docker-compose.certbot.yml run --rm certbot

# Check if certificate was generated
if [ -f "./Volume/certbot/conf/live/shmooz.space/fullchain.pem" ]; then
    echo "✅ SSL certificate generated successfully!"
    
    # Restart nginx to use the new certificate
    echo "🔄 Restarting Nginx with SSL certificate..."
    docker-compose restart nginx
    
    # Test SSL certificate
    echo "🧪 Testing SSL certificate..."
    sleep 5
    
    if curl -f -s https://shmooz.space > /dev/null 2>&1; then
        echo "✅ SSL certificate is working!"
    else
        echo "⚠️  SSL test failed, but certificate was generated"
    fi
    
    echo ""
    echo "🎉 SSL setup complete!"
    echo ""
    echo "📋 Certificate Information:"
    echo "  - Domain: shmooz.space, www.shmooz.space"
    echo "  - Certificate: ./Volume/certbot/conf/live/shmooz.space/fullchain.pem"
    echo "  - Private Key: ./Volume/certbot/conf/live/shmooz.space/privkey.pem"
    echo "  - Expires: $(openssl x509 -enddate -noout -in ./Volume/certbot/conf/live/shmooz.space/fullchain.pem | cut -d= -f2)"
    echo ""
    echo "🔄 Auto-renewal:"
    echo "  - Certificates will auto-renew before expiration"
    echo "  - Run './ssl-renew.sh' to manually renew"
    echo ""
    echo "🌐 Your site is now available at:"
    echo "  - https://shmooz.space"
    echo "  - https://www.shmooz.space"
    
else
    echo "❌ SSL certificate generation failed!"
    echo "Check the logs:"
    echo "  docker-compose -f docker-compose.certbot.yml logs certbot"
    exit 1
fi
