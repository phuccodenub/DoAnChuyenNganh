import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class CourseStatistics extends Model {
  declare id: string;
  declare course_id: string;
  declare total_enrollments: number;
  declare active_enrollments: number;
  declare completion_rate: number | null;
  declare average_score: number | null;
  declare updated_at: Date | null;
  declare created_at: Date | null;

  static associate(models: any) {
    (CourseStatistics as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  }
}

(CourseStatistics as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'courses', key: 'id' }
    },
    total_enrollments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    active_enrollments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completion_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    average_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'course_statistics',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default CourseStatistics;
