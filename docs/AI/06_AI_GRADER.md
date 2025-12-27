# 📝 CHẤM ĐIỂM TỰ ĐỘNG - HỆ THỐNG ĐÁNH GIÁ AI

**Tài liệu:** 06 - AI Grader  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P1 (Giá trị cao)

---

## 📖 TỔNG QUAN

Hệ thống chấm điểm AI tự động đánh giá bài tập của sinh viên (code, bài luận, trắc nghiệm) dựa trên tiêu chí được định nghĩa. Hệ thống cung cấp phản hồi chi tiết và hỗ trợ giảng viên duyệt/override điểm (giảng viên là nguồn sự thật cuối cùng).

### Giá trị kinh doanh
- ⭐ **Tiết kiệm thời gian:** Giáo viên tiết kiệm 70% thời gian chấm bài
- ⭐ **Nhất quán:** Tiêu chí chấm điểm nhất quán 100%
- ⭐ **Phản hồi nhanh:** Sinh viên nhận điểm trong 24 giờ
- ⭐ **Công bằng:** Giảm thiện chênh lệch chấm điểm con người

### Thông số kỹ thuật
- **Bài code:** Qwen 3 Coder Plus (kỹ thuật cao)
- **Bài luận:** Google Gemini Flash (xử lý nhanh)
- **Duyệt điểm quan trọng (optional):** Claude Sonnet 4.5 (review trước khi publish/chốt)
- **Hỗ trợ:** Tự động đối sánh rubric + feedback

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Luồng chấm điểm

```
┌─────────────────────────────────────────────────────────────┐
│          SINH VIÊN NỘP BÀI TẬP                              │
│  Upload file → Backend xử lý → Trigger chấm điểm          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          PHÂN LOẠI BÀI TẬP                                  │
│  - Loại: Code / Essay / Multiple choice                     │
│  - Kích thước: Định mức nộp                                 │
│  - Rubric: Tiêu chí chấm điểm                              │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    CODE GRADING   ESSAY GRADING   MCQ GRADING
         │               │               │
         ▼               ▼               ▼
    Qwen Coder    Google Flash     Qwen Coder
    (Kỹ thuật)    (Nhanh, miễn)     (Logic)
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          CHẤM ĐIỂM VÀ PHẢN HỒI                             │
│  - Đánh giá theo rubric                                     │
│  - Tạo feedback chi tiết                                   │
│  - Tính điểm tổng hợp                                      │
│  - Lưu vào database                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          GIÁO VIÊN DUYỆT/OVERRIDE (NẾU CẦN)                 │
│  AI đề xuất điểm → Instructor review → Chốt điểm cuối       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          THÔNG BÁO KẾT QUẢ                                  │
│  - Gửi điểm cho sinh viên                                   │
│  - Gửi feedback chi tiết                                    │
│  - Cập nhật thống kê lớp                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 TRIỂN KHAI BACKEND

### Controller

**File:** `backend/src/modules/ai/grader.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AIGraderService } from './services/ai-grader.service';

@Controller('api/v1/ai/grader')
export class AIGraderController {
  constructor(private graderService: AIGraderService) {}

  /**
   * Chấm điểm bài tập
   * POST /api/v1/ai/grader/grade
   */
  @Post('grade')
  @UseGuards(AuthGuard('jwt'))
  async gradeSubmission(
    @Req() req: any,
    @Body()
    body: {
      submissionId: string;
      assignmentId: string;
      content: string;
      type: 'code' | 'essay' | 'mcq';
      rubric: RubricItem[];
      courseId: string;
    }
  ) {
    return await this.graderService.gradeSubmission({
      submissionId: body.submissionId,
      assignmentId: body.assignmentId,
      content: body.content,
      type: body.type,
      rubric: body.rubric,
      courseId: body.courseId,
      gradedBy: 'ai'
    });
  }

  /**
   * Lấy chi tiết chấm điểm
   * GET /api/v1/ai/grader/:submissionId
   */
  @Post('details/:submissionId')
  @UseGuards(AuthGuard('jwt'))
  async getGradingDetails(@Req() req: any) {
    return await this.graderService.getGradingDetails(req.params.submissionId);
  }

  /**
   * Chấm điểm hàng loạt
   * POST /api/v1/ai/grader/batch
   */
  @Post('batch')
  @UseGuards(AuthGuard('jwt'))
  async batchGrade(
    @Req() req: any,
    @Body()
    body: {
      assignmentId: string;
      submissionIds: string[];
    }
  ) {
    return await this.graderService.batchGradeSubmissions(
      body.assignmentId,
      body.submissionIds
    );
  }
}
```

### Grader Service - Code Grading

**File:** `backend/src/modules/ai/services/ai-grader-code.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ProxyPalService } from './providers/proxypal.service';
import { Grade } from '@/database/models/Grade';

