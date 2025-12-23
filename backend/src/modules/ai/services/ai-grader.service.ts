/**
 * AI Grader Service
 * Chấm điểm tự động cho code và essay
 */

import crypto from 'crypto';
import logger from '../../../utils/logger.util';
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';
import { AICacheService } from './ai-cache.service';
import env from '../../../config/env.config';

// ============ INTERFACES ============

export interface RubricItem {
  name: string;
  description: string;
  points: number;
}

export interface CodeGradingRequest {
  submissionId: string;
  assignmentId: string;
  code: string;
  language: string;
  rubric: RubricItem[];
  courseId: string;
  userId: string;
}

export interface EssayGradingRequest {
  submissionId: string;
  assignmentId: string;
  essay: string;
  topic: string;
  rubric: RubricItem[];
  courseId: string;
  userId: string;
}

export interface GradingBreakdownItem {
  criterion: string;
  achieved: number;
  max: number;
  comment: string;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
}

export interface CodeGradingResult {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: GradingBreakdownItem[];
  feedback: string;
  suggestions: string[];
  codeIssues: CodeIssue[];
  metadata: {
    gradedAt: Date;
    model: string;
    processingTime: number;
    gradedBy: 'ai' | 'teacher';
  };
}

export interface EssayComment {
  section: string;
  text: string;
  type: 'positive' | 'constructive';
}

export interface EssayGradingResult {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: GradingBreakdownItem[];
  feedback: string;
  strengths: string[];
  improvements: string[];
  comments: EssayComment[];
  metadata: {
    gradedAt: Date;
    model: string;
    processingTime: number;
    gradedBy: 'ai' | 'teacher';
  };
}

export class AIGraderService {
  private proxypalQwen: ProxyPalProvider;
  private googleFlash: GoogleAIProvider;
  private cacheService: AICacheService;

  constructor() {
    // Qwen Coder cho code grading
    this.proxypalQwen = new ProxyPalProvider({
      baseUrl: env.ai.proxypal?.baseUrl || 'http://127.0.0.1:8317',
      apiKey: env.ai.proxypal?.apiKey || 'proxypal-local',
      model: 'qwen3-coder-plus',
      temperature: 0.3, // Low for consistency
      maxTokens: 8192,
      timeout: 90000,
    });

    // Google Flash cho essay grading
    this.googleFlash = new GoogleAIProvider({
      apiKey: env.ai.gemini.apiKeys[0],
      model: env.ai.gemini.models.flash3,
      temperature: 0.5,
      maxTokens: 8192,
      timeout: 60000,
    });

    this.cacheService = new AICacheService();
  }

  // ============ CODE GRADING ============

  /**
   * Chấm điểm bài code
   */
  async gradeCode(request: CodeGradingRequest): Promise<CodeGradingResult> {
    const startTime = Date.now();
    logger.info(`[AIGrader] Starting code grading for submission ${request.submissionId}`);

    // Check cache
    const cacheKey = this.generateCacheKey('code', request);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[AIGrader] Returning cached code grading result');
      return JSON.parse(cached);
    }

