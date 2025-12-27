# ✅ Checklist Test Render - LMS Backend

## 🎯 Mục Tiêu
Test deploy backend LMS lên Render free tier để đánh giá trước khi quyết định mua VPS.

---

## 📋 Checklist Chi Tiết

### Bước 1: Chuẩn Bị Repo ✅

- [ ] **Fork repo về tài khoản GitHub của bạn**
  - Vào repo gốc → Click "Fork"
  - Chọn tài khoản của bạn

- [ ] **Clone repo đã fork về máy:**
  ```bash
  git clone https://github.com/YOUR_USERNAME/DoAnChuyenNganh.git
  cd DoAnChuyenNganh
  ```

- [ ] **Checkout nhánh dev/backend:**
  ```bash
  git checkout dev/backend
  ```

- [ ] **Kiểm tra các file đã có:**
  - [x] `render.yaml` (đã có)
  - [x] `backend/Dockerfile` (đã có)
  - [x] `RENDER_DEPLOY_GUIDE.md` (đã có)

- [ ] **Commit và push lên repo:**
  ```bash
  git add render.yaml backend/Dockerfile RENDER_DEPLOY_GUIDE.md DEPLOY_QUICK_START.md RENDER_TEST_CHECKLIST.md
  git commit -m "Add Render deployment configuration for testing"
  git push origin dev/backend
  ```

---

### Bước 2: Tạo Tài Khoản Render ✅

- [ ] **Đăng ký tài khoản Render:**
  - Vào: https://render.com
  - Click "Get Started for Free"
  - Đăng ký bằng GitHub (khuyến nghị)

- [ ] **Kết nối GitHub:**
  - Dashboard → Settings → Connected Accounts
  - Click "Connect GitHub"
  - Authorize Render

---

### Bước 3: Deploy Với Blueprint (Tự Động) ✅

- [ ] **Tạo Blueprint:**
  - Dashboard → New → Blueprint
  - Chọn repo của bạn: `YOUR_USERNAME/DoAnChuyenNganh`
  - Chọn nhánh: `dev/backend`
  - Click "Apply"

- [ ] **Render sẽ tự động tạo:**
  - [ ] PostgreSQL database (free tier - 90 ngày)
  - [ ] Redis cache (free tier - 25MB)
  - [ ] Backend web service (free tier)

- [ ] **Chờ deploy hoàn tất** (5-10 phút)
  - Xem logs trong Dashboard
  - Đợi build và start service

---

### Bước 4: Cấu Hình Environment Variables ✅

Vào **Backend Service** → **Environment** → Thêm các biến:

- [ ] **JWT_SECRET** (bắt buộc):
  ```bash
  # Generate random string (32+ characters)
  # Có thể dùng: openssl rand -base64 32
  # Hoặc để Render tự generate (đã set trong render.yaml)
  ```

- [ ] **CORS_ALLOWED_ORIGINS** (bắt buộc):
  ```
  https://your-service.onrender.com,http://localhost:3000,http://localhost:5173
  ```

- [ ] **FRONTEND_URL** (bắt buộc):
  ```
  https://your-service.onrender.com
  ```

- [ ] **AI Keys** (tùy chọn - nếu có):
  - `GEMINI_API_KEY` (nếu có)
  - `GROQ_API_KEY` (nếu có)

- [ ] **Click "Save Changes"**
- [ ] **Redeploy service** (nếu cần)

---

### Bước 5: Chạy Migrations ✅

- [ ] **Vào Backend Service → Shell:**
  - Click vào service `lms-backend`
  - Tab "Shell"
  - Click "Connect"

- [ ] **Chạy migrations:**
  ```bash
  cd backend
  npm run migrate
  ```

- [ ] **Kiểm tra kết quả:**
  - Xem logs để đảm bảo migrations chạy thành công
  - Không có lỗi

---

### Bước 6: Seed Database (Tùy chọn) ✅

- [ ] **Chạy seeders (nếu cần dữ liệu mẫu):**
  ```bash
  # Từ Shell
  cd backend
  npm run seed
  ```

