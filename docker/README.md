# LMS Docker Configuration Guide

## 📋 Overview

This directory contains the optimized Docker configuration for the LMS (Learning Management System) project. The configuration is designed to eliminate duplication, provide clear separation of concerns, and support multiple development scenarios.

## 🏗️ Architecture

```
docker/
├── environments/           # Environment-specific configurations
│   ├── development/       # Development setups
│   │   ├── .env           # Development environment variables
│   │   ├── full-stack.yml # Web development (Frontend + Backend)
│   │   └── backend-only.yml # API development (Backend only)
│   └── production/        # Production setups  
│       ├── .env           # Production environment variables
│       ├── full-stack.yml # Production web deployment
│       └── backend-only.yml # Production API deployment
├── shared/                # Reusable configuration templates
│   ├── database.yml       # PostgreSQL configurations
│   ├── cache.yml          # Redis configurations
│   └── networks.yml       # Network definitions
├── scripts/               # Automation scripts
│   ├── start-web-dev.ps1  # Start full stack development
│   ├── start-api-dev.ps1  # Start API-only development
│   └── cleanup.ps1        # Docker cleanup utility
└── README.md             # This documentation
```

## 🚀 Quick Start

### For Web Development (React + Backend)
```powershell
# Start full stack with hot reload
.\docker\scripts\start-web-dev.ps1

# With rebuild
.\docker\scripts\start-web-dev.ps1 -Build

# View logs
.\docker\scripts\start-web-dev.ps1 -Logs

# Stop services
.\docker\scripts\start-web-dev.ps1 -Down
```

### For Mobile/API Development (Backend Only)
```powershell
# Start API services only
.\docker\scripts\start-api-dev.ps1

# With rebuild
.\docker\scripts\start-api-dev.ps1 -Build

# View logs  
.\docker\scripts\start-api-dev.ps1 -Logs

# Stop services
.\docker\scripts\start-api-dev.ps1 -Down
```

## 🎯 Use Cases

### 🌐 Full Stack Development
**When to use**: Developing React frontend alongside backend API

**What's included**:
- ✅ PostgreSQL database
- ✅ Redis cache  
- ✅ Backend API with hot reload
- ✅ React frontend with hot reload

**Access points**:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api-docs
- Database: localhost:5432
- Redis: localhost:6379

### 📱 Backend-Only Development  
**When to use**: Developing mobile apps, external integrations, or microservices

**What's included**:
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Backend API with hot reload  
- ❌ No frontend (saves resources)

**Mobile endpoints**:
- Local development: http://localhost:3000/api
- Android Emulator: http://10.0.2.2:3000/api
- iOS Simulator: http://localhost:3000/api
- Physical device: http://[YOUR-IP]:3000/api

## 🧪 `npm run dev:test` with Host PostgreSQL

This setup reuses the Windows-host PostgreSQL instance (the same one that DBeaver connects to on `localhost:5432`) so that backend containers operate on production-like data without exporting dumps.

### Prerequisites on Windows host

1. **Allow PostgreSQL to listen on the Docker network interface**
   - Edit `postgresql.conf` (default: `C:\Program Files\PostgreSQL\<version>\data\postgresql.conf`)
   - Set `listen_addresses = '*'`
2. **Grant access to the Docker subnet**
   - Edit `pg_hba.conf` in the same directory
   - Add a rule that matches your Docker bridge (example for `172.22.0.0/16`):
     ```
     host all all 172.22.0.0/16 md5
     ```
   - When unsure of the subnet, run `docker network inspect lms-test-network` after the first compose up; you can temporarily use `172.0.0.0/8 md5` while testing.
3. **Restart PostgreSQL**
   ```powershell
   Restart-Service -Name postgresql-x64-15
   ```
   (Replace the service name according to the version installed.)
4. **Open Windows Firewall for port 5432** if it is not already exposed:
   ```powershell
   New-NetFirewallRule -DisplayName "PostgreSQL 5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
   ```

### Starting the environment

```powershell
npm run dev:test
```

