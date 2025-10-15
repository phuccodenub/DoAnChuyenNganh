import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { QuizOptionAttributes, QuizOptionCreationAttributes, QuizOptionInstance } from '../types/model.types';

const sequelize = getSequelize();

const QuizOption = sequelize.define('QuizOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'quiz_questions', key: 'id' },
    onDelete: 'CASCADE'
  },
  option_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'quiz_options',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['question_id'] }
  ]
});

export default QuizOption as any;







