# 🔌 THIẾT KẾ API & WEBSOCKET

**Tài liệu:** 10 - API Design  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P0 (Nền tảng)

---

## 📖 TỔNG QUAN

Tài liệu này định nghĩa các API endpoints (REST) và WebSocket events cho tất cả các tính năng AI. Mục đích là cung cấp contract rõ ràng giữa frontend và backend.

### Nguyên tắc thiết kế
- ✅ **RESTful:** Standard HTTP methods (GET, POST, PUT, DELETE)
- ✅ **Async Operations:** Long operations trả về job ID + polling
- ✅ **Real-time:** WebSocket cho streaming + live updates
- ✅ **Error Handling:** Consistent error response format
- ✅ **Versioning:** `/api/v1/` in URL paths

---

## 🏗️ API REST ENDPOINTS

### Quiz Generator API

#### POST /api/v1/ai/quiz/generate
**Tạo quiz từ content**

**Request:**
```json
{
  "courseId": "course-123",
  "topicId": "topic-456",
  "content": "Nội dung bài giảng hoặc URL",
  "questionCount": 10,
  "questionTypes": ["multiple_choice", "short_answer", "essay"],
  "difficulty": "medium",
  "cacheResult": true
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "job-12345",
  "status": "processing",
  "message": "Quiz generation started",
  "estimatedTime": 30,
  "pollUrl": "/api/v1/ai/quiz/jobs/job-12345"
}
```

#### GET /api/v1/ai/quiz/jobs/:jobId
**Poll kết quả quiz generation**

**Response (200 OK - Completed):**
```json
{
  "jobId": "job-12345",
  "status": "completed",
  "quiz": {
    "id": "quiz-789",
    "title": "Chapter 5 Quiz",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "Câu hỏi?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "Giải thích...",
        "difficulty": "medium",
        "concepts": ["concept1"]
      }
    ],
    "estimatedTime": 20,
    "totalPoints": 100
  },
  "createdAt": "2025-12-17T10:30:00Z"
}
```

#### GET /api/v1/ai/quiz/:quizId
**Lấy quiz đã tạo**

**Response:**
```json
{
  "quiz": { /* quiz object */ }
}
```

#### POST /api/v1/ai/quiz/:quizId/submit
**Submit quiz answers**

**Request:**
```json
{
  "answers": {
    "q1": "A",
    "q2": "B",
    "q3": "Câu trả lời tự luận..."
  },
  "timeSpent": 1200
}
```

**Response:**
```json
{
  "scoreId": "score-999",
  "score": 85,
  "maxScore": 100,
  "percentage": 85,
  "results": [
    {
      "questionId": "q1",
      "userAnswer": "A",
      "correct": true,
      "explanation": "..."
    }
  ],
  "conceptMastery": {
    "concept1": 90,
    "concept2": 75
  },
  "feedback": "Tốt lắm! Bạn hiểu rõ concept này."
}
```

### AI Tutor (Chat) API

#### WebSocket: /ws/ai/chat
**Real-time chat connection**

**Client Send:**
```json
{
  "type": "connect",
  "token": "jwt-token",
  "courseId": "course-123",
  "topicId": "topic-456"
}
```

**Server Response:**
```json
{
  "type": "connected",
  "message": "Kết nối thành công",
  "chatId": "chat-abc123"
}
```

#### WebSocket: send_message
**Gửi tin nhắn**

**Client Send:**
```json
{
  "type": "message",
  "text": "Làm sao để giải bài toán này?"
}
```

**Server Response (Streaming):**
```json
{
  "type": "response_chunk",
  "chunk": "Để giải bài toán này, chúng ta cần...",
  "isComplete": false
}
```

```json
{
  "type": "response_complete",
  "messageId": "msg-123",
  "fullResponse": "...",
  "suggestedFollowUp": "Bạn có muốn biết thêm về..."
}
```

#### WebSocket: get_history
**Lấy lịch sử chat**

**Client Send:**
```json
{
  "type": "get_history",
  "limit": 20
}
```

