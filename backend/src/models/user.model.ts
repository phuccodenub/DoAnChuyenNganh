import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Tên đăng nhập (mã số sinh viên/giảng viên hoặc username admin)',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
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
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin', 'super_admin'),
    defaultValue: 'student',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
    defaultValue: 'active',
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verified_at: DataTypes.DATE,
  token_version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_login: DataTypes.DATE,

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
});

// Hooks for password hashing (DISABLED - password already hashed in AuthService)
/*
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});
*/

// Define associations
User.associate = function(models: any) {
  // User has many Courses (as instructor)
  User.hasMany(models.Course, {
    foreignKey: 'instructor_id',
    as: 'courses'
  });

  // User has many Enrollments (as student)
  User.hasMany(models.Enrollment, {
    foreignKey: 'user_id',
    as: 'enrollments'
  });

  // User has many ChatMessages
  User.hasMany(models.ChatMessage, {
    foreignKey: 'user_id',
    as: 'chatMessages'
  });
};

export default User;