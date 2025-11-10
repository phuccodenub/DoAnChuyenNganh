# BÁO CÁO PHÂN TÍCH: TÁCH ROLE THÀNH CÁC BẢNG RIÊNG BIỆT

> **Ngày tạo:** 08/11/2025  
> **Dự án:** Learning Management System (LMS)  
> **Phiên bản:** 1.0.0

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống hiện tại](#1-tổng-quan-hệ-thống-hiện-tại)
2. [Phân tích yêu cầu thay đổi](#2-phân-tích-yêu-cầu-thay-đổi)
3. [Đánh giá ưu và nhược điểm](#3-đánh-giá-ưu-và-nhược-điểm)
4. [Phân tích tác động](#4-phân-tích-tác-động)
5. [Đề xuất giải pháp](#5-đề-xuất-giải-pháp)
6. [Lộ trình thực hiện](#6-lộ-trình-thực-hiện)
7. [Kết luận và khuyến nghị](#7-kết-luận-và-khuyến-nghị)

---

## 1. TỔNG QUAN HỆ THỐNG HIỆN TẠI

### 1.1. Công nghệ Stack

#### **Backend**
- **Runtime & Framework:** Node.js 18, TypeScript 5, Express 5
- **Database:** PostgreSQL 15 (driver: `pg`)
- **ORM:** Sequelize v6 với migrations
- **Cache:** Redis 7 (node-redis v5)
- **Authentication:** JWT (jsonwebtoken) với refresh token
- **Password:** BcryptJS
- **Validation:** Zod, express-validator, class-validator
- **Realtime:** Socket.IO (chat, quiz, WebRTC signaling)
- **Email:** Nodemailer (SMTP)
- **File Upload:** Multer (local storage)
- **Testing:** Jest + ts-jest
- **Logging:** Winston

#### **Frontend**
- React 18 + Vite 5, TypeScript
- Zustand (state), TanStack React Query
- Tailwind CSS
- Socket.IO Client

#### **Infrastructure**
- Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- Nginx (production frontend)

### 1.2. Mô hình User hiện tại

#### **Bảng `users`**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  
  -- Thông tin cơ bản
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  avatar VARCHAR(500),
  
  -- ROLE & STATUS (Hiện tại)
  role ENUM('student', 'instructor', 'admin', 'super_admin') DEFAULT 'student',
  status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
  
  -- Email verification
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  
  -- Security
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes JSON,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  lockout_until TIMESTAMP,
  token_version INTEGER DEFAULT 1,
  
  -- Social login
  social_id VARCHAR(255) UNIQUE,
  social_provider VARCHAR(50),
  
  -- Metadata
  preferences JSON,
  metadata JSON,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Enum Roles hiện tại**

```typescript
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

### 1.3. Quan hệ với các bảng khác

#### **1.3.1. Courses (Instructor)**
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- ... các trường khác
);
```

- **Quan hệ:** `User (instructor) 1 ---< Course`
- **Ý nghĩa:** Một instructor có thể tạo nhiều khóa học
- **Phân quyền:** Chỉ user có `role = 'instructor'` hoặc `'admin'` mới được tạo course

#### **1.3.2. Enrollments (Student)**
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  -- ... các trường khác
);
```

- **Quan hệ:** `User (student) >---< Course (through Enrollment)`
- **Ý nghĩa:** Student đăng ký và theo dõi tiến độ học tập
- **Phân quyền:** Tất cả user (chủ yếu student) có thể enroll

#### **1.3.3. Notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  -- ... các trường khác
);

CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id),
  recipient_id UUID REFERENCES users(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  -- ... các trường khác
);
```

- **Quan hệ:** 
  - `User (sender) 1 ---< Notification`
  - `User (recipient) >---< Notification (through NotificationRecipient)`
- **Phân quyền hiện tại:**
  - Admin & Instructor: Có thể tạo/gửi thông báo
  - Student: Chỉ nhận và đọc thông báo
  - **Lưu ý:** Hiện tại phân quyền dựa vào `role` trong bảng `users`

#### **1.3.4. Các bảng khác**
- **Assignments:** `instructor_id` (creator) references `users(id)`
- **Quiz:** `created_by` references `users(id)`
- **Grades:** `graded_by` references `users(id)` (instructor)
- **LiveSessions:** `instructor_id` references `users(id)`
- **ChatMessages:** `sender_id` references `users(id)`
- **LessonMaterials:** `uploaded_by` references `users(id)`

### 1.4. Cơ chế Authentication & Authorization hiện tại

#### **Authentication Middleware**
```typescript
// backend/src/middlewares/auth.middleware.ts
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7); // Remove 'Bearer '
  const decoded = tokenUtils.jwt.verifyAccessToken(token);
  req.user = decoded; // { id, email, role, ... }
  next();
};
```

#### **Authorization Middleware**
```typescript
export const authorizeRoles = (roles: string | string[]) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

#### **Ví dụ sử dụng**
```typescript
// Chỉ instructor và admin
router.post('/courses', 
  authMiddleware, 
  authorizeRoles(['instructor', 'admin']), 
  courseController.create
);

// Chỉ admin
router.delete('/users/:id', 
  authMiddleware, 
  authorizeRoles('admin'), 
  userController.delete
);
```

---

## 2. PHÂN TÍCH YÊU CẦU THAY ĐỔI

### 2.1. Mục tiêu

Tách trường `role` trong bảng `users` thành **3 bảng riêng biệt**:

| Role hiện tại | Bảng mới | Mô tả |
|--------------|----------|-------|
| `student` | `students` | Người học, chỉ xem và nhận thông báo |
| `instructor` | `instructors` | Giảng viên, CRUD thông báo & quản lý khóa học |
| `admin` | `admins` | Quản trị hệ thống, toàn quyền |

### 2.2. Thiết kế đề xuất

#### **Bảng `users` (sau khi refactor)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  
  -- Thông tin cơ bản (giữ nguyên)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  avatar VARCHAR(500),
  
  -- XÓA: role ENUM (không còn)
  -- GIỮ: status (vẫn cần cho account status)
  status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
  
  -- Email verification, security, social login (giữ nguyên)
  email_verified BOOLEAN DEFAULT false,
  -- ... (các trường security khác)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Bảng `students`**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Thông tin đặc thù của student
  student_code VARCHAR(50) UNIQUE, -- Mã sinh viên
  enrollment_date DATE DEFAULT CURRENT_DATE,
  grade_level VARCHAR(50), -- Lớp/khối (nếu có)
  major VARCHAR(100), -- Chuyên ngành
  
  -- Thống kê học tập
  total_courses_enrolled INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  total_certificates INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  
  -- Metadata
  learning_preferences JSON, -- Sở thích học tập
  metadata JSON,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_code ON students(student_code);
```

#### **Bảng `instructors`**
```sql
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Thông tin đặc thù của instructor
  instructor_code VARCHAR(50) UNIQUE, -- Mã giảng viên
  title VARCHAR(100), -- Học vị: PhD, MSc, etc.
  department VARCHAR(100), -- Khoa/Bộ môn
  specialization TEXT, -- Chuyên môn
  bio_extended TEXT, -- Tiểu sử chi tiết
  
  -- Thống kê giảng dạy
  total_courses_created INTEGER DEFAULT 0,
  total_students_taught INTEGER DEFAULT 0,
  average_course_rating DECIMAL(3,2) DEFAULT 0.00,
  years_of_experience INTEGER DEFAULT 0,
  
  -- Trạng thái
  is_verified BOOLEAN DEFAULT false, -- Đã xác minh chuyên môn
  verified_at TIMESTAMP,
  is_featured BOOLEAN DEFAULT false, -- Giảng viên nổi bật
  
  -- Metadata
  social_links JSON, -- LinkedIn, Twitter, etc.
  certifications JSON, -- Chứng chỉ
  achievements JSON, -- Thành tích
  metadata JSON,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instructors_user_id ON instructors(user_id);
CREATE INDEX idx_instructors_instructor_code ON instructors(instructor_code);
CREATE INDEX idx_instructors_is_verified ON instructors(is_verified);
CREATE INDEX idx_instructors_is_featured ON instructors(is_featured);
```

#### **Bảng `admins`**
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Thông tin đặc thù của admin
  admin_code VARCHAR(50) UNIQUE, -- Mã quản trị viên
  admin_level ENUM('admin', 'super_admin') DEFAULT 'admin',
  department VARCHAR(100), -- Phòng ban phụ trách
  
  -- Quyền hạn
  permissions JSON, -- Chi tiết quyền: { users: ['read', 'write'], courses: ['read'] }
  access_level INTEGER DEFAULT 1, -- 1: Admin thường, 2: Super Admin
  
  -- Thống kê
  last_action_at TIMESTAMP,
  total_actions INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT, -- Ghi chú nội bộ
  metadata JSON,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_admin_code ON admins(admin_code);
CREATE INDEX idx_admins_admin_level ON admins(admin_level);
```

### 2.3. Thay đổi quan hệ

#### **2.3.1. Courses → Instructors**
```sql
-- CŨ:
ALTER TABLE courses 
  ADD CONSTRAINT fk_courses_instructor 
  FOREIGN KEY (instructor_id) REFERENCES users(id);

-- MỚI (Option 1 - Giữ nguyên, vẫn reference users):
-- Giữ nguyên như cũ, kiểm tra trong application layer

-- MỚI (Option 2 - Reference instructors):
ALTER TABLE courses DROP CONSTRAINT fk_courses_instructor;
ALTER TABLE courses RENAME COLUMN instructor_id TO instructor_table_id;
ALTER TABLE courses 
  ADD CONSTRAINT fk_courses_instructor 
  FOREIGN KEY (instructor_table_id) REFERENCES instructors(id);
```

**⚠️ Lưu ý:** Option 1 được khuyến nghị vì:
- Giữ nguyên cấu trúc database
- Dễ migration
- Linh hoạt hơn (user có thể có nhiều role)

#### **2.3.2. Notifications**
```sql
-- sender_id vẫn references users(id)
-- Kiểm tra quyền tạo notification trong application layer
-- Dựa vào việc user có record trong instructors hoặc admins
```

---

## 3. ĐÁNH GIÁ ƯU VÀ NHƯỢC ĐIỂM

### 3.1. ƯU ĐIỂM ✅

#### **3.1.1. Tổ chức dữ liệu rõ ràng hơn**
- **Separation of Concerns:** Mỗi role có bảng riêng với các trường đặc thù
- **Dễ mở rộng:** Thêm trường cho instructor (certifications, specialization) mà không ảnh hưởng student
- **Giảm NULL values:** Không cần lưu trường `instructor_code` NULL cho student

**Ví dụ:**
```typescript
// Hiện tại (BAD):
interface User {
  id: string;
  role: 'student' | 'instructor' | 'admin';
  student_code?: string; // NULL nếu không phải student
  instructor_code?: string; // NULL nếu không phải instructor
  specialization?: string; // NULL nếu không phải instructor
  // ... nhiều trường có thể NULL
}

// Sau khi tách (GOOD):
interface User {
  id: string;
  email: string;
  // ... chỉ thông tin account
}

interface Student {
  id: string;
  user_id: string;
  student_code: string; // KHÔNG NULL
  enrollment_date: Date;
}

interface Instructor {
  id: string;
  user_id: string;
  instructor_code: string; // KHÔNG NULL
  specialization: string;
  certifications: Certificate[];
}
```

#### **3.1.2. Tính linh hoạt cao**
- **Multi-role support:** Một user có thể vừa là student vừa là instructor
  ```sql
  -- User A vừa học vừa dạy
  INSERT INTO students (user_id, ...) VALUES ('user-a-id', ...);
  INSERT INTO instructors (user_id, ...) VALUES ('user-a-id', ...);
  ```
- **Role transition dễ dàng:** Student muốn trở thành instructor chỉ cần thêm record vào `instructors`

#### **3.1.3. Bảo mật tốt hơn**
- **Phân quyền chi tiết:** Admin có thể có `permissions` JSON với quyền cụ thể
- **Audit trail:** Dễ theo dõi hành động của từng role
- **Isolation:** Dữ liệu nhạy cảm của instructor không lộ cho student

#### **3.1.4. Performance**
- **Selective queries:** Query chỉ student không cần load thông tin instructor
  ```sql
  -- CŨ: Load toàn bộ users (bao gồm cả instructor fields NULL)
  SELECT * FROM users WHERE role = 'student';
  
  -- MỚI: Chỉ load students và join users khi cần
  SELECT s.*, u.email, u.first_name 
  FROM students s 
  JOIN users u ON s.user_id = u.id;
  ```
- **Indexing hiệu quả:** Index riêng cho từng role table

#### **3.1.5. Tuân thủ nguyên tắc thiết kế**
- **Single Responsibility Principle (SRP):** Mỗi bảng có trách nhiệm riêng
- **Open/Closed Principle:** Dễ mở rộng role mới (thêm bảng `moderators`) mà không sửa code cũ
- **Database Normalization:** Giảm redundancy

### 3.2. NHƯỢC ĐIỂM ❌

#### **3.2.1. Độ phức tạp tăng**
- **JOIN queries nhiều hơn:**
  ```sql
  -- CŨ: 1 query
  SELECT * FROM users WHERE id = 'xxx';
  
  -- MỚI: 2-3 queries hoặc JOIN
  SELECT u.*, s.student_code, s.major
  FROM users u
  LEFT JOIN students s ON u.id = s.user_id
  WHERE u.id = 'xxx';
  ```
- **Application logic phức tạp:** Phải check user thuộc role nào
  ```typescript
  // Phải check nhiều bảng
  const isInstructor = await Instructor.findOne({ where: { user_id } });
  const isAdmin = await Admin.findOne({ where: { user_id } });
  ```

#### **3.2.2. Migration khó khăn**
- **Data migration:** Phải di chuyển dữ liệu từ `users.role` sang 3 bảng mới
- **Foreign key updates:** Nếu chọn Option 2 (courses reference instructors), phải update toàn bộ
- **Downtime risk:** Migration có thể mất nhiều thời gian với database lớn
- **Rollback phức tạp:** Khó quay lại mô hình cũ nếu có vấn đề

#### **3.2.3. Code refactor lớn**
- **ORM Models:** Phải tạo 3 models mới (Student, Instructor, Admin)
- **Associations:** Cập nhật tất cả quan hệ
- **Services/Repositories:** Refactor logic check role
- **Middleware:** Thay đổi `authorizeRoles` middleware
- **Frontend:** Cập nhật API calls và state management

**Ước tính:**
- **Backend files cần sửa:** ~50-70 files
- **Frontend files cần sửa:** ~30-40 files
- **Test cases:** ~100+ test cases cần update

#### **3.2.4. Performance overhead (trong một số trường hợp)**
- **Multiple queries:** Nếu không optimize, có thể tạo N+1 query problem
  ```typescript
  // BAD: N+1 queries
  const users = await User.findAll();
  for (const user of users) {
    const student = await Student.findOne({ where: { user_id: user.id } });
    // ...
  }
  
  // GOOD: Eager loading
  const users = await User.findAll({
    include: [{ model: Student }, { model: Instructor }]
  });
  ```

#### **3.2.5. Rủi ro khi triển khai**
- **Data inconsistency:** Nếu migration fail giữa chừng
- **Application downtime:** Cần maintenance window
- **Bug potential:** Logic phức tạp hơn → nhiều edge cases hơn

---

## 4. PHÂN TÍCH TÁC ĐỘNG

### 4.1. Tác động đến Database

#### **4.1.1. Schema changes**
| Thay đổi | Mức độ tác động | Thời gian ước tính |
|----------|----------------|-------------------|
| Tạo 3 bảng mới (students, instructors, admins) | Trung bình | 2-3 giờ |
| Migration dữ liệu từ users.role | Cao | 4-6 giờ |
| Cập nhật indexes | Thấp | 1 giờ |
| Test data integrity | Cao | 3-4 giờ |
| **TỔNG** | **Cao** | **10-14 giờ** |

#### **4.1.2. Data migration script**
```sql
-- Step 1: Tạo bảng mới (đã có ở section 2.2)

-- Step 2: Migrate students
INSERT INTO students (user_id, student_code, enrollment_date, metadata)
SELECT 
  id,
  CONCAT('STU-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  created_at,
  metadata
FROM users
WHERE role = 'student';

-- Step 3: Migrate instructors
INSERT INTO instructors (user_id, instructor_code, bio_extended, metadata)
SELECT 
  id,
  CONCAT('INS-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  bio,
  metadata
FROM users
WHERE role IN ('instructor', 'super_admin'); -- super_admin cũng có thể là instructor

-- Step 4: Migrate admins
INSERT INTO admins (user_id, admin_code, admin_level, metadata)
SELECT 
  id,
  CONCAT('ADM-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  CASE 
    WHEN role = 'super_admin' THEN 'super_admin'
    ELSE 'admin'
  END,
  metadata
FROM users
WHERE role IN ('admin', 'super_admin');

-- Step 5: Verify
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'student') as old_students,
  (SELECT COUNT(*) FROM students) as new_students,
  (SELECT COUNT(*) FROM users WHERE role = 'instructor') as old_instructors,
  (SELECT COUNT(*) FROM instructors) as new_instructors,
  (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'super_admin')) as old_admins,
  (SELECT COUNT(*) FROM admins) as new_admins;

-- Step 6: Drop role column (SAU KHI ĐÃ TEST KỸ)
-- ALTER TABLE users DROP COLUMN role; -- CHƯA CHẠY NGAY
```

### 4.2. Tác động đến Backend Code

#### **4.2.1. Models (Sequelize)**

**File mới cần tạo:**
1. `backend/src/models/student.model.ts`
2. `backend/src/models/instructor.model.ts`
3. `backend/src/models/admin.model.ts`

**Ví dụ Student Model:**
```typescript
// backend/src/models/student.model.ts
import { DataTypes } from 'sequelize';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  student_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  total_courses_enrolled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_courses_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  }
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true,
});

export default exportModel(Student);
```

**Associations cần update:**
```typescript
// backend/src/models/associations.ts

// User 1 ---< Student
User.hasOne(Student, {
  foreignKey: 'user_id',
  as: 'studentProfile'
});
Student.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User 1 ---< Instructor
User.hasOne(Instructor, {
  foreignKey: 'user_id',
  as: 'instructorProfile'
});
Instructor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User 1 ---< Admin
User.hasOne(Admin, {
  foreignKey: 'user_id',
  as: 'adminProfile'
});
Admin.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Course vẫn reference User (không thay đổi)
// Nhưng thêm check trong application layer
```

#### **4.2.2. Middleware thay đổi**

**File:** `backend/src/middlewares/auth.middleware.ts`

```typescript
// CŨ:
export const authorizeRoles = (roles: string | string[]) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// MỚI:
import Student from '../models/student.model';
import Instructor from '../models/instructor.model';
import Admin from '../models/admin.model';

export const authorizeRoles = (roles: string | string[]) => {
  return async (req, res, next) => {
    try {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const userId = req.user.id;
      
      // Check user roles
      const userRoles: string[] = [];
      
      if (allowedRoles.includes('student')) {
        const student = await Student.findOne({ where: { user_id: userId } });
        if (student) userRoles.push('student');
      }
      
      if (allowedRoles.includes('instructor')) {
        const instructor = await Instructor.findOne({ where: { user_id: userId } });
        if (instructor) userRoles.push('instructor');
      }
      
      if (allowedRoles.includes('admin') || allowedRoles.includes('super_admin')) {
        const admin = await Admin.findOne({ where: { user_id: userId } });
        if (admin) {
          userRoles.push('admin');
          if (admin.admin_level === 'super_admin') {
            userRoles.push('super_admin');
          }
        }
      }
      
      // Check if user has any allowed role
      const hasPermission = userRoles.some(role => allowedRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Attach roles to request for further use
      req.user.roles = userRoles;
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Helper function để lấy roles của user
export const getUserRoles = async (userId: string): Promise<string[]> => {
  const roles: string[] = [];
  
  const [student, instructor, admin] = await Promise.all([
    Student.findOne({ where: { user_id: userId } }),
    Instructor.findOne({ where: { user_id: userId } }),
    Admin.findOne({ where: { user_id: userId } })
  ]);
  
  if (student) roles.push('student');
  if (instructor) roles.push('instructor');
  if (admin) {
    roles.push('admin');
    if (admin.admin_level === 'super_admin') {
      roles.push('super_admin');
    }
  }
  
  return roles;
};
```

**⚠️ Performance Issue:** Mỗi request cần 1-3 queries để check role!

**Giải pháp:** Cache roles trong JWT token hoặc Redis

```typescript
// Cải thiện: Cache roles trong JWT
interface JWTPayload {
  id: string;
  email: string;
  roles: string[]; // ['student', 'instructor']
}

// Khi login, load roles và lưu vào token
const roles = await getUserRoles(user.id);
const token = jwt.sign({ id: user.id, email: user.email, roles }, SECRET);

// Middleware đơn giản hơn
export const authorizeRoles = (roles: string | string[]) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRoles = req.user.roles || [];
    
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};
```

#### **4.2.3. Services cần refactor**

**Ví dụ: CourseService**
```typescript
// backend/src/modules/course/course.service.ts

// CŨ:
async createCourse(courseData: CreateCourseData): Promise<CourseInstance> {
  // Validate instructor exists
  const instructor = await User.findOne({ 
    where: { id: courseData.instructor_id, role: 'instructor' } 
  });
  if (!instructor) {
    throw new ApiError(404, 'Instructor not found');
  }
  // ...
}

// MỚI:
async createCourse(courseData: CreateCourseData): Promise<CourseInstance> {
  // Validate user exists and is an instructor
  const user = await User.findByPk(courseData.instructor_id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const instructor = await Instructor.findOne({ 
    where: { user_id: courseData.instructor_id } 
  });
  if (!instructor) {
    throw new ApiError(403, 'User is not an instructor');
  }
  
  // Create course
  const course = await Course.create(courseData);
  
  // Update instructor stats
  await instructor.increment('total_courses_created');
  
  return course;
}
```

**Ví dụ: NotificationService**
```typescript
// backend/src/modules/notifications/notifications.service.ts

// MỚI: Check quyền tạo notification
async create(senderId: string, dto: CreateNotificationDto) {
  // Check if sender is instructor or admin
  const [instructor, admin] = await Promise.all([
    Instructor.findOne({ where: { user_id: senderId } }),
    Admin.findOne({ where: { user_id: senderId } })
  ]);
  
  if (!instructor && !admin) {
    throw new ApiError(403, 'Only instructors and admins can create notifications');
  }
  
  // Create notification...
}
```

#### **4.2.4. Auth Service**

```typescript
// backend/src/modules/auth/auth.service.ts

// Thêm vào register
async register(dto: RegisterDto) {
  // Create user
  const user = await User.create({
    email: dto.email,
    password: hashedPassword,
    // ... other fields
  });
  
  // Create student profile by default
  await Student.create({
    user_id: user.id,
    student_code: generateStudentCode(),
    enrollment_date: new Date(),
  });
  
  return user;
}

// Update login để load roles
async login(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  // ... validate password
  
  // Load roles
  const roles = await getUserRoles(user.id);
  
  // Generate token with roles
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, roles },
    JWT_SECRET
  );
  
  return { user, accessToken, roles };
}
```

### 4.3. Tác động đến Frontend

#### **4.3.1. API Response changes**

**CŨ:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "instructor",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**MỚI:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["instructor", "student"],
    "instructorProfile": {
      "id": "uuid",
      "instructor_code": "INS-000001",
      "specialization": "Web Development",
      "total_courses_created": 5
    },
    "studentProfile": {
      "id": "uuid",
      "student_code": "STU-000123",
      "total_courses_enrolled": 10
    }
  }
}
```

#### **4.3.2. State management updates**

```typescript
// frontend/src/stores/authStore.ts

// CŨ:
interface AuthState {
  user: {
    id: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
  } | null;
}

// MỚI:
interface AuthState {
  user: {
    id: string;
    email: string;
    roles: string[];
    instructorProfile?: InstructorProfile;
    studentProfile?: StudentProfile;
    adminProfile?: AdminProfile;
  } | null;
}

// Helper functions
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isStudent: () => get().user?.roles.includes('student') ?? false,
  isInstructor: () => get().user?.roles.includes('instructor') ?? false,
  isAdmin: () => get().user?.roles.includes('admin') ?? false,
}));
```

#### **4.3.3. Component updates**

```typescript
// CŨ:
const DashboardPage = () => {
  const { user } = useAuthStore();
  
  if (user.role === 'instructor') {
    return <InstructorDashboard />;
  } else if (user.role === 'student') {
    return <StudentDashboard />;
  }
};

// MỚI:
const DashboardPage = () => {
  const { user } = useAuthStore();
  
  // User có thể có nhiều roles
  const isInstructor = user?.roles.includes('instructor');
  const isStudent = user?.roles.includes('student');
  
  return (
    <div>
      {isInstructor && <InstructorDashboard profile={user.instructorProfile} />}
      {isStudent && <StudentDashboard profile={user.studentProfile} />}
    </div>
  );
};
```

### 4.4. Tác động đến Testing

#### **4.4.1. Test data setup**
```typescript
// tests/helpers/test-data.ts

// CŨ:
const createTestUser = async (role: string) => {
  return await User.create({
    email: `test-${role}@example.com`,
    password: 'password',
    role: role,
  });
};

// MỚI:
const createTestStudent = async () => {
  const user = await User.create({
    email: 'test-student@example.com',
    password: 'password',
  });
  
  const student = await Student.create({
    user_id: user.id,
    student_code: 'TEST-STU-001',
  });
  
  return { user, student };
};

const createTestInstructor = async () => {
  const user = await User.create({
    email: 'test-instructor@example.com',
    password: 'password',
  });
  
  const instructor = await Instructor.create({
    user_id: user.id,
    instructor_code: 'TEST-INS-001',
  });
  
  return { user, instructor };
};
```

#### **4.4.2. Test cases cần update**
- **Auth tests:** ~20 test cases
- **Course tests:** ~30 test cases
- **Notification tests:** ~15 test cases
- **User management tests:** ~25 test cases
- **Integration tests:** ~40 test cases
- **E2E tests:** ~30 test cases

**Tổng:** ~160 test cases cần update

---

## 5. ĐỀ XUẤT GIẢI PHÁP

### 5.1. Đánh giá tổng quan

Sau khi phân tích chi tiết, tôi đề xuất **KHÔNG NÊN** thực hiện refactor này trong thời điểm hiện tại, vì:

1. **Chi phí > Lợi ích:** 
   - Thời gian refactor: 3-4 tuần (1 developer full-time)
   - Risk cao: Data migration, downtime, bugs
   - Lợi ích: Chủ yếu là tổ chức code tốt hơn, không có business value trực tiếp

2. **Hệ thống hiện tại hoạt động tốt:**
   - Role-based authorization đang hoạt động ổn định
   - Chưa có yêu cầu business cụ thể cần multi-role
   - Performance chưa có vấn đề

3. **Có giải pháp thay thế tốt hơn:** (xem section 5.2)

### 5.2. Giải pháp thay thế (Khuyến nghị) ⭐

#### **Option A: Hybrid Approach - Giữ role + Thêm profile tables**

**Ý tưởng:** Giữ nguyên `users.role` nhưng thêm các bảng profile riêng

```sql
-- Giữ nguyên
ALTER TABLE users ADD COLUMN role ENUM(...); -- Giữ nguyên

-- Thêm bảng profile (optional)
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  student_code VARCHAR(50),
  major VARCHAR(100),
  -- ... các trường đặc thù
);

CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  instructor_code VARCHAR(50),
  specialization TEXT,
  certifications JSON,
  -- ... các trường đặc thù
);
```

**Ưu điểm:**
- ✅ Giữ nguyên logic authorization (đơn giản)
- ✅ Vẫn có thể lưu thông tin đặc thù của từng role
- ✅ Migration dễ dàng (chỉ thêm bảng, không xóa gì)
- ✅ Backward compatible
- ✅ Performance tốt (không cần JOIN để check role)

**Nhược điểm:**
- ❌ Vẫn có `role` enum (không linh hoạt cho multi-role)
- ❌ Vẫn có một số NULL values trong profile tables

**Khi nào dùng:** 
- Hệ thống hiện tại chưa cần multi-role
- Muốn thêm thông tin đặc thù cho từng role
- Ưu tiên stability > flexibility

#### **Option B: Role-based Permissions Table**

**Ý tưởng:** Thay vì tách role, tạo bảng permissions linh hoạt

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) NOT NULL, -- 'student', 'instructor', 'admin'
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, role)
);

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL, -- 'courses', 'notifications', 'users'
  action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete'
  
  UNIQUE(role, resource, action)
);
```

**Ưu điểm:**
- ✅ Multi-role support
- ✅ Linh hoạt cao (có thể grant/revoke roles)
- ✅ Fine-grained permissions
- ✅ Audit trail (granted_by, granted_at)

**Nhược điểm:**
- ❌ Phức tạp hơn nhiều
- ❌ Performance overhead (nhiều JOIN)

**Khi nào dùng:**
- Cần hệ thống phân quyền phức tạp (RBAC)
- Có yêu cầu audit và compliance
- Dự án lớn, nhiều roles và permissions

#### **Option C: Keep Current + Add Metadata**

**Ý tưởng:** Giữ nguyên 100%, chỉ thêm metadata JSON

```sql
-- Giữ nguyên users.role
-- Thêm vào users.metadata:
{
  "student": {
    "student_code": "STU-000001",
    "major": "Computer Science",
    "enrollment_date": "2024-01-01"
  },
  "instructor": {
    "instructor_code": "INS-000001",
    "specialization": "Web Development",
    "certifications": [...]
  }
}
```

**Ưu điểm:**
- ✅ Không cần migration
- ✅ Linh hoạt (JSON có thể chứa bất kỳ data gì)
- ✅ Zero downtime

**Nhược điểm:**
- ❌ Khó query (JSON không index tốt)
- ❌ Không có type safety
- ❌ Khó validate

**Khi nào dùng:**
- Prototype nhanh
- Dữ liệu không cần query phức tạp
- Tạm thời trước khi refactor lớn

### 5.3. Đề xuất cuối cùng 🎯

**Khuyến nghị: Option A - Hybrid Approach**

**Lý do:**
1. **Balance tốt nhất** giữa simplicity và flexibility
2. **Low risk:** Không phá vỡ code hiện tại
3. **Incremental migration:** Có thể thêm dần profile tables
4. **Performance tốt:** Không cần JOIN để check role
5. **Dễ maintain:** Team dễ hiểu và phát triển

**Implementation plan:**
1. **Phase 1 (Tuần 1-2):** Tạo profile tables
2. **Phase 2 (Tuần 3):** Migrate data sang profile tables
3. **Phase 3 (Tuần 4):** Update services để sử dụng profiles
4. **Phase 4 (Tuần 5):** Testing và rollout

---

## 6. LỘ TRÌNH THỰC HIỆN

### 6.1. Nếu chọn Option A (Hybrid - Khuyến nghị)

#### **Phase 1: Preparation (Tuần 1)**

**1.1. Design & Planning**
- [ ] Finalize database schema cho profile tables
- [ ] Design API contracts (request/response)
- [ ] Create migration scripts
- [ ] Setup feature flag (để rollback nếu cần)

**1.2. Create Profile Tables**
```sql
-- Migration: 017-create-profile-tables.ts
CREATE TABLE student_profiles (...);
CREATE TABLE instructor_profiles (...);
CREATE TABLE admin_profiles (...);
```

**1.3. Create Models**
- [ ] `backend/src/models/student-profile.model.ts`
- [ ] `backend/src/models/instructor-profile.model.ts`
- [ ] `backend/src/models/admin-profile.model.ts`
- [ ] Update `backend/src/models/associations.ts`

#### **Phase 2: Data Migration (Tuần 2)**

**2.1. Write Migration Script**
```typescript
// backend/src/scripts/migrate-user-profiles.ts
async function migrateProfiles() {
  // Migrate students
  const students = await User.findAll({ where: { role: 'student' } });
  for (const user of students) {
    await StudentProfile.create({
      user_id: user.id,
      student_code: generateStudentCode(),
      enrollment_date: user.created_at,
    });
  }
  
  // Migrate instructors
  // Migrate admins
  
  console.log('Migration completed');
}
```

**2.2. Test Migration**
- [ ] Test trên local database
- [ ] Test trên staging database
- [ ] Verify data integrity
- [ ] Measure migration time

**2.3. Rollback Plan**
```sql
-- Rollback script
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS instructor_profiles CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
```

#### **Phase 3: Backend Refactor (Tuần 3-4)**

**3.1. Update Services**
- [ ] `auth.service.ts` - Load profiles khi login
- [ ] `user.service.ts` - CRUD operations cho profiles
- [ ] `course.service.ts` - Use instructor profile
- [ ] `notification.service.ts` - Check permissions

**3.2. Update Controllers**
- [ ] `auth.controller.ts` - Return profiles trong response
- [ ] `user.controller.ts` - Endpoints cho profile management

**3.3. Update Middleware**
- [ ] Giữ nguyên `authorizeRoles` (vì vẫn dùng `users.role`)
- [ ] Thêm helper functions để load profiles

**3.4. Add API Endpoints**
```typescript
// GET /api/v1/users/me/profile
// PUT /api/v1/users/me/profile
// GET /api/v1/instructors/:id/profile
```

#### **Phase 4: Frontend Update (Tuần 5)**

**4.1. Update Types**
```typescript
// frontend/src/types/user.types.ts
interface User {
  id: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  studentProfile?: StudentProfile;
  instructorProfile?: InstructorProfile;
  adminProfile?: AdminProfile;
}
```

**4.2. Update API Calls**
- [ ] Update `authApi.ts` để fetch profiles
- [ ] Update `userApi.ts` cho profile CRUD

**4.3. Update Components**
- [ ] Profile pages
- [ ] Dashboard components
- [ ] Settings pages

#### **Phase 5: Testing (Tuần 6)**

**5.1. Unit Tests**
- [ ] Model tests
- [ ] Service tests
- [ ] Controller tests

**5.2. Integration Tests**
- [ ] API endpoint tests
- [ ] Database transaction tests

**5.3. E2E Tests**
- [ ] User registration flow
- [ ] Profile update flow
- [ ] Role-based access tests

**5.4. Performance Tests**
- [ ] Load testing
- [ ] Query performance
- [ ] Memory usage

#### **Phase 6: Deployment (Tuần 7)**

**6.1. Staging Deployment**
- [ ] Deploy to staging
- [ ] Run migration script
- [ ] Smoke tests
- [ ] UAT (User Acceptance Testing)

**6.2. Production Deployment**
- [ ] Schedule maintenance window (2-3 giờ)
- [ ] Backup database
- [ ] Deploy backend
- [ ] Run migration script
- [ ] Verify data
- [ ] Deploy frontend
- [ ] Monitor logs và metrics

**6.3. Post-Deployment**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs (nếu có)

### 6.2. Nếu chọn Full Refactor (Tách role hoàn toàn)

**Thời gian ước tính: 8-10 tuần**

#### **Phase 1-2: Giống Option A** (Tuần 1-2)

#### **Phase 3: Refactor Authorization (Tuần 3-4)**
- [ ] Rewrite `authorizeRoles` middleware
- [ ] Implement role caching (JWT hoặc Redis)
- [ ] Update all protected routes

#### **Phase 4: Refactor Services (Tuần 5-6)**
- [ ] Update all services sử dụng role checks
- [ ] Refactor course service
- [ ] Refactor notification service
- [ ] Refactor user service

#### **Phase 5: Database Migration (Tuần 7)**
- [ ] Migrate foreign keys (nếu cần)
- [ ] Drop `users.role` column
- [ ] Update indexes

#### **Phase 6-7: Testing & Deployment (Tuần 8-10)**
- [ ] Comprehensive testing
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring và bug fixes

### 6.3. Checklist tổng hợp

#### **Pre-Migration**
- [ ] Backup production database
- [ ] Setup rollback plan
- [ ] Communicate with team về downtime
- [ ] Prepare monitoring dashboard

#### **During Migration**
- [ ] Enable maintenance mode
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Run smoke tests
- [ ] Disable maintenance mode

#### **Post-Migration**
- [ ] Monitor error logs (24/7 trong 3 ngày đầu)
- [ ] Check performance metrics
- [ ] Verify user reports
- [ ] Document lessons learned

---

## 7. KẾT LUẬN VÀ KHUYẾN NGHỊ

### 7.1. Tóm tắt đánh giá

| Tiêu chí | Mô hình hiện tại | Option A (Hybrid) | Full Refactor |
|----------|-----------------|-------------------|---------------|
| **Độ phức tạp** | ⭐ Đơn giản | ⭐⭐ Trung bình | ⭐⭐⭐⭐⭐ Rất phức tạp |
| **Thời gian triển khai** | N/A | 5-7 tuần | 8-10 tuần |
| **Risk** | Thấp | Trung bình | Cao |
| **Flexibility** | ⭐⭐ Thấp | ⭐⭐⭐⭐ Tốt | ⭐⭐⭐⭐⭐ Rất tốt |
| **Performance** | ⭐⭐⭐⭐⭐ Tốt nhất | ⭐⭐⭐⭐ Tốt | ⭐⭐⭐ Trung bình |
| **Maintainability** | ⭐⭐⭐ OK | ⭐⭐⭐⭐ Tốt | ⭐⭐⭐ OK |
| **Cost** | $0 | $15,000-20,000 | $30,000-40,000 |

**Giả định:** 1 senior developer, $50/giờ, 40 giờ/tuần

### 7.2. Khuyến nghị cuối cùng 🎯

#### **Khuyến nghị 1: Giữ nguyên mô hình hiện tại (Ngắn hạn - 6 tháng)**

**Lý do:**
- Hệ thống đang hoạt động ổn định
- Chưa có business requirement cụ thể cần multi-role
- Team có thể focus vào features quan trọng hơn

**Điều kiện:**
- Nếu không có kế hoạch mở rộng phức tạp
- Nếu số lượng users < 10,000
- Nếu không có yêu cầu về compliance/audit

#### **Khuyến nghị 2: Implement Option A - Hybrid (Trung hạn - 1 năm)**

**Lý do:**
- Balance tốt giữa simplicity và flexibility
- Low risk, incremental migration
- Chuẩn bị tốt cho tương lai

**Điều kiện:**
- Khi có budget và resources
- Khi có yêu cầu lưu thông tin đặc thù cho từng role
- Khi cần improve user experience (instructor dashboard, student profile)

**Timeline đề xuất:**
- Q1 2026: Planning & Design
- Q2 2026: Implementation & Testing
- Q3 2026: Deployment & Monitoring

#### **Khuyến nghị 3: KHÔNG nên Full Refactor (trừ khi...)**

**Chỉ nên làm khi:**
- Có yêu cầu business rõ ràng về multi-role
- Có budget lớn (>$40,000)
- Có team size đủ lớn (3+ developers)
- Có thời gian dài (3+ tháng)
- Hệ thống hiện tại có vấn đề nghiêm trọng về scalability

### 7.3. Action Items

#### **Ngay lập tức:**
- [ ] Review báo cáo này với team
- [ ] Discuss với stakeholders về business requirements
- [ ] Quyết định approach (giữ nguyên / Option A / Full Refactor)

#### **Nếu chọn Option A:**
- [ ] Allocate resources (1 senior dev, 7 tuần)
- [ ] Schedule planning meeting
- [ ] Create detailed technical spec
- [ ] Setup project tracking (Jira/Trello)

#### **Nếu chọn giữ nguyên:**
- [ ] Document decision và lý do
- [ ] Schedule review lại sau 6 tháng
- [ ] Focus vào features khác

### 7.4. Rủi ro cần lưu ý

#### **Rủi ro kỹ thuật:**
1. **Data loss:** Luôn backup trước khi migrate
2. **Downtime:** Schedule maintenance window hợp lý
3. **Performance degradation:** Monitor metrics sau deploy
4. **Bugs:** Có rollback plan sẵn sàng

#### **Rủi ro business:**
1. **User experience:** Có thể gây confusion nếu UI thay đổi nhiều
2. **Training:** Team cần học cách làm việc với mô hình mới
3. **Timeline:** Có thể delay features khác

#### **Mitigation strategies:**
1. **Feature flags:** Có thể enable/disable features mới
2. **Gradual rollout:** Deploy từng phần, không deploy hết một lúc
3. **Comprehensive testing:** Đầu tư nhiều vào testing
4. **Communication:** Thông báo rõ ràng cho users về changes

---

## PHỤ LỤC

### A. SQL Scripts đầy đủ

#### **A.1. Create Profile Tables**
```sql
-- File: backend/src/migrations/017-create-profile-tables.ts

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  student_code VARCHAR(50) UNIQUE NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  grade_level VARCHAR(50),
  major VARCHAR(100),
  total_courses_enrolled INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  total_certificates INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  learning_preferences JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_student_code ON student_profiles(student_code);

CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  instructor_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100),
  department VARCHAR(100),
  specialization TEXT,
  bio_extended TEXT,
  total_courses_created INTEGER DEFAULT 0,
  total_students_taught INTEGER DEFAULT 0,
  average_course_rating DECIMAL(3,2) DEFAULT 0.00,
  years_of_experience INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  is_featured BOOLEAN DEFAULT false,
  social_links JSON,
  certifications JSON,
  achievements JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX idx_instructor_profiles_instructor_code ON instructor_profiles(instructor_code);
CREATE INDEX idx_instructor_profiles_is_verified ON instructor_profiles(is_verified);
CREATE INDEX idx_instructor_profiles_is_featured ON instructor_profiles(is_featured);

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  admin_code VARCHAR(50) UNIQUE NOT NULL,
  admin_level VARCHAR(20) DEFAULT 'admin' CHECK (admin_level IN ('admin', 'super_admin')),
  department VARCHAR(100),
  permissions JSON,
  access_level INTEGER DEFAULT 1,
  last_action_at TIMESTAMP,
  total_actions INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_admin_code ON admin_profiles(admin_code);
CREATE INDEX idx_admin_profiles_admin_level ON admin_profiles(admin_level);
```

#### **A.2. Data Migration Script**
```sql
-- Migrate students
INSERT INTO student_profiles (user_id, student_code, enrollment_date, metadata)
SELECT 
  id,
  CONCAT('STU-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  created_at::DATE,
  COALESCE(metadata, '{}'::JSON)
FROM users
WHERE role = 'student';

-- Migrate instructors
INSERT INTO instructor_profiles (user_id, instructor_code, bio_extended, metadata)
SELECT 
  id,
  CONCAT('INS-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  bio,
  COALESCE(metadata, '{}'::JSON)
FROM users
WHERE role IN ('instructor', 'super_admin');

-- Migrate admins
INSERT INTO admin_profiles (user_id, admin_code, admin_level, metadata)
SELECT 
  id,
  CONCAT('ADM-', LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')),
  CASE 
    WHEN role = 'super_admin' THEN 'super_admin'
    ELSE 'admin'
  END,
  COALESCE(metadata, '{}'::JSON)
FROM users
WHERE role IN ('admin', 'super_admin');

-- Verification
SELECT 
  'Students' as type,
  (SELECT COUNT(*) FROM users WHERE role = 'student') as users_count,
  (SELECT COUNT(*) FROM student_profiles) as profiles_count
UNION ALL
SELECT 
  'Instructors',
  (SELECT COUNT(*) FROM users WHERE role = 'instructor'),
  (SELECT COUNT(*) FROM instructor_profiles)
UNION ALL
SELECT 
  'Admins',
  (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'super_admin')),
  (SELECT COUNT(*) FROM admin_profiles);
```

### B. Code Examples

#### **B.1. Complete Middleware Example**
```typescript
// backend/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { tokenUtils } from '../utils/token.util';
import { JWTPayload } from '../config/jwt.config';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import logger from '../utils/logger.util';
import { redisClient } from '../config/redis.config';

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { roles?: string[] };
    }
  }
}

