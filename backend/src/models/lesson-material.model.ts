import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class LessonMaterial extends Model {
  declare id: string;
  declare lesson_id: string;
  declare file_name: string;
  declare file_url: string;
  declare file_type: string | null;
  declare file_size: number | null;
  declare file_extension: string | null;
  declare description: string | null;
  declare download_count: number;
  declare is_downloadable: boolean;
  declare uploaded_by: string | null;
  declare order_index: number;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(LessonMaterial as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lessons', key: 'id' }
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    file_extension: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_downloadable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'lesson_materials',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default LessonMaterial;
