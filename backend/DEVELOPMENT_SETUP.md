# 🚀 LMS Backend - Development Setup Guide

## ⚠️ QUAN TRỌNG: Hiểu rõ Architecture

Hiện tại hệ thống có **HAI MÔ HÌNH PHÁT TRIỂN**. Bạn PHẢI chọn một và tuân thủ nhất quán.

---

## 🐳 **Option 1: ALL IN DOCKER** (Recommended)

### **Khi nào dùng:**
- ✅ Muốn môi trường giống production
- ✅ Làm việc nhóm (cùng environment)
- ✅ Không muốn cài PostgreSQL/Redis local
- ✅ Dễ dàng reset/clean environment

### **Cấu trúc:**
```
┌────────────────────────────────────┐
│  Docker Network: lms-network       │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │  Backend Container           │ │
│  │  - Port: 3000                │ │
│  │  - Connects to: postgres:5432│ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  PostgreSQL Container        │ │
│  │  - Port: 5432 (mapped)       │ │
│  │  - Volume: postgres_data     │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  Redis Container             │ │
│  │  - Port: 6379 (mapped)       │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
     ↓ Port Mapping
   localhost:3000 → Backend API
   localhost:5432 → PostgreSQL (for tools/seed)
   localhost:6379 → Redis
```

### **Setup Steps:**

#### 1. **Tạo docker-compose.yml** (nếu chưa có)

```yaml
# h:\DACN\backend\docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: lms-postgres-dev
    environment:
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: lms_db
    ports:
      - "5432:5432"
    volumes:
      - lms_postgres_api_dev_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_user -d lms_db"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - lms-network

  redis:
    image: redis:7-alpine
    container_name: lms-redis-dev
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - lms-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: lms-backend-dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://lms_user:123456@postgres:5432/lms_db
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: lms_db
      DB_USER: lms_user
      DB_PASSWORD: 123456
      REDIS_URL: redis://redis:6379
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - lms-network
    command: npm run dev

volumes:
  lms_postgres_api_dev_data:
    name: lms_postgres_api_dev_data

networks:
  lms-network:
    driver: bridge
```

#### 2. **Tạo .env.docker**

```bash
# .env.docker - Used INSIDE Docker containers
NODE_ENV=development
PORT=3000

# Database - Internal Docker network
DATABASE_URL=postgresql://lms_user:123456@postgres:5432/lms_db
DB_HOST=postgres
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=123456

# Redis - Internal Docker network  
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=nguyensyphuctrankimhuongnguyenthanhloc

# Logging
LOG_LEVEL=debug
```

#### 3. **Tạo .env.local**

```bash
# .env.local - Used for SEED SCRIPTS from host machine
NODE_ENV=development

# Database - Connect to Docker via port mapping
DATABASE_URL=postgresql://lms_user:123456@localhost:5432/lms_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=123456

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=nguyensyphuctrankimhuongnguyenthanhloc
```

#### 4. **Commands**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Seed data (from host, connects via localhost:5432)
npm run seed:docker

# Stop all services
docker-compose down

# RESET EVERYTHING (delete volumes)
docker-compose down -v
docker volume rm lms_postgres_api_dev_data
```

#### 5. **Package.json scripts**

```json
{
  "scripts": {
    "seed:docker": "dotenv -e .env.local -- npx tsx src/scripts/seed-complete-course.ts",
    "seed": "dotenv -e .env.local -- npx tsx src/scripts/seed-all.ts",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:reset": "docker-compose down -v && docker volume rm lms_postgres_api_dev_data || true"
  }
}
```

---

## 💻 **Option 2: LOCAL DEVELOPMENT** (Đơn giản hơn)

### **Khi nào dùng:**
- ✅ Đang develop/debug code liên tục
- ✅ Muốn hot-reload nhanh
- ✅ Quen với local development
- ✅ Không cần môi trường giống production

### **Cấu trúc:**
```
┌────────────────────────────────────┐
│  Host Machine (localhost)          │
├────────────────────────────────────┤
│                                    │
│  Node.js Backend (PORT 3000)       │
│  - Running: npm run dev            │
│  - Hot reload enabled              │
│  - Connects to: localhost:5432     │
│                                    │
│  PostgreSQL (PORT 5432)            │
│  - Native installation OR          │
│  - Docker: postgres:15             │
│  - Data: /var/lib/postgresql/data  │
│                                    │
│  Redis (PORT 6379)                 │
│  - Native installation OR          │
│  - Docker: redis:7                 │
└────────────────────────────────────┘
```

### **Setup Steps:**

#### 1. **Start ONLY database services**

```yaml
# docker-compose.services-only.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: lms-postgres-local
    environment:
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: lms_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_local_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_user -d lms_db"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: lms-redis-local
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_local_data:
    name: postgres_local_data
