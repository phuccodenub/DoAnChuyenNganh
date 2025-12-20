/**
 * AI Tutor Service
 * Chatbot hỗ trợ học tập thời gian thực
 */

import logger from '../../../utils/logger.util';
import { AIOrchestrator } from '../orchestrator/ai-orchestrator';
import { QuestionClassification } from '../orchestrator/ai-orchestrator';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  userId: string;
  courseId?: string;
  lessonId?: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  text: string;
  model: string;
  provider: string;
  tier: string;
  latency: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export class AITutorService {
  private orchestrator: AIOrchestrator;

  constructor() {
    this.orchestrator = new AIOrchestrator();
    logger.info('[AITutorService] Service initialized');
  }

  /**
   * Chat với AI Tutor
   */
  async chat(
    request: ChatRequest,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(request);

      // Build full prompt với context
      let fullPrompt = '';

      // Add conversation history (last 6 messages)
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        fullPrompt += 'Lịch sử hội thoại gần đây:\n';
        const recentHistory = request.conversationHistory.slice(-6);
        
        recentHistory.forEach((msg, idx) => {
          const label = msg.role === 'user' ? 'Học viên' : 'Trợ giảng';
          fullPrompt += `${idx + 1}. ${label}: ${this.truncate(msg.content, 200)}\n`;
        });
        
        fullPrompt += '\n';
      }

      // Add current question
      fullPrompt += `Câu hỏi hiện tại:\n${request.message}`;

      // Classify question
      const classification = this.orchestrator.classifyQuestion(request.message);
      
      logger.info(`[AITutorService] Processing question: type=${classification.type}, complexity=${classification.complexity}`);

      // Generate response
      const response = await this.orchestrator.generate(fullPrompt, {
        classification,
        systemPrompt,
        stream: !!onChunk,
        onChunk,
        maxTokens: 2048,
      });

      logger.info(`[AITutorService] Response generated: provider=${response.provider}, latency=${response.latency}ms`);

      return {
        text: response.text,
        model: response.model,
        provider: response.provider,
        tier: response.tier,
        latency: response.latency,
        usage: response.usage,
      };
    } catch (error: any) {
      logger.error('[AITutorService] Error generating response:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Build system prompt dựa trên context
   */
  private buildSystemPrompt(request: ChatRequest): string {
    let prompt = 'Bạn là trợ giảng AI thông minh và thân thiện cho nền tảng học trực tuyến.\n\n';
    
    prompt += 'QUY TẮC TRẢLỜI:\n';
    prompt += '1. Trả lời ngắn gọn, rõ ràng và hữu ích (tối đa 300 từ)\n';
    prompt += '2. Sử dụng markdown để format câu trả lời\n';
    prompt += '3. Nếu câu hỏi về code:\n';
    prompt += '   - Đưa ra ví dụ code cụ thể\n';
    prompt += '   - Sử dụng code block với syntax highlighting\n';
    prompt += '   - Giải thích từng bước\n';
    prompt += '4. Nếu câu hỏi phức tạp:\n';
    prompt += '   - Chia nhỏ thành các bước dễ hiểu\n';
    prompt += '   - Sử dụng bullet points hoặc numbered list\n';
    prompt += '5. Nếu không chắc chắn:\n';
    prompt += '   - Thừa nhận và đưa ra gợi ý tìm hiểu thêm\n';
    prompt += '   - Đề xuất tài liệu hoặc người hỗ trợ\n';
    prompt += '6. Luôn khuyến khích học viên tự suy nghĩ và giải quyết vấn đề\n';
    prompt += '7. Tránh đưa ra toàn bộ bài giải hoặc đáp án trực tiếp\n\n';

    if (request.courseId) {
      prompt += `Ngữ cảnh: Học viên đang học khóa học ID: ${request.courseId}\n`;
    }

    if (request.lessonId) {
      prompt += `Bài học hiện tại: ID ${request.lessonId}\n`;
    }

    prompt += '\nHãy trả lời câu hỏi của học viên:\n';

    return prompt;
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Get available AI providers
   */
  getAvailableProviders() {
    return this.orchestrator.getAvailableProviders();
  }
}
