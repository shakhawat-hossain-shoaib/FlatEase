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

if [ -d client ]; then
  client_marker="client/node_modules/.frontend-build.hash"
  client_hash="$(find client -type f ! -path 'client/node_modules/*' ! -path 'client/dist/*' -exec sha256sum {} + | sort -k2 | sha256sum | awk '{print $1}')"

  if [ ! -f "$client_marker" ] || [ "$(cat "$client_marker")" != "$client_hash" ] || [ ! -f public/index.html ]; then
    echo "Building frontend bundle..."
    cd client
    npm ci
    npm run build
    cd /var/www/html

    mkdir -p public
    rm -rf public/assets public/index.html public/vite.svg
    cp -r client/dist/. public/
    printf '%s\n' "$client_hash" > "$client_marker"
  fi
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache || true

exec "$@"