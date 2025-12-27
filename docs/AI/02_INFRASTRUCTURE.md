# 🏗️ HẠ TẦNG & TÀI NGUYÊN AI (AI INFRASTRUCTURE & RESOURCES)

**Tài liệu (Document):** 02 - Infrastructure  
**Phiên bản (Version):** 2.0  
**Cập nhật gần nhất (Last Updated):** December 17, 2025

---

## 📖 TỔNG QUAN (OVERVIEW)

Tài liệu này mô tả chi tiết tất cả các thành phần hạ tầng AI, nhà cung cấp, model và cấu hình tương ứng cho nền tảng LMS. Đây là tài liệu tham chiếu kỹ thuật để **setup** và **duy trì** các dịch vụ AI.

---

## 🔧 CÁC THÀNH PHẦN HẠ TẦNG (INFRASTRUCTURE COMPONENTS)

### 1. ProxyPal - Cổng AI cục bộ (Local AI Gateway)

#### ProxyPal là gì? (What is ProxyPal?)

ProxyPal là một ứng dụng desktop đóng vai trò **local reverse proxy**, cho phép backend truy cập vào các model AI premium thông qua subscription cá nhân **mà không cần** gọi trực tiếp API có tính phí.

**Kiến trúc (Architecture):**

```
Your Backend → http://localhost:8317/v1/chat/completions
                     ↓ (ProxyPal intercepts)
               Auto-inject credentials
                     ↓
           Google/Alibaba Cloud Servers
                     ↓
                Response returned
                     ↓
             Your Backend receives
```

#### Cài đặt & thiết lập (Installation & Setup)

**Yêu cầu trước (Prerequisites):**
- Windows 10/11, macOS 11+, hoặc Linux (Ubuntu 20.04+)
- Tài khoản Google có quyền dùng AI
- Tài khoản Alibaba Cloud (cho các model Qwen)
- RAM tối thiểu 4GB, khuyến nghị 8GB

**Các bước cài đặt (Installation Steps):**

1. **Tải ProxyPal:**
   ```bash
   # Truy cập website ProxyPal
   # https://proxypal.ai/download
   # Chọn bản phù hợp với OS của bạn
   ```

2. **Cài đặt và chạy (Install and Launch):**
   ```bash
   # Windows: Chạy file cài đặt (.exe)
   # macOS: Kéo app vào thư mục Applications
   # Linux:
   chmod +x proxypal-linux
   ./proxypal-linux
   ```

3. **Cấu hình nhà cung cấp (Configure Providers):**

   Mở ProxyPal → Settings → Providers

   **Đối với Google Gemini:**
   - Click "Add Provider"
   - Chọn "Google AI"
   - Đăng nhập bằng tài khoản Google
   - Cấp quyền cần thiết
   - Model sẽ xuất hiện với ID: `gemini-3-pro-preview`

   **Đối với Alibaba Qwen:**
   - Click "Add Provider"
   - Chọn "Alibaba Cloud"
   - Đăng nhập tài khoản Alibaba
   - Bật các model: `qwen3-coder-plus`, `qwen3-coder-flash`

4. **Kiểm tra cấu hình (Verify Configuration):**
   ```bash
   # Kiểm tra kết nối bằng curl
   curl http://localhost:8317/v1/models

   # Kết quả mong đợi:
   {
     "data": [
       {"id": "gemini-3-pro-preview", "object": "model"},
       {"id": "qwen3-coder-plus", "object": "model"},
       {"id": "qwen3-coder-flash", "object": "model"}
     ]
   }
   ```

#### File cấu hình ProxyPal (ProxyPal Configuration File)

Tạo file `proxypal.config.json` ở thư mục gốc của project:

```json
{
  "proxyUrl": "http://localhost:8317",
  "providers": {
    "google": {
      "baseUrl": "http://localhost:8317/v1",
      "models": {
        "gemini-3-pro-preview": {
          "contextWindow": 2097152,
          "maxOutputTokens": 8192,
          "supportedFeatures": ["streaming", "functions", "vision"]
        }
      }
    },
    "alibaba": {
      "baseUrl": "http://localhost:8317/v1",
      "models": {
        "qwen3-coder-plus": {
          "contextWindow": 32768,
          "maxOutputTokens": 4096,
          "supportedFeatures": ["streaming", "code"]
        },
        "qwen3-coder-flash": {
          "contextWindow": 131072,
          "maxOutputTokens": 8192,
          "supportedFeatures": ["streaming", "code", "fast"]
        }
      }
    }
  },
  "retryPolicy": {
    "maxRetries": 3,
    "retryDelay": 1000,
    "backoffMultiplier": 2
  },
  "timeout": 60000
}
```