    try {
      const prompt = this.buildCodeGradingPrompt(request);

      let response;
      let modelUsed = 'google-flash';

      // Prefer Qwen Coder if available
      if (this.proxypalQwen.isAvailable()) {
        response = await this.proxypalQwen.generateContent({
          prompt,
          temperature: 0.3,
          maxTokens: 8192,
        });
        modelUsed = 'qwen3-coder-plus';
        logger.info('[AIGrader] Using Qwen Coder Plus for code grading');
      } else {
        // Fallback to Google Flash
        response = await this.googleFlash.generateContent({
          prompt,
          temperature: 0.3,
          maxTokens: 8192,
        });
        logger.warn('[AIGrader] Qwen Coder unavailable, using Google Flash fallback');
      }

      const parsed = this.parseCodeGradingResponse(response.text);
      const processingTime = Date.now() - startTime;

      const result: CodeGradingResult = {
        submissionId: request.submissionId,
        score: parsed.score,
        maxScore: parsed.maxScore,
        percentage: parsed.maxScore > 0 ? Math.round((parsed.score / parsed.maxScore) * 100) : 0,
        breakdown: parsed.breakdown,
        feedback: parsed.feedback,
        suggestions: parsed.suggestions || [],
        codeIssues: parsed.codeIssues || [],
        metadata: {
          gradedAt: new Date(),
          model: modelUsed,
          processingTime,
          gradedBy: 'ai',
        },
      };

      // Cache for 24 hours (grades don't change often)
      await this.cacheService.set(cacheKey, JSON.stringify(result), 24 * 60 * 60);

      logger.info(
        `[AIGrader] Code grading completed: ${result.score}/${result.maxScore} (${result.percentage}%) in ${processingTime}ms`
      );

      return result;
    } catch (error) {
      logger.error('[AIGrader] Code grading failed:', error);
      throw new Error(`Không thể chấm điểm code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build prompt cho code grading
   */
  private buildCodeGradingPrompt(request: CodeGradingRequest): string {
    const rubricText = request.rubric
      .map((r) => `- ${r.name} (${r.points} điểm): ${r.description}`)
      .join('\n');

    return `Bạn là một lập trình viên kỳ cựu và giáo viên. Hãy chấm điểm bài code sau theo rubric.

**RUBRIC CHẤM ĐIỂM:**
${rubricText}

**TỔNG ĐIỂM TỐI ĐA:** ${request.rubric.reduce((sum, r) => sum + r.points, 0)}

**BÀI CODE (${request.language}):**
\`\`\`${request.language}
${request.code}
\`\`\`

**HƯỚNG DẪN CHẤM ĐIỂM:**
1. **Correctness (Tính đúng đắn):** Code có chạy đúng và cho output đúng không?
2. **Code Quality (Chất lượng):**
   - Dễ đọc và maintain
   - Tên biến/hàm có ý nghĩa
   - Comment đầy đủ
3. **Performance (Hiệu năng):**
   - Time complexity hợp lý
   - Space complexity tối ưu
4. **Security (Bảo mật):**
   - Input validation
   - Error handling
   - Không có lỗ hổng bảo mật
5. **Requirements (Yêu cầu):**
   - Đáp ứng đủ requirements
   - Có đầy đủ tính năng

**OUTPUT FORMAT (JSON nghiêm ngặt):**
{
  "score": 85,
  "maxScore": 100,
  "breakdown": [
    {
      "criterion": "Correctness",
      "achieved": 25,
      "max": 30,
      "comment": "Code chạy đúng nhưng thiếu xử lý 1 edge case"
    },
    {
      "criterion": "Code Quality",
      "achieved": 18,
      "max": 20,
      "comment": "Code sạch, tên biến rõ ràng"
    }
  ],
  "feedback": "Code chất lượng tốt tổng thể. Cần cải thiện xử lý edge cases và thêm validation.",
  "suggestions": [
    "Thêm input validation trước khi xử lý dữ liệu",
    "Tách logic phức tạp ra các hàm riêng",
    "Xử lý edge case khi array rỗng"
  ],
  "codeIssues": [
    {
      "type": "warning",
      "message": "Biến 'temp' được khai báo nhưng không sử dụng",
      "line": 15
    },
    {
      "type": "error",
      "message": "Thiếu return statement trong trường hợp n = 0",
      "line": 23
    }
  ]
}

Hãy chấm điểm chi tiết, công bằng và xây dựng. Chỉ trả về JSON, không có text giải thích:`;
  }

  /**
   * Parse code grading response
   */
  private parseCodeGradingResponse(text: string): any {
    try {
      // Extract JSON from response
      let jsonText = text.trim();

      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonText);

      // Validate required fields (allow score=0)
      if (
        typeof parsed.score !== 'number' ||
        typeof parsed.maxScore !== 'number' ||
        !Array.isArray(parsed.breakdown) ||
        typeof parsed.feedback !== 'string'
      ) {
        throw new Error('Missing or invalid required fields in grading response');
      }

      // Validate score range
      if (parsed.score < 0 || parsed.score > parsed.maxScore) {
        throw new Error(`Invalid score: ${parsed.score} (max: ${parsed.maxScore})`);
      }

      return parsed;
    } catch (error) {
      logger.error('[AIGrader] Failed to parse code grading response:', error);
      logger.error('[AIGrader] Response text:', text.substring(0, 500));
      throw new Error('Không thể parse kết quả chấm điểm từ AI');
    }
  }

  // ============ ESSAY GRADING ============

  /**
   * Chấm điểm bài luận
   */
  async gradeEssay(request: EssayGradingRequest): Promise<EssayGradingResult> {
    const startTime = Date.now();
    logger.info(`[AIGrader] Starting essay grading for submission ${request.submissionId}`);

    // Check cache
    const cacheKey = this.generateCacheKey('essay', request);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[AIGrader] Returning cached essay grading result');
      return JSON.parse(cached);
    }

