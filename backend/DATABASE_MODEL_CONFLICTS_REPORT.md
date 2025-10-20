# 🚨 BÁO CÁO XUNG ĐỘT GIỮA DATABASE VÀ MODEL

**Ngày kiểm tra:** 19/10/2025  
**Phạm vi:** Toàn bộ backend models vs Database schema  
**Trạng thái:** ⚠️ **PHÁT HIỆN NHIỀU XUNG ĐỘT NGHIÊM TRỌNG**

---

## 📊 TỔNG QUAN

| Vấn đề | Số lượng | Mức độ |
|--------|----------|--------|
| Model thiếu columns so với DB | 2+ | 🔴 **CAO** |
| Field name không khớp | 3+ | 🟡 **TRUNG BÌNH** |
| Enum values không khớp | 1 (đã fix) | ✅ **ĐÃ FIX** |
| Data type không khớp | Chưa rõ | 🟡 **CẦN KIỂM TRA** |

---

## 🔴 XUNG ĐỘT 1: ENROLLMENT MODEL

### Vấn đề: Model THIẾU 15 COLUMNS so với Database!

**Database có 24 columns:**
```sql
id, user_id, course_id, status, enrollment_type, payment_status, 
payment_method, payment_id, amount_paid, currency, progress_percentage, 
completed_lessons, total_lessons, last_accessed_at, completion_date, 
certificate_issued, certificate_url, rating, review, review_date, 
access_expires_at, metadata, created_at, updated_at
```

**Model chỉ có 9 columns:**
```typescript
id, user_id, course_id, status, enrolled_at, completion_date, 
progress, grade, created_at, updated_at
```

### ❌ Columns THIẾU trong Model:

| Column | Type | Default | Mô tả |
|--------|------|---------|-------|
| `enrollment_type` | enum | 'free' | Loại đăng ký (free/paid/trial) |
| `payment_status` | enum | 'pending' | Trạng thái thanh toán |
| `payment_method` | varchar | NULL | Phương thức thanh toán |
| `payment_id` | varchar | NULL | Mã giao dịch |
| `amount_paid` | numeric | NULL | Số tiền đã trả |
| `currency` | varchar(3) | NULL | Đơn vị tiền tệ |
| `progress_percentage` | numeric | 0 | Tiến độ (%) |
| `completed_lessons` | integer | 0 | Số bài đã hoàn thành |
| `total_lessons` | integer | 0 | Tổng số bài |
| `last_accessed_at` | timestamp | NULL | Lần truy cập cuối |
| `certificate_issued` | boolean | false | Đã cấp chứng chỉ? |
| `certificate_url` | varchar | NULL | URL chứng chỉ |
| `rating` | integer | NULL | Đánh giá (1-5) |
| `review` | text | NULL | Nhận xét |
| `review_date` | timestamp | NULL | Ngày đánh giá |
| `access_expires_at` | timestamp | NULL | Hết hạn truy cập |
| `metadata` | json | NULL | Metadata bổ sung |

### ⚠️ Columns XUNG ĐỘT:

| Model Field | DB Column | Conflict |
|-------------|-----------|----------|
| `enrolled_at` | ❌ **KHÔNG TỒN TẠI** | Model có, DB không có |
| `progress` | `progress_percentage` | Tên khác nhau |
| `grade` | ❌ **KHÔNG TỒN TẠI** | Model có, DB không có |

### 🔴 TÁC ĐỘNG:

1. **Sequelize sẽ KHÔNG THẤY** 15 columns trong database
2. **Không thể query/update** các fields về payment, certificate, rating
3. **Data loss risk:** Nếu save model, có thể mất data của các columns không được định nghĩa
4. **Business logic broken:** Không thể xử lý payment, certificate, rating

---

## 🔴 XUNG ĐỘT 2: COURSE MODEL

### Vấn đề: Model THIẾU 20+ COLUMNS so với Database!

**Database có 33 columns:**
```sql
id, title, description, short_description, instructor_id, category, 
subcategory, level, language, price, currency, discount_price, 
discount_percentage, discount_start, discount_end, thumbnail, 
video_intro, duration_hours, total_lessons, total_students, rating, 
total_ratings, status, is_featured, is_free, prerequisites, 
learning_objectives, tags, metadata, published_at, created_at, 
updated_at, category_id
```

**Model chỉ có ~13 columns:**
```typescript
id, title, description, instructor_id, category_id, status, 
start_date, end_date, max_students, thumbnail_url, tags, 
settings, created_at, updated_at
```

