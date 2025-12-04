# 🔍 BÁO CÁO PHÂN TÍCH VẤN ĐỀ SOCKET/REALTIME

> **Ngày phân tích**: 2025-12-04  
> **Branch đã push**: `socket-issue`  
> **So sánh từ commit**: `c992a6e` (restructure course) đến `HEAD` (socket-issue)

---

## 📋 TÓM TẮT VẤN ĐỀ

### Triệu chứng được báo cáo:
1. **API ERR_CONNECTION_RESET**: `GET http://localhost:3000/api/v1.3.0/notifications/sent?limit=50 net::ERR_CONNECTION_RESET`
2. **Trang web chậm load**: Phải đợi hơn 1 phút, reload nhiều lần mới tải được
3. **Giao diện trắng xóa** (blank screen) thỉnh thoảng xuất hiện

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG: `npm run dev:api` + Frontend riêng không hoạt động

### Mô tả vấn đề:
Khi chạy:
- **`npm run dev:api`** (backend + redis + postgres trong Docker)
- **`cd frontend && npm run dev`** (frontend trực tiếp bằng Vite, port 5174)

**Kết quả:**
1. ❌ Không load được trang web ban đầu
2. ❌ Sau khi refresh, load được giao diện nhưng **TẤT CẢ API không hoạt động**
3. ❌ Không thể đăng nhập (không kết nối được database)
4. ❌ Socket server không hoạt động

**So sánh với `npm run dev:web`:**
| Chế độ | Frontend Port | Backend Port | Hoạt động? |
|--------|---------------|--------------|------------|
| `npm run dev:web` (Docker full) | **3001** (nginx) | 3000 | ✅ Có |
| `npm run dev:api` + `npm run dev` | **5174** (Vite) | 3000 | ❌ Không |

### 🔍 Phân tích nguyên nhân gốc:

#### **1. Vite Proxy hoạt động ĐÚNG nhưng Backend trong Docker không nhận request**

```
                    ┌─────────────────────────────────────────────────────┐
                    │               HOST MACHINE (Windows)                 │
                    │                                                      │
  Browser           │   Vite Dev Server (port 5174)                       │
     │              │        │                                            │
     │ GET /api/... │        │ proxy to localhost:3000                    │
     └──────────────┼────────┤                                            │
                    │        │                                            │
                    │        ▼                                            │
                    │   localhost:3000 ←──── Docker Port Mapping          │
                    │        │                                            │
                    └────────┼────────────────────────────────────────────┘
                             │
                    ┌────────┼────────────────────────────────────────────┐
                    │        ▼            DOCKER NETWORK                  │
                    │   lms-backend-dev (0.0.0.0:3000)                    │
                    │        │                                            │
                    │        │ connect to                                 │
                    │        ▼                                            │
                    │   postgres-dev:5432  ←── CHẠY HAY KHÔNG?            │
                    │   redis-dev:6379                                    │
                    └─────────────────────────────────────────────────────┘
```

#### **2. Vấn đề: `npm run dev:api` dùng `backend-only.yml` - SỬ DỤNG SUPABASE!**

Kiểm tra `docker/environments/development/backend-only.yml`:
```yaml
backend-dev:
  depends_on:
    # postgres-dev:  # ← COMMENTED OUT! 
    #   condition: service_healthy
    redis-dev:
      condition: service_healthy
```

**⚠️ CRITICAL:** `backend-only.yml` được thiết kế để dùng **Supabase** (external database), KHÔNG phải Docker postgres!

