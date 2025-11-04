import { DataTypes, ModelStatic } from 'sequelize';
import { getSequelize } from '../config/db';
import { GradeInstance } from '../types/model.types';
import { exportModel } from '../utils/model-extension.util';

const sequelize = getSequelize();

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  component_id: {
    type: DataTypes.UUID,
    references: { model: 'grade_components', key: 'id' },
    onDelete: 'CASCADE'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  max_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  graded_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  graded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: DataTypes.TEXT
}, {
  tableName: 'grades',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { fields: ['component_id'] }
  ]
});

const GradeModel = Grade as unknown as ModelStatic<GradeInstance>;
export default exportModel(GradeModel);