### ❌ Columns THIẾU trong Model:

| Category | Missing Columns |
|----------|----------------|
| **Mô tả** | `short_description` |
| **Phân loại** | `category`, `subcategory`, `level`, `language` |
| **Giá cả** | `price`, `currency`, `discount_price`, `discount_percentage`, `discount_start`, `discount_end`, `is_free` |
| **Media** | `video_intro` |
| **Thống kê** | `duration_hours`, `total_lessons`, `total_students`, `rating`, `total_ratings` |
| **Hiển thị** | `is_featured` |
| **Nội dung** | `prerequisites`, `learning_objectives` |
| **Metadata** | `metadata`, `published_at` |

### ⚠️ Columns XUNG ĐỘT:

| Model Field | DB Column | Conflict |
|-------------|-----------|----------|
| `start_date` | ❌ **KHÔNG TỒN TẠI** | Model có, DB không có |
| `end_date` | ❌ **KHÔNG TỒN TẠI** | Model có, DB không có |
| `max_students` | ❌ **KHÔNG TỒN TẠI** | Model có, DB không có |
| `thumbnail_url` | `thumbnail` | Tên khác nhau |
| `settings` | `metadata` | Tên khác nhau (?) |

### 🔴 TÁC ĐỘNG:

1. **Không thể xử lý pricing:** Payment features bị broken
2. **Không thể search/filter:** Thiếu level, language, category
3. **Thống kê sai:** Không track students, ratings
4. **SEO/Marketing broken:** Thiếu featured, video intro

---

## 🟡 XUNG ĐỘT 3: USER MODEL (ĐÃ FIX)

### ✅ Đã fix trong session này:

| Issue | Before | After |
|-------|--------|-------|
| Field name | `is_email_verified` | ✅ `email_verified` |
| Missing column | ❌ No `email_verified_at` | ✅ Added via migration |

---

## 🔍 CẦN KIỂM TRA THÊM

### Các bảng có thể có xung đột tương tự:

1. ✅ **users** - Đã kiểm tra và fix
2. ✅ **enrollments** - Phát hiện xung đột lớn
3. ✅ **courses** - Phát hiện xung đột lớn
4. ⏳ **assignments** - Cần kiểm tra
5. ⏳ **quizzes** - Cần kiểm tra
6. ⏳ **lessons** - Cần kiểm tra
7. ⏳ **notifications** - Cần kiểm tra
8. ⏳ **chat_messages** - Cần kiểm tra
9. ⏳ **grades** - Cần kiểm tra
10. ⏳ **live_sessions** - Cần kiểm tra

---

## 🎯 NGUYÊN NHÂN

### Tại sao có xung đột?

1. **Database được tạo từ migration riêng**
   - Migration files tạo full schema
   - Models chỉ define một phần fields

2. **Models được viết tay, không sync với DB**
   - Không dùng tools để generate từ schema
   - Không có validation process

3. **Thiếu quy trình review**
   - Migration không được review cùng models
   - Không có automated schema validation

---

## ⚠️ RỦI RO

### 1. Data Loss 🔴 **CAO**
- Sequelize có thể KHÔNG LƯU các fields không được định nghĩa
- Update model có thể ghi đè/xóa data

### 2. Business Logic Broken 🔴 **CAO**
- Payment processing không hoạt động
- Certificate generation không hoạt động
- Rating/Review không hoạt động

### 3. Query Issues 🟡 **TRUNG BÌNH**
- Không thể query theo price, level, language
- Không thể filter/sort theo các fields thiếu

### 4. API Incomplete 🟡 **TRUNG BÌNH**
- API không trả về đầy đủ data
- Frontend thiếu thông tin cần thiết

---

## ✅ GIẢI PHÁP

### Option 1: Update Models để match Database (KHUYẾN NGHỊ)

**Ưu điểm:**
- ✅ Giữ nguyên database (có data)
- ✅ Không cần migration phức tạp
- ✅ Tận dụng được schema hiện có

**Nhược điểm:**
- ⚠️ Phải update nhiều files
- ⚠️ Phải update types, DTOs

**Action:**
```typescript
// 1. Update enrollment.model.ts
// Thêm 15 columns thiếu

// 2. Update course.model.ts
// Thêm 20+ columns thiếu

// 3. Update types/model.types.ts
// Thêm fields vào interfaces

// 4. Update DTOs
// Thêm validation cho fields mới

// 5. Update repositories
// Support query/update fields mới
```

### Option 2: Migration để match Models