Trong khi đó, file `backend/.env` có:
```env
DATABASE_URL=postgresql://postgres.bavyiitubxjhaoknuuvj:...@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### **3. Vấn đề: Backend container có thể không kết nối được Supabase**

Khi chạy trong Docker container:
- Container cần resolve DNS `aws-1-ap-southeast-1.pooler.supabase.com`
- Có thể gặp network issues từ bên trong Docker
- Healthcheck có thể pass nhưng database connection thực tế fail

#### **4. Vấn đề: `start-backend-dev.sh` cố gắng connect đến `postgres-dev` (Docker)**

```bash
# Trong start-backend-dev.sh
DB_EXISTS=$(PGPASSWORD=${DB_PASSWORD} psql -h postgres-dev -U ${DB_USER} ...)
```

**Script startup cố gắng connect đến `postgres-dev`** (Docker container) trong khi:
- `backend-only.yml` không chạy postgres container
- Backend thực tế dùng Supabase

**→ Script có thể bị stuck hoặc timeout!**

#### **5. Vấn đề CORS và Socket không phải nguyên nhân chính**

CORS config trong `backend/.env` đã có port 5174:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174,http://localhost:3001,...
```

Vite proxy cũng đã cấu hình đúng cho `/api` và `/socket.io`.

**→ Vấn đề không phải CORS, mà là BACKEND KHÔNG HEALTHY!**

---

### 🧪 KẾT QUẢ KIỂM TRA (2025-12-05):

**Setup test:**
- Backend container: `lms-backend-dev` (port 3000) ✅ Running
- Frontend: `npm run dev` (port 5174) ✅ Running
- Frontend Docker: `lms-frontend-dev` ❌ Stopped

**Kết quả:**
```powershell
# Test API qua Vite proxy
curl http://localhost:5174/api/v1.3.0/courses
# → ✅ THÀNH CÔNG! API trả về data

# Test CORS từ origin 5174
curl -H "Origin: http://localhost:5174" -X OPTIONS http://localhost:3000/api/v1.3.0/courses
# → ✅ Access-Control-Allow-Origin: http://localhost:5174

# Test socket.io qua Vite proxy
curl http://localhost:5174/socket.io/?EIO=4&transport=polling
# → ✅ {"sid":"...","upgrades":["websocket"],...}
```

**Kết luận:** API và Socket.IO đều hoạt động qua Vite proxy!

### 🔍 Nguyên nhân thực sự của vấn đề:

#### **1. Vite Cold Start chậm (7-15 giây đầu tiên)**
- Lần đầu mở browser, Vite cần compile các dependencies
- Nếu refresh quá nhanh → trang trắng

#### **2. Browser Cache cũ (từ Docker frontend)**
- Khi chuyển từ port 3001 (Docker) sang 5174 (Vite)
- LocalStorage/SessionStorage có thể lưu tokens/state cũ
- Service Worker có thể cache assets cũ

#### **3. HMR (Hot Module Replacement) conflict**
- Vite HMR có thể conflict với React state
- Đặc biệt với WebSocket connections

#### **4. Timing issue giữa các services**
- Frontend load trước khi socket connection established
- React hooks chạy trước khi socketService ready

### 🎯 GIẢI PHÁP NGAY LẬP TỨC:

#### **Fix 1: Clear browser cache khi chuyển mode**
```
1. Mở DevTools (F12)
2. Application → Clear Storage → Clear site data
3. Network → Disable cache (checkbox)
4. Refresh trang (Ctrl+Shift+R)
```

#### **Fix 2: Đợi Vite hoàn tất compile**
```
1. Chạy `npm run dev` trong frontend/
2. Đợi thấy "VITE ready in XXX ms"
3. Đợi thêm 3-5 giây cho dependencies compile
4. Mới mở browser
```

#### **Fix 3: Thêm startup delay cho socket**
Trong `AppProviders.tsx`:
```typescript
useEffect(() => {
  if (isAuthenticated) {
    // Delay socket connection để React mount xong
    const timer = setTimeout(() => {
      socketService.connectNonBlocking();
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isAuthenticated]);
```

---

### 🎯 GIẢI PHÁP LÂU DÀI:

#### **Option A: Sửa `backend-only.yml` để chạy với Docker Postgres**

