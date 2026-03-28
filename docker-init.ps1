# FlatEase Docker Initialization Script (Windows PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "FlatEase Docker Setup"
Write-Host "========================"

$targetBranch = if ($env:TARGET_BRANCH) { $env:TARGET_BRANCH } else { "Dockerizing" }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker first."
}

try {
    docker compose version | Out-Null
}
catch {
    Write-Error "Docker Compose is not available. Please install/enable Docker Compose."
}

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Copying .env.example to .env"
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example"
    }
    else {
        Write-Error "Missing .env.example. Please add it first."
    }
}

Write-Host ""
Write-Host "Syncing repository on branch: $targetBranch"
git fetch --all
git checkout $targetBranch
git pull origin $targetBranch

Write-Host ""
Write-Host "Stopping old containers and removing stale volumes..."
docker compose --env-file .env down -v --remove-orphans

Write-Host ""
Write-Host "Building Docker images (fresh build)..."
docker compose --env-file .env build --no-cache --pull

Write-Host ""
Write-Host "Starting services..."
docker compose --env-file .env up -d

Write-Host ""
Write-Host "Services started successfully."
Write-Host ""
Write-Host "Waiting for services to be ready..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Running database migrations..."
docker compose --env-file .env exec -T backend php artisan migrate --seed --force --no-interaction

Write-Host ""
Write-Host "Database setup complete."
Write-Host ""
Write-Host "Application is ready."
Write-Host ""
Write-Host "Access points:"
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Database: localhost:3306"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  - View logs: docker compose logs -f"
Write-Host "  - Stop services: docker compose down"
Write-Host "  - Pull updates: git pull origin $targetBranch and then docker compose --env-file .env exec -T backend php artisan migrate --force"
Write-Host "  - See DOCKER.md for detailed documentation"
