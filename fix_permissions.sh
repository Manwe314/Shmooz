#!/bin/bash

# Fix permissions for Docker volumes

echo "🔧 Fixing Docker volume permissions..."

# Create directories if they don't exist
mkdir -p ./Volume/media/uploads
mkdir -p ./Volume/logs
mkdir -p ./Volume/staticfiles

# Set permissions (more permissive approach since we can't change ownership)
echo "� Setting permissions for media directory..."
chmod -R 777 ./Volume/media

echo "� Setting permissions for logs directory..."
chmod -R 777 ./Volume/logs 2>/dev/null || echo "⚠️  Could not set logs permissions (may already be owned by container)"

echo "� Setting permissions for staticfiles directory..."
chmod -R 777 ./Volume/staticfiles 2>/dev/null || echo "⚠️  Could not set staticfiles permissions (may already be owned by container)"

# Verify permissions
echo ""
echo "✅ Permissions fixed! Current status:"
ls -la ./Volume/
echo ""
echo "Media directory:"
ls -la ./Volume/media/
echo ""
echo "🚀 You can now restart your containers:"
echo "   docker-compose restart backend"
