/**
 * AI Chat Repository
 * Database operations cho AI chat history
 */

import logger from '../../../utils/logger.util';
import AIChatHistory from '../../../models/ai-chat-history.model';
import { ChatMessage } from '../services/ai-tutor.service';

export class AIChatRepository {
  /**
   * Save chat message to database
   */
  async saveChatMessage(params: {
    userId: string;
    courseId?: string;
    lessonId?: string;
    role: 'user' | 'assistant' | 'system';
    message: string;
    model?: string;
    provider?: string;
    latency?: number;
    tokensUsed?: number;
  }): Promise<void> {
    try {
      await AIChatHistory.create({
        user_id: params.userId,
        course_id: params.courseId || null,
        lesson_id: params.lessonId || null,
        role: params.role,
        message: params.message,
        model: params.model || null,
        provider: params.provider || null,
        latency: params.latency || null,
        tokens_used: params.tokensUsed || null,
      });

      logger.debug(`[AIChatRepository] Saved ${params.role} message for user ${params.userId}`);
    } catch (error) {
      logger.error('[AIChatRepository] Error saving chat message:', error);
      // Don't throw - saving history shouldn't break the chat flow
    }
  }

  /**
   * Load conversation history
   */
  async loadConversationHistory(
    userId: string,
    courseId?: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    try {
      const where: any = { user_id: userId };
      
      if (courseId) {
        where.course_id = courseId;
      }

      const records = await AIChatHistory.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
      });

      // Reverse to get chronological order
      const messages = records.reverse().map((record: any) => ({
        role: record.role,
        content: record.message,
        timestamp: record.created_at,
      }));

      logger.debug(`[AIChatRepository] Loaded ${messages.length} messages for user ${userId}`);

      return messages;
    } catch (error) {
      logger.error('[AIChatRepository] Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(
    userId: string,
    courseId?: string
  ): Promise<void> {
    try {
      const where: any = { user_id: userId };
      
      if (courseId) {
        where.course_id = courseId;
      }

      await AIChatHistory.destroy({ where });

      logger.info(`[AIChatRepository] Cleared conversation history for user ${userId}`);
    } catch (error) {
      logger.error('[AIChatRepository] Error clearing conversation history:', error);
      throw error;
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStatistics(userId: string): Promise<{
    totalMessages: number;
    totalConversations: number;
    averageLatency: number;
    totalTokensUsed: number;
  }> {
    try {
      const { Sequelize } = require('sequelize');
      
      const stats = await AIChatHistory.findOne({
        where: { user_id: userId },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalMessages'],
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('course_id'))), 'totalConversations'],
          [Sequelize.fn('AVG', Sequelize.col('latency')), 'averageLatency'],
          [Sequelize.fn('SUM', Sequelize.col('tokens_used')), 'totalTokensUsed'],
        ],
        raw: true,
      });

      return {
        totalMessages: parseInt(stats?.totalMessages || '0'),
        totalConversations: parseInt(stats?.totalConversations || '0'),
        averageLatency: parseFloat(stats?.averageLatency || '0'),
        totalTokensUsed: parseInt(stats?.totalTokensUsed || '0'),
      };
    } catch (error) {
      logger.error('[AIChatRepository] Error getting chat statistics:', error);
      return {
        totalMessages: 0,
        totalConversations: 0,
        averageLatency: 0,
        totalTokensUsed: 0,
      };
    }
  }
}
