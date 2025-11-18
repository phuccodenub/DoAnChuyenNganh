# Kế hoạch Chi tiết Refactor Frontend LMS - Phần 1
## Phân tích Backend & Thiết kế Kiến trúc Frontend

---

## 📋 MỤC LỤC PHẦN 1

1. [Phân tích Backend API](#1-phân-tích-backend-api)
2. [Phân tích Frontend Hiện tại](#2-phân-tích-frontend-hiện-tại)
3. [Gap Analysis](#3-gap-analysis)
4. [Tech Stack & Architecture](#4-tech-stack--architecture)
5. [Folder Structure](#5-folder-structure)
6. [API Service Layer](#6-api-service-layer)

---

## 1. PHÂN TÍCH BACKEND API

### 1.1. Tổng quan Backend Modules

Backend LMS được tổ chức theo module pattern với 18 modules chính:

```
backend/src/modules/
├── analytics/          # Phân tích & thống kê
├── assignment/         # Bài tập
├── auth/              # Xác thực & phân quyền
├── category/          # Danh mục khóa học
├── chat/              # Chat realtime
├── course/            # Quản lý khóa học
├── course-content/    # Nội dung khóa học (sections, lessons)
├── enrollment/        # Ghi danh
├── files/             # Upload/Download files
├── grade/             # Chấm điểm
├── lesson/            # Bài giảng (legacy)
├── livestream/        # Live streaming
├── notifications/     # Thông báo
├── quiz/              # Bài kiểm tra
├── section/           # Phân đoạn khóa học (legacy)
├── system-settings/   # Cài đặt hệ thống
├── user/              # Quản lý người dùng
└── webrtc/            # WebRTC support
```

### 1.2. Danh sách API Endpoints Chi tiết

#### 🔐 **AUTH MODULE** (`/api/auth`)

**Public Routes:**
- [ ] `POST /register` - Đăng ký tài khoản mới
- [ ] `POST /login` - Đăng nhập
- [ ] `POST /login-2fa` - Đăng nhập với 2FA
- [ ] `POST /auth/refresh` - Làm mới token
- [ ] `GET /verify-email/:token` - Xác thực email

**Protected Routes:**
- [ ] `POST /logout` - Đăng xuất
- [ ] `GET /verify` - Kiểm tra token hợp lệ
- [ ] `POST /change-password` - Đổi mật khẩu
- [ ] `POST /2fa/enable` - Bật 2FA
- [ ] `POST /2fa/verify-setup` - Xác thực cài đặt 2FA
- [ ] `POST /2fa/disable` - Tắt 2FA

---

#### 👤 **USER MODULE** 

**Self-Service Routes** (`/api/users` - Authenticated users):
- [ ] `GET /profile` - Lấy thông tin profile
- [ ] `PUT /profile` - Cập nhật profile
- [ ] `POST /avatar` - Upload avatar
- [ ] `PATCH /preferences` - Cập nhật preferences
- [ ] `GET /sessions` - Lấy danh sách sessions đang hoạt động
- [ ] `POST /logout-all` - Đăng xuất tất cả thiết bị
- [ ] `PUT /change-password` - Đổi mật khẩu (alias)
- [ ] `POST /2fa/enable` - Bật 2FA
- [ ] `POST /2fa/disable` - Tắt 2FA
- [ ] `POST /social/link` - Liên kết tài khoản social
- [ ] `GET /analytics` - Thống kê cá nhân
- [ ] `PATCH /notifications` - Cài đặt thông báo
- [ ] `PATCH /privacy` - Cài đặt quyền riêng tư

**Admin Routes** (`/api/admin/users` - Admin/Super Admin):
- [ ] `GET /` - Lấy danh sách users (pagination, filter)
- [ ] `GET /stats` - Thống kê users
- [ ] `GET /email/search` - Tìm user theo email
- [ ] `GET /role/:role` - Lấy users theo role
- [ ] `GET /:id` - Lấy thông tin user theo ID
- [ ] `POST /` - Tạo user mới
- [ ] `PATCH /:id` - Cập nhật user
- [ ] `DELETE /:id` - Xóa user
- [ ] `PATCH /:id/status` - Đổi trạng thái user (alias: `PUT`)
- [ ] `PUT /:id/role` - Đổi role của user

---

#### 📚 **COURSE MODULE** (`/api/courses`)

**Public Routes:**
- [ ] `GET /` - Lấy tất cả khóa học (pagination, filters)

**Student Routes (Authenticated):**
- [ ] `GET /enrolled` - Khóa học đã đăng ký
- [ ] `POST /:courseId/enroll` - Đăng ký khóa học
- [ ] `DELETE /:courseId/unenroll` - Hủy đăng ký

**Instructor Routes:**
- [ ] `GET /instructor/:instructorId` - Khóa học của instructor
- [ ] `GET /instructor/my-courses` - Khóa học của tôi
- [ ] `GET /:courseId/students` - Danh sách học viên

**Instructor/Admin Routes:**
- [ ] `GET /:id` - Chi tiết khóa học
- [ ] `POST /` - Tạo khóa học mới
- [ ] `PUT /:id` - Cập nhật khóa học
- [ ] `DELETE /:id` - Xóa khóa học

---

#### 📖 **COURSE CONTENT MODULE** (`/api/course-content`)

**Section Management (Instructor/Admin):**
- [ ] `POST /courses/:courseId/sections` - Tạo section
- [ ] `GET /courses/:courseId/sections` - Lấy sections của khóa học
- [ ] `GET /sections/:sectionId` - Chi tiết section
- [ ] `PUT /sections/:sectionId` - Cập nhật section
- [ ] `DELETE /sections/:sectionId` - Xóa section
- [ ] `POST /courses/:courseId/sections/reorder` - Sắp xếp lại sections

**Lesson Management (Instructor/Admin):**
- [ ] `POST /sections/:sectionId/lessons` - Tạo lesson
- [ ] `GET /lessons/:lessonId` - Chi tiết lesson
- [ ] `PUT /lessons/:lessonId` - Cập nhật lesson
- [ ] `DELETE /lessons/:lessonId` - Xóa lesson
- [ ] `POST /sections/:sectionId/lessons/reorder` - Sắp xếp lại lessons

**Material Management (Instructor/Admin):**
- [ ] `POST /lessons/:lessonId/materials` - Thêm tài liệu
- [ ] `DELETE /materials/:materialId` - Xóa tài liệu
- [ ] `POST /materials/:materialId/download` - Track download

**Progress Tracking (Student):**
- [ ] `PUT /lessons/:lessonId/progress` - Cập nhật tiến độ
- [ ] `POST /lessons/:lessonId/complete` - Đánh dấu hoàn thành
- [ ] `GET /lessons/:lessonId/progress` - Tiến độ của lesson
- [ ] `GET /courses/:courseId/progress` - Tiến độ khóa học
- [ ] `GET /users/me/recent-activity` - Hoạt động gần đây

**Content Overview:**
- [ ] `GET /courses/:courseId/content` - Nội dung đầy đủ khóa học

---

#### 📝 **ENROLLMENT MODULE** (`/api/enrollments`)

**Management (Admin/Instructor):**
- [ ] `GET /` - Danh sách enrollments
- [ ] `GET /:id` - Chi tiết enrollment
- [ ] `POST /` - Tạo enrollment
- [ ] `PUT /:id` - Cập nhật enrollment
- [ ] `DELETE /:id` - Xóa enrollment
- [ ] `PATCH /:id/complete` - Đánh dấu hoàn thành (alias: `PUT`)
- [ ] `PUT /:id/progress` - Cập nhật tiến độ

**Query Routes:**
- [ ] `GET /user/:userId` - Enrollments của user
- [ ] `GET /course/:courseId` - Enrollments của course
- [ ] `GET /user/:userId/course/:courseId` - Kiểm tra enrollment
- [ ] `GET /user/:userId/course/:courseId/enrollment` - Lấy enrollment cụ thể

**Statistics (Admin/Instructor):**
- [ ] `GET /stats/overview` - Tổng quan thống kê
- [ ] `GET /stats/course/:courseId` - Thống kê theo course
- [ ] `GET /stats/user/:userId` - Thống kê theo user

---

#### ❓ **QUIZ MODULE** (`/api/quizzes`)

**Quiz Management:**
- [ ] `GET /` - Danh sách quizzes
- [ ] `GET /:id` - Chi tiết quiz
- [ ] `POST /` - Tạo quiz (Instructor/Admin)
- [ ] `PUT /:id` - Cập nhật quiz (Instructor/Admin)
- [ ] `DELETE /:id` - Xóa quiz (Instructor/Admin)

**Question Management (Instructor/Admin):**
- [ ] `GET /:id/questions` - Danh sách câu hỏi
- [ ] `GET /:quizId/questions/:questionId` - Chi tiết câu hỏi
- [ ] `POST /:id/questions` - Tạo câu hỏi
- [ ] `PUT /:quizId/questions/:questionId` - Cập nhật câu hỏi
- [ ] `DELETE /:quizId/questions/:questionId` - Xóa câu hỏi

**Attempt Management (Student):**
- [ ] `POST /:id/start` - Bắt đầu làm bài
- [ ] `POST /attempts/:attemptId/submit` - Nộp bài
- [ ] `GET /attempts/:attemptId` - Chi tiết attempt
- [ ] `GET /:id/attempts` - Danh sách attempts của user

---

#### 📄 **ASSIGNMENT MODULE** (`/api/assignments`)

- [ ] `POST /` - Tạo assignment (Instructor/Admin)
- [ ] `GET /:id` - Chi tiết assignment
- [ ] `POST /:assignmentId/submissions` - Nộp bài (Student)
- [ ] `POST /submissions/:submissionId/grade` - Chấm điểm (Instructor/Admin)

---

#### 🎯 **GRADE MODULE** (`/api/grades`)

- [ ] `POST /` - Upsert grade (Instructor/Admin)
- [ ] `POST /final` - Upsert final grade (Instructor/Admin)
- [ ] `GET /users/:userId/courses/:courseId` - Điểm của user trong course

---

#### 🔔 **NOTIFICATIONS MODULE** (`/api/notifications`)

- [ ] `POST /` - Tạo thông báo (Instructor/Admin)
- [ ] `GET /me` - Thông báo của tôi
- [ ] `GET /me/unread-count` - Số thông báo chưa đọc
- [ ] `POST /me/mark-all-read` - Đánh dấu tất cả đã đọc
- [ ] `POST /me/archive-old` - Lưu trữ thông báo cũ

---

#### 📺 **LIVESTREAM MODULE** (`/api/livestream`)

- [ ] `POST /` - Tạo session (Instructor/Admin)
- [ ] `GET /:sessionId` - Chi tiết session
- [ ] `PUT /:sessionId/status` - Cập nhật trạng thái (Instructor/Admin)
- [ ] `POST /:sessionId/join` - Tham gia session (Student)

---

#### 💬 **CHAT MODULE** (`/api/chat`)

- [ ] `GET /courses/:courseId/messages` - Lấy messages (pagination)
- [ ] `POST /courses/:courseId/messages` - Gửi message (REST fallback)
- [ ] `GET /courses/:courseId/messages/search` - Tìm kiếm messages
- [ ] `GET /courses/:courseId/statistics` - Thống kê chat
- [ ] `GET /courses/:courseId/messages/type/:messageType` - Messages theo type
- [ ] `PUT /messages/:messageId` - Sửa message
- [ ] `DELETE /messages/:messageId` - Xóa message

**Note:** Chat chủ yếu sử dụng Socket.IO, REST API là fallback

---

#### 📁 **FILES MODULE** (`/api/files`)

- [ ] `POST /upload` - Upload file đơn
- [ ] `POST /upload/multiple` - Upload nhiều files
- [ ] `GET /download/:folder/:filename` - Download file
- [ ] `GET /view/:folder/:filename` - Xem file inline
- [ ] `GET /info/:folder/:filename` - Thông tin file
- [ ] `DELETE /:folder/:filename` - Xóa file
- [ ] `GET /list/:folder` - Danh sách files trong folder
- [ ] `GET /folder-size/:folder` - Kích thước folder
- [ ] `POST /signed-url` - Tạo signed URL

---

#### 📊 **ANALYTICS MODULE** (`/api/analytics`)

- [ ] `GET /courses/:courseId/stats` - Thống kê khóa học
- [ ] `GET /users/:userId/activities` - Hoạt động của user

---

#### 📑 **CATEGORY MODULE** (`/api/categories`)

**Public:**
- [ ] `GET /` - Danh sách categories
- [ ] `GET /:id` - Chi tiết category

**Admin:**
- [ ] `POST /` - Tạo category
- [ ] `PUT /:id` - Cập nhật category
- [ ] `DELETE /:id` - Xóa category

---

#### ⚙️ **SYSTEM SETTINGS MODULE** (`/api/system-settings`)

- [ ] `GET /` - Lấy settings
- [ ] `PUT /` - Cập nhật settings (Admin)

---

### 1.3. Data Models & Relationships

#### Core Models:

```typescript
// User Model
User {
  id: number
  email: string
  password_hash: string
  full_name: string
  role: 'student' | 'instructor' | 'admin' | 'super_admin'
  avatar_url?: string
  bio?: string
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
  preferences?: JSON
  created_at: timestamp
  updated_at: timestamp
}

// Course Model
Course {
  id: number
  instructor_id: number (FK -> User)
  category_id?: number (FK -> Category)
  title: string
  description: string
  thumbnail_url?: string
  status: 'draft' | 'published' | 'archived'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_hours?: number
  price?: number
  is_free: boolean
  created_at: timestamp
  updated_at: timestamp
}

// Section Model
Section {
  id: number
  course_id: number (FK -> Course)
  title: string
  description?: string
  order_index: number
  is_published: boolean
  created_at: timestamp
  updated_at: timestamp
}

// Lesson Model
Lesson {
  id: number
  section_id: number (FK -> Section)
  title: string
  content?: text
  content_type: 'video' | 'text' | 'document' | 'interactive'
  video_url?: string
  duration_minutes?: number
  order_index: number
  is_free_preview: boolean
  is_published: boolean
  created_at: timestamp
  updated_at: timestamp
}

// Enrollment Model
Enrollment {
  id: number
  user_id: number (FK -> User)
  course_id: number (FK -> Course)
  status: 'enrolled' | 'completed' | 'dropped'
  progress_percentage: number
  enrolled_at: timestamp
  completed_at?: timestamp
  updated_at: timestamp
}

// Quiz Model
Quiz {
  id: number
  lesson_id?: number (FK -> Lesson)
  course_id?: number (FK -> Course)
  title: string
  description?: string
  time_limit_minutes?: number
  passing_score: number
  max_attempts?: number
  is_published: boolean
  created_at: timestamp
  updated_at: timestamp
}

// Assignment Model
Assignment {
  id: number
  lesson_id?: number (FK -> Lesson)
  course_id?: number (FK -> Course)
  title: string
  description: text
  due_date?: timestamp
  max_score: number
  created_at: timestamp
  updated_at: timestamp
}

// Notification Model
Notification {
  id: number
  sender_id?: number (FK -> User)
  title: string
  message: text
  type: 'email' | 'push' | 'in_app'
  created_at: timestamp
}
```

#### Key Relationships:

```
User 1 ---< Course (instructor_id)
User >---< Course (through Enrollment)
Course 1 ---< Section
Section 1 ---< Lesson
Lesson 1 ---< LessonMaterial
Lesson 1 ---< Quiz
Lesson 1 ---< Assignment
User >---< Lesson (through LessonProgress)
Category 1 ---< Course
Course 1 ---< ChatMessage
User 1 ---< ChatMessage (sender)
User >---< Notification (through NotificationRecipient)
```

---

## 2. PHÂN TÍCH FRONTEND HIỆN TẠI

### 2.1. Cấu trúc Hiện tại

```
frontend/src/
├── components/
│   ├── Chat/              # Chat components (4 files)
│   ├── demo/              # Demo components
│   ├── Files/             # File manager (1 file)
│   ├── Layout/            # Main layout (1 file)
│   ├── LiveStream/        # LiveStream interface (1 file)
│   ├── Quiz/              # Quiz interface (1 file)
│   └── ui/                # UI components (13 files)
├── contexts/
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # (Empty - cần xây dựng)
├── lib/
│   └── utils.ts           # Utility functions
├── locales/
│   ├── en.json            # English translations
│   └── vi.json            # Vietnamese translations
├── pages/                 # 9 pages
│   ├── CourseDetail.tsx
│   ├── CoursePage.tsx
│   ├── DashboardPage.tsx
│   ├── HomePage.tsx
│   ├── LiveStreamPage.tsx
│   ├── LoginPage.tsx
│   ├── MyCourses.tsx
│   ├── NotFoundPage.tsx
│   └── RegisterPage.tsx
├── services/              # 10 service files
│   ├── apiClient.ts       # Axios setup
│   ├── authService.ts     # Auth API (real)
│   ├── mockAuthService.ts # Mock auth (demo)
│   ├── chatbotService.ts
│   ├── fileService.ts
│   ├── mockData.ts
│   ├── notificationService.ts
│   ├── quizService.ts
│   ├── recommendationService.ts
│   ├── socketService.ts
│   └── webRTCService.ts
├── stores/                # Zustand stores (2 files)
│   ├── authStore.ts       # Auth state
│   └── chatStore.ts       # Chat state
├── utils/                 # (Empty - cần xây dựng)
├── App.tsx
├── i18n.ts
├── index.css
└── main.tsx
```

### 2.2. Đánh giá Frontend Hiện tại

#### ✅ **Ưu điểm:**
1. **Tech stack hiện đại:** React 18, TypeScript, Vite
2. **State management:** Zustand đã được setup
3. **Internationalization:** i18next đã được cấu hình (vi/en)
4. **Real-time:** Socket.IO client đã sẵn sàng
5. **UI styling:** TailwindCSS, có một số UI components cơ bản
6. **Form validation:** React Hook Form + Zod
7. **API client:** Axios với interceptors cơ bản

#### ❌ **Hạn chế nghiêm trọng:**

1. **Mock Data Everywhere:**
   - `mockAuthService.ts` đang được sử dụng thay vì `authService.ts`
   - Không có integration thực sự với backend API
   - Dữ liệu giả mạo trong `mockData.ts`

2. **Thiếu React Query:**
   - Package đã install nhưng chưa sử dụng
   - Không có data fetching/caching strategy
   - Không có mutation handling

3. **Thiếu API Services hoàn chỉnh:**
   - Chỉ có `authService.ts`
   - Không có services cho: courses, enrollments, quiz, assignments, grades, etc.

4. **Thiếu Components quan trọng:**
   - Không có CourseCard, CourseList, CourseFilters
   - Không có CurriculumBuilder, LessonPlayer
   - Không có DataTable, Pagination
   - Không có Form components tái sử dụng
   - Không có Modal, Drawer, Dialog components

5. **Thiếu Pages quan trọng:**
   - Không có Instructor Dashboard
   - Không có Admin Dashboard
   - Không có Course Management pages
   - Không có User Management (Admin)
   - Không có Settings pages
   - Không có Profile pages

6. **Thiếu Routing đầy đủ:**
   - Không có role-based routing
   - Không có protected routes đầy đủ
   - Không có route guards

7. **Thiếu Hooks tùy chỉnh:**
   - Folder hooks trống rỗng
   - Cần: useAuth, useRole, usePagination, useDebounce, etc.

8. **Thiếu Layouts:**
   - Chỉ có 1 Layout component
   - Cần: DashboardLayout (Student/Instructor/Admin), AuthLayout

9. **Không có Error Handling:**
   - Không có error boundaries
   - Không có global error handling

10. **Không có Loading States:**
    - Chỉ có LoadingSkeleton component
    - Thiếu loading strategies cho các scenarios khác nhau

---

## 3. GAP ANALYSIS

### 3.1. Tính năng còn thiếu theo Role

#### 👨‍🎓 **STUDENT Features (Missing):**

**Dashboard:**
- [ ] Overview của khóa học đã đăng ký
- [ ] Tiến độ học tập tổng quan
- [ ] Hoạt động gần đây
- [ ] Thông báo mới
- [ ] Recommended courses

**Course Catalog:**
- [ ] Browse all courses với filters
- [ ] Search courses
- [ ] Category filtering
- [ ] Difficulty/Price filtering
- [ ] Course preview/detail modal
- [ ] Enroll/Unenroll functionality

**Learning Interface:**
- [ ] Video player với progress tracking
- [ ] Document viewer
- [ ] Navigation giữa lessons
- [ ] Section/Lesson sidebar
- [ ] Progress indicator
- [ ] Note-taking feature
- [ ] Bookmark lessons

**Quiz/Assessment:**
- [ ] Quiz interface với timer
- [ ] Question navigation
- [ ] Submit và xem kết quả
- [ ] Review answers
- [ ] Attempt history

**Assignments:**
- [ ] Assignment list
- [ ] Submit assignment
- [ ] View grades và feedback

**Profile:**
- [ ] View/Edit profile
- [ ] Change password
- [ ] Upload avatar
- [ ] Preferences/Settings
- [ ] View certificates

**Progress Tracking:**
- [ ] Course progress dashboard
- [ ] Completion certificates
- [ ] Learning statistics

---

#### 👨‍🏫 **INSTRUCTOR Features (Missing):**

**Dashboard:**
- [ ] Overview của courses đã tạo
- [ ] Student enrollments statistics
- [ ] Revenue tracking (if applicable)
- [ ] Recent activities

**Course Management:**
- [ ] Create/Edit/Delete courses
- [ ] Course status management (draft/published)
- [ ] Course settings (price, difficulty, category)
- [ ] Thumbnail upload

**Curriculum Builder:**
- [ ] Create/Edit/Delete Sections
- [ ] Create/Edit/Delete Lessons
- [ ] Reorder Sections/Lessons (drag-drop)
- [ ] Upload video/documents
- [ ] Add materials
- [ ] Set lesson settings (free preview, published)

**Quiz Management:**
- [ ] Create/Edit quizzes
- [ ] Add/Edit/Delete questions
- [ ] Multiple choice, true/false, essay questions
- [ ] Set quiz settings (time limit, passing score)
- [ ] View student attempts

**Assignment Management:**
- [ ] Create/Edit assignments
- [ ] View submissions
- [ ] Grade submissions
- [ ] Provide feedback

**Student Management:**
- [ ] View enrolled students
- [ ] Track student progress
- [ ] View student grades
- [ ] Communicate with students

**Analytics:**
- [ ] Course performance metrics
- [ ] Student engagement analytics
- [ ] Completion rates

**Live Stream:**
- [ ] Create live sessions
- [ ] Manage session status
- [ ] Join as host
- [ ] Interactive features

---

#### 👨‍💼 **ADMIN Features (Missing):**

**Dashboard:**
- [ ] System overview (users, courses, enrollments)
- [ ] Platform statistics
- [ ] Recent activities
- [ ] System health monitoring

**User Management:**
- [ ] List all users (pagination, filters)
- [ ] Search users by email/role
- [ ] Create/Edit/Delete users
- [ ] Change user roles
- [ ] Change user status (active/suspended)
- [ ] View user details
- [ ] User statistics

**Course Management:**
- [ ] View all courses
- [ ] Approve/Reject courses (if moderation needed)
- [ ] Monitor course quality
- [ ] Course statistics

**Category Management:**
- [ ] Create/Edit/Delete categories
- [ ] Category hierarchy management

**System Settings:**
- [ ] General settings
- [ ] Email settings
- [ ] Payment settings (if applicable)
- [ ] Feature flags

**Reports & Analytics:**
- [ ] Platform-wide analytics
- [ ] Revenue reports
- [ ] User growth analytics
- [ ] Course performance reports

---

### 3.2. Technical Gaps

#### Missing Infrastructure:
- [ ] React Query setup với QueryClient
- [ ] API service layer hoàn chỉnh
- [ ] Error handling strategy
- [ ] Loading state management
- [ ] Toast notification system (có react-hot-toast nhưng chưa integrate đầy đủ)
- [ ] Form validation với Zod schemas
- [ ] Route configuration với role guards
- [ ] Socket.IO event handlers đầy đủ
- [ ] WebRTC integration cho live stream

#### Missing Utilities:
- [ ] Date formatting utilities
- [ ] Number formatting utilities
- [ ] String utilities
- [ ] Validation helpers
- [ ] Local storage helpers
- [ ] Session management utilities

---

## 4. TECH STACK & ARCHITECTURE

### 4.1. Frontend Tech Stack (Confirmed)

```json
{
  "core": {
    "framework": "React 18.2",
    "language": "TypeScript 5.3",
    "buildTool": "Vite 5.0"
  },
  "stateManagement": {
    "appState": "Zustand 4.4 (with persist middleware)",
    "serverState": "React Query 5.17 (@tanstack/react-query)"
  },
  "styling": {
    "utility": "TailwindCSS 3.4",
    "icons": "Lucide React 0.303",
    "classnames": "clsx + tailwind-merge"
  },
  "routing": {
    "library": "React Router DOM 6.8"
  },
  "forms": {
    "library": "React Hook Form 7.48",
    "validation": "Zod 3.22",
    "resolver": "@hookform/resolvers 3.3"
  },
  "dataFetching": {
    "http": "Axios 1.6",
    "query": "@tanstack/react-query 5.17"
  },
  "realtime": {
    "socket": "Socket.IO Client 4.8"
  },
  "i18n": {
    "library": "i18next 25.5 + react-i18next 16.0"
  },
  "notifications": {
    "toast": "React Hot Toast 2.4"
  },
  "utilities": {
    "dateFns": "date-fns 3.0"
  }
}
```

### 4.2. Kiến trúc Ứng dụng

#### Architecture Principles:
1. **Feature-based folder structure**
2. **Separation of concerns** (UI, Business Logic, Data)
3. **Reusable components**
4. **Type-safe API calls**
5. **Optimistic updates** với React Query
6. **Real-time updates** với Socket.IO
7. **Role-based access control**

#### Key Architectural Decisions:

**State Management Strategy:**
```
┌─────────────────────────────────────┐
│         APPLICATION STATE           │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐│
│  │   ZUSTAND    │  │REACT QUERY  ││
│  │              │  │             ││
│  │ - Auth State │  │ - Courses   ││
│  │ - UI State   │  │ - Users     ││
│  │ - Theme      │  │ - Enrolls   ││
│  │ - Preferences│  │ - Quizzes   ││
│  │              │  │ - Grades    ││
│  │ (Client-side)│  │ (Server)    ││
│  └──────────────┘  └─────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Zustand for:**
- Authentication state (user, token, isAuthenticated)
- UI state (sidebar open/closed, theme, language)
- Preferences (user settings)

**React Query for:**
- All server data (courses, users, enrollments, etc.)
- Caching strategy
- Background refetching
- Optimistic updates
- Infinite scrolling

---

## 5. FOLDER STRUCTURE

### 5.1. Proposed Folder Structure

```
frontend/src/
├── app/                           # App initialization & providers
│   ├── providers/
│   │   ├── AppProviders.tsx      # Tổng hợp providers
│   │   ├── QueryProvider.tsx     # React Query setup
│   │   ├── ThemeProvider.tsx     # Theme context
│   │   └── I18nProvider.tsx      # i18n setup
│   └── config/
│       ├── queryClient.ts         # Query client config
│       └── constants.ts           # App-wide constants
│
├── pages/                         # Route-level pages
│   ├── public/                    # Public pages
│   │   ├── HomePage.tsx
│   │   ├── CourseCatalogPage.tsx
│   │   ├── CourseDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── auth/                      # Authentication pages
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── VerifyEmailPage.tsx
│   ├── student/                   # Student pages
│   │   ├── DashboardPage.tsx
│   │   ├── MyCoursesPage.tsx
│   │   ├── LearningPage.tsx
│   │   └── ProfilePage.tsx
│   ├── instructor/                # Instructor pages
│   │   ├── DashboardPage.tsx
│   │   ├── MyCoursesPage.tsx
│   │   ├── CourseEditorPage.tsx
│   │   ├── StudentManagementPage.tsx
│   │   └── AnalyticsPage.tsx
│   └── admin/                     # Admin pages
│       ├── DashboardPage.tsx
│       ├── UserManagementPage.tsx
│       ├── CourseManagementPage.tsx
│       ├── CategoryManagementPage.tsx
│       └── SystemSettingsPage.tsx
│
├── layouts/                       # Layout components
│   ├── AuthLayout.tsx            # Centered layout for auth pages
│   ├── MainLayout.tsx            # Public layout (navbar + footer)
│   ├── StudentDashboardLayout.tsx # Student layout
│   ├── InstructorDashboardLayout.tsx # Instructor layout
│   └── AdminDashboardLayout.tsx  # Admin layout
│
├── components/
│   ├── ui/                        # Base UI components (design system)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Switch.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Dialog.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── Progress.tsx
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   └── DataTable.tsx
│   │
│   ├── common/                    # Shared domain-agnostic components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── PageHeader.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── LanguageSwitcher.tsx
│   │
│   ├── forms/                     # Form components
│   │   ├── FormField.tsx
│   │   ├── FormLabel.tsx
│   │   ├── FormError.tsx
│   │   ├── FormGroup.tsx
│   │   └── FileUpload.tsx
│   │
│   └── domain/                    # Domain-specific components
│       ├── course/
│       │   ├── CourseCard.tsx
│       │   ├── CourseList.tsx
│       │   ├── CourseGrid.tsx
│       │   ├── CourseFilters.tsx
│       │   └── CourseStats.tsx
│       ├── user/
│       │   ├── UserAvatar.tsx
│       │   ├── UserCard.tsx
│       │   ├── UserRoleBadge.tsx
│       │   └── UserMenu.tsx
│       ├── lesson/
│       │   ├── LessonPlayer.tsx
│       │   ├── VideoPlayer.tsx
│       │   ├── DocumentViewer.tsx
│       │   └── LessonNavigation.tsx
│       ├── quiz/
│       │   ├── QuizInterface.tsx
│       │   ├── QuestionCard.tsx
│       │   ├── AnswerOptions.tsx
│       │   ├── QuizTimer.tsx
│       │   └── QuizResults.tsx
│       ├── assignment/
│       │   ├── AssignmentCard.tsx
│       │   ├── SubmissionForm.tsx
│       │   └── GradingPanel.tsx
│       ├── notification/
│       │   ├── NotificationBell.tsx
│       │   ├── NotificationList.tsx
│       │   └── NotificationItem.tsx
│       ├── chat/
│       │   ├── ChatWindow.tsx
│       │   ├── MessageList.tsx
│       │   ├── MessageItem.tsx
│       │   ├── MessageInput.tsx
│       │   └── OnlineUsers.tsx
│       ├── livestream/
│       │   ├── LiveStreamPlayer.tsx
│       │   ├── LiveStreamControls.tsx
│       │   └── LiveStreamChat.tsx
│       └── analytics/
│           ├── StatsCard.tsx
│           ├── LineChart.tsx
│           ├── BarChart.tsx
│           └── DonutChart.tsx
│
├── features/                      # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── schemas/
│   ├── courses/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── schemas/
│   ├── enrollment/
│   ├── quiz/
│   ├── assignment/
│   ├── grades/
│   ├── notifications/
│   ├── chat/
│   ├── livestream/
│   └── analytics/
│
├── services/                      # API service layer
│   ├── api/                       # Domain-specific API services
│   │   ├── auth.api.ts
│   │   ├── user.api.ts
│   │   ├── course.api.ts
│   │   ├── enrollment.api.ts
│   │   ├── course-content.api.ts
│   │   ├── quiz.api.ts
│   │   ├── assignment.api.ts
│   │   ├── grade.api.ts
│   │   ├── notification.api.ts
│   │   ├── livestream.api.ts
│   │   ├── chat.api.ts
│   │   ├── files.api.ts
│   │   ├── analytics.api.ts
│   │   ├── category.api.ts
│   │   └── system-settings.api.ts
│   ├── http/
│   │   ├── client.ts              # Axios instance
│   │   ├── interceptors.ts        # Request/Response interceptors
│   │   └── errorHandler.ts        # Error normalization
│   └── socket/
│       ├── socketClient.ts        # Socket.IO client
│       └── eventHandlers.ts       # Socket event handlers
│
├── hooks/                         # Custom hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useRole.ts
│   ├── usePagination.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   ├── useLocalStorage.ts
│   ├── useDisclosure.ts
│   └── useInfiniteScroll.ts
│
├── store/                         # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── preferenceStore.ts
│
├── routes/                        # Route configuration
│   ├── index.tsx                  # Main router
│   ├── publicRoutes.tsx
│   ├── authRoutes.tsx
│   ├── studentRoutes.tsx
│   ├── instructorRoutes.tsx
│   ├── adminRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── RoleGuard.tsx
│
├── constants/                     # Constants
│   ├── routes.ts                  # Route paths
│   ├── roles.ts                   # User roles
│   ├── queryKeys.ts               # React Query keys
│   ├── apiEndpoints.ts            # API endpoints
│   └── config.ts                  # Config constants
│
├── utils/                         # Utility functions
│   ├── format/
│   │   ├── date.ts
│   │   ├── number.ts
│   │   └── string.ts
│   ├── validation/
│   │   └── helpers.ts
│   ├── storage/
│   │   ├── localStorage.ts
│   │   └── sessionStorage.ts
│   └── helpers/
│       ├── cn.ts                  # classnames helper
│       ├── debounce.ts
│       └── throttle.ts
│
├── types/                         # TypeScript types
│   ├── api/                       # API response types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── course.types.ts
│   │   ├── enrollment.types.ts
│   │   ├── quiz.types.ts
│   │   ├── assignment.types.ts
│   │   └── ...
│   ├── dto/                       # Data Transfer Objects
│   ├── entities/                  # Domain entities
│   └── common.types.ts            # Common types
│
├── i18n/                          # Internationalization
│   ├── config.ts
│   └── locales/
│       ├── vi/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── course.json
│       │   └── ...
│       └── en/
│           ├── common.json
│           ├── auth.json
│           ├── course.json
│           └── ...
│
├── lib/                           # External library configs
│   ├── queryClient.ts
│   └── axios.ts
│
├── styles/                        # Global styles
│   ├── globals.css
│   └── variables.css
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 6. API SERVICE LAYER

### 6.1. HTTP Client Setup

#### `services/http/client.ts`
```typescript
import axios, { AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
```

#### `services/http/interceptors.ts`
```typescript
import { httpClient } from './client';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await httpClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          if (response.data.success) {
            const newToken = response.data.data.token;
            useAuthStore.getState().setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);

    return Promise.reject(error);
  }
);
```

### 6.2. API Service Pattern

Mỗi domain sẽ có một file service riêng trong `services/api/`:

#### Example: `services/api/course.api.ts`
```typescript
import { httpClient } from '../http/client';
import type {
  Course,
  CourseListResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/types/api/course.types';

export const courseApi = {
  // Get all courses
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    return httpClient.get<CourseListResponse>('/courses', { params });
  },

  // Get course by ID
  getById: (id: number) => {
    return httpClient.get<CourseDetailResponse>(`/courses/${id}`);
  },

  // Get enrolled courses
  getEnrolled: (params?: { page?: number; limit?: number }) => {
    return httpClient.get<CourseListResponse>('/courses/enrolled', { params });
  },

  // Create course
  create: (data: CreateCourseRequest) => {
    return httpClient.post<CourseDetailResponse>('/courses', data);
  },

  // Update course
  update: (id: number, data: UpdateCourseRequest) => {
    return httpClient.put<CourseDetailResponse>(`/courses/${id}`, data);
  },

  // Delete course
  delete: (id: number) => {
    return httpClient.delete(`/courses/${id}`);
  },

  // Enroll in course
  enroll: (courseId: number) => {
    return httpClient.post(`/courses/${courseId}/enroll`);
  },

  // Unenroll from course
  unenroll: (courseId: number) => {
    return httpClient.delete(`/courses/${courseId}/unenroll`);
  },

  // Get course students
  getStudents: (courseId: number) => {
    return httpClient.get(`/courses/${courseId}/students`);
  },

  // Get instructor courses
  getInstructorCourses: (instructorId?: number) => {
    const url = instructorId
      ? `/courses/instructor/${instructorId}`
      : '/courses/instructor/my-courses';
    return httpClient.get<CourseListResponse>(url);
  },
};
```

### 6.3. React Query Integration

#### Query Keys: `constants/queryKeys.ts`
```typescript
export const QUERY_KEYS = {
  // Auth
  auth: {
    profile: ['auth', 'profile'] as const,
    verify: ['auth', 'verify'] as const,
  },

  // Courses
  courses: {
    all: ['courses'] as const,
    list: (filters: any) => ['courses', 'list', filters] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
    enrolled: ['courses', 'enrolled'] as const,
    instructor: (id?: number) => ['courses', 'instructor', id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: (filters: any) => ['users', 'list', filters] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
    profile: ['users', 'profile'] as const,
  },

  // Add more...
} as const;
```

#### Custom Hook Example: `hooks/useCourses.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/services/api/course.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';

export const useCourses = (filters?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(filters),
    queryFn: () => courseApi.getAll(filters),
    select: (response) => response.data,
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(id),
    queryFn: () => courseApi.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => courseApi.enroll(courseId),
    onSuccess: () => {
      toast.success('Enrolled successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    },
  });
};
```

---

**Kết thúc Phần 1**

➡️ Tiếp tục đọc **Detail_Refactor_Frontend2.md** để xem:
- Lộ trình phát triển chi tiết theo Phase
- Danh sách Components cần xây dựng
- Implementation checklist đầy đủ