```yaml
# Uncomment postgres dependency
depends_on:
  postgres-dev:
    condition: service_healthy
  redis-dev:
    condition: service_healthy

# Và thêm environment để override DATABASE_URL
environment:
  - DATABASE_URL=postgresql://${POSTGRES_USER:-lms_user}:${POSTGRES_PASSWORD:-123456}@postgres-dev:5432/${POSTGRES_DB:-lms_db}
```

#### **Option B: Sửa `start-backend-dev.sh` để skip postgres check khi dùng Supabase**

```bash
# Kiểm tra nếu DATABASE_URL trỏ đến external (Supabase)
if echo "$DATABASE_URL" | grep -q "supabase"; then
  echo "Using Supabase - skipping local postgres check"
else
  # Check postgres-dev...
fi
```

#### **Option C: Tạo file compose mới cho Vite dev mode**

Tạo `docker/environments/development/backend-vite.yml` với cấu hình:
- Backend + Redis + Postgres (local Docker)
- KHÔNG có frontend container
- CORS mở rộng cho port 5174

---

## 📊 PHÂN TÍCH SO SÁNH (c992a6e → HEAD)

### 1. Các thay đổi Docker Config

| File | Thay đổi |
|------|----------|
| `docker-compose.dev.yml` | **MỚI** - 109 dòng thêm |
| `docker/environments/development/backend-only.yml` | +22/-11 dòng |
| `docker/environments/development/full-stack.yml` | +3/-1 dòng |
| `docker/scripts/start-api-dev.ps1` | +31/-20 dòng |

### 2. Các thay đổi Backend Socket

| File | Thay đổi chính |
|------|----------------|
| `backend/src/modules/notifications/notifications.gateway.ts` | +54/-17 dòng - Thêm delay 100ms khi user chưa attached |
| `backend/src/modules/chat/chat.gateway.ts` | +9 dòng - Thêm debug logging |
| `backend/src/config/db.ts` | +23 dòng - Handle Supabase permission errors |

### 3. Các thay đổi Frontend Socket

| File | Thay đổi chính |
|------|----------------|
| `frontend/src/services/socketService.ts` | +186 dòng - Non-blocking architecture |
| `frontend/src/hooks/useNotificationSocket.ts` | +255/-173 dòng - Passive hook pattern |
| `frontend/src/hooks/useLivestreamSocket.ts` | +234 dòng - Optimized subscriptions |
| `frontend/src/app/providers/AppProviders.tsx` | `connect()` → `connectNonBlocking()` |

---

## 🔴 CÁC NGUYÊN NHÂN TIỀM NĂNG

### **Issue #1: Nginx Frontend không proxy Socket.IO** ⚠️ **HIGH PRIORITY**

> **UPDATE 2025-12-05:** Vấn đề này CHỈ ảnh hưởng khi chạy Docker frontend (port 3001).
> Khi chạy Vite dev server (port 5174), Vite proxy hoạt động tốt.

**Vấn đề:**
```
Frontend (Docker) → nginx:80 → dist/index.html
Frontend KHÔNG proxy /socket.io → Backend!
```

**Chi tiết:**
- `frontend/nginx.conf` **KHÔNG có cấu hình proxy** cho `/socket.io` hoặc `/api`
- Khi frontend chạy trên Docker (port 3001), nó là nginx serving static files
- Vite proxy chỉ hoạt động khi chạy `npm run dev` (dev server), **KHÔNG hoạt động** khi build production
- Socket.IO từ frontend Docker cố gắng kết nối trực tiếp đến `http://localhost:3000` từ browser

**Hậu quả:**
- Browser cố gắng kết nối socket đến `localhost:3000` 
- Có thể gây conflict với CORS hoặc connection issues
- API calls cũng bị ảnh hưởng tương tự

**Giải pháp đề xuất:**
```nginx
# Thêm vào nginx.conf
location /api {
    proxy_pass http://lms-backend-dev:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /socket.io {
    proxy_pass http://lms-backend-dev:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # WebSocket timeout settings
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
}
```

---

### **Issue #2: CORS Port mismatch** ⚠️ **MEDIUM PRIORITY**

