import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class QuizAttempt extends Model {
  declare id: string;
  declare quiz_id: string;
  declare user_id: string;
  declare attempt_number: number;
  declare score: number | null;
  declare max_score: number | null;
  declare started_at: Date;
  declare submitted_at: Date | null;
  declare time_spent_minutes: number | null;
  declare is_passed: boolean | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(QuizAttempt as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quiz_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'quizzes', key: 'id' }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    attempt_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_spent_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_passed: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'quiz_attempts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default QuizAttempt;
