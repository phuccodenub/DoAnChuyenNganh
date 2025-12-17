# 🎯 CHIẾN LƯỢC LỰA CHỌN MODEL (MODEL SELECTION STRATEGY)

**Tài liệu (Document):** 03 - Strategy  
**Phiên bản (Version):** 2.0  
**Cập nhật gần nhất (Last Updated):** December 17, 2025

---

## 📖 TỔNG QUAN (OVERVIEW)

Tài liệu này cung cấp **cây quyết định (decision tree)** và các **chiến lược** để chọn model AI tối ưu cho từng use case. Mục tiêu là giúp developer đưa ra lựa chọn cân bằng giữa **chi phí, hiệu năng và chất lượng**.

---

## 🎲 CÂY QUYẾT ĐỊNH (DECISION TREE)

### Luồng quyết định chính (Master Decision Flow)

```
Request Received
    ↓
┌───────────────────────────────────────┐
│ Is this a critical operation?        │
│ (Grade appeal, Final exam, etc.)     │
└───┬───────────────────────────────────┘
    │
    ├─→ YES → Use Tier 3 (MegaLLM Claude)
    │         Log usage, check budget
    │
    └─→ NO
        ↓
    ┌───────────────────────────────────────┐
    │ How many tokens?                      │
    └───┬───────────────────────────────────┘
        │
        ├─→ > 100K tokens → Use Tier 2 (ProxyPal Gemini)
        │                    Large context needed
        │
        ├─→ 32K - 100K tokens
        │   ↓
        │   ┌─────────────────────────────────┐
        │   │ Is it code-related?             │
        │   └─┬───────────────────────────────┘
        │     │
        │     ├─→ YES → ProxyPal Qwen Coder
        │     └─→ NO → Google Flash or Gemini
        │
        └─→ < 32K tokens
            ↓
        ┌─────────────────────────────────┐
        │ Real-time requirement?          │
        └─┬───────────────────────────────┘
          │
          ├─→ YES (< 2s) → Groq Llama 3
          └─→ NO → Google Flash (cheaper rate limits)
```

Tóm tắt:
- **Critical operation?** → dùng **Tier 3 (MegaLLM Claude)**, luôn log và kiểm tra budget.
- Không critical → quyết định theo **số tokens** và **tính chất (code hay không, real-time hay không)**.

---

## 📊 CHIẾN LƯỢC THEO TÍNH NĂNG (FEATURE-SPECIFIC STRATEGIES)

### 1. AI Tutor (Chatbot)

**Yêu cầu (Requirements):**
- Thời gian phản hồi: < 2 giây.
- Context: lịch sử hội thoại (2K–8K tokens).
- Lưu lượng: cao (100+ request/giờ).
- Độ nhạy cảm chi phí: cao.

**Chiến lược (Strategy):**

```typescript
function selectChatModel(context: ChatContext): ModelSelection {
  // Primary: Groq for speed
  if (context.conversationLength < 8000) {
    return {
      provider: 'groq',
      model: 'llama-3-70b-8192',
      rationale: 'Fast response, adequate context'
    };
  }
  
  // Fallback: Google Flash for larger context
  return {
    provider: 'google',
    model: 'gemini-1.5-flash',
    rationale: 'Larger context window needed'
  };
}
```

**Thứ tự ưu tiên model (Model Priority):**
1. **Groq Llama 3 70B** (Primary) – Latency 0.5–1.5s.
2. **Google Gemini Flash** (Fallback) – Latency 1–3s.
3. **ProxyPal Gemini** (Dev only) – Latency 3–8s.

---

### 2. Quiz Generator

**Yêu cầu (Requirements):**
- Context: tài liệu khoá học (10K–1M+ tokens).
- Chất lượng: cao (độ chính xác 80%+).
- Lưu lượng: trung bình (10–50 lần/ngày).
- Độ nhạy cảm chi phí: trung bình.

**Chiến lược (Strategy):**

