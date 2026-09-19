#!/usr/bin/env bash
# Railway Start Script
# This script runs on container startup and handles migrations, cache, and server start

set -e

echo "=== Railway Deployment Start ==="
echo "Environment: ${APP_ENV:-production}"
echo "Port: ${PORT:-8000}"

# Wait for database to be ready (Railway provides DATABASE_URL)
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL detected, parsing..."
    # Parse DATABASE_URL for PostgreSQL
    # Format: postgresql://user:password@host:port/database
    export DB_CONNECTION=pgsql
    
    # Extract components from DATABASE_URL
    DB_URL_REGEX='^postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)$'
    if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
        export DB_USERNAME="${BASH_REMATCH[1]}"
        export DB_PASSWORD="${BASH_REMATCH[2]}"
        export DB_HOST="${BASH_REMATCH[3]}"
        export DB_PORT="${BASH_REMATCH[4]}"
        export DB_DATABASE="${BASH_REMATCH[5]}"
        echo "Database configured: $DB_HOST:$DB_PORT/$DB_DATABASE"
    fi
fi

# Also handle MySQL if provided
if [ -n "$MYSQL_URL" ]; then
    echo "MYSQL_URL detected, parsing..."
    export DB_CONNECTION=mysql
    
    MYSQL_URL_REGEX='^mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)$'
    if [[ $MYSQL_URL =~ $MYSQL_URL_REGEX ]]; then
        export DB_USERNAME="${BASH_REMATCH[1]}"
        export DB_PASSWORD="${BASH_REMATCH[2]}"
        export DB_HOST="${BASH_REMATCH[3]}"
        export DB_PORT="${BASH_REMATCH[4]}"
        export DB_DATABASE="${BASH_REMATCH[5]}"
        echo "MySQL configured: $DB_HOST:$DB_PORT/$DB_DATABASE"
    fi
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --no-interaction

# Clear and cache configuration
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the server
echo "Starting PHP server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"