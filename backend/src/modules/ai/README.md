# 🤖 AI Module - Gemini Integration

Module AI sử dụng Google Gemini API (Free Tier) để cung cấp các tính năng AI cho hệ thống LMS.

## 📋 Tổng quan

- **Model mặc định:** `gemini-1.5-flash` (Free Tier)
- **Rate limit:** 60 requests/phút (Free Tier)
- **Token limit:** 32,000 tokens/request (Free Tier)
- **Max output tokens:** 8,192 (để dành chỗ cho input)

## 🚀 Setup

### 1. Lấy API Key từ Google AI Studio

1. Truy cập: https://aistudio.google.com/
2. Đăng nhập bằng tài khoản Google
3. Click "Get API Key" hoặc vào Settings → API Keys
4. Tạo API key mới
5. Copy API key

### 2. Cấu hình Environment Variables

Thêm vào file `.env` hoặc `.env.local`:

```env
# Gemini API Configuration (Free Tier)
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192
```

### 3. Models có sẵn (Free Tier)

- **`gemini-1.5-flash`** (Khuyến nghị)
  - Nhanh, tối ưu cho free tier
  - Phù hợp cho chat, quiz generation
  - 60 requests/phút

- **`gemini-pro`** (Cũ)
  - Vẫn hoạt động trên free tier
  - Có thể chậm hơn flash
  - 60 requests/phút

### 4. Kiểm tra kết nối

```bash
# Test API endpoint
GET /api/v1/ai/status
```

Response:
```json
{
  "success": true,
  "data": {
    "available": true
  },
  "message": "AI service is available"
}
```

## 📡 API Endpoints

### 1. Chat với AI Assistant

```http
POST /api/v1/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Xin chào, bạn có thể giúp tôi không?",
  "context": {
    "courseTitle": "JavaScript Basics",
    "courseDescription": "Khóa học JavaScript cơ bản"
  },
  "options": {
    "temperature": 0.7,
    "maxTokens": 2048
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "Xin chào! Tôi có thể giúp gì cho bạn?",
    "usage": {
      "promptTokens": 50,
      "completionTokens": 20,
      "totalTokens": 70
    }
  }
}
```

### 2. Generate Quiz Questions

```http
POST /api/v1/ai/generate-quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "uuid",
  "courseContent": "Nội dung khóa học...",
  "numberOfQuestions": 5,
  "difficulty": "medium",
  "questionType": "multiple_choice"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "Câu hỏi?",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Giải thích",
        "difficulty": "medium"
      }
    ],
    "totalQuestions": 5
  }
}
```

### 3. Get Content Recommendations (Placeholder)

```http
GET /api/v1/ai/recommendations?limit=10
Authorization: Bearer <token>
```

### 4. Get Learning Analytics (Placeholder)

```http
GET /api/v1/ai/analytics?courseId=uuid
Authorization: Bearer <token>
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | `''` | API key từ Google AI Studio |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Model name (gemini-1.5-flash hoặc gemini-pro) |
| `GEMINI_TEMPERATURE` | `0.7` | Temperature (0.0 - 1.0) |
| `GEMINI_MAX_TOKENS` | `8192` | Max output tokens (Free tier: 32k total) |

### Temperature Guide

- **0.0 - 0.3:** Deterministic, ít sáng tạo
- **0.4 - 0.7:** Cân bằng (khuyến nghị)
- **0.8 - 1.0:** Sáng tạo, đa dạng hơn

## 🔒 Rate Limiting

Free Tier có giới hạn:
- **60 requests/phút**
- **32,000 tokens/request** (input + output)

Nếu vượt quá, API sẽ trả về lỗi 429. Cần implement:
- Rate limiting middleware
- Request queuing
- Retry logic với exponential backoff

## 📝 Usage Examples

### Chat với context

```typescript
const response = await fetch('/api/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "Giải thích về closure trong JavaScript",
    context: {
      courseTitle: "JavaScript Advanced",
      courseDescription: "Khóa học JavaScript nâng cao"
    }
  })
});
```

### Generate Quiz

```typescript
const response = await fetch('/api/v1/ai/generate-quiz', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: "course-uuid",
    courseContent: "Nội dung bài học về React hooks...",
    numberOfQuestions: 10,
    difficulty: "medium",
    questionType: "multiple_choice"
  })
});
```

## 🐛 Troubleshooting

### Lỗi: "AI service is not available"

**Nguyên nhân:**
- Chưa set `GEMINI_API_KEY` trong `.env`
- API key không hợp lệ

**Giải pháp:**
1. Kiểm tra `.env` file có `GEMINI_API_KEY`
2. Verify API key tại https://aistudio.google.com/
3. Restart server sau khi thêm env variable

### Lỗi: 429 Too Many Requests

**Nguyên nhân:**
- Vượt quá 60 requests/phút

**Giải pháp:**
- Implement rate limiting
- Thêm delay giữa các requests
- Cache responses khi có thể

### Lỗi: Invalid model name

**Nguyên nhân:**
- Model name không đúng

**Giải pháp:**
- Sử dụng `gemini-1.5-flash` hoặc `gemini-pro`
- Kiểm tra model name trong `.env`

## 🔮 Future Enhancements

- [ ] Content recommendations với user learning history
- [ ] Learning analytics với AI insights
- [ ] Chatbot tích hợp vào chat system
- [ ] Context-aware responses với course materials
- [ ] Rate limiting middleware
- [ ] Response caching
- [ ] Error retry logic

## 📚 References

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini Models](https://ai.google.dev/models/gemini)

---

**Last Updated:** 30/11/2025