```typescript
function selectQuizModel(content: Content): ModelSelection {
  const tokens = estimateTokens(content);
  
  // Nội dung siêu lớn: dùng Gemini 3 Pro (context 2M)
  if (tokens > 500000) {
    return {
      provider: 'proxypal',
      model: 'gemini-3-pro-preview',
      rationale: 'Only model with 2M context window',
      reviewModel: 'qwen3-coder-plus' // Technical validation
    };
  }
  
  // Nội dung lớn: vẫn ưu tiên Gemini 3 Pro
  if (tokens > 100000) {
    return {
      provider: 'proxypal',
      model: 'gemini-3-pro-preview',
      rationale: 'Better quality for comprehensive analysis'
    };
  }
  
  // Nội dung vừa: Google Flash là đủ
  return {
    provider: 'google',
    model: 'gemini-1.5-flash',
    rationale: 'Fast and free, adequate for <100K tokens'
  };
}
```

**Thứ tự ưu tiên model (Model Priority):**
1. **ProxyPal Gemini 3 Pro** (Primary) – Chất lượng tốt nhất, context 2M.
2. **Google Gemini Flash** (nội dung nhỏ) – Nhanh, context 1M.
3. **MegaLLM Claude Sonnet** (chỉ dùng cho final exam) – Chất lượng premium.

**Quy trình nhiều bước (Multi-Stage Process):**

```
Stage 1: Generation (Gemini 3 Pro)
    ↓
Stage 2: Technical Review (Qwen Coder – cho nội dung kỹ thuật)
    ↓
Stage 3: Polish (Chỉ dùng cho đề thi quan trọng – Claude Sonnet)
```

---

### 3. AI Grader (Chấm điểm)

#### 3A. Chấm code (Code Grading)

**Yêu cầu (Requirements):**
- Độ chính xác kỹ thuật: rất quan trọng.
- Context: code của học viên + rubric (5K–50K tokens).
- Lưu lượng: cao trong các đợt giao bài.
- Độ nhạy cảm chi phí: trung bình.

**Chiến lược (Strategy):**

```typescript
function selectCodeGrader(submission: CodeSubmission): ModelSelection {
  const complexity = analyzeCodeComplexity(submission);
  
  // Code phức tạp: dùng Qwen Coder Plus
  if (complexity === 'high' || submission.loc > 500) {
    return {
      provider: 'proxypal',
      model: 'qwen3-coder-plus',
      rationale: 'Best code understanding, handles complexity'
    };
  }
  
  // Code đơn giản: Qwen Flash nhanh hơn
  return {
    provider: 'proxypal',
    model: 'qwen3-coder-flash',
    rationale: 'Fast enough for simple code'
  };
}
```

**Quy trình xử lý kháng nghị điểm (Appeal Process):**

```typescript
function handleGradeAppeal(appeal: Appeal): ModelSelection {
  // Kháng nghị điểm: luôn dùng model premium
  return {
    provider: 'megallm',
    model: 'claude-sonnet-4-5',
    rationale: 'Critical decision requiring highest accuracy',
    logCost: true,
    requireApproval: true
  };
}
```

#### 3B. Chấm bài luận (Essay/Written Grading)

**Yêu cầu (Requirements):**
- Khả năng hiểu ngôn ngữ: quan trọng.
- Context: bài luận + rubric (2K–20K tokens).
- Lưu lượng: rất cao (100+ bài mỗi lần giao).
- Độ nhạy cảm chi phí: cao.

**Chiến lược (Strategy):**

```typescript
function selectEssayGrader(essay: Essay): ModelSelection {
  const wordCount = essay.content.split(' ').length;
  
  // Chấm hàng loạt: dùng Google Flash (free tier)
  if (!essay.isAppealed) {
    return {
      provider: 'google',
      model: 'gemini-1.5-flash',
      rationale: 'Free tier sufficient for bulk grading',
      temperature: 0.3 // Độ biến thiên thấp → chấm nhất quán hơn
    };
  }
  
  // Bài bị kháng nghị: dùng premium
  return {
    provider: 'megallm',
    model: 'claude-sonnet-4-5',
    rationale: 'Appeal requires highest accuracy'
  };
}
```

---

### 4. Debate Workflow (Luồng tranh luận đa agent)

