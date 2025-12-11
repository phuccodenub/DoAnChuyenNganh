# 📋 KẾ HOẠCH REFACTOR STUDENT UI - CHI TIẾT

> **Mục tiêu:** Refactor hoàn chỉnh giao diện Student với real API và tiếng Việt
> **Ngày tạo:** 2024-12-03
> **Trạng thái:** 🔄 Đang thực hiện

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### Nguyên tắc: KHÔNG tạo module riêng, sử dụng các modules có sẵn

### Backend API đã có sẵn có thể sử dụng:

| # | Endpoint | Module | Có thể dùng cho |
|---|----------|--------|-----------------|
| 1 | `GET /courses/enrolled` | course | Danh sách khóa học đã đăng ký ✅ |
| 2 | `GET /enrollments/stats/user/:userId` | enrollment | Dashboard stats |
| 3 | `GET /course-content/users/me/recent-activity` | course-content | Recent activity |
| 4 | `GET /course-content/courses/:courseId/progress` | course-content | Course progress |
| 5 | `GET /assignments/course/:courseId` | assignment | Assignments per course |
| 6 | `GET /assignments/:id/submissions/my` | assignment | My submission |

### Đã thêm vào backend (vào modules có sẵn):

| # | Endpoint đã thêm | Module | Status |
|---|------------------|--------|--------|
| 1 | `GET /courses/recommended` | course | ✅ Done |
| 2 | `GET /assignments/my` | assignment | ✅ Done |

### Backend API đã có liên quan đến Student:

| Module | Endpoints |
|--------|-----------|
| **Course** | `GET /courses/enrolled` - Lấy khóa học đã đăng ký |
| **Enrollment** | `GET /enrollments/user/:userId` - Lấy enrollments của user |
| | `GET /enrollments/stats/user/:userId` - Stats enrollment user |
| **Assignment** | `GET /assignments/course/:courseId` - Assignments theo course |
| | `GET /assignments/:assignmentId/submissions/my` - Submission của tôi |
| **Quiz** | `GET /quizzes/:id/attempts` - Quiz attempts của user |
| **Course-Content** | `GET /course-content/courses/:courseId/progress` - Course progress |
| | `GET /course-content/users/me/recent-activity` - Recent activity |
| **Analytics** | `GET /analytics/users/:userId/activities` - User activities |

---

## 📝 TODO LIST CHI TIẾT

### PHASE 1: Backend - Tạo Student Module ⬜
> **Ưu tiên: CAO** - Phải có backend trước khi frontend hoạt động

- [ ] **1.1** Tạo student module structure
  - [ ] `backend/src/modules/student/student.routes.ts`
  - [ ] `backend/src/modules/student/student.controller.ts`
  - [ ] `backend/src/modules/student/student.service.ts`
  - [ ] `backend/src/modules/student/student.validate.ts`

- [ ] **1.2** Implement Dashboard Stats API
  - [ ] `GET /students/dashboard/stats` - Tổng hợp từ enrollments, progress, etc.
  
- [ ] **1.3** Implement Progress Stats API
  - [ ] `GET /students/dashboard/progress` - Lessons, Assignments, Quizzes completed

- [ ] **1.4** Implement Daily Goal API
  - [ ] `GET /students/dashboard/daily-goal` - Get current goal
  - [ ] `PUT /students/dashboard/daily-goal` - Update goal
  - [ ] Tạo bảng `student_daily_goals` nếu chưa có

- [ ] **1.5** Implement Course Recommendations API
  - [ ] `GET /courses/recommended` - Based on enrolled courses, interests

- [ ] **1.6** Implement Student Assignments API
  - [ ] `GET /students/assignments` - Tất cả bài tập từ các khóa học đã enroll
  - [ ] `GET /students/assignments/stats` - Stats nhanh

- [ ] **1.7** Implement Learning Activity API
  - [ ] `POST /students/activity/log` - Log activity
  - [ ] `GET /students/activity/history` - History
  - [ ] Tạo bảng `learning_activities` nếu chưa có

- [ ] **1.8** Implement Gamification API (nếu cần)
  - [ ] `GET /students/gamification` - Points, badges
  - [ ] `GET /students/leaderboard` - Leaderboard

