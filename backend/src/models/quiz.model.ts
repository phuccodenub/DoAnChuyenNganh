import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class Quiz extends Model {
  declare id: string;
  declare course_id: string;
  declare title: string;
  declare description: string | null;
  declare duration_minutes: number | null;
  declare passing_score: number | null;
  declare max_attempts: number;
  declare shuffle_questions: boolean;
  declare show_correct_answers: boolean;
  declare available_from: Date | null;
  declare available_until: Date | null;
  declare is_published: boolean;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (Quiz as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (Quiz as any).hasMany(models.QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
    (Quiz as any).hasMany(models.QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
  }
}

(Quiz as any).init(
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
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    passing_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    shuffle_questions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    show_correct_answers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    available_from: {
      type: DataTypes.DATE,
      allowNull: true
    },
    available_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_published: {
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
    tableName: 'quizzes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Quiz;
