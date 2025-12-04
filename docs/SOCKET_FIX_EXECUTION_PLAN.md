# 🔧 KẾ HOẠCH SỬA LỖI SOCKET/REALTIME - EXECUTION PLAN

> **Ngày tạo**: 2025-12-05  
> **Trạng thái**: ✅ **ĐÃ HOÀN THÀNH**  
> **Mục tiêu**: Sửa các vấn đề Socket.IO và Realtime trong dự án LMS  
> **Ưu tiên**: Sửa vấn đề Docker/Nginx TRƯỚC, vấn đề port frontend tính SAU

---

## 📋 KẾT QUẢ THỰC HIỆN

### ✅ Phase 1: Sửa nginx.conf - **HOÀN THÀNH**
- Thêm proxy `/api` đến backend
- Thêm proxy `/socket.io` với WebSocket upgrade
- Thêm proxy `/health` cho debugging
- Thêm upstream với keepalive

### ✅ Phase 2: Sửa Docker Compose Dependencies - **HOÀN THÀNH**
- Đổi `frontend-dev.depends_on` từ `service_started` → `service_healthy`

### ✅ Phase 3: Tối ưu Healthcheck - **HOÀN THÀNH**
- `full-stack.yml`: Thêm healthcheck cho backend
- `backend-only.yml`: Tối ưu timing (interval: 10s, start_period: 30s)
- Cập nhật CORS để bao gồm port 5174

### ⏭️ Phase 4: Fix Race Condition - **KHÔNG CẦN THIẾT**
- Code đã được cập nhật trong phiên bản hiện tại

### ✅ Phase 5: Verify - **THÀNH CÔNG**
```
curl http://localhost:3001/health → ✅ OK
curl http://localhost:3001/api/v1.3.0/courses → ✅ OK
curl http://localhost:3001/socket.io/?EIO=4&transport=polling → ✅ OK
```

---

## 📝 FILES ĐÃ SỬA

### Các vấn đề cần sửa (theo thứ tự ưu tiên):

| # | Vấn đề | Mức độ | File cần sửa |
|---|--------|--------|--------------|
| 1 | Nginx không proxy `/api` và `/socket.io` | 🔴 CRITICAL | `frontend/nginx.conf` |
| 2 | Frontend depends_on chỉ `service_started` | 🟡 HIGH | `docker/environments/development/full-stack.yml` |
| 3 | Backend healthcheck quá chậm | 🟡 MEDIUM | `docker/environments/development/*.yml` |
| 4 | Race condition trong notifications.gateway.ts | 🟢 LOW | `backend/src/modules/notifications/notifications.gateway.ts` |

---

## 🎯 PHASE 1: SỬA NGINX PROXY (CRITICAL)

### Mục tiêu:
Cập nhật `frontend/nginx.conf` để proxy `/api` và `/socket.io` đến backend container.

### File cần sửa:
`frontend/nginx.conf`

### Nội dung mới:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    
    # WebSocket upgrade mapping
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    # Backend upstream with keepalive
    upstream backend {
        server lms-backend-dev:3000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # API Proxy
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts for API
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # Buffer settings
            proxy_buffering off;
            proxy_request_buffering off;
        }
        
        # WebSocket Proxy (Socket.IO)
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket specific timeouts (long-lived connections)
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
            
            # Disable buffering for real-time
            proxy_buffering off;
        }
        
        # Health check endpoint (optional, for debugging)
        location /health {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
        
        # Static files - Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### Checklist Phase 1:
- [ ] Backup file nginx.conf hiện tại
- [ ] Cập nhật nginx.conf với cấu hình mới
- [ ] Verify syntax: `nginx -t` (trong container)

---

## 🎯 PHASE 2: SỬA DOCKER COMPOSE DEPENDENCIES (HIGH)

### Mục tiêu:
Đảm bảo frontend chỉ start sau khi backend HEALTHY (không chỉ started).

### File cần sửa:
`docker/environments/development/full-stack.yml`

### Thay đổi:
```yaml
# TRƯỚC:
frontend-dev:
  depends_on:
    backend-dev:
      condition: service_started

# SAU:
frontend-dev:
  depends_on:
    backend-dev:
      condition: service_healthy
```

### Checklist Phase 2:
- [ ] Sửa `full-stack.yml` - depends_on condition

---

## 🎯 PHASE 3: TỐI ƯU HEALTHCHECK (MEDIUM)

### Mục tiêu:
Giảm thời gian chờ healthcheck để services start nhanh hơn.

### Files cần sửa:
- `docker/environments/development/full-stack.yml`
- `docker/environments/development/backend-only.yml`

### Thay đổi healthcheck:
```yaml
# TRƯỚC:
healthcheck:
  test: ["CMD", "curl", "-f", "http://127.0.0.1:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s

# SAU:
healthcheck:
  test: ["CMD", "curl", "-f", "http://127.0.0.1:3000/health"]
  interval: 10s
  timeout: 5s
  retries: 12
  start_period: 30s
```

### Checklist Phase 3:
- [ ] Sửa `full-stack.yml` - healthcheck settings
- [ ] Sửa `backend-only.yml` - healthcheck settings

---

## 🎯 PHASE 4: FIX RACE CONDITION (LOW)

### Mục tiêu:
Sửa `setTimeout` workaround trong `notifications.gateway.ts` thành event-driven approach.

### File cần sửa:
`backend/src/modules/notifications/notifications.gateway.ts`

### Thay đổi:
Thay setTimeout bằng proper socket event handling với cleanup.

### Checklist Phase 4:
- [ ] Review và refactor setTimeout logic
- [ ] Thêm proper cleanup khi socket disconnect

---

## 🧪 PHASE 5: KIỂM TRA VÀ VERIFY

### Bước 1: Rebuild Docker images
```powershell
# Dừng tất cả services
npm run dev:down:web

# Rebuild với --no-cache
docker-compose -p lms -f docker/environments/development/full-stack.yml build --no-cache

# Start lại
npm run dev:web
```

### Bước 2: Kiểm tra logs
```powershell
# Backend logs
docker logs lms-backend-dev -f --tail 100

# Frontend logs (nginx)
docker logs lms-frontend-dev -f --tail 50
```

### Bước 3: Test API qua nginx
```powershell
# Test từ port 3001 (qua nginx)
curl http://localhost:3001/api/v1.3.0/courses
curl http://localhost:3001/health
```

### Bước 4: Test Socket.IO
```javascript
// Trong browser console tại http://localhost:3001
const socket = io('http://localhost:3001', { 
  transports: ['websocket', 'polling'] 
});
socket.on('connect', () => console.log('✅ Connected:', socket.id));
socket.on('connect_error', (err) => console.error('❌ Error:', err));
```

### Checklist Phase 5:
- [ ] Docker rebuild thành công
- [ ] Backend healthy
- [ ] Frontend serving đúng
- [ ] API proxy hoạt động
- [ ] Socket.IO proxy hoạt động
- [ ] Login thành công
- [ ] Notifications hoạt động

---

## 📝 EXECUTION ORDER

```
Phase 1 (nginx.conf)
    ↓
Phase 2 (depends_on)
    ↓
Phase 3 (healthcheck)
    ↓
Phase 4 (race condition) - Optional
    ↓
Phase 5 (verify)
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **BACKUP trước khi sửa** - Giữ bản sao các file gốc
2. **Sửa từng phase một** - Không sửa tất cả cùng lúc
3. **Test sau mỗi phase** - Đảm bảo không break gì
4. **Rebuild Docker sau khi sửa nginx.conf** - Nginx config được COPY vào image lúc build

---

*Plan version: 1.0*
*Created: 2025-12-05*
