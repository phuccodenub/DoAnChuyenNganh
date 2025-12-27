# 🎯 TỔNG QUAN HỆ THỐNG AI (AI SYSTEM OVERVIEW)

**Tài liệu (Document):** 01 - System Overview  
**Phiên bản (Version):** 2.0  
**Cập nhật gần nhất (Last Updated):** December 17, 2025

---

## 📖 TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Tài liệu này cung cấp cái nhìn tổng quan về chiến lược tích hợp AI cho nền tảng LMS Education Platform. Hệ thống sử dụng kiến trúc **hybrid**, kết hợp:
- Sức mạnh xử lý cục bộ thông qua **ProxyPal**,
- Các API cloud **free tier**,
- Và dịch vụ AI **premium** cho những tác vụ quan trọng (critical operations).

### Các điểm nổi bật (Key Highlights)
- **Zero-cost Development:** Tận dụng free tier và công cụ local cho khoảng 90% tác vụ.
- **Premium Safety Net:** Dịch vụ trả phí chỉ dùng cho các quyết định thực sự quan trọng.
- **Multi-Model Approach:** Mỗi loại task dùng model AI phù hợp nhất.
- **Production-Ready:** Thiết kế sẵn để scale và kiểm soát chi phí.

---

## 🎯 MỤC TIÊU DỰ ÁN (PROJECT GOALS)

### Mục tiêu chính (Primary Objectives)
1. **Giảm khối lượng công việc của giảng viên** khoảng 30% thông qua tự động hoá.
2. **Cải thiện kết quả học tập** nhờ AI tutor cá nhân hoá.
3. **Scale việc tạo khoá học** mà không làm chi phí tăng tương ứng.
4. **Tăng tương tác của học viên** bằng các tính năng AI tương tác.

### Tiêu chí thành công (Success Criteria)
- ✅ Tích hợp AI vào ít nhất 6 workflow cốt lõi.
- ✅ Chi phí AI hàng tháng < $150.
- ✅ Thời gian phản hồi < 3 giây cho các tính năng real-time.
- ✅ Độ chính xác chấm điểm tự động > 90%.
- ✅ 85%+ học viên hài lòng với AI tutor.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

