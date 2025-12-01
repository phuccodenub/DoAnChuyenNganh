import { Request, Response, NextFunction } from 'express';
import { ModerationService } from './moderation.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';

export class ModerationController {
  private moderationService: ModerationService;

  constructor() {
    this.moderationService = new ModerationService();
  }

  /**
   * Get policy for a session
   */
  getPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const policy = await this.moderationService.getOrCreatePolicy(sessionId);
      return responseUtils.success(res, policy, 'Policy retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Update policy for a session
   */
  updatePolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      // Verify user is host of the session
      // TODO: Add session ownership check

      const policy = await this.moderationService.getOrCreatePolicy(sessionId);

      // Update policy fields
      const updates: any = {};
      if (req.body.comment_moderation_enabled !== undefined) {
        updates.comment_moderation_enabled = req.body.comment_moderation_enabled;
      }
      if (req.body.comment_ai_moderation !== undefined) {
        updates.comment_ai_moderation = req.body.comment_ai_moderation;
      }
      if (req.body.comment_manual_moderation !== undefined) {
        updates.comment_manual_moderation = req.body.comment_manual_moderation;
      }
      if (req.body.comment_blocked_keywords !== undefined) {
        updates.comment_blocked_keywords = req.body.comment_blocked_keywords;
      }
      if (req.body.comment_max_length !== undefined) {
        updates.comment_max_length = req.body.comment_max_length;
      }
      if (req.body.comment_min_interval_seconds !== undefined) {
        updates.comment_min_interval_seconds = req.body.comment_min_interval_seconds;
      }
      if (req.body.content_moderation_enabled !== undefined) {
        updates.content_moderation_enabled = req.body.content_moderation_enabled;
      }
      if (req.body.content_ai_moderation !== undefined) {
        updates.content_ai_moderation = req.body.content_ai_moderation;
      }
      if (req.body.content_blocked_keywords !== undefined) {
        updates.content_blocked_keywords = req.body.content_blocked_keywords;
      }
      if (req.body.auto_block_violations !== undefined) {
        updates.auto_block_violations = req.body.auto_block_violations;
      }
      if (req.body.auto_warn_violations !== undefined) {
        updates.auto_warn_violations = req.body.auto_warn_violations;
      }
      if (req.body.violation_threshold !== undefined) {
        updates.violation_threshold = req.body.violation_threshold;
      }

      await policy.update(updates);

      return responseUtils.success(res, policy, 'Policy updated successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get moderation history for a session
   */
  getModerationHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const { page = 1, limit = 50, status } = req.query;

      const CommentModeration = (await import('../../models/comment-moderation.model')).default;
      const User = (await import('../../models/user.model')).default;
      const LiveSessionMessage = (await import('../../models/live-session-message.model')).default;
      
      const where: any = { session_id: sessionId };
      if (status && status !== 'all') {
        where.status = status;
      }

      // Get total count
      const total = await CommentModeration.count({ where });

      // Get moderations with pagination
      const moderations = await CommentModeration.findAll({
        where,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
            required: false,
          },
          { 
            model: LiveSessionMessage, 
            as: 'message',
            attributes: ['id', 'message', 'created_at'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      });

      // Serialize data for frontend
      const serializedData = moderations.map((mod: any) => {
        const user = mod.user || {};
        const userName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.email || 'Unknown User';
        
        return {
          id: mod.id,
          session_id: mod.session_id,
          message_id: mod.message_id,
          user_id: mod.user_id,
          sender_name: userName,
          sender_avatar: user.avatar || null,
          message_content: mod.message_content || mod.message?.message || 'N/A',
          status: mod.status,
          moderation_reason: mod.moderation_reason || null,
          ai_checked: mod.ai_checked || false,
          ai_risk_score: mod.ai_risk_score ? parseFloat(mod.ai_risk_score) : null,
          ai_risk_categories: mod.ai_risk_categories || [],
          ai_reason: mod.ai_reason || null,
          moderated_by: mod.moderated_by || null,
          violation_count: mod.violation_count || 0,
          created_at: mod.created_at || mod.createdAt,
          updated_at: mod.updated_at || mod.updatedAt,
        };
      });

      return responseUtils.success(res, {
        data: serializedData,
        total,
        page: Number(page),
        limit: Number(limit),
      }, 'Moderation history retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Manually moderate a comment (approve/reject)
   */
  moderateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const { action, reason } = req.body; // action: 'approve' | 'reject' | 'block'
      const moderatorId = req.user!.userId;

      const CommentModeration = (await import('../../models/comment-moderation.model')).default;
      const moderation = await CommentModeration.findOne({
        where: { message_id: messageId },
      });

      if (!moderation) {
        return responseUtils.error(res, 'Moderation record not found', 404);
      }

      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        block: 'blocked',
      };

      await moderation.update({
        status: statusMap[action] || 'approved',
        moderated_by: moderatorId,
        moderation_reason: reason,
        moderated_at: new Date(),
      });

      return responseUtils.success(res, moderation, 'Comment moderated successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Unban a user (reset violation count)
   */
  unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, userId } = req.params;
      const moderatorId = req.user!.userId;

      await this.moderationService.unbanUser(sessionId, userId);

      return responseUtils.success(res, { 
        sessionId, 
        userId,
        unbannedBy: moderatorId,
        unbannedAt: new Date().toISOString(),
      }, 'User unbanned successfully');
    } catch (error: unknown) {
      next(error);
    }
  };
}