```

#### 2. **Use single .env file**

```bash
# .env - Single source of truth
NODE_ENV=development
PORT=3000

# Database - localhost for both backend and seed scripts
DATABASE_URL=postgresql://lms_user:123456@localhost:5432/lms_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=123456

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=nguyensyphuctrankimhuongnguyenthanhloc

# Logging
LOG_LEVEL=debug
```

#### 3. **Commands**

```bash
# Start database services only
docker-compose -f docker-compose.services-only.yml up -d

# Run backend locally (hot-reload enabled)
npm run dev

# Seed data
npm run seed

# Stop database services
docker-compose -f docker-compose.services-only.yml down
```

#### 4. **Package.json scripts**

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "seed": "npx tsx src/scripts/seed-complete-course.ts",
    "db:start": "docker-compose -f docker-compose.services-only.yml up -d",
    "db:stop": "docker-compose -f docker-compose.services-only.yml down",
    "db:reset": "docker-compose -f docker-compose.services-only.yml down -v"
  }
}
```

---

## 🎯 **RECOMMENDATION: Chọn gì?**

### **Đang Development hàng ngày?** → **Option 2 (Local)**
- Fast iteration
- Easy debugging
- Familiar workflow

### **Testing Integration / Team work?** → **Option 1 (Docker)**
- Production-like environment
- Consistent across team
- Easy to share/reproduce issues

---

## ⚡ **QUICK START (Recommended)**

### **Step 1: Chọn môi hình**
```bash
# Option 1: Full Docker
cp .env.docker .env
docker-compose up -d

# Option 2: Local Development
cp .env.local .env
docker-compose -f docker-compose.services-only.yml up -d
npm run dev
```

### **Step 2: Seed data**
```bash
# Same command for both options!
npm run seed
```

### **Step 3: Test API**
```bash
curl http://localhost:3000/api/courses
```

---

## 🐛 **DEBUGGING**

### **Kiểm tra kết nối database**

```bash
# Check which database you're connected to
npm run db:check

# Script: src/scripts/check-db-connection.ts
```

### **Verify seed data**

```bash
# Docker database
docker exec lms-postgres-dev psql -U lms_user -d lms_db -c "SELECT COUNT(*) FROM courses;"

# Local database (if using Option 2)
psql -U lms_user -h localhost -d lms_db -c "SELECT COUNT(*) FROM courses;"
```

### **Clear cache**

```bash
# Redis
docker exec lms-redis-dev redis-cli FLUSHALL

# Backend (if in Docker)
docker restart lms-backend-dev
```

---

## 📝 **BEST PRACTICES**

1. ✅ **Stick to ONE option** - Đừng mix 2 môi hình
2. ✅ **Use named volumes** - Dễ backup/restore
3. ✅ **Document your choice** - Team cần biết bạn đang dùng gì
4. ✅ **Version control .env.example** - Không commit .env thật
5. ✅ **Health checks** - Đảm bảo services ready trước khi seed

---

## 🔥 **COMMON MISTAKES**

❌ **Seed vào localhost nhưng backend trong Docker**
❌ **Không biết mình đang dùng Option 1 hay 2**
❌ **Forget to restart backend after schema changes**
❌ **Mix production và development configs**

---

## 📞 **Need Help?**

Nếu gặp vấn đề:
1. Chạy `npm run db:check` để xem đang kết nối đến đâu
2. Chạy `docker ps` để xem services nào đang chạy
3. Check logs: `docker logs lms-backend-dev`
4. Liên hệ team lead

---

**Last updated:** November 5, 2025
**Maintained by:** Backend Team