### Kiến trúc cấp cao (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     LMS Frontend (React)                     │
│                   User Interactions & UI                     │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                  Backend API (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AI Router & Orchestrator                 │  │
│  │  - Request classification                             │  │
│  │  - Model selection                                    │  │
│  │  - Response caching                                   │  │
│  │  - Cost tracking                                      │  │
│  └────┬──────────┬──────────┬────────────┬───────────────┘  │
└───────┼──────────┼──────────┼────────────┼──────────────────┘
        │          │          │            │
   ┌────▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌───▼──────┐
   │ Local  │ │ Cloud  │ │ Cloud   │ │ Premium  │
   │ProxyPal│ │Google  │ │  Groq   │ │ Premium  │
   └────────┘ └────────┘ └─────────┘ └──────────┘
   Gemini 3   Gemini     Llama 3     GPT-5.x
   Qwen 3     Flash      70B         (via ProxyPal)
```

### Phân rã thành phần (Component Breakdown)

#### 1. Frontend Layer
- **Trách nhiệm (Responsibility):** Tương tác với người dùng, validate input, cập nhật real-time.
- **Công nghệ (Technologies):** React 18, TypeScript, TanStack Query.
- **Tích hợp AI (AI Integration):** Gọi API qua HTTP/WebSocket, hỗ trợ streaming response.

#### 2. Backend API Layer
- **Trách nhiệm (Responsibility):** Điều phối request, xác thực, xử lý business logic.
- **Công nghệ (Technologies):** Node.js 18, Express 5, TypeScript.
- **Các module chính (Key Modules):**
  - `ai.router.ts` - Xử lý route.
  - `ai.service.ts` - Business logic.
  - `ai.orchestrator.ts` - Lựa chọn model.
  - `ai.cache.ts` - Cache kết quả.

#### 3. AI Provider Layer
4 tầng (tier) dịch vụ AI riêng biệt, mỗi tầng tối ưu cho một nhóm use case cụ thể.

---

## 🎭 CHIẾN LƯỢC 3 TẦNG (3-TIER AI STRATEGY)

Kiến trúc sử dụng chiến lược 3 tầng để tối ưu **chi phí, hiệu năng và chất lượng**:

### Tier 1: The Sprinters (Nhanh + Miễn phí)
**Mục đích (Purpose):** Các tác vụ real-time, số lượng lớn, độ phức tạp thấp.

| Provider | Model | Cost | Speed | Use Cases |
|----------|-------|------|-------|-----------|
| **Groq** | Llama 3 70B | Free | ⚡⚡⚡⚡⚡ | Chatbot, Quick Q&A |
| **Google AI Studio** | Gemini Flash | Free | ⚡⚡⚡⚡ | Bulk processing, Background jobs |

**Đặc điểm (Characteristics):**
- Thời gian phản hồi: 0.5–2 giây.
- Context window: 32K–128K tokens.
- Rate limit: free tier "rộng rãi".
- Độ ổn định: uptime > 99%.

**Khi nên dùng (When to Use):**
- ✅ Hỗ trợ chat cho học viên (AI Tutor).
- ✅ Gợi ý real-time.
- ✅ Chấm bài luận số lượng lớn.
- ✅ Job phân tích lỗi chạy nền.
- ❌ Bài toán reasoning phức tạp cần >200K tokens.
- ❌ Code review yêu cầu phân tích kỹ.

---

### Tier 2: The Workhorses (Mạnh + Local)
**Mục đích (Purpose):** Xử lý phức tạp, context rất lớn, linh hoạt cho development.

| Provider | Model | Cost | Context | Use Cases |
|----------|-------|------|---------|-----------|
| **ProxyPal** | Gemini 3 Pro Preview | $0* | 2M tokens | Large document analysis, Quiz generation |
| **ProxyPal** | Qwen 3 Coder Plus | $0* | 32K tokens | Code review, Technical grading |
| **ProxyPal** | Qwen 3 Coder Flash | $0* | 128K tokens | Fast code generation |

*Dùng credit từ tài khoản cá nhân.

**Đặc điểm (Characteristics):**
- Thời gian phản hồi: 3–8 giây (do routing local).
- Context window: 32K–2M tokens.
- Chi phí: 0 (dựa trên tài khoản cá nhân).
- Hạn chế: cần máy dev chạy ProxyPal, độ trễ cao hơn cloud free.

**Khi nên dùng (When to Use):**
- ✅ Xử lý transcript video rất dài (context ~2M tokens).
- ✅ Phân tích cả codebase.
- ✅ Sinh quiz từ nội dung dài, phức tạp.
- ✅ Workflow tranh luận multi-agent.
- ✅ Môi trường phát triển & thử nghiệm.
- ❌ Tương tác real-time với học viên (do latency).
- ❌ API production cần tính sẵn sàng cao.

---

### Tier 3: The Judge (Premium + Critical)
**Mục đích (Purpose):** Trọng tài cuối cùng, quyết định quan trọng, đảm bảo chất lượng.

| Provider | Model | Input | Output | Context | Use Cases |
|----------|-------|-------|--------|---------|-----------|
| **ProxyPal** | GPT-5.2 | $0* | $0* | 128K+ | Arbitration, debate judging |
| **ProxyPal** | GPT-5.1 | $0* | $0* | 128K+ | Final exam polish, premium review |

**Ghi chú:** *Chi phí phụ thuộc subscription cá nhân chạy qua ProxyPal; backend không gọi trực tiếp API trả phí.*

**Đặc điểm (Characteristics):**
- Thời gian phản hồi: 2–5 giây.
- Context window: phụ thuộc model (thường 128K+).
- Chất lượng: reasoning thuộc top đầu.
- Hạn chế: phụ thuộc ProxyPal local/hosted.


**Khi nên dùng (When to Use):**
- ✅ Giải quyết kết quả khác nhau giữa các model (debate arbitration).
- ✅ Sinh câu hỏi cho bài thi cuối kỳ.
- ✅ Kiểm định chất lượng cho tính năng dành cho giảng viên.
- ❌ Tác vụ thường ngày (routine).
- ❌ Tính năng real-time dùng trực tiếp cho học viên.
- ❌ Môi trường development/testing.

**Quản lý ngân sách (Budget Management):**
- Log tất cả các call premium (polish/judge).
- Giới hạn theo feature flag / quyền user (nếu cần).
- Theo dõi latency và tỉ lệ fallback để tránh lỗi.


---

## 🎯 ÁNH XẠ TÍNH NĂNG ↔ TẦNG (FEATURE-TO-TIER MAPPING)

### Chiến lược triển khai theo tính năng (Feature Implementation Strategy)

| Tính năng (Feature) | Tier chính (Primary Tier) | Fallback Tier | Premium Tier | Lý do (Reasoning) |
|---------------------|--------------------------|---------------|--------------|-------------------|
| **AI Tutor (Chat)** | Tier 1 (Groq) | Tier 1 (Google Flash) | N/A | Cần tốc độ, câu hỏi đơn giản. |
| **Quiz Generator** | Tier 2 (Gemini 3 Pro) | Tier 1 (Google Flash) | Tier 3 (Review only) | Cần context lớn. |
| **AI Grader (Code)** | Tier 2 (Qwen Coder) | Tier 1 (Google Flash) | Tier 3 (Instructor audit only) | Instructor override là nguồn sự thật cuối. |
| **AI Grader (Essay)** | Tier 1 (Google Flash) | Tier 2 (Gemini Pro) | Tier 3 (Instructor audit only) | Instructor override là nguồn sự thật cuối. |
| **Debate Workflow** | Tier 2 (Both models) | N/A | Tier 3 (Arbitration) | Cần nhiều model tranh luận. |
| **Content Repurposing** | Tier 2 (Gemini 3 Pro) | Tier 1 (Google Flash) | N/A | Phân tích video/nội dung dài (2M tokens). |
| **Adaptive Learning** | Tier 1 (Google Flash) | Tier 2 (Gemini Pro) | N/A | Phân tích dữ liệu nền (background analytics). |

---

## 🔄 VÍ DỤ LUỒNG REQUEST (REQUEST FLOW EXAMPLES)

### Ví dụ 1: Học viên hỏi qua chatbot

```typescript
// Frontend sends request
POST /api/v1/ai/chat
{
  "message": "Explain React hooks",
  "courseId": "uuid",
  "conversationHistory": [...]
}

// Backend AI Router logic
1. Check cache → Cache hit? Return immediately
2. Classify request → Complexity: Low, Tokens: 512
3. Select model → Tier 1 (Groq - Llama 3)
4. Call API → Response in 1.2s
5. Cache response → TTL: 1 hour
6. Return to student

Total time: 1.3s
Cost: $0
```

### Ví dụ 2: Giảng viên tạo quiz từ video 2 giờ

```typescript
// Frontend sends request
POST /api/v1/ai/generate-quiz
{
  "courseId": "uuid",
  "videoTranscript": "... 1.5M tokens ...",
  "numberOfQuestions": 20,
  "difficulty": "medium"
}

// Backend AI Router logic
1. Check cache → Cache miss
2. Analyze input → Tokens: 1.5M, Complexity: High
3. Select model → Tier 2 (ProxyPal - Gemini 3 Pro)
4. Process request → Response in 7.5s
5. Validation → Tier 2 (Qwen Coder - Technical review)
6. Final polish (optional) → Tier 3 if exam
7. Store results
8. Return to instructor

Total time: 12s
Cost: $0 (development), $0.15 (if Tier 3 used)
```

### Ví dụ 3: Review đề thi/quiz quan trọng trước khi publish

```typescript
// Instructor requests a quality review
POST /api/v1/ai/quiz/review
{
  "quizId": "uuid",
  "courseId": "uuid",
  "requirements": {
    "targetDifficulty": "medium",
    "coverage": ["topic-1", "topic-2"],
    "avoidAmbiguity": true
  }
}

// Backend AI Router logic
1. Load quiz draft + course context
2. Classify → Critical (publish-impacting)
3. Select model → Tier 3 (Claude Sonnet 4.5) for review only
4. Detect ambiguity, wrong answers, low-quality distractors
5. Return structured review + suggested edits
6. Instructor approves/edits → publish

Total time: 5–10s
Cost: depends on quiz size
```

---

## 📊 DỰ PHÓNG CHI PHÍ (COST PROJECTIONS)

### Ước lượng chi phí hàng tháng (Production)

| Scenario | Usage | Cost |
|----------|-------|------|
| **Development Phase** | ProxyPal + Free APIs | $0/month |
| **MVP (100 students)** | Mostly Tier 1, occasional Tier 3 | $10-30/month |
| **Growth (500 students)** | Balanced usage | $50-100/month |
| **Scale (2000 students)** | Need paid API plans | $200-400/month |

### Cơ chế kiểm soát chi phí (Cost Control Mechanisms)
1. **Aggressive Caching:** TTL 1 giờ cho các query phổ biến.
2. **Rate Limiting:** Giới hạn theo user (10 request AI/giờ).
3. **Batch Processing:** Gom các request giống nhau.
4. **Smart Routing:** Tự động fallback sang model rẻ hơn khi phù hợp.
5. **Budget Alerts:** Gửi email khi dùng 70%, 90%, 100% ngân sách.

---

## 🔐 BẢO MẬT & QUYỀN RIÊNG TƯ (SECURITY & PRIVACY)

### Xử lý dữ liệu (Data Handling)
- **Không bao giờ gửi:** tên, email, thông tin cá nhân của học viên cho AI.
- **Ẩn danh (Anonymize):** thay thế identifier trước khi gửi sang AI.
- **Audit Log:** log toàn bộ tương tác AI (ai, làm gì, khi nào).
- **Retention:** tự động xoá log hội thoại AI sau 90 ngày.

### Quản lý API Key (API Key Management)
- Lưu API key trong environment variables.
- Không để API key xuất hiện trong code frontend.
- Rotate key theo quý.
- Dùng key khác nhau cho dev/staging/production.

### Tuân thủ (Compliance)
- Xử lý dữ liệu theo chuẩn GDPR.
- Bảo vệ dữ liệu học viên.
- Giảng viên giữ quyền sở hữu nội dung.
- Nội dung do AI sinh ra cần được ghi nhận nguồn (attribution).

---

## 🎯 LỘ TRÌNH TRIỂN KHAI (IMPLEMENTATION ROADMAP)

### Phase 1: Nền tảng (Foundation – Tuần 1–2)
- ✅ Cài đặt ProxyPal trên máy dev.
- ✅ Cấu hình tài khoản Google AI Studio.
- ✅ Tạo tài khoản Groq API.
- ✅ Implement AI Router với strategy pattern.
- ✅ Xây caching layer.

### Phase 2: Tính năng lõi (Core Features – Tuần 3–6)
- 🔄 AI Tutor chatbot (Tier 1).
- 🔄 Quiz Generator (Tier 2).
- 🔄 Chấm điểm cơ bản (Tier 1 + Tier 2).

### Phase 3: Tính năng nâng cao (Advanced Features – Tuần 7–10)
- ⏳ Debate workflow (multi-tier).
- ⏳ Content repurposing (Tier 2).

### Phase 4: Tối ưu (Optimization – Tuần 11–12)
- ⏳ Tuning hiệu năng.
- ⏳ Tối ưu chi phí.
- ⏳ User acceptance testing (UAT).

---

## 📚 TÀI LIỆU LIÊN QUAN (RELATED DOCUMENTS)

- **Tiếp theo (Next):** [02_INFRASTRUCTURE.md](02_INFRASTRUCTURE.md) – Hạ tầng chi tiết.
- **Xem thêm (Also See):** [03_STRATEGY.md](03_STRATEGY.md) – Cây quyết định chọn model.
- **Triển khai (Implementation):** từ [04_QUIZ_GENERATOR.md](04_QUIZ_GENERATOR.md) đến [09_ADAPTIVE_LEARNING.md](09_ADAPTIVE_LEARNING.md).

---

**Phiên bản tài liệu (Document Version):** 2.0  
**Rà soát gần nhất (Last Review):** December 17, 2025  
**Rà soát tiếp theo (Next Review):** January 2026
