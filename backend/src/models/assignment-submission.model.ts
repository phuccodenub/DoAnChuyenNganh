import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class AssignmentSubmission extends Model {
  declare id: string;
  declare assignment_id: string;
  declare user_id: string;
  declare submission_text: string | null;
  declare file_url: string | null;
  declare file_name: string | null;
  declare submitted_at: Date;
  declare score: number | null;
  declare feedback: string | null;
  declare graded_by: string | null;
  declare graded_at: Date | null;
  declare status: 'submitted' | 'graded' | 'returned';
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (AssignmentSubmission as any).belongsTo(models.Assignment, { foreignKey: 'assignment_id', as: 'assignment' });
    (AssignmentSubmission as any).belongsTo(models.User, { foreignKey: 'user_id', as: 'student' });
    (AssignmentSubmission as any).belongsTo(models.User, { foreignKey: 'graded_by', as: 'grader' });
  }
}

(AssignmentSubmission as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'assignments', key: 'id' }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    submission_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    graded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    graded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'returned'),
      allowNull: false,
      defaultValue: 'submitted'
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
    tableName: 'assignment_submissions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default AssignmentSubmission;
