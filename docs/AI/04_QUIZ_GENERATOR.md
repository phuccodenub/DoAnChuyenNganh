# 🎲 QUIZ GENERATOR - HƯỚNG DẪN TRIỂN KHAI (IMPLEMENTATION GUIDE)

**Tài liệu (Document):** 04 - Quiz Generator  
**Phiên bản (Version):** 2.0  
**Cập nhật gần nhất (Last Updated):** December 17, 2025  
**Mức ưu tiên (Priority):** P0 (High Business Value)

---

## 📖 TỔNG QUAN (OVERVIEW)

Quiz Generator tự động sinh ra các câu hỏi đánh giá chất lượng cao từ nội dung khoá học, bao gồm video, PDF và tài liệu dạng text. Tính năng này giúp **giảm khoảng 60% khối lượng công việc** của giảng viên khi tạo quiz.

### Giá trị kinh doanh (Business Value)
- ⭐ **Tiết kiệm thời gian (Time Savings):** Từ ~20 phút → còn ~2 phút cho mỗi quiz.
- ⭐ **Khả năng mở rộng (Scalability):** Có thể sinh vô hạn biến thể quiz.
- ⭐ **Chất lượng (Quality):** Độ chính xác > 90% khi có AI review.
- ⭐ **Cá nhân hoá (Personalization):** Hỗ trợ mức độ khó (difficulty) thích ứng.

### Thông số kỹ thuật (Technical Specifications)
- **Input:** Tài liệu khoá học (text, transcript video, PDF).
- **Output:** Quiz có cấu trúc đầy đủ: câu hỏi, phương án, đáp án.
- **Thời gian xử lý (Processing Time):** ~5–30 giây tuỳ kích thước nội dung.
- **Loại câu hỏi hỗ trợ (Supported Question Types):** Multiple choice, True/False, Short answer.

---

## 🏗️ KIẾN TRÚC (ARCHITECTURE)

### Luồng hệ thống (System Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                      INSTRUCTOR ACTION                       │
│  Upload content → Select options → Click "Generate Quiz"    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                       │
│  POST /api/v1/ai/generate-quiz                              │
│  - Validate input                                            │
│  - Check cache                                               │
│  - Route to AI Orchestrator                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    AI ORCHESTRATOR
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    < 100K tokens   100K-1M tokens   > 1M tokens
         │               │               │
         ▼               ▼               ▼
  Google Flash    Gemini 3 Pro    Gemini 3 Pro
  (Free, Fast)   (ProxyPal, Dev)  (Only option)
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GENERATION STAGE 1                        │
│  AI Model generates quiz questions                          │
│  - Parse content                                             │
│  - Identify key concepts                                     │
│  - Generate questions + options                              │
│  - Provide correct answers + explanations                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION STAGE 2                        │
│  Technical Review (for technical topics)                    │
│  - Qwen 3 Coder Plus validates technical accuracy           │
│  - Check for logical errors                                  │
│  - Verify code snippets                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    POLISH STAGE 3 (Optional)                 │
│  Premium Review (Final exams only)                          │
│  - ProxyPal GPT-5.1 refines questions                        │
│  - Ensures professional language                             │
│  - Eliminates ambiguity                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE & RESPONSE                        │
│  - Store in database                                         │
│  - Cache result                                              │
│  - Return to instructor                                      │
└─────────────────────────────────────────────────────────────┘
```

Tóm tắt luồng:
1. Giảng viên upload nội dung và bấm "Generate Quiz".
2. Backend API validate, check cache, rồi chuyển sang **AI Orchestrator**.
3. Orchestrator chọn model phù hợp (Google Flash hoặc Gemini 3 Pro qua ProxyPal) dựa trên kích thước input.
4. Quiz được sinh (Stage 1), optional review kỹ thuật (Stage 2), optional polish premium (Stage 3).
5. Kết quả được lưu DB, cache và trả về cho giảng viên.

---

## 💻 TRIỂN KHAI (IMPLEMENTATION)

### Backend API Endpoint

**File:** `backend/src/modules/ai/ai.controller.ts`

```typescript
import { Request, Response } from 'express';
import { QuizGeneratorService } from './services/quiz-generator.service';
import { AIOrchestrator } from './services/ai-orchestrator';

export class AIController {
  private quizGenerator: QuizGeneratorService;
  private orchestrator: AIOrchestrator;

