import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { CourseAttributes, CourseCreationAttributes, CourseInstance } from '../types/model.types';
import { exportModel } from '../utils/model-extension.util';

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
    allowNull: true,
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
    comment: 'Giá khóa học',
    // Ensure JSON output returns a number instead of string for DECIMAL
    get(this: any) {
      const raw = this.getDataValue('price');
      return raw === null || typeof raw === 'number' ? raw : Number(raw);
    }
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
    comment: 'Điểm trung bình (0-5)',
    // Normalize DECIMAL to number when serializing
    get(this: any) {
      const raw = this.getDataValue('rating');
      return raw === null || typeof raw === 'number' ? raw : Number(raw);
    }
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
  tableName: 'courses',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default exportModel(Course);


