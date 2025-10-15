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
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});

export default Course as any;


