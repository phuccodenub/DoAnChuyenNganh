# 🚀 HƯỚNG DẪN SETUP HỆ THỐNG AI MỚI

**Ngày tạo:** 18/12/2025  
**Trạng thái:** ✅ Sẵn sàng sử dụng

---

## 📋 TỔNG QUAN

Hệ thống AI mới đã được tích hợp hoàn toàn vào backend với kiến trúc 3-Tier:

- **Tier 1 (Fast + Free):** Groq Llama 3, Google Gemini Flash
- **Tier 2 (Powerful + Local):** ProxyPal (Gemini 3 Pro, Qwen Coder)
- **Tier 3 (Premium):** MegaLLM (Claude Sonnet/Opus)

### ✅ Đã hoàn thành

- [x] Cấu hình environment variables trong `env.example`
- [x] Sửa tất cả lỗi TypeScript (type-check passed)
- [x] Sửa tất cả lỗi lint (lint passed)
- [x] Import paths đã được sửa đúng
- [x] AI Chat Gateway đã được tích hợp vào server.ts
- [x] Routes v2 đã được mount trong API v1
- [x] Model pattern đã được điều chỉnh theo chuẩn project

---

## 🔧 CÁC BƯỚC SETUP

### Bước 1: Cấu hình API Keys

Mở file `.env` của bạn và thêm các dòng sau:

```bash
# =========================================
# AI CONFIGURATION (3-Tier Architecture)
# =========================================

# TIER 1: Fast + Free APIs

# Google AI Studio (Free Tier)
# Lấy tại: https://aistudio.google.com/
GEMINI_API_KEY=your-actual-api-key-here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Groq API (Free Tier) - Primary cho AI Tutor
# Lấy tại: https://console.groq.com/
GROQ_API_KEY=your-actual-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=2048

# TIER 2: ProxyPal (Optional - chỉ dùng cho dev/testing)
PROXYPAL_BASE_URL=http://localhost:8317
PROXYPAL_ENABLED=false
PROXYPAL_TIMEOUT=60000

# TIER 3: MegaLLM (Optional - chỉ dùng cho critical operations)
MEGALM_API_KEY=
MEGALM_BASE_URL=

# AI Features Toggles
AI_TUTOR_ENABLED=true
AI_QUIZ_GENERATOR_ENABLED=true
AI_GRADER_ENABLED=false
AI_CONTENT_REPURPOSING_ENABLED=false
```

### Bước 2: Chạy Database Migration

```bash
npm run migrate
```

Migration sẽ tạo bảng `ai_chat_history` với cấu trúc:
- id, user_id, course_id, lesson_id
- role (user/assistant/system)
- message, model, provider
- latency, tokens_used
- timestamps

### Bước 3: Khởi động Server

```bash
npm run dev
```

Kiểm tra logs để đảm bảo:
```
✅ AI Service: Available (Gemini API connected)
   Model: gemini-2.5-flash
[AIOrchestrator] Initialized 5 providers
[AIOrchestrator] Fallback chain: groq -> google
[AIChatGateway] WebSocket namespace /ai/chat initialized
```

---

## 🧪 KIỂM TRA HỆ THỐNG

### Test 1: Kiểm tra Status

```bash
curl http://localhost:3000/api/v1/ai/status
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "providers": {
      "groq": true,
      "google": true,
      "proxypal-gemini": false,
      "proxypal-qwen-plus": false,
      "proxypal-qwen-flash": false
    },
    "activeProviders": 2
  }
}
```

### Test 2: Test Chat (REST API)

```bash
curl -X POST http://localhost:3000/api/v1/ai/chat/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Giải thích cho tôi về React hooks"
  }'
```

### Test 3: Test WebSocket Chat

Sử dụng Socket.IO client:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/ai/chat', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  query: {
    courseId: 'optional-course-uuid',
    lessonId: 'optional-lesson-uuid'
  }
});

socket.on('connected', (data) => {
  console.log('✅ Kết nối thành công:', data);
});

socket.emit('message', {
  text: 'Giải thích cho tôi về React hooks'
});

socket.on('response_chunk', (chunk) => {
  console.log('📝 Chunk:', chunk.text);
});

socket.on('message_response', (response) => {
  console.log('✅ Hoàn thành:', response);
});
```

---

## 🏗️ CẤU TRÚC HỆ THỐNG MỚI

### Providers (Tier 1 + 2)

```
backend/src/modules/ai/providers/
├── base.provider.ts          # Base interface
├── groq.provider.ts          # Groq Llama 3 (Primary)
├── google-ai.provider.ts     # Google Gemini Flash (Fallback)
└── proxypal.provider.ts      # ProxyPal gateway (Dev only)
```

### Orchestrator (Smart Routing)

```
backend/src/modules/ai/orchestrator/
└── ai-orchestrator.ts        # Chọn model dựa trên:
                              # - Question complexity
                              # - Token count
                              # - Real-time requirement
