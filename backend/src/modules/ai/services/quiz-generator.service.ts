/**
 * Quiz Generator Service
 * Implements 3-stage pipeline: Generate → Validate → Polish
 * Tích hợp với ProxyPal và Google AI providers
 */

import crypto from 'crypto';
import logger from '../../../utils/logger.util';
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';
import { AICacheService } from './ai-cache.service';
import { LessonAnalysisService } from './lesson-analysis.service';
import env from '../../../config/env.config';

export interface QuizGenerationRequest {
  courseId: string;
  lessonId?: string;
  content: string;
  contentType?: 'text' | 'video' | 'pdf';
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
  topicFocus?: string[];
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
  userId: string;
  isPremium?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: string | number | number[];
  explanation: string;
  difficulty: string;
  bloomLevel: string;
  topic?: string;
  points: number;
}

export interface QuizGenerationResult {
  quizId: string;
  questions: QuizQuestion[];
  metadata: {
    generatedAt: Date;
    model: string;
    processingTime: number;
    tokenUsage?: {
      input: number;
      output: number;
      total: number;
    };
    cost: number;
    stages: string[];
  };
}

interface ContentAnalysis {
  tokenCount: number;
  isTechnical: boolean;
  topics: string[];
  complexity: 'low' | 'medium' | 'high';
}

interface ModelSelection {
  provider: string;
  model: string;
  rationale: string;
  cost: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

export class QuizGeneratorService {
  private proxypalGemini: ProxyPalProvider;
  private proxypalQwen: ProxyPalProvider;
  private googleFlash: GoogleAIProvider;
  private cacheService: AICacheService;
  private lessonAnalysisService: LessonAnalysisService;

  constructor() {
    // Initialize providers
    // Note: Gemini models blocked in ProxyPal, using GPT instead
    this.proxypalGemini = new ProxyPalProvider({
      baseUrl: env.ai.proxypal?.baseUrl || 'http://127.0.0.1:8317',
      apiKey: env.ai.proxypal?.apiKey || 'proxypal-local',
      model: 'gpt-5.2',
      temperature: 0.7,
      maxTokens: 8192,
      timeout: 60000,
    });

    this.proxypalQwen = new ProxyPalProvider({
      baseUrl: env.ai.proxypal?.baseUrl || 'http://127.0.0.1:8317',
      apiKey: env.ai.proxypal?.apiKey || 'proxypal-local',
      model: 'qwen3-coder-plus',
      temperature: 0.3,
      maxTokens: 4096,
      timeout: 60000,
    });

    this.googleFlash = new GoogleAIProvider({
      apiKey: env.ai.gemini.apiKeys[0],
      model: env.ai.gemini.models.flash3,
      temperature: 0.7,
      maxTokens: 8192,
      timeout: 60000,
    });

    this.cacheService = new AICacheService();
    this.lessonAnalysisService = new LessonAnalysisService();
  }

  /**
   * Generate quiz với 3-stage pipeline
   */
  async generate(request: QuizGenerationRequest): Promise<QuizGenerationResult> {
    const startTime = Date.now();
    const stages: string[] = [];

    logger.info(`[QuizGenerator] Starting quiz generation for course ${request.courseId}`);

    // Step 0: Try to get lesson analysis context for better question generation
    let lessonContext = '';
    if (request.lessonId) {
      try {
        lessonContext = await this.lessonAnalysisService.getLessonContext(request.lessonId);
        if (lessonContext) {
          logger.info(`[QuizGenerator] Added lesson analysis context (${lessonContext.length} chars)`);
        }
      } catch (error: any) {
        logger.warn(`[QuizGenerator] Could not fetch lesson context: ${error.message}`);
      }
    }

    // Step 1: Analyze content and select model
    const contentAnalysis = this.analyzeContent(request.content);
    const modelSelection = await this.selectModel(contentAnalysis, request);

    logger.info(
      `[QuizGenerator] Model selected: ${modelSelection.provider}/${modelSelection.model} - ${modelSelection.rationale}`
    );

    // Step 2: Check cache
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[QuizGenerator] Returning cached result');
      return JSON.parse(cached);
    }

