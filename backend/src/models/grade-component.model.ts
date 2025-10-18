import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class GradeComponent extends Model {
  declare id: string;
  declare course_id: string;
  declare component_type: 'quiz' | 'assignment' | 'attendance' | 'participation' | 'manual';
  declare component_id: string | null;
  declare weight: number;
  declare name: string;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(GradeComponent as any).init(
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
    component_type: {
      type: DataTypes.ENUM('quiz', 'assignment', 'attendance', 'participation', 'manual'),
      allowNull: false
    },
    component_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    tableName: 'grade_components',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default GradeComponent;
