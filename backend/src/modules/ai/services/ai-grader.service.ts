/**
 * AI Grader Service
 * Chấm điểm tự động cho code và essay
 */

import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import ExcelJS from 'exceljs';
import mammoth from 'mammoth';
import logger from '../../../utils/logger.util';
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';
import { AICacheService } from './ai-cache.service';
import env from '../../../config/env.config';
import { parseJsonFromLlmText } from '../../../utils/llm-json.util';


// ============ INTERFACES ============

export interface RubricItem {
  name: string;
  description: string;
  points: number;
}

export interface CourseLessonContext {
  courseTitle?: string;
  courseDescription?: string;
  courseOutline?: string;
  lessonTitle?: string;
  lessonDescription?: string;
  lessonContent?: string;
  lessonMaterials?: Array<{ name: string; type?: string; size?: number; url?: string }>;
  lessonSummary?: string;
  lessonKeyConcepts?: string[];
  lessonDifficulty?: string;
}

export interface CodeGradingRequest {
  submissionId: string;
  assignmentId: string;
  code: string;
  language: string;
  rubric: RubricItem[];
  courseId: string;
  userId: string;
  context?: CourseLessonContext;
}

export interface EssayGradingRequest {
  submissionId: string;
  assignmentId: string;
  essay: string;
  topic: string;
  rubric: RubricItem[];
  courseId: string;
  userId: string;
  context?: CourseLessonContext;
}

