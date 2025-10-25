import { DataTypes, Model, ModelStatic } from 'sequelize';
import { getSequelize } from '../config/db';
import { AssignmentAttributes, AssignmentCreationAttributes, AssignmentInstance } from '../types/model.types';
import { addInstanceMethods, addStaticMethods, exportModel } from '../utils/model-extension.util';

const sequelize = getSequelize();

const Assignment = sequelize.define('Assignment', {
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
  }
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['due_date'] }
  ]
});

const AssignmentModel = Assignment as unknown as ModelStatic<AssignmentInstance>;
export default exportModel(AssignmentModel);







