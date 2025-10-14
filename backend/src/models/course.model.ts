import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/db';

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
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'beginner',
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'en',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discount_percentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  discount_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  discount_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  video_intro: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'suspended'),
    allowNull: false,
    defaultValue: 'draft',
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  prerequisites: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  learning_objectives: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});

// Define associations
Course.associate = function(models: any) {
  // Course belongs to User (instructor)
  Course.belongsTo(models.User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // Course has many Enrollments
  Course.hasMany(models.Enrollment, {
    foreignKey: 'course_id',
    as: 'enrollments'
  });

  // Course has many ChatMessages
  Course.hasMany(models.ChatMessage, {
    foreignKey: 'course_id',
    as: 'chatMessages'
  });
};

export default Course;