#### Chi tiết model (Model Details)

**Gemini 3 Pro Preview (qua ProxyPal)**

> ⚠️ **Status update (Dec 2025):** ProxyPal không còn hỗ trợ ổn định `gemini-3-pro-preview` (đặc biệt cho use case video).  
> - Giữ cấu hình legacy để có đường quay lại nếu provider phục hồi.  
> - Hướng thay thế khuyến nghị: **Video Understanding V2** dùng **Groq Speech-to-Text + Groq Vision + Reasoning fusion**.
>   - Xem: `docs/AI/14_VIDEO_UNDERSTANDING_V2_STT_VISION_PIPELINE.md`
>   - Roadmap code: `docs/AI/15_BACKEND_CHANGES_ROADMAP_GROQ_MULTIMODAL.md`

| Thuộc tính (Attribute) | Giá trị (Value) |
|------------------------|-----------------| 
| **Model ID** | `gemini-3-pro-preview` |
| **Provider** | Google AI |
| **Context Window** | 2,097,152 tokens (~2M) |
| **Max Output** | 8,192 tokens |
| **Cost** | $0 (dùng subscription cá nhân) |
| **Latency** | 3–8 giây |
| **Strengths** | Context cực lớn, reasoning tốt, hỗ trợ multimodal |
| **Best For** | Phân tích video, tài liệu dài, sinh quiz |
| **Limitations** | Độ trễ cao hơn, cần máy dev chạy ProxyPal |

**Qwen 3 Coder Plus (qua ProxyPal)**

| Thuộc tính (Attribute) | Giá trị (Value) |
|------------------------|-----------------| 
| **Model ID** | `qwen3-coder-plus` |
| **Provider** | Alibaba Cloud |
| **Context Window** | 32,768 tokens |
| **Max Output** | 4,096 tokens |
| **Cost** | $0 (subscription cá nhân) |
| **Latency** | 2–5 giây |
| **Strengths** | Hiểu code tốt, độ chính xác kỹ thuật cao |
| **Best For** | Code review, chấm bài lập trình |
| **Limitations** | Context nhỏ hơn Gemini |

**Qwen 3 Coder Flash (qua ProxyPal)**

| Thuộc tính (Attribute) | Giá trị (Value) |
|------------------------|-----------------| 
| **Model ID** | `qwen3-coder-flash` |
| **Provider** | Alibaba Cloud |
| **Context Window** | 131,072 tokens (~128K) |
| **Max Output** | 8,192 tokens |
| **Cost** | $0 (subscription cá nhân) |
| **Latency** | 1–3 giây |
| **Strengths** | Sinh code rất nhanh, context ổn |
| **Best For** | Gợi ý code nhanh, chấm điểm tốc độ |
| **Limitations** | Độ chính xác hơi thấp hơn bản Plus |

---

### 2. Google AI Studio - Cloud Free Tier

#### Hướng dẫn thiết lập (Setup Instructions)

1. **Tạo tài khoản (Create Account):**
   - Truy cập https://ai.google.dev/
   - Đăng nhập bằng tài khoản Google
   - Chấp nhận điều khoản sử dụng

2. **Tạo API Key (Generate API Key):**
   - Vào mục "Get API Key"
   - Tạo API key mới
   - Copy và lưu trữ an toàn

3. **Thêm vào environment (Add to Environment):**
   ```bash
   # File .env
   GOOGLE_AI_API_KEY=your_api_key_here
   GOOGLE_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
   ```

#### Các model khả dụng (Available Models)

**Gemini 1.5 Flash**

| Thuộc tính (Attribute) | Giá trị (Value) |
|------------------------|-----------------| 
| **Model ID** | `gemini-1.5-flash` |
| **Context Window** | 1,048,576 tokens (~1M) |
| **Max Output** | 8,192 tokens |
| **Cost** | Free tier: 15 RPM, 1M TPM, 1500 RPD |
| **Latency** | 1–3 giây |
| **Strengths** | Nhanh, phù hợp đa số tác vụ, context lớn |
| **Best For** | Chatbot, chấm bài luận, job nền |
| **Rate Limits** | Hào phóng, đủ cho giai đoạn MVP |

**Ví dụ cấu hình (Configuration Example):**