**Yêu cầu (Requirements):**
- Multi-agent: có (2–3 tác nhân).
- Context: trạng thái chung (20K–100K tokens).
- Chất lượng: cao (output mang tính chuyên môn).
- Độ nhạy cảm chi phí: thấp (dùng không thường xuyên).

**Chiến lược (Strategy):**

```typescript
interface DebateConfig {
  agentA: ModelSelection;  // Theory/Logic
  agentB: ModelSelection;  // Practical/Technical
  arbiter: ModelSelection; // Final decision
}

function selectDebateModels(topic: DebateTopic): DebateConfig {
  return {
    // Agent A: Góc nhìn lý thuyết / học thuật
    agentA: {
      provider: 'proxypal',
      model: 'gemini-3-pro-preview',
      role: 'theoretical_expert',
      systemPrompt: 'You are an expert in academic theory...'
    },
    
    // Agent B: Góc nhìn thực tế / kỹ thuật
    agentB: {
      provider: 'proxypal',
      model: 'qwen3-coder-plus',
      role: 'practical_expert',
      systemPrompt: 'You are a senior software engineer...'
    },
    
    // Arbiter: chỉ gọi nếu mức độ bất đồng > 30%
    arbiter: {
      provider: 'megallm',
      model: 'claude-sonnet-4-5',
      role: 'impartial_judge',
      trigger: 'high_disagreement',
      systemPrompt: 'You are an impartial judge...'
    }
  };
}
```

**Luồng tranh luận (Debate Flow):**

```
1. Agent A (Gemini 3 Pro) → Đề xuất ban đầu
2. Agent B (Qwen Coder) → Phản biện / review kỹ thuật
3. Agent A → Phản hồi lại (rebuttal)
4. Tính điểm bất đồng (disagreement score)
5. Nếu score > 0.3 → Agent C (Claude Sonnet) → Ra phán quyết cuối
   Ngược lại → Tổng hợp kết quả của A + B
```

---

### 5. Content Repurposing (Tái sử dụng nội dung)

**Yêu cầu (Requirements):**
- Input: Video/PDF/text dài (100K–2M tokens).
- Output: Summary, flashcard, key points.
- Chất lượng: trung bình–cao.
- Độ nhạy cảm chi phí: trung bình.

**Chiến lược (Strategy):**

```typescript
function selectContentModel(content: ContentSource): ModelSelection {
  const tokens = estimateTokens(content);
  
  // Nội dung cực lớn: chỉ Gemini 3 Pro xử lý được
  if (tokens > 1000000) {
    return {
      provider: 'proxypal',
      model: 'gemini-3-pro-preview',
      rationale: 'Only 2M context model available',
      processingTime: '30-60 seconds'
    };
  }
  
  // Nội dung lớn nhưng vẫn trong tầm: dùng Google Flash
  if (tokens > 200000) {
    return {
      provider: 'google',
      model: 'gemini-1.5-flash',
      rationale: '1M context is enough, free tier'
    };
  }
  
  // Nội dung bình thường: ưu tiên Groq vì tốc độ
  return {
    provider: 'groq',
    model: 'llama-3-70b-8192',
    rationale: 'Fast processing for smaller content'
  };
}
```

---

### 6. Adaptive Learning & Analytics

**Yêu cầu (Requirements):**
- Input: log hoạt động, dữ liệu kết quả học tập.
- Xử lý: job nền (background), không cần real-time.
- Lưu lượng: batch hằng ngày.
- Độ nhạy cảm chi phí: rất cao (chạy tự động).

**Chiến lược (Strategy):**

```typescript
function selectAnalyticsModel(task: AnalyticsTask): ModelSelection {
  // Luôn dùng free tier cho analytics
  return {
    provider: 'google',
    model: 'gemini-1.5-flash',
    rationale: 'Background job, no rush, free tier',
    batchSize: 50, // Xử lý 50 học viên mỗi batch
    schedule: '02:00' // Chạy lúc 2 giờ sáng
  };
}
```

---

## 💰 CÁC CHIẾN LƯỢC TỐI ƯU CHI PHÍ (COST OPTIMIZATION STRATEGIES)

