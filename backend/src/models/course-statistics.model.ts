import { DataTypes, ModelStatic } from 'sequelize';
import { getSequelize } from '../config/db';
import { CourseStatisticsInstance } from '../types/model.types';
import { exportModel } from '../utils/model-extension.util';

const sequelize = getSequelize();

const CourseStatistics = sequelize.define('CourseStatistics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
    unique: true
  },
  total_enrollments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  active_enrollments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completion_rate: DataTypes.DECIMAL(5, 2),
  average_score: DataTypes.DECIMAL(5, 2),
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'course_statistics',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['course_id'] }
  ]
});

const CourseStatisticsModel = CourseStatistics as unknown as ModelStatic<CourseStatisticsInstance>;
export default exportModel(CourseStatisticsModel);