Services launched:
- `lms-backend-test`: connects to the host DB via `host.docker.internal`
- `lms-redis-test`: reuses the development Redis volume
- `lms-frontend-test`: points to the test backend on port 3000

### Customizing connection targets

Expose different host endpoints by setting these environment variables before running the script:

```powershell
$env:HOST_POSTGRES_HOST = "172.22.0.1"   # Custom gateway/IP
$env:HOST_POSTGRES_PORT = "5432"
$env:HOST_POSTGRES_DB = "lms_db"
$env:HOST_POSTGRES_USER = "lms_user"
$env:HOST_POSTGRES_PASSWORD = "123456"
npm run dev:test
```

> Tip: use `docker compose -p lms-test -f docker/environments/development/test-e2e.yml logs backend-test` if the backend reports `ECONNREFUSED`.

## ⚙️ Configuration

### Environment Variables

All configurations are centralized in environment files:

**Development**: `docker/environments/development/.env`
```env
# Database
POSTGRES_DB=lms_db
POSTGRES_USER=lms_user  
POSTGRES_PASSWORD=123456
POSTGRES_PORT=5432

# Cache
REDIS_PORT=6379

# Backend
BACKEND_PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Frontend (Full Stack only)
FRONTEND_PORT=3001
```

**Production**: `docker/environments/production/.env`
```env
# Use environment variables or CI/CD secrets for sensitive data
POSTGRES_PASSWORD_PROD=${POSTGRES_PASSWORD_PROD}
JWT_SECRET_PROD=${JWT_SECRET_PROD}
FRONTEND_URL=${FRONTEND_URL}
```

### Port Management

The configuration uses consistent ports across environments:

| Service    | Development | Production | Purpose |
|------------|-------------|------------|---------|
| PostgreSQL | 5432       | 5432       | Database |  
| Redis      | 6379       | 6379       | Cache |
| Backend    | 3000       | 3000       | API Server |
| Frontend   | 3001       | 80         | Web UI |

### Container Naming Convention

Containers follow a clear naming pattern to avoid conflicts:

```
lms_[service]_[stack-type]_[environment]

Examples:
- lms_postgres_fullstack_dev
- lms_redis_api_dev  
- lms_backend_fullstack_prod
```

### Volume Naming Convention

Volumes are named to indicate their purpose and prevent conflicts:

```
lms_[service]_[stack-type]_[environment]_data

Examples:
- lms_postgres_fullstack_dev_data
- lms_redis_api_prod_data
```

## 🔧 Advanced Usage

### Manual Docker Compose Commands

If you prefer manual control:

```powershell
# Full stack development
docker-compose -f docker/environments/development/full-stack.yml up -d

# API only development  
docker-compose -f docker/environments/development/backend-only.yml up -d

# Production full stack
docker-compose -f docker/environments/production/full-stack.yml up -d

# Production API only
docker-compose -f docker/environments/production/backend-only.yml up -d
```

### Custom Environment Variables

Override default values by setting environment variables:

```powershell
# Custom ports
$env:BACKEND_PORT = "3001"
$env:FRONTEND_PORT = "3002"
.\docker\scripts\start-web-dev.ps1

# Custom database
$env:POSTGRES_DB = "my_custom_db"
$env:POSTGRES_USER = "custom_user"
.\docker\scripts\start-api-dev.ps1
```

### Building Specific Services

```powershell
# Build only backend
docker-compose -f docker/environments/development/full-stack.yml build backend

# Build only frontend  
docker-compose -f docker/environments/development/full-stack.yml build frontend
```

## 🧹 Maintenance

### Cleanup Docker Resources

Use the cleanup script to manage Docker resources:

```powershell
# Interactive cleanup (asks for confirmation)
.\docker\scripts\cleanup.ps1 -All

# Clean only volumes (removes all data!)
.\docker\scripts\cleanup.ps1 -Volumes -Force

# Clean containers and networks
.\docker\scripts\cleanup.ps1 -Containers -Networks
```

### Viewing Logs

