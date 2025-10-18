import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class QuizAnswer extends Model {
  declare id: string;
  declare attempt_id: string;
  declare question_id: string;
  declare selected_option_id: string | null;
  declare selected_options: any | null;
  declare is_correct: boolean | null;
  declare points_earned: number | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (QuizAnswer as any).belongsTo(models.QuizAttempt, { foreignKey: 'attempt_id', as: 'attempt' });
    (QuizAnswer as any).belongsTo(models.QuizQuestion, { foreignKey: 'question_id', as: 'question' });
    (QuizAnswer as any).belongsTo(models.QuizOption, { foreignKey: 'selected_option_id', as: 'selectedOption' });
  }
}

(QuizAnswer as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    attempt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'quiz_attempts', key: 'id' }
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'quiz_questions', key: 'id' }
    },
    selected_option_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'quiz_options', key: 'id' }
    },
    selected_options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    points_earned: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
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
    tableName: 'quiz_answers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default QuizAnswer;
