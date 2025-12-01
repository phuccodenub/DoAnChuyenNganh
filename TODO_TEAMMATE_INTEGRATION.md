# TODO: Hoàn Thiện Tích Hợp Teammate Code

> **Ngày tạo:** 01/12/2024  
> **Mục đích:** Tracking các công việc cần làm để hoàn thiện features từ teammates

---

## 1. Chat Feature - CẦN TẠO BACKEND API

**Vị trí:** `frontend/src/features/chat/`

**Hiện trạng:** 
- ✅ UI hoàn chỉnh
- ❌ Đang dùng mock data (`features/chat/data/mockData.ts`)

**Cần làm:**
1. **Tạo Chat API backend:**
   - `GET /api/conversations` - Lấy danh sách conversations
   - `GET /api/conversations/:id/messages` - Lấy messages của conversation
   - `POST /api/conversations` - Tạo conversation mới
   - `POST /api/conversations/:id/messages` - Gửi message mới
   - `PUT /api/messages/:id/read` - Đánh dấu đã đọc

2. **Tạo database models:**
   - `Conversation` model
   - `Message` model
   - `ConversationParticipant` model

3. **Tích hợp Socket.IO cho realtime:**
   - Event: `new_message`
   - Event: `message_read`
   - Event: `typing_indicator`

4. **Files cần update:**
   - `frontend/src/pages/student/ChatPage.tsx` - Thay mock bằng API calls
   - `frontend/src/pages/instructor/InstructorChatPage.tsx` - Thay mock bằng API calls
   - `frontend/src/features/chat/components/*` - Tích hợp real data

---

## 2. Quiz Builder - CẦN TÍCH HỢP API

**Vị trí:** `frontend/src/pages/instructor/QuizBuilderPage.tsx`

**Hiện trạng:**
- ✅ UI hoàn chỉnh
- ❌ Đang dùng inline mock data

**Backend API đã có:**
- `backend/src/modules/quiz/` - Module quiz đã tồn tại

**Cần làm:**
1. **Kiểm tra và cập nhật Quiz API:**
   - `GET /api/quizzes/:quizId` - Lấy chi tiết quiz
   - `POST /api/quizzes` - Tạo quiz mới
   - `PUT /api/quizzes/:quizId` - Cập nhật quiz
   - `DELETE /api/quizzes/:quizId` - Xóa quiz
   - `POST /api/quizzes/:quizId/questions` - Thêm câu hỏi
   - `PUT /api/questions/:questionId` - Cập nhật câu hỏi
   - `DELETE /api/questions/:questionId` - Xóa câu hỏi

2. **Tạo React Query hooks:**
   - `useQuiz(quizId)` - Fetch quiz detail
   - `useCreateQuiz()` - Create mutation
   - `useUpdateQuiz()` - Update mutation
   - `useAddQuestion()` - Add question mutation

3. **Files cần update:**
   - `frontend/src/pages/instructor/QuizBuilderPage.tsx` - Tích hợp hooks

---

## 3. AI Module - MỘT SỐ FEATURES PLACEHOLDER

**Vị trí:** `backend/src/modules/ai/`

**Hiện trạng:**
- ✅ Chat với AI - Hoạt động
- ✅ Quiz generation - Hoạt động  
- ✅ Content moderation - Hoạt động
- ❌ Content recommendations - Trả về empty array
- ❌ Learning analytics - Trả về empty data

**Cần làm:**
1. **Content Recommendations:**
   - Implement algorithm dựa trên user learning history
   - Integrate với course data để suggest related courses
   - Sử dụng AI để generate personalized recommendations

2. **Learning Analytics:**
   - Collect và aggregate learning data
   - Generate insights về learning patterns
   - Create API endpoints cho analytics dashboard

---

## 4. Course Editor - MỘT SỐ MOCK DATA

**Vị trí:** `frontend/src/pages/course/components/editor/courseDetail/`

**Hiện trạng:**
- ✅ Đa số đã tích hợp API
- ⚠️ `mockData.ts` vẫn còn tồn tại nhưng không sử dụng nhiều

**Cần làm:**
1. Kiểm tra và xóa mock data không cần thiết
2. Đảm bảo tất cả data đều từ API

---

## 5. Livestream Moderation - ĐÃ HOÀN THÀNH

**Vị trí:** 
- `backend/src/modules/moderation/`
- `frontend/src/pages/livestream/create/components/ModerationSettings.tsx`

**Hiện trạng:** ✅ Hoàn chỉnh

---

## Priority Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 HIGH | Chat Feature Backend | 3-5 days | High - Core feature |
| 🟡 MEDIUM | Quiz Builder Integration | 1-2 days | Medium - UI exists |
| 🟡 MEDIUM | AI Recommendations | 2-3 days | Medium - Enhancement |
| 🟢 LOW | Learning Analytics | 2-3 days | Low - Enhancement |
| 🟢 LOW | Clean up mock data | 1 day | Low - Code quality |

---

## Notes

- Gemini API đã được cấu hình và hoạt động (`@google/generative-ai` installed)
- Moderation system hoạt động tốt với AI + keyword filtering
- Livestream UI đã được redesign theo Google Meet style
- Course page đã được restructure theo feature-based architecture
