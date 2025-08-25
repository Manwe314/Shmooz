#!/bin/sh

if [ "$(id -u)" = "0" ]; then
    echo "🚀 Starting Django application in production mode (as root, will switch to appuser)..."

    mkdir -p /app/logs /app/media/uploads /app/staticfiles

    echo "🔧 Fixing volume permissions..."
    chown -R appuser:appgroup /app/media /app/logs /app/staticfiles
    chmod -R 755 /app/media /app/logs /app/staticfiles

    echo "ℹ️  Directory permissions fixed:"
    ls -ld /app/media /app/logs /app/staticfiles

    echo "👤 Switching to appuser..."
    exec su-exec appuser "$0" "$@"
fi

echo "🚀 Starting Django application as appuser..."

echo "⏳ Waiting for PostgreSQL to be ready..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "✅ PostgreSQL is up and running."

echo "🔄 Running database migrations..."
python manage.py migrate --settings=shmooz.settings

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --settings=shmooz.settings

if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "👤 Checking for admin user..."
    python manage.py shell --settings=shmooz.settings << EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Admin user '{username}' created!")
else:
    print(f"ℹ️  Admin user '{username}' already exists.")
EOF
else
    echo "⚠️  No DJANGO_SUPERUSER_PASSWORD provided. Skipping admin user creation."
fi

echo "🔍 Checking Gunicorn installation..."
if ! command -v gunicorn &> /dev/null; then
    echo "❌ Gunicorn not found in PATH: $PATH"
    echo "Available Python packages:"
    pip list | grep -i gunicorn || echo "Gunicorn not installed"
    exit 1
fi

echo "✅ Gunicorn found: $(which gunicorn)"

echo "🌟 Starting Gunicorn server..."
exec gunicorn --config gunicorn.conf.py shmooz.wsgi:application