// Authentication middleware (giữ nguyên)
export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = tokenUtils.jwt.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
      success: false,
      message: RESPONSE_CONSTANTS.ERROR.TOKEN_INVALID,
    });
  }
};

// Authorization middleware (giữ nguyên - vì vẫn dùng users.role)
export const authorizeRoles = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Vẫn check req.user.role như cũ
    if (!allowedRoles.includes(req.user.role)) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.ACCESS_DENIED,
      });
      return;
    }

    next();
  };
};

// Helper function để load profiles (MỚI)
export const loadUserProfiles = async (userId: string) => {
  // Try cache first
  const cacheKey = `user:${userId}:profiles`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Load from database
  const [studentProfile, instructorProfile, adminProfile] = await Promise.all([
    StudentProfile.findOne({ where: { user_id: userId } }),
    InstructorProfile.findOne({ where: { user_id: userId } }),
    AdminProfile.findOne({ where: { user_id: userId } })
  ]);
  
  const profiles = {
    studentProfile: studentProfile?.toJSON(),
    instructorProfile: instructorProfile?.toJSON(),
    adminProfile: adminProfile?.toJSON(),
  };
  
  // Cache for 5 minutes
  await redisClient.setEx(cacheKey, 300, JSON.stringify(profiles));
  
  return profiles;
};
```

#### **B.2. Complete Service Example**
```typescript
// backend/src/modules/user/user.service.ts

