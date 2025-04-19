#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
while ! nc -z $DATABASE_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "PostgreSQL is up and running."

#python manage.py makemigrations
#python manage.py migrate

python manage.py runserver 0.0.0.0:8000