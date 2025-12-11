import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { QuizInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

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
    allowNull: true,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  section_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'sections', key: 'id' },
    onDelete: 'CASCADE',
    comment: 'Nếu có → quiz gắn với section cụ thể; null → quiz cấp course'
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
  },
  is_practice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'true = Practice Quiz (không tính điểm), false = Graded Quiz (tính điểm)'
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['section_id'] },
    { fields: ['available_from'] },
    { fields: ['available_until'] }
  ]
});

const QuizModel = Quiz as unknown as ModelStatic<QuizInstance>;

export default exportModel(QuizModel);