import User from '../../models/user.model';
import StudentProfile from '../../models/student-profile.model';
import InstructorProfile from '../../models/instructor-profile.model';
import AdminProfile from '../../models/admin-profile.model';
import { ApiError } from '../../middlewares/error.middleware';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';

export class UserService {
  /**
   * Get user with profiles
   */
  async getUserById(userId: string) {
    const user = await User.findByPk(userId, {
      include: [
        { model: StudentProfile, as: 'studentProfile' },
        { model: InstructorProfile, as: 'instructorProfile' },
        { model: AdminProfile, as: 'adminProfile' }
      ]
    });
    
    if (!user) {
      throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
    }
    
    return user;
  }
  
  /**
   * Update student profile
   */
  async updateStudentProfile(userId: string, data: Partial<StudentProfileAttributes>) {
    // Verify user is a student
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'student') {
      throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'User is not a student');
    }
    
    // Update or create profile
    const [profile, created] = await StudentProfile.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        student_code: this.generateStudentCode(),
        ...data
      }
    });
    
    if (!created) {
      await profile.update(data);
    }
    
    return profile;
  }
  
  /**
   * Update instructor profile
   */
  async updateInstructorProfile(userId: string, data: Partial<InstructorProfileAttributes>) {
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'instructor') {
      throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'User is not an instructor');
    }
    
    const [profile, created] = await InstructorProfile.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        instructor_code: this.generateInstructorCode(),
        ...data
      }
    });
    
    if (!created) {
      await profile.update(data);
    }
    
    return profile;
  }
  
  /**
   * Generate student code
   */
  private generateStudentCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STU-${timestamp}-${random}`;
  }
  
  /**
   * Generate instructor code
   */
  private generateInstructorCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INS-${timestamp}-${random}`;
  }
}
```

### C. Testing Examples

#### **C.1. Unit Test Example**
```typescript
// backend/src/modules/user/user.service.test.ts