    try {
      const prompt = this.buildEssayGradingPrompt(request);

      const response = await this.googleFlash.generateContent({
        prompt,
        temperature: 0.5, // Balance between consistency and flexibility
        maxTokens: 8192,
      });

      const parsed = this.parseEssayGradingResponse(response.text);
      const processingTime = Date.now() - startTime;

      const result: EssayGradingResult = {
        submissionId: request.submissionId,
        score: parsed.score,
        maxScore: parsed.maxScore,
        percentage: parsed.maxScore > 0 ? Math.round((parsed.score / parsed.maxScore) * 100) : 0,
        breakdown: parsed.breakdown,
        feedback: parsed.feedback,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        comments: parsed.comments || [],
        metadata: {
          gradedAt: new Date(),
          model: env.ai.gemini.models.flash3,
          processingTime,
          gradedBy: 'ai',
        },
      };

      // Cache for 24 hours
      await this.cacheService.set(cacheKey, JSON.stringify(result), 24 * 60 * 60);

      logger.info(
        `[AIGrader] Essay grading completed: ${result.score}/${result.maxScore} (${result.percentage}%) in ${processingTime}ms`
      );

      return result;
    } catch (error) {
      logger.error('[AIGrader] Essay grading failed:', error);
      throw new Error(`Không thể chấm điểm bài luận: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build prompt cho essay grading
   */
  private buildEssayGradingPrompt(request: EssayGradingRequest): string {
    const rubricText = request.rubric
      .map((r) => `- ${r.name} (${r.points} điểm): ${r.description}`)
      .join('\n');

    return `Bạn là một giáo viên ngôn ngữ và writing coach kinh nghiệm. Hãy chấm điểm bài luận sau.

**CHỦ ĐỀ:** ${request.topic}

**RUBRIC CHẤM ĐIỂM:**
${rubricText}

**TỔNG ĐIỂM TỐI ĐA:** ${request.rubric.reduce((sum, r) => sum + r.points, 0)}

**BÀI LUẬN:**
${request.essay}

**TIÊU CHÍ ĐÁNH GIÁ:**
1. **Content (Nội dung):** Ý tưởng rõ ràng, lập luận logic, có bằng chứng
2. **Organization (Cấu trúc):** Có intro, body, conclusion; luồng ý mạch lạc
3. **Clarity (Rõ ràng):** Câu văn dễ hiểu, từ vựng phù hợp
4. **Grammar (Ngữ pháp):** Ít lỗi chính tả, ngữ pháp, dấu câu
5. **Relevance (Liên quan):** Nội dung đúng chủ đề, không lạc đề

**OUTPUT FORMAT (JSON nghiêm ngặt):**
{
  "score": 82,
  "maxScore": 100,
  "breakdown": [
    {
      "criterion": "Content",
      "achieved": 20,
      "max": 25,
      "comment": "Ý tưởng tốt nhưng cần lập luận sâu hơn với nhiều bằng chứng"
    },
    {
      "criterion": "Organization",
      "achieved": 18,
      "max": 20,
      "comment": "Cấu trúc rõ ràng, có intro và conclusion tốt"
    }
  ],
  "feedback": "Bài viết có nền tảng tốt với ý tưởng rõ ràng. Cần phát triển lập luận chi tiết hơn và cải thiện một số lỗi ngữ pháp nhỏ.",
  "strengths": [
    "Ý tưởng chủ đề rõ ràng và hấp dẫn",
    "Có nhiều ví dụ minh họa cụ thể",
    "Cấu trúc văn bản mạch lạc"
  ],
  "improvements": [
    "Thêm đoạn kết luận mạnh mẽ hơn với call-to-action",
    "Phát triển ý tưởng ở đoạn 2 chi tiết hơn",
    "Sửa một số lỗi ngữ pháp nhỏ (xem comments)"
  ],
  "comments": [
    {
      "section": "Đoạn 2",
      "text": "Ý tưởng tốt nhưng cần thêm ít nhất 1-2 ví dụ cụ thể để hỗ trợ lập luận",
      "type": "constructive"
    },
    {
      "section": "Introduction",
      "text": "Mở bài thu hút, hook reader tốt",
      "type": "positive"
    }
  ]
}

Hãy chấm điểm công bằng, xây dựng và khích lệ học sinh. Chỉ trả về JSON, không có text giải thích:`;
  }

  /**
   * Parse essay grading response
   */
  private parseEssayGradingResponse(text: string): any {
    try {
      let jsonText = text.trim();

      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonText);

      // Validate required fields (allow score=0)
      if (
        typeof parsed.score !== 'number' ||
        typeof parsed.maxScore !== 'number' ||
        !Array.isArray(parsed.breakdown) ||
        typeof parsed.feedback !== 'string'
      ) {
        throw new Error('Missing or invalid required fields in grading response');
      }

      // Validate score range
      if (parsed.score < 0 || parsed.score > parsed.maxScore) {
        throw new Error(`Invalid score: ${parsed.score} (max: ${parsed.maxScore})`);
      }

      return parsed;
    } catch (error) {
      logger.error('[AIGrader] Failed to parse essay grading response:', error);
      logger.error('[AIGrader] Response text:', text.substring(0, 500));
      throw new Error('Không thể parse kết quả chấm điểm từ AI');
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Generate cache key
   * Hash full content + metadata để tránh collision
   */
  private generateCacheKey(type: 'code' | 'essay', request: any): string {
    const content = type === 'code' ? request.code : request.essay;
    
    // Hash FULL content + metadata
    const key = {
      type,
      contentHash: crypto.createHash('sha256').update(content).digest('hex'),
      contentLength: content.length,
      assignmentId: request.assignmentId,
      rubricHash: crypto.createHash('sha256').update(JSON.stringify(request.rubric)).digest('hex'),
    };

    const hash = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');

    return `ai:grader:${type}:${hash.substring(0, 20)}`;
  }
}
