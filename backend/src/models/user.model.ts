import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model: SequelizeModel } = require('sequelize');
const sequelize = getSequelize();

class User extends SequelizeModel {
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare phone: string | null;
  declare bio: string | null;
  declare avatar: string | null;
  declare role: 'student' | 'instructor' | 'admin' | 'super_admin';
  declare status: 'active' | 'inactive' | 'suspended' | 'pending';
  declare email_verified: boolean;
  declare email_verified_at: Date | null;
  declare token_version: number;
  declare last_login: Date | null;
  // Student fields
  declare student_id: string | null;
  declare class: string | null;
  declare major: string | null;
  declare year: number | null;
  declare gpa: number | null;
  // Instructor fields
  declare instructor_id: string | null;
  declare department: string | null;
  declare specialization: string | null;
  declare experience_years: number | null;
  declare education_level: 'bachelor' | 'master' | 'phd' | 'professor' | null;
  declare research_interests: string | null;
  // Common fields
  declare date_of_birth: Date | null;
  declare gender: 'male' | 'female' | 'other' | null;
  declare address: string | null;
  declare emergency_contact: string | null;
  declare emergency_phone: string | null;
  // timestamps
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (User as any).hasMany(models.Course, { foreignKey: 'instructor_id', as: 'courses' });
    (User as any).hasMany(models.Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
    (User as any).hasMany(models.ChatMessage, { foreignKey: 'user_id', as: 'chatMessages' });
  }
}

(User as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('student', 'instructor', 'admin', 'super_admin'),
      defaultValue: 'student',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      defaultValue: 'active',
      allowNull: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    token_version: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    student_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    major: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    instructor_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    education_level: {
      type: DataTypes.ENUM('bachelor', 'master', 'phd', 'professor'),
      allowNull: true
    },
    research_interests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    emergency_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default User;
