# 🚀 Hướng Dẫn Deploy LMS Backend Lên Render

## 📋 Tổng Quan

Hướng dẫn này giúp bạn deploy backend LMS lên Render khi repo thuộc tài khoản GitHub khác.

---

## 🔐 Giải Quyết Vấn Đề Quyền Truy Cập Repo

Có **4 cách** để giải quyết vấn đề này:

### **Cách 1: Fork Repo (Khuyến nghị - Dễ nhất) ⭐**

1. **Fork repo về tài khoản của bạn:**
   - Vào repo gốc trên GitHub
   - Click nút **"Fork"** ở góc trên bên phải
   - Chọn tài khoản của bạn để fork

2. **Clone repo đã fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DoAnChuyenNganh.git
   cd DoAnChuyenNganh
   ```

3. **Thêm remote upstream để sync với repo gốc:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/DoAnChuyenNganh.git
   ```

4. **Checkout nhánh dev/backend:**
   ```bash
   git checkout dev/backend
   ```

5. **Deploy từ repo fork của bạn trên Render**

**Ưu điểm:**
- ✅ Dễ thực hiện
- ✅ Có thể sync với repo gốc khi cần
- ✅ Toàn quyền quản lý

**Nhược điểm:**
- ⚠️ Cần maintain fork riêng

---

### **Cách 2: Tạo Repo Mới Và Push Code**

1. **Tạo repo mới trên GitHub:**
   - Vào GitHub → New Repository
   - Đặt tên: `lms-backend-deploy` (hoặc tên khác)

2. **Push code hiện tại lên repo mới:**
   ```bash
   # Đảm bảo đang ở nhánh dev/backend
   git checkout dev/backend
   
   # Thêm remote mới
   git remote add deploy https://github.com/YOUR_USERNAME/lms-backend-deploy.git
   
   # Push code
   git push deploy dev/backend:main
   ```

3. **Deploy từ repo mới trên Render**

**Ưu điểm:**
- ✅ Toàn quyền quản lý
- ✅ Không phụ thuộc repo gốc

**Nhược điểm:**
- ⚠️ Cần sync thủ công khi có update từ repo gốc

---

### **Cách 3: Yêu Cầu Quyền Collaborator**

1. **Liên hệ chủ repo gốc:**
   - Yêu cầu thêm bạn làm collaborator
   - Hoặc yêu cầu quyền deploy

2. **Khi được cấp quyền:**
   - Deploy trực tiếp từ repo gốc
   - Hoặc tạo nhánh riêng để deploy

**Ưu điểm:**
- ✅ Giữ nguyên repo gốc
- ✅ Dễ sync với team

**Nhược điểm:**
- ⚠️ Phụ thuộc vào chủ repo

---

### **Cách 4: Sử dụng Deploy Key (Phức tạp)**