### Chiến lược 1: Aggressive Caching

```typescript
// Cấu hình cache theo từng feature
const cacheDurations = {
  // Cache lâu (nội dung ít thay đổi)
  quizGeneration: {
    ttl: 7 * 24 * 60 * 60, // 7 ngày
    rationale: 'Same content → same quiz'
  },
  
  // Cache trung bình
  contentSummary: {
    ttl: 24 * 60 * 60, // 24 giờ
    rationale: 'Content stable within day'
  },
  
  // Cache thấp (cá nhân hoá, thay đổi nhiều)
  chatResponse: {
    ttl: 60 * 60, // 1 giờ
    rationale: 'Context changes frequently'
  },
  
  // Không cache
  gradeAppeal: {
    ttl: 0,
    rationale: 'Each appeal is unique and critical'
  }
};
```

### Chiến lược 2: Smart Batching

```typescript
// Gom các request tương tự thành batch
class BatchProcessor {
  private queue: Request[] = [];
  private batchSize = 10;
  private maxWaitTime = 5000; // 5 giây
  
  async addRequest(request: Request): Promise<Response> {
    this.queue.push(request);
    
    if (this.queue.length >= this.batchSize) {
      return this.processBatch();
    }
    
    // Chờ thêm request hoặc hết thời gian đợt batch
    return this.waitForBatch(maxWaitTime);
  }
  
  private async processBatch(): Promise<Response> {
    const batch = this.queue.splice(0, this.batchSize);
    
    // Gộp nhiều bài luận vào một API call
    const combinedPrompt = batch.map((req, idx) => 
      `Essay ${idx + 1}:\n${req.content}`
    ).join('\n\n---\n\n');
    
    return await aiProvider.grade(combinedPrompt);
  }
}
```

### Chiến lược 3: Tối ưu prompt (Prompt Optimization)

```typescript
// Prompt ngắn hơn = ít token hơn = rẻ hơn

// ❌ Prompt dài lê thê (> 1000 tokens)
const verbosePrompt = `
Please analyze the following student code submission carefully...
[Long instructions]
[Detailed rubric]
[Examples]
[Edge cases]
...
`;

// ✅ Prompt tối ưu (~200 tokens)
const optimizedPrompt = `
Grade this code (0-100):
${code}

Rubric:
- Correctness (40%)
- Code quality (30%)
- Efficiency (20%)
- Style (10%)

Output JSON: {score, feedback, breakdown}
`;

// Tiết kiệm ~80% token
```

### Chiến lược 4: Dùng premium có chọn lọc (Selective Premium Usage)

```typescript
// Chỉ dùng premium khi thật sự cần
class PremiumGatekeeper {
  async shouldUsePremium(request: Request): Promise<boolean> {
    // Kiểm tra đã thử free tier chưa
    if (!request.attemptedFreeTier) {
      return false;
    }
    
    // Nếu user mua/bật tính năng trả phí
    if (request.isPaidFeature) {
      return true;
    }
    
    // Các tác vụ critical
    const criticalOps = ['appeal', 'final_exam', 'plagiarism'];
    if (criticalOps.includes(request.operation)) {
      // Yêu cầu manager approve
      return await this.getManagerApproval(request);
    }
    
    return false;
  }
}
```

---

## 🎯 TỐI ƯU HIỆU NĂNG (PERFORMANCE OPTIMIZATION)

### Mục tiêu latency theo tính năng (Latency Targets by Feature)

| Tính năng (Feature) | Mục tiêu (Target) | P95 | Lý do chọn model (Model Choice Rationale) |
|---------------------|-------------------|-----|-------------------------------------------|
| Chatbot             | < 2s              | < 3s | Groq (ultra-fast inference)               |
| Quiz Preview        | < 5s              | < 8s | ProxyPal (chấp nhận được cho editor)     |
| Code Grading        | < 10s             | < 15s | Qwen (độ chính xác kỹ thuật)            |
| Essay Grading       | < 15s             | < 20s | Google (batch processing)               |
| Debate              | < 30s             | < 60s | Multi-model (ưu tiên chất lượng hơn tốc độ) |