  constructor() {
    this.quizGenerator = new QuizGeneratorService();
    this.orchestrator = new AIOrchestrator();
  }

  /**
   * Generate quiz from course content
   * POST /api/v1/ai/generate-quiz
   */
  async generateQuiz(req: Request, res: Response) {
    try {
      const {
        courseId,
        content,          // Can be text, video transcript, or PDF text
        contentType,      // 'text' | 'video' | 'pdf'
        numberOfQuestions = 10,
        difficulty = 'medium',
        questionTypes = ['multiple_choice'],
        topicFocus,       // Optional: specific topics to focus on
        bloomLevel = 'understand' // 'remember' | 'understand' | 'apply' | 'analyze'
      } = req.body;

      // Validation
      if (!courseId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Course ID and content are required'
        });
      }

      if (numberOfQuestions < 1 || numberOfQuestions > 50) {
        return res.status(400).json({
          success: false,
          error: 'Number of questions must be between 1 and 50'
        });
      }

      // Check cache first
      const cacheKey = this.quizGenerator.generateCacheKey({
        content,
        numberOfQuestions,
        difficulty,
        questionTypes
      });

      const cached = await this.quizGenerator.getFromCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          fromCache: true
        });
      }

      // Generate quiz
      const result = await this.quizGenerator.generate({
        courseId,
        content,
        contentType,
        numberOfQuestions,
        difficulty,
        questionTypes,
        topicFocus,
        bloomLevel,
        userId: req.user.id
      });

      // Cache the result
      await this.quizGenerator.saveToCache(cacheKey, result);

      return res.json({
        success: true,
        data: result,
        processingTime: result.metadata.processingTime
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate quiz',
        message: error.message
      });
    }
  }
}
```

Mô tả nhanh:
- Endpoint `POST /api/v1/ai/generate-quiz` nhận nội dung, validate, check cache, gọi service sinh quiz và trả về metadata (model, thời gian xử lý, token, cost).

---

### Quiz Generator Service

**File:** `backend/src/modules/ai/services/quiz-generator.service.ts`

```typescript
import { AIOrchestrator } from './ai-orchestrator';
import { ProxyPalService } from './proxypal.service';
import { GoogleAIService } from './google-ai.service';
import { ProxyPalService } from './proxypal.service';
import { QuizValidator } from './quiz-validator';
import crypto from 'crypto';
import Redis from 'ioredis';

interface QuizGenerationRequest {
  courseId: string;
  content: string;
  contentType: 'text' | 'video' | 'pdf';
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: Array<'multiple_choice' | 'true_false' | 'short_answer'>;
  topicFocus?: string[];
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
  userId: string;
  isPremium?: boolean; // For final exams
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: string;
  bloomLevel: string;
  topic?: string;
  points: number;
}

interface QuizGenerationResult {
  quizId: string;
  questions: QuizQuestion[];
  metadata: {
    generatedAt: Date;
    model: string;
    processingTime: number;
    tokenUsage: {
      input: number;
      output: number;
      total: number;
    };
    cost: number;
  };
}

export class QuizGeneratorService {
  private orchestrator: AIOrchestrator;
  private validator: QuizValidator;
  private redis: Redis;

