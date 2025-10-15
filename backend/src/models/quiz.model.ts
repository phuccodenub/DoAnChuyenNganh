import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { QuizAttributes, QuizCreationAttributes, QuizInstance } from '../types/model.types';

const sequelize = getSequelize();

/**
 * Quiz Model
 * Quản lý bài trắc nghiệm trong khóa học
 */
const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: DataTypes.TEXT,
  duration_minutes: DataTypes.INTEGER,
  passing_score: DataTypes.DECIMAL(5, 2),
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  show_correct_answers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  available_from: DataTypes.DATE,
  available_until: DataTypes.DATE,
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['available_from'] },
    { fields: ['available_until'] }
  ]
});

export default Quiz as any;






