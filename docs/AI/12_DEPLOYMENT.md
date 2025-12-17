# 🚀 HƯỚNG DẪN TRIỂN KHAI PRODUCTION

**Tài liệu:** 12 - Deployment  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P0 (Thiết yếu)

---

## 📖 TỔNG QUAN

Hướng dẫn này cung cấp các bước triển khai hệ thống AI LMS lên production, bao gồm containerization, orchestration, scaling, và monitoring.

### Mục tiêu
- ✅ Docker containers cho tất cả services
- ✅ Kubernetes (hoặc Docker Compose) orchestration
- ✅ CI/CD pipeline với GitHub Actions
- ✅ Zero-downtime deployment
- ✅ Auto-scaling & load balancing
- ✅ Monitoring & alerting

---

## 🐳 BƯỚC 1: CONTAINERIZATION

### 1.1 Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/main.js"]
```

### 1.2 Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**File:** `frontend/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;

  gzip on;
  gzip_types text/plain text/css text/xml text/javascript 
             application/x-javascript application/xml+rss 
             application/json application/javascript;

  include /etc/nginx/conf.d/*.conf;
}
```

**File:** `frontend/default.conf`

```nginx
upstream backend {
  server backend:3000;
}

server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html index.htm;

  # Gzip
  gzip on;
  gzip_min_length 1000;

  # API proxy
  location /api/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # WebSocket
  location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 1.3 Build Docker images

```bash
# Backend
cd backend
docker build -t lms-ai-backend:1.0 .
docker tag lms-ai-backend:1.0 registry.example.com/lms-ai-backend:1.0
docker push registry.example.com/lms-ai-backend:1.0

# Frontend
cd ../frontend
docker build -t lms-ai-frontend:1.0 .
docker tag lms-ai-frontend:1.0 registry.example.com/lms-ai-frontend:1.0
docker push registry.example.com/lms-ai-frontend:1.0
```

---

## 🐙 BƯỚC 2: ORCHESTRATION (Docker Compose)

**File:** `docker-compose.prod.yml`

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: lms-ai-db
    environment:
      POSTGRES_DB: lms_ai
      POSTGRES_USER: lms_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_admin"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - lms-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: lms-ai-redis
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - lms-network
    restart: unless-stopped

  # ProxyPal (AI Router)
  proxypal:
    image: proxypal/proxypal:latest
    container_name: lms-ai-proxypal
    environment:
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      QWEN_API_KEY: ${QWEN_API_KEY}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/2
      LOG_LEVEL: ${LOG_LEVEL}
    volumes:
      - ./proxypal/config:/root/.proxypal/config
      - proxypal_logs:/root/.proxypal/logs
    ports:
      - "8888:8888"
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - lms-network
    restart: unless-stopped

  # Backend API
  backend:
    image: registry.example.com/lms-ai-backend:1.0
    container_name: lms-ai-backend
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: lms_ai
      DB_USER: lms_admin
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      PROXYPAL_URL: http://proxypal:8888
      GROQ_API_KEY: ${GROQ_API_KEY}
      GOOGLE_AI_KEY: ${GOOGLE_AI_KEY}
      MEGALLM_ACCOUNT1_KEY: ${MEGALLM_ACCOUNT1_KEY}
      MEGALLM_ACCOUNT2_KEY: ${MEGALLM_ACCOUNT2_KEY}
      JWT_SECRET: ${JWT_SECRET}
      SENTRY_DSN: ${SENTRY_DSN}
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
      proxypal:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - lms-network
    restart: unless-stopped
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s

  # Frontend (Nginx)
  frontend:
    image: registry.example.com/lms-ai-frontend:1.0
    container_name: lms-ai-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - lms-network
    restart: unless-stopped

networks:
  lms-network:
    driver: bridge

volumes:
  db_data:
  redis_data:
  proxypal_logs:
```

### 1.4 Deploy Docker Compose

```bash
# Load environment
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Verify health
curl http://localhost:3000/health
curl http://localhost/health
```

---

## ☸️ BƯỚC 3: KUBERNETES DEPLOYMENT (Optional)

### 3.1 Kubernetes Manifests

**File:** `k8s/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lms-ai-backend
  labels:
    app: lms-ai-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: lms-ai-backend
  template:
    metadata:
      labels:
        app: lms-ai-backend
    spec:
      containers:
      - name: backend
        image: registry.example.com/lms-ai-backend:1.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DB_HOST
          value: postgres-service
        - name: REDIS_HOST
          value: redis-service
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-credentials
              key: groq-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1024Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: lms-ai-backend-service
spec:
  type: LoadBalancer
  selector:
    app: lms-ai-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

### 3.2 Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace lms-ai

# Create secrets
kubectl create secret generic ai-credentials \
  --from-literal=groq-key=$GROQ_API_KEY \
  -n lms-ai

# Apply manifests
kubectl apply -f k8s/ -n lms-ai

# Check deployment
kubectl get pods -n lms-ai
kubectl logs -f deployment/lms-ai-backend -n lms-ai

# Scale
kubectl scale deployment lms-ai-backend --replicas=5 -n lms-ai
```

---

## 🔄 BƯỚC 4: CI/CD PIPELINE

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ secrets.REGISTRY_URL }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ secrets.REGISTRY_URL }}/lms-ai-backend:${{ github.sha }}
        cache-from: type=registry,ref=${{ secrets.REGISTRY_URL }}/lms-ai-backend:buildcache
        cache-to: type=registry,ref=${{ secrets.REGISTRY_URL }}/lms-ai-backend:buildcache,mode=max

    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: ${{ secrets.REGISTRY_URL }}/lms-ai-frontend:${{ github.sha }}

    - name: Deploy to production
      run: |
        kubectl set image deployment/lms-ai-backend \
          backend=${{ secrets.REGISTRY_URL }}/lms-ai-backend:${{ github.sha }} \
          -n lms-ai
        kubectl rollout status deployment/lms-ai-backend -n lms-ai

    - name: Run smoke tests
      run: |
        npm run test:smoke
```

---

## 📊 BƯỚC 5: MONITORING & ALERTING

### 5.1 Prometheus + Grafana

**File:** `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'lms-ai-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'proxypal'
    static_configs:
      - targets: ['proxypal:8888']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alert_rules.yml'
```

**File:** `monitoring/alert_rules.yml`

```yaml
groups:
  - name: lms_ai_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(ai_errors_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: HighLatency
        expr: histogram_quantile(0.95, ai_request_duration_seconds) > 5
        for: 5m
        annotations:
          summary: "High latency detected"

      - alert: BudgetExceeded
        expr: ai_monthly_cost_usd > 150
        annotations:
          summary: "AI budget exceeded"

      - alert: ServiceDown
        expr: up{job="lms-ai-backend"} == 0
        for: 1m
        annotations:
          summary: "Service is down"
```

### 5.2 Logs với ELK Stack

**File:** `docker-compose.prod.yml` (add to services)

```yaml
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    networks:
      - lms-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - lms-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash/config:/usr/share/logstash/config
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch
    networks:
      - lms-network
```

---

## 🔐 BƯỚC 6: SECURITY HARDENING

### 6.1 SSL/TLS Certificate

```bash
# Generate self-signed (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Let's Encrypt (production)
certbot certonly --standalone -d yourdomain.com
```

### 6.2 Firewall & Network Policies

```bash
# Allow ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp (backend only on private network)
sudo ufw allow 5432/tcp (database only on private network)

# Enable UFW
sudo ufw enable
```

### 6.3 Secrets Management

```bash
# Using Kubernetes secrets
kubectl create secret generic ai-keys \
  --from-literal=groq-api-key=$GROQ_API_KEY \
  --from-literal=megallm-key=$MEGALLM_KEY \
  -n lms-ai

# Or using HashiCorp Vault
vault kv put secret/lms-ai/groq api_key=$GROQ_API_KEY
```

---

## 📈 BƯỚC 7: SCALING STRATEGY

### 7.1 Horizontal Scaling

```yaml
# Auto-scaling based on CPU
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lms-ai-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lms-ai-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 7.2 Database Connection Pooling

```bash
# PgBouncer config
[databases]
lms_ai = host=postgres port=5432 dbname=lms_ai user=lms_admin password=password

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
```

---

## ✅ BƯỚC 8: DEPLOYMENT CHECKLIST

```bash
# Pre-deployment checks
□ Database migrations tested
□ Environment variables configured
□ API keys secure and rotated
□ SSL certificates valid
□ Backup strategy implemented
□ Monitoring & alerts configured
□ Disaster recovery plan tested
□ Load testing passed
□ Security audit completed

# Deployment steps
□ Create release branch
□ Build Docker images
□ Push to registry
□ Update Kubernetes manifests
□ Deploy to staging
□ Run smoke tests
□ Deploy to production
□ Monitor logs and metrics
□ Verify all services healthy

# Post-deployment
□ Check all endpoints responding
□ Verify database connectivity
□ Test AI features (quiz, tutor, grader)
□ Monitor error rates
□ Check resource utilization
□ Backup database
□ Document deployment
```

---

## 🚨 ROLLBACK PROCEDURE

```bash
# Quick rollback (Kubernetes)
kubectl rollout undo deployment/lms-ai-backend -n lms-ai

# Check rollout history
kubectl rollout history deployment/lms-ai-backend -n lms-ai

# Rollback to specific revision
kubectl rollout undo deployment/lms-ai-backend --to-revision=2 -n lms-ai
```

---

## 📚 LIÊN QUAN

- **Trước:** [11_CONFIG_GUIDE.md](11_CONFIG_GUIDE.md)
- **Toàn bộ:** [00_INDEX.md](00_INDEX.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
