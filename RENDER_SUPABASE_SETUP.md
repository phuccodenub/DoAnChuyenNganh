# 🚀 Deploy Render Với Supabase PostgreSQL

## ✅ Giải Pháp: Dùng Supabase PostgreSQL (External Database)

Bạn đã có Supabase PostgreSQL, chỉ cần set connection string là xong!

---

## 📋 Các Bước Setup

### **Bước 1: Lấy Supabase Connection String**

1. **Vào Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Chọn project của bạn

2. **Lấy Connection String:**
   - Vào **Settings** → **Database**
   - Tìm **Connection string** → **URI**
   - Copy connection string (format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

3. **Hoặc lấy từ .env local:**
   - Mở file `.env` trong backend
   - Copy giá trị `DATABASE_URL`

---

### **Bước 2: Deploy Backend Service Trên Render**

#### **Option A: Sử dụng Blueprint**

1. **Commit và push code:**
   ```bash
   git add render.yaml
   git commit -m "Configure Render to use Supabase PostgreSQL"
   git push origin dev/backend
   ```

2. **Vào Render Dashboard:**
   - https://dashboard.render.com
   - Click **"New"** → **"Blueprint"**

3. **Cấu hình:**
   - **Repository:** Chọn repo của bạn
   - **Branch:** `dev/backend`
   - **Blueprint Name:** `lms-backend`
   - Click **"Apply"**

4. **Set Environment Variables:**
   - Vào service → **Environment**
   - Set **DATABASE_URL:** Paste Supabase connection string
   - Click **"Save Changes"**

#### **Option B: Deploy Manual (Khuyến nghị)**

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
   DATABASE_URL=<Paste Supabase connection string>
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

## 🔐 Supabase Connection String Format

### **Connection Pooling (Khuyến nghị):**
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

### **Direct Connection:**
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

### **Lưu ý:**
- Thay `[PASSWORD]` bằng password của bạn
- Thay `[PROJECT-REF]` bằng project reference từ Supabase
- Port `6543` = Connection pooling (tốt hơn cho production)
- Port `5432` = Direct connection

---

## ✅ Ưu Điểm

- ✅ **Dùng database hiện có** (Supabase)
- ✅ **Không cần tạo database mới** trên Render
- ✅ **Data persistent** (lưu trên Supabase)
- ✅ **Free tier Supabase** đủ cho test
- ✅ **Đơn giản, chỉ cần set connection string**

---

## ⚠️ Lưu Ý

### **Supabase Free Tier:**
- 500MB database storage
- 2GB bandwidth
- Connection pooling: 60 connections
- Đủ cho test/small production

### **Security:**
- **KHÔNG commit** connection string vào code
- Chỉ set trong Render Environment Variables
- Sử dụng connection pooling URL (port 6543) cho production

### **Redis:**
- Hiện tại disable Redis (`REDIS_DISABLED=true`)
- Nếu cần Redis, có thể:
  - Dùng Supabase Realtime (nếu phù hợp)
  - Hoặc tạo Redis trên Render
  - Hoặc dùng external Redis service

---

## 🔄 Nếu Cần Redis

### **Option 1: Tạo Redis trên Render**
1. Dashboard → New → Redis
2. Copy Internal Redis URL
3. Set `REDIS_URL` trong Environment Variables
4. Set `REDIS_DISABLED=false`

### **Option 2: Dùng External Redis**
- Upstash Redis (free tier)
- Redis Cloud (free tier)
- Set `REDIS_URL` với external connection string

---

## 📝 Checklist

- [ ] Lấy Supabase connection string
- [ ] Deploy service trên Render
- [ ] Set DATABASE_URL trong Environment Variables
- [ ] Chạy migrations
- [ ] Test API endpoints
- [ ] Kiểm tra kết nối database

---

## 🎯 Kết Luận

**Đơn giản chỉ cần:**
1. Deploy service trên Render
2. Set `DATABASE_URL` = Supabase connection string
3. Chạy migrations
4. Xong! 🎉

**Không cần:**
- ❌ Tạo PostgreSQL trên Render
- ❌ Setup phức tạp
- ❌ SQLite

---

**Vậy là bạn có thể dùng Supabase PostgreSQL như local rồi! 🚀**

