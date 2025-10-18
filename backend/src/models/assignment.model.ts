import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Assignment extends Model {
  declare id: string;
  declare course_id: string;
  declare title: string;
  declare description: string | null;
  declare max_score: number;
  declare due_date: Date | null;
  declare allow_late_submission: boolean;
  declare submission_type: 'file' | 'text' | 'both';
  declare is_published: boolean;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Assignment as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (Assignment as any).hasMany(models.AssignmentSubmission, { foreignKey: 'assignment_id', as: 'submissions' });
  }
}

(Assignment as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.0
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allow_late_submission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    submission_type: {
      type: DataTypes.ENUM('file', 'text', 'both'),
      allowNull: false
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
  },
  {
    sequelize,
    tableName: 'assignments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Assignment;
