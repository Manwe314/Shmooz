#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
while ! nc -z $DATABASE_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "PostgreSQL is up and running."

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Checking for admin user..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model

User = get_user_model()
username = 'shmooz'
password = 'shmooz123'
email = 'levan.kukhaleishvili14@gmail.com'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("✅ Admin user created!")
else:
    print("✅ Admin user already exists. Skipping creation.")
EOF

echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000
#PROD: switch to real wsgi server like gunicorn