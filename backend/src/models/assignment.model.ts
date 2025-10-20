import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Assignment extends Model {
  declare id: string;
  declare course_id: string;
  declare title: string;
  declare description: string | null;
  declare max_points: number;
  declare due_date: Date | null;
  declare allow_late_submission: boolean;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(Assignment as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    max_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allow_late_submission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'assignments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Assignment;
