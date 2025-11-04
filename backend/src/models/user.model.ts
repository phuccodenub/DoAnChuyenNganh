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
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default exportModel(User as any);
