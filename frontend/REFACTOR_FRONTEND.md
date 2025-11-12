# Kế hoạch Tổng thể Refactor Frontend cho Dự án LMS

## Phần 1: Đề xuất Công nghệ & Cấu trúc (Tech Stack & Architecture)

- **Framework**: React 18 + Vite + TypeScript
- **Quản lý Trạng thái (State Management)**:
  - Zustand cho app state (auth, UI state, feature-scoped stores)
  - React Query cho server state (data fetching/caching, mutation, retries, suspense)
- **Thư viện UI (UI Library)**:
  - TailwindCSS cho styling utility-first
  - shadcn/ui cho bộ component giàu accessibility + Lucide Icons
  - Ưu tiên i18n tiếng Việt trước (i18next), sau đó mở rộng đa ngôn ngữ
- **Routing**: React Router v6, split route theo role (Public, Authenticated, Role-Guarded)
- **Realtime**: Socket.IO client (VITE_SOCKET_URL) cho Chat/Live features; WebRTC theo module `webrtc`
- **Build/Quality**: ESLint + Prettier + Husky (pre-commit), Vitest/RTL cho unit/integration test
- **Cấu hình môi trường**: `.env.development.local` dùng `VITE_API_URL` (dev: `/api` qua proxy) và `VITE_SOCKET_URL`. Hỗ trợ `VITE_DEMO_MODE` (mock -> real forward theo lựa chọn B đã xác nhận).

### Kiến trúc Thư mục (Folder Structure)

```
src/
  app/                  # App shell, providers (QueryClient, i18n, Theme)
  pages/                # Route-level pages (tổ chức theo feature + role)
  layouts/              # AuthLayout, MainLayout, DashboardLayout
  components/
    ui/                 # Button, Modal, Input, DataTable, Toast, Skeleton...
    common/             # Reusable domain-agnostic components (Navbar, Sidebar, Breadcrumb)
    domain/             # CourseCard, UserAvatar, LessonPlayer, Quiz components...
  features/             # Nhóm theo domain: auth, users, courses, enrollment, content, quiz, assignment, notifications, grades, livestream, analytics, admin, files, chat
  services/
    api/                # Service Layer chia theo domain: auth.api.ts, user.api.ts, course.api.ts, ...
    http/               # axios instance, interceptors, error normalization
    socket/             # socket client, event channels
  hooks/                # Custom hooks (useAuth, useRole, usePagination, ...)
  store/                # Zustand stores (authStore, uiStore, ...)
  routes/               # Route configs, guards (ProtectedRoute, RoleGuard)
  constants/            # Routes, roles, query keys, cache TTL, etc.
  utils/                # Helpers (format, date, number, string)
  types/                # DTO/types khớp backend
  i18n/                 # i18next config và resource bundles (vi, en)
  lib/                  # queryClient, analytics helper, tracking
```

### Dịch vụ API (API Service)

- axios instance (`services/http/client.ts`) với `baseURL = import.meta.env.VITE_API_URL || '/api'`.
- Interceptors:
  - Request: gắn `Authorization: Bearer <accessToken>` từ `authStore` nếu có.
  - Response: tự động refresh khi 401 với `POST /auth/refresh-token` (fallback alias `/auth/refresh`). Nếu refresh thất bại → logout + chuyển hướng Login.
- Chuẩn hóa lỗi: map HTTP/validation error về format thống nhất cho UI/Toast.
- React Query: 
  - Query keys rõ ràng theo domain (vd: `['courses', filters]`).
  - StaleTime/GCTime phù hợp (catalog: dài hơn; profile/secured: ngắn hơn; invalidate sau mutation).
- Bảo mật: không lưu refresh token ở client nếu backend cấp qua httpOnly cookie; nếu backend trả refresh token dạng body, lưu an toàn và chỉ dùng trong interceptor.
- Tối ưu mạng: Debounce cho search, bộ lọc; pagination/infinite query cho catalog và danh sách lớn.

---

## Phần 2: Lộ trình Phát triển theo Tính năng (Feature Roadmap)

### Phase 1: Nền tảng & Xác thực (Core & Authentication)

- **Project Setup**:
  - Cài dependencies: react, react-router-dom, @tanstack/react-query, zustand, axios, tailwindcss, shadcn/ui, i18next, socket.io-client, zod + @hookform/resolvers, react-hook-form, lucide-react.
  - Thiết lập QueryClientProvider, ThemeProvider, I18nextProvider.
  - Áp dụng `VITE_DEMO_MODE`: `mockAuthService` forward sang `authService` khi `false` (theo lựa chọn B).

- **Layouts**:
  - `AuthLayout`: form-centered, đơn giản.
  - `MainLayout`: navbar + sidebar + content, responsive.
  - `DashboardLayout`: cho Student/Instructor/Admin với sidebar theo role.

- **Routing**:
  - Public routes: `/`, `/login`, `/register`, `/forgot-password`, `/verify-email/:token`.
  - Private routes: `/dashboard`, `/courses`, `/courses/:id`, `/me`, v.v.
  - Guards: `ProtectedRoute` (kiểm tra token/verify), `RoleGuard` (Student/Instructor/Admin).

