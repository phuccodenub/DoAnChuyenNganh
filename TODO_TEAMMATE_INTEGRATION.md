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
| **Chat (DM)** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing | **NEED CREATE** |
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

## Phase 1: Quiz Builder Integration (Effort: 1 ngày)

> **Mục tiêu:** Instructor có thể tạo/sửa quiz với API thật

### Batch 1.1: Bổ sung Quiz API Service (30 phút)
- [ ] Thêm functions cho instructor vào `quiz.api.ts`:
  - `createQuiz(data)` 
  - `updateQuiz(quizId, data)`
  - `deleteQuiz(quizId)`
  - `addQuestion(quizId, data)`
  - `updateQuestion(quizId, questionId, data)`
  - `deleteQuestion(quizId, questionId)`

### Batch 1.2: Tạo Instructor Quiz Hooks (1 giờ)
- [ ] Tạo file `frontend/src/hooks/useInstructorQuiz.ts`:
  - `useCreateQuiz()` mutation
  - `useUpdateQuiz()` mutation
  - `useDeleteQuiz()` mutation
  - `useAddQuestion()` mutation
  - `useUpdateQuestion()` mutation
  - `useDeleteQuestion()` mutation

### Batch 1.3: Tích hợp QuizBuilderPage (2-3 giờ)
- [ ] Update `QuizBuilderPage.tsx`:
  - Xóa mock data
  - Fetch quiz data khi edit mode
  - Integrate create/update mutations
  - Handle loading/error states
  - Test toàn bộ flow

---

## Phase 2: Direct Message Backend (Effort: 2-3 ngày)

> **Mục tiêu:** Tạo đầy đủ backend cho DM Chat

### Batch 2.1: Database Setup (2 giờ)
- [ ] Tạo migration `023-create-conversations-table.ts`
- [ ] Tạo migration `024-create-direct-messages-table.ts`
- [ ] Tạo model `conversation.model.ts`
- [ ] Tạo model `direct-message.model.ts`
- [ ] Update associations

### Batch 2.2: Repository & Service (3 giờ)
- [ ] Tạo `conversation.repository.ts`
- [ ] Tạo `direct-message.repository.ts`
- [ ] Tạo `conversation.service.ts`

### Batch 2.3: API Routes & Controller (2 giờ)
- [ ] Tạo `conversation.controller.ts`
- [ ] Tạo `conversation.routes.ts`
- [ ] Tạo `conversation.validate.ts`
- [ ] Register routes trong app

### Batch 2.4: Socket.IO Integration (3 giờ)
- [ ] Tạo `conversation.gateway.ts`
- [ ] Implement DM events:
  - `dm:join_conversation`
  - `dm:leave_conversation`
  - `dm:new_message`
  - `dm:message_read`
  - `dm:typing`

### Batch 2.5: Testing (2 giờ)
- [ ] Unit tests cho service
- [ ] Integration tests cho API
- [ ] Manual testing với Postman

---

## Phase 3: Direct Message Frontend (Effort: 1-2 ngày)

> **Mục tiêu:** Kết nối UI chat với backend thật

### Batch 3.1: API Service (1 giờ)
- [ ] Tạo `frontend/src/services/api/conversation.api.ts`
- [ ] Define all conversation API calls

### Batch 3.2: React Query Hooks (1 giờ)
- [ ] Tạo `frontend/src/hooks/useConversations.ts`:
  - `useConversations()` - list
  - `useConversation(id)` - detail
  - `useCreateConversation()` - create
  - `useConversationMessages(id)` - messages
  - `useSendMessage()` - send

### Batch 3.3: Socket.IO Hooks (1 giờ)
- [ ] Tạo `frontend/src/hooks/useConversationSocket.ts`:
  - Connect/disconnect logic
  - Event handlers
  - Typing indicators
  - Online status

### Batch 3.4: Update Chat Pages (2-3 giờ)
- [ ] Update `ChatPage.tsx`:
  - Replace mock với hooks
  - Integrate socket events
  - Handle loading/error states
- [ ] Update `InstructorChatPage.tsx`:
  - Same updates

### Batch 3.5: Testing & Polish (2 giờ)
- [ ] Test full chat flow
- [ ] Fix UI bugs
- [ ] Optimize performance

---

## Priority Matrix

| Phase | Feature | Effort | Impact | Dependencies |
|-------|---------|--------|--------|--------------|
| **Phase 1** | Quiz Builder | 1 ngày | High | None |
| **Phase 2** | DM Backend | 2-3 ngày | High | None |
| **Phase 3** | DM Frontend | 1-2 ngày | High | Phase 2 |

**Recommended Order:** Phase 1 → Phase 2 → Phase 3

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
