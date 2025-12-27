# 🚀 Deploy Render Đơn Giản - Không Cần PostgreSQL/Redis

## ✅ Giải Pháp: Dùng SQLite + Disable Redis

Backend đã hỗ trợ SQLite và có thể disable Redis, giống như chạy local!

---

## 📋 Các Bước Deploy

### **Bước 1: Commit và Push Code**

```bash
git add render.yaml
git commit -m "Configure Render to use SQLite (no PostgreSQL/Redis needed)"
git push origin dev/backend
```

---

### **Bước 2: Deploy Trên Render**

#### **Option A: Sử dụng Blueprint (Khuyến nghị)**

1. **Vào Render Dashboard:**
   - https://dashboard.render.com
   - Click **"New"** → **"Blueprint"**

2. **Cấu hình:**
   - **Repository:** Chọn repo của bạn
   - **Branch:** `dev/backend`
   - **Blueprint Name:** `lms-backend-simple`
   - Click **"Apply"**

3. **Render sẽ tự động:**
   - Deploy backend service
   - Sử dụng SQLite (file database)
   - Disable Redis

#### **Option B: Deploy Manual**

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
   ```
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=info
   DB_DIALECT=sqlite
   SQLITE=true
   SQLITE_PATH=/tmp/lms.sqlite
   DATABASE_URL=sqlite:/tmp/lms.sqlite
   REDIS_DISABLED=true
   JWT_SECRET=<generate random 32+ characters>
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   FRONTEND_URL=http://localhost:3000
   ```

5. **Click "Create Web Service"**

---

### **Bước 3: Chạy Migrations**

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

### **Bước 4: Test API**

1. **Health Check:**
   ```
   https://your-service.onrender.com/health
   ```

2. **API Docs:**
   ```
   https://your-service.onrender.com/api-docs
   ```

---

## ⚠️ Lưu Ý Quan Trọng

### **SQLite trên Render:**

1. **File Location:**
   - SQLite file sẽ lưu trong `/tmp/lms.sqlite`
   - **⚠️ Dữ liệu sẽ MẤT khi service restart/redeploy**
   - Render free tier không persist data trong `/tmp`

2. **Giải Pháp:**
   - **Cho test:** OK, dữ liệu mất không sao
   - **Cho production:** Nên dùng PostgreSQL (có persistent storage)

3. **Backup (nếu cần):**
   - Có thể backup file SQLite trước khi restart
   - Hoặc export data ra SQL và import lại

### **Redis Disabled:**

- Cache sẽ dùng memory cache thay vì Redis
- Một số tính năng cache có thể không hoạt động tối ưu
- Nhưng backend vẫn chạy bình thường

---

## ✅ Ưu Điểm

- ✅ **Không cần tạo PostgreSQL/Redis**
- ✅ **Deploy nhanh, đơn giản**
- ✅ **Giống môi trường local**
- ✅ **Free tier, không tốn thêm tiền**

## ⚠️ Nhược Điểm

- ⚠️ **Dữ liệu không persistent** (mất khi restart)
- ⚠️ **Không phù hợp production**
- ⚠️ **SQLite có giới hạn concurrent connections**

---

## 🎯 Khi Nào Dùng

### **✅ Dùng SQLite khi:**
- Test/debug nhanh
- Demo prototype
- Development
- Không cần lưu dữ liệu lâu dài

### **❌ Không nên dùng SQLite khi:**
- Production thực tế
- Cần lưu dữ liệu lâu dài
- Có nhiều users đồng thời
- Cần backup/restore data

---

## 🔄 Nâng Cấp Lên PostgreSQL (Sau Khi Test)

Khi cần production, có thể:

1. **Tạo PostgreSQL trên Render**
2. **Export data từ SQLite:**
   ```bash
   sqlite3 /tmp/lms.sqlite .dump > backup.sql
   ```
3. **Import vào PostgreSQL**
4. **Update DATABASE_URL trong Environment Variables**
5. **Redeploy service**

---

## 📝 Checklist

- [ ] Commit và push `render.yaml` mới
- [ ] Deploy service trên Render (Blueprint hoặc Manual)
- [ ] Chạy migrations
- [ ] Test API endpoints
- [ ] Kiểm tra dữ liệu (nhớ sẽ mất khi restart)

---

**Vậy là bạn có thể deploy ngay mà không cần setup PostgreSQL/Redis! 🎉**

