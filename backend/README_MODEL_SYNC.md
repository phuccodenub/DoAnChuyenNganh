# 📚 HƯỚNG DẪN ĐỒNG BỘ MODELS & DATABASE

## 🎯 Mục đích
Hướng dẫn này giúp bạn hiểu và thực hiện việc đồng bộ hóa giữa Sequelize Models và PostgreSQL Database.

---

## 📁 Cấu trúc tài liệu

### 1. **MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md** ⭐⭐⭐⭐⭐
**Đọc đầu tiên**

**Nội dung**:
- ✅ Phân tích chi tiết từng model (User, Course, Enrollment, Category)
- ✅ So sánh model với database thực tế (đã kiểm tra bằng psql)
- ✅ Đánh giá độ quan trọng và priority
- ✅ Xác định xung đột nghiêm trọng
- ✅ Đề xuất giải pháp và lộ trình

**Khi nào đọc**: Trước khi bắt đầu code

---

### 2. **CRITICAL_DECISIONS_SUMMARY.md** ⭐⭐⭐⭐⭐
**Đọc thứ hai**

**Nội dung**:
- ✅ Tóm tắt các quyết định quan trọng
- ✅ Giải thích lý do cho từng quyết định
- ✅ Chiến lược triển khai: "Model Complete, Feature Gradual"
- ✅ Checklist xác nhận với stakeholder
- ✅ Breaking changes và non-breaking changes

**Khi nào đọc**: Trước khi bắt đầu implement

---

### 3. **MODEL_DATABASE_SYNC_SOLUTION.md** ⭐⭐⭐⭐⭐
**Đọc khi implement**

**Nội dung**:
- ✅ Code cụ thể cho từng model (User, Course, Enrollment, Category)
- ✅ Migration scripts chi tiết
- ✅ Type definitions cập nhật
- ✅ Testing checklist với example code
- ✅ Deployment plan từng bước
- ✅ Troubleshooting guide

**Khi nào đọc**: Khi bắt đầu code

---

### 4. **MODEL_IMPORTANCE_RANKING_REPORT.md** ⭐⭐⭐
**Đọc để hiểu tổng quan**

**Nội dung**:
- ✅ Xếp hạng 29 models theo độ quan trọng (1-5 sao)
- ✅ Phân loại theo chức năng (Authentication, Course Management, Assessment, etc.)
- ✅ Ưu tiên phát triển theo Phase

**Khi nào đọc**: Khi cần hiểu big picture

---

## 🚀 QUICK START GUIDE

### Bước 1: Đọc và hiểu (30 phút)
```bash
1. Đọc MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md (15 phút)
2. Đọc CRITICAL_DECISIONS_SUMMARY.md (10 phút)
3. Scan MODEL_DATABASE_SYNC_SOLUTION.md (5 phút)
```

### Bước 2: Backup database (2 phút)
```bash
cd backend
pg_dump postgresql://lms_user:123456@localhost:5432/lms_db > backup_$(date +%Y%m%d).sql
```

### Bước 3: Tạo branch (1 phút)
```bash
git checkout -b feature/model-database-sync
```

### Bước 4: Implement theo thứ tự (2-3 ngày)

#### Day 1: User & Course Models
```bash
# 1. Cập nhật User model
# Copy code từ MODEL_DATABASE_SYNC_SOLUTION.md section "1. USER MODEL"
code src/models/user.model.ts

# 2. Cập nhật Course model
# Copy code từ MODEL_DATABASE_SYNC_SOLUTION.md section "2. COURSE MODEL"
code src/models/course.model.ts

# 3. Test compile
npm run build
```

#### Day 2: Enrollment, Category & Migration
```bash
# 1. Cập nhật Enrollment model
code src/models/enrollment.model.ts

# 2. Cập nhật Category model
code src/models/category.model.ts

# 3. Tạo migration xóa category/subcategory
npx sequelize-cli migration:generate --name cleanup-course-categories
# Copy code từ MODEL_DATABASE_SYNC_SOLUTION.md section "Migration 1"

# 4. Chạy migration
npx sequelize-cli db:migrate

# 5. Verify
psql postgresql://lms_user:123456@localhost:5432/lms_db -c "\d courses"
```

#### Day 3: Type definitions & Testing
```bash
# 1. Cập nhật types
code src/types/model.types.ts
# Copy code từ MODEL_DATABASE_SYNC_SOLUTION.md section "UPDATE TYPE DEFINITIONS"

# 2. Run tests
npm run test

# 3. Manual testing
npm run dev
```

---

## 📊 TÓM TẮT THAY ĐỔI

### User Model
**Thêm 7 fields**:
- ✅ username (đăng nhập bằng username)
- ✅ email_verification_token, email_verification_expires
- ✅ social_id, social_provider (OAuth)
- ✅ preferences, metadata

### Course Model
**Thêm 11 fields + Migration**:
- ✅ price, currency, is_free, is_featured
- ✅ total_students, rating, total_ratings
- ✅ video_intro, published_at
- ✅ prerequisites, learning_objectives
- 🔧 **Migration**: Xóa category/subcategory

