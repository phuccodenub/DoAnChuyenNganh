# Kế hoạch Chi tiết Refactor Frontend LMS - Phần 2
## Lộ trình Phát triển & Implementation Checklist

---

## 📋 MỤC LỤC PHẦN 2

7. [Lộ trình Phát triển chi tiết](#7-lộ-trình-phát-triển-chi-tiết)
8. [Component Library](#8-component-library)
9. [Implementation Checklist](#9-implementation-checklist)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance Optimization](#11-performance-optimization)
12. [Deployment & DevOps](#12-deployment--devops)

---

## 7. LỘ TRÌNH PHÁT TRIỂN CHI TIẾT

### 🎯 **PHASE 1: Foundation & Infrastructure (Tuần 1-2)**

#### **1.1. Project Setup & Configuration**

- [ ] **Cài đặt Dependencies bổ sung**
  ```bash
  # Nếu thiếu packages
  npm install @radix-ui/react-* # cho shadcn/ui components
  npm install class-variance-authority
  ```

- [ ] **Cấu hình React Query**
  - [ ] Tạo `lib/queryClient.ts` với cấu hình optimized
  - [ ] Setup QueryClientProvider trong `App.tsx`
  - [ ] Cấu hình default options (staleTime, cacheTime, retry)
  - [ ] Setup React Query DevTools (development only)

- [ ] **Cấu hình Environment Variables**
  - [ ] Tạo `.env.development.local`:
    ```
    VITE_API_URL=/api
    VITE_SOCKET_URL=http://localhost:3000
    VITE_DEMO_MODE=false
    ```
  - [ ] Tạo `.env.production`:
    ```
    VITE_API_URL=https://api.yourdomain.com/api
    VITE_SOCKET_URL=https://api.yourdomain.com
    VITE_DEMO_MODE=false
    ```

- [ ] **Setup Axios Interceptors**
  - [ ] Tạo `services/http/client.ts` với axios instance
  - [ ] Implement request interceptor (attach token)
  - [ ] Implement response interceptor (handle 401, refresh token)
  - [ ] Implement error normalization

- [ ] **Cấu hình i18n mở rộng**
  - [ ] Tổ chức lại translation files theo modules
  - [ ] Thêm translation keys cho tất cả features
  - [ ] Setup language persistence
  - [ ] Implement language switcher component

---

#### **1.2. Core Infrastructure Components**

- [ ] **App Providers Setup**
  - [ ] Tạo `app/providers/QueryProvider.tsx`
  - [ ] Tạo `app/providers/ThemeProvider.tsx` (nếu chưa có)
  - [ ] Tạo `app/providers/AppProviders.tsx` (combine all)
  - [ ] Wrap App với providers

- [ ] **Error Handling**
  - [ ] Tạo `components/common/ErrorBoundary.tsx`
  - [ ] Tạo `components/common/ErrorFallback.tsx`
  - [ ] Setup global error handler
  - [ ] Tạo error logging service (optional)

- [ ] **Loading States**
  - [ ] Tạo `components/ui/Spinner.tsx`
  - [ ] Tạo `components/ui/Skeleton.tsx` (enhance existing)
  - [ ] Tạo `components/common/PageLoader.tsx`
  - [ ] Tạo `components/common/SuspenseLoader.tsx`

- [ ] **Toast Notification System**
  - [ ] Setup Toaster trong App.tsx (react-hot-toast)
  - [ ] Tạo toast utility với i18n support
  - [ ] Custom toast variants (success, error, warning, info)

---

#### **1.3. Authentication System**

- [ ] **Auth Store Enhancement**
  - [ ] Thêm refreshToken vào authStore
  - [ ] Implement token refresh logic
  - [ ] Add session management
  - [ ] Add remember me functionality

- [ ] **Auth Service Migration**
  - [ ] Chuyển từ `mockAuthService` sang `authService` thực
  - [ ] Test tất cả auth endpoints
  - [ ] Implement 2FA flows
  - [ ] Handle email verification

- [ ] **Auth Components**
  - [ ] ✅ LoginPage.tsx (enhance existing)
  - [ ] ✅ RegisterPage.tsx (enhance existing)
  - [ ] Tạo `pages/auth/ForgotPasswordPage.tsx`
  - [ ] Tạo `pages/auth/ResetPasswordPage.tsx`
  - [ ] Tạo `pages/auth/VerifyEmailPage.tsx`
  - [ ] Tạo `pages/auth/TwoFactorPage.tsx`

- [ ] **Auth Layouts**
  - [ ] Tạo `layouts/AuthLayout.tsx`
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Background/branding

- [ ] **Auth Hooks**
  - [ ] Tạo `hooks/useAuth.ts`
  - [ ] Tạo `hooks/useUser.ts`
  - [ ] Tạo `hooks/useRole.ts`
  - [ ] Implement auto-logout on token expiry

---

#### **1.4. Routing System**

- [ ] **Route Configuration**
  - [ ] Tạo `constants/routes.ts` (all route paths)
  - [ ] Tạo `routes/publicRoutes.tsx`
  - [ ] Tạo `routes/authRoutes.tsx`
  - [ ] Tạo `routes/studentRoutes.tsx`
  - [ ] Tạo `routes/instructorRoutes.tsx`
  - [ ] Tạo `routes/adminRoutes.tsx`

- [ ] **Route Guards**
  - [ ] Tạo `routes/ProtectedRoute.tsx` (check authentication)
  - [ ] Tạo `routes/RoleGuard.tsx` (check authorization)
  - [ ] Implement redirect logic
  - [ ] Handle unauthorized access

- [ ] **Main Router**
  - [ ] Tạo `routes/index.tsx` (combine all routes)
  - [ ] Implement lazy loading cho routes
  - [ ] Setup Suspense boundaries
  - [ ] 404 Not Found handling

---

#### **1.5. Base UI Components Library**

- [ ] **Form Components**
  - [ ] `components/ui/Button.tsx` (variants, sizes, states)
  - [ ] `components/ui/Input.tsx` (types, validation states)
  - [ ] `components/ui/Textarea.tsx`
  - [ ] `components/ui/Select.tsx`
  - [ ] `components/ui/Checkbox.tsx`
  - [ ] `components/ui/Radio.tsx`
  - [ ] `components/ui/Switch.tsx`
  - [ ] `components/forms/FormField.tsx` (RHF integration)
  - [ ] `components/forms/FormLabel.tsx`
  - [ ] `components/forms/FormError.tsx`
  - [ ] `components/forms/FileUpload.tsx`

- [ ] **Feedback Components**
  - [ ] `components/ui/Modal.tsx`
  - [ ] `components/ui/Drawer.tsx`
  - [ ] `components/ui/Dialog.tsx`
  - [ ] `components/ui/Alert.tsx`
  - [ ] `components/ui/Toast.tsx` (customize react-hot-toast)
  - [ ] `components/ui/Progress.tsx`
  - [ ] `components/ui/Tooltip.tsx`

- [ ] **Data Display Components**
  - [ ] `components/ui/Card.tsx`
  - [ ] `components/ui/Badge.tsx`
  - [ ] `components/ui/Avatar.tsx`
  - [ ] `components/ui/Tabs.tsx`
  - [ ] `components/ui/Accordion.tsx`
  - [ ] `components/ui/Dropdown.tsx`
  - [ ] `components/ui/DataTable.tsx` (sorting, filtering, pagination)
  - [ ] `components/common/Pagination.tsx`

- [ ] **Navigation Components**
  - [ ] `components/common/Navbar.tsx`
  - [ ] `components/common/Sidebar.tsx`
  - [ ] `components/common/Breadcrumb.tsx`
  - [ ] `components/common/PageHeader.tsx`

---

### 🎓 **PHASE 2: Student Features (Tuần 3-5)**

#### **2.1. Student Dashboard**

- [ ] **Dashboard Layout**
  - [ ] Tạo `layouts/StudentDashboardLayout.tsx`
  - [ ] Sidebar với navigation
  - [ ] Top bar với user menu, notifications
  - [ ] Responsive mobile menu

- [ ] **Dashboard Page**
  - [ ] Tạo `pages/student/DashboardPage.tsx`
  - [ ] Overview stats cards (enrolled courses, completed, in progress)
  - [ ] Recent activity feed
  - [ ] Continue learning section
  - [ ] Recommended courses

- [ ] **Dashboard Components**
  - [ ] `components/domain/course/EnrolledCoursesList.tsx`
  - [ ] `components/domain/course/CourseProgressCard.tsx`
  - [ ] `components/domain/course/RecentActivity.tsx`
  - [ ] `components/domain/analytics/StatsCard.tsx`

- [ ] **API Integration**
  - [ ] Tạo `services/api/enrollment.api.ts`
  - [ ] Tạo `services/api/course-content.api.ts`
  - [ ] Tạo `hooks/useEnrollments.ts`
  - [ ] Tạo `hooks/useCourseProgress.ts`

---

#### **2.2. Course Catalog & Browse**

- [ ] **Course Catalog Page**
  - [ ] Tạo `pages/public/CourseCatalogPage.tsx`
  - [ ] Grid/List view toggle
  - [ ] Responsive layout

- [ ] **Course Components**
  - [ ] `components/domain/course/CourseCard.tsx`
    - Thumbnail, title, instructor
    - Rating, students count
    - Price/Free badge
    - Hover effects
  - [ ] `components/domain/course/CourseList.tsx`
  - [ ] `components/domain/course/CourseGrid.tsx`
  - [ ] `components/domain/course/CourseFilters.tsx`
    - Category filter
    - Difficulty filter
    - Price filter (free/paid)
    - Search bar
    - Sort options

- [ ] **Search & Filter**
  - [ ] Implement debounced search
  - [ ] Multi-filter logic
  - [ ] Filter persistence (URL params)
  - [ ] Clear filters button

- [ ] **Pagination**
  - [ ] Standard pagination component
  - [ ] Infinite scroll option
  - [ ] Page size selector

- [ ] **API Integration**
  - [ ] Tạo `services/api/course.api.ts`
  - [ ] Tạo `hooks/useCourses.ts`
  - [ ] Implement caching strategy

---

#### **2.3. Course Detail & Enrollment**

- [ ] **Course Detail Page**
  - [ ] Tạo `pages/public/CourseDetailPage.tsx`
  - [ ] Course header (title, instructor, rating)
  - [ ] Course description
  - [ ] Curriculum preview (sections & lessons)
  - [ ] Instructor info card
  - [ ] Reviews section
  - [ ] Enroll button (prominent CTA)

- [ ] **Course Detail Components**
  - [ ] `components/domain/course/CourseHeader.tsx`
  - [ ] `components/domain/course/CurriculumPreview.tsx`
  - [ ] `components/domain/course/InstructorCard.tsx`
  - [ ] `components/domain/course/CourseReviews.tsx`
  - [ ] `components/domain/course/EnrollButton.tsx`

- [ ] **Enrollment Flow**
  - [ ] Enroll modal/confirmation
  - [ ] Handle enrollment API call
  - [ ] Success feedback
  - [ ] Redirect to learning page

- [ ] **API Integration**
  - [ ] Implement course detail fetching
  - [ ] Implement enroll/unenroll mutations
  - [ ] Optimistic updates

---

#### **2.4. Learning Interface**

- [ ] **Learning Page**
  - [ ] Tạo `pages/student/LearningPage.tsx`
  - [ ] Layout: Sidebar (curriculum) + Main (content)
  - [ ] Responsive: collapsible sidebar on mobile

- [ ] **Curriculum Sidebar**
  - [ ] `components/domain/lesson/CurriculumSidebar.tsx`
  - [ ] Expandable sections
  - [ ] Lesson list với icons (video, document, quiz)
  - [ ] Progress indicators
  - [ ] Locked/Unlocked states
  - [ ] Current lesson highlight

- [ ] **Lesson Player**
  - [ ] `components/domain/lesson/LessonPlayer.tsx`
  - [ ] `components/domain/lesson/VideoPlayer.tsx`
    - Play/pause, seek
    - Volume control
    - Speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
    - Fullscreen
    - Progress tracking (auto-save every 10s)
    - Resume từ last position
  - [ ] `components/domain/lesson/DocumentViewer.tsx`
    - PDF viewer
    - Markdown renderer
    - Image viewer
  - [ ] `components/domain/lesson/AudioPlayer.tsx` (if needed)

- [ ] **Lesson Navigation**
  - [ ] Previous/Next lesson buttons
  - [ ] Mark as complete button
  - [ ] Lesson info (title, duration)
  - [ ] Download materials button

- [ ] **Progress Tracking**
  - [ ] Auto-save progress on video watch
  - [ ] Manual mark as complete
  - [ ] Update progress bar in sidebar
  - [ ] Sync with backend API

- [ ] **API Integration**
  - [ ] Fetch course content (sections, lessons)
  - [ ] Fetch lesson detail
  - [ ] Update lesson progress
  - [ ] Mark lesson complete
  - [ ] Get course progress

---

#### **2.5. Quiz System**

- [ ] **Quiz Interface**
  - [ ] Tạo `pages/student/QuizPage.tsx`
  - [ ] `components/domain/quiz/QuizInterface.tsx`
  - [ ] Quiz header (title, description, time limit)
  - [ ] Question counter (1/10)
  - [ ] Timer display (countdown)

- [ ] **Quiz Components**
  - [ ] `components/domain/quiz/QuizStart.tsx` (start screen)
  - [ ] `components/domain/quiz/QuestionCard.tsx`
    - Question text
    - Question type indicator
  - [ ] `components/domain/quiz/AnswerOptions.tsx`
    - Multiple choice (radio)
    - Multiple select (checkbox)
    - True/False
    - Essay/Text input
  - [ ] `components/domain/quiz/QuestionNavigation.tsx`
    - Question list (numbered buttons)
    - Answered/Unanswered indicators
    - Jump to question
  - [ ] `components/domain/quiz/QuizTimer.tsx`
  - [ ] `components/domain/quiz/QuizSubmitButton.tsx`

- [ ] **Quiz Results**
  - [ ] `components/domain/quiz/QuizResults.tsx`
  - [ ] Score display
  - [ ] Pass/Fail indicator
  - [ ] Correct/Incorrect breakdown
  - [ ] Review answers option

- [ ] **Quiz Review**
  - [ ] `components/domain/quiz/QuizReview.tsx`
  - [ ] Show all questions
  - [ ] User's answers vs correct answers
  - [ ] Explanations (if provided)

- [ ] **Quiz Logic**
  - [ ] Start quiz (create attempt)
  - [ ] Save answers (auto-save draft)
  - [ ] Submit quiz
  - [ ] Handle time expiry (auto-submit)
  - [ ] Fetch results
  - [ ] View attempt history

- [ ] **API Integration**
  - [ ] Tạo `services/api/quiz.api.ts`
  - [ ] Tạo `hooks/useQuiz.ts`
  - [ ] Implement quiz mutations

---

#### **2.6. Assignment System**

- [ ] **Assignment Components**
  - [ ] `components/domain/assignment/AssignmentCard.tsx`
    - Title, description
    - Due date
    - Status (pending, submitted, graded)
    - Score (if graded)
  - [ ] `components/domain/assignment/AssignmentList.tsx`
  - [ ] `components/domain/assignment/AssignmentDetail.tsx`
  - [ ] `components/domain/assignment/SubmissionForm.tsx`
    - File upload
    - Text submission
    - Submit button

- [ ] **Assignment Pages**
  - [ ] Assignment list view
  - [ ] Assignment detail view
  - [ ] Submission view

- [ ] **Submission Flow**
  - [ ] Upload files
  - [ ] Text editor for written submissions
  - [ ] Submit confirmation
  - [ ] View submission status
  - [ ] View grade & feedback

- [ ] **API Integration**
  - [ ] Tạo `services/api/assignment.api.ts`
  - [ ] Tạo `hooks/useAssignments.ts`
  - [ ] File upload integration

---

#### **2.7. Student Profile & Settings**

- [ ] **Profile Page**
  - [ ] Tạo `pages/student/ProfilePage.tsx`
  - [ ] View/Edit profile info
  - [ ] Avatar upload
  - [ ] Bio, social links

- [ ] **Settings Tabs**
  - [ ] Account settings
  - [ ] Change password
  - [ ] Preferences (language, theme, notifications)
  - [ ] Privacy settings
  - [ ] Session management
  - [ ] Two-factor authentication

- [ ] **Profile Components**
  - [ ] `components/domain/user/ProfileHeader.tsx`
  - [ ] `components/domain/user/ProfileForm.tsx`
  - [ ] `components/domain/user/AvatarUpload.tsx`
  - [ ] `components/domain/user/ChangePasswordForm.tsx`
  - [ ] `components/domain/user/SessionsList.tsx`

- [ ] **API Integration**
  - [ ] User profile GET/PUT
  - [ ] Avatar upload
  - [ ] Password change
  - [ ] Preferences update
  - [ ] Sessions management

---

#### **2.8. Notifications**

- [ ] **Notification System**
  - [ ] `components/domain/notification/NotificationBell.tsx`
    - Bell icon với badge (unread count)
    - Dropdown on click
  - [ ] `components/domain/notification/NotificationList.tsx`
  - [ ] `components/domain/notification/NotificationItem.tsx`
    - Read/Unread states
    - Timestamp
    - Action button (if applicable)
    - Mark as read
    - Delete

- [ ] **Notification Page**
  - [ ] Full notification list page
  - [ ] Filter (all, unread, read)
  - [ ] Mark all as read
  - [ ] Archive old notifications

- [ ] **Real-time Updates**
  - [ ] Socket.IO integration
  - [ ] Listen for new notifications
  - [ ] Update unread count
  - [ ] Toast on new notification

- [ ] **API Integration**
  - [ ] Tạo `services/api/notification.api.ts`
  - [ ] Tạo `hooks/useNotifications.ts`
  - [ ] WebSocket event handlers

---

#### **2.9. My Courses Page**

- [ ] **My Courses Page**
  - [ ] Tạo `pages/student/MyCoursesPage.tsx`
  - [ ] Tabs: All / In Progress / Completed
  - [ ] Course cards với progress
  - [ ] Continue learning button
  - [ ] Unenroll option

- [ ] **My Courses Components**
  - [ ] `components/domain/course/MyCoursesGrid.tsx`
  - [ ] `components/domain/course/EnrolledCourseCard.tsx`
  - [ ] Progress bars
  - [ ] Certificate download (if completed)

---

### 👨‍🏫 **PHASE 3: Instructor Features (Tuần 6-8)**

#### **3.1. Instructor Dashboard**

- [ ] **Dashboard Layout**
  - [ ] Tạo `layouts/InstructorDashboardLayout.tsx`
  - [ ] Sidebar với instructor-specific navigation
  - [ ] Top bar

- [ ] **Dashboard Page**
  - [ ] Tạo `pages/instructor/DashboardPage.tsx`
  - [ ] Stats cards (total courses, students, revenue)
  - [ ] Recent enrollments
  - [ ] Course performance chart
  - [ ] Quick actions (create course, view students)

- [ ] **Dashboard Components**
  - [ ] `components/domain/analytics/InstructorStats.tsx`
  - [ ] `components/domain/course/InstructorCoursesList.tsx`
  - [ ] Charts (LineChart, BarChart)

---

#### **3.2. Course Management**

- [ ] **My Courses Page (Instructor)**
  - [ ] Tạo `pages/instructor/MyCoursesPage.tsx`
  - [ ] List/Grid view của courses
  - [ ] Course status badges (draft, published, archived)
  - [ ] Actions: Edit, Delete, View, Publish/Unpublish

- [ ] **Course Editor Page**
  - [ ] Tạo `pages/instructor/CourseEditorPage.tsx`
  - [ ] Tabs:
    - Basic Info
    - Curriculum
    - Settings
    - Students (if published)
  - [ ] Save draft functionality
  - [ ] Publish button

- [ ] **Basic Info Tab**
  - [ ] Course title, description
  - [ ] Category selection
  - [ ] Difficulty level
  - [ ] Thumbnail upload
  - [ ] Price (if paid course)
  - [ ] Tags/Keywords

- [ ] **Curriculum Builder**
  - [ ] `components/domain/course/CurriculumBuilder.tsx`
  - [ ] Section list
  - [ ] Add section button
  - [ ] Expandable sections
  - [ ] Lesson list trong section
  - [ ] Add lesson button
  - [ ] Drag-and-drop reorder (optional, or up/down arrows)

- [ ] **Section Management**
  - [ ] `components/domain/course/SectionEditor.tsx`
  - [ ] Section title, description
  - [ ] Order index
  - [ ] Published toggle
  - [ ] Delete section (with confirmation)

- [ ] **Lesson Management**
  - [ ] `components/domain/course/LessonEditor.tsx`
  - [ ] Lesson title, description
  - [ ] Content type selection (video, document, text, quiz)
  - [ ] Video upload/URL input
  - [ ] Document upload
  - [ ] Rich text editor cho text content
  - [ ] Duration input
  - [ ] Free preview toggle
  - [ ] Published toggle
  - [ ] Delete lesson (with confirmation)

- [ ] **Material Management**
  - [ ] `components/domain/course/MaterialUploader.tsx`
  - [ ] Add materials to lessons
  - [ ] Material list
  - [ ] Delete materials

- [ ] **File Upload**
  - [ ] `components/forms/FileUpload.tsx` (enhance)
  - [ ] Drag-and-drop
  - [ ] Progress indicator
  - [ ] Preview thumbnail
  - [ ] Size validation
  - [ ] Type validation

- [ ] **API Integration**
  - [ ] Course CRUD
  - [ ] Section CRUD + reorder
  - [ ] Lesson CRUD + reorder
  - [ ] Material CRUD
  - [ ] File upload API
  - [ ] Tạo `services/api/files.api.ts`

---

#### **3.3. Quiz Management (Instructor)**

- [ ] **Quiz Builder Page**
  - [ ] Tạo `pages/instructor/QuizBuilderPage.tsx`
  - [ ] Quiz info form (title, description, time limit, passing score)
  - [ ] Question list
  - [ ] Add question button

- [ ] **Question Editor**
  - [ ] `components/domain/quiz/QuestionEditor.tsx`
  - [ ] Question text input
  - [ ] Question type selector
  - [ ] Options editor (for multiple choice)
    - [ ] Add/Remove options
    - [ ] Mark correct answer(s)
  - [ ] Explanation input (optional)
  - [ ] Points input

- [ ] **Quiz Components**
  - [ ] `components/domain/quiz/QuizList.tsx`
  - [ ] `components/domain/quiz/QuizForm.tsx`
  - [ ] `components/domain/quiz/QuestionsList.tsx`

- [ ] **View Quiz Attempts**
  - [ ] List of student attempts
  - [ ] Scores
  - [ ] Date/time
  - [ ] View detailed attempt

- [ ] **API Integration**
  - [ ] Quiz CRUD
  - [ ] Question CRUD
  - [ ] Get quiz attempts

---

#### **3.4. Assignment Management (Instructor)**

- [ ] **Assignment Builder**
  - [ ] Tạo `pages/instructor/AssignmentBuilderPage.tsx`
  - [ ] Assignment form (title, description, due date, max score)
  - [ ] Attach to lesson/course

- [ ] **Submissions Management**
  - [ ] Tạo `pages/instructor/SubmissionsPage.tsx`
  - [ ] List of submissions
  - [ ] Status: Pending, Graded
  - [ ] View submission button

- [ ] **Grading Interface**
  - [ ] `components/domain/assignment/GradingPanel.tsx`
  - [ ] View student submission (files, text)
  - [ ] Grade input (score out of max)
  - [ ] Feedback textarea
  - [ ] Submit grade button

- [ ] **API Integration**
  - [ ] Assignment CRUD
  - [ ] Get submissions
  - [ ] Grade submission

---

#### **3.5. Student Management (Instructor)**

- [ ] **Students Page**
  - [ ] Tạo `pages/instructor/StudentManagementPage.tsx`
  - [ ] List of enrolled students per course
  - [ ] Student info (name, email, enrollment date)
  - [ ] Progress percentage
  - [ ] View details button

- [ ] **Student Detail View**
  - [ ] Student profile info
  - [ ] Enrollment details
  - [ ] Lesson progress
  - [ ] Quiz scores
  - [ ] Assignment grades

- [ ] **API Integration**
  - [ ] Get course students
  - [ ] Get student progress

---

#### **3.6. Grades Management**

- [ ] **Grades Page**
  - [ ] Tạo `pages/instructor/GradesPage.tsx`
  - [ ] Course selector
  - [ ] Student list với grades
  - [ ] Grade components (quiz, assignment, final)
  - [ ] Edit grade button

- [ ] **Grade Entry**
  - [ ] `components/domain/assignment/GradeInput.tsx`
  - [ ] Modal/form to enter grade
  - [ ] Grade type selector
  - [ ] Score input
  - [ ] Comments

- [ ] **Final Grade Calculation**
  - [ ] Auto-calculate final grade (if formula provided)
  - [ ] Manual override option

- [ ] **API Integration**
  - [ ] Tạo `services/api/grade.api.ts`
  - [ ] Tạo `hooks/useGrades.ts`
  - [ ] Upsert grade
  - [ ] Upsert final grade
  - [ ] Get grades by course

---

#### **3.7. Instructor Analytics**

- [ ] **Analytics Page**
  - [ ] Tạo `pages/instructor/AnalyticsPage.tsx`
  - [ ] Course selector
  - [ ] Date range picker
  - [ ] Stats cards (students, completion rate, avg score)
  - [ ] Charts:
    - Enrollments over time
    - Lesson completion rates
    - Quiz performance
    - Student engagement

- [ ] **Analytics Components**
  - [ ] `components/domain/analytics/LineChart.tsx`
  - [ ] `components/domain/analytics/BarChart.tsx`
  - [ ] `components/domain/analytics/DonutChart.tsx`
  - [ ] Chart library: recharts or chart.js

- [ ] **API Integration**
  - [ ] Tạo `services/api/analytics.api.ts`
  - [ ] Course stats endpoint
  - [ ] User activities endpoint

---

#### **3.8. Live Stream (Instructor)**

- [ ] **Live Stream Page**
  - [ ] Tạo `pages/instructor/LiveStreamPage.tsx`
  - [ ] Create session form
  - [ ] Scheduled sessions list
  - [ ] Join as host button

- [ ] **Live Stream Components**
  - [ ] `components/domain/livestream/SessionCreator.tsx`
  - [ ] `components/domain/livestream/SessionCard.tsx`
  - [ ] `components/domain/livestream/LiveStreamControls.tsx` (start, stop, share screen)
  - [ ] `components/domain/livestream/LiveStreamChat.tsx` (integrated chat)

- [ ] **WebRTC Integration**
  - [ ] Setup WebRTC service
  - [ ] Camera/mic permissions
  - [ ] Screen sharing
  - [ ] Stream publishing

- [ ] **API Integration**
  - [ ] Tạo `services/api/livestream.api.ts`
  - [ ] Create session
  - [ ] Update session status
  - [ ] Get sessions

---

### 👨‍💼 **PHASE 4: Admin Features (Tuần 9-10)**

#### **4.1. Admin Dashboard**

- [ ] **Dashboard Layout**
  - [ ] Tạo `layouts/AdminDashboardLayout.tsx`
  - [ ] Sidebar với admin navigation

- [ ] **Dashboard Page**
  - [ ] Tạo `pages/admin/DashboardPage.tsx`
  - [ ] Platform overview stats
    - Total users (students, instructors, admins)
    - Total courses (draft, published, archived)
    - Total enrollments
    - System health
  - [ ] Recent activities
  - [ ] Quick actions

---

#### **4.2. User Management**

- [ ] **User Management Page**
  - [ ] Tạo `pages/admin/UserManagementPage.tsx`
  - [ ] User list với DataTable
  - [ ] Columns: ID, Name, Email, Role, Status, Actions
  - [ ] Pagination
  - [ ] Search bar
  - [ ] Filter by role
  - [ ] Filter by status

- [ ] **User Actions**
  - [ ] Create new user button (modal)
  - [ ] Edit user button (modal)
  - [ ] Delete user button (confirmation)
  - [ ] Change role dropdown
  - [ ] Change status (active/suspended)

- [ ] **User Forms**
  - [ ] `components/domain/user/UserForm.tsx`
  - [ ] Create user modal
  - [ ] Edit user modal
  - [ ] Form fields: email, full_name, role, password (create only)

- [ ] **User Detail View**
  - [ ] Modal or separate page
  - [ ] User info
  - [ ] Enrollments
  - [ ] Activity log

- [ ] **API Integration**
  - [ ] Tạo `services/api/user.api.ts` (admin endpoints)
  - [ ] Get all users
  - [ ] Create user
  - [ ] Update user
  - [ ] Delete user
  - [ ] Change status
  - [ ] Change role

---

#### **4.3. Course Management (Admin)**

- [ ] **Course Management Page**
  - [ ] Tạo `pages/admin/CourseManagementPage.tsx`
  - [ ] Course list với DataTable
  - [ ] Columns: ID, Title, Instructor, Category, Status, Students, Actions
  - [ ] Pagination
  - [ ] Search, filter

- [ ] **Course Actions (Admin)**
  - [ ] View course details
  - [ ] Approve/Reject (if moderation needed)
  - [ ] Change status (publish, archive, suspend)
  - [ ] Delete course (with confirmation)

- [ ] **Course Moderation**
  - [ ] Pending approval list
  - [ ] Approve/Reject buttons
  - [ ] Comments/feedback to instructor

---

#### **4.4. Category Management**

- [ ] **Category Management Page**
  - [ ] Tạo `pages/admin/CategoryManagementPage.tsx`
  - [ ] Category list (tree view if nested)
  - [ ] Add category button
  - [ ] Edit/Delete actions

- [ ] **Category Forms**
  - [ ] `components/domain/category/CategoryForm.tsx`
  - [ ] Name, description, slug
  - [ ] Parent category (if nested)
  - [ ] Icon/image

- [ ] **API Integration**
  - [ ] Tạo `services/api/category.api.ts`
  - [ ] Category CRUD

---

#### **4.5. System Settings**

- [ ] **System Settings Page**
  - [ ] Tạo `pages/admin/SystemSettingsPage.tsx`
  - [ ] Tabs for different settings groups
    - General
    - Email
    - Security
    - Features
    - Integrations

- [ ] **Settings Forms**
  - [ ] `components/domain/system/GeneralSettingsForm.tsx`
  - [ ] `components/domain/system/EmailSettingsForm.tsx`
  - [ ] Site name, logo, timezone, etc.
  - [ ] Email provider config
  - [ ] Security options (password policy, session timeout)
  - [ ] Feature flags (enable/disable features)

- [ ] **API Integration**
  - [ ] Tạo `services/api/system-settings.api.ts`
  - [ ] Get settings
  - [ ] Update settings

---

#### **4.6. Reports & Analytics (Admin)**

- [ ] **Reports Page**
  - [ ] Tạo `pages/admin/ReportsPage.tsx`
  - [ ] Platform-wide analytics
  - [ ] User growth chart
  - [ ] Course popularity
  - [ ] Revenue reports (if applicable)
  - [ ] Export to CSV/PDF

- [ ] **Analytics Components**
  - [ ] Reuse existing chart components
  - [ ] Date range selector
  - [ ] Metric cards

---

### 🔧 **PHASE 5: Advanced Features (Tuần 11-12)**

#### **5.1. Chat System**

- [ ] **Chat Integration**
  - [ ] Setup Socket.IO connection
  - [ ] `services/socket/socketClient.ts`
  - [ ] Event handlers setup

- [ ] **Chat Components**
  - [ ] `components/domain/chat/ChatWindow.tsx`
  - [ ] `components/domain/chat/MessageList.tsx`
  - [ ] `components/domain/chat/MessageItem.tsx`
    - Text messages
    - File/image messages
    - Timestamps
    - Sender info
  - [ ] `components/domain/chat/MessageInput.tsx`
    - Text input
    - File attach button
    - Emoji picker
    - Send button
  - [ ] `components/domain/chat/OnlineUsers.tsx`

- [ ] **Chat Features**
  - [ ] Send/receive messages (real-time)
  - [ ] File sharing
  - [ ] Emoji support
  - [ ] Message search
  - [ ] Edit/Delete own messages
  - [ ] Online status indicators

- [ ] **Chat Store**
  - [ ] `stores/chatStore.ts` (enhance existing)
  - [ ] Messages state
  - [ ] Online users state
  - [ ] Typing indicators

- [ ] **API Integration**
  - [ ] Tạo `services/api/chat.api.ts` (REST fallback)
  - [ ] Socket event handlers

---

#### **5.2. Real-time Notifications**

- [ ] **Socket.IO Integration**
  - [ ] Listen for notification events
  - [ ] Update notification count
  - [ ] Show toast on new notification
  - [ ] Play sound (optional)

- [ ] **Notification Types**
  - [ ] Course enrollment
  - [ ] New lesson available
  - [ ] Quiz graded
  - [ ] Assignment graded
  - [ ] New announcement
  - [ ] Live session starting

---

#### **5.3. File Management**

- [ ] **File Upload Service**
  - [ ] Single file upload
  - [ ] Multiple files upload
  - [ ] Progress tracking
  - [ ] Drag-and-drop

- [ ] **File Viewer**
  - [ ] `components/domain/files/FileViewer.tsx`
  - [ ] PDF viewer
  - [ ] Image viewer
  - [ ] Video player (reuse)

- [ ] **File Manager (Optional)**
  - [ ] `components/domain/files/FileManager.tsx`
  - [ ] List files
  - [ ] Upload files
  - [ ] Delete files
  - [ ] Download files
  - [ ] File info

---

#### **5.4. Search & Recommendations**

- [ ] **Global Search**
  - [ ] `components/common/GlobalSearch.tsx`
  - [ ] Search bar in navbar
  - [ ] Search courses, lessons, users
  - [ ] Search results page
  - [ ] Highlight matched terms

- [ ] **Recommendation System**
  - [ ] `components/domain/course/RecommendationPanel.tsx`
  - [ ] Recommended courses based on:
    - Enrolled courses
    - Completed courses
    - Category preferences
    - Popularity

- [ ] **API Integration**
  - [ ] Search endpoint
  - [ ] Recommendations endpoint

---

#### **5.5. Internationalization (i18n) Completion**

- [ ] **Translation Coverage**
  - [ ] Complete vi.json (Vietnamese - default)
  - [ ] Complete en.json (English)
  - [ ] Organize by modules:
    - common.json
    - auth.json
    - course.json
    - quiz.json
    - assignment.json
    - notification.json
    - etc.

- [ ] **Language Switcher**
  - [ ] `components/common/LanguageSwitcher.tsx`
  - [ ] Dropdown in navbar/settings
  - [ ] Persist language choice

- [ ] **RTL Support (Optional)**
  - [ ] If supporting Arabic/Hebrew in future
  - [ ] RTL CSS

---

#### **5.6. Accessibility (a11y)**

- [ ] **Keyboard Navigation**
  - [ ] All interactive elements keyboard accessible
  - [ ] Focus indicators visible
  - [ ] Logical tab order

- [ ] **Screen Reader Support**
  - [ ] ARIA labels
  - [ ] ARIA roles
  - [ ] Alt text for images

- [ ] **Color Contrast**
  - [ ] WCAG AA compliance
  - [ ] Test với contrast checker

- [ ] **Form Accessibility**
  - [ ] Labels for all inputs
  - [ ] Error messages announced

---

#### **5.7. Responsive Design**

- [ ] **Mobile Optimization**
  - [ ] Mobile-first approach
  - [ ] Touch-friendly UI
  - [ ] Collapsible sidebars
  - [ ] Bottom navigation (mobile)

- [ ] **Tablet Optimization**
  - [ ] Layouts adjust for tablet
  - [ ] Grid columns responsive

- [ ] **Desktop Optimization**
  - [ ] Full sidebar navigation
  - [ ] Multi-column layouts
  - [ ] Hover effects

- [ ] **Breakpoints**
  - [ ] sm: 640px
  - [ ] md: 768px
  - [ ] lg: 1024px
  - [ ] xl: 1280px
  - [ ] 2xl: 1536px

---

## 8. COMPONENT LIBRARY

### 8.1. UI Components Checklist

#### **Form Components**
- [ ] Button (variants: primary, secondary, outline, ghost, link)
- [ ] Input (types: text, email, password, number, date, tel)
- [ ] Textarea
- [ ] Select / ComboBox
- [ ] Checkbox
- [ ] Radio
- [ ] Switch / Toggle
- [ ] Slider
- [ ] DatePicker
- [ ] TimePicker
- [ ] ColorPicker (optional)
- [ ] FileUpload (single & multiple)
- [ ] RichTextEditor (TipTap or similar)

#### **Feedback Components**
- [ ] Modal / Dialog
- [ ] Drawer (slide-in panel)
- [ ] Alert / Banner
- [ ] Toast / Notification
- [ ] Progress Bar
- [ ] Progress Circle
- [ ] Spinner / Loader
- [ ] Skeleton Loader
- [ ] Tooltip
- [ ] Popover
- [ ] Confirm Dialog

#### **Data Display**
- [ ] Card
- [ ] Avatar
- [ ] Badge
- [ ] Tag
- [ ] Chip
- [ ] Divider
- [ ] Accordion
- [ ] Tabs
- [ ] Collapse
- [ ] Table / DataTable
- [ ] List
- [ ] Description List
- [ ] Timeline (optional)
- [ ] Tree View (optional)
- [ ] Stats Card

#### **Navigation**
- [ ] Navbar
- [ ] Sidebar
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Stepper (wizard)
- [ ] Menu / Dropdown
- [ ] Tabs Navigation

#### **Layout**
- [ ] Container
- [ ] Grid
- [ ] Stack (VStack, HStack)
- [ ] Spacer
- [ ] Center
- [ ] Flex

---

### 8.2. Domain Components Checklist

#### **User Components**
- [ ] UserAvatar (với fallback initials)
- [ ] UserCard
- [ ] UserMenu (dropdown)
- [ ] UserRoleBadge
- [ ] UserStatusBadge
- [ ] UserList
- [ ] UserSearchInput

#### **Course Components**
- [ ] CourseCard
- [ ] CourseGrid
- [ ] CourseList
- [ ] CourseFilters
- [ ] CourseHeader
- [ ] CourseStats
- [ ] CurriculumPreview
- [ ] CurriculumBuilder
- [ ] CurriculumSidebar
- [ ] InstructorCard
- [ ] CourseReviews (optional)
- [ ] EnrollButton
- [ ] CourseProgressBar

#### **Lesson Components**
- [ ] LessonCard
- [ ] LessonPlayer
- [ ] VideoPlayer
- [ ] DocumentViewer
- [ ] AudioPlayer
- [ ] LessonNavigation
- [ ] SectionEditor
- [ ] LessonEditor
- [ ] MaterialUploader
- [ ] MaterialsList

#### **Quiz Components**
- [ ] QuizCard
- [ ] QuizList
- [ ] QuizInterface
- [ ] QuizStart
- [ ] QuestionCard
- [ ] AnswerOptions
- [ ] QuestionNavigation
- [ ] QuizTimer
- [ ] QuizResults
- [ ] QuizReview
- [ ] QuestionEditor
- [ ] OptionEditor

#### **Assignment Components**
- [ ] AssignmentCard
- [ ] AssignmentList
- [ ] AssignmentDetail
- [ ] SubmissionForm
- [ ] SubmissionsList
- [ ] GradingPanel
- [ ] GradeInput
- [ ] FeedbackPanel

#### **Notification Components**
- [ ] NotificationBell
- [ ] NotificationBadge
- [ ] NotificationList
- [ ] NotificationItem
- [ ] NotificationFilters

#### **Chat Components**
- [ ] ChatWindow
- [ ] ChatHeader
- [ ] MessageList
- [ ] MessageItem
- [ ] MessageInput
- [ ] OnlineUsers
- [ ] TypingIndicator
- [ ] EmojiPicker

#### **Live Stream Components**
- [ ] LiveStreamPlayer
- [ ] LiveStreamControls
- [ ] LiveStreamChat
- [ ] SessionCard
- [ ] SessionCreator
- [ ] SessionsList

#### **Analytics Components**
- [ ] StatsCard
- [ ] LineChart
- [ ] BarChart
- [ ] PieChart / DonutChart
- [ ] AreaChart
- [ ] HeatMap (optional)
- [ ] MetricCard
- [ ] ProgressChart

#### **Category Components**
- [ ] CategoryCard
- [ ] CategoryList
- [ ] CategoryTree
- [ ] CategoryPills (filter)
- [ ] CategoryForm

---

## 9. IMPLEMENTATION CHECKLIST

### ✅ Phase 1: Foundation (Week 1-2)
- [ ] Project setup & configuration
- [ ] React Query setup
- [ ] Axios interceptors
- [ ] Auth system complete
- [ ] Routing system
- [ ] Base UI components (20+ components)
- [ ] Layouts (Auth, Main)

### ✅ Phase 2: Student Features (Week 3-5)
- [ ] Student dashboard
- [ ] Course catalog & browse
- [ ] Course detail & enrollment
- [ ] Learning interface
- [ ] Quiz system
- [ ] Assignment system
- [ ] Profile & settings
- [ ] Notifications
- [ ] My courses page

### ✅ Phase 3: Instructor Features (Week 6-8)
- [ ] Instructor dashboard
- [ ] Course management
- [ ] Curriculum builder
- [ ] Quiz management
- [ ] Assignment management
- [ ] Student management
- [ ] Grades management
- [ ] Analytics
- [ ] Live stream

### ✅ Phase 4: Admin Features (Week 9-10)
- [ ] Admin dashboard
- [ ] User management
- [ ] Course management (admin)
- [ ] Category management
- [ ] System settings
- [ ] Reports & analytics

### ✅ Phase 5: Advanced Features (Week 11-12)
- [ ] Chat system (real-time)
- [ ] Real-time notifications
- [ ] File management
- [ ] Search & recommendations
- [ ] i18n completion
- [ ] Accessibility
- [ ] Responsive design polish

---

## 10. TESTING STRATEGY

### 10.1. Unit Testing
- [ ] Setup Vitest (or Jest)
- [ ] Test utility functions
- [ ] Test custom hooks
- [ ] Test API services
- [ ] Test Zustand stores

### 10.2. Component Testing
- [ ] Setup React Testing Library
- [ ] Test UI components
- [ ] Test forms
- [ ] Test user interactions

### 10.3. Integration Testing
- [ ] Test API integrations
- [ ] Test auth flows
- [ ] Test enrollment flows
- [ ] Test quiz submission
- [ ] Test file uploads

### 10.4. E2E Testing (Optional)
- [ ] Setup Playwright or Cypress
- [ ] Critical user journeys:
  - Register → Login → Enroll → Learn
  - Instructor: Create course → Add lessons
  - Admin: Manage users

### 10.5. Manual Testing Checklist
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Security testing

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1. Code Splitting
- [ ] Lazy load routes
- [ ] Lazy load heavy components (video player, charts)
- [ ] Dynamic imports

### 11.2. Image Optimization
- [ ] Use WebP format
- [ ] Lazy load images
- [ ] Responsive images
- [ ] Image CDN (optional)

### 11.3. Bundle Optimization
- [ ] Analyze bundle size (vite-bundle-visualizer)
- [ ] Tree-shaking
- [ ] Minimize dependencies
- [ ] Code splitting strategies

### 11.4. React Optimization
- [ ] Memoization (React.memo, useMemo, useCallback)
- [ ] Avoid unnecessary re-renders
- [ ] Virtualization for long lists (react-virtual)
- [ ] Optimize context usage

### 11.5. React Query Optimization
- [ ] Set appropriate staleTime
- [ ] Set appropriate cacheTime
- [ ] Prefetch data (on hover, on mount)
- [ ] Invalidate queries smartly
- [ ] Use optimistic updates

### 11.6. Network Optimization
- [ ] API response caching
- [ ] Debounce search inputs
- [ ] Throttle scroll/resize handlers
- [ ] Compress API responses (gzip)
- [ ] Use CDN for static assets

---

## 12. DEPLOYMENT & DEVOPS

### 12.1. Build Configuration
- [ ] Production build với Vite
- [ ] Environment variables
- [ ] Source maps (disable in prod)
- [ ] Minification
- [ ] Compression (gzip, brotli)

### 12.2. Hosting Options
- [ ] Vercel (recommended)
- [ ] Netlify
- [ ] AWS S3 + CloudFront
- [ ] Docker + Nginx
- [ ] Custom server

### 12.3. CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Build on commit
- [ ] Run tests
- [ ] Lint & type-check
- [ ] Auto-deploy on merge to main

### 12.4. Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Performance monitoring (Lighthouse CI)
- [ ] Uptime monitoring

### 12.5. Security
- [ ] HTTPS enforced
- [ ] Content Security Policy (CSP)
- [ ] CORS configuration
- [ ] Sanitize user inputs
- [ ] Secure token storage
- [ ] Rate limiting (backend)

---

## 13. DOCUMENTATION

### 13.1. Code Documentation
- [ ] JSDoc comments cho functions
- [ ] README.md comprehensive
- [ ] Component documentation (Storybook optional)
- [ ] API documentation link

### 13.2. User Documentation
- [ ] User guide (Student)
- [ ] User guide (Instructor)
- [ ] User guide (Admin)
- [ ] FAQ
- [ ] Video tutorials (optional)

### 13.3. Developer Documentation
- [ ] Setup guide
- [ ] Architecture overview
- [ ] Coding standards
- [ ] Git workflow
- [ ] Deployment guide

---

## 14. MAINTENANCE & ITERATION

### 14.1. Post-Launch
- [ ] Monitor errors & performance
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Security patches

### 14.2. Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Gamification (badges, leaderboards)
- [ ] Advanced analytics
- [ ] AI recommendations
- [ ] Payment integration (Stripe, PayPal)
- [ ] Certificate generation
- [ ] Social features (forums, groups)
- [ ] Advanced search (Elasticsearch)
- [ ] Multi-language content (not just UI)

---

## 🎉 CONCLUSION

Kế hoạch refactor này cung cấp một lộ trình chi tiết, từng bước để xây dựng một ứng dụng frontend LMS hoàn chỉnh, chuyên nghiệp và sẵn sàng cho production.

### Key Takeaways:
1. **Phát triển theo phases** để dễ quản lý và test
2. **Component-driven approach** với reusable components
3. **Type-safe** với TypeScript
4. **Optimized performance** với React Query caching
5. **Real-time features** với Socket.IO
6. **Role-based access** cho Student/Instructor/Admin
7. **Internationalization** sẵn sàng (vi/en)
8. **Responsive & Accessible** cho tất cả users

### Estimated Timeline:
- **Phase 1-2:** 5 weeks (Foundation + Student)
- **Phase 3:** 3 weeks (Instructor)
- **Phase 4:** 2 weeks (Admin)
- **Phase 5:** 2 weeks (Advanced)
- **Total:** ~12 weeks (3 months) cho 1 developer

Nếu có team, có thể song song và giảm timeline xuống ~6-8 weeks.

### Next Steps:
1. Review kế hoạch này với team
2. Thiết lập project board (Jira, Trello, GitHub Projects)
3. Phân chia tasks cho team members
4. Bắt đầu Phase 1!

**Good luck! 🚀**

---

**Liên hệ với backend developers để:**
- Xác nhận API endpoints
- Test API responses
- Coordinate WebSocket events
- Sync data models/types
