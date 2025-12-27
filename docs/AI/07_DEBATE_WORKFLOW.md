# 🤝 HỆ THỐNG TRANH BIỆN MULTI-AGENT

**Tài liệu:** 07 - Debate Workflow  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P1 (Giá trị cao)

---

## 📖 TỔNG QUAN

Hệ thống Debate Workflow cho phép các AI agents cùng nhau thảo luận, phê bình và phân tích các vấn đề phức tạp. Mô hình này được sử dụng để tạo nội dung chất lượng cao, đánh giá chuyên sâu, và đảm bảo quyết định thước đo.

### Giá trị kinh doanh
- ⭐ **Chất lượng nội dung:** Bài tập dự án được thảo luận kỹ từ 2 góc độ
- ⭐ **Quyết định công bằng:** Tranh luận logic trước khi dùng premium model
- ⭐ **Phát hiện lỗi:** 2 agent tìm vấn đề mà 1 agent bỏ sót
- ⭐ **Chi phí tối ưu:** Chỉ dùng premium khi thực sự cần

### Trường hợp sử dụng
1. **Thiết kế bài tập dự án:** Agent A (lý thuyết) vs Agent B (thực tế)
2. **Xây dựng curriculum:** Tranh luận cấu trúc khóa học
3. **Đánh giá content:** Phê bình nội dung trước khi phát hành
4. **Quyết định nâng cao:** Tranh biện trước khi gọi premium

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Luồng tranh biện (Debate Flow)

```
┌─────────────────────────────────────────────────────────────┐
│          GIÁO VIÊN/ADMIN KHỞI TẠO DEBATE                    │
│  Nhập vấn đề/dự án → Chọn perspective → Bắt đầu           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          STAGE 1: KHỞI TẠO (INITIALIZATION)                 │
│  - Agent A (GPT): Đưa ra quan điểm ban đầu               │
│  - Agent B (Qwen): Đưa ra quan điểm ban đầu                 │
│  - Lưu trạng thái                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          STAGE 2: TRANH LUẬN (DEBATE)                       │
│  - Agent B phê bình quan điểm A                             │
│  - Agent A phản bác lại                                     │
│  - Lặp lại 2-3 vòng                                          │
│  - Tính điểm "disagreement"                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Disagreement   Disagreement   Disagreement
    < 20%          20-50%          > 50%
    (Đồng ý)       (Trung bình)     (Cao)
         │               │               │
         ▼               ▼               ▼
   Tổng hợp A+B    Tổng hợp A+B    Gọi Agent C
                                     (ProxyPal GPT-5.2)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
      APPROVED       PENDING         REQUIRING
      (Dùng ngay)    (Tốt)           (Premium review)
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          KẾT QUẢ CUỐI CÙNG                                  │
│  - Phân tích chung                                           │
│  - Quyết định                                               │
│  - Báo cáo chi tiết                                         │
└─────────────────────────────────────────────────────────────┘
```

### Kiến trúc Agents

```
DEBATE ORCHESTRATOR
│
├─ Agent A: Lý thuyết (Theory Expert)
│  ├─ Provider: ProxyPal
│  ├─ Model: GPT 5.2
│  ├─ Vai trò: Đề xuất cấu trúc chuẩn
│  └─ Perspective: Học thuật, logic, best practices
│
├─ Agent B: Thực tế (Practical Expert)
│  ├─ Provider: ProxyPal
│  ├─ Model: Qwen 3 Coder Plus
│  ├─ Vai trò: Phê bình tính khả thi
│  └─ Perspective: Lập trình, performance, reality
│
└─ Agent C: Phán xử (Judge)
   ├─ Provider: ProxyPal
   ├─ Model: GPT-5.2
   ├─ Vai trò: Quyết định cuối khi tranh cãi
   └─ Trigger: Disagreement > 50%
```

---

## 💻 TRIỂN KHAI BACKEND

### Debate Controller