### Enrollment Model
**Thêm 4 fields + Fix type**:
- ✅ access_expires_at, metadata
- ✅ rating, review, review_date
- 🔧 **Fix**: last_accessed_at từ DATE → TIMESTAMP

### Category Model
**Thêm 1 field**:
- ✅ course_count (cache field)

---

## ⚠️ BREAKING CHANGES

**Chỉ có 1 breaking change**:
- Xóa columns `category` và `subcategory` từ table `courses`
- Database hiện tại trống → Không ảnh hưởng gì

---

## 🎯 CHIẾN LƯỢC: "Model Complete, Feature Gradual"

### Phase 1 (MVP - 2-3 tuần):
```
✅ Cập nhật TẤT CẢ models với đầy đủ fields
✅ Triển khai các tính năng cốt lõi:
   - Username & Social login
   - Featured courses
   - Access expiration
   - Course pricing (free/paid)
⏸️ Chưa triển khai UI/logic cho:
   - Review system (có model, chưa có UI)
   - Payment (có model, chưa tích hợp gateway)
   - Certificate (có model, chưa có generate logic)
```

### Phase 2 (Advanced - Sau MVP):
```
⏸️ Triển khai các tính năng nâng cao:
   - 2FA & Security lockout
   - Payment gateway integration
   - Certificate generation
   - Flash sale & Discounts
   - Review UI & moderation
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Pre-implementation:
- [x] Đọc MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md
- [x] Đọc CRITICAL_DECISIONS_SUMMARY.md
- [x] Hiểu rõ chiến lược "Model Complete, Feature Gradual"
- [x] Backup database
- [x] Tạo feature branch

### Implementation:
- [ ] Cập nhật User model
- [ ] Cập nhật Course model
- [ ] Cập nhật Enrollment model
- [ ] Cập nhật Category model
- [ ] Tạo migration cleanup-course-categories
- [ ] Chạy migration
- [ ] Cập nhật type definitions
- [ ] Verify database schema

### Testing:
- [ ] TypeScript compilation OK
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing OK

### Documentation:
- [ ] Update API documentation
- [ ] Update Postman collection
- [ ] Update frontend types
- [ ] Update deployment guide

### Deployment:
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Verify staging
- [ ] Deploy to production

---

## 🆘 TROUBLESHOOTING

### Problem 1: Migration fails
```bash
# Rollback
npx sequelize-cli db:migrate:undo

# Check logs
tail -f logs/error.log

# Verify database
psql postgresql://lms_user:123456@localhost:5432/lms_db
\d courses
```

### Problem 2: TypeScript errors
```bash
# Clear cache
rm -rf dist/
rm -rf node_modules/.cache/

# Rebuild
npm run build
```

### Problem 3: Sequelize can't find columns
```typescript
// Check field mapping
password_hash: {
  type: DataTypes.STRING(255),
  field: 'password' // Make sure mapping is correct
}
```

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. ✅ Đọc lại CRITICAL_DECISIONS_SUMMARY.md
2. ✅ Kiểm tra MODEL_DATABASE_SYNC_SOLUTION.md section "TROUBLESHOOTING"
3. ✅ Verify database schema bằng psql
4. ✅ Check logs: `tail -f logs/error.log`

---

## 🎓 KEY TAKEAWAYS

1. **Model phải ĐẦY ĐỦ fields** - Để dễ mở rộng sau này
2. **Feature triển khai DẦN** - MVP trước, advanced sau
3. **Migration CHỈ cho breaking changes** - Xóa category/subcategory
4. **Testing là BẮT BUỘC** - Trước khi deploy
5. **Documentation phải CẬP NHẬT** - API docs, types, etc.

---

## 📚 ALL DOCUMENTS

| Document | Priority | Purpose |
|----------|----------|---------|
| [MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md](./MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md) | ⭐⭐⭐⭐⭐ | Phân tích chi tiết xung đột |
| [CRITICAL_DECISIONS_SUMMARY.md](./CRITICAL_DECISIONS_SUMMARY.md) | ⭐⭐⭐⭐⭐ | Tóm tắt quyết định |
| [MODEL_DATABASE_SYNC_SOLUTION.md](./MODEL_DATABASE_SYNC_SOLUTION.md) | ⭐⭐⭐⭐⭐ | Code & Implementation guide |
| [MODEL_IMPORTANCE_RANKING_REPORT.md](./MODEL_IMPORTANCE_RANKING_REPORT.md) | ⭐⭐⭐ | Hiểu big picture |
| **README_MODEL_SYNC.md** (file này) | ⭐⭐⭐⭐⭐ | Hướng dẫn tổng quan |

---

**Last Updated**: 22/10/2025  
**Status**: ✅ Ready for Implementation  
**Estimated Time**: 2-3 ngày (Phase 1 MVP)

---

**Good luck! 🚀**