**Server Response:**
```json
{
  "type": "history",
  "messages": [
    {
      "role": "user",
      "content": "...",
      "timestamp": "2025-12-17T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "...",
      "timestamp": "2025-12-17T10:31:00Z"
    }
  ]
}
```

### Grader API

#### POST /api/v1/ai/grader/grade
**Tự động chấm bài**

**Request:**
```json
{
  "submissionId": "sub-123",
  "submissionType": "code|essay|mcq",
  "content": "Nội dung bài nộp",
  "rubricId": "rubric-456",
  "courseId": "course-123",
  "topicId": "topic-456"
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "grade-job-789",
  "status": "processing",
  "estimatedTime": 45
}
```

#### GET /api/v1/ai/grader/jobs/:jobId
**Poll kết quả chấm**

**Response (200 OK - Completed):**
```json
{
  "jobId": "grade-job-789",
  "status": "completed",
  "result": {
    "submissionId": "sub-123",
    "score": 85,
    "maxScore": 100,
    "feedback": "Bài làm rất tốt, tuy nhiên...",
    "detailedFeedback": {
      "Correctness": {
        "score": 90,
        "feedback": "Logic đúng"
      },
      "CodeQuality": {
        "score": 80,
        "feedback": "Có thể tối ưu variable naming"
      },
      "Performance": {
        "score": 85,
        "feedback": "Thuật toán hiệu quả"
      }
    },
    "issues": [
      {
        "type": "warning",
        "line": 42,
        "message": "Variable không sử dụng"
      }
    ],
    "canAppeal": true,
    "appealDeadline": "2025-12-24T10:30:00Z"
  }
}
```

#### POST /api/v1/ai/grader/appeal
**Gửi appeal đánh giá lại**

**Request:**
```json
{
  "resultId": "result-123",
  "reason": "Tôi không đồng ý vì...",
  "attachments": ["url-to-explanation"]
}
```

**Response:**
```json
{
  "appealId": "appeal-999",
  "status": "pending_review",
  "message": "Appeal của bạn đã được gửi",
  "reviewedBy": "teacher",
  "estimatedReviewTime": "24h"
}
```

### Debate API

#### POST /api/v1/ai/debate/start
**Bắt đầu debate**

**Request:**
```json
{
  "topic": "MVC vs Clean Architecture",
  "context": "Bối cảnh của vấn đề",
  "debateType": "project_design|curriculum|content_review|decision",
  "maxRounds": 3
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "debate-job-123",
  "status": "processing",
  "estimatedTime": 120
}
```

#### GET /api/v1/ai/debate/:debateId
**Lấy kết quả debate**

**Response:**
```json
{
  "debateId": "debate-456",
  "topic": "...",
  "rounds": [
    {
      "round": 1,
      "agentA": {
        "position": "...",
        "reasoning": "..."
      },
      "agentB": {
        "position": "...",
        "reasoning": "..."
      },
      "agreement": 45
    }
  ],
  "disagreement": 55,
  "requiresJudge": true,
  "judgeDecision": "...",
  "decision": "needs_revision|approved|rejected"
}
```

### Content Repurposing API

#### POST /api/v1/ai/content/upload/video
**Upload và xử lý video**

**Request (multipart/form-data):**
```
file: [video file]
title: "Lecture 5 - AI Basics"
formats: ["summary", "flashcards", "notes", "qa"]
courseId: "course-123"
```

**Response (202 Accepted):**
```json
{
  "jobId": "content-job-234",
  "status": "processing",
  "estimatedTime": 300
}
```

#### GET /api/v1/ai/content/:contentId
**Lấy nội dung đã xử lý**

**Response:**
```json
{
  "contentId": "content-567",
  "title": "Lecture 5 - AI Basics",
  "formats": {
    "summary": "Bản tóm tắt...",
    "flashcards": [
      {
        "front": "Định nghĩa AI?",
        "back": "AI là...",
        "difficulty": "easy"
      }
    ],
    "notes": "Ghi chú...",
    "qa": [
      {
        "question": "...?",
        "answer": "...",
        "type": "definition"
      }
    ],
    "outline": "I. Giới thiệu..."
  },
  "status": "completed"
}
```

