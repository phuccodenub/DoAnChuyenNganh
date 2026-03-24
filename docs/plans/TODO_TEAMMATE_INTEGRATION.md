# TODO: Hoàn Thiện Tích Hợp Teammate Code

> **Ngày tạo:** 01/12/2024  
> **Cập nhật:** 02/12/2024  
> **Mục đích:** Tracking các công việc cần làm để hoàn thiện features từ teammates

---

## 📊 Tổng quan Phân tích Backend

### Hiện trạng API đã có:

| Module | Routes File | Controller | Service | Repository | Status |
|--------|-------------|------------|---------|------------|--------|
| **Quiz** | ✅ quiz.routes.ts | ✅ Complete | ✅ Complete | ✅ Complete | **READY** |
| **Chat (Course)** | ✅ chat.routes.ts | ✅ Complete | ✅ Complete | ✅ Complete | **READY** |
| **Chat (DM)** | ✅ conversation.routes.ts | ✅ Complete | ✅ Complete | ✅ Complete | **READY** |
| **AI** | ✅ ai.routes.ts | ⚠️ Partial | ⚠️ Partial | N/A | Teammate task |
| **Livestream** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | Teammate task |
| **Moderation** | ✅ Complete | ✅ Complete | ✅ Complete | N/A | Teammate task |

---

## 1. Chat Feature - PHÂN BIỆT 2 LOẠI CHAT

### ⚠️ QUAN TRỌNG: Có 2 hệ thống Chat khác nhau!

#### 1.1 Course Chat (Group Chat) - ĐÃ CÓ BACKEND ✅

**Backend:** `backend/src/modules/chat/`

**API Endpoints:**
```
GET  /api/v1/chat/courses/:courseId/messages     - Lấy messages của course
POST /api/v1/chat/courses/:courseId/messages     - Gửi message vào course
PUT  /api/v1/chat/messages/:messageId            - Sửa message
DELETE /api/v1/chat/messages/:messageId          - Xóa message
GET  /api/v1/chat/courses/:courseId/messages/search - Tìm kiếm
GET  /api/v1/chat/courses/:courseId/statistics   - Thống kê
```

**Model:** `ChatMessage` với `course_id` (group chat trong course)

**Frontend Integration:** `frontend/src/services/api/chat.api.ts` ✅ Đã có

---

#### 1.2 Direct Message Chat (1-on-1) - CẦN TẠO BACKEND ❌

**Frontend UI:** `frontend/src/features/chat/` - Hoàn chỉnh, đang dùng mock data

**Frontend Types yêu cầu:** (từ `features/chat/types/index.ts`)
- `Conversation` - Cuộc trò chuyện 1-1 giữa Student ↔ Instructor
- `Message` - Tin nhắn trong conversation
- `ChatUser` - Thông tin người dùng chat

**Cần tạo Backend:**

1. **Database Models:**
   ```typescript
   // Conversation - Cuộc trò chuyện 1-1
   Conversation {
     id: UUID
     course_id: UUID         // Liên kết với course
     student_id: UUID        // Học viên
     instructor_id: UUID     // Giảng viên của course đó
     last_message_at: DATE
     created_at, updated_at
   }
   
   // DirectMessage - Tin nhắn trong conversation
   DirectMessage {
     id: UUID
     conversation_id: UUID
     sender_id: UUID
     content: TEXT
     status: ENUM('sending', 'sent', 'delivered', 'read')
     attachment_type: ENUM('image', 'file') | NULL
     attachment_url: TEXT | NULL
     attachment_name: VARCHAR | NULL
     created_at, updated_at
   }
   ```

2. **API Endpoints cần tạo:**
   ```
   GET  /api/v1/conversations              - Lấy danh sách conversations của user
   GET  /api/v1/conversations/:id          - Lấy chi tiết conversation
   POST /api/v1/conversations              - Tạo conversation mới
   GET  /api/v1/conversations/:id/messages - Lấy messages của conversation
   POST /api/v1/conversations/:id/messages - Gửi message mới
   PUT  /api/v1/messages/:id/read          - Đánh dấu đã đọc
   DELETE /api/v1/messages/:id             - Xóa message (soft delete)
   ```