**File:** `backend/src/modules/ai/debate.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DebateOrchestrator } from './services/debate-orchestrator';

@Controller('api/v1/ai/debate')
export class DebateController {
  constructor(private debateOrchestrator: DebateOrchestrator) {}

  /**
   * Khởi tạo debate mới
   * POST /api/v1/ai/debate/start
   */
  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  async startDebate(
    @Req() req: any,
    @Body()
    body: {
      topic: string;
      context: string;
      debateType: 'project_design' | 'curriculum' | 'content_review' | 'decision';
      maxRounds?: number;
    }
  ) {
    return await this.debateOrchestrator.startDebate({
      topic: body.topic,
      context: body.context,
      debateType: body.debateType,
      maxRounds: body.maxRounds || 3,
      initiatedBy: req.user.id,
      courseId: body.courseId
    });
  }

  /**
   * Lấy kết quả debate
   * GET /api/v1/ai/debate/:debateId
   */
  @Get(':debateId')
  @UseGuards(AuthGuard('jwt'))
  async getDebateResult(@Param('debateId') debateId: string) {
    return await this.debateOrchestrator.getDebateResult(debateId);
  }

  /**
   * Lấy lịch sử tranh luận
   * GET /api/v1/ai/debate/:debateId/history
   */
  @Get(':debateId/history')
  @UseGuards(AuthGuard('jwt'))
  async getDebateHistory(@Param('debateId') debateId: string) {
    return await this.debateOrchestrator.getDebateHistory(debateId);
  }

  /**
   * Kích hoạt Judge để phân xử
   * POST /api/v1/ai/debate/:debateId/arbitrate
   */
  @Post(':debateId/arbitrate')
  @UseGuards(AuthGuard('jwt'))
  async arbitrateDebate(@Param('debateId') debateId: string) {
    return await this.debateOrchestrator.callJudge(debateId);
  }
}
```

### Debate Orchestrator Service

**File:** `backend/src/modules/ai/services/debate-orchestrator.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ProxyPalService } from './providers/proxypal.service';
import { ProxyPalService } from './providers/proxypal.service';
import { DebateHistory } from '@/database/models/DebateHistory';
import Redis from 'ioredis';

interface DebateRequest {
  topic: string;
  context: string;
  debateType: 'project_design' | 'curriculum' | 'content_review' | 'decision';
  maxRounds: number;
  initiatedBy: string;
  courseId?: string;
}

interface DebateRound {
  round: number;
  agentA: {
    position: string;
    reasoning: string;
  };
  agentB: {
    position: string;
    reasoning: string;
  };
  agreement: number; // 0-100, cao = đồng ý
  highlights: string[];
}

interface DebateResult {
  debateId: string;
  topic: string;
  rounds: DebateRound[];
  consensus: string;
  disagreement: number; // 0-100, cao = bất đồng
  requiresJudge: boolean;
  judgeDecision?: string;
  decision: 'approved' | 'needs_revision' | 'rejected';
  createdAt: Date;
}

@Injectable()
export class DebateOrchestrator {
  private proxypal: ProxyPalService;
  private redis: Redis;

  constructor() {
    this.proxypal = new ProxyPalService();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 2
    });
  }

  /**
   * Khởi tạo debate
   */
  async startDebate(request: DebateRequest): Promise<DebateResult> {
    const debateId = this.generateDebateId();
    console.log(`[Debate] Starting debate ${debateId}: ${request.topic}`);

    const systemPromptA = this.buildSystemPromptA(request.debateType);
    const systemPromptB = this.buildSystemPromptB(request.debateType);

    const rounds: DebateRound[] = [];

    // STAGE 1: Khởi tạo
    console.log('[Debate] Stage 1: Initialization');
    const initRound = await this.executeDebateRound(
      0,
      request.context,
      systemPromptA,
      systemPromptB,
      null, // Lần đầu không có history
      null
    );
    rounds.push(initRound);

    // STAGE 2: Tranh luận
    let cumulativeDisagreement = initRound.agreement;
    for (let i = 1; i < request.maxRounds; i++) {
      console.log(`[Debate] Round ${i + 1}`);

      const round = await this.executeDebateRound(
        i,
        request.context,
        systemPromptA,
        systemPromptB,
        rounds[i - 1],
        `Bạn vừa được phê bình như sau: ${rounds[i - 1].agentB.position}. Hãy phản bác.`
      );

      rounds.push(round);
      cumulativeDisagreement = (cumulativeDisagreement + round.agreement) / 2;
    }

    // Tính toán kết quả
    const totalDisagreement = 100 - cumulativeDisagreement;
    const requiresJudge = totalDisagreement > 50;

    let judgeDecision: string | undefined;
    if (requiresJudge) {
      console.log('[Debate] Disagreement > 50%, calling Judge');
      judgeDecision = await this.callJudge(debateId);
    }

    const result: DebateResult = {
      debateId,
      topic: request.topic,
      rounds,
      consensus: this.synthesizeConsensus(rounds),
      disagreement: totalDisagreement,
      requiresJudge,
      judgeDecision,
      decision: this.makeDecision(totalDisagreement, judgeDecision),
      createdAt: new Date()
    };

    // Lưu vào database
    await DebateHistory.create({
      id: debateId,
      topic: request.topic,
      context: request.context,
      debateType: request.debateType,
      rounds: JSON.stringify(rounds),
      result: JSON.stringify(result),
      initiatedBy: request.initiatedBy,
      courseId: request.courseId,
      createdAt: new Date()
    });

    // Cache kết quả
    await this.redis.setex(
      `debate:${debateId}`,
      7 * 24 * 60 * 60, // 7 ngày
      JSON.stringify(result)
    );

    return result;
  }

  /**
   * Thực thi 1 vòng tranh luận
   */
  private async executeDebateRound(
    roundNumber: number,
    context: string,
    systemPromptA: string,
    systemPromptB: string,
    previousRound: DebateRound | null,
    agentAInstructions: string | null
  ): Promise<DebateRound> {
    // Agent A (GPT) - Lý thuyết
    const promptA = this.buildAgentPrompt(
      roundNumber,
      context,
      systemPromptA,
      previousRound,
      'theoretical',
      agentAInstructions
    );

    const responseA = await this.proxypal.generateContent({
      model: 'GPT 5.2',
      prompt: promptA,
      temperature: 0.7
    });

    const positionA = this.parsePosition(responseA.text);

    // Agent B (Qwen) - Phản biện
    const promptB = this.buildAgentPrompt(
      roundNumber,
      context,
      systemPromptB,
      previousRound,
      'practical',
      `Sau đây là quan điểm của Agent A:\n\n${positionA.position}\n\nHãy phê bình và đưa ra quan điểm khác.`
    );

    const responseB = await this.proxypal.generateContent({
      model: 'qwen3-coder-plus',
      prompt: promptB,
      temperature: 0.7
    });

    const positionB = this.parsePosition(responseB.text);

    // Tính độ đồng ý
    const agreement = await this.calculateAgreement(positionA.position, positionB.position);

    return {
      round: roundNumber + 1,
      agentA: positionA,
      agentB: positionB,
      agreement,
      highlights: this.extractHighlights(positionA, positionB)
    };
  }

  /**
   * Gọi Judge để phân xử
   */
  async callJudge(debateId: string): Promise<string> {
    console.log(`[Debate] Calling Judge for debate ${debateId}`);

    const debate = await this.getDebateHistory(debateId);
    const debateContext = this.serializeDebate(debate);

    const judgePrompt = `Bạn là một phán xử không thiên vị. Hai agent vừa tranh biện về vấn đề sau:

${debateContext}

Nhiệm vụ:
1. Phân tích lập luận của từng bên
2. Xác định điểm mạnh yếu
3. Đưa ra quyết định cuối cùng công bằng
4. Giải thích lý do

OUTPUT JSON:
{
  "winner": "agent_a" | "agent_b" | "tie",
  "reasoning": "...",
  "recommendation": "approved | needs_revision | rejected",
  "keyPoints": ["...", "..."]
}`;

    const response = await this.proxypal.generateContent({
      model: 'gpt-5.2',
      prompt: judgePrompt,
      temperature: 0.5
    });

    return response.text;
  }

  /**
   * Xây dựng system prompt cho Agent A (Lý thuyết)
   */
  private buildSystemPromptA(debateType: string): string {
    const basePrompt = `Bạn là một chuyên gia lý thuyết và kiến trúc sư phần mềm.
Vai trò: Đề xuất cách tiếp cận lý tưởng từ góc độ học thuật.

Hướng dẫn:
- Tuân thủ best practices
- Tuân thủ nguyên lý SOLID
- Xem xét scalability dài hạn
- Sử dụng design patterns phù hợp
- Tập trung vào code quality

Lập luận của bạn nên:
1. Rõ ràng và có logic
2. Dựa trên nguyên lý thiết yếu
3. Có ví dụ cụ thể`;

    return basePrompt;
  }

  /**
   * Xây dựng system prompt cho Agent B (Thực tế)
   */
  private buildSystemPromptB(debateType: string): string {
    const basePrompt = `Bạn là một senior developer có kinh nghiệm thực tế.
