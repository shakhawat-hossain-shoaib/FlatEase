#!/bin/bash
set -euo pipefail

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_DATABASE:-flatease_db}"
DB_USER="${DB_USERNAME:-root}"
DB_PASS="${DB_PASSWORD:-}"
SEEDS_DIR="${1:-/var/www/database/seeds/sql}"

if [ ! -d "$SEEDS_DIR" ]; then
  echo "Seed directory not found: $SEEDS_DIR"
  exit 1
fi

MYSQL_ARGS=("-h${DB_HOST}" "-P${DB_PORT}" "-u${DB_USER}" "--default-character-set=utf8mb4")
if [ -n "$DB_PASS" ]; then
  MYSQL_ARGS+=("-p${DB_PASS}")
fi

MYSQL_ARGS+=("--skip-ssl")
mysql "${MYSQL_ARGS[@]}" "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_sql_seeds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seed_file VARCHAR(255) NOT NULL,
  checksum CHAR(64) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY schema_sql_seeds_seed_file_unique (seed_file)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

for file in "$SEEDS_DIR"/*.sql; do
  [ -e "$file" ] || continue

  seed_file="$(basename "$file")"
  checksum="$(sha256sum "$file" | awk '{print $1}')"

  existing_checksum="$(mysql "${MYSQL_ARGS[@]}" "$DB_NAME" -Nse "SELECT checksum FROM schema_sql_seeds WHERE seed_file='${seed_file}' LIMIT 1;")"

  if [ -n "$existing_checksum" ]; then
    if [ "$existing_checksum" != "$checksum" ]; then
      echo "Checksum mismatch for already-applied seed: $seed_file"
      echo "Recorded: $existing_checksum"
      echo "Current:  $checksum"
      exit 1
    fi
    echo "Skipping already applied seed: $seed_file"
    continue
  fi

  echo "Applying seed: $seed_file"
  mysql "${MYSQL_ARGS[@]}" "$DB_NAME" < "$file"

  mysql "${MYSQL_ARGS[@]}" "$DB_NAME" -e "INSERT INTO schema_sql_seeds (seed_file, checksum) VALUES ('${seed_file}', '${checksum}');"
done

echo "SQL seeds completed successfully."
