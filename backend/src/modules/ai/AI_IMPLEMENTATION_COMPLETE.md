# 🤖 AI SYSTEM V2 - IMPLEMENTATION COMPLETE

**Last Updated:** December 18, 2025  
**Status:** ✅ **Production Ready**

---

## 📋 TỔNG QUAN (OVERVIEW)

Hệ thống AI mới với kiến trúc **3-tier hybrid** đã được triển khai hoàn chỉnh, kết hợp:
- **Tier 1:** Fast & Free (Groq, Google AI Studio)
- **Tier 2:** Powerful & Local (ProxyPal - Gemini 3 Pro, Qwen 3 Coder)
- **Tier 3:** Premium & Critical (ProxyPal Premium - GPT-5.2, GPT-5.1)

### Tính năng đã triển khai (Implemented Features)

✅ **AI Tutor Chatbot** - Real-time WebSocket chat với AI  
✅ **Multi-Provider Support** - Tự động chọn provider phù hợp  
✅ **Smart Model Selection** - AI Orchestrator tự động phân loại câu hỏi  
✅ **Redis Caching** - Cache responses để tiết kiệm chi phí  
✅ **Database Persistence** - Lưu lịch sử chat vào PostgreSQL  
✅ **REST API** - HTTP endpoints để kiểm tra status và test  
✅ **WebSocket Gateway** - Real-time streaming responses  
✅ **Auto Fallback** - Tự động chuyển sang provider khác nếu failed

---

## 🏗️ CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

```
backend/src/modules/ai/
├── providers/                    # AI Provider implementations
│   ├── base.provider.ts         # Base interface cho tất cả providers
│   ├── proxypal.provider.ts     # ProxyPal (Local: Gemini 3, Qwen 3)
│   ├── groq.provider.ts         # Groq (Free: Llama 3 70B)
│   └── google-ai.provider.ts    # Google AI Studio (Free: Gemini Flash)
├── orchestrator/                 # Model selection & routing
│   └── ai-orchestrator.ts       # Phân loại câu hỏi và chọn provider
├── services/                     # Business logic
│   ├── ai-tutor.service.ts      # AI Tutor chatbot service
│   └── ai-cache.service.ts      # Redis caching cho AI responses
├── repositories/                 # Database operations
│   └── ai-chat.repository.ts    # CRUD cho chat history
├── gateways/                     # WebSocket handlers
│   └── ai-chat.gateway.ts       # WebSocket gateway cho AI chat
├── controllers/                  # HTTP controllers
│   └── ai-v2.controller.ts      # REST API endpoints
├── routes/                       # API routes
│   └── ai-v2.routes.ts          # Route definitions
└── index.ts                      # Module exports

backend/src/models/
└── ai-chat-history.model.ts      # Sequelize model cho chat history

backend/migrations/
└── 20251218-create-ai-chat-history.ts  # Database migration
```

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE)

### Bước 1: Cấu hình môi trường (.env)

```env
# =========================================
# AI CONFIGURATION
# =========================================

# Google AI Studio (Free Tier) - Gemini Flash
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Groq API (Free Tier) - Llama 3
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# ProxyPal (Local AI Gateway) - Optional
PROXYPAL_BASE_URL=http://localhost:8317
PROXYPAL_ENABLED=false

# AI Features Toggles
AI_TUTOR_ENABLED=true
AI_QUIZ_GENERATOR_ENABLED=true
AI_GRADER_ENABLED=false
AI_CONTENT_REPURPOSING_ENABLED=false

# Redis (Required for caching)
REDIS_URL=redis://localhost:6379
```

### Bước 2: Lấy API Keys

#### Google AI Studio (Free)
1. Truy cập: https://aistudio.google.com/
2. Đăng nhập với Google account
3. Click "Get API Key"
4. Copy API key vào `GEMINI_API_KEY`

#### Groq API (Free)
1. Truy cập: https://console.groq.com/
2. Đăng ký tài khoản
3. Tạo API key
4. Copy API key vào `GROQ_API_KEY`