3. **Socket.IO Events:**
   ```
   dm:new_message      - Nhận tin nhắn mới
   dm:message_read     - Tin nhắn đã đọc
   dm:typing_start     - Bắt đầu gõ
   dm:typing_stop      - Dừng gõ
   dm:online_status    - Trạng thái online
   ```

4. **Files Frontend cần update:**
   - `frontend/src/pages/student/ChatPage.tsx`
   - `frontend/src/pages/instructor/InstructorChatPage.tsx`
   - Tạo mới: `frontend/src/services/api/conversation.api.ts`
   - Tạo mới: `frontend/src/hooks/useConversations.ts`

---

## 2. Quiz Builder - CHỈ CẦN TÍCH HỢP FRONTEND

### Backend API - ĐÃ HOÀN CHỈNH ✅

**Vị trí:** `backend/src/modules/quiz/`

**API Endpoints đã có:**
```
GET    /api/v1/quizzes                        - Danh sách quizzes
GET    /api/v1/quizzes/:id                    - Chi tiết quiz
POST   /api/v1/quizzes                        - Tạo quiz (Instructor+)
PUT    /api/v1/quizzes/:id                    - Cập nhật quiz (Instructor+)
DELETE /api/v1/quizzes/:id                    - Xóa quiz (Instructor+)

GET    /api/v1/quizzes/:id/questions          - Danh sách câu hỏi
GET    /api/v1/quizzes/:quizId/questions/:questionId - Chi tiết câu hỏi
POST   /api/v1/quizzes/:id/questions          - Thêm câu hỏi (Instructor+)
PUT    /api/v1/quizzes/:quizId/questions/:questionId - Sửa câu hỏi (Instructor+)
DELETE /api/v1/quizzes/:quizId/questions/:questionId - Xóa câu hỏi (Instructor+)

POST   /api/v1/quizzes/:id/start              - Bắt đầu làm quiz
POST   /api/v1/quizzes/attempts/:attemptId/submit - Nộp bài
GET    /api/v1/quizzes/attempts/:attemptId    - Xem kết quả
GET    /api/v1/quizzes/:id/attempts           - Lịch sử làm bài
```

### Frontend - CẦN TÍCH HỢP

**Hooks đã có:** (cho Student taking quiz)
- `frontend/src/hooks/useQuizData.ts` ✅
  - `useQuiz(quizId)` - Fetch quiz
  - `useQuizQuestions(quizId)` - Fetch questions
  - `useStartQuiz()` - Start attempt
  - `useSubmitQuiz()` - Submit attempt

**Hooks cần tạo:** (cho Instructor building quiz)
```typescript
// frontend/src/hooks/useInstructorQuiz.ts
- useCreateQuiz()           - Tạo quiz mới
- useUpdateQuiz()           - Cập nhật quiz
- useDeleteQuiz()           - Xóa quiz
- useAddQuestion()          - Thêm câu hỏi
- useUpdateQuestion()       - Sửa câu hỏi
- useDeleteQuestion()       - Xóa câu hỏi
- useBulkAddQuestions()     - Thêm nhiều câu hỏi cùng lúc
```

**API Service cần bổ sung:**
```typescript
// Thêm vào frontend/src/services/api/quiz.api.ts
- createQuiz(data)
- updateQuiz(quizId, data)
- deleteQuiz(quizId)
- addQuestion(quizId, data)
- updateQuestion(quizId, questionId, data)
- deleteQuestion(quizId, questionId)
```

**Files cần update:**
- `frontend/src/pages/instructor/QuizBuilderPage.tsx` - Xóa mock data, tích hợp hooks

---

## 3. AI Module - ĐỂ TEAMMATE HOÀN THIỆN ⏸️

> **Note:** Section này để teammate tiếp tục phát triển

**Hiện trạng:**
- ✅ Chat với AI - Hoạt động (Gemini API)
- ✅ Quiz generation - Hoạt động
- ✅ Content moderation - Hoạt động
- ⏸️ Content recommendations - Placeholder
- ⏸️ Learning analytics - Placeholder

---

## 4. Livestream & Moderation - ĐỂ TEAMMATE HOÀN THIỆN ⏸️

> **Note:** Section này để teammate tiếp tục phát triển

**Hiện trạng:** ✅ Hoàn chỉnh - Có thể cần thêm tính năng

