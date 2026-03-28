#!/bin/bash

# FlatEase Docker Initialization Script
# This script sets up and starts the FlatEase application with Docker

set -e

echo "FlatEase Docker Setup"
echo "========================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose plugin is available
if ! docker compose version &> /dev/null; then
    echo "Docker Compose is not available. Please install/enable Docker Compose."
    exit 1
fi

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "Warning: .env.docker not found. Creating from template..."
    cat > .env.docker << 'EOF'
APP_NAME=FlatEase
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=flatease_db
DB_USERNAME=flatease
DB_PASSWORD=Root@1234

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173

VITE_BACKEND_ENDPOINT=http://localhost:8000/api

BACKEND_PORT=8000
FRONTEND_PORT=5173
EOF
    echo "Created .env.docker"
fi

echo ""
echo "Building Docker images..."
docker compose build

echo ""
echo "Starting services..."
docker compose up -d

echo ""
echo "Services started successfully."
echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Running database migrations..."
docker compose exec -T backend php artisan migrate --force

echo ""
echo "Database setup complete."
echo ""
echo "Application is ready."
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Database: localhost:3306"
echo ""
echo "Next steps:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - See DOCKER.md for detailed documentation"
