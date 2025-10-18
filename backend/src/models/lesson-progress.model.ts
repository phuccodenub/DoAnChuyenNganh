import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class LessonProgress extends Model {
  declare id: string;
  declare user_id: string;
  declare lesson_id: string;
  declare completed: boolean;
  declare last_position: number;
  declare completion_percentage: number;
  declare time_spent_seconds: number;
  declare started_at: Date | null;
  declare completed_at: Date | null;
  declare last_accessed_at: Date | null;
  declare notes: string | null;
  declare bookmarked: boolean;
  declare quiz_score: number | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (LessonProgress as any).belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    (LessonProgress as any).belongsTo(models.Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
  }
}

(LessonProgress as any).init(
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
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lessons', key: 'id' }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completion_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    time_spent_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bookmarked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    quiz_score: {
      type: DataTypes.DECIMAL(5, 2),
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
    tableName: 'lesson_progress',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default LessonProgress;
