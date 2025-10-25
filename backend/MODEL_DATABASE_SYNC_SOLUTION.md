# 🔧 GIẢI PHÁP ĐỒNG BỘ MODELS VÀ DATABASE

## 📋 Tổng quan
Tài liệu này cung cấp giải pháp chi tiết để đồng bộ hóa Sequelize models với PostgreSQL database, dựa trên phân tích trong `MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md`.

---

## 🎯 PHASE 1: CẬP NHẬT MODELS (MVP ESSENTIALS)

### 1. USER MODEL - Cập nhật

**File**: `src/models/user.model.ts`

```typescript
import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  
  // ===== AUTHENTICATION FIELDS =====
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Username cho login (alternative to email)'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password', // Map to 'password' column in database
  },
  
  // ===== EMAIL VERIFICATION =====
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token để xác thực email'
  },
  email_verification_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian hết hạn của verification token'
  },
  
  // ===== SOCIAL LOGIN =====
  social_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID từ OAuth provider (Google, Facebook)'
  },
  social_provider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'OAuth provider: google, facebook, github'
  },
  
  // ===== BASIC INFO =====
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: DataTypes.STRING(20),
  bio: DataTypes.TEXT,
  avatar: DataTypes.TEXT,
  
  // ===== ROLES & STATUS =====
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin', 'super_admin'),
    defaultValue: 'student',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
    defaultValue: 'pending', // Changed to 'pending' to match database
  },
  
  // ===== SECURITY =====
  token_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // Changed to 1 to match database
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // ===== USER PREFERENCES & METADATA =====
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'User preferences (theme, language, notifications, etc.)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional flexible data storage'
  },

  // ===== STUDENT FIELDS =====
  student_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mã số sinh viên (ví dụ: SV001, 2021001234)',
  },
  class: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Lớp học (ví dụ: CNTT-K62, QTKD-K63)',
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Chuyên ngành (ví dụ: Công nghệ thông tin, Quản trị kinh doanh)',
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Khóa học (ví dụ: 2021, 2022)',
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Điểm trung bình tích lũy (0.00 - 4.00)',
  },

  // ===== INSTRUCTOR FIELDS =====
  instructor_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mã số giảng viên (ví dụ: GV001, INSTRUCTOR-001)',
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Khoa/Bộ môn (ví dụ: Khoa Công nghệ thông tin)',
  },
  specialization: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Chuyên môn (ví dụ: Lập trình web, Machine Learning)',
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Số năm kinh nghiệm giảng dạy',
  },
  education_level: {
    type: DataTypes.ENUM('bachelor', 'master', 'phd', 'professor'),
    allowNull: true,
    comment: 'Trình độ học vấn',
  },
  research_interests: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lĩnh vực nghiên cứu quan tâm',
  },

  // ===== COMMON FIELDS =====
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Ngày sinh',
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
    comment: 'Giới tính',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Địa chỉ',
  },
  emergency_contact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Liên hệ khẩn cấp',
  },
  emergency_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Số điện thoại liên hệ khẩn cấp',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['username'], where: { username: { [Op.ne]: null } } },
    { fields: ['social_provider', 'social_id'] },
    { fields: ['role'] },
    { fields: ['status'] },
  ]
});

export default User as any;
```

---

### 2. COURSE MODEL - Cập nhật

**File**: `src/models/course.model.ts`

```typescript
import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // ===== BASIC INFO =====
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  
  // ===== RELATIONSHIPS =====
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true, // Will be NOT NULL after migration
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Danh mục của khóa học (foreign key)'
  },
  
  // ===== COURSE DETAILS =====
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'beginner',
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
    allowNull: false
  },
  
  // ===== PRICING =====
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Giá khóa học'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    comment: 'Đơn vị tiền tệ (USD, VND)'
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Khóa học miễn phí'
  },
  
  // ===== MARKETING =====
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Khóa học nổi bật'
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  video_intro: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL video giới thiệu'
  },
  
  // ===== STATISTICS (Cache fields - updated by triggers/hooks) =====
  total_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tổng số học viên đã đăng ký'
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Điểm trung bình (0-5)'
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tổng số đánh giá'
  },
  
  // ===== STATUS & PUBLISHING =====
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian publish khóa học'
  },
  
  // ===== LEARNING CONTENT =====
  prerequisites: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Yêu cầu kiến thức trước khi học'
  },
  learning_objectives: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Mục tiêu học tập sau khóa học'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  
  // ===== TIMESTAMPS =====
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['instructor_id'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['is_featured'] },
    { fields: ['is_free'] },
    { fields: ['published_at'] },
    { fields: ['rating'] },
  ]
});

export default Course as any;
```

