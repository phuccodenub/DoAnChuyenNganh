import { AIService } from '../ai/ai.service';
import logger from '../../utils/logger.util';
import LivestreamPolicy from '../../models/livestream-policy.model';
import CommentModeration from '../../models/comment-moderation.model';
import LiveSessionMessage from '../../models/live-session-message.model';
import User from '../../models/user.model';

export interface ModerationResult {
  approved: boolean;
  riskScore: number; // 0.0 - 1.0
  riskCategories: string[];
  reason?: string;
  shouldBlock: boolean;
  shouldWarn: boolean;
}

export interface CommentModerationOptions {
  sessionId: string;
  messageId?: string;
  userId: string;
  message: string;
  policyId?: string;
}

/**
 * Moderation Service
 * Xử lý moderation cho comments và livestream content
 */
export class ModerationService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Get or create policy for a session
   */
  async getOrCreatePolicy(sessionId: string): Promise<any> {
    let policy = await LivestreamPolicy.findOne({
      where: { session_id: sessionId },
    });

    if (!policy) {
      // Tạo policy mặc định với một số từ khóa cơ bản để catch toxic comments
      policy = await LivestreamPolicy.create({
        session_id: sessionId,
        comment_moderation_enabled: true,
        comment_ai_moderation: true, // Bật AI với model mới gemini-2.5-flash
        comment_manual_moderation: false,
        comment_blocked_keywords: [
          // Basic Vietnamese profanity and toxic words
          'ngu', 'đồ ngu', 'mày ngu', 'con ngu',
          'đồ chó', 'con chó', 'mẹ mày', 'địt',
          'đụ', 'đéo', 'cặc', 'lồn',
        ],
        content_moderation_enabled: true,
        content_ai_moderation: true, // Bật AI với model mới
        auto_block_violations: true,
        auto_warn_violations: true,
        violation_threshold: 3,
      });
    } else {
      // Update existing policy if it doesn't have blocked keywords
      if (!policy.comment_blocked_keywords || policy.comment_blocked_keywords.length === 0) {
        const defaultKeywords = [
          'ngu', 'đồ ngu', 'mày ngu', 'con ngu',
          'đồ chó', 'con chó', 'mẹ mày', 'địt',
          'đụ', 'đéo', 'cặc', 'lồn',
        ];
        await policy.update({
          comment_blocked_keywords: defaultKeywords,
        });
        policy.comment_blocked_keywords = defaultKeywords;
        logger.info(`[ModerationService] Updated policy for session ${sessionId} with default blocked keywords`);
      }
      
      // Không cần tắt AI nữa vì đã có model mới gemini-2.5-flash hỗ trợ
    }

    return policy;
  }

  /**
   * Check if message contains blocked keywords
   */
  private checkBlockedKeywords(
    message: string,
    blockedKeywords: string[]
  ): { found: boolean; keywords: string[] } {
    if (!blockedKeywords || blockedKeywords.length === 0) {
      return { found: false, keywords: [] };
    }

    const lowerMessage = message.toLowerCase();
    const foundKeywords: string[] = [];

    for (const keyword of blockedKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }

    return {
      found: foundKeywords.length > 0,
      keywords: foundKeywords,
    };
  }

  /**
   * AI-based content moderation using Gemini
   */
  private async moderateWithAI(
    content: string,
    contentType: 'comment' | 'livestream'
  ): Promise<ModerationResult> {
    if (!this.aiService.isAvailable()) {
      logger.warn('[ModerationService] AI service not available, skipping AI moderation');
      return {
        approved: true,
        riskScore: 0,
        riskCategories: [],
        shouldBlock: false,
        shouldWarn: false,
      };
    }

    try {
      const systemPrompt = `Bạn là một hệ thống kiểm duyệt nội dung tự động cho nền tảng giáo dục trực tuyến.

Nhiệm vụ của bạn là phân tích nội dung và đánh giá mức độ rủi ro (0.0 - 1.0) và phân loại các vấn đề.

Các loại rủi ro cần phát hiện:
- toxicity: Nội dung độc hại, xúc phạm, kỳ thị
- spam: Spam, quảng cáo không mong muốn
- profanity: Từ ngữ thô tục, không phù hợp
- harassment: Quấy rối, đe dọa
- illegal: Nội dung vi phạm pháp luật
- inappropriate: Nội dung không phù hợp với môi trường giáo dục
- self_harm: Nội dung tự hại
- violence: Bạo lực

Hãy trả lời theo định dạng JSON:
{
  "riskScore": 0.0-1.0,
  "riskCategories": ["category1", "category2"],
  "approved": true/false,
  "reason": "Lý do",
  "shouldBlock": true/false,
  "shouldWarn": true/false
}

Nội dung cần kiểm duyệt (${contentType}):`;

      // Use generateContent directly instead of chat to avoid systemInstruction issues
      // For moderation, we don't need conversation history
      const fullPrompt = `${systemPrompt}\n\n"${content}"\n\nHãy phân tích và trả lời JSON:`;
      
      // Call AI directly using generateContent (not chat)
      const response = await this.aiService.generateContent({
        prompt: fullPrompt,
        options: {
          temperature: 0.1,
          maxTokens: 500,
        },
      });

      // Parse JSON response
      let moderationResult: ModerationResult;
      try {
        // Try to extract JSON from response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          moderationResult = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse entire response
          moderationResult = JSON.parse(response.response);
        }

        // Validate and normalize result
        moderationResult = {
          approved: moderationResult.approved !== false,
          riskScore: Math.max(0, Math.min(1, moderationResult.riskScore || 0)),
          riskCategories: Array.isArray(moderationResult.riskCategories)
            ? moderationResult.riskCategories
            : [],
          reason: moderationResult.reason || undefined,
          shouldBlock: moderationResult.shouldBlock === true,
          shouldWarn: moderationResult.shouldWarn === true,
        };
      } catch (parseError) {
        logger.error('[ModerationService] Failed to parse AI response:', parseError);
        // Fallback: reject if parsing fails to be safe
        moderationResult = {
          approved: false,
          riskScore: 0.6, // Medium-high risk when parsing fails
          riskCategories: ['ai_parse_error'],
          shouldBlock: true, // Block when can't parse AI response
          shouldWarn: true,
          reason: 'Không thể phân tích nội dung. Vui lòng thử lại.',
        };
      }

      return moderationResult;
    } catch (error) {
      logger.error('[ModerationService] AI moderation error:', error);
      // Throw error so caller can handle fallback (keyword filtering)
      // Don't block all comments when AI fails - let keyword filtering handle it
      throw error;
    }
  }

  /**
   * Moderate a comment
   */
  async moderateComment(
    options: CommentModerationOptions
  ): Promise<ModerationResult> {
    const { sessionId, userId, message } = options;

    // Get policy
    const policy = await this.getOrCreatePolicy(sessionId);

    // Check if moderation is enabled
    if (!policy.comment_moderation_enabled) {
      return {
        approved: true,
        riskScore: 0,
        riskCategories: [],
        shouldBlock: false,
        shouldWarn: false,
      };
    }

    // Check message length
    if (
      policy.comment_max_length &&
      message.length > policy.comment_max_length
    ) {
      return {
        approved: false,
        riskScore: 0.3,
        riskCategories: ['length_exceeded'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Comment quá dài (tối đa ${policy.comment_max_length} ký tự)`,
      };
    }

    // Check blocked keywords (PRIORITY 1 - highest)
    const blockedKeywords = policy.comment_blocked_keywords || [];
    const keywordCheck = this.checkBlockedKeywords(message, blockedKeywords);
    
    // Log for debugging
    if (blockedKeywords.length > 0) {
      logger.debug(`[ModerationService] Checking keywords for message: "${message.substring(0, 50)}..."`, {
        blockedKeywords,
        found: keywordCheck.found,
        matchedKeywords: keywordCheck.keywords,
      });
    }
    
    if (keywordCheck.found) {
      logger.warn(`[ModerationService] Comment blocked by keyword filter: ${keywordCheck.keywords.join(', ')}`);
      return {
        approved: false,
        riskScore: 0.8,
        riskCategories: ['blocked_keywords'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Comment chứa từ khóa bị chặn: ${keywordCheck.keywords.join(', ')}`,
      };
    }

    // AI moderation
    let aiResult: ModerationResult | null = null;
    if (policy.comment_ai_moderation) {
      if (this.aiService.isAvailable()) {
        try {
          aiResult = await this.moderateWithAI(message, 'comment');
        } catch (error) {
          // If AI fails, fallback to keyword-only moderation
          logger.warn(`[ModerationService] AI moderation failed, falling back to keyword filtering:`, error);
          aiResult = null; // Will use keyword filtering only
        }
      } else {
        // AI service not available but required - log warning and use keyword filtering only
        logger.warn(`[ModerationService] AI moderation enabled but service not available for session ${sessionId}`);
        aiResult = null; // Will use keyword filtering only
      }
    }

    // Check user violation count
    const userViolations = await CommentModeration.count({
      where: {
        user_id: userId,
        session_id: sessionId,
        status: ['rejected', 'blocked'],
      },
    });

    const shouldBlockUser =
      userViolations >= (policy.violation_threshold || 3);

    // Combine results
    // Priority: 1. Keyword check (highest), 2. User violations, 3. AI result
    const hasAiResult = policy.comment_ai_moderation && aiResult !== null;
    
    // If keyword check found blocked keywords, always reject
    if (keywordCheck.found) {
      return {
        approved: false,
        riskScore: 0.8,
        riskCategories: ['blocked_keywords'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Comment chứa từ khóa bị chặn: ${keywordCheck.keywords.join(', ')}`,
      };
    }
    
    // If user should be blocked, reject
    if (shouldBlockUser) {
      return {
        approved: false,
        riskScore: 0.9,
        riskCategories: ['user_violation_threshold'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Người dùng đã vượt quá ngưỡng vi phạm (${userViolations}/${policy.violation_threshold || 3})`,
      };
    }
    
    // Use AI result if available
    const finalResult: ModerationResult = {
      approved: hasAiResult ? aiResult!.approved : true, // If AI not enabled, approve by default
      riskScore: aiResult?.riskScore || 0,
      riskCategories: aiResult?.riskCategories || [],
      reason: aiResult?.reason,
      shouldBlock: hasAiResult ? (aiResult!.shouldBlock || false) : false,
      shouldWarn: hasAiResult ? (aiResult!.shouldWarn || false) : false,
    };

    // Save moderation record (even if comment is blocked, so host can see it)
    // messageId can be null if comment was blocked before saving
    await CommentModeration.create({
      message_id: options.messageId || null,
      session_id: sessionId,
      user_id: userId,
      message_content: options.message, // Store the message content even if blocked
      status: finalResult.approved
        ? 'approved'
        : finalResult.shouldBlock
        ? 'blocked'
        : 'rejected',
      moderation_reason: finalResult.reason || null,
      ai_checked: policy.comment_ai_moderation && this.aiService.isAvailable(),
      ai_risk_score: aiResult?.riskScore || null,
      ai_risk_categories: finalResult.riskCategories,
      ai_reason: aiResult?.reason || null,
      violation_count: userViolations + (finalResult.shouldBlock ? 1 : 0),
      policy_id: policy.id || null,
    });

    return finalResult;
  }

  /**
   * Moderate livestream content (title, description)
   */
  async moderateLivestreamContent(
    sessionId: string,
    title: string,
    description?: string
  ): Promise<ModerationResult> {
    const policy = await this.getOrCreatePolicy(sessionId);

    if (!policy.content_moderation_enabled) {
      return {
        approved: true,
        riskScore: 0,
        riskCategories: [],
        shouldBlock: false,
        shouldWarn: false,
      };
    }

    const content = `${title} ${description || ''}`.trim();

    // Check blocked keywords
    const keywordCheck = this.checkBlockedKeywords(
      content,
      policy.content_blocked_keywords || []
    );
    if (keywordCheck.found) {
      return {
        approved: false,
        riskScore: 0.8,
        riskCategories: ['blocked_keywords'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Nội dung chứa từ khóa bị chặn: ${keywordCheck.keywords.join(', ')}`,
      };
    }

    // AI moderation
    if (policy.content_ai_moderation && this.aiService.isAvailable()) {
      return await this.moderateWithAI(content, 'livestream');
    }

    return {
      approved: true,
      riskScore: 0,
      riskCategories: [],
      shouldBlock: false,
      shouldWarn: false,
    };
  }

  /**
   * Check if user can send comment (rate limiting)
   */
  async canSendComment(
    sessionId: string,
    userId: string
  ): Promise<{ allowed: boolean; reason?: string; waitSeconds?: number }> {
    const policy = await this.getOrCreatePolicy(sessionId);

    if (!policy.comment_min_interval_seconds) {
      return { allowed: true };
    }

    const lastMessage = await LiveSessionMessage.findOne({
      where: {
        session_id: sessionId,
        sender_id: userId,
      },
      order: [['created_at', 'DESC']],
    });

    if (!lastMessage) {
      return { allowed: true };
    }

    const now = new Date();
    // Use created_at which is the correct field name from the model
    const lastMessageTime = new Date(lastMessage.created_at);
    const diffSeconds = (now.getTime() - lastMessageTime.getTime()) / 1000;

    if (diffSeconds < policy.comment_min_interval_seconds) {
      const waitSeconds = Math.ceil(
        policy.comment_min_interval_seconds - diffSeconds
      );
      return {
        allowed: false,
        reason: `Vui lòng đợi ${waitSeconds} giây trước khi gửi comment tiếp theo`,
        waitSeconds,
      };
    }

    return { allowed: true };
  }

  /**
   * Unban a user by resetting their violation count
   */
  async unbanUser(sessionId: string, userId: string): Promise<void> {
    // Reset violation_count to 0 for all moderation records of this user in this session
    // This ensures that the user can comment again
    await CommentModeration.update(
      {
        violation_count: 0,
      },
      {
        where: {
          session_id: sessionId,
          user_id: userId,
        },
      }
    );

    // Also update blocked/rejected records to approved status
    await CommentModeration.update(
      {
        status: 'approved',
        moderation_reason: 'Đã được unban bởi host',
        moderated_at: new Date(),
      },
      {
        where: {
          session_id: sessionId,
          user_id: userId,
          status: ['blocked', 'rejected'],
        },
      }
    );

    logger.info(`[ModerationService] User ${userId} unbanned in session ${sessionId}`);
  }
}

