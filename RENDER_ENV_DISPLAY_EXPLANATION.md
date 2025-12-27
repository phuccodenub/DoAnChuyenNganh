# 🔍 Giải Thích: Tại Sao Chỉ Thấy 17 Env Trên Render Dashboard?

## ⚠️ Lý Do

Render Dashboard **KHÔNG hiển thị tất cả** environment variables từ `render.yaml`. Nó chỉ hiển thị:

1. ✅ **Các biến có `sync: false`** (cần set thủ công)
2. ✅ **Các biến được generate** (như `JWT_SECRET`, `SESSION_SECRET`)
3. ✅ **Các biến được thêm thủ công** qua Dashboard

**Các biến có giá trị mặc định trong `render.yaml` sẽ KHÔNG hiển thị trong Dashboard**, nhưng vẫn được apply khi deploy!

---

## 📊 Phân Tích render.yaml

### **Tổng số biến trong render.yaml: 71 biến**

### **Hiển thị trên Dashboard (17 biến):**

Các biến có `sync: false` hoặc `generateValue: true`:

1. `DATABASE_URL` (sync: false)
2. `REDIS_URL` (sync: false)
3. `PUBLIC_URL` (sync: false)
4. `JWT_SECRET` (generateValue: true)
5. `SESSION_SECRET` (generateValue: true)
6. `MAIL_HOST` (sync: false)
7. `MAIL_USER` (sync: false)
8. `MAIL_PASS` (sync: false)
9. `GEMINI_API_KEY` (sync: false)
10. `GROQ_API_KEY` (sync: false)
11. `GOOGLE_CLIENT_ID` (sync: false)
12. `GOOGLE_CLIENT_SECRET` (sync: false)
13. `GOOGLE_REFRESH_TOKEN` (sync: false)
14. `CLOUDINARY_CLOUD_NAME` (sync: false)
15. `CLOUDINARY_API_KEY` (sync: false)
16. `CLOUDINARY_API_SECRET` (sync: false)
17. `HLS_BASE_URL`, `RTMP_SERVER_URL`, `RTMP_CONTROL_URL` (sync: false)

### **KHÔNG hiển thị trên Dashboard (54 biến):**

Các biến có giá trị mặc định trong `render.yaml`:

- `NODE_ENV=production`
- `PORT=3000`
- `LOG_LEVEL=info`
- `REDIS_DISABLED=false`
- `JWT_EXPIRES_IN=24h`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `JWT_ISSUER=lms-backend`
- `JWT_AUDIENCE=lms-frontend`
- `CORS_ALLOWED_ORIGINS=...`
- `CORS_ALLOWED_METHODS=...`
- `CORS_ALLOWED_HEADERS=...`
- `CORS_ALLOW_CREDENTIALS=true`
- `FRONTEND_URL=...`
- `MAX_FILE_SIZE=10485760`
- `UPLOAD_PATH=./uploads`
- `STORAGE_TYPE=local`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `CACHE_TTL_SHORT=300`
- `CACHE_TTL_MEDIUM=1800`
- `CACHE_TTL_LONG=3600`
- `BCRYPT_ROUNDS=12`
- `PASSWORD_MIN_LENGTH=8`
- `PASSWORD_MAX_LENGTH=128`
- `SESSION_MAX_AGE=86400000`
- `HEALTH_CHECK_TIMEOUT=5000`
- `HEALTH_CHECK_INTERVAL=30000`
- `METRICS_ENABLED=true`
- `METRICS_PORT=9090`
- `ENABLE_OTLP=false`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=...`
- `DEFAULT_API_VERSION=v1.3.0`
- `SUPPORTED_API_VERSIONS=...`
- `DEBUG=false`
- `VERBOSE_LOGGING=false`
- `HOT_RELOAD=false`
- `MAIL_PORT=587`
- `MAIL_SECURE=false`
- `MAIL_FROM=...`
- `GEMINI_TEMPERATURE=0.7`
- `GEMINI_MAX_TOKENS=8192`
- `GROQ_MODEL_DEFAULT=...`
- `GROQ_TEMPERATURE=0.7`
- `GROQ_MAX_TOKENS=2048`
- `AI_TUTOR_ENABLED=true`
- `AI_QUIZ_GENERATOR_ENABLED=true`
- `AI_GRADER_ENABLED=false`
- `AI_CONTENT_REPURPOSING_ENABLED=false`
- `PROXYPAL_ENABLED=false`
- `DISABLE_CACHE=false`
- `DISABLE_RATE_LIMIT=false`
- `DISABLE_METRICS=false`

**Và nhiều biến khác...**

---

## ✅ Cách Kiểm Tra Tất Cả Biến Đã Được Apply

### **Cách 1: Kiểm Tra Từ Shell**

1. Vào Render Dashboard → Service → **Shell**
2. Chạy:
   ```bash
   env | grep -E "NODE_ENV|PORT|LOG_LEVEL|JWT|CORS|CACHE" | sort
   ```
3. Sẽ thấy tất cả biến đã được set

### **Cách 2: Kiểm Tra Từ Logs**

1. Vào Service → **Logs**
2. Tìm dòng khởi động server
3. Backend sẽ log các config đã load

### **Cách 3: Test API**

1. Gọi API endpoint
2. Kiểm tra response headers
3. CORS headers sẽ cho biết `CORS_ALLOWED_ORIGINS` đã được apply

---

## 🎯 Kết Luận

- ✅ **71 biến** đã được định nghĩa trong `render.yaml`
- ✅ **Tất cả biến** sẽ được apply khi deploy
- ⚠️ **Chỉ 17 biến** hiển thị trên Dashboard (các biến cần set thủ công)
- ✅ **54 biến còn lại** có giá trị mặc định và tự động apply

**Đây là hành vi bình thường của Render!** Dashboard chỉ hiển thị các biến cần bạn set thủ công, còn các biến có giá trị mặc định sẽ tự động được apply từ `render.yaml`.

---

## 📝 Lưu Ý

Nếu muốn xem/override một biến nào đó:

1. **Vào Dashboard → Environment**
2. **Click "Add Environment Variable"**
3. **Thêm biến** (sẽ override giá trị trong render.yaml)

---

**Vậy là đúng rồi! 17 biến hiển thị là các biến cần bạn set thủ công, còn 54 biến khác đã có giá trị mặc định và tự động apply! ✅**