  constructor() {
    this.orchestrator = new AIOrchestrator();
    this.validator = new QuizValidator();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 2 // AI cache database
    });
  }

  async generate(request: QuizGenerationRequest): Promise<QuizGenerationResult> {
    const startTime = Date.now();

    // Step 1: Analyze content and select model
    const contentAnalysis = this.analyzeContent(request.content);
    const modelSelection = await this.selectModel(contentAnalysis, request);

    console.log(`[Quiz Generator] Selected model: ${modelSelection.provider} - ${modelSelection.model}`);

    // Step 2: Generate questions
    const questions = await this.generateQuestions(request, modelSelection);

    // Step 3: Validate (if technical content)
    const validatedQuestions = await this.validateQuestions(
      questions,
      contentAnalysis.isTechnical
    );

    // Step 4: Optional premium polish
    const finalQuestions = request.isPremium
      ? await this.polishQuestions(validatedQuestions)
      : validatedQuestions;

    // Step 5: Assign IDs and metadata
    const questionsWithMetadata = finalQuestions.map((q, idx) => ({
      ...q,
      id: crypto.randomUUID(),
      points: this.calculatePoints(q.difficulty, q.bloomLevel)
    }));

    const processingTime = Date.now() - startTime;

    return {
      quizId: crypto.randomUUID(),
      questions: questionsWithMetadata,
      metadata: {
        generatedAt: new Date(),
        model: modelSelection.model,
        processingTime,
        tokenUsage: modelSelection.tokenUsage || {
          input: 0,
          output: 0,
          total: 0
        },
        cost: modelSelection.cost || 0
      }
    };
  }

  private analyzeContent(content: string): ContentAnalysis {
    const tokens = this.estimateTokens(content);
    const isTechnical = this.detectTechnicalContent(content);
    const topics = this.extractTopics(content);

    return {
      tokenCount: tokens,
      isTechnical,
      topics,
      complexity: this.assessComplexity(content)
    };
  }

  private async selectModel(
    analysis: ContentAnalysis,
    request: QuizGenerationRequest
  ): Promise<ModelSelection> {
    // Very large content: Only Gemini 3 Pro can handle
    if (analysis.tokenCount > 1000000) {
      return {
        provider: 'proxypal',
        model: 'gemini-3-pro-preview',
        rationale: 'Content exceeds 1M tokens, needs 2M context window',
        cost: 0
      };
    }

    // Large content: Prefer Gemini 3 Pro for quality
    if (analysis.tokenCount > 100000) {
      return {
        provider: 'proxypal',
        model: 'gemini-3-pro-preview',
        rationale: 'Large content benefits from Gemini quality',
        cost: 0
      };
    }

    // Medium content: Google Flash is sufficient and free
    return {
      provider: 'google',
      model: 'gemini-1.5-flash',
      rationale: 'Content size manageable, use free tier',
      cost: 0
    };
  }

  private async generateQuestions(
    request: QuizGenerationRequest,
    modelSelection: ModelSelection
  ): Promise<QuizQuestion[]> {
    const prompt = this.buildPrompt(request);

    let response;
    if (modelSelection.provider === 'proxypal') {
      const proxypal = new ProxyPalService();
      response = await proxypal.generateContent({
        model: modelSelection.model,
        prompt,
        temperature: 0.7,
        maxTokens: 8192
      });
    } else if (modelSelection.provider === 'google') {
      const google = new GoogleAIService();
      response = await google.generateContent({
        model: modelSelection.model,
        prompt,
        temperature: 0.7
      });
    }

    // Parse JSON response
    const questions = this.parseQuestions(response.text);
    return questions;
  }

  private buildPrompt(request: QuizGenerationRequest): string {
    const {
      content,
      numberOfQuestions,
      difficulty,
      questionTypes,
      topicFocus,
      bloomLevel
    } = request;

    return `You are an expert educational assessment designer. Generate ${numberOfQuestions} high-quality quiz questions from the following content.

**Content:**
${content}

**Requirements:**
- Difficulty level: ${difficulty}
- Question types: ${questionTypes.join(', ')}
- Bloom's taxonomy level: ${bloomLevel || 'understand'}
${topicFocus ? `- Focus on topics: ${topicFocus.join(', ')}` : ''}

**Question Format:**
For multiple choice: 4 options (A, B, C, D) with one correct answer
For true/false: Statement with correct answer
For short answer: Question requiring brief response (2-3 sentences)

**Output Format (strict JSON):**
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple_choice",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "topic": "Main topic covered"
    }
  ]
}

**Quality Guidelines:**
1. Questions should test understanding, not memorization
2. Distractors (wrong answers) should be plausible but clearly incorrect
3. Avoid "all of the above" or "none of the above" options
4. Use clear, unambiguous language
5. Explanations should teach, not just confirm the answer

Generate ${numberOfQuestions} questions now:`;
  }

  private async validateQuestions(
    questions: QuizQuestion[],
    isTechnical: boolean
  ): Promise<QuizQuestion[]> {
    if (!isTechnical) {
      return questions; // Skip validation for non-technical content
    }

    console.log('[Quiz Generator] Running technical validation with Qwen Coder');

    const proxypal = new ProxyPalService();
    const validationPrompt = `Review these quiz questions for technical accuracy:

${JSON.stringify(questions, null, 2)}

Check for:
1. Technically correct answers
2. Accurate code examples
3. Proper terminology
4. Logical consistency

Return the same JSON with corrections if needed, or mark as "validated: true" if all correct.`;

    const response = await proxypal.generateContent({
      model: 'qwen3-coder-plus',
      prompt: validationPrompt,
      temperature: 0.3 // Lower temperature for consistency
    });

    return this.parseQuestions(response.text);
  }

  private async polishQuestions(
    questions: QuizQuestion[]
  ): Promise<QuizQuestion[]> {
    console.log('[Quiz Generator] Premium polish with ProxyPal GPT-5.1');

    const proxypal = new ProxyPalService();
    const polishPrompt = `Polish these quiz questions for a final exam:

${JSON.stringify(questions, null, 2)}

Improve:
1. Language clarity and professionalism
2. Remove any ambiguity
3. Ensure fair difficulty
4. Enhance explanations

Return polished JSON in same format.`;

    const response = await proxypal.generateContent({
      model: 'gpt-5.1',
      prompt: polishPrompt,
      temperature: 0.7
    });

    return this.parseQuestions(response.text);
  }

  private parseQuestions(text: string): QuizQuestion[] {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz questions from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  }

  private estimateTokens(content: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English
    return Math.ceil(content.length / 4);
  }

  private detectTechnicalContent(content: string): boolean {
    const technicalKeywords = [
      'function', 'class', 'algorithm', 'code', 'programming',
      'database', 'API', 'syntax', 'compile', 'debug'
    ];

    const lowerContent = content.toLowerCase();
    return technicalKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction (can be enhanced with NLP)
    const sentences = content.split(/[.!?]+/);
    const topics = new Set<string>();

    // Extract capitalized phrases as potential topics
    sentences.forEach(sentence => {
      const matches = sentence.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (matches) {
        matches.forEach(topic => topics.add(topic));
      }
    });

    return Array.from(topics).slice(0, 10);
  }

  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const avgSentenceLength = content.split(/[.!?]+/).reduce(
      (sum, s) => sum + s.split(' ').length, 0
    ) / content.split(/[.!?]+/).length;

    if (avgSentenceLength > 25) return 'high';
    if (avgSentenceLength > 15) return 'medium';
    return 'low';
  }

  private calculatePoints(
    difficulty: string,
    bloomLevel: string
  ): number {
    const difficultyPoints = {
      easy: 1,
      medium: 2,
      hard: 3
    };

    const bloomPoints = {
      remember: 1,
      understand: 2,
      apply: 3,
      analyze: 4
    };

    return (difficultyPoints[difficulty] || 2) + (bloomPoints[bloomLevel] || 2);
  }

  // Cache methods
  generateCacheKey(params: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex')
      .substring(0, 16);

    return `ai:quiz:${hash}`;
  }

  async getFromCache(key: string): Promise<QuizGenerationResult | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async saveToCache(key: string, data: QuizGenerationResult): Promise<void> {
    await this.redis.setex(
      key,
      7 * 24 * 60 * 60, // 7 days TTL
      JSON.stringify(data)
    );
  }
}
```

Giải thích nhanh:
- Service thực hiện pipeline 5 bước: **analyze → select model → generate → validate → polish (optional) → gán metadata & cache**.
- Model được chọn tự động dựa trên `tokenCount` và độ phức tạp nội dung.

---

## 🎨 TÍCH HỢP FRONTEND (FRONTEND INTEGRATION)

**File:** `frontend/src/features/instructor/components/QuizGenerator.tsx`

```typescript
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';