    // Step 3: Generate questions (Stage 1)
    stages.push('generation');
    const questions = await this.generateQuestions(request, modelSelection, lessonContext);
    logger.info(`[QuizGenerator] Generated ${questions.length} questions`);

    // Step 4: Validate (Stage 2) - nếu nội dung kỹ thuật
    let validatedQuestions = questions;
    if (contentAnalysis.isTechnical) {
      stages.push('validation');
      validatedQuestions = await this.validateQuestions(questions, request.content);
      logger.info('[QuizGenerator] Technical validation completed');
    }

    // Step 5: Polish (Stage 3) - chỉ cho premium
    let finalQuestions = validatedQuestions;
    if (request.isPremium) {
      stages.push('polish');
      logger.warn('[QuizGenerator] Premium polish requested but MegaLLM not configured - skipping');
      // TODO: Implement MegaLLM Claude Sonnet integration
    }

    // Step 6: Assign IDs and metadata
    const questionsWithMetadata = finalQuestions.map((q) => ({
      ...q,
      id: crypto.randomUUID(),
      points: this.calculatePoints(q.difficulty, q.bloomLevel),
    }));

    const processingTime = Date.now() - startTime;

    const result: QuizGenerationResult = {
      quizId: crypto.randomUUID(),
      questions: questionsWithMetadata,
      metadata: {
        generatedAt: new Date(),
        model: modelSelection.model,
        processingTime,
        tokenUsage: modelSelection.tokenUsage,
        cost: modelSelection.cost,
        stages,
      },
    };

    // Cache result for 7 days
    await this.cacheService.set(cacheKey, JSON.stringify(result), 7 * 24 * 60 * 60);

    logger.info(`[QuizGenerator] Quiz generation completed in ${processingTime}ms`);
    return result;
  }

  /**
   * Phân tích nội dung
   */
  private analyzeContent(content: string): ContentAnalysis {
    const tokenCount = this.estimateTokens(content);
    const isTechnical = this.detectTechnicalContent(content);
    const topics = this.extractTopics(content);
    const complexity = this.assessComplexity(content);

    return {
      tokenCount,
      isTechnical,
      topics,
      complexity,
    };
  }

  /**
   * Chọn model phù hợp theo chiến lược
   */
  private async selectModel(
    analysis: ContentAnalysis,
    request: QuizGenerationRequest
  ): Promise<ModelSelection> {
    // Nội dung rất lớn (> 1M tokens): Chỉ Gemini 3 Pro có thể xử lý
    if (analysis.tokenCount > 1000000) {
      // Check ProxyPal availability
      if (this.proxypalGemini.isAvailable()) {
        return {
          provider: 'proxypal',
          model: 'gemini-3-pro-preview',
          rationale: 'Nội dung vượt quá 1M tokens, cần context window 2M',
          cost: 0,
        };
      }

      throw new Error('Nội dung quá lớn và ProxyPal không khả dụng. Vui lòng rút gọn nội dung.');
    }

    // Nội dung lớn (100K - 1M tokens): Ưu tiên Gemini 3 Pro
    if (analysis.tokenCount > 100000) {
      if (this.proxypalGemini.isAvailable()) {
        return {
          provider: 'proxypal',
          model: 'gemini-3-pro-preview',
          rationale: 'Nội dung lớn, Gemini 3 Pro cho chất lượng tốt hơn',
          cost: 0,
        };
      }

      // Fallback to Google Flash
      return {
        provider: 'google',
        model: env.ai.gemini.models.flash3,
        rationale: 'Nội dung lớn nhưng ProxyPal không khả dụng, dùng Google Flash',
        cost: 0,
      };
    }

    // Nội dung vừa/nhỏ (< 100K tokens): Google Flash là đủ
    return {
      provider: 'google',
      model: env.ai.gemini.models.flash3,
      rationale: 'Nội dung nhỏ, Google Flash nhanh và miễn phí',
      cost: 0,
    };
  }

