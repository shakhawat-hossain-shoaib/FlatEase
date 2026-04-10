# FlatEase Docker Development Guide

This document defines the team standard for local development.

## Goal

Provide one reproducible local setup for every developer using Docker, MySQL, SQL-first migrations, and SQL seed files.

## Team Workflow

1. Clone repository.
2. Copy environment template.
3. Start containers.
4. Run SQL migrations and SQL seeds.
5. Start coding.

## Prerequisites

- Docker 20.10+
- Docker Compose v2+

## First-Time Setup

### Linux / macOS

```bash
git clone <your-repository-url>
cd FlatEase
cp .env.example .env
chmod +x docker-init.sh
./docker-init.sh
```

### Windows (PowerShell)

```powershell
git clone <your-repository-url>
cd FlatEase
Copy-Item .env.example .env
powershell -ExecutionPolicy Bypass -File .\docker-init.ps1
```

If you already cloned before this setup was introduced, just pull the latest changes and rerun the init script:

```bash
git pull
./docker-init.sh
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

If you want the init scripts to sync a specific branch before starting, set `TARGET_BRANCH` first. Otherwise they use whatever branch is already checked out.

## Access URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- MySQL: localhost:3306

## Database-First Rules

1. All schema changes must be made through SQL files under `database/migrations/sql`.
2. One SQL file must exist per migration timestamp.
3. Seeds must be SQL files under `database/seeds/sql`.
4. After pulling new code, rerun SQL migration runner.

## Daily Commands

```bash
# Start

docker compose up -d

# Pull latest and apply schema changes
git pull
docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh

# Rerun seed safely
docker compose exec -T backend bash /var/www/database/seeds/run_sql_seeds.sh

# Logs
docker compose logs -f

# Stop
docker compose down
```

## Team-Safe Update Process

Use this when code looks old or mismatched after pulling:

```bash
git pull
docker compose down -v --remove-orphans
docker compose build --no-cache --pull
docker compose up -d
docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh
docker compose exec -T backend bash /var/www/database/seeds/run_sql_seeds.sh
```

Windows (PowerShell):

```powershell
git pull
docker compose down -v --remove-orphans
docker compose build --no-cache --pull
docker compose up -d
docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh
docker compose exec -T backend bash /var/www/database/seeds/run_sql_seeds.sh
```

## Reset Local Database

Use this only when you intentionally want a clean local DB:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh
docker compose exec -T backend bash /var/www/database/seeds/run_sql_seeds.sh
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
3. Retry SQL migrations: `docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh`

If you changed env values:

```bash
docker compose down
docker compose up -d --build
```
