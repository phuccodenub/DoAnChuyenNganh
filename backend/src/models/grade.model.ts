import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class Grade extends Model {
  declare id: string;
  declare user_id: string;
  declare course_id: string;
  declare component_id: string | null;
  declare score: number;
  declare max_score: number;
  declare graded_by: string | null;
  declare graded_at: Date;
  declare notes: string | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Grade as any).belongsTo(models.User, { foreignKey: 'user_id', as: 'student' });
    (Grade as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (Grade as any).belongsTo(models.GradeComponent, { foreignKey: 'component_id', as: 'component' });
    (Grade as any).belongsTo(models.User, { foreignKey: 'graded_by', as: 'grader' });
  }
}

(Grade as any).init(
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
    component_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'grade_components', key: 'id' }
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    graded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    graded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
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
  },
  {
    sequelize,
    tableName: 'grades',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Grade;
