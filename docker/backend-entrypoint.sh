#!/usr/bin/env bash

set -euo pipefail

cd /var/www/html

lock_hash=""
if [ -f composer.lock ]; then
  lock_hash="$(sha256sum composer.lock | awk '{print $1}')"
fi

lock_marker="vendor/.composer-lock.hash"

if [ ! -f vendor/autoload.php ] || [ ! -f "$lock_marker" ] || { [ -n "$lock_hash" ] && [ "$(cat "$lock_marker")" != "$lock_hash" ]; }; then
  echo "Installing backend dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
  if [ -n "$lock_hash" ]; then
    mkdir -p vendor
    printf '%s\n' "$lock_hash" > "$lock_marker"
  fi
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache || true

exec "$@"