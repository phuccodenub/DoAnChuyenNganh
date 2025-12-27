# 🔍 PUBLIC_URL vs R2_PUBLIC_URL - Giải Thích

## ⚠️ Chúng KHÁC NHAU!

### **PUBLIC_URL** 
- **Mục đích:** URL của **backend service** (Render service)
- **Ví dụ:** `https://your-service.onrender.com`
- **Dùng khi:**
  - `STORAGE_TYPE=local` (files lưu trên server)
  - Convert relative paths thành full URLs
  - Generate URLs cho thumbnails, images
- **Nơi sử dụng:**
  - `course.repository.ts` - Tạo thumbnail URLs
  - `files.service.ts` - Tạo public URLs cho local files

### **R2_PUBLIC_URL**
- **Mục đích:** URL của **Cloudflare R2 bucket** (external storage)
- **Ví dụ:** `https://pub-4f42a033df35404c966877f848a0ef00.r2.dev`
- **Dùng khi:**
  - `STORAGE_TYPE=r2` (files lưu trên Cloudflare R2)
  - Upload files lên R2
  - Generate URLs cho files trên R2
- **Nơi sử dụng:**
  - `r2.service.ts` - Tạo URLs cho files trên R2

---

## 📊 So Sánh

| Biến | Mục Đích | Ví Dụ | Khi Nào Dùng |
|------|----------|-------|--------------|
| **PUBLIC_URL** | URL của backend service | `https://lms-backend.onrender.com` | STORAGE_TYPE=local |
| **R2_PUBLIC_URL** | URL của R2 bucket | `https://pub-xxx.r2.dev` | STORAGE_TYPE=r2 |

---

## 🎯 Cách Sử Dụng

### **Nếu dùng Local Storage (STORAGE_TYPE=local):**
```env
PUBLIC_URL=https://your-service.onrender.com
STORAGE_TYPE=local
# Không cần R2_PUBLIC_URL
```

### **Nếu dùng Cloudflare R2 (STORAGE_TYPE=r2):**
```env
PUBLIC_URL=https://your-service.onrender.com  # Vẫn cần cho thumbnails
STORAGE_TYPE=r2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://pub-xxx.r2.dev  # Public URL của R2 bucket
```

---

## ✅ Kết Luận

- ✅ **PUBLIC_URL** = URL của backend service (Render)
- ✅ **R2_PUBLIC_URL** = URL của Cloudflare R2 bucket
- ✅ Chúng **KHÁC NHAU** và phục vụ mục đích khác nhau
- ✅ Có thể dùng **CẢ HAI** cùng lúc (PUBLIC_URL cho thumbnails, R2_PUBLIC_URL cho file storage)

---

**Vậy là bạn cần set CẢ HAI nếu dùng R2 storage! 🚀**

