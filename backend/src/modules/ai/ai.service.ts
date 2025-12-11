/**
 * AI Service
 * Business logic for AI features using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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
} from './ai.types';

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
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
    } else {
      logger.warn('[AIService] Gemini API key not configured - AI features will be disabled');
    }
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
   */
  async chatWithLessonContext(request: LessonChatRequest): Promise<ChatResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
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

    const maxTokens = Math.min(env.ai.gemini.maxTokens, 512);
    const attempts = 3;
    const delays = [300, 800, 1600];

    for (let i = 0; i < attempts; i++) {
      try {
        const result = await this.model.generateContent(prompt, {
          generationConfig: {
            temperature: request.options?.temperature ?? env.ai.gemini.temperature,
            maxOutputTokens: request.options?.maxTokens ?? maxTokens,
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
   * Chat with AI assistant
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      // Build instruction + context as a single prompt to avoid invalid system_instruction
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

      const maxTokens = Math.min(env.ai.gemini.maxTokens, 512);
      const attempts = 3;
      const delays = [300, 800, 1600];

      for (let i = 0; i < attempts; i++) {
        try {
          const result = await this.model.generateContent(prompt, {
            generationConfig: {
              temperature: request.options?.temperature ?? env.ai.gemini.temperature,
              maxOutputTokens: request.options?.maxTokens ?? maxTokens,
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
        } catch (error) {
          const status = (error as any)?.status || (error as any)?.response?.status;
          if (i < attempts - 1 && (status === 429 || status === 503)) {
            const delay = delays[i] ?? 1200;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          logger.error('[AIService] Chat error:', error);
          this.mapGeminiError(error);
        }
      }

    // Nếu hết retry mà vẫn lỗi, ném lỗi quá tải
    throw new ApiError('AI đang quá tải, vui lòng thử lại sau.', 503);
    }
    catch (error) {
      logger.error('[AIService] Chat error:', error);
      this.mapGeminiError(error);
    }
  }

  /**
   * Generate content directly (for moderation, no conversation history needed)
   */
  async generateContent(request: { prompt: string; options?: { temperature?: number; maxTokens?: number } }): Promise<ChatResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      // Use generateContent with simple string prompt (works with all models including gemini-2.5-flash)
      // For @google/generative-ai SDK, use simple string format
      const result = await this.model.generateContent(request.prompt, {
        generationConfig: {
          temperature: request.options?.temperature ?? env.ai.gemini.temperature,
          maxOutputTokens: request.options?.maxTokens ?? env.ai.gemini.maxTokens,
        },
      });

      const response = result.response;
      const text = formatAiAnswer(response.text());

      // Get usage information if available
      const usage = response.usageMetadata();

      return {
        response: text,
        usage: usage ? {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        } : undefined,
      };
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
      const prompt = `Tạo ${request.numberOfQuestions || 5} câu hỏi ${request.difficulty || 'medium'} từ nội dung khóa học sau:

${request.courseContent}

Yêu cầu:
- Loại câu hỏi: ${request.questionType || 'multiple_choice'}
- Độ khó: ${request.difficulty || 'medium'}
- Mỗi câu hỏi phải có đáp án đúng và giải thích
- Trả về dưới dạng JSON với format:
{
  "questions": [
    {
      "question": "Câu hỏi",
      "type": "${request.questionType || 'multiple_choice'}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Giải thích",
      "difficulty": "${request.difficulty || 'medium'}"
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
}

