# 📚 COURSE WORKFLOW - TỔNG QUAN TOÀN BỘ QUY TRÌNH

**Ngày tạo:** 01/12/2025  
**Mục đích:** Liệt kê đầy đủ các workflow liên quan đến Course trong hệ thống LMS

---

## 📋 MỤC LỤC

1. [Instructor Workflows](#1-instructor-workflows)
2. [Student Workflows](#2-student-workflows)
3. [Admin Workflows](#3-admin-workflows)
4. [Course Content Management](#4-course-content-management)
5. [Assessment & Grading](#5-assessment--grading)
6. [Analytics & Reporting](#6-analytics--reporting)

---

## 1. INSTRUCTOR WORKFLOWS

### 1.1. Course Creation Workflow

**Mục đích:** Instructor tạo khóa học mới

**Luồng xử lý:**
```
1. Instructor truy cập "My Courses" → Click "Create New Course"
2. Điền thông tin cơ bản:
   - Title (bắt buộc)
   - Description (bắt buộc)
   - Short Description (tùy chọn)
   - Category (dropdown)
   - Level: beginner/intermediate/advanced/expert
   - Language (mặc định: en)
   - Thumbnail (upload image)
   - Video Intro (URL hoặc upload)
3. Cài đặt giá:
   - Price (nếu không free)
   - Currency (USD, VND, ...)
   - Is Free (checkbox)
4. Cài đặt marketing:
   - Is Featured (checkbox)
   - Tags (array)
5. Cài đặt nội dung:
   - Prerequisites (array)
   - Learning Objectives (array)
6. Click "Save as Draft" hoặc "Publish"
```

**API Endpoints:**
- `POST /api/v1.3.0/courses` - Tạo course mới
- `PUT /api/v1.3.0/courses/:id` - Cập nhật course
- `GET /api/v1.3.0/courses/instructor/my-courses` - Lấy danh sách courses của instructor

**Status Flow:**
```
draft → published → archived
draft → suspended (bởi admin)
published → suspended (bởi admin)
```

**Frontend Pages:**
- `frontend/src/pages/instructor/CourseEditorPage.tsx` - Trang tạo/sửa course
- `frontend/src/pages/instructor/MyCoursesPage.tsx` - Danh sách courses của instructor

**Backend Files:**
- `backend/src/modules/course/course.controller.ts` - `createCourse()`
- `backend/src/modules/course/course.service.ts` - `createCourse()`
- `backend/src/models/course.model.ts` - Course model

---

### 1.2. Course Content Management Workflow

**Mục đích:** Instructor tạo và quản lý nội dung khóa học (Sections → Lessons → Materials)

**Luồng xử lý:**
```
1. Instructor mở course detail → Tab "Curriculum"
2. Tạo Section:
   - Click "Add Section"
   - Điền: Title, Description, Order
   - Save
3. Tạo Lesson trong Section:
   - Click "Add Lesson" trong section
   - Điền: Title, Description, Order, Duration
   - Upload Materials (files, videos, links)
   - Save
4. Sắp xếp lại:
   - Drag & drop sections
   - Drag & drop lessons trong section
5. Edit/Delete:
   - Click edit icon → Update
   - Click delete icon → Confirm → Delete
```

**API Endpoints:**
- `GET /api/v1.3.0/courses/:id/sections` - Lấy tất cả sections
- `POST /api/v1.3.0/courses/:id/sections` - Tạo section mới
- `PUT /api/v1.3.0/sections/:id` - Cập nhật section
- `DELETE /api/v1.3.0/sections/:id` - Xóa section
- `POST /api/v1.3.0/sections/:id/lessons` - Tạo lesson mới
- `PUT /api/v1.3.0/lessons/:id` - Cập nhật lesson
- `DELETE /api/v1.3.0/lessons/:id` - Xóa lesson
- `POST /api/v1.3.0/lessons/:id/materials` - Upload material
- `DELETE /api/v1.3.0/materials/:id` - Xóa material

**Frontend Pages:**
- `frontend/src/pages/instructor/CurriculumBuilderPage.tsx` - Trang quản lý curriculum
- `frontend/src/pages/instructor/InstructorCourseDetailPage.tsx` - Course detail với tabs

**Backend Files:**
- `backend/src/modules/course-content/course-content.controller.ts`
- `backend/src/modules/course-content/course-content.service.ts`
- `backend/src/models/section.model.ts`
- `backend/src/models/lesson.model.ts`
- `backend/src/models/lesson-material.model.ts`

---

### 1.3. Course Settings Management Workflow

**Mục đích:** Instructor cập nhật cài đặt khóa học

**Luồng xử lý:**
```
1. Instructor mở course detail → Tab "Settings"
2. Cập nhật thông tin:
   - Basic Info (title, description, thumbnail)
   - Pricing (price, currency, is_free)
   - Marketing (is_featured, tags)
   - Prerequisites & Learning Objectives
   - Status (draft/published/archived)
3. Click "Save Changes"
```

**API Endpoints:**
- `PUT /api/v1.3.0/courses/:id` - Cập nhật course settings

**Frontend Pages:**
- `frontend/src/pages/instructor/InstructorCourseDetailPage.tsx` - Tab "Settings"

---

### 1.4. Course Student Management Workflow

**Mục đích:** Instructor xem và quản lý học viên trong khóa học

**Luồng xử lý:**
```
1. Instructor mở course detail → Tab "Students"
2. Xem danh sách học viên:
   - Tên, Email, Avatar
   - Enrollment Date
   - Progress (%)
   - Status (active/completed/cancelled)
3. Filter/Search:
   - Search by name/email
   - Filter by status
   - Sort by enrollment date/progress
4. Actions:
   - View student profile
   - Send message (chat)
   - View progress details
   - Suspend enrollment (nếu cần)
```

**API Endpoints:**
- `GET /api/v1.3.0/courses/:id/students` - Lấy danh sách students
- `GET /api/v1.3.0/courses/:id/enrollments` - Lấy enrollments với filters
- `PUT /api/v1.3.0/enrollments/:id` - Update enrollment status

**Frontend Pages:**
- `frontend/src/pages/instructor/InstructorCourseDetailPage.tsx` - Tab "Students"
- `frontend/src/pages/instructor/StudentManagementPage.tsx` - Trang quản lý students

---

## 2. STUDENT WORKFLOWS

### 2.1. Course Discovery & Browsing Workflow

**Mục đích:** Student tìm kiếm và xem danh sách khóa học

**Luồng xử lý:**
```
1. Student truy cập "Course Catalog" hoặc "Homepage"
2. Xem danh sách courses:
   - Course Card hiển thị: Thumbnail, Title, Instructor, Rating, Price, Students count
3. Filter/Search:
   - Search by keyword
   - Filter by Category
   - Filter by Level (beginner/intermediate/advanced/expert)
   - Filter by Price (Free/Paid)
   - Filter by Rating
   - Sort by: Newest, Popular, Rating, Price
4. Pagination:
   - Load more hoặc page numbers
5. Click vào Course Card → Navigate to Course Detail
```

**API Endpoints:**
- `GET /api/v1.3.0/courses` - Lấy danh sách courses với filters
  - Query params: `page`, `limit`, `status`, `category`, `search`, `level`, `is_free`

**Frontend Pages:**
- `frontend/src/pages/CourseCatalogPage.tsx` - Trang catalog
- `frontend/src/pages/HomePage/index.tsx` - Homepage với featured courses
- `frontend/src/components/domain/course/CourseCard.tsx` - Component hiển thị course card

---

### 2.2. Course Detail & Enrollment Workflow

**Mục đích:** Student xem chi tiết khóa học và đăng ký

**Luồng xử lý:**
```
1. Student click vào Course Card → Navigate to Course Detail Page
2. Xem thông tin course:
   - Header: Thumbnail, Title, Instructor info, Rating
   - Tabs:
     * Overview: Description, Learning Objectives, Prerequisites, Stats
     * Curriculum: Sections → Lessons preview (locked nếu chưa enroll)
     * Reviews: Student reviews & ratings (nếu có)
     * Instructor: Instructor profile
3. Enrollment:
   - Nếu chưa enroll:
     * Click "Enroll Now" button
     * Nếu free → Enroll ngay
     * Nếu paid → Payment flow (chưa có)
   - Nếu đã enroll:
     * Hiển thị "Go to Course" button
     * Hiển thị progress bar
4. Actions:
   - Add to Wishlist (nếu có)
   - Share course
   - Report course (nếu có vấn đề)
```

**API Endpoints:**
- `GET /api/v1.3.0/courses/:id` - Lấy course detail
- `POST /api/v1.3.0/courses/:id/enroll` - Enroll vào course
- `DELETE /api/v1.3.0/courses/:id/unenroll` - Unenroll
- `GET /api/v1.3.0/courses/enrolled` - Lấy danh sách enrolled courses

**Frontend Pages:**
- `frontend/src/pages/CourseDetailPage.tsx` - Trang course detail
- `frontend/src/components/domain/course/EnrollButton.tsx` - Component enroll button

---

### 2.3. Course Learning Workflow

**Mục đích:** Student học nội dung khóa học

**Luồng xử lý:**
```
1. Student truy cập "My Courses" → Click vào course đã enroll
2. Navigate to Learning Page:
   - Left Sidebar: Curriculum tree (Sections → Lessons)
     * Hiển thị progress cho mỗi lesson (completed/not completed)
     * Lock icon cho lessons chưa unlock (nếu có prerequisites)
   - Main Content: Lesson content
     * Video Player (nếu có video)
     * Document Viewer (nếu có document)
     * Materials list (download links)
     * Lesson description
   - Right Sidebar (optional):
     * Notes
     * Bookmarks
     * Related resources
3. Lesson Navigation:
   - Previous/Next lesson buttons
   - Click vào lesson trong sidebar → Load lesson content
4. Progress Tracking:
   - Auto-mark lesson as completed khi:
     * Video watched > 80%
     * Hoặc student click "Mark as Complete"
   - Update progress bar
   - Update course completion percentage
5. Actions:
   - Take Notes
   - Bookmark lesson
   - Download materials
   - Ask question (chat với instructor)
```

**API Endpoints:**
- `GET /api/v1.3.0/courses/:id/sections` - Lấy curriculum với progress
- `GET /api/v1.3.0/lessons/:id` - Lấy lesson detail
- `POST /api/v1.3.0/lessons/:id/progress` - Update lesson progress
- `GET /api/v1.3.0/courses/:id/progress` - Lấy course progress

**Frontend Pages:**
- `frontend/src/pages/student/LearningPage.tsx` - Trang learning
- `frontend/src/pages/student/MyCoursesPage.tsx` - Danh sách enrolled courses
- `frontend/src/components/domain/lesson/CurriculumSidebar.tsx` - Sidebar curriculum
- `frontend/src/components/domain/lesson/LessonPlayer.tsx` - Lesson content player

---

### 2.4. Course Progress Tracking Workflow

**Mục đích:** Student theo dõi tiến độ học tập

**Luồng xử lý:**
```
1. Student xem progress trong:
   - My Courses page: Progress bar cho mỗi course
   - Learning Page: Progress bar ở header
   - Dashboard: Overall progress summary
2. Progress Calculation:
   - Lessons Completed / Total Lessons
   - Percentage displayed
   - Last Activity timestamp
3. Course Completion:
   - Khi 100% lessons completed:
     * Show completion badge
     * Option to get certificate (nếu có)
     * Mark enrollment status as "completed"
```

**API Endpoints:**
- `GET /api/v1.3.0/courses/:id/progress` - Lấy course progress
- `GET /api/v1.3.0/lessons/:id/progress` - Lấy lesson progress
- `POST /api/v1.3.0/courses/:id/complete` - Mark course as completed (nếu có)

**Frontend Pages:**
- `frontend/src/pages/student/DashboardPage.tsx` - Dashboard với progress
- `frontend/src/pages/student/MyCoursesPage.tsx` - My courses với progress

---

## 3. ADMIN WORKFLOWS

### 3.1. Course Management & Moderation Workflow

**Mục đích:** Admin quản lý và kiểm duyệt tất cả courses

**Luồng xử lý:**
```
1. Admin truy cập "Course Management"
2. Xem danh sách tất cả courses:
   - Table view với columns: Title, Instructor, Status, Students, Rating, Created Date
   - Filter by: Status, Category, Instructor
   - Search by keyword
3. Actions:
   - View course detail
   - Edit course (nếu cần)
   - Suspend course (nếu vi phạm)
   - Archive course
   - Delete course (soft delete)
   - Approve course (nếu có approval workflow)
4. Moderation:
   - Review course content
   - Check for violations
   - Send warning to instructor
   - Suspend/Unsuspend course
```

**API Endpoints:**
- `GET /api/v1.3.0/admin/courses` - Lấy tất cả courses (admin)
- `PUT /api/v1.3.0/admin/courses/:id` - Update course (admin)
- `PUT /api/v1.3.0/admin/courses/:id/suspend` - Suspend course
- `PUT /api/v1.3.0/admin/courses/:id/approve` - Approve course (nếu có)

**Frontend Pages:**
- `frontend/src/pages/admin/CourseManagementPage.tsx` - Trang quản lý courses
- `frontend/src/components/admin/CourseDetailModal.tsx` - Modal xem course detail

---

### 3.2. Course Analytics & Reporting Workflow

**Mục đích:** Admin xem thống kê và báo cáo về courses

**Luồng xử lý:**
```
1. Admin truy cập "Reports" → "Course Analytics"
2. Xem thống kê:
   - Total courses (by status)
   - Total enrollments
   - Popular courses (by enrollments)
   - Top instructors (by courses created)
   - Revenue (nếu có payment)
   - Completion rates
3. Filters:
   - Date range
   - Category
   - Instructor
4. Export:
   - Export to PDF
   - Export to Excel
```

**API Endpoints:**
- `GET /api/v1.3.0/admin/analytics/courses` - Course analytics
- `GET /api/v1.3.0/admin/reports/courses` - Course reports

**Frontend Pages:**
- `frontend/src/pages/admin/ReportsPage.tsx` - Trang reports
- `frontend/src/pages/admin/DashboardPage.tsx` - Dashboard với analytics

---

## 4. COURSE CONTENT MANAGEMENT

### 4.1. Section Management

**Workflow:**
```
1. Create Section:
   - Title, Description, Order
   - Auto-increment order nếu không specify
2. Update Section:
   - Edit title, description
   - Reorder (drag & drop)
3. Delete Section:
   - Check if has lessons
   - If yes → Warn và delete all lessons
   - If no → Delete directly
```

**Database:**
- `sections` table: `id`, `course_id`, `title`, `description`, `order`, `created_at`, `updated_at`

---

### 4.2. Lesson Management

**Workflow:**
```
1. Create Lesson:
   - Title, Description, Order
   - Duration (minutes)
   - Section ID
   - Lesson Type: video/document/quiz/assignment
2. Add Materials:
   - Upload file (PDF, DOC, PPT, ...)
   - Add video URL (YouTube, Vimeo, ...)
   - Add external link
   - Add text content
3. Update Lesson:
   - Edit content
   - Reorder
   - Update materials
4. Delete Lesson:
   - Delete lesson và all materials
   - Update course statistics (total_lessons)
```

**Database:**
- `lessons` table: `id`, `section_id`, `title`, `description`, `order`, `duration`, `lesson_type`, `created_at`, `updated_at`
- `lesson_materials` table: `id`, `lesson_id`, `material_type`, `file_url`, `title`, `order`, `created_at`

---

### 4.3. Material Management

**Workflow:**
```
1. Upload Material:
   - Select file
   - Upload to storage (S3/Cloudinary/GCS)
   - Save metadata to database
2. Material Types:
   - File (PDF, DOC, PPT, ZIP, ...)
   - Video (URL hoặc uploaded)
   - Link (external URL)
   - Text (rich text content)
3. Delete Material:
   - Delete from storage
   - Delete from database
```

**API Endpoints:**
- `POST /api/v1.3.0/lessons/:id/materials` - Upload material
- `DELETE /api/v1.3.0/materials/:id` - Delete material
- `GET /api/v1.3.0/lessons/:id/materials` - Get lesson materials

---

## 5. ASSESSMENT & GRADING

### 5.1. Quiz Management (Instructor)

**Workflow:**
```
1. Create Quiz:
   - Title, Description
   - Course ID (optional - có thể attach vào lesson)
   - Time limit (minutes)
   - Passing score (%)
   - Attempts allowed
2. Add Questions:
   - Question type: Multiple Choice, True/False, Short Answer
   - Question text
   - Options (nếu multiple choice)
   - Correct answer
   - Points
3. Attach to Lesson:
   - Link quiz to lesson
   - Student sẽ làm quiz sau khi học lesson
4. View Results:
   - See all attempts
   - View student answers
   - Auto-grade (nếu multiple choice/true-false)
```

**API Endpoints:**
- `POST /api/v1.3.0/quizzes` - Create quiz
- `PUT /api/v1.3.0/quizzes/:id` - Update quiz
- `POST /api/v1.3.0/quizzes/:id/questions` - Add question
- `GET /api/v1.3.0/quizzes/:id/attempts` - Get quiz attempts

**Frontend Pages:**
- `frontend/src/pages/instructor/QuizBuilderPage.tsx` - Trang tạo quiz

---

### 5.2. Quiz Taking (Student)

**Workflow:**
```
1. Student học lesson → Click "Take Quiz"
2. Start Quiz:
   - Show instructions
   - Start timer (nếu có)
   - Display questions one by one hoặc all at once
3. Answer Questions:
   - Select answer (multiple choice)
   - Type answer (short answer)
   - Can go back to previous questions
4. Submit Quiz:
   - Confirm submission
   - Auto-grade (nếu có)
   - Show results immediately hoặc after instructor review
5. View Results:
   - Score
   - Correct/Incorrect answers
   - Feedback (nếu có)
   - Option to retake (nếu attempts allowed)
```

**API Endpoints:**
- `POST /api/v1.3.0/quizzes/:id/attempts` - Start quiz attempt
- `PUT /api/v1.3.0/attempts/:id/submit` - Submit quiz
- `GET /api/v1.3.0/attempts/:id` - Get attempt results

**Frontend Pages:**
- `frontend/src/pages/student/QuizPage.tsx` - Trang làm quiz
- `frontend/src/pages/student/QuizResultsPage.tsx` - Trang xem kết quả

---

### 5.3. Assignment Management (Instructor)

**Workflow:**
```
1. Create Assignment:
   - Title, Description
   - Due Date
   - Max Score
   - Instructions
   - Attach files (nếu cần)
2. Attach to Course/Lesson:
   - Link assignment to course
   - Hoặc link to specific lesson
3. View Submissions:
   - See all submissions
   - Filter by status (submitted/graded)
   - Download submissions
4. Grade Assignment:
   - Open submission
   - Review student work
   - Add score
   - Add feedback/comments
   - Save grade
```

**API Endpoints:**
- `POST /api/v1.3.0/assignments` - Create assignment
- `GET /api/v1.3.0/courses/:id/assignments` - Get course assignments
- `GET /api/v1.3.0/assignments/:id/submissions` - Get submissions
- `PUT /api/v1.3.0/submissions/:id/grade` - Grade submission

**Frontend Pages:**
- `frontend/src/pages/instructor/AssignmentBuilderPage.tsx` - Trang tạo assignment
- `frontend/src/pages/instructor/GradingPage.tsx` - Trang chấm điểm

---

### 5.4. Assignment Submission (Student)

**Workflow:**
```
1. Student xem assignment trong course
2. Submit Assignment:
   - Read instructions
   - Upload files (nếu cần)
   - Type answer (nếu text-based)
   - Submit before due date
3. View Status:
   - Submitted (pending grading)
   - Graded (view score & feedback)
4. Resubmit (nếu allowed):
   - Edit submission
   - Resubmit
```

**API Endpoints:**
- `POST /api/v1.3.0/assignments/:id/submit` - Submit assignment
- `GET /api/v1.3.0/assignments/:id/my-submission` - Get my submission
- `PUT /api/v1.3.0/submissions/:id` - Update submission (resubmit)

**Frontend Pages:**
- `frontend/src/pages/student/AssignmentPage.tsx` - Trang làm assignment
- `frontend/src/pages/student/StudentAssignmentsPage.tsx` - Danh sách assignments

---

## 6. ANALYTICS & REPORTING

### 6.1. Instructor Analytics

**Metrics:**
- Total courses created
- Total students enrolled
- Course completion rates
- Average ratings
- Revenue (nếu có payment)
- Student engagement (time spent, lesson completion)

**API Endpoints:**
- `GET /api/v1.3.0/instructor/analytics` - Instructor analytics
- `GET /api/v1.3.0/courses/:id/analytics` - Course-specific analytics

**Frontend Pages:**
- `frontend/src/pages/instructor/DashboardPage.tsx` - Instructor dashboard
- `frontend/src/pages/instructor/InstructorCourseDetailPage.tsx` - Tab "Analytics"

---

### 6.2. Student Analytics

**Metrics:**
- Courses enrolled
- Courses completed
- Overall progress
- Time spent learning
- Quiz scores
- Assignment grades

**API Endpoints:**
- `GET /api/v1.3.0/students/analytics` - Student analytics
- `GET /api/v1.3.0/courses/:id/my-progress` - Course progress

**Frontend Pages:**
- `frontend/src/pages/student/DashboardPage.tsx` - Student dashboard

---

### 6.3. Admin Analytics

**Metrics:**
- Total courses (by status)
- Total enrollments
- Popular courses
- Top instructors
- Revenue (nếu có payment)
- Completion rates
- User engagement

**API Endpoints:**
- `GET /api/v1.3.0/admin/analytics/courses` - Course analytics
- `GET /api/v1.3.0/admin/analytics/overview` - Overall analytics

**Frontend Pages:**
- `frontend/src/pages/admin/DashboardPage.tsx` - Admin dashboard
- `frontend/src/pages/admin/ReportsPage.tsx` - Reports page

---

## 7. DATABASE SCHEMA

### 7.1. Core Tables

**courses:**
- `id` (UUID, PK)
- `instructor_id` (UUID, FK → users)
- `category_id` (UUID, FK → categories, nullable)
- `title`, `description`, `short_description`
- `level`, `language`
- `price`, `currency`, `is_free`
- `is_featured`, `thumbnail`, `video_intro`
- `total_students`, `total_lessons`, `duration_hours`
- `rating`, `total_ratings`
- `status` (draft/published/archived/suspended)
- `published_at`
- `prerequisites` (JSON), `learning_objectives` (JSON), `tags` (JSON)
- `metadata` (JSON)
- `created_at`, `updated_at`

**sections:**
- `id` (UUID, PK)
- `course_id` (UUID, FK → courses)
- `title`, `description`
- `order` (INTEGER)
- `created_at`, `updated_at`

**lessons:**
- `id` (UUID, PK)
- `section_id` (UUID, FK → sections)
- `title`, `description`
- `order` (INTEGER)
- `duration` (INTEGER, minutes)
- `lesson_type` (ENUM: video/document/quiz/assignment)
- `created_at`, `updated_at`

**lesson_materials:**
- `id` (UUID, PK)
- `lesson_id` (UUID, FK → lessons)
- `material_type` (ENUM: file/video/link/text)
- `file_url` (STRING)
- `title`, `description`
- `order` (INTEGER)
- `created_at`, `updated_at`

**enrollments:**
- `id` (UUID, PK)
- `course_id` (UUID, FK → courses)
- `user_id` (UUID, FK → users)
- `status` (ENUM: pending/active/completed/cancelled/suspended)
- `enrolled_at`, `completed_at`
- `created_at`, `updated_at`

**lesson_progress:**
- `id` (UUID, PK)
- `lesson_id` (UUID, FK → lessons)
- `user_id` (UUID, FK → users)
- `course_id` (UUID, FK → courses)
- `is_completed` (BOOLEAN)
- `progress_percentage` (INTEGER, 0-100)
- `time_spent` (INTEGER, seconds)
- `last_accessed_at`
- `completed_at`
- `created_at`, `updated_at`

---

## 8. API ENDPOINTS SUMMARY

### Public Endpoints
- `GET /api/v1.3.0/courses` - List courses (with filters)
- `GET /api/v1.3.0/courses/:id` - Get course detail

### Student Endpoints
- `GET /api/v1.3.0/courses/enrolled` - Get enrolled courses
- `POST /api/v1.3.0/courses/:id/enroll` - Enroll in course
- `DELETE /api/v1.3.0/courses/:id/unenroll` - Unenroll
- `GET /api/v1.3.0/courses/:id/sections` - Get curriculum
- `GET /api/v1.3.0/lessons/:id` - Get lesson detail
- `POST /api/v1.3.0/lessons/:id/progress` - Update progress
- `GET /api/v1.3.0/courses/:id/progress` - Get course progress

### Instructor Endpoints
- `POST /api/v1.3.0/courses` - Create course
- `PUT /api/v1.3.0/courses/:id` - Update course
- `DELETE /api/v1.3.0/courses/:id` - Delete course
- `GET /api/v1.3.0/courses/instructor/my-courses` - Get my courses
- `GET /api/v1.3.0/courses/:id/students` - Get course students
- `GET /api/v1.3.0/courses/:id/enrollments` - Get enrollments
- `POST /api/v1.3.0/courses/:id/sections` - Create section
- `PUT /api/v1.3.0/sections/:id` - Update section
- `DELETE /api/v1.3.0/sections/:id` - Delete section
- `POST /api/v1.3.0/sections/:id/lessons` - Create lesson
- `PUT /api/v1.3.0/lessons/:id` - Update lesson
- `DELETE /api/v1.3.0/lessons/:id` - Delete lesson
- `POST /api/v1.3.0/lessons/:id/materials` - Upload material
- `DELETE /api/v1.3.0/materials/:id` - Delete material

### Admin Endpoints
- `GET /api/v1.3.0/admin/courses` - Get all courses
- `PUT /api/v1.3.0/admin/courses/:id` - Update course (admin)
- `PUT /api/v1.3.0/admin/courses/:id/suspend` - Suspend course
- `GET /api/v1.3.0/admin/analytics/courses` - Course analytics

---

## 9. FRONTEND COMPONENTS STRUCTURE

```
frontend/src/
├── pages/
│   ├── CourseCatalogPage.tsx          # Course browsing
│   ├── CourseDetailPage.tsx           # Course detail & enrollment
│   ├── student/
│   │   ├── MyCoursesPage.tsx          # Enrolled courses
│   │   ├── LearningPage.tsx           # Learning interface
│   │   ├── QuizPage.tsx               # Take quiz
│   │   ├── AssignmentPage.tsx        # Submit assignment
│   │   └── DashboardPage.tsx          # Student dashboard
│   ├── instructor/
│   │   ├── CourseEditorPage.tsx       # Create/Edit course
│   │   ├── CurriculumBuilderPage.tsx  # Manage curriculum
│   │   ├── InstructorCourseDetailPage.tsx  # Course detail (instructor)
│   │   ├── MyCoursesPage.tsx          # My courses
│   │   ├── QuizBuilderPage.tsx       # Create quiz
│   │   ├── AssignmentBuilderPage.tsx # Create assignment
│   │   ├── GradingPage.tsx            # Grade assignments
│   │   └── DashboardPage.tsx          # Instructor dashboard
│   └── admin/
│       ├── CourseManagementPage.tsx   # Manage all courses
│       ├── DashboardPage.tsx          # Admin dashboard
│       └── ReportsPage.tsx             # Reports & analytics
├── components/
│   └── domain/
│       ├── course/
│       │   ├── CourseCard.tsx         # Course card component
│       │   ├── CourseFilters.tsx       # Filter component
│       │   ├── CourseHeader.tsx       # Course header
│       │   ├── CurriculumPreview.tsx  # Curriculum preview
│       │   └── EnrollButton.tsx       # Enroll button
│       └── lesson/
│           ├── CurriculumSidebar.tsx  # Curriculum sidebar
│           ├── LessonPlayer.tsx       # Lesson content player
│           ├── VideoPlayer.tsx        # Video player
│           └── DocumentViewer.tsx     # Document viewer
└── services/
    └── api/
        └── course.api.ts              # Course API service
```

---

## 10. TODO & PRIORITIES

### High Priority (P0)
- [ ] Tích hợp Course Catalog với API
- [ ] Tích hợp Course Detail & Enrollment
- [ ] Tích hợp Learning Page với progress tracking
- [ ] Tích hợp Curriculum Builder với API
- [ ] Tích hợp Quiz & Assignment với API

### Medium Priority (P1)
- [ ] Course Reviews & Ratings
- [ ] Course Certificates
- [ ] Course Prerequisites workflow
- [ ] Video Player integration
- [ ] File upload & download

### Low Priority (P2)
- [ ] Course Wishlist
- [ ] Course Recommendations (AI)
- [ ] Course Discussion Forums
- [ ] Course Notes & Bookmarks
- [ ] Course Sharing

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong workflow.**

