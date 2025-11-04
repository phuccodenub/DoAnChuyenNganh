import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { QuizAnswerInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const QuizAnswer = sequelize.define('QuizAnswer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  attempt_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'quiz_attempts', key: 'id' },
    onDelete: 'CASCADE'
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'quiz_questions', key: 'id' },
    onDelete: 'CASCADE'
  },
  selected_option_id: {
    type: DataTypes.UUID,
    references: { model: 'quiz_options', key: 'id' }
  },
  selected_options: {
    type: DataTypes.JSON,
    comment: 'For multiple choice questions'
  },
  is_correct: DataTypes.BOOLEAN,
  points_earned: DataTypes.DECIMAL(5, 2)
}, {
  tableName: 'quiz_answers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['attempt_id'] },
    { unique: true, fields: ['attempt_id', 'question_id'] }
  ]
});

const QuizAnswerModel = QuizAnswer as unknown as ModelStatic<QuizAnswerInstance>;
export default exportModel(QuizAnswerModel);







