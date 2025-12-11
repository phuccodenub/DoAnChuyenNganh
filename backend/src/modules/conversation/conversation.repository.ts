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
          as: 'user1',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'user2',
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
   * Find conversation between two users for a course
   */
  async findByParticipants(courseId: string | null, user1Id: string, user2Id: string) {
    // Try both directions: (user1, user2) and (user2, user1)
    return await Conversation.findOne({
      where: {
        course_id: courseId,
        [Op.or]: [
          { user1_id: user1Id, user2_id: user2Id },
          { user1_id: user2Id, user2_id: user1Id },
        ],
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'user2',
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
    role: 'student' | 'instructor' | 'admin',
    options: { includeArchived?: boolean; limit?: number; offset?: number } = {}
  ) {
    const { includeArchived = false, limit = 50, offset = 0 } = options;

    // Find conversations where user is either user1 or user2
    const whereClause: Record<string, unknown> = {
      [Op.or]: [
        { user1_id: userId },
        { user2_id: userId },
      ],
    };

    // Filter archived conversations
    if (!includeArchived) {
      whereClause[Op.and] = {
        [Op.or]: [
          { user1_id: userId, is_archived_by_user1: false },
          { user2_id: userId, is_archived_by_user2: false },
        ],
      };
    }

    return await Conversation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: User,
          as: 'user2',
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
  async findOrCreate(courseId: string | null, user1Id: string, user2Id: string) {
    const existing = await this.findByParticipants(courseId, user1Id, user2Id);
    if (existing) {
      return { conversation: existing, created: false };
    }

    const conversation = await this.create({
      course_id: courseId,
      user1_id: user1Id,
      user2_id: user2Id,
    });

    return { conversation, created: true };
  }

  /**
   * Find or create direct conversation (no course)
   */
  async findOrCreateDirect(user1Id: string, user2Id: string) {
    // Use findByParticipants which handles both directions
    const existing = await this.findByParticipants(null, user1Id, user2Id);

    if (existing) {
      return { conversation: existing, created: false };
    }

    // Create new direct conversation
    const conversation = await Conversation.create({
      user1_id: user1Id,
      user2_id: user2Id,
      course_id: null,
    } as any);

    // Fetch with associations
    const fullConversation = await this.findById(conversation.id);
    return { conversation: fullConversation, created: true };
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
    // Determine which user column this userId belongs to
    const conversation = await Conversation.findByPk(id);
    if (!conversation) return;

    const field = (conversation as any).user1_id === userId ? 'user1_last_read_at' : 'user2_last_read_at';
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
          { user1_id: userId },
          { user2_id: userId },
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
    
    if ((conversation as any).user1_id === userId) return 'student';
    if ((conversation as any).user2_id === userId) return 'instructor';
    return null;
  }
}

export const conversationRepository = new ConversationRepository();
export default conversationRepository;