1. **Tạo SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "render-deploy" -f ~/.ssh/render_deploy
   ```

2. **Thêm public key vào repo:**
   - Vào repo → Settings → Deploy keys
   - Add deploy key với public key

3. **Cấu hình trên Render:**
   - Sử dụng SSH URL thay vì HTTPS
   - Thêm private key vào Render secrets

**Ưu điểm:**
- ✅ Không cần fork

**Nhược điểm:**
- ⚠️ Phức tạp hơn
- ⚠️ Chỉ đọc được (read-only)

---

## 🚀 Bước 1: Chuẩn Bị Repo

Sau khi chọn cách giải quyết quyền truy cập, đảm bảo:

1. **Code đã được commit và push:**
   ```bash
   git status
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin dev/backend  # hoặc main nếu dùng repo mới
   ```

2. **Kiểm tra nhánh:**
   ```bash
   git branch -a
   ```

---

## 🚀 Bước 2: Tạo Tài Khoản Render

1. **Đăng ký tài khoản:**
   - Vào https://render.com
   - Đăng ký bằng GitHub account (khuyến nghị)

2. **Kết nối GitHub:**
   - Vào Dashboard → Settings → Connected Accounts
   - Kết nối GitHub account

---

## 🚀 Bước 3: Tạo Database PostgreSQL

1. **Tạo PostgreSQL Database:**
   - Vào Dashboard → New → PostgreSQL
   - Đặt tên: `lms-postgres`
   - Chọn plan: **Free** (hoặc Starter nếu cần)
   - Region: Singapore (hoặc gần bạn nhất)
   - Click **Create Database**

2. **Lưu thông tin kết nối:**
   - Render sẽ tự động tạo connection string
   - Copy để dùng sau

---

## 🚀 Bước 4: Tạo Redis Cache

1. **Tạo Redis:**
   - Vào Dashboard → New → Redis
   - Đặt tên: `lms-redis`
   - Chọn plan: **Free** (hoặc Starter)
   - Region: Cùng region với PostgreSQL
   - Click **Create Redis**

2. **Lưu connection string**

---

## 🚀 Bước 5: Deploy Backend Service

### **Option A: Sử dụng render.yaml (Khuyến nghị)**

1. **Đảm bảo file `render.yaml` đã có trong repo:**
   - File đã được tạo ở root directory
   - Commit và push lên repo

2. **Deploy từ Dashboard:**
   - Vào Dashboard → New → Blueprint
   - Chọn repo của bạn
   - Chọn nhánh: `dev/backend` (hoặc `main`)
   - Render sẽ tự động detect `render.yaml`
   - Click **Apply**

3. **Render sẽ tự động:**
   - Tạo PostgreSQL database
   - Tạo Redis cache
   - Deploy backend service
   - Link các services với nhau

### **Option B: Deploy Manual (Không dùng render.yaml)**

1. **Tạo Web Service:**
   - Vào Dashboard → New → Web Service
   - Chọn repo của bạn
   - Chọn nhánh: `dev/backend`

2. **Cấu hình Build & Start:**
   - **Name:** `lms-backend`
   - **Region:** Singapore (hoặc gần bạn)
   - **Branch:** `dev/backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Cấu hình Environment Variables:**
   - Xem danh sách ở phần dưới

4. **Link Database và Redis:**
   - Vào tab **Environment**
   - Click **Link Resource**
   - Chọn `lms-postgres` (PostgreSQL)
   - Chọn `lms-redis` (Redis)

5. **Click Create Web Service**

---

## 🔧 Bước 6: Cấu Hình Environment Variables

Thêm các biến môi trường sau vào Render Dashboard:

### **Bắt buộc:**

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database (tự động link nếu dùng Link Resource)
DATABASE_URL=<từ PostgreSQL service>

# Redis (tự động link nếu dùng Link Resource)
REDIS_URL=<từ Redis service>

# JWT
JWT_SECRET=<generate random string, ít nhất 32 ký tự>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=lms-backend
JWT_AUDIENCE=lms-frontend

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com,http://localhost:3000
FRONTEND_URL=https://your-frontend.onrender.com
```

### **Tùy chọn (AI Features):**

```env
# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Groq
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

# AI Features
AI_TUTOR_ENABLED=true
AI_QUIZ_GENERATOR_ENABLED=true
AI_GRADER_ENABLED=false
```

### **Tùy chọn (Email):**

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=LMS System <noreply@lms.com>
```

### **Tùy chọn (File Storage):**

```env
STORAGE_TYPE=local
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

---

## 🗄️ Bước 7: Chạy Migrations

Sau khi deploy, cần chạy migrations để tạo database schema:

### **Cách 1: Sử dụng Render Shell**

1. Vào Backend Service → Shell
2. Chạy lệnh:
   ```bash
   cd backend
   npm run migrate
   ```

### **Cách 2: Sử dụng Script**

1. Thêm script vào `package.json`:
   ```json
   "migrate:render": "node dist/scripts/migrate.js"
   ```

2. Chạy từ Shell:
   ```bash
   npm run migrate:render
   ```

### **Cách 3: Tự động chạy khi deploy**

Thêm vào `render.yaml`:
```yaml
buildCommand: cd backend && npm install && npm run build && npm run migrate
```

---

## 🌱 Bước 8: Seed Database (Tùy chọn)

Nếu cần dữ liệu mẫu:

```bash
# Từ Render Shell
cd backend
npm run seed
```

---

## ✅ Bước 9: Kiểm Tra Deployment

1. **Kiểm tra Health Check:**
   - Vào Service → Logs
   - Tìm dòng: `🚀 Server running on port 3000`
   - Kiểm tra: `https://your-service.onrender.com/health`