```typescript
// config/ai-providers.ts
export const googleAIConfig = {
  apiKey: process.env.GOOGLE_AI_API_KEY,
  baseURL: process.env.GOOGLE_AI_BASE_URL,
  model: 'gemini-1.5-flash',
  defaultParams: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.95,
    topK: 40
  }
};
```

---

### 3. Groq - Suy luận siêu nhanh (Ultra-Fast Inference)

#### Hướng dẫn thiết lập (Setup Instructions)

1. **Tạo tài khoản (Create Account):**
   - Truy cập https://console.groq.com/
   - Đăng ký bằng email
   - Xác minh email

2. **Tạo API Key (Generate API Key):**
   - Vào mục API Keys
   - Tạo API key mới
   - Copy key

3. **Thêm vào environment (Add to Environment):**
   ```bash
   # File .env
   GROQ_API_KEY=your_groq_key_here
   GROQ_BASE_URL=https://api.groq.com/openai/v1
   ```

#### Các model khả dụng (Available Models)

**Llama 3 70B**

| Thuộc tính (Attribute) | Giá trị (Value) |
|------------------------|-----------------| 
| **Model ID** | `llama-3-70b-8192` |
| **Context Window** | 8,192 tokens |
| **Max Output** | 8,192 tokens |
| **Cost** | Free tier: 30 RPM, 14,400 TPM |
| **Latency** | 0.5–1.5 giây |
| **Strengths** | Rất nhanh, reasoning tốt |
| **Best For** | Chatbot real-time, phản hồi nhanh |
| **Limitations** | Context window nhỏ hơn các model khác |

**Ví dụ cấu hình (Configuration Example):**

```typescript
// config/ai-providers.ts
export const groqConfig = {
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
  model: 'llama-3-70b-8192',
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    stream: true
  }
};
```

---

### 4. ProxyPal Premium - Premium Models (Local/Hosted)

#### Tổng quan

Tier premium hiện chạy thông qua **ProxyPal Premium Models** (ví dụ: `gpt-5.2`, `gpt-5.1`).

#### Hướng dẫn thiết lập (Setup Instructions)

1. **Bật ProxyPal và đảm bảo endpoint hoạt động:**
   - Default: `http://127.0.0.1:8317/v1`
   - Kiểm tra `GET /v1/models`

2. **Cấu hình env cho premium models:**
   ```bash
   # ProxyPal (Local)
   PROXYPAL_BASE_URL=http://127.0.0.1:8317/v1
   PROXYPAL_API_KEY=proxypal-local
   PROXYPAL_ENABLED=true
   PROXYPAL_TIMEOUT=60000

   # Premium model mapping
   PROXYPAL_MODEL_PREMIUM=gpt-5.2
   PROXYPAL_MODEL_POLISH=gpt-5.1
   PROXYPAL_MODEL_FALLBACK=gpt-5
   ```

#### Model mapping khuyến nghị

| Use Case | Model | Ghi chú |
|----------|-------|---------|
| Debate judging / arbitration | `gpt-5.2` | Model mạnh nhất cho quyết định cuối |
| Quiz premium polish | `gpt-5.1` | Polish stage, cải thiện wording & ambiguity |
| Premium fallback | `gpt-5` | Ổn định, dùng khi cần |


---

## 🔄 LOAD BALANCING & FAILOVER

### Triển khai Strategy Pattern (Strategy Pattern Implementation)

```typescript
// services/ai-orchestrator.ts

interface AIProvider {
  name: string;
  priority: number;
  available: boolean;
  cost: number;
  latency: number;
}

export class AIOrchestrator {
  private providers: Map<string, AIProvider>;
  
  async selectProvider(request: AIRequest): Promise<AIProvider> {
    // 1. Kiểm tra cache trước
    const cached = await this.cache.get(request.cacheKey);
    if (cached) return { response: cached, fromCache: true };
    
    // 2. Phân loại request (classify)
    const classification = this.classifyRequest(request);
    
    // 3. Chọn tier phù hợp
    const tier = this.selectTier(classification);
    
    // 4. Lấy provider khả dụng trong tier đó
    const provider = await this.getProvider(tier);
    
    return provider;
  }
  
  private classifyRequest(request: AIRequest): Classification {
    const tokenCount = this.estimateTokens(request.input);
    const complexity = this.analyzeComplexity(request);
    const urgency = request.realTime ? 'high' : 'low';
    
    return {
      tokenCount,
      complexity: complexity.level, // 'low' | 'medium' | 'high'
      requiresPremium: complexity.critical,
      urgency
    };
  }
  
  private selectTier(classification: Classification): Tier {
    // Tier 3: Premium (chỉ cho tác vụ critical)
    if (classification.requiresPremium) {
      return 'tier3-proxypal-premium';
    }
    
    // Tier 2: Local/ProxyPal (context lớn hoặc technical)
    if (classification.tokenCount > 100000 || 
        classification.complexity === 'high') {
      return 'tier2-proxypal';
    }
    
    // Tier 1: Cloud Free (nhanh và đơn giản)
    return 'tier1-cloud';
  }
}
```