  /**
   * Sinh câu hỏi quiz (Stage 1)
   */
  private async generateQuestions(
    request: QuizGenerationRequest,
    modelSelection: ModelSelection,
    lessonContext: string = ''
  ): Promise<QuizQuestion[]> {
    const prompt = this.buildGenerationPrompt(request, lessonContext);

    let response;
    if (modelSelection.provider === 'proxypal') {
      const provider =
        modelSelection.model === 'gemini-3-pro-preview' ? this.proxypalGemini : this.proxypalQwen;

      response = await provider.generateContent({
        prompt,
        temperature: 0.7,
        maxTokens: 8192,
      });

      // Update token usage
      if (response.usage) {
        modelSelection.tokenUsage = {
          input: response.usage.promptTokens || 0,
          output: response.usage.completionTokens || 0,
          total: response.usage.totalTokens || 0,
        };
      }
    } else {
      response = await this.googleFlash.generateContent({
        prompt,
        temperature: 0.7,
        maxTokens: 8192,
      });

      if (response.usage) {
        modelSelection.tokenUsage = {
          input: response.usage.promptTokens || 0,
          output: response.usage.completionTokens || 0,
          total: response.usage.totalTokens || 0,
        };
      }
    }

    return this.parseQuestions(response.text);
  }

  /**
   * Build prompt để sinh quiz
   */
  private buildGenerationPrompt(request: QuizGenerationRequest, lessonContext: string = ''): string {
    const {
      content,
      numberOfQuestions = 10,
      difficulty = 'medium',
      questionTypes = ['single_choice'],
      topicFocus,
      bloomLevel = 'understand',
    } = request;

    const questionTypeDesc = questionTypes
      .map((type) => {
        switch (type) {
          case 'single_choice':
            return 'Trắc nghiệm 1 đáp án đúng';
          case 'multiple_choice':
            return 'Trắc nghiệm nhiều đáp án đúng';
          case 'true_false':
            return 'Đúng/Sai';
          default:
            return type;
        }
      })
      .join(', ');

    let prompt = `Bạn là chuyên gia thiết kế đánh giá giáo dục. Hãy tạo ${numberOfQuestions} câu hỏi quiz chất lượng cao từ nội dung sau.\n\n`;

    // Add lesson analysis context if available
    if (lessonContext) {
      prompt += `**CONTEXT TỪ LESSON ANALYSIS:**\n${lessonContext}\n\n`;
      prompt += `Hãy sử dụng context trên để tạo câu hỏi phù hợp và chính xác hơn.\n\n`;
    }

    prompt += `**NỘI DUNG KHÓA HỌC:**\n${content}\n\n**YÊU CẦU:**
- Số câu hỏi: ${numberOfQuestions}
- Độ khó: ${difficulty}
- Loại câu hỏi: ${questionTypeDesc}
- Mức độ tư duy (Bloom's Taxonomy): ${bloomLevel}
${topicFocus ? `- Tập trung vào chủ đề: ${topicFocus.join(', ')}` : ''}

**ĐỊNH DẠNG CÂU HỎI:**
- Trắc nghiệm 1 đáp án: 4 lựa chọn (A, B, C, D), 1 đáp án đúng
- Trắc nghiệm nhiều đáp án: 4-6 lựa chọn, ít nhất 2 đáp án đúng
- Đúng/Sai: Câu phát biểu + đúng hoặc sai

**NGUYÊN TẮC CHẤT LƯỢNG:**
1. Câu hỏi kiểm tra hiểu biết sâu, không chỉ ghi nhớ
2. Các đáp án sai phải hợp lý nhưng rõ ràng là sai
3. Tránh "tất cả các đáp án trên" hoặc "không đáp án nào đúng"
4. Sử dụng ngôn ngữ rõ ràng, không mơ hồ
5. Giải thích phải mang tính giáo dục, không chỉ xác nhận đáp án

**ĐỊNH DẠNG OUTPUT (JSON nghiêm ngặt):**
{
  "questions": [
    {
      "question": "Nội dung câu hỏi?",
      "type": "single_choice",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0,
      "explanation": "Giải thích chi tiết tại sao đáp án này đúng và các đáp án khác sai",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "topic": "Chủ đề chính của câu hỏi"
    }
  ]
}

**LƯU Ý:**
- Với single_choice: correctAnswer là số index (0-3)
- Với multiple_choice: correctAnswer là mảng index (vd: [0, 2])
- Với true_false: không có options, correctAnswer là "true" hoặc "false"
- Không thêm tiền tố A./B./C./D. vào nội dung options

Hãy tạo ${numberOfQuestions} câu hỏi ngay bây giờ:`;

    return prompt;
  }

