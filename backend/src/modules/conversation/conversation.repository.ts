/**
 * Conversation Repository
 * 
 * Database operations for direct message conversations
 */

import { Op } from 'sequelize';
import { Conversation, DirectMessage, User, Course } from '../../models';
import { ConversationCreationAttributes, DirectMessageCreationAttributes } from '../../types/model.types';

export class ConversationRepository {
  /**
   * Find conversation by ID with associations
   */
  async findById(id: string) {
    return await Conversation.findByPk(id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail'],
        },
      ],
    });
  }

  /**
   * Find conversation by course, student and instructor
   */
  async findByParticipants(courseId: string, studentId: string, instructorId: string) {
    return await Conversation.findOne({
      where: {
        course_id: courseId,
        student_id: studentId,
        instructor_id: instructorId,
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail'],
        },
      ],
    });
  }

  /**
   * Get all conversations for a user
   */
  async findByUserId(
    userId: string,
    role: 'student' | 'instructor',
    options: { includeArchived?: boolean; limit?: number; offset?: number } = {}
  ) {
    const { includeArchived = false, limit = 50, offset = 0 } = options;

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

    return await Conversation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail'],
        },
      ],
      order: [['last_message_at', 'DESC NULLS LAST']],
      limit,
      offset,
    });
  }

  /**
   * Create a new conversation
   */
  async create(data: ConversationCreationAttributes) {
    const conversation = await Conversation.create(data as any);
    return this.findById(conversation.id);
  }

  /**
   * Find or create conversation
   */
  async findOrCreate(courseId: string, studentId: string, instructorId: string) {
    const existing = await this.findByParticipants(courseId, studentId, instructorId);
    if (existing) {
      return { conversation: existing, created: false };
    }

    const conversation = await this.create({
      course_id: courseId,
      student_id: studentId,
      instructor_id: instructorId,
    });

    return { conversation, created: true };
  }

  /**
   * Update conversation
   */
  async update(id: string, data: Partial<ConversationCreationAttributes>) {
    await Conversation.update(data as any, { where: { id } });
    return this.findById(id);
  }

  /**
   * Update last_message_at timestamp
   */
  async updateLastMessageAt(id: string, timestamp: Date = new Date()) {
    await Conversation.update(
      { last_message_at: timestamp },
      { where: { id } }
    );
  }

  /**
   * Mark conversation as read for a user
   */
  async markAsRead(id: string, userId: string, role: 'student' | 'instructor') {
    const field = role === 'student' ? 'student_last_read_at' : 'instructor_last_read_at';
    await Conversation.update(
      { [field]: new Date() },
      { where: { id } }
    );
  }

  /**
   * Archive/unarchive conversation
   */
  async archive(id: string, userId: string, role: 'student' | 'instructor', archived = true) {
    const field = role === 'student' ? 'is_archived_by_student' : 'is_archived_by_instructor';
    await Conversation.update(
      { [field]: archived },
      { where: { id } }
    );
  }

  /**
   * Check if user is participant in conversation
   */
  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { student_id: userId },
          { instructor_id: userId },
        ],
      },
    });
    return !!conversation;
  }

  /**
   * Get participant role in conversation
   */
  async getParticipantRole(conversationId: string, userId: string): Promise<'student' | 'instructor' | null> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return null;
    
    if ((conversation as any).student_id === userId) return 'student';
    if ((conversation as any).instructor_id === userId) return 'instructor';
    return null;
  }
}

export const conversationRepository = new ConversationRepository();
export default conversationRepository;
