#!/bin/bash

# Standalone SSL Certificate Setup for shmooz.space
# This uses standalone mode which temporarily stops Nginx

set -e

echo "🔐 Setting up SSL certificates for shmooz.space (Standalone Mode)"
echo "================================================================"

# Check if domain is pointing to this server
echo "🌐 Checking DNS configuration..."
DOMAIN_IP=$(dig +short shmooz.space)

if [ -z "$DOMAIN_IP" ]; then
    echo "❌ Error: shmooz.space does not resolve to any IP address"
    echo "Please configure your DNS to point shmooz.space to this server"
    exit 1
fi

echo "✅ Domain shmooz.space resolves to: $DOMAIN_IP"

# Create necessary directories
echo "📁 Creating SSL directories..."
mkdir -p ./Volume/certbot/conf
mkdir -p ./Volume/certbot/www
mkdir -p ./Volume/certbot/logs

# Set proper permissions
chmod 755 ./Volume/certbot/conf
chmod 755 ./Volume/certbot/www
chmod 755 ./Volume/certbot/logs

# Stop all services to free up ports 80 and 443
echo "🛑 Stopping services to free up ports 80 and 443..."
docker compose down

# Generate SSL certificate using standalone mode
echo "📜 Generating SSL certificate using standalone mode..."
echo "ℹ️  This will temporarily use ports 80 and 443 for validation"

docker run --rm \
  -v $(pwd)/Volume/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/Volume/certbot/logs:/var/log/letsencrypt \
  -p 80:80 -p 443:443 \
  certbot/certbot:v2.7.4 certonly --standalone \
  --email admin@shmooz.space \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d shmooz.space \
  -d www.shmooz.space

# Check if certificate was generated
if [ -f "./Volume/certbot/conf/live/shmooz.space/fullchain.pem" ]; then
    echo "✅ SSL certificate generated successfully!"
    
    # Start services with SSL certificate
    echo "🚀 Starting services with SSL certificate..."
    docker compose up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 20
    
    # Test SSL certificate
    echo "🧪 Testing SSL certificate..."
    if curl -f -s -k https://localhost > /dev/null 2>&1; then
        echo "✅ SSL certificate is working locally!"
    else
        echo "⚠️  Local SSL test failed, but certificate was generated"
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
    echo "  - Run './ssl-renew.sh' to renew certificates"
    echo "  - Run './ssl-cron-setup.sh' to setup automatic renewal"
    echo ""
    echo "🌐 Your site should now be available at:"
    echo "  - https://shmooz.space"
    echo "  - https://www.shmooz.space"
    echo ""
    echo "⚠️  Note: If external access fails, check your firewall/security groups"
    echo "   Ensure ports 80 and 443 are open to the internet"
    
else
    echo "❌ SSL certificate generation failed!"
    echo "Check the logs in ./Volume/certbot/logs/"
    echo "Starting services anyway..."
    docker compose up -d
    exit 1
fi

