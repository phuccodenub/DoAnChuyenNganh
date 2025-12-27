# 🔴 Hướng Dẫn Setup Upstash Redis Cho Render

## 📋 Các Bước Chi Tiết

---

## **Bước 1: Tạo Redis Database Trên Upstash** ✅

1. **Click nút "+ Create Database"** (màu xanh lá)

2. **Cấu hình Database:**
   - **Name:** `lms-redis` (hoặc tên bạn muốn)
   - **Type:** Redis (mặc định)
   - **Region:** Chọn region gần Singapore nhất
     - Khuyến nghị: `ap-southeast-1` (Singapore) hoặc `ap-northeast-1` (Tokyo)
   - **TLS:** Enable (khuyến nghị cho production)
   - **Primary Region:** Chọn region đã chọn ở trên

3. **Click "Create"**

4. **Chờ vài giây** để Upstash tạo database

---

## **Bước 2: Lấy Connection String** ✅

Sau khi database được tạo:

1. **Click vào database vừa tạo** (`lms-redis`)

2. **Vào tab "Details"** (hoặc "Connection")

3. **Copy Redis URL:**
   - Format: `rediss://default:[PASSWORD]@[HOST]:6379`
   - Hoặc có thể copy từ phần **"REST API"** hoặc **"Redis CLI"**

4. **Lưu lại connection string** (sẽ dùng ở bước sau)

---

## **Bước 3: Cập Nhật render.yaml** ✅

Có 2 cách:

### **Cách A: Dùng trong render.yaml (Khuyến nghị)**

1. **Mở file `render.yaml`**

2. **Uncomment phần Redis:**
   ```yaml
   # Option 2: Dùng External Redis (Upstash/Redis Cloud)
   - key: REDIS_URL
     sync: false  # Set manually: redis://your-redis-host:6379
   - key: REDIS_DISABLED
     value: "false"
   ```

3. **Comment dòng REDIS_DISABLED hiện tại:**
   ```yaml
   # - key: REDIS_DISABLED
   #   value: "true"
   ```

4. **Commit và push:**
   ```bash
   git add render.yaml
   git commit -m "Enable Upstash Redis"
   git push origin dev/backend
   ```

### **Cách B: Set thủ công trong Render Dashboard**

1. **Vào Render Dashboard:**
   - Click vào backend service `lms-backend`
   - Tab **"Environment"**

2. **Thêm Environment Variables:**
   - **Key:** `REDIS_URL`
   - **Value:** Paste Upstash Redis URL (đã copy ở Bước 2)
   - Click **"Save Changes"**

3. **Update REDIS_DISABLED:**
   - Tìm `REDIS_DISABLED`
   - Đổi value từ `true` → `false`
   - Click **"Save Changes"**

---

## **Bước 4: Redeploy Service** ✅

1. **Nếu dùng Cách A (render.yaml):**
   - Render sẽ tự động redeploy khi detect thay đổi
   - Hoặc vào service → **"Manual Deploy"** → **"Deploy latest commit"**

2. **Nếu dùng Cách B (set thủ công):**
   - Vào service → **"Manual Deploy"** → **"Deploy latest commit"**

3. **Chờ deploy hoàn tất** (2-5 phút)

---

## **Bước 5: Test Kết Nối Redis** ✅

1. **Xem Logs:**
   - Vào service → **"Logs"**
   - Tìm dòng: `Redis connection established successfully` ✅
   - Nếu thấy lỗi, kiểm tra lại REDIS_URL

2. **Test từ Shell (tùy chọn):**
   - Vào service → **"Shell"**
   - Chạy:
     ```bash
     cd backend
     node -e "const redis = require('redis'); const client = redis.createClient({url: process.env.REDIS_URL}); client.connect().then(() => {console.log('✅ Redis connected!'); client.quit();}).catch(e => console.error('❌ Error:', e));"
     ```

---

## ✅ Checklist

- [ ] Tạo Redis database trên Upstash
- [ ] Copy Redis connection string
- [ ] Cập nhật render.yaml hoặc set trong Render Dashboard
- [ ] Set REDIS_DISABLED = false
- [ ] Redeploy service
- [ ] Kiểm tra logs xem Redis đã connect chưa
- [ ] Test API để đảm bảo cache hoạt động

---

## 🎯 Lưu Ý Quan Trọng

### **Upstash Free Tier:**
- ✅ **10,000 commands/day** (đủ cho test/small production)
- ✅ **256 MB storage**
- ✅ **Global distribution**
- ✅ **TLS encryption**

### **Connection String Format:**
- **TLS enabled:** `rediss://default:[PASSWORD]@[HOST]:6379`
- **TLS disabled:** `redis://default:[PASSWORD]@[HOST]:6379`

### **Security:**
- ⚠️ **KHÔNG commit** connection string vào code
- ✅ Chỉ set trong Render Environment Variables
- ✅ Dùng TLS (rediss://) cho production

---

## 🆘 Troubleshooting

### **Lỗi: "Redis connection failed"**
- Kiểm tra REDIS_URL đúng chưa
- Kiểm tra TLS (rediss vs redis)
- Kiểm tra password có đúng không
- Kiểm tra region có accessible không

### **Lỗi: "Command limit exceeded"**
- Upstash free tier: 10K commands/day
- Upgrade lên paid plan hoặc optimize cache usage

### **Redis không hoạt động:**
- Kiểm tra REDIS_DISABLED = false
- Kiểm tra logs xem có lỗi gì không
- Test connection từ Shell

---

**Sau khi hoàn thành, Redis sẽ hoạt động và cache sẽ được lưu persistent! 🎉**