#### ProxyPal (Optional - For Development)
1. Tải ProxyPal: https://proxypal.ai/download
2. Cài đặt và chạy ProxyPal
3. Đăng nhập với Google/Alibaba accounts
4. Set `PROXYPAL_ENABLED=true`

### Bước 3: Chạy Migration

```bash
# Chạy migration để tạo bảng ai_chat_history
npm run migrate

# Hoặc reset database (nếu development)
npm run reset-db
```

### Bước 4: Khởi động Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Bước 5: Kiểm tra Status

```bash
# Check AI service status
curl http://localhost:3000/api/v1/ai/status

# Expected response:
{
  "success": true,
  "data": {
    "available": true,
    "providers": [
      {
        "name": "Groq",
        "model": "llama-3.3-70b-versatile",
        "available": true
      },
      {
        "name": "Google AI",
        "model": "gemini-1.5-flash",
        "available": true
      }
    ],
    "cache": {
      "available": true,
      "stats": {
        "totalKeys": 0,
        "memoryUsed": "1.2M"
      }
    },
    "features": {
      "tutor": true,
      "quizGenerator": true,
      "grader": false,
      "contentRepurposing": false
    }
  }
}
```

---

## 📡 API ENDPOINTS

### 1. Check AI Status
```http
GET /api/v1/ai/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "providers": [...],
    "cache": {...},
    "features": {...}
  }
}
```

### 2. Test AI Chat (REST)
```http
POST /api/v1/ai/chat/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Explain what is React?",
  "courseId": "uuid-optional",
  "lessonId": "uuid-optional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "React is a JavaScript library...",
    "metadata": {
      "model": "llama-3.3-70b-versatile",
      "provider": "Groq",
      "tier": "tier1",
      "latency": 1250,
      "usage": {
        "promptTokens": 120,
        "completionTokens": 450,
        "totalTokens": 570
      }
    }
  }
}
```

### 3. Get Available Providers
```http
GET /api/v1/ai/providers
Authorization: Bearer <token>
```

### 4. Clear AI Cache (Admin)
```http
DELETE /api/v1/ai/cache
Authorization: Bearer <admin-token>
```

---

## 🔌 WEBSOCKET API

### Connection
```javascript
const socket = io('http://localhost:3000/ai/chat', {
  auth: {
    token: 'your-jwt-token'
  },
  query: {
    courseId: 'course-uuid',
    lessonId: 'lesson-uuid'
  }
});
```

### Events

#### Client → Server

**Send Message:**
```javascript
socket.emit('message', {
  text: 'What is the difference between var and let?',
  courseId: 'optional-course-id',
  lessonId: 'optional-lesson-id'
});
```

**Get History:**
```javascript
socket.emit('get_history');
```

**Clear History:**
```javascript
socket.emit('clear_history');
```

#### Server → Client

**Connected:**
```javascript
socket.on('connected', (data) => {
  console.log('Connected to AI Tutor:', data);
});
```

**Status Updates:**
```javascript
socket.on('status', (data) => {
  // data.state: 'typing' | 'idle'
  console.log('AI status:', data.state);
});
```

**Response Chunk (Streaming):**
```javascript
socket.on('response_chunk', (data) => {
  console.log('Chunk:', data.chunk);
  // Append to UI
});
```

**Complete Response:**
```javascript
socket.on('message_response', (data) => {
  console.log('Full response:', data.text);
  console.log('Metadata:', data.metadata);
});
```

**History:**
```javascript
socket.on('history', (data) => {
  console.log('Conversation history:', data.messages);
});
```

**Error:**
```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

---

## 🎯 SMART MODEL SELECTION

AI Orchestrator tự động phân loại câu hỏi và chọn provider phù hợp:

### Question Types

| Type | Complexity | Provider | Reason |
|------|-----------|----------|---------|
| **Code** | High | ProxyPal (Qwen Coder) | Code-specialized model |
| **Complex** | High | ProxyPal (Gemini Pro) | Large context window |
| **Math** | Medium | Google AI (Gemini Flash) | Fast + accurate |
| **Simple** | Low | Groq (Llama 3) | Fastest response |

### Fallback Chain

```
Primary Provider Failed
    ↓
