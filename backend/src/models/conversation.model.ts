/**
 * Conversation Model
 * 
 * Represents a direct message conversation between a student and instructor
 * in the context of a specific course.
 */

import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { ConversationInstance } from '../types/model.types';
import { exportModel, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  student_last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  instructor_last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_archived_by_student: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_archived_by_instructor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
});

const ConversationModel = Conversation as unknown as ModelStatic<ConversationInstance>;

// Static Methods
addStaticMethods(ConversationModel, {
  /**
   * Find or create conversation between student and instructor for a course
   */
  async findOrCreateConversation(
    this: ModelStatic<ConversationInstance>,
    courseId: string,
    studentId: string,
    instructorId: string
  ) {
    const [conversation, created] = await this.findOrCreate({
      where: {
        course_id: courseId,
        student_id: studentId,
        instructor_id: instructorId,
      },
      defaults: {
        course_id: courseId,
        student_id: studentId,
        instructor_id: instructorId,
      },
    });
    return { conversation, created };
  },

  /**
   * Get all conversations for a user (student or instructor)
   */
  async getConversationsForUser(
    this: ModelStatic<ConversationInstance>,
    userId: string,
    role: 'student' | 'instructor',
    includeArchived = false
  ) {
    const whereClause: Record<string, unknown> = role === 'student' 
      ? { student_id: userId }
      : { instructor_id: userId };
    
    if (!includeArchived) {
      if (role === 'student') {
        whereClause.is_archived_by_student = false;
      } else {
        whereClause.is_archived_by_instructor = false;
      }
    }

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status'],
        },
        {
          model: sequelize.models.User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status'],
        },
        {
          model: sequelize.models.Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail'],
        },
      ],
      order: [['last_message_at', 'DESC NULLS LAST']],
    });
  },
});

export default exportModel(ConversationModel);
