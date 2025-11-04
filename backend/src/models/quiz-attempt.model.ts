import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { QuizAttemptAttributes, QuizAttemptCreationAttributes, QuizAttemptInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'quizzes', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  score: DataTypes.DECIMAL(5, 2),
  max_score: DataTypes.DECIMAL(5, 2),
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  submitted_at: DataTypes.DATE,
  time_spent_minutes: DataTypes.INTEGER,
  is_passed: DataTypes.BOOLEAN
}, {
  tableName: 'quiz_attempts',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['quiz_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['quiz_id', 'user_id', 'attempt_number'] }
  ]
});

const QuizAttemptModel = QuizAttempt as unknown as ModelStatic<QuizAttemptInstance>;
export default exportModel(QuizAttemptModel);







