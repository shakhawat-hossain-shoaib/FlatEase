#!/bin/bash
set -euo pipefail

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_DATABASE:-flatease_db}"
DB_USER="${DB_USERNAME:-root}"
DB_PASS="${DB_PASSWORD:-}"
MYSQL_ROOT_PASS="${MYSQL_ROOT_PASSWORD:-}"
MYSQL_APP_USER="${MYSQL_USER:-}"
MYSQL_APP_PASS="${MYSQL_PASSWORD:-}"
MIGRATIONS_DIR="${1:-/var/www/database/migrations/sql}"
ORDER_FILE="${ORDER_FILE:-$MIGRATIONS_DIR/.migration-order}"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migration directory not found: $MIGRATIONS_DIR"
  exit 1
fi

build_mysql_args() {
  local user="$1"
  local pass="$2"
  local args=("-h${DB_HOST}" "-P${DB_PORT}" "-u${user}" "--default-character-set=utf8mb4" "--skip-ssl")
  if [ -n "$pass" ]; then
    args+=("-p${pass}")
  fi
  printf '%s\n' "${args[@]}"
}

can_connect() {
  local user="$1"
  local pass="$2"
  mapfile -t test_args < <(build_mysql_args "$user" "$pass")
  mysql "${test_args[@]}" -Nse "SELECT 1" >/dev/null 2>&1
}

# Prefer root credentials (best for CREATE DATABASE), then app/env credentials.
if can_connect "root" "$MYSQL_ROOT_PASS"; then
  DB_USER="root"
  DB_PASS="$MYSQL_ROOT_PASS"
elif can_connect "$DB_USER" "$DB_PASS"; then
  :
elif [ -n "$MYSQL_APP_USER" ] && can_connect "$MYSQL_APP_USER" "$MYSQL_APP_PASS"; then
  DB_USER="$MYSQL_APP_USER"
  DB_PASS="$MYSQL_APP_PASS"
else
  echo "Unable to connect to MySQL with available credentials (DB_* / MYSQL_*)."
  exit 1
fi

mapfile -t MYSQL_ARGS < <(build_mysql_args "$DB_USER" "$DB_PASS")

mysql "${MYSQL_ARGS[@]}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

mysql "${MYSQL_ARGS[@]}" "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_sql_migrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  migration VARCHAR(255) NOT NULL,
  checksum CHAR(64) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY schema_sql_migrations_migration_unique (migration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

if [ -f "$ORDER_FILE" ]; then
  mapfile -t migration_files < <(grep -vE '^[[:space:]]*($|#)' "$ORDER_FILE" | while IFS= read -r migration_name; do
    printf '%s/%s\n' "$MIGRATIONS_DIR" "$migration_name"
  done)
else
  mapfile -t migration_files < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | sort)
fi

for file in "${migration_files[@]}"; do
  [ -e "$file" ] || continue

  migration="$(basename "$file")"
  checksum="$(sha256sum "$file" | awk '{print $1}')"

  existing_checksum="$(mysql "${MYSQL_ARGS[@]}" "$DB_NAME" -Nse "SELECT checksum FROM schema_sql_migrations WHERE checksum='${checksum}' LIMIT 1;")"

  if [ -n "$existing_checksum" ]; then
    echo "Skipping already applied migration: $migration"
    continue
  fi

  echo "Applying migration: $migration"
  mysql "${MYSQL_ARGS[@]}" "$DB_NAME" < "$file"

  mysql "${MYSQL_ARGS[@]}" "$DB_NAME" -e "INSERT INTO schema_sql_migrations (migration, checksum) VALUES ('${migration}', '${checksum}');"
done

echo "SQL migrations completed successfully."
