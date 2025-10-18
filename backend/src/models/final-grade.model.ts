import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class FinalGrade extends Model {
  declare id: string;
  declare user_id: string;
  declare course_id: string;
  declare total_score: number | null;
  declare letter_grade: string | null;
  declare calculated_at: Date;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (FinalGrade as any).belongsTo(models.User, { foreignKey: 'user_id', as: 'student' });
    (FinalGrade as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  }
}

(FinalGrade as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    total_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    letter_grade: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    calculated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'final_grades',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default FinalGrade;
