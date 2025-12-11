import { DataTypes, Model } from 'sequelize';
import { CoursePrerequisiteAttributes, CoursePrerequisiteCreationAttributes, CoursePrerequisiteInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';
import type { ModelStatic } from '../types/sequelize-types';

const sequelize = getModelSequelize();

/**
 * CoursePrerequisite Model
 * Quản lý yêu cầu trước khi học khóa học
 */
const CoursePrerequisite = sequelize.define('CoursePrerequisite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Khóa học yêu cầu prerequisites',
  },
  prerequisite_course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Khóa học cần hoàn thành trước',
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'true = bắt buộc, false = khuyến nghị',
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Thứ tự hiển thị',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'course_prerequisites',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['course_id'],
    },
    {
      fields: ['prerequisite_course_id'],
    },
    {
      fields: ['is_required'],
    },
    {
      unique: true,
      fields: ['course_id', 'prerequisite_course_id'],
      name: 'unique_course_prerequisite',
    },
  ],
});

const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;

export default exportModel(CoursePrerequisiteModel);