```powershell
# All services
.\docker\scripts\start-web-dev.ps1 -Logs

# Specific service  
.\docker\scripts\start-web-dev.ps1 -Logs -Service backend

# Follow logs in real-time
docker-compose -f docker/environments/development/full-stack.yml logs -f backend
```

### Health Checks

All services include health checks:

```powershell
# Check service health
docker-compose -f docker/environments/development/full-stack.yml ps

# Manual health check
curl http://localhost:3000/health
```

## 📱 Mobile Development Guide

### Flutter Development

1. Start API services:
   ```powershell
   .\docker\scripts\start-api-dev.ps1
   ```

2. Use appropriate endpoint in your Flutter app:
   ```dart
   // For Android Emulator
   const String apiUrl = 'http://10.0.2.2:3000/api';
   
   // For iOS Simulator  
   const String apiUrl = 'http://localhost:3000/api';
   
   // For Physical Device (replace with your IP)
   const String apiUrl = 'http://192.168.1.100:3000/api';
   ```

### React Native Development

1. Start API services:
   ```powershell
   .\docker\scripts\start-api-dev.ps1
   ```

2. Configure your API base URL:
   ```javascript
   // For development
   const API_BASE_URL = Platform.select({
     ios: 'http://localhost:3000/api',
     android: 'http://10.0.2.2:3000/api'
   });
   ```

## 🚨 Troubleshooting

### Port Conflicts

If you encounter port conflicts:

1. Stop conflicting services:
   ```powershell
   .\docker\scripts\start-web-dev.ps1 -Down
   ```

2. Check what's using the port:
   ```powershell
   netstat -an | findstr :3000
   ```

3. Use custom ports:
   ```powershell
   $env:BACKEND_PORT = "3001"
   .\docker\scripts\start-api-dev.ps1
   ```

### Database Connection Issues

1. Check database health:
   ```powershell
   docker-compose -f docker/environments/development/backend-only.yml ps
   ```

2. View database logs:
   ```powershell
   .\docker\scripts\start-api-dev.ps1 -Logs -Service postgres
   ```

3. Connect to database directly:
   ```powershell
   docker exec -it lms_postgres_api_dev psql -U lms_user -d lms_db
   ```

### Build Failures

1. Clean and rebuild:
   ```powershell
   .\docker\scripts\cleanup.ps1 -Images -Force
   .\docker\scripts\start-web-dev.ps1 -Build
   ```

2. Check build context:
   ```powershell
   # Ensure you're in the project root
   Get-Location
   # Should show: h:\DACN
   ```

### Memory Issues

1. Check Docker resource usage:
   ```powershell
   docker system df
   ```

2. Clean up unused resources:
   ```powershell
   .\docker\scripts\cleanup.ps1 -All
   ```

## 🔒 Security Considerations

### Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| JWT Secret | Fixed (for convenience) | Environment variable |
| CORS Origin | `*` (allow all) | Specific domains |
| Rate Limiting | Disabled | Enabled |
| Log Level | Debug | Info/Warn |
| Database Password | Fixed | Environment variable |

### Production Deployment

For production deployment:

1. Set required environment variables:
   ```bash
   export POSTGRES_PASSWORD_PROD="secure_password"
   export JWT_SECRET_PROD="very_long_random_string"  
   export FRONTEND_URL="https://yourdomain.com"
   ```

2. Use production configurations:
   ```powershell
   docker-compose -f docker/environments/production/full-stack.yml up -d
   ```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 💡 Tips & Best Practices

1. **Always use scripts**: They handle environment setup and provide helpful output
2. **Check logs regularly**: Use `-Logs` flag to monitor service health  
3. **Clean up regularly**: Use cleanup script to prevent disk space issues
4. **Use specific services**: Target specific services for logs and rebuilds
5. **Environment isolation**: Different environments use separate volumes and networks
6. **Port consistency**: Stick to the standard port mapping for predictability

## 🆘 Support

If you encounter issues:

1. Check this documentation first
2. Use the troubleshooting section  
3. View service logs for specific errors
4. Clean and rebuild if configuration issues persist
5. Consult the team for environment-specific problems