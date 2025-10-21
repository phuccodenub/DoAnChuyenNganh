# ✅ KẾT QUẢ KIỂM TRA DATABASE SCHEMA

**Ngày kiểm tra:** 19/10/2025  
**Phương pháp:** Truy vấn trực tiếp PostgreSQL  

---

## 📊 ENROLLMENTS TABLE

### Columns có trong Database (24 columns):

```sql
id                  uuid                NOT NULL
user_id             uuid                NOT NULL
course_id           uuid                NOT NULL
status              enum                NOT NULL DEFAULT 'pending'
  ↳ Values: 'pending', 'active', 'completed', 'cancelled', 'suspended'
enrollment_type     enum                NOT NULL DEFAULT 'free'
  ↳ Values: 'free', 'paid', 'trial'
payment_status      enum                NOT NULL DEFAULT 'pending'
payment_method      varchar(50)
payment_id          varchar(255)
amount_paid         numeric(10,2)
currency            varchar(3)
progress_percentage numeric(5,2)        NOT NULL DEFAULT 0
completed_lessons   integer             NOT NULL DEFAULT 0
total_lessons       integer             NOT NULL DEFAULT 0
last_accessed_at    timestamp with time zone
completion_date     timestamp with time zone
certificate_issued  boolean             NOT NULL DEFAULT false
certificate_url     varchar(500)
rating              integer
review              text
review_date         timestamp with time zone
access_expires_at   timestamp with time zone
metadata            json
created_at          timestamp with time zone NOT NULL
updated_at          timestamp with time zone NOT NULL
```

### ❌ Columns KHÔNG CÓ trong Database:
- `enrolled_at` (Model có nhưng DB không có)
- `grade` (Model có nhưng DB không có)
- `completed_at` (Model có nhưng DB không có)

### ✅ Quyết định:
**GIỮ Database schema, UPDATE Code để match**

---

## 📊 COURSES TABLE

### Columns có trong Database (33 columns):

```sql
id                  uuid                NOT NULL
title               varchar(200)        NOT NULL
description         text
short_description   varchar(500)
instructor_id       uuid                NOT NULL
category            varchar(100)
subcategory         varchar(100)
level               enum                NOT NULL DEFAULT 'beginner'
  ↳ Values: 'beginner', 'intermediate', 'advanced', 'expert'
language            varchar(10)         NOT NULL DEFAULT 'en'
price               numeric(10,2)       NOT NULL DEFAULT 0
currency            varchar(3)          NOT NULL DEFAULT 'USD'
discount_price      numeric(10,2)
discount_percentage integer
discount_start      timestamp with time zone
discount_end        timestamp with time zone
thumbnail           varchar(500)        -- NOT thumbnail_url!
video_intro         varchar(500)
duration_hours      integer
total_lessons       integer             NOT NULL DEFAULT 0
total_students      integer             NOT NULL DEFAULT 0
rating              numeric(3,2)        NOT NULL DEFAULT 0
total_ratings       integer             NOT NULL DEFAULT 0
status              enum                NOT NULL DEFAULT 'draft'
  ↳ Values: 'draft', 'published', 'archived'
is_featured         boolean             NOT NULL DEFAULT false
is_free             boolean             NOT NULL DEFAULT false
prerequisites       json
learning_objectives json
tags                json
metadata            json                -- NOT settings!
published_at        timestamp with time zone
created_at          timestamp with time zone NOT NULL
updated_at          timestamp with time zone NOT NULL
category_id         uuid
```

### ❌ Columns KHÔNG CÓ trong Database:
- `start_date` (Model có nhưng DB không có)
- `end_date` (Model có nhưngng DB không có)
- `max_students` (Model có nhưng DB không có)

### ⚠️ Xung đột tên:
- Model: `thumbnail_url` ❌ → DB: `thumbnail` ✅
- Model: `settings` ❌ → DB: `metadata` ✅

### ✅ Quyết định:
**Database schema TỐT HƠN - Đầy đủ features, chuẩn hóa**
- GIỮ: Database schema
- UPDATE: Code để match
- QUYẾT ĐỊNH: KHÔNG thêm start_date/end_date vào database (keep flexibility)

---

## 🎯 ACTION PLAN (Updated dựa trên DB thực tế)

### PHASE 1 - CRITICAL (Cần làm ngay):

#### Enrollment Model:
1. ✅ Rename: `progress` → `progress_percentage`
2. ✅ Remove: `enrolled_at` (không có trong DB)
3. ✅ Remove: `grade` (không có trong DB)
4. ✅ Fix status enum: match với DB
5. ✅ Rename: `completed_at` → `completion_date`

#### Course Model:
1. ✅ Rename: `thumbnail_url` → `thumbnail`
2. ✅ Rename: `settings` → `metadata`
3. ❌ KEEP: `start_date`, `end_date` trong model (business requirement)
   - Nhưng KHÔNG sync với DB (DB không có)
   - Code có thể dùng cho future feature
4. ✅ Remove: `max_students` (không có trong DB)

### PHASE 2 - MVP CORE (Thêm vào model từ DB):

#### Enrollment - Essential fields:
- `enrollment_type` (free/paid/trial)
- `completed_lessons`, `total_lessons`
- `last_accessed_at`

#### Course - Essential fields:
- `short_description`
- `level` (beginner/intermediate/advanced/expert)
- `language`
- `duration_hours`, `total_lessons`

### PHASE 3 - ENHANCEMENT (Có trong DB, thêm sau):
- Payment fields (enrollment)
- Certificate fields (enrollment)
- Rating fields (enrollment)
- Pricing fields (course)
- Statistics fields (course)
- Marketing fields (course)

---

## ✅ VERIFICATION

Đã verify:
- [x] Enrollment table structure
- [x] Enrollment status enum values
- [x] Course table structure
- [x] Course level enum values
- [x] Foreign keys
- [x] Indexes

**Database schema is AUTHORITATIVE source of truth!**
