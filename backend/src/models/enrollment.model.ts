import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { EnrollmentAttributes, EnrollmentCreationAttributes, EnrollmentInstance } from '../types/model.types';

const sequelize = getSequelize();

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
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
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled', 'suspended'),
    defaultValue: 'pending',
  },
  enrollment_type: {
    type: DataTypes.ENUM('free', 'paid', 'trial'),
    defaultValue: 'free',
    allowNull: false
  },
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
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true,
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

export default Enrollment as any;


