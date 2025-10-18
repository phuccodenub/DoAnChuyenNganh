import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class QuizQuestion extends Model {
  declare id: string;
  declare quiz_id: string;
  declare question_text: string;
  declare question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  declare points: number;
  declare order_index: number;
  declare explanation: string | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (QuizQuestion as any).belongsTo(models.Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
    (QuizQuestion as any).hasMany(models.QuizOption, { foreignKey: 'question_id', as: 'options' });
    (QuizQuestion as any).hasMany(models.QuizAnswer, { foreignKey: 'question_id', as: 'answers' });
  }
}

(QuizQuestion as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quiz_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'quizzes', key: 'id' }
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question_type: {
      type: DataTypes.ENUM('single_choice', 'multiple_choice', 'true_false'),
      allowNull: false
    },
    points: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    explanation: {
      type: DataTypes.TEXT,
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
    tableName: 'quiz_questions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default QuizQuestion;
