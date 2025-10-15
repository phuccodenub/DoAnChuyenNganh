import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { QuizQuestionAttributes, QuizQuestionCreationAttributes, QuizQuestionInstance } from '../types/model.types';

const sequelize = getSequelize();

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('single_choice', 'multiple_choice', 'true_false'),
    allowNull: false
  },
  points: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.0
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  explanation: DataTypes.TEXT
}, {
  tableName: 'quiz_questions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['quiz_id'] },
    { unique: true, fields: ['quiz_id', 'order_index'] }
  ]
});

export default QuizQuestion as any;







