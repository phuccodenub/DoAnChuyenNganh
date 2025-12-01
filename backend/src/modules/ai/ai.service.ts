/**
 * AI Service
 * Business logic for AI features using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../../config/env.config';
import logger from '../../utils/logger.util';
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
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
      // Build system instruction with context
      let systemInstruction = 'Bạn là một trợ lý AI thông minh cho hệ thống học tập trực tuyến (LMS). ';
      systemInstruction += 'Nhiệm vụ của bạn là trả lời câu hỏi của học viên về khóa học, bài tập, và các vấn đề liên quan đến học tập. ';
      systemInstruction += 'Hãy trả lời một cách rõ ràng, chính xác và hữu ích. ';

      if (request.context?.courseTitle) {
        systemInstruction += `\n\nThông tin khóa học hiện tại:\n`;
        systemInstruction += `- Tiêu đề: ${request.context.courseTitle}\n`;
        if (request.context.courseDescription) {
          systemInstruction += `- Mô tả: ${request.context.courseDescription}\n`;
        }
      }

      // Build conversation history (limit to last 10 messages to avoid token limit)
      const history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        const recentHistory = request.conversationHistory.slice(-10);
        for (const msg of recentHistory) {
          if (msg.role !== 'system') {
            history.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }],
            });
          }
        }
      }

      // Start chat with history and system instruction
      const chat = this.model.startChat({
        history: history,
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: request.options?.temperature ?? env.ai.gemini.temperature,
          maxOutputTokens: request.options?.maxTokens ?? env.ai.gemini.maxTokens,
        },
      });

      // Get response
      const result = await chat.sendMessage(messageWithContext);
      const response = result.response;
      const text = response.text();

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
      logger.error('[AIService] Chat error:', error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const text = response.text();

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
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

