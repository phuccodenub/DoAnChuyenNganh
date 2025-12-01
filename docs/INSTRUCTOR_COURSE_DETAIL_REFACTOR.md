# Instructor Course Detail - Refactor từ Mock Data sang API thật

## 📋 Tổng quan

Tài liệu này mô tả chi tiết quá trình refactor trang **Instructor Course Detail** từ việc sử dụng mock data sang API thật từ backend.

---

## ✅ Công việc đã hoàn thành

### 1. Backend - API Endpoints

#### 1.1 Course Stats API
- **File**: `backend/src/modules/course/course.routes.ts`
- **Endpoint**: `GET /api/courses/:courseId/stats`
- **Mô tả**: Lấy thống kê chi tiết khóa học cho instructor dashboard
- **Response**:
  ```typescript
  {
    total_students: number;
    total_revenue: number;
    average_rating: number;
    total_reviews: number;
    completion_rate: number;
    avg_progress: number;
    avg_score: number;
    pending_grading: number;
    max_students: number;
    new_students_this_week: number;
  }
  ```

#### 1.2 Assignment API (Mở rộng)
- **File**: `backend/src/modules/assignment/assignment.routes.ts`
- **Các endpoints mới**:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/assignments` | Lấy danh sách assignments với pagination |
| GET | `/api/assignments/:id` | Lấy chi tiết assignment |
| PUT | `/api/assignments/:id` | Cập nhật assignment |
| DELETE | `/api/assignments/:id` | Xóa assignment |
| GET | `/api/assignments/course/:courseId` | Lấy assignments của khóa học |
| GET | `/api/assignments/course/:courseId/stats` | Thống kê assignments của khóa học |
| GET | `/api/assignments/:assignmentId/submissions` | Lấy submissions của assignment |
| GET | `/api/assignments/:assignmentId/submissions/my` | Lấy submission của user hiện tại |
| PUT | `/api/assignments/:assignmentId/submissions/my` | Cập nhật submission |
| GET | `/api/assignments/:assignmentId/stats` | Thống kê assignment |
| GET | `/api/assignments/submissions/:submissionId` | Chi tiết submission |
| POST | `/api/assignments/submissions/:submissionId/grade` | Chấm điểm submission |
| GET | `/api/assignments/pending-grading` | Submissions chờ chấm điểm |
| GET | `/api/assignments/course/:courseId/pending-grading` | Submissions chờ chấm của khóa học |

### 2. Frontend - Services & Hooks

#### 2.1 Instructor API Service
- **File**: `frontend/src/services/api/instructor.api.ts`
- **Chức năng**:
  - Course management (CRUD)
  - Course stats
  - Students management
  - Sections management
  - Lessons management
  - Course status (publish/unpublish/archive)

#### 2.2 React Query Hooks
- **File**: `frontend/src/hooks/useInstructorCourse.ts`
- **Hooks**:
  - `useInstructorCourses` - Danh sách khóa học
  - `useInstructorCourseDetail` - Chi tiết khóa học
  - `useCourseStats` - Thống kê khóa học
  - `useCourseStudents` - Danh sách học viên
  - `useCourseSections` - Sections và lessons
  - `useCreateSection`, `useUpdateSection`, `useDeleteSection`
  - `useCreateLesson`, `useUpdateLesson`, `useDeleteLesson`
  - `useUpdateCourse`, `usePublishCourse`, `useUnpublishCourse`

### 3. Frontend - Page Component

#### 3.1 InstructorCourseDetailPage
- **File**: `frontend/src/pages/instructor/InstructorCourseDetailPage.tsx`
- **Thay đổi**:
  - Thay thế mock data bằng React Query hooks
  - Thêm loading và error states
  - Cập nhật handlers để sử dụng mutations
  - Transform API data để match component types

### 4. Seeders

#### 4.1 Sections & Lessons Seeder
- **File**: `backend/src/seeders/002a-seed-sections-lessons.ts`
- **Dữ liệu**: 7 sections, 12 lessons cho React và Node.js courses

#### 4.2 Assignments & Submissions Seeder
- **File**: `backend/src/seeders/002b-seed-assignments.ts`
- **Dữ liệu**: 6 assignments, 5 submissions với các trạng thái khác nhau

---

## ✅ Công việc đã hoàn thành

### Frontend Integration ✅
- [x] Tích hợp Assignment API vào frontend (`assignment.api.ts`)
- [x] Tạo React Query hooks (`useAssignments.ts`)
- [x] Cập nhật InstructorCourseDetailPage để sử dụng hooks mới
- [x] AssignmentsListTab và SubmissionsTab đã được tích hợp

---

## 📝 Next Steps

### Phase 1: Hoàn thiện Grading UI (Ưu tiên cao)

1. **Tạo GradingPage component**
   - Form chấm điểm chi tiết
   - Xem nội dung submission
   - Thêm feedback
   - Lưu điểm

2. **Cải thiện SubmissionsTab**
   - Inline grading với mutation
   - Bulk grading actions
   - Export/Import grades

### Phase 2: Reviews & Ratings ✅ Backend hoàn thành

1. **Backend API** ✅
   - `GET /api/reviews/course/:courseId` - Lấy reviews của khóa học
   - `GET /api/reviews/course/:courseId/stats` - Thống kê reviews
   - `GET /api/reviews/course/:courseId/my` - Review của user hiện tại
   - `POST /api/reviews` - Tạo review mới
   - `PUT /api/reviews/:reviewId` - Cập nhật review
   - `DELETE /api/reviews/:reviewId` - Xóa review
   - `POST /api/reviews/:reviewId/reply` - Instructor trả lời review

2. **Frontend Integration** (TODO)
   - Tạo review.api.ts service
   - Tạo useReviews.ts hooks
   - Tạo ReviewsTab component
   - Tích hợp API

### Phase 3: Analytics & Reports (Ưu tiên thấp)

1. **Backend API**
   - `GET /api/courses/:courseId/analytics/activity` - Activity timeline
   - `GET /api/courses/:courseId/analytics/completion` - Lesson completion data
   - `GET /api/courses/:courseId/analytics/alerts` - Academic alerts

2. **Frontend Integration**
   - Charts và visualizations
   - Export reports

### Phase 4: Testing & Optimization

1. **Unit Tests**
   - Backend API tests
   - Frontend component tests

2. **Integration Tests**
   - End-to-end flows

3. **Performance Optimization**
   - API response caching
   - Query optimization
   - Lazy loading

---

## 🗂️ File Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── assignment/
│   │   │   ├── assignment.controller.ts  ✅ Updated
│   │   │   ├── assignment.repository.ts  ✅ Updated
│   │   │   ├── assignment.routes.ts      ✅ Updated
│   │   │   ├── assignment.service.ts     ✅ Updated
│   │   │   └── assignment.types.ts
│   │   └── course/
│   │       ├── course.controller.ts      ✅ Updated
│   │       ├── course.repository.ts      ✅ Updated
│   │       ├── course.routes.ts          ✅ Updated
│   │       ├── course.service.ts         ✅ Updated
│   │       └── course.types.ts           ✅ Updated
│   └── seeders/
│       ├── 002a-seed-sections-lessons.ts ✅ Created
│       ├── 002b-seed-assignments.ts      ✅ Created
│       └── index.ts                      ✅ Updated

frontend/
├── src/
│   ├── hooks/
│   │   └── useInstructorCourse.ts        ✅ Created
│   ├── pages/
│   │   └── instructor/
│   │       └── InstructorCourseDetailPage.tsx ✅ Updated
│   └── services/
│       └── api/
│           └── instructor.api.ts         ✅ Created
```

