import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { FinalGradeAttributes, FinalGradeCreationAttributes, FinalGradeInstance } from '../types/model.types';

const sequelize = getSequelize();

const FinalGrade = sequelize.define('FinalGrade', {
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
  total_score: DataTypes.DECIMAL(5, 2),
  letter_grade: DataTypes.STRING(2),
  calculated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'final_grades',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { unique: true, fields: ['user_id', 'course_id'] }
  ]
});

export default FinalGrade as any;