- [ ] **Kiểm tra dữ liệu:**
  - Xem logs
  - Đảm bảo seed thành công

---

### Bước 7: Test API ✅

- [ ] **Health Check:**
  ```bash
  curl https://your-service.onrender.com/health
  ```
  - Kỳ vọng: `{"status":"ok"}` hoặc tương tự

- [ ] **API Docs:**
  - Mở: `https://your-service.onrender.com/api-docs`
  - Kiểm tra Swagger UI hiển thị đúng

- [ ] **Test Authentication:**
  ```bash
  # Test login endpoint
  curl -X POST https://your-service.onrender.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"Admin123!"}'
  ```

- [ ] **Test Socket.IO:**
  - Kiểm tra logs xem Socket.IO đã start chưa
  - Test kết nối WebSocket (nếu có frontend)

---

### Bước 8: Kiểm Tra Performance ✅

- [ ] **Xem Metrics:**
  - Dashboard → Service → Metrics
  - Kiểm tra CPU, Memory, Request rate

- [ ] **Test Response Time:**
  - Gọi vài API endpoints
  - Đo thời gian phản hồi

- [ ] **Kiểm Tra Logs:**
  - Xem có lỗi không
  - Kiểm tra database connections
  - Kiểm tra Redis connections

---

### Bước 9: Đánh Giá Free Tier ✅

- [ ] **Ghi nhận limitations:**
  - [ ] Service sleep sau 15 phút không có traffic
  - [ ] PostgreSQL chỉ tồn tại 90 ngày
  - [ ] Redis chỉ 25MB
  - [ ] Build time có thể chậm hơn

- [ ] **Test wake-up time:**
  - Để service sleep
  - Gọi API → Đo thời gian wake-up (thường 30-60 giây)

- [ ] **Đánh giá:**
  - [ ] Có đủ cho development không?
  - [ ] Có đủ cho production nhỏ không?
  - [ ] Có cần upgrade lên paid plan không?

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành checklist:

✅ **Backend chạy thành công trên Render**
- URL: `https://your-service.onrender.com`
- API Docs: `https://your-service.onrender.com/api-docs`
- Health check: `https://your-service.onrender.com/health`

✅ **Database và Redis hoạt động**
- Migrations đã chạy
- Có thể kết nối và query

✅ **Đánh giá được:**
- Hiệu năng free tier
- Limitations
- Có nên tiếp tục dùng Render hay chuyển sang VPS

---

## ⚠️ Lưu Ý Free Tier

### Limitations:
1. **Service Sleep:**
   - Sleep sau 15 phút không có traffic
   - Wake-up mất 30-60 giây
   - **Giải pháp:** Dùng cron job ping mỗi 5 phút (nếu cần)

2. **PostgreSQL:**
   - Chỉ tồn tại 90 ngày
   - Sau đó sẽ bị xóa
   - **Giải pháp:** Backup thường xuyên hoặc upgrade

3. **Redis:**
   - Chỉ 25MB
   - Có thể đủ cho cache nhỏ
   - **Giải pháp:** Tối ưu cache hoặc upgrade

4. **Build Time:**
   - Có thể chậm hơn paid plan
   - **Giải pháp:** Tối ưu build process

---

## 🚀 Bước Tiếp Theo

Sau khi test xong:

### Nếu Render đủ dùng:
- [ ] Upgrade lên Starter plan ($7/tháng) nếu cần
- [ ] Setup auto-deploy
- [ ] Cấu hình monitoring

### Nếu cần VPS riêng:
- [ ] Xem lại phân tích VPS ở trên
- [ ] Chọn gói phù hợp
- [ ] Setup VPS với Docker

---

## 📞 Cần Hỗ Trợ?

- Xem chi tiết: `RENDER_DEPLOY_GUIDE.md`
- Troubleshooting: Xem phần Troubleshooting trong guide
- Logs: Vào Service → Logs để xem lỗi

---

**Thời gian ước tính:** 30-45 phút

**Chi phí:** $0 (free tier)

