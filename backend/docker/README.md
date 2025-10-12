# Docker Configuration for LMS Backend

## Overview
This directory contains Docker configuration files for the LMS Backend application.

## Files

### `Dockerfile`
- Multi-stage build for production
- Node.js 18 Alpine base image
- Non-root user for security
- Health check included
- Optimized for production deployment

### `docker-compose.yml`
- Production configuration
- Includes PostgreSQL, Redis, and Backend services
- Health checks and dependencies
- Volume persistence for data

### `docker-compose.dev.yml`
- Development configuration
- Only includes PostgreSQL and Redis
- Backend runs locally for development
- Separate volumes for dev data

### `.dockerignore`
- Excludes unnecessary files from Docker build context
- Reduces build time and image size

## Usage

### Development
```bash
# Start only database services
docker-compose -f docker/docker-compose.dev.yml up -d

# Run backend locally
npm run dev
```

### Production
```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d --build

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Database Management
```bash
# Connect to PostgreSQL
docker exec -it lms_postgres psql -U lms_user -d lms_db

# View PostgreSQL logs
docker logs lms_postgres

# Backup database
docker exec lms_postgres pg_dump -U lms_user lms_db > backup.sql
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment (development/production)

### Optional
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)

## Health Checks

### Backend
- Endpoint: `http://localhost:3000/health`
- Interval: 30s
- Timeout: 3s
- Retries: 3

### PostgreSQL
- Command: `pg_isready -U lms_user -d lms_db`
- Interval: 30s
- Timeout: 10s
- Retries: 5

### Redis
- Command: `redis-cli ping`
- Interval: 30s
- Timeout: 10s
- Retries: 5

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Check if ports 3000, 5432, 6379 are available
   - Use `docker ps` to see running containers

2. **Database connection issues**
   - Ensure PostgreSQL container is healthy
   - Check database credentials
   - Verify network connectivity

3. **Build failures**
   - Check Dockerfile syntax
   - Ensure all dependencies are listed in package.json
   - Verify build context includes necessary files

### Logs
```bash
# View all logs
docker-compose -f docker/docker-compose.yml logs

# View specific service logs
docker-compose -f docker/docker-compose.yml logs backend
docker-compose -f docker/docker-compose.yml logs postgres
docker-compose -f docker/docker-compose.yml logs redis
```

## Security Notes

- Non-root user in container
- Environment variables for sensitive data
- Health checks for monitoring
- Volume persistence for data
- Network isolation between services
