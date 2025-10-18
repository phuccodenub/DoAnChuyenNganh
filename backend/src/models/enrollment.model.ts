import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Enrollment extends Model {
  declare id: string;
  declare user_id: string;
  declare course_id: string;
  declare status: string;
  declare enrollment_type: string;
  declare payment_status: string;
  declare payment_method: string | null;
  declare payment_id: string | null;
  declare amount_paid: number | null;
  declare currency: string | null;
  declare progress_percentage: number;
  declare completed_lessons: number;
  declare total_lessons: number;
  declare last_accessed_at: Date | null;
  declare completion_date: Date | null;
  declare certificate_issued: boolean;
  declare certificate_url: string | null;
  declare rating: number | null;
  declare review: string | null;
  declare review_date: Date | null;
  declare access_expires_at: Date | null;
  declare metadata: any | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Enrollment as any).belongsTo(models.User, { foreignKey: 'user_id', as: 'student' });
    (Enrollment as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  }
}

(Enrollment as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending'
    },
    enrollment_type: {
      type: DataTypes.STRING(20),
      defaultValue: 'free'
    },
    payment_status: {
      type: DataTypes.STRING(20),
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
      defaultValue: 0.00
    },
    completed_lessons: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_lessons: {
      type: DataTypes.INTEGER,
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
      defaultValue: false
    },
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
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
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
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
  }
);

export default Enrollment;
