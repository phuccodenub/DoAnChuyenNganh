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
    type: DataTypes.ENUM('enrolled', 'completed', 'dropped'),
    defaultValue: 'enrolled',
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  grade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
}, {
  tableName: 'enrollments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    }
  ]
});

export default Enrollment as any;


