import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class QuizOption extends Model {
  declare id: string;
  declare question_id: string;
  declare option_text: string;
  declare is_correct: boolean;
  declare order_index: number;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(QuizOption as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'quiz_questions', key: 'id' }
    },
    option_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    order_index: {
      type: DataTypes.INTEGER,
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
    tableName: 'quiz_options',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default QuizOption;
