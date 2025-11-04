/**
 * Migration 003: Create enrollments table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function createEnrollmentsTable(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('enrollments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending'
    },
    enrollment_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'free'
    },
    payment_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    progress_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    completed_lessons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_lessons: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completion_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certificate_issued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    review_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    access_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
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