---

### 3. ENROLLMENT MODEL - Cập nhật

**File**: `src/models/enrollment.model.ts`

```typescript
import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // ===== RELATIONSHIPS =====
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  
  // ===== STATUS =====
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled', 'suspended'),
    defaultValue: 'pending',
  },
  enrollment_type: {
    type: DataTypes.ENUM('free', 'paid', 'trial'),
    defaultValue: 'free',
    allowNull: false
  },
  
  // ===== PROGRESS TRACKING =====
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  completed_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  
  // ===== ACCESS CONTROL =====
  last_accessed_at: {
    type: DataTypes.DATE, // TIMESTAMP in PostgreSQL
    allowNull: true,
    comment: 'Lần truy cập khóa học gần nhất'
  },
  access_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian hết hạn truy cập khóa học'
  },
  
  // ===== COMPLETION =====
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // ===== REVIEW & FEEDBACK =====
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Đánh giá khóa học (1-5 sao)'
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Nội dung review của học viên'
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian đánh giá'
  },
  
  // ===== METADATA =====
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional data (notes, bookmarks, etc.)'
  },
  
  // ===== TIMESTAMPS =====
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'enrollments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    },
    { fields: ['status'] },
    { fields: ['enrollment_type'] },
    { fields: ['access_expires_at'] },
  ]
});

export default Enrollment as any;
```

---

### 4. CATEGORY MODEL - Cập nhật

**File**: `src/models/category.model.ts`

```typescript
import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  
  // ===== STATISTICS (Cache field) =====
  course_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Số lượng khóa học trong category (cache field)'
  },
  
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['name'] },
    { unique: true, fields: ['slug'] },
    { fields: ['parent_id'] },
    { fields: ['is_active'] },
    { fields: ['order_index'] },
  ]
});

export default Category as any;
```

---

## 🗃️ MIGRATION SCRIPTS

### Migration 1: Loại bỏ category/subcategory conflict

**File**: `backend/migrations/YYYYMMDDHHMMSS-cleanup-course-categories.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Nếu có dữ liệu trong category/subcategory, migrate sang category_id
      // (Hiện tại database trống nên skip bước này)
      
      // 2. Loại bỏ các cột không cần thiết
      await queryInterface.removeColumn('courses', 'category', { transaction });
      await queryInterface.removeColumn('courses', 'subcategory', { transaction });
      
      // 3. Đặt category_id là NOT NULL (sau khi đã có dữ liệu)
      // Tạm thời để nullable, sẽ update sau
      
      await transaction.commit();
      console.log('✅ Migration completed: Removed category/subcategory columns');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Rollback: Add back category/subcategory
      await queryInterface.addColumn('courses', 'category', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });
      
      await queryInterface.addColumn('courses', 'subcategory', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
```

---

## 🔧 UPDATE TYPE DEFINITIONS

**File**: `src/types/model.types.ts`

Cập nhật interface cho các model:

```typescript
// User Model
export interface UserAttributes {
  id: string;
  email: string;
  username?: string | null;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  email_verified_at?: Date | null;
  email_verification_token?: string | null;
  email_verification_expires?: Date | null;
  social_id?: string | null;
  social_provider?: string | null;
  token_version: number;
  last_login?: Date | null;
  preferences?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  
  // Student fields
  student_id?: string | null;
  class?: string | null;
  major?: string | null;
  year?: number | null;
  gpa?: number | null;
  
  // Instructor fields
  instructor_id?: string | null;
  department?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor' | null;
  research_interests?: string | null;
  
  // Common fields
  date_of_birth?: Date | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  
  created_at: Date;
  updated_at: Date;
}

// Course Model
export interface CourseAttributes {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  instructor_id: string;
  category_id?: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  price: number;
  currency: string;
  is_free: boolean;
  is_featured: boolean;
  thumbnail?: string | null;
  video_intro?: string | null;
  total_students: number;
  total_lessons: number;
  duration_hours?: number | null;
  rating: number;
  total_ratings: number;
  status: 'draft' | 'published' | 'archived';
  published_at?: Date | null;
  prerequisites?: string[] | null;
  learning_objectives?: string[] | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

// Enrollment Model
export interface EnrollmentAttributes {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended';
  enrollment_type: 'free' | 'paid' | 'trial';
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at?: Date | null;
  access_expires_at?: Date | null;
  completion_date?: Date | null;
  rating?: number | null;
  review?: string | null;
  review_date?: Date | null;
  metadata?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

// Category Model
export interface CategoryAttributes {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  icon?: string | null;
  color?: string | null;
  order_index: number;
  is_active: boolean;
  course_count: number;
  metadata?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}
```