**Vấn đề trong `full-stack.yml`:**
```yaml
# TRƯỚC (c992a6e - LỖI):
CORS_ALLOWED_ORIGINS=...http://localhost:5173...

# SAU (HEAD - SỬA nhưng chưa đủ):
CORS_ALLOWED_ORIGINS=...http://localhost:5174...
```

**Chi tiết:**
- Frontend Vite chạy trên port `5174` (theo `vite.config.ts`)
- Nhưng Docker frontend chạy trên port `3001` (theo docker-compose)
- CORS_ALLOWED_ORIGINS cần bao gồm cả hai

**Hiện tại backend-only.yml có:**
```yaml
CORS_ALLOWED_ORIGINS=http://localhost:${BACKEND_PORT:-3000},...,http://localhost:${FRONTEND_PORT:-3001},...,http://localhost:5174,...
```

**Khuyến nghị:** Đảm bảo tất cả ports được liệt kê và environment variables được set đúng.

---

### **Issue #3: DNS Configuration thêm vào Backend** ⚠️ **LOW-MEDIUM**

**Thay đổi trong `backend-only.yml`:**
```yaml
# THÊM MỚI:
dns:
  - 8.8.8.8
  - 8.8.4.4
```

**Phân tích:**
- DNS cấu hình này **tốt** cho việc resolve external domains (Supabase)
- Tuy nhiên, có thể gây **latency** nếu network không ổn định
- Khi backend cố gắng connect đến Supabase qua Google DNS, nếu có network hiccup → connection reset

---

### **Issue #4: Socket Passive Architecture có thể gây Race Condition** ⚠️ **MEDIUM**

**Thay đổi trong `useNotificationSocket.ts`:**
```typescript
// TRƯỚC: Hook tự khởi tạo connection
socketInstance = io(wsUrl, {...});

// SAU: Hook chờ AppProviders khởi tạo
const existingSocket = socketService.getSocketIfConnected();
if (existingSocket) {
  cleanupFn = setupListeners(existingSocket);
} else {
  // Chờ passive...
}
```

**Vấn đề tiềm ẩn:**
- Nếu AppProviders chưa connect xong trước khi component mount → listeners không được setup
- Có thể miss initial events
- Callback `onConnect` có thể bị gọi multiple times

**Thay đổi trong `notifications.gateway.ts`:**
```typescript
// THÊM MỚI: Delay 100ms để chờ auth middleware
setTimeout(() => {
  const delayedUser = (socket as any).user;
  if (delayedUser) {
    this.handleUserConnection(socket, delayedUser);
  }
}, 100);
```

**Vấn đề:**
- `setTimeout` 100ms là workaround cho race condition
- Có thể gây memory leak nếu socket disconnect trong 100ms
- Không reliable - có thể cần thời gian lâu hơn

---

### **Issue #5: Docker Network và Service Dependencies** ⚠️ **MEDIUM**

**Cấu hình hiện tại:**
```yaml
frontend-dev:
  depends_on:
    backend-dev:
      condition: service_started  # Chỉ chờ start, KHÔNG chờ healthy!
```

**Vấn đề:**
- Frontend có thể start trước khi backend ready
- Nginx serving frontend có thể fail khi proxy đến backend chưa sẵn sàng
- Backend healthcheck cần 60s `start_period` + 30s interval

**Giải pháp:**
```yaml
depends_on:
  backend-dev:
    condition: service_healthy  # Chờ backend HEALTHY
```

---

### **Issue #6: Supabase Connection Issues** ⚠️ **MEDIUM-HIGH**

**Thay đổi trong `db.ts`:**
```typescript
// THÊM MỚI: Handle permission errors silently
if (syncError?.parent?.code === '42501') {
  console.log('⚠️ Some database sync operations skipped...');
}
```

**Phân tích:**
- Backend sử dụng Supabase PostgreSQL (external)
- Connection qua internet có thể không ổn định
- `ERR_CONNECTION_RESET` có thể do:
  - Supabase connection pool exhausted
  - Network timeout giữa Docker container và Supabase
  - Connection pooler của Supabase có limit