export interface AssignmentGradingRequest {
  submissionId: string;
  assignmentId: string;
  submissionText?: string;
  fileUrls?: string[];
  rubric: RubricItem[];
  courseId: string;
  userId: string;
  submissionType?: 'text' | 'file' | 'both';
  assignmentTitle?: string;
  assignmentInstructions?: string;
  context?: CourseLessonContext;
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
      const prompt = this.buildCodeGradingPrompt(request, request.context);


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
  private buildCodeGradingPrompt(request: CodeGradingRequest, context?: CourseLessonContext): string {
    const rubricText = request.rubric
      .map((r) => `- ${r.name} (${r.points} điểm): ${r.description}`)
      .join('\n');

    const contextText = this.buildContextText(context);

    return `Bạn là một lập trình viên kỳ cựu và giáo viên. Hãy chấm điểm bài code sau theo rubric.

${contextText}

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
      const parsed = parseJsonFromLlmText<any>(text, { required: true });

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
      const prompt = this.buildEssayGradingPrompt(request, request.context);


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
  private buildEssayGradingPrompt(request: EssayGradingRequest, context?: CourseLessonContext): string {
    const rubricText = request.rubric
      .map((r) => `- ${r.name} (${r.points} điểm): ${r.description}`)
      .join('\n');

    const contextText = this.buildContextText(context);

    return `Bạn là một giáo viên ngôn ngữ và writing coach kinh nghiệm. Hãy chấm điểm bài luận sau.

${contextText}

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
      const parsed = parseJsonFromLlmText<any>(text, { required: true });

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

  // ============ ASSIGNMENT GRADING (TEXT/FILE/BOTH) ============

  async gradeAssignment(request: AssignmentGradingRequest): Promise<EssayGradingResult> {
    const startTime = Date.now();
    logger.info(`[AIGrader] Starting assignment grading for submission ${request.submissionId}`);

    const cacheKey = this.generateCacheKey('assignment', request);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[AIGrader] Returning cached assignment grading result');
      return JSON.parse(cached);
    }

    try {
      const submissionText = (request.submissionText || '').trim();
      const fileUrls = Array.isArray(request.fileUrls) ? request.fileUrls : [];

      const fileContext = await this.buildFileContext(fileUrls);
      const prompt = this.buildAssignmentGradingPrompt(request, submissionText, fileContext);

      const response = await this.googleFlash.generateContent({
        prompt,
        temperature: 0.5,
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

      await this.cacheService.set(cacheKey, JSON.stringify(result), 24 * 60 * 60);

      logger.info(
        `[AIGrader] Assignment grading completed: ${result.score}/${result.maxScore} (${result.percentage}%) in ${processingTime}ms`
      );

      return result;
    } catch (error) {
      logger.error('[AIGrader] Assignment grading failed:', error);
      throw new Error(`Không thể chấm điểm assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAssignmentGradingPrompt(
    request: AssignmentGradingRequest,
    submissionText: string,
    fileContext: string
  ): string {
    const rubricText = request.rubric
      .map((r) => `- ${r.name} (${r.points} điểm): ${r.description}`)
      .join('\n');

    const contextText = this.buildContextText(request.context);
    const maxScore = request.rubric.reduce((sum, r) => sum + r.points, 0);
    const submissionLabel = request.submissionType || (submissionText && fileContext ? 'both' : submissionText ? 'text' : 'file');
    const assignmentTitle = request.assignmentTitle ? `**BÀI TẬP:** ${request.assignmentTitle}\n` : '';
    const assignmentInstructions = request.assignmentInstructions
      ? `**HƯỚNG DẪN/ĐỀ BÀI:**\n${request.assignmentInstructions}\n\n`
      : '';

    const submissionSections = [
      submissionText ? `**NỘI DUNG TEXT:**\n${submissionText}` : '**NỘI DUNG TEXT:** (không có)',
      fileContext || '**NỘI DUNG FILE:** (không có)',
    ].join('\n\n');

    return `Bạn là giáo viên kinh nghiệm. Hãy chấm điểm bài nộp theo rubric và bối cảnh khóa học/bài học.

${contextText}

${assignmentTitle}${assignmentInstructions}**LOẠI BÀI NỘP:** ${submissionLabel}

**RUBRIC CHẤM ĐIỂM:**
${rubricText}

**TỔNG ĐIỂM TỐI ĐA:** ${maxScore}

${submissionSections}

**YÊU CẦU:**
- Đánh giá đầy đủ nội dung text và file (nếu có).
- Nếu có file đính kèm, phải nhận xét nội dung trong file.
- Chấm điểm công bằng, chi tiết, bám sát rubric.

**OUTPUT FORMAT (JSON nghiêm ngặt):**
{
  "score": 82,
  "maxScore": ${maxScore},
  "breakdown": [
    {
      "criterion": "Content",
      "achieved": 20,
      "max": 25,
      "comment": "Nhận xét theo rubric"
    }
  ],
  "feedback": "Nhận xét tổng thể",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"],
  "comments": [
    {
      "section": "File 1",
      "text": "Nhận xét cụ thể",
      "type": "constructive"
    }
  ]
}

Chỉ trả về JSON, không có text giải thích.`;
  }

  private buildContextText(context?: CourseLessonContext): string {
    if (!context) return '';

    const parts: string[] = [];
    if (context.courseTitle || context.courseDescription) {
      parts.push('**NGỮ CẢNH KHÓA HỌC:**');
      if (context.courseTitle) parts.push(`- Tiêu đề: ${context.courseTitle}`);
      if (context.courseDescription) parts.push(`- Mô tả: ${context.courseDescription}`);
    }

    if (context.courseOutline) {
      parts.push('**KHUNG NỘI DUNG KHÓA HỌC:**');
      parts.push(context.courseOutline);
    }

    if (context.lessonTitle || context.lessonDescription || context.lessonContent) {
      parts.push('**BÀI HỌC LIÊN QUAN:**');
      if (context.lessonTitle) parts.push(`- Tiêu đề: ${context.lessonTitle}`);
      if (context.lessonDescription) parts.push(`- Mô tả: ${context.lessonDescription}`);
      if (context.lessonContent) parts.push(`- Nội dung: ${context.lessonContent}`);
    }

    if (context.lessonMaterials && context.lessonMaterials.length > 0) {
      parts.push('**TÀI LIỆU BÀI HỌC:**');
      context.lessonMaterials.slice(0, 6).forEach((m, idx) => {
        const size = m.size ? ` (${Math.round(m.size / 1024)} KB)` : '';
        const type = m.type ? ` [${m.type}]` : '';
        const url = m.url ? ` - ${m.url}` : '';
        parts.push(`${idx + 1}. ${m.name || 'Tài liệu'}${type}${size}${url}`);
      });
      if (context.lessonMaterials.length > 6) {
        parts.push(`... và ${context.lessonMaterials.length - 6} tài liệu khác`);
      }
    }

    if (context.lessonSummary || context.lessonKeyConcepts?.length || context.lessonDifficulty) {
      parts.push('**AI SUMMARY BÀI HỌC:**');
      if (context.lessonSummary) parts.push(`- Tóm tắt: ${context.lessonSummary}`);
      if (context.lessonKeyConcepts?.length) {
        parts.push(`- Khái niệm chính: ${context.lessonKeyConcepts.join(', ')}`);
      }
      if (context.lessonDifficulty) parts.push(`- Độ khó: ${context.lessonDifficulty}`);
    }

    return parts.length > 0 ? `${parts.join('\n')}\n` : '';
  }

  private async buildFileContext(fileUrls: string[]): Promise<string> {
    if (!fileUrls || fileUrls.length === 0) return '';

    const fileResults = await Promise.allSettled(
      fileUrls.map((url) => this.readFileContent(url))
    );

    const validFiles: Array<{ content: string; fileName: string; type: string }> = [];
    fileResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        validFiles.push(result.value);
      }
    });

    if (validFiles.length === 0) {
      const fileNames = fileUrls
        .map((url) => url.split('/').pop() || 'unknown')
        .join(', ');
      return `**NỘI DUNG FILE:**\nKhông thể đọc nội dung tự động. File: ${fileNames}`;
    }

    let content = '**NỘI DUNG FILE:**\n';
    validFiles.forEach((file, idx) => {
      content += `\n--- File ${idx + 1}: ${file.fileName} (${file.type || 'unknown'}) ---\n`;
      content += `${file.content}\n`;
      content += `--- Kết thúc File ${idx + 1} ---\n`;
    });
    return content;
  }

  private async readFileContent(url: string): Promise<{ content: string; fileName: string; type: string } | null> {
    try {
      const fileName = url.split('/').pop() || 'unknown';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      const textExtensions = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'csv', 'log',
        'py', 'js', 'ts', 'java', 'c', 'cpp', 'h', 'cs', 'rb', 'go', 'rs', 'php',
        'html', 'css', 'scss', 'sass', 'less', 'sql', 'sh', 'bat', 'ps1',
        'vue', 'jsx', 'tsx', 'dart', 'swift', 'kt', 'scala', 'r', 'm', 'pl'];

      const response = await axios.get(url, {
        responseType: textExtensions.includes(extension) ? 'text' : 'arraybuffer',
        timeout: 60000,
        maxContentLength: 10 * 1024 * 1024,
        validateStatus: (status) => status === 200,
      });

      let content = '';

      if (textExtensions.includes(extension)) {
        content = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);
      } else if (extension === 'pdf') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const pdfParse = require('pdf-parse');
          const pdfBuffer = Buffer.from(response.data);
          // @ts-ignore - pdf-parse has complex types
          const pdfData = await pdfParse(pdfBuffer);
          content = pdfData.text || '';
        } catch (pdfError: any) {
          logger.error(`[AIGrader] Error parsing PDF ${fileName}:`, pdfError.message);
          content = `[PDF file: ${fileName} - Could not extract text content]`;
        }
      } else if (extension === 'docx') {
        try {
          const docxBuffer = Buffer.from(response.data);
          const result = await mammoth.extractRawText({ buffer: docxBuffer });
          content = result.value;
        } catch (docxError: any) {
          logger.error(`[AIGrader] Error parsing DOCX ${fileName}:`, docxError.message);
          content = `[DOCX file: ${fileName} - Could not extract text content]`;
        }
      } else if (extension === 'doc') {
        try {
          const docBuffer = Buffer.from(response.data);
          const docxBuffer = await this.convertDocToDocx(docBuffer);
          const result = await mammoth.extractRawText({ buffer: docxBuffer });
          content = result.value;
        } catch (docError: any) {
          logger.error(`[AIGrader] Error parsing DOC ${fileName}:`, docError.message);
          content = `[DOC file: ${fileName} - Could not extract text content]`;
        }
      } else if (extension === 'xlsx' || extension === 'xls') {
        try {
          const excelBuffer = Buffer.from(response.data);
          const xlsxBuffer = extension === 'xls' ? await this.convertXlsToXlsx(excelBuffer) : excelBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(xlsxBuffer);

          const sheetContents: string[] = [];
          workbook.worksheets.forEach((worksheet) => {
            const rows: string[] = [];
            worksheet.eachRow((row) => {
              const values = row.values as Array<string | number | boolean | null | undefined>;
              const line = values
                .slice(1)
                .map((value) => (value === null || value === undefined ? '' : String(value)))
                .join(',');
              if (line.trim()) rows.push(line);
            });
            sheetContents.push(`Sheet: ${worksheet.name}\n${rows.join('\n')}`);
          });

          content = sheetContents.join('\n\n---\n\n');
        } catch (excelError: any) {
          logger.error(`[AIGrader] Error parsing Excel ${fileName}:`, excelError.message);
          content = `[Excel file: ${fileName} - Could not extract text content]`;
        }
      } else if (extension === 'pptx' || extension === 'ppt') {
        content = `[PowerPoint file: ${fileName} - Text extraction not yet implemented for this format]`;
      } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
        content = `[Image file: ${fileName} - Cannot extract text from image]`;
      } else {
        content = `[File: ${fileName} (${extension}) - Format not supported for text extraction]`;
      }

      return {
        content: this.truncate(content, 10000),
        fileName,
        type: extension,
      };
    } catch (error: any) {
      logger.error(`[AIGrader] Error reading file from ${url}:`, error.message);
      return null;
    }
  }

  private truncate(text: string, maxLength: number) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  private async convertDocToDocx(docBuffer: Buffer): Promise<Buffer> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-doc-'));
    const inputPath = path.join(tmpDir, `input-${Date.now()}.doc`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.docx`);

    try {
      fs.writeFileSync(inputPath, docBuffer);
      await this.runLibreOfficeConvert(inputPath, tmpDir, 'docx');
      return fs.readFileSync(outputPath);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  }

  private async convertXlsToXlsx(xlsBuffer: Buffer): Promise<Buffer> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-xls-'));
    const inputPath = path.join(tmpDir, `input-${Date.now()}.xls`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.xlsx`);

    try {
      fs.writeFileSync(inputPath, xlsBuffer);
      await this.runLibreOfficeConvert(inputPath, tmpDir, 'xlsx');
      return fs.readFileSync(outputPath);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  }

  private async runLibreOfficeConvert(inputPath: string, outputDir: string, outputFormat: 'xlsx' | 'docx'): Promise<void> {
    const command = process.platform === 'win32' ? 'soffice' : 'soffice';
    const args = ['--headless', '--convert-to', outputFormat, '--outdir', outputDir, inputPath];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(command, args, { stdio: 'ignore' });
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`LibreOffice convert failed with code ${code}`));
          return;
        }
        resolve();
      });
    });

    if (!fs.existsSync(outputDir)) {
      throw new Error('LibreOffice output directory missing after conversion');
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Generate cache key
   * Hash full content + metadata để tránh collision
   */
  private generateCacheKey(type: 'code' | 'essay' | 'assignment', request: any): string {
    const content = type === 'code'
      ? request.code
      : type === 'essay'
      ? request.essay
      : [request.submissionText || '', ...(request.fileUrls || [])].join('|');


    // Hash FULL content + metadata
    const key = {
      type,
      contentHash: crypto.createHash('sha256').update(content).digest('hex'),
      contentLength: content.length,
      assignmentId: request.assignmentId,
      rubricHash: crypto.createHash('sha256').update(JSON.stringify(request.rubric)).digest('hex'),
      contextHash: request.context
        ? crypto.createHash('sha256').update(JSON.stringify(request.context)).digest('hex')
        : undefined,
    };

    const hash = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');

    return `ai:grader:${type}:${hash.substring(0, 20)}`;
  }

  private formatCourseOutline(sections: Array<{ title: string; lessons?: Array<{ title: string }> }>): string {
    if (!Array.isArray(sections) || sections.length === 0) return '';
    return sections
      .map((section, idx) => {
        const header = `${idx + 1}. ${section.title}`;
        const lessons = section.lessons && section.lessons.length > 0
          ? section.lessons.map((lesson, lidx) => `   - ${lidx + 1}. ${lesson.title}`).join('\n')
          : '';
        return lessons ? `${header}\n${lessons}` : header;
      })
      .join('\n');
  }

  private parseFileUrls(fileUrl?: string | null): string[] {
    if (!fileUrl) return [];
    try {
      const parsed = JSON.parse(fileUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback for single URL string
    }
    return fileUrl ? [fileUrl] : [];
  }

  private extractSubmissionFiles(submission: any): string[] {
    if (!submission) return [];
    if (Array.isArray(submission.file_urls)) return submission.file_urls;
    if (submission.file_url) return this.parseFileUrls(submission.file_url);
    return [];
  }

  private extractLessonContextFromAssignment(assignment: any): { lessonId?: string | null; sectionId?: string | null } {
    if (!assignment) return {};
    const lessonId = (assignment as any).lesson_id || (assignment as any).lessonId || null;
    const sectionId = (assignment as any).section_id || (assignment as any).sectionId || null;
    return { lessonId, sectionId };
  }

  private async loadCourseLessonContext(assignment: any, courseId: string | null): Promise<CourseLessonContext | undefined> {
    try {
      if (!assignment || !courseId) return undefined;

      const { Course, Section, Lesson, LessonMaterial, AILessonAnalysis } = await import('../../../models');
      const course = await Course.findByPk(courseId, {
        attributes: ['id', 'title', 'description']
      });
      if (!course) return undefined;

      const context: CourseLessonContext = {
        courseTitle: (course as any).title,
        courseDescription: (course as any).description || undefined,
      };

      const { lessonId } = this.extractLessonContextFromAssignment(assignment);

      if (lessonId) {
        const lesson = await Lesson.findByPk(lessonId, {
          attributes: ['id', 'title', 'description', 'content', 'section_id']
        });
        if (lesson) {
          context.lessonTitle = (lesson as any).title;
          context.lessonDescription = (lesson as any).description || undefined;
          context.lessonContent = (lesson as any).content
            ? this.truncate(typeof (lesson as any).content === 'string'
              ? (lesson as any).content.replace(/<[^>]+>/g, ' ')
              : JSON.stringify((lesson as any).content),
              2000)
            : undefined;

          const materials = await LessonMaterial.findAll({
            where: { lesson_id: (lesson as any).id },
            attributes: ['file_name', 'file_type', 'file_size', 'file_url']
          });
          if (materials.length > 0) {
            context.lessonMaterials = materials.map((m: any) => ({
              name: m.file_name,
              type: m.file_type || undefined,
              size: m.file_size || undefined,
              url: m.file_url || undefined,
            }));
          }

          try {
            const analysis = await AILessonAnalysis.findOne({
              where: { lesson_id: (lesson as any).id, status: 'completed' },
            });
            if (analysis) {
              context.lessonSummary = (analysis as any).summary || undefined;
              context.lessonKeyConcepts = Array.isArray((analysis as any).content_key_concepts)
                ? (analysis as any).content_key_concepts
                : undefined;
              context.lessonDifficulty = (analysis as any).content_difficulty_level || undefined;
            }
          } catch (error) {
            logger.warn('[AIGrader] Failed to load lesson analysis:', error);
          }
        }
      }

      const sections = await Section.findAll({
        where: { course_id: courseId },
        attributes: ['id', 'title', 'order_index'],
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id', 'title', 'order_index'],
            required: false,
          }
        ],
        order: [
          ['order_index', 'ASC'],
          [{ model: Lesson, as: 'lessons' }, 'order_index', 'ASC']
        ]
      });

      if (sections.length > 0) {
        const outline = sections.map((section: any) => ({
          title: section.title,
          lessons: Array.isArray(section.lessons)
            ? section.lessons.map((lesson: any) => ({ title: lesson.title }))
            : []
        }));
        context.courseOutline = this.formatCourseOutline(outline);
      }

      return context;
    } catch (error) {
      logger.warn('[AIGrader] Failed to build course/lesson context:', error);
      return undefined;
    }
  }

  async getAssignmentContext(assignmentId: string, courseId?: string): Promise<CourseLessonContext | undefined> {
    try {
      if (!assignmentId || !courseId) return undefined;
      const { Assignment } = await import('../../../models');
      const assignment = await Assignment.findByPk(assignmentId, {
        attributes: ['id', 'title', 'instructions', 'course_id', 'section_id', 'lesson_id'] as any,
      });
      if (!assignment) return undefined;

      return await this.loadCourseLessonContext(assignment, courseId);
    } catch (error) {
      logger.warn('[AIGrader] Failed to load assignment context:', error);
      return undefined;
    }
  }

  async buildAssignmentGradeRequest(params: {
    submissionId: string;
    assignmentId: string;
    rubric: RubricItem[];
    courseId: string;
    userId: string;
  }): Promise<AssignmentGradingRequest> {
    const { Assignment, AssignmentSubmission } = await import('../../../models');
    const submission = await AssignmentSubmission.findByPk(params.submissionId, {
      attributes: ['id', 'submission_text', 'file_url'],
    });

    const assignment = await Assignment.findByPk(params.assignmentId, {
      attributes: ['id', 'title', 'instructions', 'description', 'submission_type', 'course_id', 'section_id', 'lesson_id'],
    });

    const courseId = params.courseId || (assignment as any)?.course_id || null;
    const context = assignment ? await this.loadCourseLessonContext(assignment, courseId) : undefined;

    return {
      submissionId: params.submissionId,
      assignmentId: params.assignmentId,
      submissionText: submission?.submission_text || undefined,
      fileUrls: this.extractSubmissionFiles(submission),
      rubric: params.rubric,
      courseId: params.courseId,
      userId: params.userId,
      submissionType: (assignment as any)?.submission_type,
      assignmentTitle: (assignment as any)?.title,
      assignmentInstructions: (assignment as any)?.instructions || (assignment as any)?.description,
      context,
    };
  }

  async gradeSubmissionForAssignment(params: {
    submissionId: string;
    assignmentId: string;
    rubric: RubricItem[];
    courseId: string;
    userId: string;
  }): Promise<EssayGradingResult> {
    const gradingRequest = await this.buildAssignmentGradeRequest(params);
    return this.gradeAssignment(gradingRequest);
  }
}