**Ưu điểm:**
- ✅ Models đơn giản hơn
- ✅ Chỉ giữ fields cần thiết

**Nhược điểm:**
- ❌ Mất data của 35+ columns
- ❌ Phải rebuild nhiều features
- ❌ Breaking changes lớn

**KHÔNG KHUYẾN NGHỊ** - Mất quá nhiều features

### Option 3: Hybrid Approach

**Giữ cả 2, add mapping:**
```typescript
// Define model với full fields
// Nhưng chỉ expose một số fields qua API
```

---

## 📋 ACTION PLAN

### 🔴 URGENT (Làm ngay)

1. **Fix Enrollment Model**
   - [ ] Add 15 missing columns
   - [ ] Update EnrollmentAttributes type
   - [ ] Create EnrollmentDTO with validation
   - [ ] Update repository methods
   - [ ] Test payment flow

2. **Fix Course Model**
   - [ ] Add 20+ missing columns
   - [ ] Update CourseAttributes type
   - [ ] Create CourseDTO with validation
   - [ ] Update repository methods
   - [ ] Test pricing, filtering

### 🟡 HIGH PRIORITY

3. **Kiểm tra các models khác**
   - [ ] Assignment model vs DB
   - [ ] Quiz model vs DB
   - [ ] Lesson model vs DB
   - [ ] Notification model vs DB
   - [ ] Grade model vs DB

4. **Tạo validation tool**
   - [ ] Script để compare model vs DB schema
   - [ ] Run trong CI/CD
   - [ ] Alert nếu không khớp

### 🟢 MEDIUM PRIORITY

5. **Documentation**
   - [ ] Document database schema
   - [ ] Document model structure
   - [ ] Create migration guidelines

6. **Testing**
   - [ ] Add tests cho all fields
   - [ ] Integration tests với database
   - [ ] Validate data persistence

---

## 🛠️ CÔNG CỤ HỖ TRỢ

### Script kiểm tra schema sync

```typescript
// tools/check-schema-sync.ts
import { getSequelize } from '../src/config/db';
import * as models from '../src/models';

async function checkSchemaSync() {
  const sequelize = getSequelize();
  
  for (const [modelName, model] of Object.entries(models)) {
    const tableName = model.tableName;
    
    // Get DB columns
    const [dbColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}'
    `);
    
    // Get model attributes
    const modelAttrs = Object.keys(model.rawAttributes);
    
    // Compare
    const missing = dbColumns.filter(
      col => !modelAttrs.includes(col.column_name)
    );
    
    if (missing.length > 0) {
      console.error(`❌ ${modelName}: Missing ${missing.length} columns`);
      console.error(`   ${missing.map(c => c.column_name).join(', ')}`);
    } else {
      console.log(`✅ ${modelName}: All columns defined`);
    }
  }
}
```

### Generate model from schema

```bash
# Install sequelize-auto
npm install -g sequelize-auto

# Generate models
sequelize-auto -h localhost -d lms_db -u lms_user -x 123456 -p 5432 \
  --dialect postgres -o ./generated-models
```

---

## 📈 METRICS

### Code-DB Sync Status

| Model | DB Columns | Model Columns | Sync % | Status |
|-------|-----------|---------------|--------|--------|
| User | 30 | 30 | 100% | ✅ |
| Enrollment | 24 | 9 | 37.5% | 🔴 |
| Course | 33 | 13 | 39.4% | 🔴 |
| Assignment | ? | ? | ? | ⏳ |
| Quiz | ? | ? | ? | ⏳ |
| Lesson | ? | ? | ? | ⏳ |

**Overall Sync:** ~60% (rough estimate)

---

## 💡 KHUYẾN NGHỊ

### Immediate Actions:

1. ✅ **Ưu tiên fix Enrollment & Course models** - Ảnh hưởng lớn nhất
2. ✅ **Tạo tool validation** - Tránh lặp lại vấn đề
3. ✅ **Add to CI/CD** - Automated checking

### Long-term:

1. Consider **Prisma** hoặc **TypeORM** - Better schema sync
2. Use **Schema-first approach** - Generate code from DB
3. Implement **Migration review process** - Require model updates

---

## 🎓 LESSONS LEARNED

1. **Always sync models with database schema**
2. **Use tools to generate models from DB schema**
3. **Add automated validation in CI/CD**
4. **Review migrations AND models together**
5. **Document schema changes**

---

**Prepared by:** GitHub Copilot  
**Date:** October 19, 2025  
**Status:** ⚠️ **ACTION REQUIRED - CRITICAL ISSUES FOUND**