Vai trò: Phê bình từ góc độ thực tế lập trình.

Hướng dẫn:
- Xem xét thực tiễn dự án
- Cân nhắc thời gian phát triển
- Xem xét chi phí bảo trì
- Cảnh báo về performance issues
- Tập trung vào "shipping fast"

Lập luận của bạn nên:
1. Thực tế và khả thi
2. Tính đến deadline
3. Có kinh nghiệm từ dự án thực`;

    return basePrompt;
  }

  /**
   * Tính độ đồng ý giữa 2 quan điểm
   */
  private async calculateAgreement(positionA: string, positionB: string): Promise<number> {
    // Sử dụng simple heuristic hoặc gọi AI để đánh giá
    // Ở đây dùng simple version
    const commonKeywords = this.findCommonKeywords(positionA, positionB);
    return Math.min(100, commonKeywords.length * 5);
  }

  /**
   * Tổng hợp consensus từ các vòng
   */
  private synthesizeConsensus(rounds: DebateRound[]): string {
    return rounds
      .map((r) => `Round ${r.round}: Đồng ý ${r.agreement}%\n- A: ${r.agentA.position}\n- B: ${r.agentB.position}`)
      .join('\n\n');
  }

  /**
   * Quyết định cuối cùng
   */
  private makeDecision(disagreement: number, judgeDecision?: string): 'approved' | 'needs_revision' | 'rejected' {
    if (disagreement > 70) return 'rejected';
    if (disagreement > 40) return 'needs_revision';
    return 'approved';
  }

  /**
   * Lấy kết quả debate
   */
  async getDebateResult(debateId: string): Promise<DebateResult> {
    const cached = await this.redis.get(`debate:${debateId}`);
    if (cached) return JSON.parse(cached);

    const record = await DebateHistory.findOne({ where: { id: debateId } });
    return JSON.parse(record?.result);
  }

  /**
   * Lấy lịch sử debate
   */
  async getDebateHistory(debateId: string): Promise<DebateRound[]> {
    const record = await DebateHistory.findOne({ where: { id: debateId } });
    return JSON.parse(record?.rounds);
  }

  private generateDebateId(): string {
    return `debate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildAgentPrompt(
    round: number,
    context: string,
    systemPrompt: string,
    previous: DebateRound | null,
    perspective: string,
    instructions: string | null
  ): string {
    return `${systemPrompt}

VĂN ĐỀ:
${context}

${previous ? `VÒNG TRƯỚC:\n${JSON.stringify(previous, null, 2)}` : ''}

${instructions || 'Hãy đưa ra quan điểm đầu tiên của bạn.'}`;
  }

  private parsePosition(text: string) {
    return {
      position: text.substring(0, 500),
      reasoning: text.substring(500, 1000)
    };
  }

  private extractHighlights(positionA: any, positionB: any): string[] {
    // Extract key points từ cả 2 position
    return ['Point 1', 'Point 2'];
  }

  private findCommonKeywords(textA: string, textB: string): string[] {
    // Simple keyword matching
    const wordsA = textA.toLowerCase().split(/\s+/);
    const wordsB = textB.toLowerCase().split(/\s+/);
    return wordsA.filter((w) => wordsB.includes(w));
  }

  private serializeDebate(rounds: DebateRound[]): string {
    return JSON.stringify(rounds, null, 2);
  }
}
```

---

## 🎨 TRIỂN KHAI FRONTEND

### Debate Results Component

**File:** `frontend/src/features/instructor/components/DebateResultsPanel.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Badge, Timeline, Card } from '@/components/ui';

interface DebateResultsPanelProps {
  debateId: string;
}

