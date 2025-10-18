import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Section extends Model {
  declare id: string;
  declare course_id: string;
  declare title: string;
  declare description: string | null;
  declare order_index: number;
  declare is_published: boolean;
  declare duration_minutes: number | null;
  declare objectives: any[] | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Section as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (Section as any).hasMany(models.Lesson, { foreignKey: 'section_id', as: 'lessons' });
  }
}

(Section as any).init(
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
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    objectives: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
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
    tableName: 'sections',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Section;