**Kiểm tra:**
```bash
# Test connection từ backend container
docker exec lms-backend-dev ping aws-1-ap-southeast-1.pooler.supabase.com
```

---

### **Issue #7: env_file Loading Order** ⚠️ **LOW**

**Cấu hình:**
```yaml
backend-dev:
  env_file:
    - ../../../.env           # Root .env
    - ../../../backend/.env   # Backend .env (nếu có)
  environment:
    - DB_HOST=${DB_HOST:-postgres-dev}  # Override
```

**Vấn đề tiềm ẩn:**
- `backend/.env` có `DATABASE_URL` pointing to Supabase
- Docker compose environment variables có thể override hoặc conflict
- Cần đảm bảo thứ tự ưu tiên đúng

---

### **Issue #8: Chế độ `npm run dev:api` + Frontend riêng không hoạt động** ⚠️ **CRITICAL - ĐƯỢC REPORT**

> **Báo cáo từ user:** Cố gắng chạy `npm run dev:api` (backend Docker) + `cd frontend && npm run dev` (Vite riêng) nhưng không thành công.

**Triệu chứng:**
1. Ban đầu không load được trang web
2. Sau khi refresh, load được giao diện nhưng API không hoạt động
3. Không đăng nhập được
4. Socket server không hoạt động

**⚠️ LƯU Ý QUAN TRỌNG:**
Sau khi kiểm tra thực tế (2025-12-05), API và Socket.IO **ĐỀU HOẠT ĐỘNG** qua Vite proxy!
Vấn đề thực sự có thể là:

#### **Nguyên nhân 1: Vite Cold Start Time**
```
Lần đầu chạy `npm run dev`:
┌─────────────────────────────────────────────────────┐
│  0s     │ Vite starting...                          │
│  0.7s   │ "VITE ready in 707ms"                     │
│  1-5s   │ Dependencies pre-bundling (esbuild)       │
│  5-15s  │ First page compile (React, Tailwind...)   │
│  15s+   │ Ready for use                             │
└─────────────────────────────────────────────────────┘

Nếu mở browser trước 15s → Trang trắng hoặc lỗi!
```

#### **Nguyên nhân 2: Browser Cache/State Conflict**
```
Scenario:
1. Chạy `npm run dev:web` → Frontend ở port 3001
2. Login thành công → Tokens saved to localStorage
3. Stop Docker frontend
4. Chạy `npm run dev` → Frontend ở port 5174
5. Browser vẫn dùng tokens từ port 3001 (different origin!)
6. → API calls fail với 401 Unauthorized
```

**Giải pháp:**
```
1. Clear localStorage: localStorage.clear()
2. Clear sessionStorage: sessionStorage.clear()
3. Hard refresh: Ctrl+Shift+R
```

#### **Nguyên nhân 3: Port khác nhau = Origin khác nhau**
```
http://localhost:3001  ←→  http://localhost:5174
        ↓                           ↓
    Different Origins (theo Same-Origin Policy)
        ↓                           ↓
    LocalStorage RIÊNG BIỆT!
```

**Hậu quả:**
- Login ở port 3001 → Tokens lưu ở `localStorage` của origin `localhost:3001`
- Mở port 5174 → `localStorage` trống → Chưa đăng nhập!
- Nếu app kiểm tra auth trước render → Redirect về login hoặc trang trắng

#### **Nguyên nhân 4: HMR WebSocket conflict**
```
Vite HMR sử dụng WebSocket riêng để hot reload.
Socket.IO của app cũng dùng WebSocket.

Có thể conflict nếu:
- Cả hai connect cùng lúc
- Port/path bị nhầm lẫn
```

**Kiểm tra:**
```javascript
// Trong browser console, kiểm tra connections
console.log('[HMR]', import.meta.hot?.data);
console.log('[Socket]', window.__SOCKET_DEBUG__);
```

