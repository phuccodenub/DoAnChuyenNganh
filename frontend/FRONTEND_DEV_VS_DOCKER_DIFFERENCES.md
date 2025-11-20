# 🔍 Sự Khác Biệt: Chạy Frontend Riêng vs Docker

## 📊 Bảng So Sánh Nhanh

| Khía Cạnh | Chạy Riêng (`npm run dev`) | Docker | Kết Quả |
|-----------|---------------------------|--------|---------|
| **Port** | `5173` (Vite Dev Server) | `80` (Nginx) | ❌ Port khác |
| **Build Mode** | Development (Hot Reload) | Production Build (Static) | ❌ Hoàn toàn khác |
| **VITE_API_URL** | `/api` (Proxy) hoặc undefined | `http://localhost:3000/api/v1.3.0` | ❌ Khác endpoints |
| **VITE_SOCKET_URL** | Không được set | `http://localhost:3000` | ❌ Khác cách kết nối |
| **Cache** | Không cached hoặc cache ngắn | Cached 1 năm (1y) | ⚠️ Có thể gây stuck |
| **Routing** | Vite Router | Nginx try_files | ✓ Giống |
| **Node Modules** | Chạy trực tiếp | Copy vào image | ⚠️ Khác version |
| **TypeScript** | Đang phát triển | Compiled sẵn | ✓ Tương tự |
| **Environment** | Máy local | Container isolated | ❌ Môi trường khác |

---

## 🔴 SỰ KHÁC BIỆT CHÍNH

### 1. **PORT KHÁC NHAU** (Lớn nhất!)
```
┌─────────────────────────────────────────────────┐
│  Chạy Riêng (npm run dev)                       │
│  ✓ Vite Dev Server on Port 5173                │
│  ✓ Hot Module Replacement (HMR) enabled        │
│  http://localhost:5173                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Docker                                         │
│  ✓ Nginx Server on Port 80                     │
│  ✗ Static files (no HMR)                       │
│  http://localhost/  (port 80)                   │
└─────────────────────────────────────────────────┘
```

**🚨 VẤN ĐỀ**: Cookies, localStorage hoặc session có thể khác do port khác!

---

### 2. **BUILD MODE KHÁC BIỆT**
```
┌─────────────────────────────────────────────────┐
│  Chạy Riêng                                     │
│  📦 Development Mode                            │
│  • Source code chưa build                       │
│  • Vite xử lý TypeScript on-the-fly             │
│  • All dev dependencies loaded                  │
│  • Có Hot Module Replacement                    │
│  • Large bundle (unoptimized)                   │
│  • Source maps full                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Docker                                         │
│  🏭 Production Build                            │
│  • npm run build → dist/ (minified + optimized) │
│  • TypeScript đã compile xong                   │
│  • Dev dependencies removed                     │
│  • No HMR                                       │
│  • Small bundle (optimized)                     │
│  • Source maps minimal                          │
└─────────────────────────────────────────────────┘
```

**🎯 HẬU QUẢ**: Code chạy khác nhau! Một số bug chỉ xuất hiện ở production build.

---

### 3. **API ENDPOINT CONFIGURATION** (Quan trọng!)

#### Chạy Riêng:
```env
# .env.development.local hoặc không set
VITE_API_URL=undefined (hoặc /api - proxy)
VITE_SOCKET_URL=undefined
```

**Code:**
```typescript
// src/services/http/client.ts
const baseURL = (import.meta as any).env?.VITE_API_URL || '/api/v1.3.0';
// → Sẽ sử dụng `/api/v1.3.0` (PROXY)
```

**Vite Dev Server config (vite.config.ts) nên có:**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // ✓ Backend
      changeOrigin: true
    }
  }
}
```

#### Docker:
```dockerfile
ARG VITE_API_URL=http://localhost:3000/api/v1.3.0
ARG VITE_SOCKET_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
```

**docker-compose full-stack.yml:**
```yaml
frontend-dev:
  build:
    args:
      VITE_API_URL: "http://localhost:3000/api/v1.3.0"
      VITE_SOCKET_URL: "http://localhost:3000"
```

**🔗 Sự khác biệt:**
- **Riêng**: `/api/v1.3.0` (relative, qua proxy)
- **Docker**: `http://localhost:3000/api/v1.3.0` (absolute URL)

**🚨 VẤN ĐỀ CORS**: Có thể xảy ra khi chạy Docker nếu backend không accept từ `localhost:80`!

---

### 4. **NGINX vs VITE DEV SERVER**

