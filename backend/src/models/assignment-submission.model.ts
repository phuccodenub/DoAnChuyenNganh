import { DataTypes, Model } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { AssignmentSubmissionAttributes, AssignmentSubmissionCreationAttributes, AssignmentSubmissionInstance } from '../types/model.types';
import { addInstanceMethods, addStaticMethods, exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  assignment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'assignments', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  submission_text: DataTypes.TEXT,
  file_url: DataTypes.TEXT,
  file_name: DataTypes.STRING(255),
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  score: DataTypes.DECIMAL(5, 2),
  feedback: DataTypes.TEXT,
  graded_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  graded_at: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'returned'),
    defaultValue: 'submitted'
  }
}, {
  tableName: 'assignment_submissions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['assignment_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['assignment_id', 'user_id'] }
  ]
});

const AssignmentSubmissionModel = AssignmentSubmission as unknown as ModelStatic<AssignmentSubmissionInstance>;
export default exportModel(AssignmentSubmissionModel);