---

## 5. Clean up Mock Data - ĐỘ ƯU TIÊN THẤP

**Vị trí:** `frontend/src/pages/course/components/editor/courseDetail/mockData.ts`

**Cần làm:**
- Kiểm tra file `mockData.ts` có còn được sử dụng không
- Xóa nếu không cần thiết
- Đảm bảo tất cả data đều từ API

---

# 🚀 IMPLEMENTATION PHASES

## Phase 1: Quiz Builder Integration ✅ COMPLETED

> **Mục tiêu:** Instructor có thể tạo/sửa quiz với API thật
> **Commit:** 791b527 - feat(frontend): integrate Quiz Builder with backend API

### Batch 1.1: Bổ sung Quiz API Service ✅
- [x] Thêm functions cho instructor vào `quiz.api.ts`:
  - `createQuiz(data)` 
  - `updateQuiz(quizId, data)`
  - `deleteQuiz(quizId)`
  - `addQuestion(quizId, data)`
  - `updateQuestion(quizId, questionId, data)`
  - `deleteQuestion(quizId, questionId)`
  - `reorderQuestions(quizId, questionIds)`

### Batch 1.2: Tạo Instructor Quiz Hooks ✅
- [x] Tạo file `frontend/src/hooks/useInstructorQuiz.ts`:
  - `useInstructorQuiz()` query
  - `useInstructorQuizQuestions()` query
  - `useCreateQuiz()` mutation
  - `useUpdateQuiz()` mutation
  - `useDeleteQuiz()` mutation
  - `usePublishQuiz()` mutation
  - `useAddQuestion()` mutation
  - `useUpdateQuestion()` mutation
  - `useDeleteQuestion()` mutation
  - `useBulkAddQuestions()` mutation
  - `useQuizBuilder()` - combined helper hook

### Batch 1.3: Tích hợp QuizBuilderPage ✅
- [x] Update `QuizBuilderPage.tsx`:
  - Xóa mock data
  - Fetch quiz data khi edit mode
  - Integrate create/update mutations
  - Handle loading/error states
  - Validation before save

---

## Phase 2: Direct Message Backend ✅ COMPLETED

> **Mục tiêu:** Complete DM backend với REST API và Socket.IO
> **Commit:** 0b985d8 - feat(backend): complete DM backend module

### Batch 2.1: Database Setup ✅
- [x] Tạo migration `023-create-conversations-table.ts`
- [x] Tạo migration `024-create-direct-messages-table.ts`
- [x] Tạo model `conversation.model.ts`
- [x] Tạo model `direct-message.model.ts`
- [x] Update associations

### Batch 2.2: Repository & Service ✅
- [x] Tạo `conversation.repository.ts`
- [x] Tạo `direct-message.repository.ts`
- [x] Tạo `conversation.service.ts`

### Batch 2.3: API Routes & Controller ✅
- [x] Tạo `conversation.controller.ts`
- [x] Tạo `conversation.routes.ts`
- [x] Tạo `message.routes.ts`
- [x] Tạo `conversation.validate.ts`
- [x] Register routes trong API v1 router

### Batch 2.4: Socket.IO Integration ✅
- [x] Tạo `conversation.gateway.ts`
- [x] Implement DM events:
  - `dm:join_conversation`
  - `dm:leave_conversation`
  - `dm:send_message` / `dm:new_message`
  - `dm:mark_as_read` / `dm:message_read`
  - `dm:typing_start` / `dm:typing_stop` / `dm:user_typing`
  - `dm:get_unread_count` / `dm:unread_count`

**API Endpoints Created:**
```
GET    /api/v1/conversations              - List user conversations
POST   /api/v1/conversations              - Create/get conversation
GET    /api/v1/conversations/:id          - Get conversation details
GET    /api/v1/conversations/:id/messages - Get messages
POST   /api/v1/conversations/:id/messages - Send message
PUT    /api/v1/conversations/:id/read     - Mark as read
PUT    /api/v1/conversations/:id/archive  - Archive conversation
GET    /api/v1/conversations/:id/search   - Search messages
GET    /api/v1/conversations/unread-count - Get unread count
PUT    /api/v1/messages/:id               - Edit message
DELETE /api/v1/messages/:id               - Delete message
```