interface CodeSubmission {
  submissionId: string;
  assignmentId: string;
  code: string;
  language: string;
  rubric: RubricItem[];
  courseId: string;
}

interface CodeGradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    criterion: string;
    achieved: number;
    max: number;
    comment: string;
  }[];
  feedback: string;
  suggestions: string[];
  codeIssues: {
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    line?: number;
  }[];
}

@Injectable()
export class AIGraderCodeService {
  constructor(private proxypal: ProxyPalService) {}

  /**
   * Chấm điểm bài code
   */
  async gradeCode(submission: CodeSubmission): Promise<CodeGradingResult> {
    const prompt = this.buildCodeGradingPrompt(submission);

    const response = await this.proxypal.generateContent({
      model: 'qwen3-coder-plus',
      prompt,
      temperature: 0.3 // Thấp để nhất quán
    });

    return this.parseGradingResponse(response.text);
  }

  /**
   * Xây dựng prompt chấm code
   */
  private buildCodeGradingPrompt(submission: CodeSubmission): string {
    const rubricText = submission.rubric
      .map(
        (r) =>
          `- ${r.name} (${r.points} điểm): ${r.description}`
      )
      .join('\n');

    return `Bạn là một lập trình viên kỳ cựu. Chấm điểm bài code sau theo rubric:

**RUBRIC:**
${rubricText}

**BÀI CODE (${submission.language}):**
\`\`\`${submission.language}
${submission.code}
\`\`\`

**HƯỚNG DẪN CHẤM:**
1. Kiểm tra tính đúng đắn của code (Correctness)
2. Đánh giá chất lượng code (Code Quality):
   - Dễ đọc hiểu (Readability)
   - Đặt tên biến/hàm rõ ràng
   - Có comment/documentation
3. Hiệu năng (Performance):
   - Time complexity
   - Space complexity
   - Tối ưu hóa
4. Bảo mật (Security):
   - Input validation
   - Xử lý lỗi
   - SQL Injection, XSS, v.v.
5. Tuân thủ yêu cầu (Requirement):
   - Có đủ feature
   - Đúng output expected

**OUTPUT ĐỊNH DẠNG JSON:**
{
  "score": 85,
  "maxScore": 100,
  "breakdown": [
    {
      "criterion": "Correctness",
      "achieved": 25,
      "max": 30,
      "comment": "Code chạy đúng nhưng có 1 edge case không xử lý"
    }
  ],
  "feedback": "Code chất lượng tốt, cần cải thiện xử lý input validation",
  "suggestions": [
    "Thêm validation cho input trước khi xử lý",
    "Tách logic ra hàm riêng để dễ test"
  ],
  "codeIssues": [
    {
      "type": "warning",
      "message": "Variable 'x' không được sử dụng",
      "line": 15
    }
  ]
}

Hãy chấm điểm chi tiết và công bằng:`;
  }

  private parseGradingResponse(text: string): CodeGradingResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Không thể parse phản hồi chấm điểm');
    }

    return JSON.parse(jsonMatch[0]);
  }
}
```

### Grader Service - Essay Grading

**File:** `backend/src/modules/ai/services/ai-grader-essay.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { GoogleAIService } from './providers/google-ai.service';

interface EssaySubmission {
  submissionId: string;
  assignmentId: string;
  essay: string;
  rubric: RubricItem[];
  courseId: string;
  topic: string;
}

interface EssayGradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    criterion: string;
    achieved: number;
    max: number;
    comment: string;
  }[];
  feedback: string;
  strengths: string[];
  improvements: string[];
  comments: {
    section: string;
    text: string;
    type: 'positive' | 'constructive';
  }[];
}

@Injectable()
export class AIGraderEssayService {
  constructor(private google: GoogleAIService) {}

  /**
   * Chấm điểm bài luận
   */
  async gradeEssay(submission: EssaySubmission): Promise<EssayGradingResult> {
    const prompt = this.buildEssayGradingPrompt(submission);

    const response = await this.google.generateContent({
      model: 'gemini-1.5-flash',
      prompt,
      temperature: 0.5 // Cân bằng giữa nhất quán và linh hoạt
    });

    return this.parseGradingResponse(response.text);
  }

