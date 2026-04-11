#!/usr/bin/env bash

set -euo pipefail

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_PATH="${DEPLOY_PATH:-$(pwd)}"
REPO_URL="${REPO_URL:-}"

cd "$DEPLOY_PATH"

if [ -f .env.example ]; then
  cp -f .env.example .env
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi
git fetch --prune origin "$DEPLOY_BRANCH"
git checkout -B "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

docker compose down --remove-orphans || true
docker compose up -d --build --remove-orphans --force-recreate

docker compose exec -T mysql sh -lc '
  set -e
  DB_NAME="${MYSQL_DATABASE:-${DB_DATABASE:-flatease_db}}"
  APP_USER="${MYSQL_USER:-${DB_USERNAME:-flatease}}"
  APP_PASS="${MYSQL_PASSWORD:-${DB_PASSWORD:-Root@1234}}"
  ROOT_PASS="${MYSQL_ROOT_PASSWORD:-Root@1234}"

  mysql -uroot -p"$ROOT_PASS" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '\''$APP_USER'\''@'\''%'\'' IDENTIFIED BY '\''$APP_PASS'\'';
ALTER USER '\''$APP_USER'\''@'\''%'\'' IDENTIFIED BY '\''$APP_PASS'\'';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '\''$APP_USER'\''@'\''%'\'';
FLUSH PRIVILEGES;
SQL
'

docker compose exec -T backend bash /var/www/database/migrations/run_sql_migrations.sh
docker compose exec -T backend php artisan optimize:clear