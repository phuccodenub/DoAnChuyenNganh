/**
 * Direct Message Repository
 * 
 * Database operations for direct messages within conversations
 */

import { Op } from 'sequelize';
import { DirectMessage, User, Conversation } from '../../models';
import { DirectMessageCreationAttributes } from '../../types/model.types';

export class DirectMessageRepository {
  /**
   * Find message by ID
   */
  async findById(id: string) {
    return await DirectMessage.findByPk(id, {
      attributes: [
        'id',
        'conversation_id',
        'sender_id',
        'content',
        'status',
        'attachment_type',
        'attachment_url',
        'attachment_name',
        'attachment_size',
        'is_edited',
        'edited_at',
        'is_deleted',
        'deleted_at',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'],
        },
      ],
    });
  }

  /**
   * Get messages for a conversation with pagination
   */
  async findByConversationId(
    conversationId: string,
    options: { limit?: number; before?: string; after?: string } = {}
  ) {
    const { limit = 50, before, after } = options;

    const whereClause: Record<string, unknown> = {
      conversation_id: conversationId,
      is_deleted: false,
    };

    if (before) {
      whereClause.created_at = { [Op.lt]: new Date(before) };
    } else if (after) {
      whereClause.created_at = { [Op.gt]: new Date(after) };
    }

    const messages = await DirectMessage.findAll({
      where: whereClause,
      attributes: [
        'id',
        'conversation_id',
        'sender_id',
        'content',
        'status',
        'attachment_type',
        'attachment_url',
        'attachment_name',
        'attachment_size',
        'is_edited',
        'edited_at',
        'is_deleted',
        'deleted_at',
        'created_at', // Explicitly include timestamp
        'updated_at', // Explicitly include timestamp
      ],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'],
        },
      ],
      // Always fetch DESC (newest first), then reverse for chronological order
      order: [['created_at', 'DESC']],
      limit,
    });

    // Reverse to get chronological order (oldest to newest)
    messages.reverse();

    return messages;
  }

  /**
   * Create a new message
   */
  async create(data: DirectMessageCreationAttributes) {
    const message = await DirectMessage.create(data as any);
    return this.findById(message.id);
  }

  /**
   * Update message content
   */
  async update(id: string, content: string) {
    await DirectMessage.update(
      {
        content,
        is_edited: true,
        edited_at: new Date(),
      },
      { where: { id } }
    );
    return this.findById(id);
  }

  /**
   * Soft delete a message
   */
  async softDelete(id: string) {
    await DirectMessage.update(
      {
        is_deleted: true,
        deleted_at: new Date(),
      },
      { where: { id } }
    );
  }

  /**
   * Mark messages as delivered
   */
  async markAsDelivered(conversationId: string, recipientId: string) {
    await DirectMessage.update(
      { status: 'delivered' },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: recipientId },
          status: 'sent',
        },
      }
    );
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, recipientId: string) {
    await DirectMessage.update(
      { status: 'read' },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: recipientId },
          status: { [Op.in]: ['sent', 'delivered'] },
        },
      }
    );
  }

  /**
   * Mark a single message as read
   */
  async markSingleAsRead(messageId: string) {
    await DirectMessage.update(
      {
        status: 'read',
        is_read: true,
        read_at: new Date(),
      },
      { where: { id: messageId } }
    );
  }

  /**
   * Count unread messages in a conversation for a user
   */
  async countUnread(conversationId: string, userId: string, lastReadAt: Date | null): Promise<number> {
    const whereClause: Record<string, unknown> = {
      conversation_id: conversationId,
      sender_id: { [Op.ne]: userId },
      is_deleted: false,
    };

    if (lastReadAt) {
      whereClause.created_at = { [Op.gt]: lastReadAt };
    }

    return await DirectMessage.count({ where: whereClause });
  }

  /**
   * Get the last message of a conversation
   */
  async getLastMessage(conversationId: string) {
    return await DirectMessage.findOne({
      where: {
        conversation_id: conversationId,
        is_deleted: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Check if user is sender of message
   */
  async isSender(messageId: string, userId: string): Promise<boolean> {
    const message = await DirectMessage.findOne({
      where: {
        id: messageId,
        sender_id: userId,
      },
    });
    return !!message;
  }

  /**
   * Search messages in a conversation
   */
  async search(conversationId: string, searchTerm: string, limit = 20) {
    return await DirectMessage.findAll({
      where: {
        conversation_id: conversationId,
        is_deleted: false,
        content: {
          [Op.iLike]: `%${searchTerm}%`,
        },
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export const directMessageRepository = new DirectMessageRepository();
export default directMessageRepository;