Groq (Tier 1 - Fast)
    ↓ (if failed)
Google AI (Tier 1 - Reliable)
    ↓ (if failed)
Error: All providers unavailable
```

---

## 💾 DATABASE SCHEMA

### Table: `ai_chat_history`

```sql
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  model VARCHAR(100),
  provider VARCHAR(50),
  latency INTEGER COMMENT 'Response latency in milliseconds',
  tokens_used INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_history_user_created ON ai_chat_history(user_id, created_at);
CREATE INDEX idx_ai_chat_history_course ON ai_chat_history(course_id);
CREATE INDEX idx_ai_chat_history_lesson ON ai_chat_history(lesson_id);
```

---

## 🔒 REDIS CACHING

### Cache Strategy

- **Key Format:** `ai:cache:<sha256(prompt+context)>`
- **TTL:** 1 hour (3600 seconds)
- **Database:** Redis DB 3

### Cache Hit Rate

```bash
# Check cache stats
curl http://localhost:3000/api/v1/ai/status | jq '.data.cache'
```

---

## 📊 MONITORING & LOGGING

### Logs

All AI operations are logged với format:
```
[AIOrchestrator] Question classified as: code (high)
[AIOrchestrator] Selected: Qwen Coder (Code-specialized model)
[AITutorService] Processing question: type=code, complexity=high
[AITutorService] Response generated: provider=ProxyPal, latency=3250ms
[AIChatGateway] User <uuid> connected to AI chat
```

### Metrics

- Total messages processed
- Average latency per provider
- Token usage
- Cache hit rate
- Provider availability

---

## 🔧 TROUBLESHOOTING

### ProxyPal không kết nối được

```bash
# Check if ProxyPal is running
curl http://localhost:8317/v1/models

# If not running:
# 1. Start ProxyPal application
# 2. Login to Google/Alibaba accounts
# 3. Verify ports 8317 is not blocked
```

### Groq rate limit exceeded

```
Error: Groq rate limit exceeded. Please try again later.
```

**Solution:** System sẽ tự động fallback sang Google AI. Đợi 1 phút và thử lại.

### Redis connection failed

```
[AICacheService] Redis not available, caching disabled
```

**Solution:** Caching không bắt buộc. Service vẫn hoạt động nhưng không cache responses.

### All providers unavailable

```
Error: No AI provider available. Please check your configuration.
```

**Check:**
1. `GEMINI_API_KEY` có đúng không?
2. `GROQ_API_KEY` có đúng không?
3. Internet connection có ổn định không?
4. API keys có hết quota không?

---

## 📈 ROADMAP

### Phase 1: ✅ COMPLETED (December 18, 2025)
- [x] AI Tutor Chatbot
- [x] Multi-provider support
- [x] Smart model selection
- [x] WebSocket real-time chat
- [x] Redis caching
- [x] Database persistence

### Phase 2: 🚧 IN PROGRESS
- [ ] Quiz Generator
- [ ] AI Grader (Code + Essay)
- [ ] Debate Workflow (Multi-agent)

### Phase 3: 📋 PLANNED
- [ ] Content Repurposing (Video → Notes)
- [ ] Adaptive Learning Paths
- [ ] Voice Chat (Whisper STT)

---

## 👥 CREDITS

**Architect & Implementation:** GitHub Copilot  
**Documentation:** [00_INDEX.md](../../../docs/AI/00_INDEX.md)  
**Date:** December 18, 2025

---

## 📞 SUPPORT

For issues or questions:
1. Check [troubleshooting section](#-troubleshooting)
2. Review logs: `backend/logs/`
3. Check AI documentation: `docs/AI/`

---

**🎉 AI System V2 is now live and ready for production!**
