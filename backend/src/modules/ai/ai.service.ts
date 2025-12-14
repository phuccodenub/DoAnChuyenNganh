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
   * Generate feedback for assignment submission
   */
  async generateFeedback(request: GenerateFeedbackRequest): Promise<GenerateFeedbackResponse> {
    if (!this.model) {
      throw new Error('AI service is not available. Please configure GEMINI_API_KEY.');
    }

    try {
      const prompt = `Bạn là giảng viên chấm bài. Đánh giá bài nộp sau và tạo feedback chi tiết:

Yêu cầu bài tập:
${request.assignmentInstructions}

${request.rubric ? `Rubric: ${JSON.stringify(request.rubric)}` : ''}
${request.maxScore ? `Điểm tối đa: ${request.maxScore}` : ''}

Bài nộp của học viên:
${this.truncate(request.submissionContent, 3000)}

Yêu cầu:
- Đánh giá bài nộp một cách công bằng và xây dựng
- Liệt kê điểm mạnh (2-3 điểm)
- Liệt kê điểm cần cải thiện (2-3 điểm)
- Đưa ra feedback chi tiết, cụ thể
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
          maxOutputTokens: 1024,
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
      
      const prompt = `Bạn là chuyên gia viết nội dung khóa học. Tạo nội dung chi tiết, đầy đủ cho bài học sau:

Tiêu đề khóa học: ${request.courseTitle}
${request.courseDescription ? `Mô tả khóa học: ${request.courseDescription}` : ''}
${request.sectionTitle ? `Chương: ${request.sectionTitle}` : ''}
${request.level ? `Trình độ: ${request.level}` : ''}

Tiêu đề bài học: ${request.lessonTitle}
Mô tả bài học: ${request.lessonDescription}

Yêu cầu:
- Viết nội dung chi tiết, đầy đủ (ít nhất 500-800 từ)
- Format: HTML hoặc Markdown
- Bao gồm:
  * Giới thiệu về chủ đề
  * Các khái niệm quan trọng (giải thích rõ ràng, dễ hiểu)
  * Ví dụ minh họa cụ thể (nếu có)
  * Bài tập thực hành hoặc câu hỏi tự kiểm tra (nếu phù hợp)
  * Tóm tắt và điểm chính cần nhớ
- Nội dung phải có thể học ngay, không chỉ là outline
- Phù hợp với trình độ ${request.level || 'beginner'}

Trả về JSON format:
{
  "content": "Nội dung chi tiết đầy đủ của bài học (HTML hoặc markdown, ít nhất 500-800 từ)"
}`;

      logger.info('[AIService] Calling Gemini API for lesson content generation');
      const startTime = Date.now();
      
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048, // Đủ cho nội dung một lesson
        },
      });

      const duration = Date.now() - startTime;
      logger.info('[AIService] Gemini API response received for lesson content', { duration: `${duration}ms` });

      const response = result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);

        return {
          content: parsed.content || '',
        };
      } catch (parseError) {
        logger.error('[AIService] Failed to parse lesson content JSON:', parseError);
        // Fallback: trả về text trực tiếp nếu không parse được JSON
        return {
          content: text.trim(),
        };
      }
    } catch (error) {
      logger.error('[AIService] Generate lesson content error:', error);
      this.mapGeminiError(error);
    }
  }
}

