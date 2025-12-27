# 🚀 Hướng Dẫn Deploy Render - Từng Bước

## ⚠️ Vấn Đề Hiện Tại

Render Blueprint **KHÔNG THỂ** tạo PostgreSQL và Redis tự động. Bạn cần tạo thủ công trước.

---

## 📋 Các Bước Deploy

### **Bước 1: Tạo PostgreSQL Database** ✅

1. Vào **Render Dashboard**: https://dashboard.render.com
2. Click **"New"** → **"PostgreSQL"**
3. Cấu hình:
   - **Name:** `lms-postgres` ⚠️ **QUAN TRỌNG: Tên phải đúng**
   - **Database:** `lms_db` (hoặc để mặc định)
   - **Region:** Singapore (hoặc gần bạn)
   - **Plan:** Free (cho test)
4. Click **"Create Database"**
5. **Lưu lại:**
   - Vào database → **"Connections"**
   - Copy **"Internal Database URL"** (sẽ dùng ở Bước 3)

---

### **Bước 2: Tạo Redis Cache** ✅

1. Vào **Render Dashboard**
2. Click **"New"** → **"Redis"**
3. Cấu hình:
   - **Name:** `lms-redis` ⚠️ **QUAN TRỌNG: Tên phải đúng**
   - **Region:** Cùng region với PostgreSQL
   - **Plan:** Free (cho test)
4. Click **"Create Redis"**
5. **Lưu lại:**
   - Vào Redis → **"Connections"**
   - Copy **"Internal Redis URL"** (sẽ dùng ở Bước 3)

---

### **Bước 3: Deploy Backend Service** ✅

#### **Option A: Sử dụng Blueprint (Sau khi đã tạo database/Redis)**

1. **Commit và push `render.yaml` mới:**
   ```bash
   git add render.yaml
   git commit -m "Update render.yaml for Render deployment"
   git push origin dev/backend
   ```

2. **Vào Render Dashboard:**
   - Click **"New"** → **"Blueprint"**
   - **Repository:** Chọn repo của bạn
   - **Branch:** `dev/backend`
   - **Blueprint Name:** `lms-backend-blueprint`
   - Click **"Apply"**

3. **Render sẽ tự động:**
   - Deploy backend service
   - Link với `lms-postgres` và `lms-redis` (nếu tên khớp)

4. **Cấu hình Environment Variables:**
   - Vào service → **Environment**
   - Set **DATABASE_URL:** Paste Internal Database URL từ Bước 1
   - Set **REDIS_URL:** Paste Internal Redis URL từ Bước 2
   - Hoặc nếu đã link resources, Render tự động set

#### **Option B: Deploy Manual (Đơn giản hơn - Khuyến nghị)**

1. **Vào Render Dashboard:**
   - Click **"New"** → **"Web Service"**

2. **Connect Repository:**
   - Chọn repo: `phuccodenub/DoAnChuyenNganh`
   - Chọn branch: `dev/backend`

3. **Cấu hình Service:**
   - **Name:** `lms-backend`
   - **Region:** Singapore
   - **Plan:** Free
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Environment Variables:**
   - Click **"Add Environment Variable"**
   - Thêm các biến sau:
     ```
     NODE_ENV=production
     PORT=3000
     LOG_LEVEL=info
     DATABASE_URL=<Paste Internal Database URL từ Bước 1>
     REDIS_URL=<Paste Internal Redis URL từ Bước 2>
     JWT_SECRET=<Generate random 32+ characters>
     CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
     FRONTEND_URL=http://localhost:3000
     REDIS_DISABLED=false
     ```

5. **Link Resources:**
   - Scroll xuống phần **"Link Resource"**
   - Click **"Link Existing"**
   - Chọn `lms-postgres` (PostgreSQL)
   - Chọn `lms-redis` (Redis)

6. **Click "Create Web Service"**

---

### **Bước 4: Chạy Migrations** ✅

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

### **Bước 5: Test API** ✅

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
- [ ] Set environment variables (DATABASE_URL, REDIS_URL)
- [ ] Link resources (nếu dùng Manual)
- [ ] Chạy migrations
- [ ] Test API endpoints

---

## 🎯 Khuyến Nghị

**Dùng Option B (Manual)** vì:
- ✅ Đơn giản hơn
- ✅ Dễ debug
- ✅ Kiểm soát tốt hơn
- ✅ Không phụ thuộc Blueprint

**Sau khi test xong, có thể:**
- Upgrade lên Starter plan ($7/tháng)
- Hoặc chuyển sang VPS nếu cần

---

**Thời gian ước tính:** 15-20 phút

