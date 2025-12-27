# ✅ Checklist Deploy Ổn Định - Step by Step

## 📋 Chuẩn Bị Trước Khi Deploy

### Bước 0: Kiểm Tra Prerequisites

- [ ] Đã có tài khoản Render (free tier OK)
- [ ] Đã có tài khoản Supabase (free tier OK)
- [ ] Đã có tài khoản Upstash (free tier OK)
- [ ] Đã fork/clone repo về GitHub của bạn (nếu repo thuộc tài khoản khác)
- [ ] Đã commit và push `render.yaml` lên branch `dev/backend`

---

## 🗄️ Bước 1: Setup Database (Supabase PostgreSQL)

### 1.1. Tạo Supabase Project

- [ ] Vào [Supabase Dashboard](https://app.supabase.com)
- [ ] Click **"New Project"**
- [ ] Điền thông tin:
  - Name: `lms-database` (hoặc tên bạn muốn)
  - Database Password: **Lưu lại password này!**
  - Region: Chọn gần bạn nhất (Singapore, Tokyo, etc.)
- [ ] Click **"Create new project"**
- [ ] Đợi project được tạo (2-3 phút)

### 1.2. Lấy Connection String

- [ ] Vào project → **Settings** → **Database**
- [ ] Scroll xuống **"Connection string"**
- [ ] Chọn tab **"URI"**
- [ ] Copy connection string:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```
- [ ] **Lưu lại** để dùng ở Bước 4

---

## 🔴 Bước 2: Setup Redis (Upstash)

### 2.1. Tạo Upstash Redis Database

- [ ] Vào [Upstash Dashboard](https://console.upstash.com)
- [ ] Click **"Create Database"**
- [ ] Điền thông tin:
  - Name: `lms-redis`
  - Type: **Regional** (free tier)
  - Region: Chọn gần bạn nhất (Singapore, Tokyo, etc.)
- [ ] Click **"Create"**

### 2.2. Lấy Connection String

- [ ] Vào database vừa tạo → **Details**
- [ ] Chọn tab **"REST API"** hoặc **"TCP"**
- [ ] Copy **"Endpoint"** và **"Port"**
- [ ] Copy **"Password"** (Token)
- [ ] Format connection string:
  ```
  rediss://default:[PASSWORD]@[ENDPOINT]:6379
  ```
  Ví dụ:
  ```
  rediss://default:AXxxxxxxxxxxxxx@xxxxx-xxxxx.upstash.io:6379
  ```
- [ ] **Lưu lại** để dùng ở Bước 4

---

## 🚀 Bước 3: Deploy Backend Trước

### 3.1. Tạo Blueprint trên Render

- [ ] Vào [Render Dashboard](https://dashboard.render.com)
- [ ] Click **"New +"** → **"Blueprint"**
- [ ] Connect GitHub:
  - Chọn repo của bạn
  - Chọn branch: **`dev/backend`**
- [ ] Click **"Apply"**
- [ ] Render sẽ detect `render.yaml` và tạo 2 services:
  - `lms-frontend` (Static Site)
  - `lms-backend` (Web Service)

### 3.2. Set Environment Variables cho Backend

Vào service **`lms-backend`** → **Environment** → Thêm các biến sau:

#### ✅ Bắt Buộc (Phải có):

- [ ] **DATABASE_URL**
  ```
  postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```
  (Lấy từ Bước 1.2)

- [ ] **REDIS_URL**
  ```
  rediss://default:[PASSWORD]@[ENDPOINT]:6379
  ```
  (Lấy từ Bước 2.2)

- [ ] **PUBLIC_URL** (Set sau khi deploy xong)
  ```
  https://lms-backend-xxxx.onrender.com
  ```
  ⚠️ **Lưu ý**: Set tạm `http://localhost:3000` trước, sau khi deploy xong sẽ update lại

#### ✅ Tự Động Generate (Render tự tạo):

- [ ] **JWT_SECRET** - Render tự động generate
- [ ] **SESSION_SECRET** - Render tự động generate

#### ⚙️ Optional (Nếu cần):

- [ ] **GEMINI_API_KEY** (nếu dùng AI Tutor)
- [ ] **GROQ_API_KEY** (nếu dùng AI Tutor)
- [ ] **R2_ENDPOINT**, **R2_ACCESS_KEY_ID**, **R2_SECRET_ACCESS_KEY**, **R2_BUCKET_NAME**, **R2_PUBLIC_URL** (nếu dùng Cloudflare R2)

### 3.3. Deploy Backend

- [ ] Click **"Save Changes"** trong Environment
- [ ] Render sẽ tự động deploy
- [ ] Đợi deploy xong (5-10 phút)
- [ ] Kiểm tra status: **"Live"** (màu xanh)
- [ ] Copy **Backend URL**: `https://lms-backend-xxxx.onrender.com`
- [ ] Test health check: `https://lms-backend-xxxx.onrender.com/health`

### 3.4. Update PUBLIC_URL

- [ ] Vào **`lms-backend`** → **Environment**
- [ ] Update **PUBLIC_URL** = Backend URL vừa copy
- [ ] Click **"Save Changes"** → Service sẽ redeploy

---

## 🎨 Bước 4: Deploy Frontend

### 4.1. Set Environment Variables cho Frontend

Vào service **`lms-frontend`** → **Environment** → Thêm các biến sau:

#### ✅ Bắt Buộc (Phải set TRƯỚC khi build):

- [ ] **VITE_API_URL**
  ```
  https://lms-backend-xxxx.onrender.com/api
  ```
  (Backend URL + `/api`)

- [ ] **VITE_WS_URL**
  ```
  https://lms-backend-xxxx.onrender.com
  ```
  (Backend URL, không có `/api`)

- [ ] **VITE_SOCKET_URL**
  ```
  https://lms-backend-xxxx.onrender.com
  ```
  (Giống VITE_WS_URL)

⚠️ **QUAN TRỌNG**: 
- Phải set **TRƯỚC KHI BUILD**
- Nếu chưa có backend URL, có thể set tạm localhost, sau đó update và redeploy

### 4.2. Deploy Frontend

- [ ] Click **"Save Changes"** trong Environment
- [ ] Render sẽ tự động build và deploy
- [ ] Đợi build xong (3-5 phút)
- [ ] Kiểm tra status: **"Live"** (màu xanh)
- [ ] Copy **Frontend URL**: `https://lms-frontend-xxxx.onrender.com`

---

## 🔗 Bước 5: Kết Nối Frontend và Backend

### 5.1. Update CORS trong Backend

- [ ] Vào **`lms-backend`** → **Environment**
- [ ] Update **CORS_ALLOWED_ORIGINS**:
  ```
  https://lms-frontend-xxxx.onrender.com,http://localhost:3000,http://localhost:5173
  ```
  (Thêm frontend URL vào đầu danh sách)

- [ ] Update **FRONTEND_URL**:
  ```
  https://lms-frontend-xxxx.onrender.com
  ```

- [ ] Click **"Save Changes"** → Service sẽ redeploy

### 5.2. Test Kết Nối

- [ ] Mở Frontend URL trong browser
- [ ] Mở **DevTools** → **Console** → Kiểm tra không có lỗi CORS
- [ ] Mở **Network** tab → Kiểm tra API calls có thành công không
- [ ] Test đăng nhập/đăng ký (nếu có)
- [ ] Test WebSocket (nếu dùng AI Chat)

---

## ✅ Bước 6: Kiểm Tra Cuối Cùng

### Backend Health Check

- [ ] Backend health: `https://lms-backend-xxxx.onrender.com/health`
  - Kết quả: `{"status":"ok","timestamp":"..."}`
- [ ] Backend API: `https://lms-backend-xxxx.onrender.com/api/v1.3.0/health`
  - Kết quả: `{"status":"ok",...}`

### Frontend Check

- [ ] Frontend load được: `https://lms-frontend-xxxx.onrender.com`
- [ ] Không có lỗi trong Console
- [ ] API calls thành công (check Network tab)
- [ ] WebSocket kết nối được (nếu dùng)

### Database Check

- [ ] Vào Supabase → **Table Editor** → Kiểm tra tables đã được tạo chưa
- [ ] Nếu chưa có tables, chạy migrations:
  ```bash
  # Local: cd backend && npm run migrate
  # Hoặc dùng Supabase SQL Editor để chạy migrations
  ```

### Redis Check

- [ ] Vào Upstash → **Data Browser** → Kiểm tra có thể connect được không
- [ ] Backend logs không có lỗi Redis connection

---

## 🐛 Troubleshooting

### Backend không start được

**Lỗi**: `DATABASE_URL is required`
- ✅ Kiểm tra đã set `DATABASE_URL` chưa
- ✅ Kiểm tra connection string đúng format chưa

**Lỗi**: `Redis connection failed`
- ✅ Kiểm tra đã set `REDIS_URL` chưa
- ✅ Kiểm tra connection string có `rediss://` (2 chữ s) chưa
- ✅ Kiểm tra Upstash database đang active chưa

**Lỗi**: `JWT_SECRET is required`
- ✅ Render tự động generate, kiểm tra lại trong Environment

### Frontend không build được

**Lỗi**: `VITE_API_URL is not defined`
- ✅ Set `VITE_API_URL` trong Environment trước khi build
- ✅ Redeploy sau khi set

**Lỗi**: Build fail với lỗi TypeScript
- ✅ Kiểm tra `package.json` có đúng Node version không
- ✅ Xem build logs trong Render Dashboard

### CORS Error

**Lỗi**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- ✅ Kiểm tra `CORS_ALLOWED_ORIGINS` có chứa frontend URL chưa
- ✅ Kiểm tra frontend URL đúng format (https://, không có trailing slash)
- ✅ Redeploy backend sau khi update CORS

### WebSocket không kết nối

**Lỗi**: `WebSocket connection failed`
- ✅ Kiểm tra `VITE_WS_URL` đúng chưa
- ✅ Kiểm tra backend có enable Socket.IO không
- ✅ Kiểm tra firewall/proxy settings

---

## 📝 Notes

### Render Free Tier Limitations

- ⚠️ Services sẽ **sleep sau 15 phút** không có traffic
- ⚠️ Lần đầu wake up sẽ mất **30-60 giây**
- ⚠️ Build time có thể lâu hơn (5-10 phút)
- 💡 Upgrade lên **Starter** ($7/month) để tránh sleep

### Environment Variables Best Practices

- ✅ **Không commit** `.env` files lên Git
- ✅ Dùng `sync: false` cho sensitive data (API keys, passwords)
- ✅ Dùng `generateValue: true` cho secrets (JWT_SECRET, etc.)
- ✅ Set default values cho non-sensitive configs

### Database Migrations

- ✅ Chạy migrations sau khi deploy backend
- ✅ Có thể dùng Supabase SQL Editor hoặc CLI
- ✅ Backup database trước khi chạy migrations

---

## 🎉 Hoàn Thành!

Nếu tất cả checklist đều ✅, bạn đã deploy thành công!

**URLs của bạn:**
- Frontend: `https://lms-frontend-xxxx.onrender.com`
- Backend: `https://lms-backend-xxxx.onrender.com`
- API: `https://lms-backend-xxxx.onrender.com/api`

**Next Steps:**
- [ ] Setup custom domain (nếu cần)
- [ ] Setup SSL certificate (Render tự động)
- [ ] Setup monitoring/alerts
- [ ] Setup CI/CD (auto-deploy khi push code)

