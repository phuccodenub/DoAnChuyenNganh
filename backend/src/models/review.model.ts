/**
 * Review Model
 * 
 * Represents course reviews/ratings from students
 */

import { DataTypes, Model } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

// Types defined in model.types.ts
export interface ReviewAttributes {
  id: string;
  course_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  comment: string | null;
  is_published: boolean;
  instructor_reply: string | null;
  replied_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ReviewCreationAttributes extends Omit<ReviewAttributes, 'id' | 'created_at' | 'updated_at' | 'is_published' | 'instructor_reply' | 'replied_at'> {
  id?: string;
  is_published?: boolean;
  instructor_reply?: string | null;
  replied_at?: Date | null;
}

export interface ReviewInstance extends Model, ReviewAttributes {
  user?: any;
  course?: any;
}

const sequelize = getModelSequelize();

const Review = sequelize.define('Review', {
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
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  instructor_reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'user_id'], // One review per user per course
    },
    { fields: ['course_id'] },
    { fields: ['user_id'] },
    { fields: ['rating'] },
  ],
});

const ReviewModel = Review as unknown as ModelStatic<ReviewInstance>;
export default exportModel(ReviewModel);
