/**
 * Migration 002: Create courses table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function createCoursesTable(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('courses', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
}