2. **Kiểm tra API:**
   ```bash
   curl https://your-service.onrender.com/api/v1/health
   ```

3. **Kiểm tra Swagger Docs:**
   - Vào: `https://your-service.onrender.com/api-docs`

---

## 🔄 Bước 10: Auto-Deploy Setup

Render tự động deploy khi:
- Push code lên nhánh đã cấu hình
- Merge pull request

**Cấu hình:**
- Vào Service → Settings → Auto-Deploy
- Chọn nhánh: `dev/backend` (hoặc `main`)
- Enable **Auto-Deploy**

---

## 🐛 Troubleshooting

### **Lỗi Build:**

1. **Kiểm tra logs:**
   - Vào Service → Logs
   - Xem lỗi build

2. **Common issues:**
   - Thiếu dependencies → Kiểm tra `package.json`
   - TypeScript errors → Fix trước khi push
   - Memory limit → Upgrade plan

### **Lỗi Database Connection:**

1. **Kiểm tra DATABASE_URL:**
   ```bash
   # Từ Shell
   echo $DATABASE_URL
   ```

2. **Kiểm tra network:**
   - Đảm bảo PostgreSQL và Backend cùng region
   - Kiểm tra firewall settings

### **Lỗi Redis Connection:**

1. **Kiểm tra REDIS_URL:**
   ```bash
   echo $REDIS_URL
   ```

2. **Disable Redis nếu không cần:**
   ```env
   REDIS_DISABLED=true
   ```

### **Lỗi Port:**

- Render tự động set PORT, không cần config
- Đảm bảo code sử dụng `process.env.PORT || 3000`

### **Lỗi CORS:**

1. **Cập nhật CORS_ALLOWED_ORIGINS:**
   ```env
   CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
   ```

2. **Redeploy service**

---

## 📊 Monitoring

1. **Xem Logs:**
   - Vào Service → Logs
   - Real-time logs

2. **Metrics:**
   - Vào Service → Metrics
   - CPU, Memory, Request rate

3. **Alerts:**
   - Vào Service → Alerts
   - Setup email notifications

---

## 💰 Pricing

### **Free Tier:**
- ✅ 750 hours/month
- ✅ Sleep sau 15 phút không có traffic
- ✅ PostgreSQL: 90 ngày (sau đó xóa)
- ✅ Redis: 25MB

### **Starter Plan ($7/month):**
- ✅ Always on
- ✅ PostgreSQL: Persistent
- ✅ Redis: 100MB
- ✅ Better performance

---

## 🔐 Security Best Practices

1. **JWT Secret:**
   - Sử dụng random string dài (32+ ký tự)
   - Không commit vào code

2. **API Keys:**
   - Lưu trong Environment Variables
   - Không commit vào code

3. **Database:**
   - Sử dụng connection string từ Render
   - Không hardcode credentials

4. **CORS:**
   - Chỉ allow domain cần thiết
   - Không dùng `*` trong production

---

## 📝 Checklist

- [ ] Fork/Tạo repo mới
- [ ] Push code lên repo
- [ ] Tạo tài khoản Render
- [ ] Tạo PostgreSQL database
- [ ] Tạo Redis cache
- [ ] Deploy backend service
- [ ] Cấu hình environment variables
- [ ] Chạy migrations
- [ ] Seed database (nếu cần)
- [ ] Kiểm tra health check
- [ ] Test API endpoints
- [ ] Setup auto-deploy
- [ ] Cấu hình CORS
- [ ] Setup monitoring

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành các bước trên, backend của bạn sẽ chạy trên Render!

**URL:** `https://your-service.onrender.com`

**API Docs:** `https://your-service.onrender.com/api-docs`

---

## 📚 Tài Liệu Tham Khảo

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Render Redis](https://render.com/docs/redis)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Cần hỗ trợ?** Tạo issue trên repo hoặc liên hệ team!