- [ ] **1.9** Register routes trong app.ts

### PHASE 2: Frontend - Fix TypeScript Errors ⬜
> **Ưu tiên: CAO** - Phải pass type-check

- [ ] **2.1** Kiểm tra và fix TypeScript errors
  ```bash
  cd frontend && npm run type-check
  ```

- [ ] **2.2** Fix useEnrolledCourses hook
  - [ ] Verify response structure matches API
  - [ ] Update types nếu cần

- [ ] **2.3** Fix các hooks khác trong useStudentData.ts

### PHASE 3: Frontend - Verify API Integration ⬜

- [ ] **3.1** Test DashboardPage với real API
  - [ ] Stats hiển thị đúng
  - [ ] Progress hiển thị đúng
  - [ ] Courses hiển thị đúng
  - [ ] Loading states
  - [ ] Error states

- [ ] **3.2** Test MyCoursesPage với real API
  - [ ] List courses đúng
  - [ ] Filter hoạt động
  - [ ] Search hoạt động

- [ ] **3.3** Test StudentAssignmentsPage với real API
  - [ ] List assignments đúng
  - [ ] Stats đúng
  - [ ] Filter hoạt động

### PHASE 4: Frontend - Vietnamese Localization ⬜

- [ ] **4.1** Verify tất cả text là tiếng Việt
  - [ ] DashboardPage.tsx
  - [ ] MyCoursesPage.tsx
  - [ ] StudentAssignmentsPage.tsx
  - [ ] LearningPage.tsx

- [ ] **4.2** Update translations trong locales/vi.json

### PHASE 5: Testing & Verification ⬜

- [ ] **5.1** TypeScript check pass
  ```bash
  npm run type-check
  ```

- [ ] **5.2** ESLint check pass
  ```bash
  npm run lint
  ```

- [ ] **5.3** Manual testing
  - [ ] Student login
  - [ ] Dashboard load
  - [ ] My Courses load
  - [ ] Assignments load
  - [ ] Learning page works

---

## 🔧 IMPLEMENTATION DETAILS

### Backend: Student Module Structure

```
backend/src/modules/student/
├── student.routes.ts      # Route definitions
├── student.controller.ts  # Request handlers
├── student.service.ts     # Business logic
└── student.validate.ts    # Validation schemas
```

### Database Tables Needed (Check/Create)

1. **learning_activities** (nếu chưa có)
```sql
CREATE TABLE learning_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  lesson_id UUID REFERENCES lessons(id),
  activity_type VARCHAR(50), -- 'video', 'reading', 'quiz', 'assignment'
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **student_daily_goals** (nếu chưa có)
```sql
CREATE TABLE student_daily_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  target_minutes INTEGER DEFAULT 30,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Response Formats

#### GET /students/dashboard/stats
```json
{
  "success": true,
  "data": {
    "total_enrolled_courses": 5,
    "in_progress_courses": 3,
    "completed_courses": 2,
    "total_learning_time_minutes": 1200,
    "total_points": 500,
    "badges_count": 3,
    "certificates_count": 1,
    "current_streak_days": 5,
    "longest_streak_days": 15
  }
}
```

#### GET /students/dashboard/progress
```json
{
  "success": true,
  "data": {
    "lessons": { "completed": 25, "total": 50 },
    "assignments": { "completed": 8, "total": 10 },
    "quizzes": { "completed": 5, "total": 8 }
  }
}
```

---

## ✅ COMPLETION CRITERIA

- [ ] Tất cả API backend implemented và tested
- [ ] TypeScript type-check pass (0 errors)
- [ ] ESLint pass (0 errors, minimal warnings)
- [ ] UI 100% tiếng Việt
- [ ] Loading states hoạt động
- [ ] Error states hoạt động
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Manual testing pass

---

## 📌 NOTES

- Backend cần được implement TRƯỚC khi frontend có thể test với real data
- Nếu một số features chưa cần (gamification, leaderboard), có thể bỏ qua và return mock data từ backend
- Luôn chạy type-check sau mỗi thay đổi

---

*Last updated: 2024-12-03*
