# 🤖 TỔNG HỢP CÁC CHỨC NĂNG AI TRONG DỰ ÁN

**Ngày cập nhật:** 16/12/2025  
**AI Model:** Google Gemini (gemini-2.5-flash / gemini-1.5-flash)  
**Trạng thái:** ✅ Đã triển khai và tích hợp

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Chức năng AI cho Học viên](#chức-năng-ai-cho-học-viên)
3. [Chức năng AI cho Giảng viên](#chức-năng-ai-cho-giảng-viên)
4. [Cấu trúc Code](#cấu-trúc-code)
5. [API Endpoints](#api-endpoints)

---

## 🎯 TỔNG QUAN

Dự án sử dụng **Google Gemini API** để cung cấp các tính năng AI hỗ trợ cho cả học viên và giảng viên trong hệ thống LMS.

### Cấu hình
- **Model:** `gemini-2.5-flash` (hoặc `gemini-1.5-flash` cho free tier)
- **API Key:** Cấu hình qua biến môi trường `GEMINI_API_KEY`
- **Rate Limit:** 60 requests/phút (free tier)
- **Timeout:** 60-120 giây tùy chức năng

---

## 👨‍🎓 CHỨC NĂNG AI CHO HỌC VIÊN

### 1. Chat với AI Assistant
**Mô tả:** Học viên có thể chat với AI để hỏi đáp về nội dung học tập.

**API:** `POST /api/v1/ai/chat`

**Tính năng:**
- Chat tổng quát với AI
- Hỗ trợ conversation history
- Context-aware (có thể truyền courseId, lessonId)

**Frontend Component:**
- `AiAssistantCard` (trong lesson detail page)

---

### 2. Chat theo Bài học (Lesson Chat)
**Mô tả:** Chat với AI về nội dung cụ thể của một bài học.

**API:** `POST /api/v1/ai/lesson-chat`

**Tính năng:**
- AI hiểu context của bài học (title, description, content, materials)
- Trả lời câu hỏi dựa trên nội dung bài học
- Hỗ trợ conversation history

**Frontend:**
- Tích hợp trong `LessonDetailPage`

---

### 3. Tóm tắt Bài học (Lesson Summary)
**Mô tả:** AI tự động tạo tóm tắt nội dung bài học.

**API:** `POST /api/v1/ai/lesson-summary`

**Tính năng:**
- Tạo tóm tắt ngắn gọn, dễ hiểu
- Highlight các điểm quan trọng

---

### 4. Gợi ý Nội dung (Content Recommendations)
**Mô tả:** AI gợi ý các khóa học phù hợp với học viên.

**API:** `GET /api/v1/ai/recommendations`

**Tính năng:**
- Phân tích lịch sử học tập
- Gợi ý khóa học dựa trên sở thích và tiến độ

**Trạng thái:** ⚠️ Đã có API nhưng chưa tích hợp đầy đủ frontend

---

### 5. Phân tích Học tập (Learning Analytics)
**Mô tả:** AI phân tích tiến độ và đưa ra insights.

**API:** `GET /api/v1/ai/analytics`

**Tính năng:**
- Phân tích tiến độ học tập
- Dự đoán ngày hoàn thành
- Xác định điểm yếu
- Đưa ra khuyến nghị cải thiện

**Trạng thái:** ⚠️ Đã có API nhưng chưa tích hợp đầy đủ frontend

---

## 👨‍🏫 CHỨC NĂNG AI CHO GIẢNG VIÊN

### 1. Tạo Đề cương Khóa học (Generate Course Outline)
**Mô tả:** AI tự động tạo đề cương khóa học từ topic và mô tả.

**API:** `POST /api/v1/ai/instructor/generate-outline`

**Tính năng:**
- Tạo title, description, learning outcomes
- Tạo sections và lessons với thứ tự hợp lý
- Ước tính thời lượng cho từng lesson
- Hỗ trợ tùy chọn: duration, level, numberOfSections

**Frontend Component:**
- `AiCourseOutlineGenerator.tsx`
- Tích hợp trong trang tạo khóa học mới

**Input:**
```typescript
{
  topic: string;
  description?: string;
  duration?: number; // hours
  level?: 'beginner' | 'intermediate' | 'advanced';
  numberOfSections?: number;
}
```

**Output:**
- Title, description, learningOutcomes
- Sections với lessons (title, description, order, estimatedDuration)

---

### 2. Tạo Nội dung Bài học (Generate Lesson Content)
**Mô tả:** AI tạo nội dung chi tiết đầy đủ cho một bài học.

**API:** `POST /api/v1/ai/instructor/generate-lesson-content`

**Tính năng:**
- Tạo nội dung markdown/HTML chi tiết
- Dựa trên lesson title, description, course context
- Hỗ trợ các level: beginner, intermediate, advanced

**Frontend Component:**
- Tích hợp trong `LessonModal.tsx`
- Nút "Tạo nội dung với AI" trong editor

**Input:**
```typescript
{
  lessonTitle: string;
  lessonDescription: string;
  courseTitle: string;
  courseDescription?: string;
  sectionTitle?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}
```

**Output:**
- Content string (markdown/HTML format)

**Lưu ý:**
- Timeout: 60 giây
- Content được normalize và sanitize trước khi lưu DB

---

### 3. Tạo Câu hỏi Quiz (Generate Quiz Questions)
**Mô tả:** AI tự động tạo câu hỏi quiz từ nội dung khóa học/chương.

**API:** `POST /api/v1/ai/generate-quiz`

**Tính năng:**
- Tạo câu hỏi trắc nghiệm (single choice, multiple choice)
- Tạo câu hỏi Đúng/Sai (true/false)
- Hỗ trợ 3 mức độ: easy, medium, hard
- Tự động tạo options (3-6 options, không có prefix A/B/C/D)
- Tự động xác định đáp án đúng
- Có thể tạo dựa trên nội dung của một section cụ thể

**Frontend Component:**
- `AiQuizGenerator.tsx`
- Tích hợp trong `ManageQuizModal.tsx`

**Input:**
```typescript
{
  courseId: string;
  courseContent: string; // Nội dung section hoặc course
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'single_choice' | 'multiple_choice' | 'true_false';
}
```

**Output:**
- Array of questions với:
  - question (string)
  - type ('single_choice' | 'multiple_choice' | 'true_false')
  - options (string[])
  - correctAnswer (string | number | number[])
  - explanation (string, optional)
  - difficulty

**Workflow:**
1. Giảng viên chọn section/chương
2. Chọn số lượng câu hỏi, độ khó, loại câu hỏi
3. AI tạo câu hỏi dựa trên nội dung section
4. Tự động import vào quiz (bulk add)

---

### 4. Tạo Feedback cho Bài nộp (Generate Feedback)
**Mô tả:** AI tự động tạo feedback chi tiết cho bài nộp của học viên.

**API:** `POST /api/v1/ai/instructor/generate-feedback`

**Tính năng:**
- Phân tích nội dung bài nộp
- Đề xuất điểm số
- Liệt kê điểm mạnh và cần cải thiện
- Tạo feedback chi tiết theo từng phần
- Hỗ trợ rubric nếu có

**Frontend Component:**
- `AiFeedbackGenerator.tsx`
- Tích hợp trong modal chấm bài (`SubmissionsTab.tsx`)

**Input:**
```typescript
{
  assignmentId: string;
  submissionId: string;
  submissionContent: string;
  assignmentInstructions: string;
  rubric?: any;
  maxScore?: number;
}
```

**Output:**
```typescript
{
  feedback: {
    score?: number; // Điểm đề xuất
    feedback: string; // Feedback tổng thể
    strengths: string[]; // Điểm mạnh
    improvements: string[]; // Cần cải thiện
    detailedComments?: Array<{
      section: string;
      comment: string;
      score?: number;
    }>;
  };
  suggestedGrade?: string;
}
```

**Workflow:**
1. Giảng viên mở modal chấm bài
2. Click "Tạo Feedback với AI"
3. AI phân tích và tạo feedback
4. Tự động điền vào form chấm điểm (score + feedback text)

---

### 5. Chấm điểm Tự động (Auto-Grade)
**Mô tả:** AI tự động chấm điểm cho câu hỏi trắc nghiệm.

**API:** `POST /api/v1/ai/instructor/auto-grade`

**Tính năng:**
- Chấm điểm tự động cho câu hỏi objective
- Trả về điểm số và feedback cho từng câu
- Tính tỷ lệ phần trăm

**Frontend Component:**
- `AiFeedbackGenerator.tsx` (có section riêng cho auto-grade)

**Input:**
```typescript
{
  assignmentId: string;
  submissionId: string;
  submissionAnswers: Record<string, any>;
  assignmentQuestions: any[];
}
```

**Output:**
```typescript
{
  score: number;
  maxScore: number;
  percentage: number;
  gradedQuestions: Array<{
    questionId: string;
    isCorrect: boolean;
    points: number;
    maxPoints: number;
    feedback?: string;
  }>;
}
```

---

### 6. Gợi ý Cải thiện Khóa học (Suggest Course Improvements)
**Mô tả:** AI phân tích khóa học và đưa ra gợi ý cải thiện.

**API:** `POST /api/v1/ai/instructor/suggest-improvements`

**Tính năng:**
- Phân tích nội dung, cấu trúc, engagement
- Đưa ra điểm số tổng thể (0-100)
- Gợi ý theo categories: content, structure, engagement, assessment, accessibility
- Mức độ ưu tiên: high, medium, low

**Frontend Component:**
- `AiCourseImprovements.tsx`

**Input:**
```typescript
{
  courseId: string;
  courseData: {
    title: string;
    description?: string;
    content?: string;
    lessons?: any[];
    studentFeedback?: any[];
    enrollmentStats?: any;
  };
}
```

**Output:**
```typescript
{
  improvements: Array<{
    category: 'content' | 'structure' | 'engagement' | 'assessment' | 'accessibility';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    suggestion: string;
    impact: string;
  }>;
  overallScore?: number; // 0-100
  summary: string;
}
```

---

### 7. Phân tích Học viên (Analyze Students)
**Mô tả:** AI phân tích hiệu suất học tập của học viên trong khóa học.

**API:** `POST /api/v1/ai/instructor/analyze-students`

**Tính năng:**
- Phân tích từng học viên: progress, scores, strengths, weaknesses
- Phân tích tổng thể khóa học: completion rate, average score, common weak areas
- Xác định học viên có nguy cơ (at-risk students)
- Dự đoán ngày hoàn thành
- Đưa ra khuyến nghị cho từng học viên

**Frontend Component:**
- `AiStudentAnalyzer.tsx`

**Input:**
```typescript
{
  courseId: string;
  studentIds?: string[]; // Optional: phân tích học viên cụ thể
}
```

**Output:**
```typescript
{
  courseAnalytics: {
    totalStudents: number;
    averageProgress: number;
    averageScore: number;
    completionRate: number;
    commonWeakAreas: string[];
    topPerformers: string[];
    atRiskStudents: string[];
    insights: string[];
    recommendations: string[];
  };
  studentAnalyses: Array<{
    studentId: string;
    studentName: string;
    overallProgress: number;
    averageScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    predictedCompletionDate?: string;
  }>;
  generatedAt: string;
}
```

---

### 8. Tạo Prompt Thumbnail (Generate Thumbnail Prompt)
**Mô tả:** AI tạo prompt để tạo thumbnail cho khóa học.

**API:** `POST /api/v1/ai/instructor/generate-thumbnail`

**Tính năng:**
- Tạo prompt mô tả thumbnail phù hợp
- Đưa ra nhiều gợi ý prompt khác nhau

**Input:**
```typescript
{
  courseTitle: string;
  courseDescription?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}
```

**Output:**
```typescript
{
  prompt: string;
  suggestions?: string[];
}
```

**Trạng thái:** ⚠️ Đã có API nhưng chưa tích hợp frontend

---

## 📁 CẤU TRÚC CODE

### Backend

```
backend/src/modules/ai/
├── ai.controller.ts      # HTTP endpoints
├── ai.service.ts         # Business logic, Gemini API calls
├── ai.routes.ts          # Route definitions
└── ai.types.ts           # TypeScript interfaces
```

**Key Files:**
- `ai.service.ts`: Chứa tất cả logic gọi Gemini API
- `ai.controller.ts`: Xử lý HTTP requests/responses
- `ai.types.ts`: Định nghĩa types cho tất cả AI features

### Frontend

```
frontend/src/
├── services/api/
│   └── ai.api.ts         # API client methods
├── hooks/
│   └── useAi.ts          # React Query hooks
└── components/instructor/
    ├── AiCourseOutlineGenerator.tsx
    ├── AiQuizGenerator.tsx
    ├── AiFeedbackGenerator.tsx
    ├── AiCourseImprovements.tsx
    ├── AiStudentAnalyzer.tsx
    └── index.ts
```

**Key Files:**
- `ai.api.ts`: Axios client cho tất cả AI endpoints
- `useAi.ts`: Custom hooks sử dụng React Query
- Components trong `components/instructor/`: UI components cho từng tính năng

---

## 🔌 API ENDPOINTS

### Base URL: `/api/v1/ai`

### Học viên
- `POST /chat` - Chat với AI assistant
- `POST /lesson-chat` - Chat về bài học cụ thể
- `POST /lesson-summary` - Tóm tắt bài học
- `GET /recommendations` - Gợi ý nội dung
- `GET /analytics` - Phân tích học tập

### Giảng viên
- `POST /instructor/generate-outline` - Tạo đề cương khóa học
- `POST /instructor/generate-lesson-content` - Tạo nội dung bài học
- `POST /generate-quiz` - Tạo câu hỏi quiz
- `POST /instructor/generate-feedback` - Tạo feedback cho bài nộp
- `POST /instructor/auto-grade` - Chấm điểm tự động
- `POST /instructor/suggest-improvements` - Gợi ý cải thiện khóa học
- `POST /instructor/analyze-students` - Phân tích học viên
- `POST /instructor/generate-thumbnail` - Tạo prompt thumbnail

### Utility
- `GET /status` - Kiểm tra trạng thái AI service

**Lưu ý:** Tất cả endpoints đều yêu cầu authentication (`authMiddleware`)

---

## ⚙️ CẤU HÌNH

### Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash  # hoặc gemini-1.5-flash
```

### Error Handling

- **503 Service Unavailable:** Model quá tải → Hiển thị thông báo thân thiện
- **429 Too Many Requests:** Vượt quota → Hướng dẫn đợi hoặc nâng cấp
- **Timeout:** 60-120 giây tùy chức năng

---

## 📊 TRẠNG THÁI TRIỂN KHAI

| Chức năng | Backend | Frontend | Trạng thái |
|-----------|---------|----------|------------|
| Chat với AI | ✅ | ✅ | Hoàn thành |
| Lesson Chat | ✅ | ✅ | Hoàn thành |
| Lesson Summary | ✅ | ⚠️ | API có, UI chưa đầy đủ |
| Generate Course Outline | ✅ | ✅ | Hoàn thành |
| Generate Lesson Content | ✅ | ✅ | Hoàn thành |
| Generate Quiz | ✅ | ✅ | Hoàn thành |
| Generate Feedback | ✅ | ✅ | Hoàn thành |
| Auto-Grade | ✅ | ✅ | Hoàn thành |
| Suggest Improvements | ✅ | ✅ | Hoàn thành |
| Analyze Students | ✅ | ✅ | Hoàn thành |
| Content Recommendations | ✅ | ⚠️ | API có, UI chưa đầy đủ |
| Learning Analytics | ✅ | ⚠️ | API có, UI chưa đầy đủ |
| Generate Thumbnail | ✅ | ⚠️ | API có, UI chưa đầy đủ |

---

## 🔄 WORKFLOW TÍCH HỢP

### 1. Tạo Khóa học với AI
1. Giảng viên nhập topic → `AiCourseOutlineGenerator`
2. AI tạo outline → Hiển thị preview
3. Giảng viên chấp nhận → Tạo course với sections/lessons
4. Với mỗi lesson → Click "Tạo nội dung với AI" → `LessonModal`
5. AI tạo content → Hiển thị trong editor
6. Giảng viên chỉnh sửa → Lưu

### 2. Tạo Quiz với AI
1. Giảng viên mở `ManageQuizModal`
2. Chọn section/chương
3. Click "AI Tạo Quiz" → `AiQuizGenerator`
4. Chọn số lượng, độ khó, loại câu hỏi
5. AI tạo câu hỏi → Preview
6. Tự động import vào quiz (bulk add)

### 3. Chấm bài với AI
1. Giảng viên mở modal chấm bài
2. Xem nội dung bài nộp
3. Click "Tạo Feedback với AI" → `AiFeedbackGenerator`
4. AI tạo feedback + đề xuất điểm
5. Tự động điền vào form
6. Giảng viên chỉnh sửa nếu cần → Lưu

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Rate Limiting:** Free tier Gemini có giới hạn 60 requests/phút
2. **Content Formatting:** 
   - AI trả về markdown → Convert sang HTML
   - Strip class/style attributes để đồng nhất
   - Normalize code blocks
3. **Error Handling:** Luôn có fallback khi AI fail
4. **Timeout:** Các chức năng generation có timeout 60-120s
5. **Data Sanitization:** Tất cả content từ AI đều được sanitize trước khi lưu DB

---

## 🚀 HƯỚNG PHÁT TRIỂN

- [ ] Tích hợp đầy đủ Content Recommendations vào UI
- [ ] Tích hợp Learning Analytics dashboard
- [ ] Cải thiện error handling với specific error messages
- [ ] Thêm caching cho các AI responses
- [ ] Support multiple AI models (fallback)
- [ ] Batch processing cho multiple lessons

---

**Tài liệu này được tạo tự động dựa trên codebase hiện tại.**
