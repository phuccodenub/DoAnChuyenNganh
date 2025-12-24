import { DataTypes, Model } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { AssignmentAttributes, AssignmentCreationAttributes, AssignmentInstance } from '../types/model.types';
import { addInstanceMethods, addStaticMethods, exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const Assignment = sequelize.define('Assignment', {
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
    comment: 'Nếu có → assignment gắn với section cụ thể; null → assignment cấp course'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: DataTypes.TEXT,
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Câu hỏi/yêu cầu chi tiết của assignment (khác với description - mô tả tổng quan)'
  },
  rubric: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Default rubric for AI grading'
  },
  max_score: {

    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100.0
  },
  due_date: DataTypes.DATE,
  allow_late_submission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submission_type: {
    type: DataTypes.ENUM('file', 'text', 'both'),
    allowNull: false
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_practice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'true = Practice Assignment (không tính điểm), false = Graded Assignment (tính điểm)'
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['section_id'] },
    { fields: ['due_date'] }
  ]
});

const AssignmentModel = Assignment as unknown as ModelStatic<AssignmentInstance>;
export default exportModel(AssignmentModel);







