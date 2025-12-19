/**
 * AI Service
 * Business logic for AI features using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import env from '../../config/env.config';
import logger from '../../utils/logger.util';
import { formatAiAnswer, shorten } from '../../utils/ai-format.util';
import { ApiError } from '../../errors/api.error';
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  LessonChatRequest,
  GenerateQuizRequest,
  GenerateQuizResponse,
  ContentRecommendationRequest,
  ContentRecommendationResponse,
  LearningAnalyticsRequest,
  LearningAnalyticsResponse,
  GenerateCourseOutlineRequest,
  GenerateCourseOutlineResponse,
  SuggestCourseImprovementsRequest,
  SuggestCourseImprovementsResponse,
  AnalyzeStudentsRequest,
  AnalyzeStudentsResponse,
  GenerateFeedbackRequest,
  GenerateFeedbackResponse,
  AutoGradeRequest,
  AutoGradeResponse,
  GenerateThumbnailRequest,
  GenerateThumbnailResponse,
  GenerateLessonContentRequest,
  GenerateLessonContentResponse,
} from './ai.types';

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private useGroq: boolean = false;

  constructor() {
    // Initialize Groq first (priority)
    if (env.ai.groq.apiKey) {
      this.useGroq = true;
      logger.info(`[AIService] Groq API configured (Model: ${env.ai.groq.model})`);
    }

    // Initialize Gemini as fallback
    if (env.ai.gemini.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(env.ai.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: env.ai.gemini.model 
        });
        logger.info(`[AIService] Gemini API initialized successfully (Model: ${env.ai.gemini.model})`);
      } catch (error) {
        logger.error('[AIService] Failed to initialize Gemini API:', error);
      }
    }

    if (!this.useGroq && !this.model) {
      logger.warn('[AIService] No AI providers configured - AI features will be disabled');
    }
  }

  /**
   * Call Groq API
   */
  private async callGroq(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<ChatResponse> {
    if (!env.ai.groq.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const startTime = Date.now();
      const apiKeyPreview = env.ai.groq.apiKey.substring(0, 10) + '...';
      
      logger.info('[AIService] 📤 Sending request to Groq API...', {
        model: env.ai.groq.model,
        apiKeyPreview,
        promptLength: prompt.length,
        maxTokens: options?.maxTokens ?? env.ai.groq.maxTokens,
      });
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: env.ai.groq.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature ?? env.ai.groq.temperature,
          max_tokens: options?.maxTokens ?? env.ai.groq.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${env.ai.groq.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const duration = Date.now() - startTime;
      logger.info(`[AIService] ✅ Groq API request completed in ${duration}ms`, {
        status: response.status,
        model: env.ai.groq.model,
        responseLength: response.data.choices[0]?.message?.content?.length || 0,
        usage: response.data.usage,
      });

      const content = response.data.choices[0]?.message?.content || '';
      const usage = response.data.usage;

      return {
        response: formatAiAnswer(content),
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      logger.error('[AIService] ❌ Groq API error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        apiKeyConfigured: !!env.ai.groq.apiKey,
        apiKeyLength: env.ai.groq.apiKey?.length || 0,
      });
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Helper: Call AI với Groq fallback to Gemini
   */
  private async callAIWithFallback(
    prompt: string, 
    options?: { temperature?: number; maxTokens?: number },
    geminiMaxTokens?: number
  ): Promise<ChatResponse> {
    // Try Groq first (if available)
    if (this.useGroq) {
      try {
        logger.info('[AIService] Attempting Groq API call...', {
          promptLength: prompt.length,
          model: env.ai.groq.model,
          temperature: options?.temperature ?? env.ai.groq.temperature,
        });
        const maxTokens = options?.maxTokens ?? Math.min(env.ai.groq.maxTokens, 2048);
        const result = await this.callGroq(prompt, {
          temperature: options?.temperature ?? env.ai.groq.temperature,
          maxTokens: maxTokens,
        });
        logger.info('[AIService] ✅ Groq API call successful');
        return result;
      } catch (groqError: any) {
        logger.warn('[AIService] ❌ Groq failed, falling back to Gemini:', {
          error: groqError.message,
          errorType: groqError.constructor?.name,
          stack: groqError.stack?.substring(0, 200),
        });
        // Fall through to Gemini
      }
    } else {
      logger.info('[AIService] Groq not available, using Gemini directly');
    }

    // Fallback to Gemini
    if (!this.model) {
      throw new Error('All AI providers failed. Please check your API keys.');
    }

    const maxTokens = geminiMaxTokens ?? Math.min(env.ai.gemini.maxTokens, options?.maxTokens ?? 8192);
    const result = await this.model.generateContent(prompt, {
      generationConfig: {
        temperature: options?.temperature ?? env.ai.gemini.temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;
    const text = formatAiAnswer(response.text());
    let usage: any = undefined;
    if (response && typeof (response as any).usageMetadata === 'function') {
      usage = (response as any).usageMetadata();
    } else if (response && (response as any).usageMetadata) {
      usage = (response as any).usageMetadata;
    }

    return {
      response: text,
      usage: usage ? {
        promptTokens: usage.promptTokenCount,
        completionTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
      } : undefined,
    };
  }

  private truncate(text: string, maxLength: number) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  private mapGeminiError(error: any): never {
    const message =
      '[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com';
    const isGeminiFetchError =
      typeof error?.message === 'string' && error.message.includes(message);

    const status = (error as any)?.status || (error as any)?.response?.status;
    if (isGeminiFetchError && (status === 429 || status === 503)) {
      throw new ApiError('AI đang quá tải, vui lòng thử lại sau.', 503);
    }
    throw error;
  }

  private buildLessonContext(lesson: any): string {
    let ctx = '';
    ctx += `Tiêu đề bài học: ${lesson.title || 'N/A'}\n`;
    if (lesson.description) {
      ctx += `Mô tả: ${this.truncate(lesson.description, 600)}\n`;
    }
    if (lesson.content) {
      ctx += `Nội dung chính:\n${this.truncate(
        typeof lesson.content === 'string' ? lesson.content.replace(/<[^>]+>/g, ' ') : JSON.stringify(lesson.content),
        2400
      )}\n`;
    }
    if (lesson.materials?.length) {
      ctx += '\nTài liệu đính kèm:\n';
      lesson.materials.slice(0, 5).forEach((m: any, idx: number) => {
        const size = m.file_size ? ` (${Math.round(m.file_size / 1024)} KB)` : '';
        const urlPart = m.file_url ? ` - URL: ${m.file_url}` : '';
        ctx += `${idx + 1}. ${m.file_name || 'Tệp'} [${m.file_type || 'unknown'}]${size}${urlPart}\n`;
      });
      if (lesson.materials.length > 5) {
        ctx += `... còn ${lesson.materials.length - 5} tệp khác\n`;
      }
    }
    return ctx;
  }

  /**
   * Lesson-aware chat (RAG-lite)
   * Uses Groq first, falls back to Gemini
   */
  async chatWithLessonContext(request: LessonChatRequest): Promise<ChatResponse> {
    if (!this.useGroq && !this.model) {
      throw new Error('AI service is not available. Please configure GROQ_API_KEY or GEMINI_API_KEY.');
    }

    const contextText = this.buildLessonContext(request.lesson);

    // Build prompt with context + history + formatting rules
    let prompt = 'Bạn là trợ lý AI cho khóa học. Trả lời ngắn gọn, rõ ràng, hữu ích.\n';
    prompt += 'Định dạng đầu ra (markdown gọn):\n';
    prompt += '- Chỉ trả về nội dung chính, không mở đầu/kết thúc.\n';
    prompt += '- Nếu tóm tắt: dùng 4-8 bullet, mỗi bullet ≤ 18 từ, prefix "- ".\n';
    prompt += '- Nếu hướng dẫn bước: dùng danh sách số.\n';
    prompt += '- Nếu cần code: dùng ```lang\\n...```, không thêm lời dẫn.\n';
    prompt += '- Không dùng in đậm/in nghiêng, không lặp lại câu hỏi/tiêu đề.\n';
    prompt += '\nNgữ cảnh bài học:\n';
    prompt += contextText;

    if (request.conversationHistory && request.conversationHistory.length > 0) {
      const recent = request.conversationHistory.slice(-6);
      prompt += '\nLịch sử hội thoại:\n';
      recent.forEach((m: ChatMessage, idx: number) => {
        prompt += `${idx + 1}. ${m.role === 'user' ? 'Người dùng' : 'AI'}: ${shorten(m.content, 240)}\n`;
      });
    }

    prompt += '\nCâu hỏi:\n';
    prompt += request.message;

    // Use helper với retry logic cho Gemini
    try {
      return await this.callAIWithFallback(prompt, {
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens ?? Math.min(env.ai.gemini.maxTokens, 512),
      }, 512);
    } catch (error: any) {
      // Retry logic chỉ cho Gemini (Groq đã fail ở callAIWithFallback)
      const status = (error as any)?.status || (error as any)?.response?.status;
      if (status === 429 || status === 503) {
        const attempts = 3;
        const delays = [300, 800, 1600];
        
        for (let i = 0; i < attempts; i++) {
          try {
            await new Promise((resolve) => setTimeout(resolve, delays[i] ?? 1200));
            return await this.callAIWithFallback(prompt, {
              temperature: request.options?.temperature,
              maxTokens: request.options?.maxTokens ?? Math.min(env.ai.gemini.maxTokens, 512),
            }, 512);
          } catch (retryError) {
            if (i === attempts - 1) {
              logger.error('[AIService] Chat error after retries:', retryError);
              throw new ApiError('AI đang quá tải, vui lòng thử lại sau.', 503);
            }
          }
        }
      }
      throw error;
    }
  }

  /**
   * Summarize lesson
   */
  async summarizeLesson(lesson: any): Promise<ChatResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    const contextText = this.buildLessonContext(lesson);
    let prompt = 'Tóm tắt ngắn gọn bài học sau. Quy tắc:\n';
    prompt += '- Trả về 4-8 bullet, mỗi bullet ≤ 18 từ, prefix "- ".\n';
    prompt += '- Không intro/outro, không in đậm/nghiêng, không lặp lại tiêu đề.\n';
    prompt += '- Nếu thấy số liệu quan trọng, giữ lại ngắn gọn.\n\n';
    prompt += contextText;

    const maxTokens = Math.min(env.ai.gemini.maxTokens, 512);
    const attempts = 3;
    const delays = [300, 800, 1600];

    for (let i = 0; i < attempts; i++) {
      try {
        const result = await this.model.generateContent(prompt, {
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: maxTokens,
          },
        });

        const response = result.response;
        const text = formatAiAnswer(response.text());
        let usage: any = undefined;
        if (response && typeof (response as any).usageMetadata === 'function') {
          usage = (response as any).usageMetadata();
        } else if (response && (response as any).usageMetadata) {
          usage = (response as any).usageMetadata;
        }

        return {
          response: text,
          usage: usage
            ? {
                promptTokens: usage.promptTokenCount,
                completionTokens: usage.candidatesTokenCount,
                totalTokens: usage.totalTokenCount,
              }
            : undefined,
        };
      } catch (error) {
        const status = (error as any)?.status || (error as any)?.response?.status;
        if (i < attempts - 1 && (status === 429 || status === 503)) {
          const delay = delays[i] ?? 1200;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        this.mapGeminiError(error);
      }
    }

    throw new ApiError('AI đang quá tải, vui lòng thử lại sau.', 503);
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.model !== null;
  }

  /**
   * Chat with AI assistant (Groq first, fallback to Gemini)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.useGroq && !this.model) {
      throw new Error('AI service is not available. Please configure GROQ_API_KEY or GEMINI_API_KEY.');
    }

    try {
      // Build instruction + context as a single prompt
      let prompt = 'Bạn là một trợ lý AI cho hệ thống học tập trực tuyến (LMS). ';
      prompt += 'Trả lời ngắn gọn, rõ ràng, hữu ích cho học viên.\n';

      if (request.context?.courseTitle) {
        prompt += '\nThông tin khóa học:\n';
        prompt += `- Tiêu đề: ${request.context.courseTitle}\n`;
        if (request.context.courseDescription) {
          prompt += `- Mô tả: ${request.context.courseDescription}\n`;
        }
      }
      if (request.context?.lessonTitle) {
        prompt += `- Bài học: ${request.context.lessonTitle}\n`;
      }

      // Append brief history (as text) to give context
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        const recent = request.conversationHistory.slice(-6);
        prompt += '\nLịch sử hội thoại (tóm tắt):\n';
        recent.forEach((m, idx) => {
          prompt += `${idx + 1}. ${m.role === 'user' ? 'Người dùng' : 'AI'}: ${shorten(m.content, 240)}\n`;
        });
      }

      prompt += '\nCâu hỏi hiện tại:\n';
      prompt += request.message;

      // Use helper với retry logic cho Gemini
      try {
        return await this.callAIWithFallback(prompt, {
          temperature: request.options?.temperature,
          maxTokens: request.options?.maxTokens ?? Math.min(env.ai.gemini.maxTokens, 512),
        }, 512);
      } catch (error: any) {
        // Retry logic chỉ cho Gemini (Groq đã fail ở callAIWithFallback)
        const status = (error as any)?.status || (error as any)?.response?.status;
        if (status === 429 || status === 503) {
          const attempts = 3;
          const delays = [300, 800, 1600];
          
          for (let i = 0; i < attempts; i++) {
            try {
              await new Promise((resolve) => setTimeout(resolve, delays[i] ?? 1200));
              return await this.callAIWithFallback(prompt, {
                temperature: request.options?.temperature,
                maxTokens: request.options?.maxTokens ?? Math.min(env.ai.gemini.maxTokens, 512),
              }, 512);
            } catch (retryError) {
              if (i === attempts - 1) {
                logger.error('[AIService] Chat error after retries:', retryError);
                throw new ApiError('AI đang quá tải, vui lòng thử lại sau.', 503);
              }
            }
          }
        }
        throw error;
      }
    } catch (error) {
      logger.error('[AIService] Chat error:', error);
      this.mapGeminiError(error);
      throw error;
    }
  }

  /**
   * Generate content directly (for moderation, no conversation history needed)
   * Uses Groq first, falls back to Gemini
   */
  async generateContent(request: { prompt: string; options?: { temperature?: number; maxTokens?: number } }): Promise<ChatResponse> {
    if (!this.useGroq && !this.model) {
      throw new Error('AI service is not available. Please configure GROQ_API_KEY or GEMINI_API_KEY.');
    }

    try {
      // Use helper method
      return await this.callAIWithFallback(request.prompt, {
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens,
      });
    } catch (error) {
      logger.error('[AIService] Generate content error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Generate quiz questions from course content
   */
  async generateQuiz(request: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const questionType = request.questionType || 'single_choice';
      const difficulty = request.difficulty || 'medium';

      const prompt = `Tạo ${request.numberOfQuestions || 5} câu hỏi ${difficulty} từ nội dung khóa học sau:

${request.courseContent}

Yêu cầu:
- Loại câu hỏi: ${questionType}
- Giải thích rõ:
  * single_choice = Trắc nghiệm 1 đáp án đúng duy nhất
  * multiple_choice = Trắc nghiệm có thể có nhiều đáp án đúng (ít nhất 2 đáp án đúng)
  * true_false = Câu hỏi Đúng/Sai, không có options, chỉ trả về correctAnswer là "true" hoặc "false"
- Độ khó: ${difficulty}
- Mỗi câu hỏi phải có đáp án đúng và giải thích ngắn gọn
- Không thêm tiền tố A./B./C./D. trong text đáp án. Chỉ trả về nội dung đáp án thuần.
- Với single_choice hoặc multiple_choice: tạo từ 3 tới 6 đáp án (options), không cố định 4.
- Trả về dưới dạng JSON với format CHÍNH XÁC:
{
  "questions": [
    {
      "question": "Câu hỏi",
      "type": "${questionType}", // "single_choice" | "multiple_choice" | "true_false"
      "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3"], // BẮT BUỘC với single_choice và multiple_choice, KHÔNG dùng với true_false. Không thêm tiền tố A./B./C./D.
      // Với single_choice: correctAnswer là số chỉ index của đáp án đúng (0-based) hoặc chữ cái "A"/"B"/"C"/...
      // Với multiple_choice: correctAnswer là MẢNG index các đáp án đúng (ví dụ [0, 2]) hoặc mảng chữ cái ["A","C"]
      // Với true_false: correctAnswer là chuỗi "true" hoặc "false"
      "correctAnswer": 0,
      "explanation": "Giải thích",
      "difficulty": "${difficulty}"
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        return {
          questions: parsed.questions || [],
          totalQuestions: parsed.questions?.length || 0,
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse quiz JSON:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      logger.error('[AIService] Generate quiz error:', error);
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content recommendations (placeholder - requires user data)
   */
  async getContentRecommendations(request: ContentRecommendationRequest): Promise<ContentRecommendationResponse> {
    // TODO: Implement with user learning history
    // This would require integration with enrollment and course modules
    return {
      recommendations: [],
      totalRecommendations: 0,
    };
  }

  /**
   * Get learning analytics (placeholder - requires user data)
   */
  async getLearningAnalytics(request: LearningAnalyticsRequest): Promise<LearningAnalyticsResponse> {
    // TODO: Implement with user progress data
    // This would require integration with enrollment, quiz, and grade modules
    return {
      analytics: {
        progress: {
          completedCourses: 0,
          inProgressCourses: 0,
          averageScore: 0,
        },
        insights: [],
        recommendations: [],
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // ==================== INSTRUCTOR AI FEATURES ====================

  /**
   * Generate course outline from topic/description
   */
  async generateCourseOutline(request: GenerateCourseOutlineRequest): Promise<GenerateCourseOutlineResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      // Bước 1: Tạo outline cơ bản (không có content chi tiết) - nhanh hơn
      const prompt = `Bạn là chuyên gia thiết kế khóa học. Tạo outline cơ bản cho khóa học với thông tin sau:

Chủ đề: ${request.topic}
${request.description ? `Mô tả: ${request.description}` : ''}
${request.duration ? `Thời lượng: ${request.duration} giờ` : ''}
${request.level ? `Trình độ: ${request.level}` : ''}
${request.numberOfSections ? `Số chương: ${request.numberOfSections}` : ''}

Yêu cầu:
- Tạo tiêu đề khóa học hấp dẫn
- Tạo mô tả khóa học (2-3 câu)
- Liệt kê 4-6 learning outcomes (mục tiêu học tập)
- Chia thành các chương (sections) với tiêu đề và mô tả ngắn
- Mỗi chương có 3-5 bài học (lessons) với:
  * Tiêu đề bài học
  * Mô tả ngắn (2-3 câu) về nội dung sẽ học trong bài này
  * Ước tính thời lượng cho mỗi bài học (tính bằng PHÚT, không phải giờ)
  * Nội dung tóm tắt ngắn gọn (3-5 câu) về những gì sẽ được học trong bài

Lưu ý quan trọng về thời lượng:
- Tổng thời lượng ước tính (totalEstimatedDuration) phải bằng hoặc gần bằng với thời lượng input (${request.duration || 'không chỉ định'} giờ)
- Tính tổng thời lượng tất cả lessons (đơn vị: phút) rồi chia cho 60 để ra giờ
- Ví dụ: Nếu input là 24 giờ, tổng tất cả lessons nên khoảng 24*60 = 1440 phút
- Đảm bảo totalEstimatedDuration trong response phải khớp với tổng thời lượng thực tế của các lessons

Trả về JSON format:
{
  "title": "Tiêu đề khóa học",
  "description": "Mô tả khóa học",
  "learningOutcomes": ["Mục tiêu 1", "Mục tiêu 2", ...],
  "sections": [
    {
      "title": "Tên chương",
      "description": "Mô tả chương",
      "order": 1,
      "lessons": [
        {
          "title": "Tên bài học",
          "description": "Mô tả bài học ngắn (2-3 câu) về nội dung sẽ học",
          "content": "Nội dung tóm tắt ngắn gọn (3-5 câu) về những gì sẽ được học trong bài này, bao gồm các khái niệm chính và điểm quan trọng",
          "order": 1,
          "estimatedDuration": 30
        }
      ]
    }
  ],
  "totalEstimatedDuration": ${request.duration || 10}
}

QUAN TRỌNG: 
- estimatedDuration của mỗi lesson tính bằng PHÚT (ví dụ: 30, 45, 60)
- totalEstimatedDuration tính bằng GIỜ và PHẢI bằng hoặc gần bằng ${request.duration || 'thời lượng input'}
- Tính tổng tất cả estimatedDuration (phút) của lessons, chia 60, làm tròn để ra totalEstimatedDuration (giờ)`;

      logger.info('[AIService] Calling Gemini API for course outline generation (basic outline only)');
      const startTime = Date.now();
      
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1536, // Giảm xuống để nhanh hơn, chỉ cần outline cơ bản
        },
      });

      const duration = Date.now() - startTime;
      logger.info('[AIService] Gemini API response received for course outline', { duration: `${duration}ms` });

      const response = result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        // Tính lại totalEstimatedDuration từ tổng thời lượng các lessons (nếu AI tính sai)
        let calculatedTotalDuration = request.duration || 0;
        if (parsed.sections && Array.isArray(parsed.sections)) {
          let totalMinutes = 0;
          parsed.sections.forEach((section: any) => {
            if (section.lessons && Array.isArray(section.lessons)) {
              section.lessons.forEach((lesson: any) => {
                if (lesson.estimatedDuration) {
                  totalMinutes += lesson.estimatedDuration;
                }
              });
            }
          });
          // Chuyển từ phút sang giờ và làm tròn
          calculatedTotalDuration = Math.round(totalMinutes / 60);
        }

        return {
          title: parsed.title || request.topic,
          description: parsed.description || '',
          learningOutcomes: parsed.learningOutcomes || [],
          sections: parsed.sections || [],
          // Ưu tiên dùng duration từ AI, nếu không hợp lý thì dùng giá trị tính lại hoặc input
          totalEstimatedDuration: parsed.totalEstimatedDuration && 
            Math.abs(parsed.totalEstimatedDuration - (request.duration || 0)) < 5 
            ? parsed.totalEstimatedDuration 
            : (calculatedTotalDuration || request.duration || 0),
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse course outline JSON:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      logger.error('[AIService] Generate course outline error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Suggest course improvements
   */
  async suggestCourseImprovements(request: SuggestCourseImprovementsRequest): Promise<SuggestCourseImprovementsResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const courseInfo = `Tiêu đề: ${request.courseData.title}
${request.courseData.description ? `Mô tả: ${request.courseData.description}` : ''}
${request.courseData.content ? `Nội dung: ${this.truncate(request.courseData.content, 2000)}` : ''}
${request.courseData.lessons?.length ? `Số bài học: ${request.courseData.lessons.length}` : ''}
${request.courseData.enrollmentStats ? `Thống kê: ${JSON.stringify(request.courseData.enrollmentStats)}` : ''}`;

      const prompt = `Bạn là chuyên gia đánh giá khóa học. Phân tích khóa học sau và đưa ra các đề xuất cải thiện:

${courseInfo}

Yêu cầu:
- Phân tích các khía cạnh: nội dung, cấu trúc, tương tác, đánh giá, khả năng tiếp cận
- Đưa ra 5-10 đề xuất cụ thể với mức độ ưu tiên (high/medium/low)
- Mỗi đề xuất cần có: tiêu đề, mô tả, gợi ý cụ thể, tác động dự kiến
- Đánh giá tổng thể khóa học (0-100)
- Tóm tắt ngắn gọn

Trả về JSON format:
{
  "improvements": [
    {
      "category": "content|structure|engagement|assessment|accessibility",
      "priority": "high|medium|low",
      "title": "Tiêu đề đề xuất",
      "description": "Mô tả vấn đề",
      "suggestion": "Gợi ý cụ thể",
      "impact": "Tác động dự kiến"
    }
  ],
  "overallScore": 75,
  "summary": "Tóm tắt đánh giá"
}`;

      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
        },
      });

      const response = result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        return {
          improvements: parsed.improvements || [],
          overallScore: parsed.overallScore,
          summary: parsed.summary || '',
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse improvements JSON:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      logger.error('[AIService] Suggest improvements error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Analyze student performance
   */
  async analyzeStudents(request: AnalyzeStudentsRequest): Promise<AnalyzeStudentsResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    // This would typically fetch real data from enrollment, quiz, assignment modules
    // For now, return a structured response that can be enhanced with real data
    return {
      courseAnalytics: {
        totalStudents: 0,
        averageProgress: 0,
        averageScore: 0,
        completionRate: 0,
        commonWeakAreas: [],
        topPerformers: [],
        atRiskStudents: [],
        insights: [],
        recommendations: [],
      },
      studentAnalyses: [],
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper: Download and read file content from URL
   * Supports: text files, PDF, DOCX, XLSX, and other common formats
   */
  private async readFileContent(url: string): Promise<{ content: string; fileName: string; type: string } | null> {
    try {
      const fileName = url.split('/').pop() || 'unknown';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      // Text-based file extensions that can be read directly
      const textExtensions = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'csv', 'log',
        'py', 'js', 'ts', 'java', 'c', 'cpp', 'h', 'cs', 'rb', 'go', 'rs', 'php',
        'html', 'css', 'scss', 'sass', 'less', 'sql', 'sh', 'bat', 'ps1',
        'vue', 'jsx', 'tsx', 'dart', 'swift', 'kt', 'scala', 'r', 'm', 'pl'];
      
      // Download file as buffer for binary files, or text for text files
      const response = await axios.get(url, {
        responseType: textExtensions.includes(extension) ? 'text' : 'arraybuffer',
        timeout: 60000, // 60s timeout per file (increased for large files)
        maxContentLength: 10 * 1024 * 1024, // 10MB max
        validateStatus: (status) => status === 200,
      });

      let content = '';

      // Handle text files
      if (textExtensions.includes(extension)) {
        content = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
      }
      // Handle PDF files
      else if (extension === 'pdf') {
        try {
          // pdf-parse uses CommonJS
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const pdfParse = require('pdf-parse');
          const pdfBuffer = Buffer.from(response.data);
          // @ts-ignore - pdf-parse has complex types
          const pdfData = await pdfParse(pdfBuffer);
          content = pdfData.text || '';
          logger.info(`[AIService] Successfully extracted text from PDF: ${fileName}`);
        } catch (pdfError: any) {
          logger.error(`[AIService] Error parsing PDF ${fileName}:`, pdfError.message);
          content = `[PDF file: ${fileName} - Could not extract text content]`;
        }
      }
      // Handle DOCX files
      else if (extension === 'docx' || extension === 'doc') {
        try {
          const docxBuffer = Buffer.from(response.data);
          const result = await mammoth.extractRawText({ buffer: docxBuffer });
          content = result.value;
          if (result.messages.length > 0) {
            logger.warn(`[AIService] DOCX extraction warnings for ${fileName}:`, result.messages);
          }
          logger.info(`[AIService] Successfully extracted text from DOCX: ${fileName}`);
        } catch (docxError: any) {
          logger.error(`[AIService] Error parsing DOCX ${fileName}:`, docxError.message);
          content = `[DOCX file: ${fileName} - Could not extract text content]`;
        }
      }
      // Handle Excel files (XLSX, XLS)
      else if (extension === 'xlsx' || extension === 'xls') {
        try {
          const excelBuffer = Buffer.from(response.data);
          const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
          
          // Extract text from all sheets
          const sheetContents: string[] = [];
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_csv(worksheet);
            sheetContents.push(`Sheet: ${sheetName}\n${sheetData}`);
          });
          
          content = sheetContents.join('\n\n---\n\n');
          logger.info(`[AIService] Successfully extracted text from Excel: ${fileName}`);
        } catch (excelError: any) {
          logger.error(`[AIService] Error parsing Excel ${fileName}:`, excelError.message);
          content = `[Excel file: ${fileName} - Could not extract text content]`;
        }
      }
      // Handle PPTX files (PowerPoint) - basic text extraction
      else if (extension === 'pptx' || extension === 'ppt') {
        // Note: Full PPTX parsing requires more complex libraries
        // For now, we'll indicate the file type
        content = `[PowerPoint file: ${fileName} - Text extraction not yet implemented for this format]`;
        logger.info(`[AIService] PPTX file detected but not parsed: ${fileName}`);
      }
      // Handle image files
      else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
        content = `[Image file: ${fileName} - Cannot extract text from image. Consider using OCR if needed.]`;
        logger.info(`[AIService] Image file detected: ${fileName}`);
      }
      // Unknown file types
      else {
        content = `[File: ${fileName} (${extension}) - Format not supported for text extraction]`;
        logger.info(`[AIService] Unsupported file type: ${extension} for ${fileName}`);
      }
      
      return {
        content: this.truncate(content, 10000), // Limit to 10000 chars per file (increased for PDF/DOCX)
        fileName,
        type: extension,
      };
    } catch (error: any) {
      logger.error(`[AIService] Error reading file from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Generate feedback for assignment submission
   */
  async generateFeedback(request: GenerateFeedbackRequest): Promise<GenerateFeedbackResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      // Đọc nội dung từ các file nếu có
      let fileContents = '';
      if (request.fileUrls && request.fileUrls.length > 0) {
        logger.info(`[AIService] Reading ${request.fileUrls.length} file(s) for feedback generation`);
        
        const fileResults = await Promise.allSettled(
          request.fileUrls.map(url => this.readFileContent(url))
        );

        const validFiles: Array<{ content: string; fileName: string; type: string }> = [];
        fileResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            validFiles.push(result.value);
          } else {
            logger.warn(`[AIService] Failed to read file ${request.fileUrls![idx]}`);
          }
        });

        if (validFiles.length > 0) {
          fileContents = `\n\n=== NỘI DUNG CÁC FILE ĐÍNH KÈM (${validFiles.length} file) ===\n\n`;
          validFiles.forEach((file, idx) => {
            fileContents += `\n--- File ${idx + 1}: ${file.fileName} (Loại: ${file.type}) ---\n`;
            fileContents += `${file.content}\n`;
            fileContents += `--- Kết thúc File ${idx + 1} ---\n\n`;
          });
          fileContents += `=== KẾT THÚC NỘI DUNG FILE ===\n\n`;
          
          logger.info(`[AIService] Successfully read ${validFiles.length} file(s) for feedback. Files: ${validFiles.map(f => f.fileName).join(', ')}`);
        } else {
          // Nếu không đọc được file nào, vẫn thông báo có file
          const fileNames = request.fileUrls.map((url) => {
            const fileName = url.split('/').pop() || 'unknown';
            return fileName;
          }).join(', ');
          
          fileContents = `\n\n=== THÔNG TIN FILE ĐÍNH KÈM ===\n`;
          fileContents += `Học viên đã nộp ${request.fileUrls.length} file đính kèm, nhưng không thể đọc được nội dung tự động.\n`;
          fileContents += `Các file: ${fileNames}\n`;
          fileContents += `Vui lòng xem xét các file này khi đánh giá bài nộp.\n`;
          fileContents += `=== KẾT THÚC THÔNG TIN FILE ===\n\n`;
          
          logger.warn(`[AIService] Could not read any files from ${request.fileUrls.length} URLs provided`);
        }
      } else {
        logger.info(`[AIService] No file URLs provided for feedback generation`);
      }

      const studentNameInfo = request.studentName 
        ? `\nHọc viên nộp bài: ${request.studentName}\nLƯU Ý QUAN TRỌNG: Bạn PHẢI sử dụng tên "${request.studentName}" khi xưng hô với học viên trong feedback, KHÔNG được lấy tên từ nội dung bài nộp. Nội dung bài nộp có thể chứa tên khác (như "Admin Chidi") nhưng đó KHÔNG phải tên học viên. Tên học viên chính xác là "${request.studentName}".\n`
        : '';

      const prompt = `Bạn là giảng viên chấm bài. Đánh giá bài nộp sau và tạo feedback chi tiết:${studentNameInfo}

Yêu cầu bài tập:
${request.assignmentInstructions}

${request.rubric ? `Rubric: ${JSON.stringify(request.rubric)}` : ''}
${request.maxScore ? `Điểm tối đa: ${request.maxScore}` : ''}

=== NỘI DUNG VĂN BẢN BÀI NỘP ===
${this.truncate(request.submissionContent, 3000)}
${fileContents}

QUAN TRỌNG: 
1. Bạn cần đánh giá CẢ nội dung văn bản VÀ nội dung trong các file đính kèm (nếu có). 
2. Nếu có file đính kèm, bạn PHẢI nhận xét về nội dung trong file đó, không chỉ nội dung văn bản.
3. ${request.studentName ? `Khi xưng hô với học viên, bạn PHẢI dùng tên "${request.studentName}", KHÔNG được lấy tên từ nội dung bài nộp.` : ''}

Yêu cầu:
- Đánh giá bài nộp một cách công bằng và xây dựng
- Đánh giá CẢ nội dung văn bản VÀ nội dung file đính kèm (nếu có)
- Nếu có file đính kèm, PHẢI nhận xét cụ thể về nội dung trong file đó
- ${request.studentName ? `Sử dụng tên "${request.studentName}" khi xưng hô, KHÔNG dùng tên từ nội dung bài nộp` : ''}
- Liệt kê điểm mạnh (2-3 điểm) - bao gồm cả từ văn bản và file
- Liệt kê điểm cần cải thiện (2-3 điểm) - bao gồm cả từ văn bản và file
- Đưa ra feedback chi tiết, cụ thể cho từng phần
- ${request.maxScore ? `Đề xuất điểm số (0-${request.maxScore})` : ''}
- Đề xuất grade (A/B/C/D/F) nếu có

Trả về JSON format:
{
  ${request.maxScore ? `"score": 85,` : ''}
  "feedback": "Feedback tổng thể chi tiết",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"],
  "detailedComments": [
    {
      "section": "Phần 1",
      "comment": "Nhận xét cụ thể",
      ${request.maxScore ? `"score": 20` : ''}
    }
  ],
  "suggestedGrade": "B+"
}`;

      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048, // Increased for more detailed feedback
        },
      });

      const response = result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        return {
          feedback: {
            score: parsed.score,
            feedback: parsed.feedback || '',
            strengths: parsed.strengths || [],
            improvements: parsed.improvements || [],
            detailedComments: parsed.detailedComments || [],
          },
          suggestedGrade: parsed.suggestedGrade,
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse feedback JSON:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      logger.error('[AIService] Generate feedback error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Auto-grade assignment (for objective questions)
   */
  async autoGrade(request: AutoGradeRequest): Promise<AutoGradeResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    // For objective questions, we can compare answers directly
    // For subjective questions, use generateFeedback instead
    let totalScore = 0;
    let maxScore = 0;
    const gradedQuestions = [];

    for (const question of request.assignmentQuestions) {
      const studentAnswer = request.submissionAnswers[question.id];
      const correctAnswer = question.correct_answer || question.correctAnswer;
      const points = question.points || 1;

      maxScore += points;

      if (studentAnswer === correctAnswer || 
          (typeof studentAnswer === 'string' && typeof correctAnswer === 'string' && 
           studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim())) {
        totalScore += points;
        gradedQuestions.push({
          questionId: question.id,
          isCorrect: true,
          points: points,
          maxPoints: points,
        });
      } else {
        gradedQuestions.push({
          questionId: question.id,
          isCorrect: false,
          points: 0,
          maxPoints: points,
          feedback: `Đáp án đúng: ${correctAnswer}`,
        });
      }
    }

    return {
      score: totalScore,
      maxScore: maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      gradedQuestions,
    };
  }

  /**
   * Generate thumbnail prompt for course
   * Tạo prompt để generate thumbnail bằng Imagen hoặc service khác
   */
  async generateThumbnailPrompt(request: GenerateThumbnailRequest): Promise<GenerateThumbnailResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const prompt = `Bạn là chuyên gia thiết kế hình ảnh. Tạo prompt chi tiết để tạo thumbnail (ảnh bìa) cho khóa học với thông tin sau:

Tiêu đề khóa học: ${request.courseTitle}
${request.courseDescription ? `Mô tả: ${request.courseDescription}` : ''}
${request.category ? `Danh mục: ${request.category}` : ''}
${request.level ? `Trình độ: ${request.level}` : ''}

Yêu cầu:
- Tạo prompt ngắn gọn, rõ ràng (50-100 từ) để tạo thumbnail hấp dẫn, chuyên nghiệp
- Thumbnail phải phù hợp với chủ đề khóa học
- Style: hiện đại, chuyên nghiệp, dễ nhìn
- Màu sắc: hài hòa, thu hút
- Không có text trong ảnh (chỉ hình ảnh)

Trả về JSON format:
{
  "prompt": "Prompt chi tiết để tạo thumbnail (tiếng Anh, 50-100 từ)",
  "suggestions": [
    "Prompt gợi ý 1",
    "Prompt gợi ý 2",
    "Prompt gợi ý 3"
  ]
}`;

      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 512,
        },
      });

      const response = result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        return {
          prompt: parsed.prompt || `Professional course thumbnail for: ${request.courseTitle}`,
          suggestions: parsed.suggestions || [],
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse thumbnail prompt JSON:', parseError);
        // Fallback: tạo prompt đơn giản
        return {
          prompt: `Professional, modern course thumbnail illustration for "${request.courseTitle}". Clean design, vibrant colors, educational theme, no text`,
          suggestions: [],
        };
      }
    } catch (error) {
      logger.error('[AIService] Generate thumbnail prompt error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Generate detailed content for a single lesson
   * Tạo nội dung chi tiết cho một lesson cụ thể
   */
  async generateLessonContent(request: GenerateLessonContentRequest): Promise<GenerateLessonContentResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      logger.info('[AIService] Generating lesson content', { lessonTitle: request.lessonTitle });
      
      // Extract lesson number from title (e.g., "7.2", "Bài 7", "7.2. Đọc và Ghi File")
      const lessonNumberMatch = request.lessonTitle.match(/(?:^|\.|Bài\s*)(\d+)(?:\.\d+)?/);
      const lessonNumber = lessonNumberMatch ? parseInt(lessonNumberMatch[1], 10) : null;
      const isAdvancedLesson = lessonNumber !== null && lessonNumber >= 5;
      
      const prompt = `# VAI TRÒ VÀ NGỮ CẢNH
Bạn là chuyên gia viết nội dung khóa học trực tuyến với nhiều năm kinh nghiệm. Nhiệm vụ của bạn là tạo nội dung bài học CHI TIẾT, ĐẦY ĐỦ, có thể học ngay được (không phải outline hay summary).

# THÔNG TIN KHÓA HỌC VÀ BÀI HỌC
**Khóa học:** ${request.courseTitle}
${request.courseDescription ? `**Mô tả khóa học:** ${request.courseDescription}` : ''}
${request.sectionTitle ? `**Chương hiện tại:** ${request.sectionTitle}` : ''}
${request.level ? `**Trình độ:** ${request.level}` : '**Trình độ:** beginner'}
${lessonNumber !== null ? `**Số thứ tự bài học:** ${lessonNumber}${isAdvancedLesson ? ' (Bài học nâng cao - đã qua các bài cơ bản)' : ''}` : ''}

**Bài học cần tạo:**
- **Tiêu đề:** ${request.lessonTitle}
- **Mô tả:** ${request.lessonDescription}

# YÊU CẦU NỘI DUNG

## 1. Độ dài và chất lượng
- **Tối thiểu:** ${isAdvancedLesson ? '800-1200 từ' : '500-800 từ'} (không tính code blocks)
- **Chất lượng:** Nội dung phải đầy đủ, chi tiết, có thể học ngay được
- **Không được:** Chỉ là outline, summary, hoặc danh sách bullet points ngắn
- **${isAdvancedLesson ? 'QUAN TRỌNG: Bài học này là bài nâng cao, cần nội dung CHI TIẾT, KỸ THUẬT, không giới thiệu lại kiến thức cơ bản' : ''}**

## 2. Format Output (QUAN TRỌNG)
- **BẮT BUỘC:** Trả về HTML (KHÔNG phải Markdown)
- **HTML tags:** Sử dụng các HTML tags chuẩn:
  - Headings: <h1>, <h2>, <h3> (không dùng # ## ###)
  - Paragraphs: <p> (không dùng dòng trống)
  - Bold: <strong> hoặc <b> (không dùng **text**)
  - Italic: <em> hoặc <i> (không dùng *text*)
  - Lists: <ul><li> cho bullet, <ol><li> cho numbered (không dùng - hoặc 1.)
  - **Code blocks (QUAN TRỌNG):** 
    *   PHẢI dùng <pre><code class="language-xxx">code content</code></pre>
    *   BẮT BUỘC có class="language-xxx" để hiển thị tên ngôn ngữ trên UI
    *   Ngôn ngữ phổ biến: python, javascript, java, cpp, csharp, sql, plsql, html, css, json, bash
    *   Tự động detect ngôn ngữ từ code content (ví dụ: Python code → class="language-python")
    *   KHÔNG dùng \`\`\`markdown hoặc \`\`\`code
  - Inline code: <code> (không dùng \`code\`)
  - Links: <a href="url">text</a> (không dùng [text](url))
  - Line breaks: <br> hoặc </p><p> (không dùng 2 spaces)
- **Lý do:** Nội dung sẽ được hiển thị trực tiếp trong editor HTML, cần format HTML để hiển thị đúng (H1, H2, bold, code blocks với language label, etc.)

## 3. Cấu trúc nội dung (BẮT BUỘC)
${isAdvancedLesson ? `### LƯU Ý QUAN TRỌNG CHO BÀI HỌC NÂNG CAO:
- **KHÔNG giới thiệu lại** các khái niệm cơ bản đã học ở bài trước (ví dụ: không giải thích "File là gì", "Đọc file là gì" nếu đã học ở bài trước)
- **Đi thẳng vào nội dung:** Bắt đầu ngay với implementation, kỹ thuật, best practices
- **Chi tiết kỹ thuật:** Đi sâu vào cách làm, edge cases, common pitfalls
- **Ví dụ phức tạp:** Ví dụ phải thực tế, phức tạp, không chỉ demo đơn giản

Nội dung PHẢI bao gồm các phần sau (BỎ QUA phần giới thiệu cơ bản):` : 'Nội dung PHẢI bao gồm các phần sau theo thứ tự:'}

### ${isAdvancedLesson ? 'a) Nội dung chính (Main Content) - BẮT ĐẦU NGAY' : 'a) Giới thiệu (Introduction) - CHỈ CHO BÀI HỌC ĐẦU TIÊN'}
${isAdvancedLesson ? `- **BẮT ĐẦU NGAY:** Đi thẳng vào nội dung kỹ thuật, không giới thiệu lại khái niệm cơ bản
- **Giả định kiến thức:** Học viên đã biết các khái niệm cơ bản từ bài trước
- **Tập trung vào:** Implementation chi tiết, advanced techniques, best practices
- **Ví dụ phức tạp:** Code examples phải thực tế, có error handling, edge cases` : `- Giới thiệu ngắn gọn về chủ đề bài học (CHỈ nếu là bài đầu tiên)
- Mục tiêu học tập rõ ràng
- Tại sao chủ đề này quan trọng`}

### ${isAdvancedLesson ? 'b) Implementation Chi Tiết' : 'b) Nội dung chính (Main Content)'}
- **${isAdvancedLesson ? 'Implementation từng bước:' : 'Các khái niệm quan trọng:'}** ${isAdvancedLesson ? 'Giải thích CHI TIẾT từng bước implementation, không bỏ sót bất kỳ chi tiết nào' : 'Giải thích rõ ràng, dễ hiểu, có ví dụ cụ thể'}
- **Code examples:** PHẢI có code examples đầy đủ, ${isAdvancedLesson ? 'phức tạp, có error handling, edge cases' : 'với syntax highlighting'}
- **Giải thích từng bước:** Nếu có quy trình, giải thích từng bước một cách chi tiết
${isAdvancedLesson ? '- **Best practices:** Đưa ra best practices, common mistakes, và cách tránh\n- **Edge cases:** Xử lý các edge cases, error scenarios\n- **Performance:** Nếu liên quan, đề cập đến performance considerations' : ''}

### ${isAdvancedLesson ? 'c) Ví dụ thực hành nâng cao' : 'c) Ví dụ thực hành (Practical Examples)'}
- Code examples: PHẢI có đầy đủ code, ${isAdvancedLesson ? 'phức tạp, thực tế, có error handling' : 'không chỉ pseudo-code'}
- Ví dụ thực tế: Áp dụng kiến thức vào tình huống cụ thể
- **LƯU Ý:** Code blocks phải có line breaks và indentation đúng chuẩn (4 spaces cho Python)
${isAdvancedLesson ? '- **Real-world scenarios:** Ví dụ phải gần với tình huống thực tế trong công việc\n- **Multiple approaches:** Nếu có nhiều cách làm, so sánh ưu/nhược điểm' : ''}

### ${isAdvancedLesson ? 'd) Advanced Topics & Best Practices' : 'd) Bài tập/Tự kiểm tra (Practice/Check)'}
${isAdvancedLesson ? `- **Advanced techniques:** Các kỹ thuật nâng cao liên quan
- **Best practices:** Best practices và anti-patterns
- **Common pitfalls:** Các lỗi thường gặp và cách tránh
- **Integration:** Cách tích hợp với các phần khác (nếu có)` : `- Bài tập thực hành ngắn (nếu phù hợp)
- Câu hỏi tự kiểm tra (2-3 câu)
- Gợi ý cách áp dụng kiến thức`}

### e) Tóm tắt (Summary)
- Tóm tắt các điểm chính cần nhớ
- Liên kết với các bài học trước/sau (nếu có)
${isAdvancedLesson ? '- **Key takeaways:** Những điểm quan trọng nhất cần nhớ\n- **Next steps:** Gợi ý bài học tiếp theo hoặc cách áp dụng nâng cao' : ''}

## 4. Phù hợp trình độ
- **Beginner:** Giải thích từ cơ bản, không giả định kiến thức trước, nhiều ví dụ đơn giản
- **Intermediate:** Có thể tham chiếu kiến thức cơ bản, ví dụ phức tạp hơn
- **Advanced:** Có thể đi sâu vào chi tiết kỹ thuật, best practices, edge cases

## 5. Lưu ý đặc biệt
- **Code formatting:** Code blocks PHẢI có line breaks và indentation đúng (không được nằm trên 1 dòng)
- **Structured data:** Nếu có bảng dữ liệu, format dạng HTML table (<table><thead><tbody>)
- **Không lặp lại:** Không lặp lại thông tin đã có trong mô tả bài học
- **Tính thực tế:** Nội dung phải thực tế, có thể áp dụng ngay

# OUTPUT FORMAT
Trả về CHỈ JSON, không có text thêm:

JSON format:
{
  "content": "<h2>Tiêu đề phần</h2><p>Nội dung chi tiết đầy đủ của bài học (HTML format, ít nhất ${isAdvancedLesson ? '800-1200' : '500-800'} từ, có đầy đủ các phần yêu cầu)</p>"
}

# VÍ DỤ HTML FORMAT ĐÚNG

## Ví dụ cho bài học cơ bản:
HTML example:
<h2>Giới thiệu</h2>
<p>Giới thiệu về chủ đề, mục tiêu học tập.</p>

<h2>Khái niệm quan trọng</h2>
<p>Giải thích chi tiết các khái niệm.</p>

<h3>Ví dụ minh họa</h3>
<pre><code class="language-python">def example():
    # Code đầy đủ với indentation đúng
    pass
</code></pre>

<h2>Bài tập thực hành</h2>
<ul>
<li>Bài tập 1</li>
<li>Bài tập 2</li>
</ul>

<h2>Tóm tắt</h2>
<p>Điểm chính cần nhớ.</p>

## Ví dụ cho bài học nâng cao (từ bài 5+):
HTML example:
<h2>Implementation Chi Tiết</h2>
<p>Đi thẳng vào implementation, không giới thiệu lại khái niệm cơ bản.</p>

<h3>Bước 1: Tên bước cụ thể</h3>
<p>Giải thích chi tiết từng bước, có code đầy đủ.</p>

<pre><code class="language-python">def advanced_example():
    try:
        # Code phức tạp với error handling
        with open('file.txt', 'r') as f:
            data = f.read()
    except FileNotFoundError:
        pass
    except Exception as e:
        logger.error(f"Error: {e}")
</code></pre>

<h3>Best Practices</h3>
<p>Best practices cụ thể, không chỉ lý thuyết.</p>

<h2>Ví dụ Thực Hành Nâng Cao</h2>
<p>Ví dụ phức tạp, gần với tình huống thực tế.</p>

# LƯU Ý CUỐI CÙNG
${isAdvancedLesson ? `- **QUAN TRỌNG:** Đây là bài học số ${lessonNumber}, học viên đã có kiến thức cơ bản. KHÔNG giới thiệu lại khái niệm cơ bản như "File là gì", "Đọc file là gì".
- **Tập trung vào:** Implementation chi tiết, best practices, edge cases, error handling
- **Độ sâu:** Đi sâu vào chi tiết kỹ thuật, không chỉ surface level
- **Ví dụ:** Phải phức tạp, thực tế, có error handling và edge cases` : `- Đây là bài học cơ bản, có thể giới thiệu khái niệm từ đầu
- Tập trung vào giải thích rõ ràng, dễ hiểu
- Ví dụ đơn giản, dễ theo dõi`}
- **QUAN TRỌNG:** Trả về HTML (không phải Markdown) để hiển thị đúng trong editor
- **QUAN TRỌNG VỀ CODE BLOCKS:** MỌI code block PHẢI có class="language-xxx" (ví dụ: class="language-python" cho Python code, class="language-sql" cho SQL code, class="language-javascript" cho JavaScript code). Điều này BẮT BUỘC để hiển thị tên ngôn ngữ trên UI của học viên và trong editor.

Bắt đầu tạo nội dung ngay bây giờ:\`;`;

      // Use Groq first, fallback to Gemini
      logger.info('[AIService] Attempting to generate lesson content with AI (Groq first, then Gemini)...');
      const startTime = Date.now();
      
      // Use callAIWithFallback để tự động dùng Groq trước
      const aiResponse = await this.callAIWithFallback(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
      }, 2048);

      const duration = Date.now() - startTime;
      logger.info('[AIService] ✅ AI response received for lesson content', { 
        duration: `${duration}ms`,
        provider: this.useGroq ? 'Groq (primary)' : 'Gemini (fallback)'
      });

      // Text đã được format từ callAIWithFallback
      const text = aiResponse.response;

      /**
       * Extract and normalize lesson content from raw Gemini text.
       * Handles cases:
       * - Plain markdown / HTML
       * - JSON: { "content": "..." }
       * - Nested JSON: { "content": "{ \"content\": \"...\" }" }
       * - Fenced blocks: ```markdown ... ```
       * - Optional "json" prefix
       */
      const extractContent = (raw: string): string => {
        if (!raw) return '';
        let current = raw.trim();

        // Remove leading "json" keyword if present
        current = current.replace(/^json\s*/i, '').trim();

        // If wrapped in fence ```...```, strip outer fence first
        if (current.startsWith('```')) {
          current = current.replace(/^```(?:markdown|json)?\s*/i, '');
          current = current.replace(/```$/i, '').trim();
        }

        // Try up to 2 levels of JSON parsing to get to the real content string
        const tryParseJsonContent = (value: string): string => {
          let v = value.trim();
          try {
            const parsed: any = JSON.parse(v);
            // If parsed is a plain string, use it
            if (typeof parsed === 'string') {
              return parsed;
            }
            // Common key locations
            const candidate =
              typeof parsed?.content === 'string'
                ? parsed.content
                : typeof parsed?.data?.content === 'string'
                ? parsed.data.content
                : undefined;
            if (candidate) {
              return candidate;
            }
          } catch {
            // ignore parse errors, fall back to original
          }
          return v;
        };

        // First level parse
        current = tryParseJsonContent(current);
        // Second level parse (handles nested "{ \"content\": \"...\" }" as string)
        current = tryParseJsonContent(current);

        // Strip outer { "content": "..." } if still present but not valid JSON string
        const braceMatch = current.match(/^\{\s*"content"\s*:\s*([\s\S]*?)\}\s*$/i);
        if (braceMatch && braceMatch[1]) {
          current = braceMatch[1].trim();
          // Remove starting/ending quotes if they wrap the whole value
          if (
            (current.startsWith('"') && current.endsWith('"')) ||
            (current.startsWith("'") && current.endsWith("'"))
          ) {
            current = current.slice(1, -1);
          }
        }

        // Remove any remaining fences
        current = current.replace(/^```(?:markdown|json)?\s*/i, '');
        current = current.replace(/```$/i, '');

        // Remove stray custom tags that may appear
        current = current.replace(/<\/?tên_gói>/gi, '');

        return current.trim();
      };

      const cleaned = extractContent(text);

      return {
        content: cleaned,
      };
    } catch (error) {
      logger.error('[AIService] Generate lesson content error:', error);
      this.mapGeminiError(error);
    }
  }
}

