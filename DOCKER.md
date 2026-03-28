# FlatEase Docker Development Guide

This document defines the team standard for local development.

## Goal

Provide one reproducible local setup for every developer using Docker, MySQL, Laravel migrations, and idempotent seeders.

## Team Workflow

1. Clone repository.
2. Copy environment template.
3. Start containers.
4. Run migrations and seeders.
5. Start coding.

## Prerequisites

- Docker 20.10+
- Docker Compose v2+

## First-Time Setup

```bash
git clone <your-repository-url>
cd FlatEase
git checkout Dockerizing
cp .env.example .env
docker compose up -d --build
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
```

Alternative one-command setup:

```bash
chmod +x docker-init.sh
./docker-init.sh
```

## Access URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- MySQL: localhost:3306

## Database-First Rules

1. All schema changes must be made through Laravel migrations under `server/database/migrations`.
2. Do not rely on ad hoc SQL bootstrap files for active schema changes.
3. Keep seeders idempotent using `updateOrCreate` or `updateOrInsert`.
4. After pulling new code, rerun migrations.

## Daily Commands

```bash
# Start

docker compose up -d

# Pull latest and apply schema changes
git pull
docker compose exec -T backend php artisan migrate --force

# Rerun seed safely (idempotent)
docker compose exec -T backend php artisan db:seed --force --no-interaction

# Logs
docker compose logs -f

# Stop
docker compose down
```

## Reset Local Database

Use this only when you intentionally want a clean local DB:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
```

## Seeded Default Accounts

The following values come from `.env`:

- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_TENANT_EMAIL`
- `DEFAULT_TENANT_PASSWORD`

Update these values in `.env` if your team needs different local credentials.

## Troubleshooting

If backend cannot connect to MySQL:

1. Verify containers are healthy: `docker compose ps`
2. Verify DB env in `.env` (`DB_HOST=mysql`, `DB_DATABASE=flatease_db`)
3. Retry migrations: `docker compose exec -T backend php artisan migrate --force`

If you changed env values:

```bash
docker compose down
docker compose up -d --build
```
