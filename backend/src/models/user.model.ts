import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { UserAttributes, UserCreationAttributes, UserInstance } from '../types/model.types';
import { exportModel } from '../utils/model-extension.util';

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
});

// Hooks for password hashing (DISABLED - password already hashed in AuthService)
/*
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    user.password_hash = await bcrypt.hash(user.password_hash, 12);
  }
});
*/

export default exportModel(User);

