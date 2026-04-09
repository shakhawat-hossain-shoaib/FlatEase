#!/bin/bash
set -euo pipefail

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_DATABASE:-flatease_db}"
DB_USER="${DB_USERNAME:-root}"
DB_PASS="${DB_PASSWORD:-}"
MIGRATIONS_DIR="${1:-/var/www/database/migrations/sql}"
ORDER_FILE="${ORDER_FILE:-$MIGRATIONS_DIR/.migration-order}"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migration directory not found: $MIGRATIONS_DIR"
  exit 1
fi

MYSQL_ARGS=("-h${DB_HOST}" "-P${DB_PORT}" "-u${DB_USER}" "--default-character-set=utf8mb4")
if [ -n "$DB_PASS" ]; then
  MYSQL_ARGS+=("-p${DB_PASS}")
fi

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
