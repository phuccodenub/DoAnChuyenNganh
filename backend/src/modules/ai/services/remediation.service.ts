/**
 * Remediation Service MVP-0
 * Sau khi học sinh làm quiz, tạo "remediation cards" cho câu sai + 3 câu luyện tập mới.
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import logger from '../../../utils/logger.util';
import env from '../../../config/env.config';
import { parseJsonFromLlmText } from '../../../utils/llm-json.util';
import { AICacheService } from './ai-cache.service';
import { GroqProvider } from '../providers/groq.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';
import QuizAttempt from '../../../models/quiz-attempt.model';
import QuizAnswer from '../../../models/quiz-answer.model';
import QuizQuestion from '../../../models/quiz-question.model';
import QuizOption from '../../../models/quiz-option.model';
import Quiz from '../../../models/quiz.model';

// ==================== TYPES ====================

export interface RemediationCard {
  questionId: string;
  originalQuestion: string;
  studentAnswer: string;
  correctAnswer: string;
  misconception: string;           // "Bạn sai ở đâu?"
  conceptExplanation: string;      // "Khái niệm nền" (1 đoạn ngắn)
  practiceQuestions: PracticeQuestion[];  // "Luyện nhanh" (3 câu)
}

export interface PracticeQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
}

export interface RemediationResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  incorrectCount: number;
  score: number;
  maxScore: number;
  cards: RemediationCard[];
  generatedAt: Date;
  metadata: {
    model: string;
    processingTimeMs: number;
    cached: boolean;
  };
}

export interface RemediationRequest {
  attemptId: string;
  userId: string;
  maxCards?: number;  // Limit số câu sai xử lý (default 5)
}

// ==================== SERVICE ====================

export class RemediationService {
  private groqProvider: GroqProvider;
  private googleProvider: GoogleAIProvider;
  private cacheService: AICacheService;

  private readonly cacheTtl = 24 * 60 * 60; // 24 hours

  constructor() {
    // Primary: Groq for fast generation
    this.groqProvider = new GroqProvider({
      apiKey: env.ai.groq.apiKey,
      model: env.ai.groq.models.default, // llama-3.3-70b-versatile
      temperature: 0.5,
      maxTokens: 4096,
      timeout: 60000,
    });

    // Fallback: Google Flash
    this.googleProvider = new GoogleAIProvider({
      apiKey: env.ai.gemini.apiKeys[0],
      model: env.ai.gemini.models.flash3,
      temperature: 0.5,
      maxTokens: 4096,
      timeout: 60000,
    });

    this.cacheService = new AICacheService();
  }

  /**
   * Generate remediation cards for incorrect answers in a quiz attempt
   */
  async generateRemediation(request: RemediationRequest): Promise<RemediationResult> {
    const startTime = Date.now();
    logger.info(`[Remediation] Generating for attempt ${request.attemptId}`);

    // 1. Check cache first
    const cacheKey = `remediation:${request.attemptId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[Remediation] Returning cached result');
      const result = JSON.parse(cached) as RemediationResult;
      result.metadata.cached = true;
      return result;
    }

    // 2. Fetch attempt data with all related info
    const attemptData = await this.fetchAttemptData(request.attemptId, request.userId);
    if (!attemptData) {
      throw new Error('Quiz attempt not found or not owned by user');
    }

    // 3. Get incorrect answers
    const incorrectAnswers = attemptData.answers.filter((a: any) => !a.is_correct);
    if (incorrectAnswers.length === 0) {
      return {
        attemptId: request.attemptId,
        quizId: attemptData.quiz.id,
        quizTitle: attemptData.quiz.title,
        totalQuestions: attemptData.answers.length,
        incorrectCount: 0,
        score: Number(attemptData.attempt.score) || 0,
        maxScore: Number(attemptData.attempt.max_score) || 0,
        cards: [],
        generatedAt: new Date(),
        metadata: {
          model: 'none',
          processingTimeMs: Date.now() - startTime,
          cached: false,
        },
      };
    }

    // 4. Limit number of cards to process
    const maxCards = request.maxCards || 5;
    const answersToProcess = incorrectAnswers.slice(0, maxCards);

    // 5. Generate remediation cards
    const cards: RemediationCard[] = [];
    for (const answer of answersToProcess) {
      try {
        const card = await this.generateSingleCard(answer, attemptData.quiz.title);
        cards.push(card);
      } catch (error: any) {
        logger.warn(`[Remediation] Failed to generate card for question ${answer.question_id}: ${error.message}`);
      }
    }

    const result: RemediationResult = {
      attemptId: request.attemptId,
      quizId: attemptData.quiz.id,
      quizTitle: attemptData.quiz.title,
      totalQuestions: attemptData.answers.length,
      incorrectCount: incorrectAnswers.length,
      score: Number(attemptData.attempt.score) || 0,
      maxScore: Number(attemptData.attempt.max_score) || 0,
      cards,
      generatedAt: new Date(),
      metadata: {
        model: env.ai.groq.models.default,
        processingTimeMs: Date.now() - startTime,
        cached: false,
      },
    };

    // 6. Cache result
    await this.cacheService.set(cacheKey, JSON.stringify(result), this.cacheTtl);
    logger.info(`[Remediation] Generated ${cards.length} cards in ${Date.now() - startTime}ms`);

    return result;
  }

  /**
   * Fetch quiz attempt data with questions and answers
   */
  private async fetchAttemptData(attemptId: string, userId: string) {
    try {
      const attempt = await QuizAttempt.findOne({
        where: { id: attemptId, user_id: userId },
        include: [
          {
            model: Quiz,
            as: 'quiz',
          },
        ],
      });

      if (!attempt) return null;

      const answers = await QuizAnswer.findAll({
        where: { attempt_id: attemptId },
        include: [
          {
            model: QuizQuestion,
            as: 'question',
            include: [
              {
                model: QuizOption,
                as: 'options',
              },
            ],
          },
        ],
      });

      return {
        attempt: attempt.toJSON(),
        quiz: (attempt as any).quiz?.toJSON() || {},
        answers: answers.map((a: any) => a.toJSON()),
      };
    } catch (error: any) {
      logger.error('[Remediation] Error fetching attempt data:', error);
      throw new Error('Failed to fetch quiz attempt data');
    }
  }

  /**
   * Generate a single remediation card for one incorrect answer
   */
  private async generateSingleCard(
    answer: any,
    quizTitle: string
  ): Promise<RemediationCard> {
    const question = answer.question;
    const options = question?.options || [];

    // Get student's answer text
    const selectedOptionId = answer.selected_option_id;
    const selectedOption = options.find((o: any) => o.id === selectedOptionId);
    const studentAnswerText = selectedOption?.option_text || 'N/A';

    // Get correct answer text
    const correctOption = options.find((o: any) => o.is_correct);
    const correctAnswerText = correctOption?.option_text || 'N/A';

    // Build prompt
    const prompt = this.buildRemediationPrompt({
      quizTitle,
      questionText: question.question_text,
      questionType: question.question_type,
      options: options.map((o: any) => o.option_text),
      studentAnswer: studentAnswerText,
      correctAnswer: correctAnswerText,
      existingExplanation: question.explanation,
    });

    // Call AI
    let response: string;
    try {
      const result = await this.groqProvider.generateContent({
        prompt,
        systemPrompt: this.getSystemPrompt(),
      });
      response = result.text;
    } catch (error: any) {
      logger.warn('[Remediation] Groq failed, falling back to Google:', error.message);
      const result = await this.googleProvider.generateContent({
        prompt,
        systemPrompt: this.getSystemPrompt(),
      });
      response = result.text;
    }

    // Parse response
    const parsed = this.parseRemediationResponse(response);

    return {
      questionId: question.id,
      originalQuestion: question.question_text,
      studentAnswer: studentAnswerText,
      correctAnswer: correctAnswerText,
      misconception: parsed.misconception,
      conceptExplanation: parsed.conceptExplanation,
      practiceQuestions: parsed.practiceQuestions,
    };
  }

  private getSystemPrompt(): string {
    return `Bạn là một trợ giảng AI thông minh, chuyên giúp học sinh hiểu sai lầm trong bài quiz và luyện tập thêm.

Nhiệm vụ:
1. Phân tích câu trả lời sai của học sinh
2. Giải thích ngắn gọn lỗi sai (misconception)
3. Cung cấp khái niệm nền tảng cần nắm
4. Tạo 3 câu hỏi luyện tập mới cùng chủ đề nhưng khác dữ liệu/ví dụ

Quy tắc quan trọng:
- KHÔNG đưa đáp án hoàn chỉnh cho bài gốc nếu quiz đang graded
- Tập trung vào giải thích WHY (tại sao sai) và HOW (làm thế nào đúng)
- Câu luyện tập phải cùng dạng nhưng đổi số/ngữ cảnh

Trả về JSON theo format được yêu cầu.`;
  }

  private buildRemediationPrompt(data: {
    quizTitle: string;
    questionText: string;
    questionType: string;
    options: string[];
    studentAnswer: string;
    correctAnswer: string;
    existingExplanation?: string;
  }): string {
    const optionsText = data.options.map((o, i) => `  ${i + 1}. ${o}`).join('\n');

    return `Quiz: "${data.quizTitle}"

Câu hỏi gốc:
${data.questionText}

Các lựa chọn:
${optionsText}

Học sinh đã chọn: "${data.studentAnswer}"
Đáp án đúng: "${data.correctAnswer}"
${data.existingExplanation ? `\nGiải thích có sẵn: ${data.existingExplanation}` : ''}

Hãy tạo remediation card cho học sinh. Trả về JSON với format:
{
  "misconception": "Giải thích ngắn gọn tại sao học sinh sai (1-2 câu)",
  "conceptExplanation": "Khái niệm nền tảng cần nắm (2-4 câu, dễ hiểu)",
  "practiceQuestions": [
    {
      "question": "Câu hỏi luyện tập 1",
      "type": "${data.questionType}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Giải thích ngắn"
    },
    {
      "question": "Câu hỏi luyện tập 2",
      "type": "${data.questionType}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "Giải thích ngắn"
    },
    {
      "question": "Câu hỏi luyện tập 3",
      "type": "${data.questionType}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2,
      "explanation": "Giải thích ngắn"
    }
  ]
}

Lưu ý:
- correctAnswer là index (0-based) của đáp án đúng trong mảng options
- Câu luyện tập phải cùng chủ đề nhưng đổi dữ liệu/ngữ cảnh
- Giữ độ khó tương đương câu gốc`;
  }

  private parseRemediationResponse(response: string): {
    misconception: string;
    conceptExplanation: string;
    practiceQuestions: PracticeQuestion[];
  } {
    try {
      const parsed = parseJsonFromLlmText(response);
      
      // Validate and sanitize
      const misconception = typeof parsed.misconception === 'string' 
        ? parsed.misconception 
        : 'Không thể xác định lỗi sai cụ thể.';

      const conceptExplanation = typeof parsed.conceptExplanation === 'string'
        ? parsed.conceptExplanation
        : 'Vui lòng xem lại bài học liên quan.';

      const practiceQuestions: PracticeQuestion[] = [];
      if (Array.isArray(parsed.practiceQuestions)) {
        for (let i = 0; i < Math.min(parsed.practiceQuestions.length, 3); i++) {
          const pq = parsed.practiceQuestions[i];
          if (pq && typeof pq.question === 'string') {
            practiceQuestions.push({
              id: `practice-${Date.now()}-${i}`,
              question: pq.question,
              type: pq.type || 'single_choice',
              options: Array.isArray(pq.options) ? pq.options : [],
              correctAnswer: typeof pq.correctAnswer === 'number' ? pq.correctAnswer : 0,
              explanation: pq.explanation || '',
            });
          }
        }
      }

      // Ensure we have at least some practice questions
      while (practiceQuestions.length < 3) {
        practiceQuestions.push({
          id: `practice-fallback-${practiceQuestions.length}`,
          question: 'Câu hỏi luyện tập không khả dụng',
          type: 'single_choice',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Vui lòng thử lại sau.',
        });
      }

      return { misconception, conceptExplanation, practiceQuestions };
    } catch (error: any) {
      logger.error('[Remediation] Failed to parse AI response:', error);
      return {
        misconception: 'Không thể phân tích lỗi sai.',
        conceptExplanation: 'Vui lòng xem lại bài học liên quan.',
        practiceQuestions: [
          {
            id: `practice-error-0`,
            question: 'Câu hỏi luyện tập không khả dụng',
            type: 'single_choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Vui lòng thử lại sau.',
          },
          {
            id: `practice-error-1`,
            question: 'Câu hỏi luyện tập không khả dụng',
            type: 'single_choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Vui lòng thử lại sau.',
          },
          {
            id: `practice-error-2`,
            question: 'Câu hỏi luyện tập không khả dụng',
            type: 'single_choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Vui lòng thử lại sau.',
          },
        ],
      };
    }
  }

  /**
   * Clear remediation cache for a specific attempt
   */
  async clearCache(attemptId: string): Promise<void> {
    const cacheKey = `remediation:${attemptId}`;
    await this.cacheService.delete(cacheKey);
    logger.info(`[Remediation] Cache cleared for attempt ${attemptId}`);
  }
}
