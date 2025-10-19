import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { CourseAttributes, CourseCreationAttributes, CourseInstance } from '../types/model.types';

const sequelize = getSequelize();

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
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
    comment: 'Danh mục của khóa học'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
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
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
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

export default Course as any;


