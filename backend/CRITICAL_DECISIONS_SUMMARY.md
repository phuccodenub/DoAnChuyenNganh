# 🎯 TÓM TẮT CÁC QUYẾT ĐỊNH QUAN TRỌNG

## 📋 Tổng quan
File này tóm tắt các quyết định quan trọng đã được đưa ra để giải quyết xung đột giữa Models và Database.

---

## 🔥 QUYẾT ĐỊNH QUAN TRỌNG

### 1. ✅ **COURSE: category_id vs category/subcategory**

**Vấn đề**: Database có CÙNG LÚC:
- `category_id` (UUID, foreign key) - Đúng chuẩn
- `category` và `subcategory` (VARCHAR) - Lỗi thiết kế

**Quyết định**: 
- ✅ **GIỮ** `category_id` (foreign key) - ĐÂY LÀ CÁCH ĐÚNG
- ❌ **XÓA** `category` và `subcategory` (text) từ database
- 🔧 **Migration**: Tạo migration để loại bỏ 2 cột không cần thiết

**Lý do**:
- Foreign key đảm bảo tính toàn vẹn dữ liệu
- Dễ dàng JOIN và query
- Tránh duplicate data và typo
- Chuẩn database normalization

**Code**:
```typescript
// Model - ĐÃ ĐÚNG
category_id: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'categories',
    key: 'id'
  },
  onDelete: 'SET NULL'
}
```

---

### 2. ✅ **USER: password vs password_hash**

**Vấn đề**: 
- Database dùng column name `password`
- Model muốn dùng tên rõ ràng hơn `password_hash`

**Quyết định**:
- ✅ **GIỮ** `password_hash` trong model (tên rõ ràng)
- ✅ **MAP** sang `password` trong database
- ❌ **KHÔNG ĐỔI** tên column trong database

**Lý do**:
- `password_hash` rõ ràng hơn (không lưu plain password)
- Sequelize hỗ trợ field mapping
- Không cần migration database

**Code**:
```typescript
password_hash: {
  type: DataTypes.STRING(255),
  allowNull: false,
  field: 'password' // Map to database column
}
```

---

### 3. ✅ **USER: Password Reset Token - Model riêng vs Database column**

**Vấn đề**: 
- Database có `password_reset_token` và `password_reset_expires`
- Đã có model `PasswordResetToken` riêng

**Quyết định**:
- ✅ **GIỮ** model `PasswordResetToken` riêng (tách biệt logic)
- ❌ **KHÔNG THÊM** vào User model
- ⚠️ **CHO PHÉP** database có 2 columns này (không xóa)

**Lý do**:
- Separation of concerns
- PasswordResetToken model có thể có logic phức tạp (cleanup expired tokens)
- Database columns có thể dùng cho legacy system
- Không conflict vì không sử dụng trong User model

---

### 4. ⏸️ **Tính năng TẠM HOÃN (Phase 2)**

**Quyết định**: Các tính năng sau sẽ KHÔNG triển khai trong Phase 1 (MVP):

#### User Model:
- ⏸️ `two_factor_enabled`, `two_factor_secret`, `two_factor_backup_codes` - 2FA
- ⏸️ `login_attempts`, `lockout_until` - Security lockout

#### Course Model:
- ⏸️ `discount_price`, `discount_percentage`, `discount_start`, `discount_end` - Flash sale

#### Enrollment Model:
- ⏸️ `payment_status`, `payment_method`, `payment_id`, `amount_paid`, `currency` - Payment
- ⏸️ `certificate_issued`, `certificate_url` - Certificate

**Lý do**: 
- MVP tập trung vào tính năng cốt lõi
- Các tính năng này phức tạp và cần thời gian
- Model vẫn CÓ các fields này (để dễ mở rộng sau)
- Chỉ là chưa TRIỂN KHAI logic nghiệp vụ

**Lưu ý quan trọng**: 
```
✅ THÊM VÀO MODEL = Có sẵn trong code
⏸️ CHƯA TRIỂN KHAI = Chưa code logic
```

---

### 5. ✅ **Tính năng TRIỂN KHAI NGAY (Phase 1)**

**Quyết định**: Các tính năng sau phải có trong Phase 1 (MVP):

#### User Model:
- ✅ `username` - Đăng nhập bằng username (YÊU CẦU)
- ✅ `social_id`, `social_provider` - OAuth Google, Facebook (YÊU CẦU)
- ✅ `email_verification_token`, `email_verification_expires` - Xác thực email
- ✅ `preferences`, `metadata` - Tùy chỉnh và mở rộng

#### Course Model:
- ✅ `price`, `currency`, `is_free` - Hỗ trợ free + paid (YÊU CẦU)
- ✅ `is_featured` - Khóa học nổi bật (YÊU CẦU)
- ✅ `total_students`, `rating`, `total_ratings` - Thống kê (cache fields)
- ✅ `video_intro`, `published_at` - Marketing
- ✅ `prerequisites`, `learning_objectives` - Nội dung học tập

