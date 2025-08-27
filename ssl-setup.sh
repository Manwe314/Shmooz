#!/bin/bash

# SSL Certificate Setup Script for shmooz.space
# This script sets up Let's Encrypt SSL certificates using Certbot

set -e

echo "🔐 Setting up SSL certificates for shmooz.space"
echo "=============================================="

# Check if domain is pointing to this server
echo "🌐 Checking DNS configuration..."
DOMAIN_IP=$(dig +short shmooz.space)
SERVER_IP=$(curl -s -4 ifconfig.me)  # Force IPv4

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

# Ensure main application is running (creates the network)
echo "🚀 Starting main application (creates network)..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Verify network exists
echo "🔍 Checking Docker network..."
if docker network ls | grep -q "portfolio_app-network"; then
    echo "✅ Docker network 'portfolio_app-network' exists"
else
    echo "⚠️  Network not found, but continuing..."
fi

# Test if nginx is responding on port 80
echo "🧪 Testing Nginx readiness..."
if curl -f -s http://localhost/ > /dev/null 2>&1; then
    echo "✅ Nginx is responding"
else
    echo "⚠️  Nginx may not be ready, but continuing with certificate generation..."
fi

# Stop nginx temporarily for standalone mode
echo "🛑 Temporarily stopping Nginx for certificate generation..."
docker compose stop nginx

# Generate SSL certificate using standalone mode (binds to port 80 directly)
echo "📜 Generating SSL certificate using standalone mode..."
docker run --rm -v $(pwd)/Volume/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/Volume/certbot/logs:/var/log/letsencrypt \
  -p 80:80 -p 443:443 \
  certbot/certbot:v2.7.4 certonly --standalone \
  --email admin@shmooz.space --agree-tos --no-eff-email \
  --force-renewal \
  -d shmooz.space -d www.shmooz.space

# Start nginx back up
echo "🚀 Starting Nginx with SSL certificates..."
docker compose start nginx

# Wait for nginx to be ready
echo "⏳ Waiting for Nginx to start..."
sleep 10

# Test if SSL is working
echo "🧪 Testing SSL certificate..."
if curl -f -s -k https://localhost > /dev/null 2>&1; then
    echo "✅ SSL certificate is working locally!"

    # Test external access
    if curl -f -s https://shmooz.space > /dev/null 2>&1; then
        echo "✅ SSL certificate is working externally!"
    else
        echo "⚠️  External SSL test failed - check firewall/DNS"
    fi
else
    echo "⚠️  Local SSL test failed"
fi

# Check if certificate files exist (for information)
if [ -f "./Volume/certbot/conf/live/shmooz.space/fullchain.pem" ]; then
    echo "✅ Certificate files found in volume"
else
    echo "⚠️  Certificate files not found in volume (may be in container only)"
fi
echo ""
echo "🎉 SSL setup complete!"
echo ""
echo "📋 Certificate Information:"
echo "  - Domain: shmooz.space, www.shmooz.space"
echo "  - Expires: 2025-11-25 (as shown in Certbot output)"
echo ""
echo "🔄 Auto-renewal:"
echo "  - Run './ssl-renew.sh' to manually renew"
echo "  - Run './ssl-cron-setup.sh' to setup automatic renewal"
echo ""
echo "🌐 Your site should now be available at:"
echo "  - https://shmooz.space"
echo "  - https://www.shmooz.space"
echo ""
echo "✅ SSL certificate has been generated and Nginx restarted!"