```

### Services

```
backend/src/modules/ai/services/
├── ai-tutor.service.ts       # AI Tutor business logic
└── ai-cache.service.ts       # Redis caching
```

### Gateways

```
backend/src/modules/ai/gateways/
└── ai-chat.gateway.ts        # WebSocket namespace: /ai/chat
```

### Controllers & Routes

```
backend/src/modules/ai/controllers/
└── ai-v2.controller.ts       # REST API endpoints

backend/src/modules/ai/routes/
└── ai-v2.routes.ts           # Mounted at /api/v1/ai
```

---

## 🔀 LUỒNG HOẠT ĐỘNG

### AI Tutor Chat Flow

```
1. User connects WebSocket → /ai/chat
   ↓
2. Authenticate with JWT token
   ↓
3. User sends message
   ↓
4. AI Orchestrator classifies question
   ↓
5. Select provider:
   - Simple question → Groq (0.5-1.5s)
   - Complex question → Google Flash (1-3s)
   - Code question → ProxyPal Qwen (dev only)
   ↓
6. Provider generates response (with streaming)
   ↓
7. Save to ai_chat_history
   ↓
8. Cache response (1 hour TTL)
   ↓
9. Stream chunks to client
   ↓
10. Send final response
```

### Fallback Chain

```
Primary: Groq Llama 3
   ↓ (if error/rate limit)
Fallback 1: Google Gemini Flash
   ↓ (if error)
Fallback 2: Return error message
```

---

## 📊 MONITORING

### Log Patterns

```bash
# Theo dõi AI requests
docker logs lms-backend-dev -f | grep "\[AI"

# Theo dõi provider selection
docker logs lms-backend-dev -f | grep "Orchestrator"

# Theo dõi WebSocket connections
docker logs lms-backend-dev -f | grep "AIChatGateway"
```

### Key Metrics

- **Latency:** Groq < 2s, Google < 3s
- **Cache hit rate:** > 30% (tùy use case)
- **Provider availability:** > 99%
- **WebSocket connections:** Active sessions

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Groq provider not available"

**Nguyên nhân:** GROQ_API_KEY không có hoặc sai

**Giải pháp:**
1. Kiểm tra `.env`: `GROQ_API_KEY=your-key`
2. Lấy key mới tại: https://console.groq.com/
3. Restart server

### Issue 2: "Google AI provider not available"

**Nguyên nhân:** GEMINI_API_KEY không có hoặc sai

**Giải pháp:**
1. Kiểm tra `.env`: `GEMINI_API_KEY=your-key`
2. Lấy key mới tại: https://aistudio.google.com/
3. Restart server

### Issue 3: WebSocket connection rejected

**Nguyên nhân:** JWT token không hợp lệ

**Giải pháp:**
1. Đảm bảo token được gửi trong `auth` hoặc `query`
2. Token phải valid và chưa expired
3. Kiểm tra JWT_SECRET trong `.env`

### Issue 4: "ai_chat_history table not found"

**Nguyên nhân:** Migration chưa chạy

**Giải pháp:**
```bash
npm run migrate
```

---

## 🎯 NEXT STEPS

Sau khi setup xong, bạn có thể:

1. **Test Frontend Integration**
   - Tích hợp Socket.IO client trong React
   - Hiển thị streaming responses
   - Implement chat history

2. **Enable Additional Features**
   - Bật AI_QUIZ_GENERATOR_ENABLED=true
   - Bật AI_GRADER_ENABLED=true (sau khi test)

3. **Setup ProxyPal (Optional)**
   - Download ProxyPal từ https://proxypal.ai/
   - Cấu hình models: Gemini 3 Pro, Qwen Coder
   - Set PROXYPAL_ENABLED=true

4. **Monitor & Optimize**
   - Theo dõi latency
   - Điều chỉnh cache TTL
   - Fine-tune model selection logic

---

## 📚 TÀI LIỆU THAM KHẢO

- [AI_IMPLEMENTATION_COMPLETE.md](src/modules/ai/AI_IMPLEMENTATION_COMPLETE.md) - Tài liệu chi tiết
- [QUICK_START.md](src/modules/ai/QUICK_START.md) - Hướng dẫn nhanh
- [docs/AI/05_AI_TUTOR.md](../docs/AI/05_AI_TUTOR.md) - Tài liệu AI Tutor

---

**🎉 Chúc mừng! Hệ thống AI đã sẵn sàng sử dụng.**

Nếu gặp vấn đề, hãy kiểm tra logs và tham khảo phần Troubleshooting.