### Xử lý song song (Parallel Processing)

```typescript
// Xử lý nhiều task độc lập song song
async function gradeAssignmentBatch(submissions: Submission[]) {
  // Chia thành các nhóm 5 bài
  const chunks = chunkArray(submissions, 5);
  
  const results = [];
  for (const chunk of chunks) {
    // Chấm 5 bài song song
    const chunkResults = await Promise.all(
      chunk.map(sub => gradeSubmission(sub))
    );
    results.push(...chunkResults);
    
    // Rate limiting: nghỉ 1s giữa các batch
    await sleep(1000);
  }
  
  return results;
}
```

---

## 📊 ĐẢM BẢO CHẤT LƯỢNG (QUALITY ASSURANCE)

### Benchmark hiệu năng model (Model Performance Benchmarks)

Dựa trên test nội bộ tháng 12/2025:

| Model               | Code Accuracy | Essay Accuracy | Response Quality | Consistency |
|---------------------|--------------|----------------|------------------|-------------|
| **Gemini 3 Pro**       | 88%          | 92%            | 9.2/10           | 87%         |
| **Qwen 3 Coder Plus**  | 93%          | 75%            | 8.8/10           | 90%         |
| **Qwen 3 Coder Flash** | 89%          | 72%            | 8.5/10           | 85%         |
| **Claude Sonnet 4.5**  | 95%          | 96%            | 9.7/10           | 94%         |
| **Gemini Flash**       | 85%          | 88%            | 8.7/10           | 83%         |
| **Llama 3 70B**        | 82%          | 84%            | 8.3/10           | 80%         |

### Chiến lược kiểm định (Validation Strategy)

```typescript
// Kiểm định output AI trước khi trả về cho user
class OutputValidator {
  async validate(response: AIResponse): Promise<ValidationResult> {
    const checks = [
      this.checkCompleteness(response),
      this.checkFormat(response),
      this.checkConsistency(response),
      this.checkToxicity(response)
    ];
    
    const results = await Promise.all(checks);
    
    if (results.some(r => !r.passed)) {
      // Thử lại với model khác hoặc gắn cờ để human review
      return { valid: false, issues: results };
    }
    
    return { valid: true };
  }
}
```

---

## 🚨 XỬ LÝ LỖI & SUY GIẢM MỀM (FAILURE HANDLING & GRACEFUL DEGRADATION)

### Suy giảm mềm (Graceful Degradation)

```typescript
// Chuỗi fallback khi model chính bị lỗi
const fallbackChain = {
  'proxypal-gemini': ['google-flash', 'groq', 'cached-default'],
  'groq': ['google-flash', 'cached-response', 'error-message'],
  'megallm': ['proxypal-gemini', 'human-review'] // Premium không có fallback rẻ
};

async function executeWithFallback(
  request: Request,
  primary: string
): Promise<Response> {
  const chain = [primary, ...fallbackChain[primary]];
  
  for (const provider of chain) {
    try {
      return await execute(provider, request);
    } catch (error) {
      logger.warn(`${provider} failed, trying next`);
    }
  }
  
  // Tất cả provider đều fail – trả về lỗi thân thiện
  return {
    success: false,
    message: 'AI service temporarily unavailable. Please try again.',
    fallbackResponse: getCachedOrDefault(request)
  };
}
```

---

## 📚 TÀI LIỆU LIÊN QUAN (RELATED DOCUMENTS)

- **Trước đó (Previous):** [02_INFRASTRUCTURE.md](02_INFRASTRUCTURE.md) – Các provider khả dụng.
- **Tiếp theo (Next):** [04_QUIZ_GENERATOR.md](04_QUIZ_GENERATOR.md) – Tính năng triển khai đầu tiên.
- **Tham khảo (Reference):** [10_API_DESIGN.md](10_API_DESIGN.md) – Các pattern tích hợp.

---

**Phiên bản tài liệu (Document Version):** 2.0  
**Rà soát gần nhất (Last Review):** December 17, 2025  
**Rà soát tiếp theo (Next Review):** January 2026
