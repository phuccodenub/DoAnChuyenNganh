# 🔧 Hướng Dẫn Setup Thủ Công Trên Render

## ⚠️ Lưu Ý Quan Trọng

Render Blueprint **KHÔNG hỗ trợ** tạo PostgreSQL và Redis tự động trong `render.yaml`. Bạn cần tạo thủ công trước.

---

## 📋 Các Bước Setup

### Bước 1: Tạo PostgreSQL Database

1. **Vào Render Dashboard:**
   - https://dashboard.render.com
   - Click **"New"** → **"PostgreSQL"**

2. **Cấu hình Database:**
   - **Name:** `lms-postgres`
   - **Database:** `lms_db` (hoặc để mặc định)
   - **User:** `lms_user` (hoặc để mặc định)
   - **Region:** Singapore (hoặc gần bạn nhất)
   - **Plan:** Free (cho test) hoặc Starter (cho production)
   - Click **"Create Database"**

3. **Lưu thông tin:**
   - Sau khi tạo, vào database → **"Connections"**
   - Copy **"Internal Database URL"** (sẽ dùng sau)

---

### Bước 2: Tạo Redis Cache

1. **Vào Render Dashboard:**
   - Click **"New"** → **"Redis"**

2. **Cấu hình Redis:**
   - **Name:** `lms-redis`
   - **Region:** Cùng region với PostgreSQL
   - **Plan:** Free (cho test) hoặc Starter (cho production)
   - Click **"Create Redis"**

3. **Lưu thông tin:**
   - Sau khi tạo, vào Redis → **"Connections"**
   - Copy **"Internal Redis URL"** (sẽ dùng sau)

---

### Bước 3: Deploy Backend Service

#### Option A: Sử dụng Blueprint (Khuyến nghị)

1. **Vào Render Dashboard:**
   - Click **"New"** → **"Blueprint"**

2. **Cấu hình Blueprint:**
   - **Repository:** Chọn repo của bạn
   - **Branch:** `dev/backend`
   - **Blueprint Name:** `lms-backend-blueprint`
   - Click **"Apply"**

3. **Render sẽ tự động:**
   - Deploy backend service
   - Link với PostgreSQL và Redis đã tạo (nếu tên khớp)

#### Option B: Deploy Manual (Nếu Blueprint không hoạt động)

1. **Vào Render Dashboard:**
   - Click **"New"** → **"Web Service"**

2. **Cấu hình Service:**
   - **Repository:** Chọn repo của bạn
   - **Branch:** `dev/backend`
   - **Name:** `lms-backend`
   - **Region:** Singapore
   - **Plan:** Free (cho test)

3. **Build & Start Commands:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Environment Variables:**
   - Thêm các biến từ file `.env.example`
   - **DATABASE_URL:** Paste Internal Database URL từ Bước 1
   - **REDIS_URL:** Paste Internal Redis URL từ Bước 2
   - **JWT_SECRET:** Generate random string (32+ characters)
   - **CORS_ALLOWED_ORIGINS:** `http://localhost:3000,http://localhost:5173`

5. **Link Resources:**
   - Vào tab **"Environment"**
   - Click **"Link Resource"**
   - Chọn `lms-postgres` (PostgreSQL)
   - Chọn `lms-redis` (Redis)

6. **Click "Create Web Service"**

---

### Bước 4: Chạy Migrations

1. **Vào Backend Service:**
   - Click vào service `lms-backend`
   - Tab **"Shell"**
   - Click **"Connect"**

2. **Chạy migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

3. **Seed database (tùy chọn):**
   ```bash
   npm run seed
   ```

---

### Bước 5: Test API

1. **Health Check:**
   ```
   https://your-service.onrender.com/health
   ```

2. **API Docs:**
   ```
   https://your-service.onrender.com/api-docs
   ```

3. **Test Login:**
   ```bash
   curl -X POST https://your-service.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Admin123!"}'
   ```

---

## ✅ Checklist

- [ ] Tạo PostgreSQL database (`lms-postgres`)
- [ ] Tạo Redis cache (`lms-redis`)
- [ ] Deploy backend service (Blueprint hoặc Manual)
- [ ] Link database và Redis với service
- [ ] Cấu hình environment variables
- [ ] Chạy migrations
- [ ] Test API endpoints

---

## 🆘 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra DATABASE_URL đúng chưa
- Đảm bảo đã link database với service
- Kiểm tra database đã start chưa

### Lỗi: "Cannot connect to Redis"
- Kiểm tra REDIS_URL đúng chưa
- Đảm bảo đã link Redis với service
- Có thể disable Redis tạm: `REDIS_DISABLED=true`

### Service không start
- Xem logs trong Dashboard
- Kiểm tra build command và start command
- Kiểm tra environment variables

---

**Sau khi setup xong, bạn có thể test và đánh giá trước khi quyết định mua VPS!**

