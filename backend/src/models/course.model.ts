import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Course extends Model {
  declare id: string;
  declare title: string;
  declare description: string | null;
  declare instructor_id: string;
  declare category: string | null;
  declare subcategory: string | null;
  declare level: 'beginner' | 'intermediate' | 'advanced';
  declare language: string;
  declare price: number;
  declare currency: string;
  declare discount_price: number | null;
  declare discount_percentage: number | null;
  declare discount_start: Date | null;
  declare discount_end: Date | null;
  declare thumbnail: string | null;
  declare video_intro: string | null;
  declare duration_hours: number | null;
  declare total_lessons: number;
  declare total_students: number;
  declare rating: number;
  declare total_ratings: number;
  declare status: 'draft' | 'published' | 'archived' | 'suspended';
  declare is_featured: boolean;
  declare is_free: boolean;
  declare prerequisites: any | null;
  declare learning_objectives: any | null;
  declare tags: any | null;
  declare metadata: any | null;
  declare published_at: Date | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Course as any).belongsTo(models.User, { foreignKey: 'instructor_id', as: 'instructor' });
    (Course as any).hasMany(models.Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
    (Course as any).hasMany(models.ChatMessage, { foreignKey: 'course_id', as: 'chatMessages' });
  }
}

(Course as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    subcategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner'
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'en'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    discount_percentage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    discount_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    discount_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    video_intro: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    duration_hours: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_lessons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived', 'suspended'),
      allowNull: false,
      defaultValue: 'draft'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_free: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    prerequisites: {
      type: DataTypes.JSON,
      allowNull: true
    },
    learning_objectives: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    published_at: {
      type: DataTypes.DATE,
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
    tableName: 'courses',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Course;