import { UserService } from './user.service';
import User from '../../models/user.model';
import StudentProfile from '../../models/student-profile.model';

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  describe('getUserById', () => {
    it('should return user with profiles', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'student',
        studentProfile: {
          student_code: 'STU-000001',
          major: 'Computer Science'
        }
      };
      
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);
      
      const result = await userService.getUserById('user-1');
      
      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith('user-1', {
        include: expect.arrayContaining([
          expect.objectContaining({ model: StudentProfile })
        ])
      });
    });
    
    it('should throw error if user not found', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue(null);
      
      await expect(userService.getUserById('invalid-id'))
        .rejects.toThrow('User not found');
    });
  });
  
  describe('updateStudentProfile', () => {
    it('should update student profile', async () => {
      const mockUser = { id: 'user-1', role: 'student' };
      const mockProfile = { 
        user_id: 'user-1', 
        student_code: 'STU-000001',
        update: jest.fn().mockResolvedValue(true)
      };
      
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(StudentProfile, 'findOrCreate').mockResolvedValue([mockProfile as any, false]);
      
      await userService.updateStudentProfile('user-1', { major: 'CS' });
      
      expect(mockProfile.update).toHaveBeenCalledWith({ major: 'CS' });
    });
    
    it('should throw error if user is not a student', async () => {
      const mockUser = { id: 'user-1', role: 'instructor' };
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);
      
      await expect(userService.updateStudentProfile('user-1', {}))
        .rejects.toThrow('User is not a student');
    });
  });
});
```

#### **C.2. Integration Test Example**
```typescript
// backend/src/modules/user/user.integration.test.ts

