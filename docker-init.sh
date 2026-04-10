#!/bin/bash

# FlatEase Docker Initialization Script
# This script sets up and starts the FlatEase application with Docker

set -e

echo "FlatEase Docker Setup"
echo "========================"

TARGET_BRANCH="${TARGET_BRANCH:-}"
RESET_VOLUMES="${RESET_VOLUMES:-0}"

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "Docker Compose is not available. Please install/enable Docker Compose."
    exit 1
fi

run_with_retry() {
    local max_attempts=12
    local attempt=1

    until "$@"; do
        if [ "$attempt" -ge "$max_attempts" ]; then
            return 1
        fi

        echo "Command failed. Retrying in 5 seconds..."
        sleep 5
        attempt=$((attempt + 1))
    done
}

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

if [ -n "${TARGET_BRANCH}" ]; then
    echo ""
    echo "Syncing repository on branch: ${TARGET_BRANCH}"
    git fetch --all
    git checkout "${TARGET_BRANCH}"
    git pull origin "${TARGET_BRANCH}"
fi

echo ""
if [ "${RESET_VOLUMES}" = "1" ]; then
    echo "Stopping old containers and removing stale volumes..."
    docker compose --env-file .env down -v --remove-orphans
else
    echo "Stopping old containers (preserving volumes)..."
    docker compose --env-file .env down --remove-orphans
fi

echo ""
echo "Building Docker images (fresh build)..."
docker compose --env-file .env up -d --build --force-recreate

echo ""
echo "Services started successfully."
echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Running SQL database migrations..."
run_with_retry docker compose --env-file .env exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh

echo "Running SQL seed data..."
run_with_retry docker compose --env-file .env exec -T backend bash /var/www/database/seeds/run_sql_seeds.sh

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
if [ -n "${TARGET_BRANCH}" ]; then
    echo "  - Pull updates: git pull origin ${TARGET_BRANCH} && docker compose --env-file .env exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh"
else
    echo "  - Pull updates: git pull && docker compose --env-file .env exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh"
fi
echo "  - Full reset (wipe DB volume): RESET_VOLUMES=1 ./docker-init.sh"
echo "  - See DOCKER.md for detailed documentation"