### Chuỗi failover (Failover Chain)

```typescript
// services/failover-handler.ts

export class FailoverHandler {
  async executeWithFailover(
    request: AIRequest,
    primaryProvider: AIProvider
  ): Promise<AIResponse> {
    
    const failoverChain = this.buildFailoverChain(primaryProvider);
    
    for (const provider of failoverChain) {
      try {
        // Kiểm tra provider có sẵn sàng không
        if (!await this.healthCheck(provider)) {
          continue;
        }
        
        // Gửi request
        const response = await this.execute(provider, request);
        
        // Log provider thành công
        await this.logUsage(provider, request, response);
        
        return response;
        
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed`, error);
        // Thử provider tiếp theo trong chain
      }
    }
    
    throw new Error('All providers failed');
  }
  
  private buildFailoverChain(primary: AIProvider): AIProvider[] {
    // Ví dụ chain: Groq → Google Flash → ProxyPal Gemini → ProxyPal Premium
    const chains = {
      'groq': ['groq', 'google-flash', 'proxypal-gemini'],
      'google-flash': ['google-flash', 'groq', 'proxypal-gemini'],
      'proxypal-gemini': ['proxypal-gemini', 'google-flash', 'proxypal-premium'],
      'proxypal-premium': ['proxypal-premium'] // Premium phụ thuộc ProxyPal local/hosted
    };
    
    return chains[primary.name].map(name => this.providers.get(name));
  }
}
```

---

## 💾 CHIẾN LƯỢC CACHE (CACHING STRATEGY)

### Cấu hình Redis Cache (Redis Cache Configuration)

```typescript
// config/cache.config.ts

export const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 2 // DB riêng cho cache AI
  },
  
  ttl: {
    chatResponse: 3600,        // 1 giờ
    quizGeneration: 86400,     // 24 giờ
    gradeResult: 604800,       // 7 ngày
    contentAnalysis: 604800,   // 7 ngày
    errorAnalysis: 3600        // 1 giờ
  },
  
  keyPrefixes: {
    chat: 'ai:chat:',
    quiz: 'ai:quiz:',
    grade: 'ai:grade:',
    content: 'ai:content:'
  }
};
```

### Sinh cache key (Cache Key Generation)

```typescript
// utils/cache-key.ts

import crypto from 'crypto';

export function generateCacheKey(
  feature: string,
  input: any,
  options: any = {}
): string {
  // Tạo hash xác định (deterministic) từ input
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ input, options }))
    .digest('hex')
    .substring(0, 16);
  
  return `${cacheConfig.keyPrefixes[feature]}${hash}`;
}

// Ví dụ sử dụng:
const key = generateCacheKey('quiz', {
  content: courseContent,
  difficulty: 'medium',
  numberOfQuestions: 10
});
```

---

## 📊 MONITORING & LOGGING

### Theo dõi sử dụng (Usage Tracking)

```typescript
// services/ai-usage-tracker.ts

interface UsageLog {
  timestamp: Date;
  provider: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  userId?: string;
}

export class AIUsageTracker {
  async logUsage(log: UsageLog): Promise<void> {
    // Lưu vào PostgreSQL
    await AIUsageLog.create(log);
    
    // Cập nhật metric hằng ngày trong Redis
    const date = format(log.timestamp, 'yyyy-MM-dd');
    await this.redis.hincrby(`ai:daily:${date}`, 'requests', 1);
    await this.redis.hincrbyfloat(`ai:daily:${date}`, 'cost', log.cost);
    
    // Kiểm tra cảnh báo ngân sách
    await this.checkBudgetAlerts(date);
  }
  
  async getDailyCost(date: string): Promise<number> {
    const cost = await this.redis.hget(`ai:daily:${date}`, 'cost');
    return parseFloat(cost || '0');
  }
  
