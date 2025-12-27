# Hướng Dẫn Deploy Frontend + Backend Cùng Lúc trên Render

## 📋 Tổng Quan

File `render.yaml` hiện tại đã được cấu hình để deploy **cả Frontend và Backend** cùng lúc:

1. **Frontend**: Static Site (Vite + React)
2. **Backend**: Web Service (Node.js + Express)

## 🚀 Bước 1: Deploy Blueprint

1. Vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub repo (hoặc fork repo về tài khoản của bạn)
4. Chọn branch: `dev/backend`
5. Render sẽ tự động detect `render.yaml` và tạo 2 services:
   - `lms-frontend` (Static Site)
   - `lms-backend` (Web Service)

## ⚙️ Bước 2: Cấu Hình Environment Variables

### 2.1. Backend Service (`lms-backend`)

**Các biến cần set thủ công:**

1. **DATABASE_URL**: Connection string từ Supabase PostgreSQL
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

2. **REDIS_URL**: Connection string từ Upstash Redis
   ```
   rediss://default:[TOKEN]@[HOST]:6379
   ```

3. **PUBLIC_URL**: URL của backend service (sau khi deploy xong)
   ```
   https://lms-backend-xxxx.onrender.com
   ```

4. **CORS_ALLOWED_ORIGINS**: Thêm frontend URL (sau khi deploy frontend xong)
   ```
   https://lms-frontend-xxxx.onrender.com,http://localhost:3000,http://localhost:5173
   ```

5. **FRONTEND_URL**: URL của frontend service (sau khi deploy xong)
   ```
   https://lms-frontend-xxxx.onrender.com
   ```

6. **Cloudflare R2** (nếu dùng):
   - `R2_ENDPOINT`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`

7. **AI Keys** (nếu cần):
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`

### 2.2. Frontend Service (`lms-frontend`)

**Các biến cần set thủ công (QUAN TRỌNG - phải set TRƯỚC khi build):**

1. **VITE_API_URL**: URL của backend API
   ```
   https://lms-backend-xxxx.onrender.com/api
   ```

2. **VITE_WS_URL**: URL của backend cho WebSocket
   ```
   https://lms-backend-xxxx.onrender.com
   ```

3. **VITE_SOCKET_URL**: Alias cho VITE_WS_URL
   ```
   https://lms-backend-xxxx.onrender.com
   ```

⚠️ **LƯU Ý QUAN TRỌNG**: 
- Vite build-time variables (`VITE_*`) phải được set **TRƯỚC KHI BUILD**
- Nếu chưa có backend URL, có thể:
  - Option 1: Deploy backend trước → lấy URL → set vào frontend → redeploy frontend
  - Option 2: Set tạm localhost → deploy → sau đó update và redeploy

## 📝 Bước 3: Workflow Deploy (Khuyến Nghị)

### Cách 1: Deploy Backend Trước (Khuyến Nghị)

1. **Deploy Backend**:
   - Set các env vars cần thiết (DATABASE_URL, REDIS_URL, etc.)
   - Deploy và đợi service chạy
   - Copy backend URL: `https://lms-backend-xxxx.onrender.com`

2. **Deploy Frontend**:
   - Set `VITE_API_URL` = `https://lms-backend-xxxx.onrender.com/api`
   - Set `VITE_WS_URL` = `https://lms-backend-xxxx.onrender.com`
   - Deploy frontend
   - Copy frontend URL: `https://lms-frontend-xxxx.onrender.com`

3. **Update Backend CORS**:
   - Vào backend service → Environment
   - Update `CORS_ALLOWED_ORIGINS`: thêm frontend URL
   - Update `FRONTEND_URL`: set frontend URL
   - Service sẽ tự động redeploy

4. **Test**:
   - Mở frontend URL trong browser
   - Kiểm tra API calls và WebSocket connections

### Cách 2: Deploy Cùng Lúc (Nếu đã biết URLs)

1. Deploy cả 2 services cùng lúc
2. Sau khi deploy xong:
   - Copy backend URL → set vào frontend env vars → redeploy frontend
   - Copy frontend URL → set vào backend CORS → redeploy backend

## 🔄 Bước 4: Update Environment Variables Sau Deploy

### Frontend (nếu cần update API URL):

1. Vào `lms-frontend` service → **Environment**
2. Update `VITE_API_URL` và `VITE_WS_URL`
3. Click **"Save Changes"** → Service sẽ tự động rebuild và redeploy

### Backend (nếu cần update CORS):

1. Vào `lms-backend` service → **Environment**
2. Update `CORS_ALLOWED_ORIGINS` (thêm frontend URL)
3. Update `FRONTEND_URL`
4. Click **"Save Changes"** → Service sẽ tự động redeploy

## ✅ Checklist Sau Khi Deploy

- [ ] Backend service đang chạy (status: Live)
- [ ] Frontend service đang chạy (status: Live)
- [ ] Backend health check: `https://lms-backend-xxxx.onrender.com/health`
- [ ] Frontend có thể truy cập: `https://lms-frontend-xxxx.onrender.com`
- [ ] Frontend có thể gọi API (kiểm tra Network tab)
- [ ] WebSocket connection hoạt động (nếu dùng AI Chat)
- [ ] CORS không bị block (kiểm tra Console)

## 🐛 Troubleshooting

### Frontend không kết nối được API

- Kiểm tra `VITE_API_URL` có đúng không
- Kiểm tra CORS trong backend có cho phép frontend origin không
- Kiểm tra Network tab trong browser DevTools

### WebSocket không kết nối

- Kiểm tra `VITE_WS_URL` có đúng không
- Kiểm tra backend có enable Socket.IO không
- Kiểm tra firewall/proxy settings

### Build Frontend Fail

- Kiểm tra `VITE_API_URL` và `VITE_WS_URL` đã được set chưa
- Kiểm tra build logs trong Render Dashboard
- Đảm bảo Node.js version phù hợp (check `package.json`)

## 📚 Tài Liệu Tham Khảo

- [Render Blueprint Documentation](https://render.com/docs/blueprint-spec)
- [Render Static Sites](https://render.com/docs/static-sites)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

