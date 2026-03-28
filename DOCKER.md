# FlatEase Docker Development Guide

This document defines the team standard for local development.

## Goal

Provide one reproducible local setup for every developer using Docker, MySQL, Laravel migrations, and idempotent seeders.

## Team Workflow

1. Clone repository.
2. Switch to the active team branch.
3. Copy environment template.
4. Start containers.
5. Run migrations and seeders.
6. Start coding.

## Prerequisites

- Docker 20.10+
- Docker Compose v2+

## First-Time Setup

### Linux / macOS

```bash
git clone --branch Dockerizing <your-repository-url>
cd FlatEase
cp .env.example .env
docker compose up -d --build
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
```

### Windows (PowerShell)

```powershell
git clone --branch Dockerizing <your-repository-url>
cd FlatEase
Copy-Item .env.example .env
docker compose up -d --build
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
```

If you already cloned before this setup was introduced:

```bash
git fetch --all
git checkout Dockerizing
git pull origin Dockerizing
```

Alternative one-command setup:

```bash
chmod +x docker-init.sh
./docker-init.sh
```

Windows one-command setup:

```powershell
powershell -ExecutionPolicy Bypass -File .\docker-init.ps1
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
git pull origin Dockerizing
docker compose exec -T backend php artisan migrate --force

# Rerun seed safely (idempotent)
docker compose exec -T backend php artisan db:seed --force --no-interaction

# Logs
docker compose logs -f

# Stop
docker compose down
```

## Team-Safe Update Process

Use this when code looks old or mismatched after pulling:

```bash
git fetch --all
git checkout Dockerizing
git pull origin Dockerizing
docker compose down -v --remove-orphans
docker compose build --no-cache --pull
docker compose up -d
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
```

Windows (PowerShell):

```powershell
git fetch --all
git checkout Dockerizing
git pull origin Dockerizing
docker compose down -v --remove-orphans
docker compose build --no-cache --pull
docker compose up -d
docker compose exec -T backend php artisan migrate --seed --force --no-interaction
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