  /**
   * Validate câu hỏi kỹ thuật (Stage 2)
   */
  private async validateQuestions(
    questions: QuizQuestion[],
    content: string
  ): Promise<QuizQuestion[]> {
    logger.info('[QuizGenerator] Running technical validation with Qwen Coder');

    // Check if ProxyPal Qwen is available
    if (!this.proxypalQwen.isAvailable()) {
      logger.warn('[QuizGenerator] Qwen Coder not available, skipping validation');
      return questions;
    }

    // Smart content truncation: take first 10K chars (up from 5K)
    // If content is longer, try to include complete sentences
    let contentForValidation = content;
    if (content.length > 10000) {
      contentForValidation = content.substring(0, 10000);
      // Try to cut at sentence boundary
      const lastPeriod = contentForValidation.lastIndexOf('.');
      const lastNewline = contentForValidation.lastIndexOf('\n');
      const cutPoint = Math.max(lastPeriod, lastNewline);
      if (cutPoint > 8000) { // Only cut at boundary if we're not losing too much
        contentForValidation = contentForValidation.substring(0, cutPoint + 1);
      }
    }

    const validationPrompt = `Bạn là chuyên gia kỹ thuật. Hãy kiểm tra các câu hỏi quiz sau về tính chính xác kỹ thuật:

**NỘI DUNG KHÓA HỌC:**
${contentForValidation}
${content.length > 10000 ? '\n[...Nội dung dài hơn, đã cắt bot]' : ''}

**CÂU HỎI CẦN KIỂM TRA:**
${JSON.stringify(questions, null, 2)}

**YÊU CẦU KIỂM TRA:**
1. Đáp án đúng có chính xác về mặt kỹ thuật?
2. Code examples (nếu có) có đúng syntax và logic?
3. Thuật ngữ kỹ thuật có được sử dụng đúng?
4. Các đáp án sai có logic và không gây nhầm lẫn?

**OUTPUT:**
Trả về cùng cấu trúc JSON với các sửa đổi cần thiết. Nếu tất cả đều đúng, trả về y nguyên.

Chỉ trả về JSON, không có text giải thích:`;

    try {
      const response = await this.proxypalQwen.generateContent({
        prompt: validationPrompt,
        temperature: 0.3,
        maxTokens: 8192,
      });

      return this.parseQuestions(response.text);
    } catch (error) {
      logger.error('[QuizGenerator] Validation failed, using original questions:', error);
      return questions;
    }
  }