---

## 🚀 Cách chạy Seeders

```bash
# Chạy tất cả seeders mới
cd backend
npm run seed

# Hoặc chạy từng seeder
npm run seed:run -- --version 002a  # Sections & Lessons
npm run seed:run -- --version 002b  # Assignments & Submissions
```

---

## ⚠️ Lưu ý quan trọng

1. **Seeders an toàn**: Tất cả seeders đều check trước khi insert để tránh duplicate data
2. **ID Format**: Sử dụng UUID format cố định để dễ tracking và rollback
3. **Dependencies**: Seeders phải chạy theo thứ tự (users → courses → enrollments → sections → assignments)
4. **Mock Data**: Một số features vẫn sử dụng mock data (reviews, analytics) cho đến khi API được implement

---

## 📊 API Response Format

Tất cả API responses tuân theo format chuẩn:

```typescript
{
  success: boolean;
  message: string;
  data: T | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🔐 Authorization

| Role | Permissions |
|------|-------------|
| Student | View published assignments, submit, view own submissions |
| Instructor | Full CRUD on own courses, grade submissions |
| Admin | Full access to all resources |

---

## 🧪 Testing

### Backend API Testing

```bash
# Test course stats
curl -X GET http://localhost:5000/api/courses/{courseId}/stats \
  -H "Authorization: Bearer {token}"

# Test course assignments
curl -X GET http://localhost:5000/api/assignments/course/{courseId} \
  -H "Authorization: Bearer {token}"

# Test pending grading
curl -X GET http://localhost:5000/api/assignments/pending-grading \
  -H "Authorization: Bearer {token}"

# Test grade submission
curl -X POST http://localhost:5000/api/assignments/submissions/{submissionId}/grade \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"score": 85, "feedback": "Good work!"}'
```

### Frontend Testing

```bash
cd frontend
npm run dev

# Navigate to:
# - /instructor/courses/{courseId} - Course detail page
# - Check Overview tab for stats
# - Check Curriculum tab for sections/lessons
# - Check Students tab for enrolled students
# - Check Submissions tab for assignments
```

---

## 🐛 Known Issues & Fixes

1. **Route Order**: Static routes (`/pending-grading`, `/submissions/:id`) phải đặt trước dynamic routes (`/:id`) để tránh conflict
2. **Type Compatibility**: `due_date` có thể là `undefined` hoặc `null`, cần handle cả hai cases
3. **User ID Field**: Backend sử dụng `user.id`, một số chỗ cũ dùng `user.userId` - cần thống nhất

---

## 📚 References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
- [Sequelize Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)

---

*Cập nhật lần cuối: 29/11/2024*
