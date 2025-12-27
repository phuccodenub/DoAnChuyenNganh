# 🚀 Deploy 1 Lần Duy Nhất - Hướng Dẫn Đơn Giản

## ✅ Sự Thật: Deploy 1 Lần, Redeploy 1 Lần

Với Render Blueprint, bạn chỉ cần:
1. **Deploy 1 lần** → Cả FE và BE được tạo cùng lúc
2. **Redeploy frontend 1 lần** → Sau khi có backend URL (chỉ cần update env và save)

**Tổng cộng: 1 lần deploy + 1 lần redeploy frontend = 2 bước**

---

## 🎯 Cách Deploy Đơn Giản Nhất

### Bước 1: Chuẩn Bị (5 phút)

1. **Supabase**: Lấy `DATABASE_URL`
2. **Upstash**: Lấy `REDIS_URL`

### Bước 2: Deploy Blueprint (1 lần duy nhất)

1. Render Dashboard → **New** → **Blueprint**
2. Connect repo → Chọn branch: `dev/backend`
3. Render tự động tạo **2 services cùng lúc**:
   - `lms-backend`
   - `lms-frontend`

### Bước 3: Set Environment Variables

#### Backend (`lms-backend`):
```
DATABASE_URL = [từ Supabase]
REDIS_URL = [từ Upstash]
PUBLIC_URL = http://localhost:3000 (tạm thời, sẽ update sau)
```

#### Frontend (`lms-frontend`):
```
VITE_API_URL = http://localhost:3000/api (tạm thời, sẽ update sau)
VITE_WS_URL = http://localhost:3000 (tạm thời, sẽ update sau)
VITE_SOCKET_URL = http://localhost:3000 (tạm thời, sẽ update sau)
```

**Lưu ý**: Set giá trị tạm thời để cả 2 có thể build được ngay.

### Bước 4: Đợi Deploy Xong

- Backend sẽ deploy thành công (có DATABASE_URL và REDIS_URL)
- Frontend sẽ build thành công (có VITE_API_URL tạm thời)
- **Copy Backend URL**: `https://lms-backend-xxxx.onrender.com`

### Bước 5: Update và Redeploy (Chỉ Frontend)

#### Update Backend:
```
PUBLIC_URL = https://lms-backend-xxxx.onrender.com
CORS_ALLOWED_ORIGINS = https://lms-frontend-xxxx.onrender.com,http://localhost:3000
FRONTEND_URL = https://lms-frontend-xxxx.onrender.com
```
→ Save (backend sẽ tự redeploy)

#### Update Frontend (QUAN TRỌNG):
```
VITE_API_URL = https://lms-backend-xxxx.onrender.com/api
VITE_WS_URL = https://lms-backend-xxxx.onrender.com
VITE_SOCKET_URL = https://lms-backend-xxxx.onrender.com
```
→ Save (frontend sẽ tự rebuild và redeploy)

### Bước 6: Xong! ✅

- Frontend: `https://lms-frontend-xxxx.onrender.com`
- Backend: `https://lms-backend-xxxx.onrender.com`

---

## 📊 Tóm Tắt

| Bước | Action | Services |
|------|--------|----------|
| 1 | Deploy Blueprint | FE + BE được tạo |
| 2 | Set env vars (tạm thời) | Cả 2 build được |
| 3 | Update env vars (thật) | Frontend rebuild 1 lần |

**Tổng**: 1 lần deploy ban đầu + 1 lần rebuild frontend = **2 bước**

---

## 💡 Tại Sao Cần Redeploy Frontend?

Vite build-time variables (`VITE_*`) được **nhúng vào code khi build**, không phải runtime. Nên:
- Lần đầu: Build với `VITE_API_URL = http://localhost:3000/api` (tạm thời)
- Lần 2: Rebuild với `VITE_API_URL = https://lms-backend-xxxx.onrender.com/api` (thật)

**Không thể tránh được** vì đây là cách Vite hoạt động.

---

## 🎯 Workflow Tối Ưu

### Option 1: Deploy Cùng Lúc (Khuyến Nghị)

1. Deploy Blueprint → Cả 2 services được tạo
2. Set env vars tạm thời → Cả 2 build được
3. Update env vars thật → Frontend rebuild 1 lần
4. **Tổng: 1 deploy + 1 rebuild**

### Option 2: Deploy Backend Trước

1. Deploy Blueprint → Cả 2 services được tạo
2. Set backend env vars → Backend deploy
3. Lấy backend URL
4. Set frontend env vars → Frontend build
5. **Tổng: 1 deploy (nhưng phải đợi backend xong trước)**

**Kết luận**: Option 1 nhanh hơn vì không cần đợi!

---

## ✅ Checklist Nhanh

- [ ] Setup Supabase → `DATABASE_URL`
- [ ] Setup Upstash → `REDIS_URL`
- [ ] Deploy Blueprint (1 lần)
- [ ] Set env vars tạm thời cho cả 2
- [ ] Đợi deploy xong → Copy backend URL
- [ ] Update env vars thật → Frontend rebuild
- [ ] Update CORS trong backend
- [ ] Test → Xong!

---

## 🐛 FAQ

**Q: Tại sao không thể deploy 1 lần duy nhất?**
A: Vì `VITE_API_URL` là build-time variable, phải có giá trị khi build. Backend URL chỉ có sau khi deploy xong.

**Q: Có cách nào tránh rebuild không?**
A: Không, vì Vite nhúng env vars vào code khi build. Nhưng rebuild chỉ mất 2-3 phút.

**Q: Backend có cần redeploy không?**
A: Chỉ cần update env vars và save, backend sẽ tự redeploy (nhanh hơn rebuild frontend).

---

## 🎉 Kết Luận

**Deploy 1 lần, redeploy frontend 1 lần = Đơn giản và nhanh nhất!**

Không cần deploy 2 lần riêng biệt, chỉ cần:
1. Deploy Blueprint (cả 2 cùng lúc)
2. Update env và rebuild frontend (1 lần)

**Tổng thời gian: ~10-15 phút** (bao gồm cả setup Supabase và Upstash)