#### **Giải pháp tổng hợp:**

**Step 1: Clean start**
```powershell
# Terminal 1: Backend
npm run dev:api

# Đợi backend healthy (check logs)
docker logs lms-backend-dev -f

# Terminal 2: Frontend
cd frontend
npm run dev

# Đợi "VITE ready" + 10 giây
```

**Step 2: Clean browser**
```
1. Mở DevTools (F12)
2. Application → Storage → Clear site data
3. Console: localStorage.clear(); sessionStorage.clear();
4. Close tab
5. Mở tab mới: http://localhost:5174
```

**Step 3: Login lại**
```
Vì localStorage đã clear, cần đăng nhập lại từ đầu.
```

---

## 🎯 RECOMMENDATIONS (Theo thứ tự ưu tiên)

### 1. **FIX nginx.conf để proxy API và Socket.IO** ⭐ CRITICAL
```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Cần cho WebSocket
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    upstream backend {
        server lms-backend-dev:3000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # API proxy
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # WebSocket proxy
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # WebSocket specific timeouts
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }
        
        # Static files
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. **Update frontend-dev dependencies** ⭐ HIGH
```yaml
frontend-dev:
  depends_on:
    backend-dev:
      condition: service_healthy  # Thay vì service_started
```

### 3. **Kiểm tra và giảm healthcheck timeout** ⭐ MEDIUM
```yaml
backend-dev:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://127.0.0.1:3000/health"]
    interval: 10s        # Giảm từ 30s
    timeout: 5s          # Giảm từ 10s
    retries: 10          # Tăng từ 5
    start_period: 30s    # Giảm từ 60s
```

### 4. **Thêm connection retry logic cho Supabase** ⭐ MEDIUM
- Xem xét thêm connection pool settings
- Thêm retry logic khi connect database

### 5. **Fix race condition trong notifications.gateway.ts** ⭐ LOW
- Thay `setTimeout` bằng proper event-driven approach
- Hoặc tăng timeout và thêm cleanup

---

## 🧪 CÁCH KIỂM TRA

### 1. Rebuild và restart Docker:
```powershell
# Dừng tất cả
docker-compose -p lms -f docker/environments/development/full-stack.yml down

# Rebuild với --no-cache
docker-compose -p lms -f docker/environments/development/full-stack.yml build --no-cache

# Start lại
docker-compose -p lms -f docker/environments/development/full-stack.yml up -d
```

### 2. Kiểm tra logs:
```powershell
# Backend logs
docker logs lms-backend-dev -f --tail 100

# Frontend logs (nginx)
docker logs lms-frontend-dev -f
```

### 3. Test socket connection:
```javascript
// Trong browser console
const socket = io('http://localhost:3001', { 
  transports: ['websocket'] 
});
socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### 4. Test API từ terminal:
```powershell
curl http://localhost:3000/health
curl http://localhost:3001/api/v1.3.0/notifications/sent?limit=5
```

---

## 📁 FILES CHANGED SUMMARY

```
docker-compose.dev.yml                              | +109 NEW
docker/environments/development/backend-only.yml   | +22/-11
docker/environments/development/full-stack.yml     | +3/-1
docker/scripts/start-api-dev.ps1                   | +31/-20
backend/src/config/db.ts                           | +23
backend/src/modules/chat/chat.gateway.ts           | +9
backend/src/modules/notifications/notifications.gateway.ts | +54/-17
frontend/src/app/providers/AppProviders.tsx        | Modified
frontend/src/services/socketService.ts             | +186
frontend/src/hooks/useNotificationSocket.ts        | +255/-173
frontend/src/hooks/useLivestreamSocket.ts          | +234
frontend/src/components/debug/SocketStatus.tsx     | +8
```

---

## 🔗 REFERENCES

- Branch với code hiện tại: `socket-issue`
- Commit "restructure course" (baseline): `c992a6e`
- Current HEAD: `0122878` (WIP: current state with socket/realtime issues)