  /**
   * Xây dựng prompt chấm bài luận
   */
  private buildEssayGradingPrompt(submission: EssaySubmission): string {
    const rubricText = submission.rubric
      .map(
        (r) =>
          `- ${r.name} (${r.points} điểm): ${r.description}`
      )
      .join('\n');

    return `Bạn là một giáo viên ngôn ngữ kinh nghiệm. Chấm điểm bài luận sau:

**TOPIC:** ${submission.topic}

**RUBRIC:**
${rubricText}

**BÀI LUẬN:**
${submission.essay}

**TIÊU CHÍ CHẤM:**
1. **Content/Nội dung** - Ý tưởng rõ ràng, có lập luận logic
2. **Organization/Cấu trúc** - Bài viết có intro, body, conclusion
3. **Clarity/Rõ ràng** - Câu cú dễ hiểu, từ vựng phù hợp
4. **Grammar/Ngữ pháp** - Ít lỗi ngữ pháp, chính tả
5. **Relevance/Liên quan** - Nội dung liên quan đến chủ đề

**OUTPUT JSON:**
{
  "score": 85,
  "maxScore": 100,
  "breakdown": [
    {
      "criterion": "Content",
      "achieved": 20,
      "max": 25,
      "comment": "Ý tưởng rõ nhưng cần lập luận sâu hơn"
    }
  ],
  "feedback": "Bài viết tốt, cần cải thiện cấu trúc văn bản",
  "strengths": [
    "Ý tưởng chủ đề rõ ràng",
    "Có nhiều ví dụ minh họa"
  ],
  "improvements": [
    "Thêm đoạn kết luận mạnh mẽ hơn",
    "Phát triển idea 2 chi tiết hơn"
  ],
  "comments": [
    {
      "section": "Paragraph 2",
      "text": "Ý tưởng tốt nhưng cần thêm bằng chứng",
      "type": "constructive"
    }
  ]
}

Hãy chấm điểm công bằng và xây dựng:`;
  }

  private parseGradingResponse(text: string): EssayGradingResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Không thể parse phản hồi chấm điểm');
    }

    return JSON.parse(jsonMatch[0]);
  }
}
```

## 🎨 TRIỂN KHAI FRONTEND

### Grading Results Component

**File:** `frontend/src/features/student/components/GradingResultsPanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { ScoreDisplay, FeedbackCard, IssuesList } from '@/components/grading';

export const GradingResultsPanel: React.FC = () => {
  const { submissionId } = useParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGradingResults();
  }, [submissionId]);

  const loadGradingResults = async () => {
    try {
      const response = await api.get(`/ai/grader/details/${submissionId}`);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading grading results:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!results) return <div>Không tìm thấy kết quả</div>;

  return (
    <div className="grading-results space-y-6">
      <ScoreDisplay
        score={results.score}
        maxScore={results.maxScore}
        percentage={results.percentage}
      />

      <div className="breakdown-section">
        <h3 className="text-lg font-bold mb-4">Chi tiết chấm điểm</h3>
        {results.breakdown?.map((item: any, idx: number) => (
          <div key={idx} className="mb-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{item.criterion}</span>
              <span className="text-lg font-bold">
                {item.achieved}/{item.max}
              </span>
            </div>
            <p className="text-sm text-gray-600">{item.comment}</p>
          </div>
        ))}
      </div>

      <FeedbackCard
        feedback={results.feedback}
        strengths={results.strengths}
        improvements={results.improvements}
      />

      {results.codeIssues && results.codeIssues.length > 0 && (
        <IssuesList issues={results.codeIssues} />
      )}
    </div>
  );
};
```

---

## ⚙️ CẤU HÌNH

**File:** `backend/.env`

```bash
# AI Grader Configuration
AI_GRADER_CODE_MODEL=qwen3-coder-plus
AI_GRADER_ESSAY_MODEL=gemini-1.5-flash

# Grading Settings
AI_GRADER_BATCH_SIZE=10
AI_GRADER_TIMEOUT=30000
AI_GRADER_CACHE_TTL=604800

# Budget
AI_GRADER_DAILY_BUDGET=20
AI_GRADER_MONTHLY_BUDGET=600
```

---

## 🧪 KIỂM THỬ

```typescript
describe('AI Grader Service', () => {
  it('should grade code submission accurately', async () => {
    const result = await graderService.gradeCode({
      submissionId: 'test-1',
      assignmentId: 'assign-1',
      code: 'function sum(arr) { return arr.reduce((a,b) => a+b, 0); }',
      language: 'javascript',
      rubric: [
        { name: 'Correctness', points: 30 },
        { name: 'Quality', points: 20 }
      ]
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown.length).toBeGreaterThan(0);
    expect(result.feedback).toBeTruthy();
  });

  it('should batch grade multiple submissions', async () => {
    const results = await graderService.batchGrade(
      'assign-1',
      ['sub-1', 'sub-2', 'sub-3']
    );

    expect(results.length).toBe(3);
    expect(results.every(r => r.score !== undefined)).toBe(true);
  });
});
```

---

## 📊 MONITORING

**Metrics to Track:**
- Thời gian chấm bài trung bình
- Tỷ lệ độ chính xác so với giáo viên
- Tỷ lệ bài cần giáo viên review
- Chi phí API hàng ngày
- Thời gian giáo viên review/chốt điểm

---

## 📚 LIÊN QUAN

- **Trước:** [05_AI_TUTOR.md](05_AI_TUTOR.md)
- **Tiếp:** [07_DEBATE_WORKFLOW.md](07_DEBATE_WORKFLOW.md)
- **Chiến lược:** [03_STRATEGY.md](03_STRATEGY.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