export const DebateResultsPanel: React.FC<DebateResultsPanelProps> = ({ debateId }) => {
  const [debate, setDebate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebateResult();
  }, [debateId]);

  const loadDebateResult = async () => {
    try {
      const response = await api.get(`/ai/debate/${debateId}`);
      setDebate(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading debate:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!debate) return <div>Không tìm thấy debate</div>;

  return (
    <div className="debate-results space-y-6">
      <div className="header">
        <h2 className="text-2xl font-bold">{debate.topic}</h2>
        <div className="flex gap-2 mt-2">
          <Badge variant={debate.disagreement > 50 ? 'danger' : 'success'}>
            Bất đồng: {debate.disagreement.toFixed(1)}%
          </Badge>
          {debate.requiresJudge && (
            <Badge variant="warning">Có Judge review</Badge>
          )}
        </div>
      </div>

      {/* Các vòng tranh luận */}
      <div className="rounds">
        <h3 className="text-lg font-bold mb-4">Các vòng tranh luận</h3>
        <Timeline>
          {debate.rounds.map((round: any, idx: number) => (
            <div key={idx} className="timeline-item mb-6 p-4 bg-gray-50 rounded">
              <div className="text-sm font-semibold text-gray-600">Vòng {round.round}</div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                {/* Agent A */}
                <Card className="bg-blue-50">
                  <div className="font-semibold text-blue-900">📚 Lý Thuyết (Agent A)</div>
                  <p className="text-sm mt-2">{round.agentA.position}</p>
                </Card>

                {/* Agent B */}
                <Card className="bg-green-50">
                  <div className="font-semibold text-green-900">🔧 Thực Tế (Agent B)</div>
                  <p className="text-sm mt-2">{round.agentB.position}</p>
                </Card>
              </div>

              <div className="mt-3 text-center">
                <Badge variant="info">Đồng ý: {round.agreement}%</Badge>
              </div>
            </div>
          ))}
        </Timeline>
      </div>

      {/* Consensus */}
      <div className="consensus p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Đồng thuận</h3>
        <p className="text-sm">{debate.consensus}</p>
      </div>

      {/* Judge Decision */}
      {debate.judgeDecision && (
        <div className="judge-decision p-4 bg-yellow-50 rounded">
          <h3 className="font-bold mb-2">⚖️ Quyết định của Judge</h3>
          <p className="text-sm whitespace-pre-wrap">{debate.judgeDecision}</p>
        </div>
      )}

      {/* Kết luận */}
      <div className="conclusion p-4 rounded" style={{
        backgroundColor: debate.decision === 'approved' ? '#dcfce7' : 
                        debate.decision === 'needs_revision' ? '#fef3c7' : '#fee2e2'
      }}>
        <h3 className="font-bold mb-2">
          {debate.decision === 'approved' ? '✅ Phê duyệt' :
           debate.decision === 'needs_revision' ? '⚠️ Cần chỉnh sửa' : '❌ Từ chối'}
        </h3>
        <p>Chi tiết: {debate.decision}</p>
      </div>
    </div>
  );
};
```

---

## ⚙️ CẤU HÌNH

**File:** `backend/.env`

```bash
# Debate Configuration
DEBATE_MAX_ROUNDS=3
DEBATE_DISAGREEMENT_THRESHOLD=50
DEBATE_CACHE_TTL=604800

# Judge Settings
DEBATE_JUDGE_REQUIRE_DISAGREEMENT=50
DEBATE_JUDGE_MODEL=gpt-5.2
DEBATE_JUDGE_TEMPERATURE=0.5

# Budget
DEBATE_DAILY_LIMIT=10
DEBATE_JUDGE_CALLS_MONTHLY_MAX=50
```

---

## 🧪 KIỂM THỬ

```typescript
describe('Debate Orchestrator', () => {
  it('should execute debate successfully', async () => {
    const result = await debateOrchestrator.startDebate({
      topic: 'MVC vs Clean Architecture for LMS',
      context: 'Chúng ta nên dùng pattern nào?',
      debateType: 'project_design',
      maxRounds: 3,
      initiatedBy: 'teacher-1'
    });

    expect(result.debateId).toBeTruthy();
    expect(result.rounds.length).toBeGreaterThan(0);
    expect(result.disagreement).toBeGreaterThanOrEqual(0);
    expect(result.disagreement).toBeLessThanOrEqual(100);
  });

  it('should call judge when disagreement is high', async () => {
    const result = await debateOrchestrator.startDebate({
      topic: 'Test topic with high disagreement potential',
      context: 'Context that will cause disagreement',
      debateType: 'project_design',
      maxRounds: 3,
      initiatedBy: 'teacher-1'
    });

    if (result.disagreement > 50) {
      expect(result.requiresJudge).toBe(true);
      expect(result.judgeDecision).toBeTruthy();
    }
  });
});
```

---

## 📚 LIÊN QUAN

- **Trước:** [06_AI_GRADER.md](06_AI_GRADER.md)
- **Tiếp:** [08_CONTENT_REPURPOSING.md](08_CONTENT_REPURPOSING.md)
- **Chiến lược:** [03_STRATEGY.md](03_STRATEGY.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