#### GET /api/v1/ai/content/:contentId/download/:format
**Download định dạng cụ thể**

**Query Parameters:**
- `format`: json | pdf | markdown

**Response:**
- JSON: `{ "formats": {...} }`
- PDF: Binary PDF file
- Markdown: Text/markdown

### Adaptive Learning API

#### POST /api/v1/adaptive-learning/start
**Tạo learning path**

**Request:**
```json
{
  "courseId": "course-123",
  "topicId": "topic-456",
  "assessmentScore": 65,
  "assessmentDetails": {
    "questionsAnswered": 20,
    "correctAnswers": 13,
    "timeSpent": 1200,
    "conceptMastery": {
      "concept-1": 70,
      "concept-2": 50
    }
  }
}
```

**Response:**
```json
{
  "pathId": "path-789",
  "skillLevel": "intermediate",
  "estimatedTimeToMastery": 12,
  "milestones": [
    {
      "id": "m1",
      "sequence": 1,
      "title": "Khái niệm cơ bản",
      "description": "...",
      "resources": [
        {
          "type": "video",
          "title": "Intro video",
          "url": "/resources/video/intro",
          "estimatedTime": 15,
          "difficulty": "easy"
        }
      ],
      "estimatedTime": 2,
      "completed": false
    }
  ],
  "knowledgeGaps": ["concept-2", "concept-5"],
  "recommendations": ["Bắt đầu từ milestone 1", "..."]
}
```

#### GET /api/v1/adaptive-learning/:pathId
**Lấy learning path**

**Response:** (Tương tự POST response)

#### POST /api/v1/adaptive-learning/:pathId/progress
**Update tiến độ**

**Request:**
```json
{
  "milestoneId": "m1",
  "completed": true,
  "score": 85,
  "timeSpent": 120
}
```

**Response:**
```json
{
  "status": "updated",
  "milestoneId": "m1",
  "progress": 25,
  "masteryAchieved": false
}
```

#### GET /api/v1/adaptive-learning/:pathId/recommendation
**Lấy bước tiếp theo**

**Response:**
```json
{
  "milestoneId": "m2",
  "title": "Ứng dụng thực tế",
  "description": "...",
  "resources": [...],
  "successCriteria": {
    "minScore": 75,
    "questionsToPass": 8
  }
}
```

---

## 📋 ERROR HANDLING

### Standard Error Response

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "timestamp": "2025-12-17T10:30:00Z",
  "path": "/api/v1/ai/quiz/generate"
}
```

### Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Operation already in progress |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | AI provider down |

---

## 🔒 AUTHENTICATION & AUTHORIZATION

**Header Required:**
```
Authorization: Bearer <jwt-token>
```

**Scopes:**
- `student`: Đọc quiz, chat, grading results
- `instructor`: Tạo quiz, xem tất cả results
- `admin`: Tất cả permissions

---

## 📊 RATE LIMITING

**Per User (Hourly):**
- Quiz generation: 10 requests
- Chat messages: 100 requests
- Grading: 50 submissions
- Debate: 5 requests
- Content upload: 3 requests

**Response Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702820400
```

---

## 🔄 WEBHOOK (Optional)

**Job Completion Webhook:**

Khi job hoàn thành, server gửi POST request đến webhook URL (nếu cung cấp):

```json
{
  "jobId": "job-123",
  "type": "quiz_generation",
  "status": "completed",
  "result": { /* full result */ },
  "timestamp": "2025-12-17T10:30:00Z"
}
```

---

## 📚 LIÊN QUAN

- **Trước:** [09_ADAPTIVE_LEARNING.md](09_ADAPTIVE_LEARNING.md)
- **Tiếp:** [11_CONFIG_GUIDE.md](11_CONFIG_GUIDE.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
