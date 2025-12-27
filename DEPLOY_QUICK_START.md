# 🚀 Quick Start - Deploy trong 10 Phút

## ⚡ Tóm Tắt Nhanh

1. **Setup Supabase** → Lấy `DATABASE_URL`
2. **Setup Upstash** → Lấy `REDIS_URL`
3. **Deploy Backend** → Set env vars → Lấy backend URL
4. **Deploy Frontend** → Set `VITE_API_URL` → Lấy frontend URL
5. **Update CORS** → Kết nối FE và BE

---

## 📝 Step-by-Step (Rút Gọn)

### 1️⃣ Supabase (2 phút)

```
1. Vào https://app.supabase.com → New Project
2. Settings → Database → Connection string (URI)
3. Copy: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 2️⃣ Upstash (2 phút)

```
1. Vào https://console.upstash.com → Create Database
2. Details → TCP tab → Copy connection string
3. Copy: rediss://default:[PASSWORD]@[ENDPOINT]:6379
```

### 3️⃣ Render - Deploy Backend (3 phút)

```
1. Render Dashboard → New → Blueprint
2. Connect repo → Chọn branch: dev/backend
3. Vào lms-backend → Environment → Set:
   - DATABASE_URL = [từ Supabase]
   - REDIS_URL = [từ Upstash]
   - PUBLIC_URL = http://localhost:3000 (tạm thời)
4. Save → Đợi deploy xong
5. Copy Backend URL: https://lms-backend-xxxx.onrender.com
6. Update PUBLIC_URL = Backend URL → Save
```

### 4️⃣ Render - Deploy Frontend (2 phút)

```
1. Vào lms-frontend → Environment → Set:
   - VITE_API_URL = https://lms-backend-xxxx.onrender.com/api
   - VITE_WS_URL = https://lms-backend-xxxx.onrender.com
   - VITE_SOCKET_URL = https://lms-backend-xxxx.onrender.com
2. Save → Đợi build xong
3. Copy Frontend URL: https://lms-frontend-xxxx.onrender.com
```

### 5️⃣ Kết Nối FE và BE (1 phút)

```
1. Vào lms-backend → Environment → Update:
   - CORS_ALLOWED_ORIGINS = https://lms-frontend-xxxx.onrender.com,http://localhost:3000
   - FRONTEND_URL = https://lms-frontend-xxxx.onrender.com
2. Save → Done!
```

---

## ✅ Test

- Backend: `https://lms-backend-xxxx.onrender.com/health`
- Frontend: `https://lms-frontend-xxxx.onrender.com`
- API: Mở DevTools → Network → Kiểm tra API calls

---

## 🐛 Lỗi Thường Gặp

| Lỗi | Giải Pháp |
|-----|-----------|
| `DATABASE_URL is required` | Set `DATABASE_URL` trong backend env |
| `Redis connection failed` | Set `REDIS_URL` với format `rediss://...` |
| CORS error | Thêm frontend URL vào `CORS_ALLOWED_ORIGINS` |
| Frontend không build | Set `VITE_API_URL` trước khi build |

---

## 📚 Chi Tiết

Xem `DEPLOY_CHECKLIST.md` để có hướng dẫn đầy đủ và troubleshooting.