---

## Phase 3: Direct Message Frontend ✅ COMPLETED

> **Mục tiêu:** Integrate chat pages với real API
> **Commit:** d9966d3 - feat(frontend): integrate DM chat with real API

### Batch 3.1: API Service ✅
- [x] Tạo `frontend/src/services/api/conversation.api.ts`
- [x] Define all conversation API calls

### Batch 3.2: React Query Hooks ✅
- [x] Tạo `frontend/src/hooks/useConversations.ts`:
  - `useConversations()` - List conversations
  - `useConversation(id)` - Get single conversation
  - `useMessages(conversationId)` - Get messages
  - `useUnreadCount()` - Get unread count
  - `useCreateConversation()` - Create conversation
  - `useSendMessage()` - Send message
  - `useEditMessage()` - Edit message
  - `useDeleteMessage()` - Delete message
  - `useMarkAsRead()` - Mark as read
  - `useArchiveConversation()` - Archive
  - `useSearchMessages()` - Search
  - `useConversationChat()` - Combined hook

### Batch 3.3: Update Chat Pages ✅
- [x] Update `ChatPage.tsx` - Student chat with real API
- [x] Update `InstructorChatPage.tsx` - Instructor chat with real API
- [x] Transform API responses to ChatLayout format

---

## Phase 4: Remaining Mock Data Cleanup 📋

> **Note:** Các trang Student vẫn còn mock data, cần API integration sau

### Student Pages với Mock Data:

| Page | Mock Data | Backend API Status |
|------|-----------|-------------------|
| `StudentAssignmentsPage.tsx` | `MOCK_ASSIGNMENTS` | ⚠️ Cần Assignment API |
| `MyCoursesPage.tsx` | `MOCK_MATERIALS` | ⚠️ Cần tích hợp Enrollment + Materials |
| `DashboardPage.tsx` | `MOCK_DATA` | ⚠️ Cần Dashboard aggregation API |

### Priority:
1. **Assignment API** - Backend chưa có, cần tạo mới
2. **Dashboard API** - Cần aggregate từ nhiều nguồn
3. **Materials Integration** - Có thể dùng Lesson/Course API

---

## Priority Matrix

| Phase | Feature | Effort | Status | Notes |
|-------|---------|--------|--------|-------|
| **Phase 1** | Quiz Builder | 1 ngày | ✅ Done | Commit 791b527 |
| **Phase 2** | DM Backend | 2-3 ngày | ✅ Done | Commit 0b985d8 |
| **Phase 3** | DM Frontend | 1-2 ngày | ✅ Done | Commit d9966d3 |
| **Phase 4** | Mock Cleanup | 1-2 ngày | 📋 Future | Cần thêm APIs |

**Completed Work:**
- ✅ Quiz Builder API integration
- ✅ Instructor Quiz Hooks
- ✅ QuizBuilderPage với real API
- ✅ DM Backend module hoàn chỉnh
- ✅ DM Socket.IO gateway
- ✅ DM Frontend hooks và API service
- ✅ ChatPage và InstructorChatPage với real API

---

## Quick Reference

### Backend Module Structure
```
backend/src/modules/[feature]/
├── [feature].controller.ts    # HTTP handlers
├── [feature].service.ts       # Business logic  
├── [feature].repository.ts    # Database queries
├── [feature].routes.ts        # Route definitions
├── [feature].validate.ts      # Zod schemas
├── [feature].types.ts         # TypeScript types
├── [feature].gateway.ts       # Socket.IO (if realtime)
└── index.ts                   # Exports
```

### Frontend Hook Pattern
```typescript
// Query hook
export function useFeature(id: string) {
  return useQuery({
    queryKey: ['features', id],
    queryFn: () => featureApi.getById(id),
    enabled: !!id,
  });
}

// Mutation hook
export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => featureApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
```

---

## Notes

- Gemini API đã được cấu hình (`@google/generative-ai` installed)
- Socket.IO server đã có sẵn cho Course Chat và Livestream
- Quiz backend hoàn chỉnh, chỉ cần frontend integration
- Course Chat và DM Chat là 2 hệ thống khác nhau
- Livestream và AI để teammate tiếp tục phát triển
