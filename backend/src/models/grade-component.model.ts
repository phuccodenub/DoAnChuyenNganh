import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { GradeComponentAttributes, GradeComponentCreationAttributes, GradeComponentInstance } from '../types/model.types';

const sequelize = getSequelize();

const GradeComponent = sequelize.define('GradeComponent', {
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
  component_type: {
    type: DataTypes.ENUM('quiz', 'assignment', 'attendance', 'participation', 'manual'),
    allowNull: false
  },
  component_id: DataTypes.UUID,
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'grade_components',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['component_type'] }
  ]
});

export default GradeComponent as any;