- **Authentication**:
  - Trang: Login, Register, Forgot Password, (Verify Email callback), Change Password.
  - Luồng: login → lưu accessToken (và refresh nếu cần) vào `authStore`; auto refresh; logout; verify token (`GET /auth/verify`).
  - Self-service: Profile GET/PUT (`/users/profile`), Avatar upload, Preferences/Notifications/Privacy (`PATCH`), Sessions (`/users/sessions`), Logout all.
  - 2FA (nếu bật): `/users/2fa/enable` `/users/2fa/disable`, `/auth/login-2fa`.
  - i18n: Toàn bộ UI tiếng Việt (đặt vi làm default), switch ngôn ngữ ở header.

Kết nối Backend (tiêu biểu):
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/login-2fa`, `POST /auth/refresh-token` (alias `/auth/refresh`), `POST /auth/logout`, `GET /auth/verify`, `GET /auth/verify-email/:token`.
- User self-service: `GET/PUT /users/profile`, `POST /users/avatar`, `PATCH /users/preferences`, `GET /users/sessions`, `POST /users/logout-all`, `PUT /users/change-password`, `POST /users/2fa/enable|disable`, `POST /users/social/link`, `GET /users/analytics`, `PATCH /users/notifications`, `PATCH /users/privacy`.

### Phase 2: Luồng nghiệp vụ của Student (Student Flow)

- **Dashboard/Trang chủ**: danh sách khóa học đã ghi danh (`GET /courses/enrolled`, hoặc `/enrollments/user/:userId`), tiến độ khóa học (`GET /course-content/courses/:courseId/progress`), hoạt động gần đây (`GET /course-content/users/me/recent-activity`).
- **Danh mục Khóa học (Course Catalog)**:
  - List: `GET /categories` (bộ lọc), `GET /courses` (search, filter, pagination).
  - Chi tiết: `GET /courses/:id` (giảng viên, nội dung, đánh giá tổng hợp).
  - Ghi danh/hủy: `POST /courses/:courseId/enroll`, `DELETE /courses/:courseId/unenroll`.
- **Học (Learning Interface)**:
  - Xem bài học: `GET /course-content/lessons/:lessonId`, `GET /course-content/courses/:courseId/content`.
  - Điều hướng bài học/section, preview miễn phí (`is_free_preview`).
  - Tiến độ: `PUT /course-content/lessons/:lessonId/progress`, `POST /course-content/lessons/:lessonId/complete`.
- **Quiz**:
  - Bắt đầu/tiếp tục: `POST /quizzes/:id/start`, `GET /quizzes/attempts/:attemptId`.
  - Nộp bài: `POST /quizzes/attempts/:attemptId/submit`.
- **Assignments**:
  - Xem/nộp: `GET /assignments/:id`, `POST /assignments/:assignmentId/submissions`.
- **Tài khoản (My Account)**: hồ sơ cá nhân, ảnh đại diện, preferences/notifications/privacy; quản lý sessions; đổi mật khẩu.
- **Thông báo**: `GET /notifications/me`, `GET /notifications/me/unread-count`, `POST /notifications/me/mark-all-read`, `POST /notifications/me/archive-old`.
- **Chat**: ưu tiên Socket.IO; fallback REST: `GET/POST /chat/courses/:courseId/messages`, `GET /chat/courses/:courseId/messages/search`.
- **Files**: `GET /files/view|download|info`, upload nếu được phép trong ngữ cảnh bài nộp.

### Phase 3: Luồng nghiệp vụ của Instructor (Instructor Flow)

- **Dashboard**: tổng quan khóa học của tôi (`GET /courses/instructor/my-courses`), thống kê (`GET /analytics/courses/:courseId/stats`), hoạt động gần đây của học viên.
- **Quản lý Khóa học**:
  - CRUD: `POST/PUT/DELETE /courses`, `GET /courses/instructor/:instructorId`.
  - Trình tạo Nội dung (Curriculum Builder): Sections/Lessons CRUD + reorder
    - Sections: `POST/GET/PUT/DELETE /course-content/.../sections`, `POST /courses/:courseId/sections/reorder`.
    - Lessons: `POST/GET/PUT/DELETE /course-content/.../lessons`, `POST /sections/:sectionId/lessons/reorder`.
    - Materials: `POST /lessons/:lessonId/materials`, `DELETE /materials/:materialId`.
    - Upload: `POST /files/upload`, `POST /files/upload/multiple`.
  - Quản lý Học viên: `GET /courses/:courseId/students`.
- **Bài kiểm tra & Bài tập**:
  - Quiz: CRUD câu hỏi/quiz (`/quizzes` + questions endpoints), xem attempts.
  - Assignment: `POST /assignments`, chấm điểm bài nộp: `POST /assignments/submissions/:submissionId/grade`.
- **Đánh giá (Grades)**: `POST /grades`, `POST /grades/final`, `GET /grades/users/:userId/courses/:courseId`.
- **Live Stream**: `POST /livestream`, `GET /livestream/:sessionId`, `PUT /livestream/:sessionId/status`, `POST /livestream/:sessionId/join` (UI tích hợp WebRTC & chat).
- **Thông báo**: tạo thông báo cho khóa học/học viên: `POST /notifications`.

### Phase 4: Luồng nghiệp vụ của Admin (Admin Flow)

- **Dashboard**: tổng quan hệ thống (user/course stats, unread notifications, livestream sessions).
- **Quản lý Người dùng** (`/admin/users` + alias `/users` sau self-service):
  - Danh sách phân trang, tìm theo role/email; CRUD; đổi status/role.
  - Endpoints chính: `GET/POST /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`, `PATCH|PUT /admin/users/:id/status`, `PUT /admin/users/:id/role`, `GET /admin/users/stats`, `GET /admin/users/email/search`, `GET /admin/users/role/:role`.
- **Quản lý Khóa học**: theo dõi/điều phối, (duyệt if needed qua status). Lưu ý backend hiện không có endpoint duyệt riêng, có thể dùng `PUT /courses/:id` để đổi `status`.
- **Quản lý Danh mục (Categories)**: `GET /categories`, `POST/PUT/DELETE /categories` (Admin/Super Admin).
- **Cài đặt Hệ thống**: `GET/PUT /system-settings`.
- **Báo cáo & Phân tích**: `GET /analytics/*` endpoints.

---

## Phần 3: Các Thành phần Cần xây dựng (Required Components)

- **Button, Input, TextArea, Select, Checkbox, Radio, Switch**
- **Form**: FormLayout, FormField (RHForm + zod integration), ErrorMessage
- **Modal/Drawer**, **ConfirmDialog**, **ToastNotifications**, **LoadingSkeleton**
- **Navbar**, **Sidebar**, **Breadcrumb**, **PageHeader**, **Tabs**
- **DataTable** (sorting, pagination, column visibility), **Pagination**
- **UserAvatar**, **UserBadge/RoleTag**, **UserMenu**
- **CourseCard**, **CourseList**, **CourseFilters**, **CategoryPills**
- **LessonPlayer** (video), **DocumentViewer**, **MarkdownRenderer**
- **CurriculumBuilder** (drag-drop optional), **MaterialUploader**
- **Quiz**: QuestionEditor, OptionsList, AttemptViewer, Timer, ResultSummary
- **Assignment**: SubmissionUploader, GradeInput, FeedbackPanel
- **Notifications**: NotificationBell, NotificationList, NotificationFilters
- **Analytics**: StatsCard, LineChart, BarChart, DonutChart
- **LiveStream**: SessionCard, JoinDialog, StreamControls, ChatPanel
- **Chat**: ChatWindow, MessageItem, MessageInput, OnlineUsers
- **Route Guards**: `ProtectedRoute`, `RoleGuard`

---

Cuối file: Các phần mã nguồn quan trọng cần đọc/đối chiếu khi triển khai

- **Mount & Versioning**:
  - `backend/src/app.ts` (mount `/api`)
  - `backend/src/api/routes.ts` (versioning, aliases)
  - `backend/src/api/v1/routes/index.ts` (tập trung route v1)
- **Auth & Security**:
  - `backend/src/modules/auth/auth.routes.ts`
  - `backend/src/middlewares/auth.middleware.ts`
  - `backend/src/config/jwt.config.ts`
- **User**:
  - Self-service: `backend/src/modules/user/user.routes.ts`
  - Admin: `backend/src/modules/user/user.admin.routes.ts`
- **Course & Enrollment**:
  - `backend/src/modules/course/course.routes.ts`
  - `backend/src/modules/enrollment/enrollment.routes.ts`
- **Course Content**:
  - `backend/src/modules/course-content/course-content.routes.ts`
- **Quiz & Assignment**:
  - `backend/src/modules/quiz/quiz.routes.ts`
  - `backend/src/modules/assignment/assignment.routes.ts`
- **Notifications & Grades**:
  - `backend/src/modules/notifications/notifications.routes.ts`
  - `backend/src/modules/grade/grade.routes.ts`
- **Categories & Settings**:
  - `backend/src/modules/category/category.routes.ts`
  - `backend/src/modules/system-settings/system.settings.routes.ts`
- **LiveStream, Analytics, Chat, Files**:
  - `backend/src/modules/livestream/livestream.routes.ts`
  - `backend/src/modules/analytics/analytics.routes.ts`
  - `backend/src/modules/chat/chat.routes.ts`
  - `backend/src/modules/files/files.routes.ts`
- **Models & Associations** (để map đúng dữ liệu và quan hệ):
  - `backend/src/models/*.model.ts`, `backend/src/models/associations.ts`, `backend/src/models/associations-extended.ts`
- **Frontend hiện tại (demo/mock)**:
  - `frontend/src/services/mockAuthService.ts`, `frontend/src/services/authService.ts`, `frontend/src/stores/authStore.ts`
  - `frontend/src/pages/*`, `frontend/src/components/*`, `frontend/src/i18n.ts`

