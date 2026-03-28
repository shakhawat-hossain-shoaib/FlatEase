#!/bin/bash

# FlatEase Docker Initialization Script
# This script sets up and starts the FlatEase application with Docker

set -e

echo "FlatEase Docker Setup"
echo "========================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose plugin is available
if ! docker compose version &> /dev/null; then
    echo "Docker Compose is not available. Please install/enable Docker Compose."
    exit 1
fi

# Check if root .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Copying .env.example to .env"
        cp .env.example .env
        echo "Created .env from .env.example"
    else
        echo "Missing .env.example. Please add it first."
        exit 1
    fi
fi

echo ""
echo "Building Docker images..."
docker compose --env-file .env build

echo ""
echo "Starting services..."
docker compose --env-file .env up -d

echo ""
echo "Services started successfully."
echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Running database migrations..."
docker compose --env-file .env exec -T backend php artisan migrate --seed --force --no-interaction

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
echo "  - Pull updates: git pull && docker compose --env-file .env exec -T backend php artisan migrate --force"
echo "  - See DOCKER.md for detailed documentation"
