# 🚀 Deploy FE và BE Riêng Biệt Trên Render

## ✅ Câu Trả Lời: KHÔNG CẦN Deploy Cùng Lúc!

FE và BE có thể deploy **riêng biệt**, không cần cùng lúc. Chỉ cần cấu hình đúng sau khi cả hai đã deploy.

---

## 📋 Các Bước Deploy

### **Option 1: Deploy BE Trước (Khuyến nghị)**

#### **Bước 1: Deploy Backend**

1. Deploy backend service trên Render
2. Chờ deploy hoàn tất
3. Lấy backend URL: `https://lms-backend-xxxx.onrender.com`

#### **Bước 2: Deploy Frontend**

1. Deploy frontend service trên Render
2. Chờ deploy hoàn tất
3. Lấy frontend URL: `https://lms-frontend-xxxx.onrender.com`

#### **Bước 3: Cấu Hình CORS (Backend)**

1. Vào Backend Service → Environment
2. Update:
   - `CORS_ALLOWED_ORIGINS` = `https://lms-frontend-xxxx.onrender.com,http://localhost:3000,http://localhost:5173`
   - `FRONTEND_URL` = `https://lms-frontend-xxxx.onrender.com`
3. Save và redeploy backend

#### **Bước 4: Cấu Hình API URL (Frontend)**

1. Vào Frontend Service → Environment
2. Thêm:
   - `VITE_API_URL` = `https://lms-backend-xxxx.onrender.com/api`
3. Save và redeploy frontend

---

### **Option 2: Deploy FE Trước**

1. Deploy frontend trước (tạm thời dùng localhost API)
2. Deploy backend sau
3. Update `VITE_API_URL` trong frontend
4. Update CORS trong backend

---

## 🔧 Cấu Hình Chi Tiết

### **Backend Environment Variables:**

```env
# CORS - Thêm frontend URL sau khi deploy
CORS_ALLOWED_ORIGINS=https://lms-frontend-xxxx.onrender.com,http://localhost:3000,http://localhost:5173
FRONTEND_URL=https://lms-frontend-xxxx.onrender.com

# PUBLIC_URL - URL của backend service
PUBLIC_URL=https://lms-backend-xxxx.onrender.com
```

### **Frontend Environment Variables:**

```env
# API URL - URL của backend service
VITE_API_URL=https://lms-backend-xxxx.onrender.com/api

# WebSocket URL (nếu cần)
VITE_WS_URL=https://lms-backend-xxxx.onrender.com
VITE_SOCKET_URL=https://lms-backend-xxxx.onrender.com
```

---

## 📝 render.yaml Cho Frontend

Tạo file `render-frontend.yaml` (nếu muốn):

```yaml
services:
  - type: web
    name: lms-frontend
    env: static
    region: singapore
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_URL
        sync: false  # Set manually: https://lms-backend-xxxx.onrender.com/api
      - key: VITE_WS_URL
        sync: false  # Set manually: https://lms-backend-xxxx.onrender.com
```

---

## ✅ Checklist

### **Sau Khi Deploy Backend:**
- [ ] Copy backend URL
- [ ] Set `PUBLIC_URL` = backend URL
- [ ] Chạy migrations
- [ ] Test API: `https://backend-url.onrender.com/health`

### **Sau Khi Deploy Frontend:**
- [ ] Copy frontend URL
- [ ] Set `VITE_API_URL` = `https://backend-url.onrender.com/api`
- [ ] Set `VITE_WS_URL` = `https://backend-url.onrender.com`
- [ ] Test frontend: `https://frontend-url.onrender.com`

### **Sau Khi Cả Hai Đã Deploy:**
- [ ] Update `CORS_ALLOWED_ORIGINS` trong backend (thêm frontend URL)
- [ ] Update `FRONTEND_URL` trong backend
- [ ] Redeploy backend (nếu cần)
- [ ] Test kết nối FE → BE

---

## 🎯 Lưu Ý

### **1. Thứ Tự Deploy:**
- ✅ Có thể deploy BE trước → FE sau
- ✅ Có thể deploy FE trước → BE sau
- ✅ Không cần cùng lúc

### **2. CORS Configuration:**
- Backend cần biết frontend URL để cho phép CORS
- Update sau khi cả hai đã deploy

### **3. API URL:**
- Frontend cần biết backend URL để gọi API
- Update sau khi backend đã deploy

### **4. WebSocket:**
- Frontend cần biết backend URL cho Socket.IO
- Set `VITE_WS_URL` hoặc `VITE_SOCKET_URL`

---

## 🚀 Workflow Khuyến Nghị

### **Bước 1: Deploy Backend**
```bash
# Deploy backend với render.yaml
# Lấy URL: https://lms-backend-xxxx.onrender.com
```

### **Bước 2: Set Backend URLs**
```env
PUBLIC_URL=https://lms-backend-xxxx.onrender.com
```

### **Bước 3: Deploy Frontend**
```bash
# Deploy frontend
# Lấy URL: https://lms-frontend-xxxx.onrender.com
```

### **Bước 4: Update CORS (Backend)**
```env
CORS_ALLOWED_ORIGINS=https://lms-frontend-xxxx.onrender.com,http://localhost:3000
FRONTEND_URL=https://lms-frontend-xxxx.onrender.com
```

### **Bước 5: Update API URL (Frontend)**
```env
VITE_API_URL=https://lms-backend-xxxx.onrender.com/api
VITE_WS_URL=https://lms-backend-xxxx.onrender.com
```

### **Bước 6: Redeploy (Nếu Cần)**
- Redeploy backend để apply CORS changes
- Redeploy frontend để apply API URL changes

---

## ✅ Kết Luận

- ✅ **FE và BE KHÔNG cần deploy cùng lúc**
- ✅ **Có thể deploy riêng biệt**
- ✅ **Chỉ cần cấu hình CORS và API URL sau khi cả hai đã deploy**

**Workflow đơn giản:**
1. Deploy BE → Lấy URL
2. Deploy FE → Lấy URL  
3. Update CORS trong BE
4. Update API URL trong FE
5. Redeploy (nếu cần)
6. Xong! 🎉

---

**Vậy là bạn có thể deploy từng cái một, không cần vội! 🚀**