interface QuizGeneratorProps {
  courseId: string;
  onSuccess: (quiz: Quiz) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  courseId,
  onSuccess
}) => {
  const [content, setContent] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPremium, setIsPremium] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (params: any) => {
      return await aiApi.generateQuiz(params);
    },
    onSuccess: (data) => {
      onSuccess(data.data);
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      courseId,
      content,
      numberOfQuestions,
      difficulty,
      questionTypes: ['multiple_choice'],
      isPremium
    });
  };

  return (
    <div className="quiz-generator">
      <h2>AI Quiz Generator</h2>
      
      <div className="form-group">
        <label>Course Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your course material here (text, transcript, etc.)"
          rows={10}
          className="w-full p-3 border rounded"
        />
        <p className="text-sm text-gray-500">
          Supports up to 2M characters (videos, PDFs, long articles)
        </p>
      </div>

      <div className="form-group">
        <label>Number of Questions</label>
        <input
          type="number"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          min={1}
          max={50}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="form-group">
        <label>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="w-full p-2 border rounded"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="form-group">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="mr-2"
          />
          Premium Quality (for final exams - uses ProxyPal GPT-5.1)
        </label>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generateMutation.isPending || !content}
        className="btn btn-primary"
      >
        {generateMutation.isPending ? 'Generating...' : 'Generate Quiz'}
      </button>

      {generateMutation.isError && (
        <div className="alert alert-error mt-4">
          Failed to generate quiz. Please try again.
        </div>
      )}

      {generateMutation.isSuccess && (
        <div className="alert alert-success mt-4">
          Quiz generated successfully! Processing time: {generateMutation.data.processingTime}ms
        </div>
      )}
    </div>
  );
};
```

Ghi chú:
- Component này là ví dụ tối giản: dán nội dung khoá học, chọn số câu hỏi, độ khó, optional premium.
- Gọi `aiApi.generateQuiz` và trả quiz về callback `onSuccess` để phần khác của UI xử lý.

---

## ⚙️ CẤU HÌNH (CONFIGURATION)

**File:** `backend/.env`

```bash
# Quiz Generator Configuration
QUIZ_GENERATOR_DEFAULT_MODEL=gemini-3-pro-preview
QUIZ_GENERATOR_MAX_QUESTIONS=50
QUIZ_GENERATOR_CACHE_TTL=604800  # 7 days
QUIZ_GENERATOR_ENABLE_VALIDATION=true
QUIZ_GENERATOR_ENABLE_PREMIUM=true