#### Nginx (Docker):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;  # ⚠️ Cache 1 năm!
    add_header Cache-Control "public, immutable";
}

# Security headers (server-side)
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
```

#### Vite Dev Server (Riêng):
- Không cache JS/CSS
- Reload nhanh (HMR)
- Source maps đầy đủ
- Warnings hiển thị rõ

**🚨 CACHE PROBLEM**: Khi chạy Docker, static assets cached 1 năm! Nếu bạn build lại mà không clear cache, trình duyệt vẫn dùng JS cũ!

---

### 5. **ENVIRONMENT & DEPENDENCIES**

#### Chạy Riêng:
- Node modules từ máy local
- Có thể dùng global packages
- Node version = máy local
- npm/yarn = máy local

#### Docker:
```dockerfile
FROM node:20-alpine AS build
COPY frontend/package*.json ./
RUN npm ci  # Clean install (strict lock file)
COPY frontend/ .
RUN npm run build
```

- Node version = `node:20-alpine` (hardcoded)
- npm ci (strict, không update)
- Isolated environment

**🚨 VẤN ĐỀ**: Nếu máy local có Node 18 nhưng Docker có Node 20, dependencies có thể khác!

---

## ⚠️ NHỮNG VẤN ĐỀ CÓ THỂ GẶP

### Problem 1: "Code hoạt động ở dev, nhưng fail ở Docker"
**Nguyên nhân:**
- Dev mode không catch tree-shaking issues
- Production build optimize nên có thể break unused code
- Missing environment variables

**Giải pháp:**
```bash
# Chạy production build ở local trước khi đẩy Docker
cd frontend
npm run build
npm run preview  # Preview production build
```

---

### Problem 2: "API request fail khi chạy Docker"
**Nguyên nhân:**
```
Riêng:       http://localhost:5173 → /api → http://localhost:3000 (Proxy)
Docker:      http://localhost:80 → http://localhost:3000/api (Absolute URL)
             ↑ CORS issue!
```

**Kiểm tra:**
1. Backend có accept CORS từ `http://localhost` không?
2. API URL đúng không trong Docker?
3. Backend chạy ở port 3000 không?

---

### Problem 3: "Cache stuck, cập nhật không thấy"
**Nguyên nhân:**
Nginx cache 1 năm → Trình duyệt không fetch lại

**Giải pháp:**
```bash
# Hard refresh trong trình duyệt
Ctrl + Shift + R (hoặc Cmd + Shift + R)

# Hoặc clear DevTools cache
DevTools → Application → Cache → Clear
```

---

### Problem 4: "Socket.IO connection khác nhau"
**Riêng:** VITE_SOCKET_URL không set → Frontend tự detect
**Docker:** VITE_SOCKET_URL = `http://localhost:3000` (hardcoded)

Nếu socket URL sai, real-time features (chat, notification) không hoạt động!

---

## ✅ CHECKLIST KРОМ GỌI

- [ ] Port: 5173 (riêng) vs 80 (Docker)?
- [ ] API URL: `/api` (proxy) vs `http://localhost:3000` (absolute)?
- [ ] Build: Dev mode vs Production build?
- [ ] Environment: VITE_* variables có set không?
- [ ] Cache: Clear browser cache khi test?
- [ ] Node version: Local vs Docker khác không?
- [ ] Backend: CORS allow từ client origin không?
- [ ] Socket.IO: URL correct không?

---

## 🔧 GIẢI PHÁP: ĐỒNG BỘ SỰ KHÁC BIỆT

### 1. Tạo .env.development.local (Chạy Riêng)
```env
VITE_API_URL=http://localhost:3000/api/v1.3.0
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Cấu hình Vite Proxy (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 3. Update vite-env.d.ts
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
}
```

### 4. Test trên Production Build ở Local
```bash
npm run build
npm run preview
# Mở http://localhost:4173
```

---

## 📌 KẾT LUẬN

Sự khác biệt lớn nhất giữa chạy riêng và Docker:

1. **Port**: 5173 vs 80 → Session/Cookie khác
2. **Build**: Dev vs Production → Có thể break
3. **API URL**: Proxy vs Absolute → CORS issue
4. **Cache**: No cache vs 1 year → Stuck bug
5. **Environment**: Loose vs Strict → Version mismatch

**💡 Best Practice:**
- Test trên production build (`npm run preview`)
- Set explicit environment variables
- Clear cache thường xuyên
- Kiểm tra backend CORS kỹ
