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
  /**
   * Remove Vietnamese accents for better keyword matching
   */
  private removeAccents(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private checkBlockedKeywords(
    message: string,
    blockedKeywords: string[]
  ): { found: boolean; keywords: string[] } {
    if (!blockedKeywords || blockedKeywords.length === 0) {
      return { found: false, keywords: [] };
    }

    const lowerMessage = message.toLowerCase();
    const normalizedMessage = this.removeAccents(message);
    const foundKeywords: string[] = [];

    for (const keyword of blockedKeywords) {
      const lowerKeyword = keyword.toLowerCase();
      const normalizedKeyword = this.removeAccents(keyword);
      
      // Check both original and normalized versions to catch variants with/without accents
      if (lowerMessage.includes(lowerKeyword) || normalizedMessage.includes(normalizedKeyword)) {
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

QUAN TRỌNG - PHÁT HIỆN TỪ NGỮ THÔ TỤC VÀ NỘI DUNG KHÔNG PHÙ HỢP:
Bạn PHẢI phát hiện CẢ các biến thể, viết tắt, và cách né tránh của từ ngữ thô tục:
- Viết tắt: "clmm", "cac", "lon", "dit", "deo", "cak" = các từ thô tục
- Biến thể không dấu: "lon" = "lồn", "cac" = "cặc", "deo" = "đéo", "dit" = "địt", "dam" = "dâm"
- Thay thế ký tự: "đéo" = "deo", "cặc" = "cac" hoặc "cak"
- Kết hợp: "cac lon", "clmm", "dâm vậy", "damquaem", "dam qua em" = các từ thô tục kết hợp
- Từ liên quan đến tình dục: "dâm", "dam", "damquaem", "dam qua em", "dâm dục", "sex", "xxx" = nội dung không phù hợp

Các loại rủi ro cần phát hiện:
- toxicity: Nội dung độc hại, xúc phạm, kỳ thị
- spam: Spam, quảng cáo không mong muốn
- profanity: Từ ngữ thô tục, không phù hợp (bao gồm cả viết tắt và biến thể)
- harassment: Quấy rối, đe dọa
- illegal: Nội dung vi phạm pháp luật
- inappropriate: Nội dung không phù hợp với môi trường giáo dục (QUAN TRỌNG: bao gồm nội dung tình dục, khiêu dâm)
- self_harm: Nội dung tự hại
- violence: Bạo lực

QUY TẮC PHÁT HIỆN NGHIÊM NGẶT:
- Nếu phát hiện bất kỳ từ ngữ thô tục, viết tắt, biến thể, hoặc nội dung tình dục → shouldBlock = true, approved = false
- Risk score >= 0.8 nếu có từ ngữ thô tục rõ ràng hoặc nội dung tình dục
- Risk score >= 0.6 nếu có nghi ngờ nhưng không chắc chắn
- Risk score >= 0.4 nếu có dấu hiệu không phù hợp với môi trường giáo dục

VÍ DỤ CẦN CHẶN:
- "dâm vậy" → inappropriate, profanity, riskScore >= 0.8, shouldBlock = true
- "damquaem" → inappropriate, profanity, riskScore >= 0.8, shouldBlock = true
- "dam qua em" → inappropriate, profanity, riskScore >= 0.8, shouldBlock = true
- "clmm" → profanity, riskScore >= 0.8, shouldBlock = true
- "cac lon" → profanity, riskScore >= 0.9, shouldBlock = true

Hãy trả lời CHỈ JSON, không có text khác:
{
  "riskScore": 0.0-1.0,
  "riskCategories": ["category1", "category2"],
  "approved": true/false,
  "reason": "Lý do cụ thể",
  "shouldBlock": true/false,
  "shouldWarn": true/false
}

Nội dung cần kiểm duyệt (${contentType}):`;

      // Use generateContent directly instead of chat to avoid systemInstruction issues
      // For moderation, we don't need conversation history
      const fullPrompt = `${systemPrompt}\n\n"${content}"\n\nHãy phân tích kỹ lưỡng và trả lời CHỈ JSON, không có text khác:`;
      
      logger.debug(`[ModerationService] Calling AI with prompt length: ${fullPrompt.length}`);
      
      // Call AI directly using generateContent (not chat)
      const response = await this.aiService.generateContent({
        prompt: fullPrompt,
        options: {
          temperature: 0.1, // Low temperature for consistent moderation
          maxTokens: 500,
        },
      });

      logger.debug(`[ModerationService] AI response received: ${response.response?.substring(0, 200)}...`);

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
        // Nếu riskScore cao (>0.6) hoặc có profanity/toxicity/inappropriate category → nên block
        const riskScore = Math.max(0, Math.min(1, moderationResult.riskScore || 0));
        const hasHighRisk = riskScore >= 0.6;
        const hasProfanity = Array.isArray(moderationResult.riskCategories) && 
          moderationResult.riskCategories.some(cat => {
            const lowerCat = cat.toLowerCase();
            return lowerCat.includes('profanity') || 
                   lowerCat.includes('toxicity') ||
                   lowerCat.includes('inappropriate') ||
                   lowerCat.includes('harassment');
          });
        
        // Log parsed result for debugging
        logger.debug(`[ModerationService] AI parsed result:`, {
          originalApproved: moderationResult.approved,
          originalShouldBlock: moderationResult.shouldBlock,
          riskScore,
          riskCategories: moderationResult.riskCategories,
          hasHighRisk,
          hasProfanity,
        });
        
        moderationResult = {
          approved: moderationResult.approved !== false && !hasHighRisk && !hasProfanity && moderationResult.shouldBlock !== true,
          riskScore,
          riskCategories: Array.isArray(moderationResult.riskCategories)
            ? moderationResult.riskCategories
            : [],
          reason: moderationResult.reason || undefined,
          shouldBlock: moderationResult.shouldBlock === true || hasHighRisk || hasProfanity,
          shouldWarn: moderationResult.shouldWarn === true || riskScore >= 0.4,
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
   * Moderate course review content
   * Similar to comment moderation but without session-specific policy
   */
  async moderateReview(
    comment: string,
    userId: string
  ): Promise<ModerationResult> {
    if (!comment || comment.trim().length === 0) {
      return {
        approved: true,
        riskScore: 0,
        riskCategories: [],
        shouldBlock: false,
        shouldWarn: false,
      };
    }

    // Default blocked keywords for reviews (bao gồm cả biến thể không dấu)
    const defaultBlockedKeywords = [
      // Từ ngữ thô tục - có dấu và không dấu
      'ngu', 'đồ ngu', 'mày ngu', 'con ngu',
      'đồ chó', 'con chó', 'mẹ mày',
      'địt', 'dit', 'djt', // Biến thể của "địt"
      'đụ', 'dụ', // Biến thể của "đụ"
      'đéo', 'déo', // Biến thể của "đéo"
      'cặc', 'cac', 'cak', // Biến thể của "cặc"
      'lồn', 'lon', // Biến thể của "lồn"
      'clmm', 'clm', // Viết tắt của từ thô tục
      'dâm', 'dam', // Từ liên quan đến tình dục
      'damquaem', 'dam qua em', // Biến thể của từ thô tục
      'scam', 'lừa đảo', 'fake', 'giả',
      // Thêm các từ tiếng Anh phổ biến
      'fuck', 'shit', 'damn', 'bitch',
    ];

    // Check message length (max 2000 characters for reviews)
    const maxLength = 2000;
    if (comment.length > maxLength) {
      return {
        approved: false,
        riskScore: 0.3,
        riskCategories: ['length_exceeded'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Đánh giá quá dài (tối đa ${maxLength} ký tự)`,
      };
    }

    // AI moderation (PRIORITY 1 - highest) - ưu tiên AI vì phát hiện tốt hơn
    let aiResult: ModerationResult | null = null;
    if (this.aiService.isAvailable()) {
      try {
        logger.info(`[ModerationService] Starting AI moderation for review comment: "${comment.substring(0, 50)}..."`);
        aiResult = await this.moderateWithAI(comment, 'comment');
        logger.info(`[ModerationService] AI moderation completed for review`, {
          approved: aiResult.approved,
          riskScore: aiResult.riskScore,
          riskCategories: aiResult.riskCategories,
          shouldBlock: aiResult.shouldBlock,
          reason: aiResult.reason,
        });
      } catch (error) {
        // If AI fails, fallback to keyword filtering
        logger.error(`[ModerationService] AI moderation failed for review, falling back to keyword filtering:`, error);
        aiResult = null;
      }
    } else {
      logger.warn(`[ModerationService] AI service not available for review moderation - using keyword filtering only`);
    }

    // If AI detected issues and should block, use AI result (PRIORITY 1)
    if (aiResult && (!aiResult.approved || aiResult.shouldBlock)) {
      logger.warn(`[ModerationService] Review blocked by AI moderation`, {
        riskScore: aiResult.riskScore,
        riskCategories: aiResult.riskCategories,
        reason: aiResult.reason,
      });
      return aiResult;
    }

    // Keyword check (PRIORITY 2 - fallback/bổ sung cho AI)
    // Chỉ check keyword nếu AI không available hoặc AI approved nhưng có thể bổ sung
    const keywordCheck = this.checkBlockedKeywords(comment, defaultBlockedKeywords);
    
    // Nếu AI không available, dùng keyword check
    if (!aiResult && keywordCheck.found) {
      logger.warn(`[ModerationService] Review blocked by keyword filter (AI not available): ${keywordCheck.keywords.join(', ')}`);
      return {
        approved: false,
        riskScore: 0.8,
        riskCategories: ['blocked_keywords'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Đánh giá chứa từ khóa không phù hợp: ${keywordCheck.keywords.join(', ')}`,
      };
    }

    // Nếu AI approved nhưng keyword check cũng tìm thấy vấn đề, kết hợp kết quả
    if (aiResult && aiResult.approved && keywordCheck.found) {
      // AI approved nhưng keyword check tìm thấy vấn đề - nâng risk score
      logger.warn(`[ModerationService] Review approved by AI but contains blocked keywords: ${keywordCheck.keywords.join(', ')}`);
      return {
        approved: false, // Block vì keyword check tìm thấy vấn đề
        riskScore: Math.max(aiResult.riskScore, 0.8), // Lấy risk score cao hơn
        riskCategories: [...aiResult.riskCategories, 'blocked_keywords'],
        shouldBlock: true,
        shouldWarn: true,
        reason: `Đánh giá chứa từ khóa không phù hợp: ${keywordCheck.keywords.join(', ')}`,
      };
    }

    // If AI approved and no keyword issues, approve
    // But still log if AI detected potential issues (shouldWarn)
    if (aiResult && aiResult.shouldWarn) {
      logger.info(`[ModerationService] Review approved with AI warning`, {
        riskScore: aiResult.riskScore,
        riskCategories: aiResult.riskCategories,
      });
    }

    return {
      approved: true,
      riskScore: aiResult?.riskScore || 0,
      riskCategories: aiResult?.riskCategories || [],
      shouldBlock: false,
      shouldWarn: aiResult?.shouldWarn || false,
      reason: aiResult?.reason,
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

