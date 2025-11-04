import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { EnrollmentAttributes, EnrollmentCreationAttributes, EnrollmentInstance } from '../types/model.types';
import { exportModel } from '../utils/model-extension.util';

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
    type: DataTypes.DATE,
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
  
  // Timestamps (automatically managed by Sequelize)
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
    }
  ]
});

export default exportModel(Enrollment);