  /**
   * Parse JSON response thành QuizQuestion[]
   */
  private parseQuestions(text: string): QuizQuestion[] {
    try {
      // Extract JSON từ response (xử lý markdown code blocks)
      let jsonText = text.trim();

      // Remove markdown code block if present
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to find JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonText);
      const questions = parsed.questions || [];

      // Validate và normalize questions
      return questions.map((q: any) => ({
        id: q.id || crypto.randomUUID(),
        question: q.question,
        type: q.type || 'single_choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        bloomLevel: q.bloomLevel || 'understand',
        topic: q.topic,
        points: q.points || 1,
      }));
    } catch (error) {
      logger.error('[QuizGenerator] Failed to parse questions:', error);
      logger.error('[QuizGenerator] Response text:', text.substring(0, 500));
      throw new Error('Không thể parse câu hỏi từ AI response. Vui lòng thử lại.');
    }
  }

  /**
   * Estimate số tokens
   */
  private estimateTokens(content: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English/Vietnamese
    return Math.ceil(content.length / 4);
  }

  /**
   * Phát hiện nội dung kỹ thuật
   * Improved: check code blocks + keyword density
   */
  private detectTechnicalContent(content: string): boolean {
    // Check for code blocks (strong indicator)
    const hasCodeBlocks = /```[\s\S]*?```|`[^`]+`/.test(content);
    if (hasCodeBlocks) {
      return true;
    }

    // Count technical keywords
    const technicalKeywords = [
      'function',
      'class',
      'algorithm',
      'code',
      'programming',
      'lập trình',
      'database',
      'API',
      'syntax',
      'compile',
      'debug',
      'const',
      'var',
      'let',
      'import',
      'export',
      'async',
      'await',
    ];

    const lowerContent = content.toLowerCase();
    let keywordCount = 0;
    
    for (const keyword of technicalKeywords) {
      // Count occurrences (use word boundaries for accuracy)
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) {
        keywordCount += matches.length;
      }
    }

    // Calculate keyword density (keywords per 1000 chars)
    const density = (keywordCount / content.length) * 1000;
    
    // Consider technical if:
    // 1. High keyword density (>3 keywords per 1000 chars), OR
    // 2. At least 5 unique keywords found
    const uniqueKeywords = technicalKeywords.filter((keyword) => lowerContent.includes(keyword)).length;
    return density > 3 || uniqueKeywords >= 5;
  }

  /**
   * Trích xuất topics
   */
  private extractTopics(content: string): string[] {
    // Simple topic extraction (có thể cải thiện bằng NLP)
    const sentences = content.split(/[.!?]+/);
    const topics = new Set<string>();

    sentences.forEach((sentence) => {
      // Extract capitalized phrases
      const matches = sentence.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (matches) {
        matches.forEach((topic) => {
          if (topic.length > 3) {
            // Ignore short words
            topics.add(topic);
          }
        });
      }
    });

    return Array.from(topics).slice(0, 10);
  }

  /**
   * Đánh giá độ phức tạp
   */
  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    if (avgSentenceLength > 25) return 'high';
    if (avgSentenceLength > 15) return 'medium';
    return 'low';
  }

  /**
   * Tính điểm cho câu hỏi
   */
  private calculatePoints(difficulty: string, bloomLevel: string): number {
    const difficultyPoints: Record<string, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    const bloomPoints: Record<string, number> = {
      remember: 1,
      understand: 2,
      apply: 3,
      analyze: 4,
    };

    return (difficultyPoints[difficulty] || 2) + (bloomPoints[bloomLevel] || 2);
  }

  /**
   * Generate cache key
   * Hash full content + metadata để tránh collision
   */
  private generateCacheKey(request: QuizGenerationRequest): string {
    // Hash FULL content instead of just first 1000 chars
    const contentHash = crypto.createHash('sha256').update(request.content).digest('hex');
    
    const key = {
      contentHash,
      contentLength: request.content.length,
      numberOfQuestions: request.numberOfQuestions,
      difficulty: request.difficulty,
      questionTypes: request.questionTypes,
      bloomLevel: request.bloomLevel,
    };

    const hash = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');

    return `ai:quiz:${hash.substring(0, 20)}`;
  }
}