  async checkBudgetAlerts(date: string): Promise<void> {
    const dailyCost = await this.getDailyCost(date);
    const dailyBudgetLimit = parseFloat(process.env.AI_DAILY_BUDGET || '5');

    if (dailyCost > dailyBudgetLimit) {
      await this.sendAlert('Daily AI budget exceeded!', {
        date,
        cost: dailyCost,
        limit: dailyBudgetLimit
      });
    }
  }
}
```

---

## 🔐 CÁC LƯU Ý BẢO MẬT (SECURITY CONSIDERATIONS)

### Mẫu biến môi trường (Environment Variables Template)

Tạo file `.env.ai.example`:

```bash
# ProxyPal (Local - không cần key)
PROXYPAL_BASE_URL=http://localhost:8317

# Google AI Studio (Free)
GOOGLE_AI_API_KEY=your_key_here
GOOGLE_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Groq (Free)
GROQ_API_KEY=your_key_here
GROQ_BASE_URL=https://api.groq.com/openai/v1

# ProxyPal Premium Models (Local/Hosted)
PROXYPAL_MODEL_PREMIUM=gpt-5.2
PROXYPAL_MODEL_POLISH=gpt-5.1
PROXYPAL_MODEL_FALLBACK=gpt-5

# Budget & Monitoring
AI_DAILY_BUDGET=5
AI_MONTHLY_BUDGET=150
AI_ALERT_EMAIL=team@lms.com

# Cache
REDIS_AI_DB=2
AI_CACHE_TTL=3600
```

### Chính sách xoay API key (Key Rotation Policy)

```typescript
// scripts/rotate-api-keys.ts

/**
 * Lịch xoay (rotation) API Key:
 * - Google AI Studio: mỗi 90 ngày
 * - Groq: mỗi 90 ngày
 * - ProxyPal: theo policy của subscription cá nhân
 * 
 * Chạy script này hàng tháng bằng cron job
 */

export async function checkKeyRotation() {
  const keys = await getStoredKeys();
  
  for (const key of keys) {
    const age = daysSince(key.createdAt);
    
    if (shouldRotate(key.provider, age)) {
      await sendRotationReminder(key);
    }
  }
}
```

---

## 🧪 HẠ TẦNG TEST (TESTING INFRASTRUCTURE)

### Test local với ProxyPal (Local Testing with ProxyPal)

```bash
# Script test để kiểm tra tất cả provider
npm run test:ai-providers

# Kết quả mong đợi:
✓ ProxyPal Gemini 3 Pro - Reachable (3.2s)
✓ ProxyPal Qwen 3 Coder Plus - Reachable (2.1s)
✓ ProxyPal Qwen 3 Coder Flash - Reachable (1.5s)
✓ Google AI Studio Flash - Reachable (1.8s)
✓ Groq Llama 3 70B - Reachable (0.9s)
⚠ ProxyPal Premium - Skipped (not available in current env)

Total: 5/6 providers ready
```

### Ví dụ integration test (Integration Test Example)

```typescript
// tests/ai-providers.integration.test.ts

describe('AI Provider Integration', () => {
  test('should route simple question to Groq', async () => {
    const response = await aiOrchestrator.process({
      feature: 'chat',
      input: 'What is React?',
      realTime: true
    });
    
    expect(response.provider).toBe('groq');
    expect(response.latency).toBeLessThan(2000);
    expect(response.cost).toBe(0);
  });
  
  test('should route large context to ProxyPal Gemini', async () => {
    const largeContent = 'A'.repeat(500000); // 500K chars
    
    const response = await aiOrchestrator.process({
      feature: 'quiz',
      input: largeContent,
      numberOfQuestions: 10
    });
    
    expect(response.provider).toBe('proxypal-gemini');
    expect(response.cost).toBe(0);
  });
  
test('should use ProxyPal Premium only for critical operations', async () => {
    const response = await aiOrchestrator.process({
      feature: 'publish_review',
      input: quizDraft,
      requiresPremium: true
    });

    expect(response.provider).toContain('proxypal-premium');
  });
});
```

---

## 📚 TÀI LIỆU LIÊN QUAN (RELATED DOCUMENTS)

- **Tiếp theo (Next):** [03_STRATEGY.md](03_STRATEGY.md) – Chiến lược chọn model.
- **Cấu hình (Configuration):** [11_CONFIG_GUIDE.md](11_CONFIG_GUIDE.md) – Hướng dẫn setup từng bước.
- **Thiết kế API (API Design):** [10_API_DESIGN.md](10_API_DESIGN.md) – Các pattern tích hợp.

---

**Phiên bản tài liệu (Document Version):** 2.0  
**Rà soát gần nhất (Last Review):** December 17, 2025  
**Rà soát tiếp theo (Next Review):** January 2026