#### Enrollment Model:
- ✅ `access_expires_at` - Giới hạn thời gian (YÊU CẦU)
- ✅ `rating`, `review`, `review_date` - Review (chuẩn bị, chưa triển khai UI)
- ✅ `metadata` - Mở rộng

#### Category Model:
- ✅ `course_count` - Cache field tối ưu performance

---

## 📊 BẢNG TỔNG HỢP QUYẾT ĐỊNH

| Vấn đề | Quyết định | Lý do | Priority |
|--------|-----------|-------|----------|
| Course.category_id vs category text | XÓA category text, GIỮ category_id | Foreign key chuẩn | 🔥 Cao |
| User.password_hash vs password | MAP password_hash → password | Tên rõ ràng | ✅ Cao |
| Password reset tokens | GIỮ model riêng | Separation of concerns | ✅ Trung bình |
| 2FA, Security lockout | TẠM HOÃN Phase 2 | Phức tạp, chưa cần ngay | ⏸️ Thấp |
| Payment, Certificate | TẠM HOÃN Phase 2 | Chưa tích hợp gateway | ⏸️ Thấp |
| Flash sale, Discounts | TẠM HOÃN Phase 2 | Không cần trong MVP | ⏸️ Thấp |
| Username, Social login | TRIỂN KHAI NGAY | Yêu cầu nghiệp vụ | 🔥 Cao |
| Featured courses | TRIỂN KHAI NGAY | Yêu cầu nghiệp vụ | 🔥 Cao |
| Access expiration | TRIỂN KHAI NGAY | Yêu cầu nghiệp vụ | 🔥 Cao |
| Review system | THÊM VÀO MODEL, chưa triển khai UI | Chuẩn bị tương lai | ✅ Trung bình |

---

## 🎯 CHIẾN LƯỢC TRIỂN KHAI

### **Approach: "Model Complete, Feature Gradual"**

**Nguyên tắc**:
1. ✅ **Model phải ĐẦY ĐỦ** các fields (theo database)
2. ⏸️ **Feature triển khai DẦN** theo priority
3. 🔧 **Migration NGAY** cho xung đột nghiêm trọng
4. 📝 **Document rõ ràng** tính năng nào đã/chưa triển khai

**Ví dụ**:
```typescript
// ✅ Model có field payment_status
payment_status: {
  type: DataTypes.ENUM('pending', 'paid', 'failed'),
  allowNull: true
}

// ⏸️ Nhưng logic payment chưa triển khai
// TODO Phase 2: Implement payment gateway integration
```

---

## 🔧 MIGRATION PRIORITIES

### Priority 1: NGAY LẬP TỨC (Blocking)
```sql
-- XÓA xung đột thiết kế
ALTER TABLE courses DROP COLUMN category;
ALTER TABLE courses DROP COLUMN subcategory;
```

### Priority 2: Phase 1 MVP (Tuần 1-2)
- Không cần migration (chỉ cập nhật model)
- Database đã có đầy đủ columns
- Chỉ cần sync code

### Priority 3: Phase 2 (Sau MVP)
- Có thể cần migration cho indexes
- Có thể cần migration cho constraints
- Tùy vào performance requirements

---

## ✅ CHECKLIST XÁC NHẬN

Đã xác nhận các quyết định với stakeholder:

- [x] Course dùng category_id (foreign key) ✅
- [x] User dùng password_hash trong code, map sang password trong DB ✅
- [x] Password reset giữ model riêng ✅
- [x] 2FA, Security lockout → Phase 2 ⏸️
- [x] Payment, Certificate → Phase 2 ⏸️
- [x] Flash sale, Discounts → Phase 2 ⏸️
- [x] Username, Social login → Phase 1 ✅
- [x] Featured courses → Phase 1 ✅
- [x] Access expiration → Phase 1 ✅
- [x] Review system (model only) → Phase 1, UI Phase 2 ✅

---

## 🚨 LƯU Ý QUAN TRỌNG

### ⚠️ Breaking Changes
**Chỉ có 1 breaking change**:
- Xóa `category` và `subcategory` từ courses table
- Database hiện tại TRỐNG → Không ảnh hưởng

### ✅ Non-Breaking Changes
- Tất cả các thay đổi khác chỉ THÊM fields
- Không xóa fields đang dùng
- Không đổi type của fields đang dùng

### 📝 Documentation Requirements
- [ ] Update API docs với các fields mới
- [ ] Update Postman collection
- [ ] Update frontend interfaces/types
- [ ] Update deployment guide

---

## 📚 RELATED DOCUMENTS

1. [MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md](./MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md) - Phân tích chi tiết
2. [MODEL_DATABASE_SYNC_SOLUTION.md](./MODEL_DATABASE_SYNC_SOLUTION.md) - Giải pháp code cụ thể
3. [MODEL_IMPORTANCE_RANKING_REPORT.md](./MODEL_IMPORTANCE_RANKING_REPORT.md) - Đánh giá độ quan trọng

---

**Ngày cập nhật**: 22/10/2025
**Người quyết định**: Đã confirm với stakeholder
**Trạng thái**: ✅ Approved - Ready for implementation
