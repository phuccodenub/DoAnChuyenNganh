import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/db';

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
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
  },
  enrollment_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'free',
  },
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: true,
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  completed_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  certificate_issued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  certificate_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
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
    allowNull: true,
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  access_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
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

// Define associations
Enrollment.associate = function(models: any) {
  // Enrollment belongs to User (student)
  Enrollment.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  // Enrollment belongs to Course
  Enrollment.belongsTo(models.Course, {
    foreignKey: 'course_id',
    as: 'course'
  });
};

export default Enrollment;
