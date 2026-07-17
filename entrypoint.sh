#!/bin/bash
set -e

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 0.5
done
echo "PostgreSQL is up and running"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Run database seeder
echo "Seeding default data..."
python manage.py seed_taskflow

# Execute main CMD command
exec "$@"