# Cost limits
QUIZ_GENERATOR_DAILY_LIMIT=100
QUIZ_GENERATOR_PREMIUM_REQUIRE_APPROVAL=true
```

Ý nghĩa chính:
- Giới hạn tối đa số câu hỏi (50) và TTL cache 7 ngày.
- Có cờ bật/tắt validation kỹ thuật và polishing premium.
- Giới hạn số lần gọi premium mỗi ngày + yêu cầu phê duyệt.

---

## 📊 MONITORING & ANALYTICS

Theo dõi metric cho quá trình sinh quiz:

```typescript
// Log to analytics
await analytics.track({
  event: 'quiz_generated',
  userId: request.userId,
  courseId: request.courseId,
  metadata: {
    numberOfQuestions,
    difficulty,
    model: modelSelection.model,
    processingTime,
    tokenUsage,
    cost,
    isPremium
  }
});
```

Các metric quan trọng:
- Số câu hỏi, độ khó.
- Model được sử dụng.
- Thời gian xử lý.
- Token usage & cost.
- Tỷ lệ sử dụng chế độ premium.

---

## 🧪 TESTING

**File:** `backend/src/modules/ai/__tests__/quiz-generator.test.ts`

```typescript
describe('Quiz Generator', () => {
  it('should generate quiz from short content using Google Flash', async () => {
    const result = await quizGenerator.generate({
      courseId: 'test-course',
      content: 'React is a JavaScript library for building user interfaces...',
      numberOfQuestions: 5,
      difficulty: 'medium'
    });

    expect(result.questions).toHaveLength(5);
    expect(result.metadata.model).toBe('gemini-1.5-flash');
    expect(result.metadata.cost).toBe(0);
  });

  it('should use ProxyPal Gemini for large content', async () => {
    const largeContent = 'A'.repeat(500000);
    
    const result = await quizGenerator.generate({
      courseId: 'test-course',
      content: largeContent,
      numberOfQuestions: 10,
      difficulty: 'medium'
    });

    expect(result.metadata.model).toBe('gemini-3-pro-preview');
  });
});
```

Mục tiêu test:
- Nội dung ngắn → dùng `gemini-1.5-flash`, chi phí = 0.
- Nội dung lớn → dùng `gemini-3-pro-preview` (ProxyPal).

---

## 📚 TÀI LIỆU LIÊN QUAN (RELATED DOCUMENTS)

- **Trước đó (Previous):** [03_STRATEGY.md](03_STRATEGY.md)
- **Tiếp theo (Next):** [05_AI_TUTOR.md](05_AI_TUTOR.md)
- **Liên quan (Related):** [06_AI_GRADER.md](06_AI_GRADER.md)

---

**Phiên bản tài liệu (Document Version):** 2.0  
**Rà soát gần nhất (Last Review):** December 17, 2025
