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
>>>>>>> origin/refactor

(User as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('student', 'instructor', 'admin', 'super_admin'),
      defaultValue: 'student',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      defaultValue: 'active',
      allowNull: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    token_version: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    student_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    major: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    instructor_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    education_level: {
      type: DataTypes.ENUM('bachelor', 'master', 'phd', 'professor'),
      allowNull: true
    },
    research_interests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    emergency_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export default exportModel(User);