import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/db';
import User from '../../models/user.model';
import StudentProfile from '../../models/student-profile.model';

describe('User API Integration Tests', () => {
  let authToken: string;
  let testUser: any;
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'student',
      first_name: 'Test',
      last_name: 'User'
    });
    
    // Create student profile
    await StudentProfile.create({
      user_id: testUser.id,
      student_code: 'STU-TEST-001'
    });
    
    // Get auth token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginRes.body.data.accessToken;
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  describe('GET /api/v1/users/me', () => {
    it('should return current user with profiles', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('studentProfile');
      expect(res.body.data.user.studentProfile.student_code).toBe('STU-TEST-001');
    });
  });
  
  describe('PUT /api/v1/users/me/profile', () => {
    it('should update student profile', async () => {
      const res = await request(app)
        .put('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ major: 'Computer Science' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.profile.major).toBe('Computer Science');
    });
  });
});
```

---

## TÀI LIỆU THAM KHẢO

1. **Database Design:**
   - [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
   - [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)

2. **Sequelize:**
   - [Sequelize Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
   - [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

3. **Node.js Best Practices:**
   - [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
   - [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

4. **Testing:**
   - [Jest Documentation](https://jestjs.io/docs/getting-started)
   - [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Người tạo:** AI Assistant  
**Ngày cập nhật:** 08/11/2025  
**Version:** 1.0.0

