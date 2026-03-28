# FlatEase Docker Setup

This project is now fully Dockerized with separate services for frontend, backend, and database.

## Architecture

The Docker setup includes three main services:

- **Frontend**: React/Vite application running on port 5173
- **Backend**: Laravel API running on port 8000
- **Database**: MySQL 8.0 running on port 3306

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Getting Started

### 1. Build and Start Services

```bash
# Using the provided script
./docker-init.sh

# Or manually
docker-compose up -d --build
```

### 2. Initialize the Database

```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Seed the database (if seeders exist)
docker-compose exec backend php artisan db:seed
```

### 3. Generate App Key (if needed)

```bash
docker-compose exec backend php artisan key:generate
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MySQL**: localhost:3306

## Configuration

### Environment Variables

The project uses `.env.docker` for Docker-specific configuration. To customize:

1. Copy `.env.docker` to `.env.local.docker`
2. Update the values as needed
3. Start services: `docker-compose --env-file .env.local.docker up -d`

Key environment variables:
- `DB_PASSWORD`: MySQL root password
- `DB_DATABASE`: Database name
- `APP_KEY`: Laravel app key
- `BACKEND_PORT`: Port for backend (default: 8000)
- `FRONTEND_PORT`: Port for frontend (default: 5173)

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Run Commands in Containers

```bash
# Laravel Artisan commands
docker-compose exec backend php artisan [command]

# Database access
docker-compose exec mysql mysql -u root -p flatease_db

# Frontend build
docker-compose exec frontend npm run build
```

### Stop Services

```bash
# Stop and keep volumes
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

## Development Workflow

### Hot Reload Frontend

Frontend changes are automatically reflected due to volume mounts. The Vite dev server will hot-reload.

### Backend Development

Backend files are mounted as volumes for development. Use:

```bash
docker-compose exec backend php artisan tinker
```

### Database Development

Use any MySQL client to connect:

```bash
mysql -h 127.0.0.1 -u flatease -p flatease_db
```

## Troubleshooting

### Port Already in Use

If ports 8000, 5173, or 3306 are already in use:

```bash
# Change ports in .env.docker
BACKEND_PORT=8001
FRONTEND_PORT=5174
DB_PORT=3307

# Then start with custom env file
docker-compose --env-file .env.docker up -d
```

### Container Won't Start

```bash
# Check logs
docker-compose logs [service_name]

# Rebuild the image
docker-compose build --no-cache [service_name]
```

### Database Migration Issues

```bash
# Check database connection
docker-compose exec backend php artisan migrate:status

# Rollback and remigrate
docker-compose exec backend php artisan migrate:reset
docker-compose exec backend php artisan migrate
```

## Production Deployment

For production deployment:

1. Use environment-specific variables in `.env.production.docker`
2. Set `APP_ENV=production` and `APP_DEBUG=false`
3. Use proper secrets management (e.g., Docker Secrets, environment files)
4. Configure proper networking and reverse proxy (Nginx)
5. Set up proper volume management for persistent data
6. Configure health checks and restart policies

## Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Guide](https://laravel.com/docs/8/deployment)
- [Vite Documentation](https://vitejs.dev/)
