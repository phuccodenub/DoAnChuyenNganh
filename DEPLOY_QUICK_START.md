# ⚡ Quick Start: Deploy Lên Render

## 🎯 Tóm Tắt Nhanh

### Bước 1: Giải Quyết Quyền Truy Cập Repo

**Khuyến nghị: Fork repo về tài khoản của bạn**

```bash
# 1. Fork repo trên GitHub (click nút Fork)
# 2. Clone repo đã fork
git clone https://github.com/YOUR_USERNAME/DoAnChuyenNganh.git
cd DoAnChuyenNganh

# 3. Checkout nhánh dev/backend
git checkout dev/backend

# 4. Thêm upstream để sync với repo gốc (optional)
git remote add upstream https://github.com/ORIGINAL_OWNER/DoAnChuyenNganh.git
```

### Bước 2: Push Code Lên Repo

```bash
# Đảm bảo đã commit tất cả thay đổi
git add .
git commit -m "Add Render deployment config"
git push origin dev/backend
```

### Bước 3: Tạo Services Trên Render

1. **Đăng ký/Đăng nhập Render:** https://render.com
2. **Kết nối GitHub:** Dashboard → Settings → Connected Accounts

### Bước 4: Deploy Tự Động Với render.yaml

1. **Tạo Blueprint:**
   - Dashboard → New → Blueprint
   - Chọn repo của bạn
   - Chọn nhánh: `dev/backend`
   - Click **Apply**

2. **Render sẽ tự động:**
   - ✅ Tạo PostgreSQL database
   - ✅ Tạo Redis cache
   - ✅ Deploy backend service
   - ✅ Link các services

### Bước 5: Cấu Hình Environment Variables

Vào Backend Service → Environment → Thêm các biến:

**Bắt buộc:**
```env
JWT_SECRET=<generate random 32+ characters>
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
```

**Tùy chọn (AI):**
```env
GEMINI_API_KEY=your-key
GROQ_API_KEY=your-key
AI_TUTOR_ENABLED=true
```

### Bước 6: Chạy Migrations

Vào Backend Service → Shell:

```bash
cd backend
npm run migrate
```

### Bước 7: Kiểm Tra

1. **Health Check:**
   ```
   https://your-service.onrender.com/health
   ```

2. **API Docs:**
   ```
   https://your-service.onrender.com/api-docs
   ```

---

## 📋 Checklist Nhanh

- [ ] Fork repo về tài khoản của bạn
- [ ] Push code lên repo
- [ ] Tạo tài khoản Render
- [ ] Deploy với Blueprint (render.yaml)
- [ ] Cấu hình JWT_SECRET và CORS
- [ ] Chạy migrations
- [ ] Test API

---

## 🆘 Gặp Vấn Đề?

Xem hướng dẫn chi tiết: [RENDER_DEPLOY_GUIDE.md](./RENDER_DEPLOY_GUIDE.md)

---

**Thời gian ước tính:** 15-30 phút

