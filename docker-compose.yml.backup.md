# Docker Compose Configuration Backup

**Backup Date:** October 28, 2025  
**File:** docker-compose.yml  
**Purpose:** Backup before running comprehensive tests

## Original Configuration

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_DB: lms_db
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: 123456
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - lms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_user -d lms_db"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - lms-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: docker/Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://lms_user:123456@postgres:5432/lms_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
      - PORT=3000
      - LOG_LEVEL=info
      - FRONTEND_URL=http://localhost:3001
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./backend/logs:/app/logs
    ports:
      - "3000:3000"
    networks:
      - lms-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Frontend React App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3000/api
      - REACT_APP_WS_URL=http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3001:3000"
    networks:
      - lms-network
    depends_on:
      - backend
    stdin_open: true
    tty: true

volumes:
  postgres_data:
  redis_data:

networks:
  lms-network:
    driver: bridge

# Development override file usage:
# docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Notes

- This is the production docker-compose.yml configuration
- Currently using docker-compose.dev.yml for development testing
- Backend Dockerfile path: `docker/Dockerfile` (points to production Dockerfile)
- Development uses `docker/Dockerfile.dev` with hot reload enabled
- Database and Redis are shared between production and development configs