---

## 📝 TESTING CHECKLIST

### Unit Tests

```typescript
// tests/models/user.model.test.ts
describe('User Model', () => {
  it('should create user with username', async () => {
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password_hash: 'hashed_password',
      first_name: 'Test',
      last_name: 'User',
      role: 'student'
    });
    
    expect(user.username).toBe('testuser');
    expect(user.social_id).toBeNull();
  });
  
  it('should create user with social login', async () => {
    const user = await User.create({
      email: 'social@example.com',
      password_hash: 'random_hash',
      first_name: 'Social',
      last_name: 'User',
      social_id: 'google_123456',
      social_provider: 'google',
      role: 'student'
    });
    
    expect(user.social_provider).toBe('google');
  });
});

// tests/models/course.model.test.ts
describe('Course Model', () => {
  it('should create free course', async () => {
    const course = await Course.create({
      title: 'Free Course',
      instructor_id: instructorId,
      category_id: categoryId,
      is_free: true,
      price: 0,
      level: 'beginner',
      language: 'en'
    });
    
    expect(course.is_free).toBe(true);
    expect(course.price).toBe(0);
  });
  
  it('should create featured course', async () => {
    const course = await Course.create({
      title: 'Featured Course',
      instructor_id: instructorId,
      category_id: categoryId,
      is_featured: true,
      is_free: false,
      price: 99.99,
      level: 'intermediate',
      language: 'en'
    });
    
    expect(course.is_featured).toBe(true);
  });
});

// tests/models/enrollment.model.test.ts
describe('Enrollment Model', () => {
  it('should create enrollment with access expiration', async () => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);
    
    const enrollment = await Enrollment.create({
      user_id: userId,
      course_id: courseId,
      enrollment_type: 'paid',
      access_expires_at: expiresAt
    });
    
    expect(enrollment.access_expires_at).toBeTruthy();
  });
  
  it('should add review to enrollment', async () => {
    await enrollment.update({
      rating: 5,
      review: 'Great course!',
      review_date: new Date()
    });
    
    expect(enrollment.rating).toBe(5);
  });
});
```

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Preparation (Day 1)
```bash
# 1. Backup database
pg_dump postgresql://lms_user:123456@localhost:5432/lms_db > backup_$(date +%Y%m%d).sql

# 2. Create feature branch
git checkout -b feature/model-database-sync

# 3. Update dependencies
npm install
```

### Phase 2: Model Updates (Day 1-2)
```bash
# 1. Update all model files
# - user.model.ts
# - course.model.ts
# - enrollment.model.ts
# - category.model.ts

# 2. Update type definitions
# - model.types.ts

# 3. Run TypeScript compilation
npm run build
```

### Phase 3: Migration (Day 2)
```bash
# 1. Create migration
npx sequelize-cli migration:generate --name cleanup-course-categories

# 2. Run migration
npx sequelize-cli db:migrate

# 3. Verify database
psql postgresql://lms_user:123456@localhost:5432/lms_db -c "\d courses"
```

### Phase 4: Testing (Day 3)
```bash
# 1. Run unit tests
npm run test:models

# 2. Run integration tests
npm run test:integration

# 3. Manual testing
npm run dev
```

### Phase 5: Documentation & Review (Day 4-5)
```bash
# 1. Update API documentation
# 2. Update README
# 3. Code review
# 4. Merge to main branch
```

---

## ✅ SUCCESS CRITERIA

- [ ] All models updated with new fields
- [ ] Migration script executed successfully
- [ ] No TypeScript compilation errors
- [ ] All unit tests passing
- [ ] Database schema matches models
- [ ] API endpoints working correctly
- [ ] Documentation updated

---

## 🆘 TROUBLESHOOTING

### Issue 1: Migration fails
```bash
# Rollback migration
npx sequelize-cli db:migrate:undo

# Check database status
psql postgresql://lms_user:123456@localhost:5432/lms_db -c "\dt"
```

### Issue 2: TypeScript errors
```bash
# Clear build cache
rm -rf dist/
npm run build
```

### Issue 3: Sequelize sync issues
```typescript
// Force sync (ONLY in development with empty database)
await sequelize.sync({ force: true });
```

---

## 📚 REFERENCES

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md](./MODEL_DATABASE_CONFLICT_ANALYSIS_REPORT.md)
- [MODEL_IMPORTANCE_RANKING_REPORT.md](./MODEL_IMPORTANCE_RANKING_REPORT.md)

---

**Lưu ý**: File này cung cấp giải pháp chi tiết. Thực hiện từng bước một cách cẩn thận và test kỹ lưỡng trước khi deploy lên production.
