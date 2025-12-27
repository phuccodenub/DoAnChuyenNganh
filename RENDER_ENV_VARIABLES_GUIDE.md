# 📋 Hướng Dẫn Environment Variables Cho Render

## ✅ Đã Cấu Hình Trong render.yaml

File `render.yaml` đã bao gồm **60+ environment variables** với các giá trị mặc định phù hợp cho production.

---

## 🔴 Bắt Buộc Phải Set Thủ Công (sync: false)

Các biến này **PHẢI** set thủ công trong Render Dashboard vì chứa thông tin nhạy cảm hoặc cần cấu hình riêng:

### **1. Database & Redis:**
- ✅ `DATABASE_URL` - Supabase PostgreSQL connection string
- ✅ `REDIS_URL` - Upstash Redis connection string

### **2. Public URL:**
- ✅ `PUBLIC_URL` - URL của service trên Render (ví dụ: `https://your-service.onrender.com`)

### **3. Email (nếu cần):**
- ⚠️ `MAIL_HOST` - SMTP host (ví dụ: `smtp.gmail.com`)
- ⚠️ `MAIL_USER` - Email address
- ⚠️ `MAIL_PASS` - Email password hoặc app password

### **4. AI Keys (nếu cần):**
- ⚠️ `GEMINI_API_KEY` - Google Gemini API key
- ⚠️ `GROQ_API_KEY` - Groq API key

### **5. Google Drive (nếu cần):**
- ⚠️ `GOOGLE_CLIENT_ID`
- ⚠️ `GOOGLE_CLIENT_SECRET`
- ⚠️ `GOOGLE_REFRESH_TOKEN`

### **6. Cloud Storage (nếu cần):**
- ⚠️ `CLOUDINARY_CLOUD_NAME`
- ⚠️ `CLOUDINARY_API_KEY`
- ⚠️ `CLOUDINARY_API_SECRET`

### **7. Livestream (nếu cần):**
- ⚠️ `HLS_BASE_URL`
- ⚠️ `RTMP_SERVER_URL`
- ⚠️ `RTMP_CONTROL_URL`

---

## ✅ Đã Có Giá Trị Mặc Định (Không Cần Set)

Các biến này đã có giá trị mặc định trong `render.yaml`, bạn có thể override nếu cần:

### **Core Configuration:**
- `NODE_ENV=production`
- `PORT=3000`
- `LOG_LEVEL=info`

### **JWT:**
- `JWT_SECRET` - Render tự động generate
- `JWT_EXPIRES_IN=24h`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `JWT_ISSUER=lms-backend`
- `JWT_AUDIENCE=lms-frontend`

### **CORS:**
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`
- `CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS`
- `CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With`
- `CORS_ALLOW_CREDENTIALS=true`
- `FRONTEND_URL=http://localhost:3000`

### **File Upload:**
- `MAX_FILE_SIZE=10485760` (10MB)
- `UPLOAD_PATH=./uploads`
- `STORAGE_TYPE=local`

### **Rate Limiting:**
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS=100`

### **Cache:**
- `CACHE_TTL_SHORT=300` (5 minutes)
- `CACHE_TTL_MEDIUM=1800` (30 minutes)
- `CACHE_TTL_LONG=3600` (1 hour)

### **Security:**
- `BCRYPT_ROUNDS=12`
- `PASSWORD_MIN_LENGTH=8`
- `PASSWORD_MAX_LENGTH=128`
- `SESSION_SECRET` - Render tự động generate
- `SESSION_MAX_AGE=86400000` (24 hours)

### **Monitoring:**
- `HEALTH_CHECK_TIMEOUT=5000`
- `HEALTH_CHECK_INTERVAL=30000`
- `METRICS_ENABLED=true`
- `METRICS_PORT=9090`
- `ENABLE_OTLP=false`

### **API Versioning:**
- `DEFAULT_API_VERSION=v1.3.0`
- `SUPPORTED_API_VERSIONS=v1.0.0,v1.1.0,v1.2.0,v2.0.0`

### **Development Flags:**
- `DEBUG=false`
- `VERBOSE_LOGGING=false`
- `HOT_RELOAD=false`

### **AI Configuration:**
- `GEMINI_TEMPERATURE=0.7`
- `GEMINI_MAX_TOKENS=8192`
- `GROQ_MODEL_DEFAULT=llama-3.3-70b-versatile`
- `GROQ_TEMPERATURE=0.7`
- `GROQ_MAX_TOKENS=2048`
- `AI_TUTOR_ENABLED=true`
- `AI_QUIZ_GENERATOR_ENABLED=true`
- `AI_GRADER_ENABLED=false`
- `AI_CONTENT_REPURPOSING_ENABLED=false`
- `PROXYPAL_ENABLED=false`

### **Email Defaults:**
- `MAIL_PORT=587`
- `MAIL_SECURE=false`
- `MAIL_FROM=LMS System <noreply@lms.com>`

### **Feature Flags:**
- `REDIS_DISABLED=false`
- `DISABLE_CACHE=false`
- `DISABLE_RATE_LIMIT=false`
- `DISABLE_METRICS=false`

---

## 📝 Checklist Setup Render

### **Bước 1: Deploy Blueprint**
- [ ] Commit và push `render.yaml`
- [ ] Deploy Blueprint trên Render

### **Bước 2: Set Biến Bắt Buộc**
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `REDIS_URL` - Upstash connection string
- [ ] `PUBLIC_URL` - URL của service (sau khi deploy xong)

### **Bước 3: Set Biến Tùy Chọn (Nếu Cần)**
- [ ] `GEMINI_API_KEY` - Nếu cần AI features
- [ ] `GROQ_API_KEY` - Nếu cần AI features
- [ ] `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` - Nếu cần gửi email
- [ ] `CLOUDINARY_*` - Nếu cần cloud storage
- [ ] Các biến khác tùy nhu cầu

### **Bước 4: Update CORS (Sau Khi Deploy)**
- [ ] `CORS_ALLOWED_ORIGINS` - Thêm domain của frontend
- [ ] `FRONTEND_URL` - URL của frontend

---

## 🎯 Các Biến Quan Trọng Cần Update Sau Deploy

Sau khi deploy xong, nhớ update:

1. **CORS_ALLOWED_ORIGINS:**
   ```
   https://your-frontend.onrender.com,http://localhost:3000,http://localhost:5173
   ```

2. **FRONTEND_URL:**
   ```
   https://your-frontend.onrender.com
   ```

3. **PUBLIC_URL:**
   ```
   https://your-service.onrender.com
   ```

---

## 📊 Tổng Kết

- ✅ **60+ environment variables** đã được cấu hình
- 🔴 **2 biến bắt buộc** phải set: `DATABASE_URL`, `REDIS_URL`
- ⚠️ **10+ biến tùy chọn** set nếu cần (AI, Email, Storage, etc.)
- ✅ **Tất cả biến khác** đã có default values phù hợp

---

**Vậy là đầy đủ rồi! Bạn chỉ cần set 2-3 biến bắt buộc là có thể deploy! 🚀**

