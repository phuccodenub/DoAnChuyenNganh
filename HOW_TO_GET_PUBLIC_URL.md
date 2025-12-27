# 🔗 Cách Lấy PUBLIC_URL Cho Render

## 📋 PUBLIC_URL Là Gì?

**PUBLIC_URL** = URL của **backend service** trên Render (URL công khai để truy cập API)

---

## 🎯 Cách Lấy PUBLIC_URL

### **Bước 1: Deploy Service Trên Render**

1. Deploy Blueprint hoặc Web Service
2. Chờ deploy hoàn tất (5-10 phút)

### **Bước 2: Lấy URL Từ Render Dashboard**

Sau khi deploy xong, Render sẽ tự động tạo URL cho service:

1. **Vào Render Dashboard:**
   - https://dashboard.render.com
   - Click vào service `lms-backend`

2. **Xem URL:**
   - Ở đầu trang service, bạn sẽ thấy:
     ```
     https://lms-backend-xxxx.onrender.com
     ```
   - Đây chính là **PUBLIC_URL**!

3. **Hoặc xem trong Settings:**
   - Vào service → **Settings**
   - Tìm phần **"Service URL"** hoặc **"Public URL"**
   - Copy URL đó

---

## 📝 Format PUBLIC_URL

### **Render Free Tier:**
```
https://lms-backend-xxxx.onrender.com
```
- Format: `https://[service-name]-[random-id].onrender.com`
- Ví dụ: `https://lms-backend-abc123.onrender.com`

### **Render Paid Tier (Custom Domain):**
```
https://api.yourdomain.com
```
- Nếu bạn có custom domain

---

## ✅ Cách Set PUBLIC_URL

### **Option 1: Set Trong Render Dashboard (Khuyến nghị)**

1. **Vào Service → Environment**
2. **Tìm hoặc thêm:**
   - Key: `PUBLIC_URL`
   - Value: `https://lms-backend-xxxx.onrender.com` (URL của service)
3. **Click "Save Changes"**
4. **Redeploy** (nếu cần)

### **Option 2: Update render.yaml**

1. **Mở `render.yaml`**
2. **Tìm dòng:**
   ```yaml
   - key: PUBLIC_URL
     sync: false  # Set manually: https://your-service.onrender.com
   ```
3. **Thay thế bằng:**
   ```yaml
   - key: PUBLIC_URL
     value: https://lms-backend-xxxx.onrender.com  # URL thực tế của service
   ```
4. **Commit và push:**
   ```bash
   git add render.yaml
   git commit -m "Set PUBLIC_URL to actual Render service URL"
   git push origin dev/backend
   ```

---

## 🎯 Lưu Ý Quan Trọng

### **1. PUBLIC_URL phải là URL đầy đủ:**
- ✅ Đúng: `https://lms-backend-abc123.onrender.com`
- ❌ Sai: `lms-backend-abc123.onrender.com` (thiếu https://)
- ❌ Sai: `http://lms-backend-abc123.onrender.com` (dùng http thay vì https)

### **2. PUBLIC_URL khác với FRONTEND_URL:**
- `PUBLIC_URL` = URL của **backend service** (Render)
- `FRONTEND_URL` = URL của **frontend** (nếu deploy riêng)

### **3. PUBLIC_URL có thể thay đổi:**
- Nếu bạn **suspend/delete** service và tạo lại, URL sẽ khác
- Nếu **upgrade** lên paid plan và dùng custom domain, URL sẽ khác

---

## 📋 Checklist

- [ ] Deploy service trên Render
- [ ] Chờ deploy hoàn tất
- [ ] Copy URL từ Render Dashboard
- [ ] Set `PUBLIC_URL` trong Environment Variables
- [ ] Hoặc update trong `render.yaml`
- [ ] Redeploy (nếu cần)
- [ ] Test API để đảm bảo URLs hoạt động đúng

---

## 🔍 Cách Kiểm Tra PUBLIC_URL Đã Đúng Chưa

### **Test từ Shell:**
```bash
# Vào Render Shell
echo $PUBLIC_URL
# Kỳ vọng: https://lms-backend-xxxx.onrender.com
```

### **Test từ API:**
1. Gọi API: `GET /api/v1/courses`
2. Kiểm tra response
3. Xem các `thumbnail_url` có đúng format không:
   - ✅ Đúng: `https://lms-backend-xxxx.onrender.com/uploads/thumb.jpg`
   - ❌ Sai: `http://localhost:3000/uploads/thumb.jpg`

---

## 🎯 Tóm Tắt

**PUBLIC_URL = URL của backend service trên Render**

**Cách lấy:**
1. Deploy service
2. Vào Dashboard → Service
3. Copy URL ở đầu trang
4. Set vào Environment Variables

**Ví dụ:**
```
https://lms-backend-abc123.onrender.com
```

---

**Vậy là bạn chỉ cần copy URL từ Render Dashboard và set vào PUBLIC_URL! 🚀**

