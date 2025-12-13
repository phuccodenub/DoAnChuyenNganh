import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ROUTES, generateRoute } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));

// Shared pages (accessible by all authenticated users)
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));

// Public course pages
const HomePage = lazy(() => import('@/pages/HomePage/index'));
const CourseCatalogPage = lazy(() => import('@/pages/course/catalog/CatalogPage'));
const CourseDetailPage = lazy(() => import('@/pages/course/detail/DetailPage'));
const LiveStreamLobbyPage = lazy(() => import('@/pages/livestream/lobby/LobbyPage'));
const LiveStreamSessionPage = lazy(() => import('@/pages/livestream/session/SessionPage'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/DashboardPage'));
const StudentMyCoursesPage = lazy(() => import('@/pages/student/MyCoursesPage'));
const StudentAssignmentsPage = lazy(() => import('@/pages/student/StudentAssignmentsPage'));
const LearningPage = lazy(() => import('@/pages/student/LearningPage'));
const LessonDetailPage = lazy(() => import('@/pages/course/learning/LessonDetailPage'));
const QuizPage = lazy(() => import('@/pages/student/QuizPage'));
const QuizResultsPage = lazy(() => import('@/pages/student/QuizResultsPage'));
const AssignmentPage = lazy(() => import('@/pages/student/AssignmentPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Instructor pages
const InstructorDashboardLayout = lazy(() => import('@/layouts/InstructorDashboardLayout'));
const InstructorDashboard = lazy(() => import('@/pages/instructor/DashboardPage'));
const MyCoursesPage = lazy(() => import('@/pages/instructor/InstructorMyCoursesPage'));
const InstructorCourseDetailPage = lazy(() => import('@/pages/instructor/InstructorCourseDetailPage'));
const CourseEditorPage = lazy(() => import('@/pages/instructor/CourseEditorPage'));
const CurriculumBuilderPage = lazy(() => import('@/pages/instructor/CurriculumBuilderPage'));
const CourseManagementDetailPage = lazy(() => import('@/pages/course/management/CourseManagementDetailPage'));
const QuizBuilderPage = lazy(() => import('@/pages/instructor/QuizBuilderPage'));
const AssignmentBuilderPage = lazy(() => import('@/pages/instructor/AssignmentBuilderPage'));
const GradingPage = lazy(() => import('@/pages/instructor/GradingPage'));
const StudentManagementPage = lazy(() => import('@/pages/instructor/StudentManagementPage'));
const ManagementPage = lazy(() => import('@/pages/livestream/management/ManagementPage'));
const CreateLiveStreamPage = lazy(() => import('@/pages/livestream/create/CreatePage'));
const LiveStreamHostPage = lazy(() => import('@/pages/livestream/host/HostPage'));
const InstructorAnalyticsPage = lazy(() => import('@/pages/instructor/AnalyticsPage'));

// Admin pages
const AdminDashboardLayout = lazy(() => import('@/layouts/AdminDashboardLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const CourseManagementPage = lazy(() => import('@/pages/admin/CourseManagementPage'));
const CategoryManagementPage = lazy(() => import('@/pages/admin/CategoryManagementPage'));
const SystemSettingsPage = lazy(() => import('@/pages/admin/SystemSettingsPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const ActivityLogsPage = lazy(() => import('@/pages/admin/ActivityLogsPage'));
const NotificationManagementPage = lazy(() => import('@/pages/admin/NotificationManagementPage'));

// Auth pages (Batch 9)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const TwoFactorSetupPage = lazy(() => import('@/pages/auth/TwoFactorSetupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage'));
const InstructorNotificationsPage = lazy(() => import('@/pages/instructor/CourseNotificationPage'));

// Certificate pages
const CertificateDetailPage = lazy(() => import('@/pages/certificates/CertificateDetailPage'));
const CertificateVerifyPage = lazy(() => import('@/pages/certificates/CertificateVerifyPage'));

const InstructorLivestreamRedirect = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!sessionId) {
    return <Navigate to={ROUTES.NOT_FOUND} replace />;
  }
  return <Navigate to={generateRoute.livestream.session(sessionId)} replace />;
};

/**
 * Main Application Routes
 *
 * Tổ chức routes theo:
 * - Public routes (Home, Login, Register, Courses)
 * - Protected routes (cần authentication)
 * - Role-based routes (Student, Instructor, Admin)
 */
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes - temporarily removed auth until implemented */}
        <Route path={ROUTES.LANDING_PAGE} element={<HomePage />} />
        {/* NOTE: /home route removed - using / as single entry point for unauthenticated users */}
        <Route path={ROUTES.COURSES} element={<CourseCatalogPage />} />
        <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
        
        {/* Certificate routes (Public) */}
        <Route path={ROUTES.CERTIFICATES_VERIFY} element={<CertificateVerifyPage />} />

        {/* Auth routes - Public (no authentication required) */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.TWO_FACTOR} element={<TwoFactorSetupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Protected routes - Cần authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Shared routes - Accessible by all authenticated users */}
          <Route path={ROUTES.SHARED.MESSAGES} element={<MessagesPage />} />
          <Route path={ROUTES.SHARED.MESSAGES_DETAIL} element={<MessagesPage />} />

          {/* Shared livestream hub */}
          <Route path={ROUTES.LIVESTREAM.HUB} element={<LiveStreamLobbyPage />} />
          <Route path={ROUTES.LIVESTREAM.SESSION} element={<LiveStreamSessionPage />} />
          <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_SESSION} element={<InstructorLivestreamRedirect />} />

          {/* Universal profile route for all authenticated users */}
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          
          {/* Certificate routes (Protected) */}
          <Route path="/certificates/:id" element={<CertificateDetailPage />} />
          
          {/* Universal settings route for all authenticated users */}
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          {/* Learning routes - accessible to all authenticated users who can enroll (student, instructor, admin, super_admin) */}
          <Route element={<RoleGuard allowedRoles={['student', 'instructor', 'admin', 'super_admin']} />}>
            <Route path={ROUTES.STUDENT.LEARNING} element={<LearningPage />} />
            <Route path={ROUTES.STUDENT.LESSON} element={<LessonDetailPage />} />
          </Route>

          {/* Student-only routes (dashboard, profile, etc.) */}
          <Route element={<RoleGuard allowedRoles={['student']} />}>
            <Route path={ROUTES.STUDENT.DASHBOARD} element={<StudentDashboard />} />
            <Route path={ROUTES.STUDENT.MY_COURSES} element={<StudentMyCoursesPage />} />
            <Route path={ROUTES.STUDENT.ASSIGNMENTS} element={<StudentAssignmentsPage />} />
            {/* Settings moved to universal route */}
            <Route path={ROUTES.STUDENT.NOTIFICATIONS} element={<NotificationsPage />} />
            {/* Redirect old chat route to shared messages page */}
            <Route path={ROUTES.STUDENT.CHAT} element={<Navigate to={ROUTES.SHARED.MESSAGES} replace />} />
            {/* NOTE: PROFILE moved to universal route above - accessible to all authenticated users */}
          </Route>

          {/* Quiz & Assignment routes: cho phép cả student + instructor xem giao diện làm bài */}
          <Route element={<RoleGuard allowedRoles={['student', 'instructor', 'admin', 'super_admin']} />}>
            <Route path={ROUTES.STUDENT.QUIZ} element={<QuizPage />} />
            <Route path={ROUTES.STUDENT.QUIZ_RESULTS} element={<QuizResultsPage />} />
            <Route path={ROUTES.STUDENT.ASSIGNMENT} element={<AssignmentPage />} />
          </Route>

          {/* Livestream create route & course management & course editor */}
          {/* Cho phép instructor, admin, super_admin để admin vẫn quản lý khóa học */}
          <Route element={<RoleGuard allowedRoles={['instructor', 'admin', 'super_admin']} />}>
            <Route
              path={ROUTES.COURSE_MANAGEMENT}
              element={
                <MainLayout>
                  <MyCoursesPage />
                </MainLayout>
              }
            />
            <Route
              path={ROUTES.COURSE_MANAGEMENT_DETAIL}
              element={<CourseManagementDetailPage />}
            />
            <Route
              path={ROUTES.COURSE_CREATE}
              element={<CourseEditorPage />}
            />
            <Route
              path={ROUTES.COURSE_CURRICULUM}
              element={<CurriculumBuilderPage />}
            />
            <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_CREATE} element={<CreateLiveStreamPage />} />
          </Route>

          {/* Instructor routes - CHỈ dành cho instructor */}
          <Route element={<RoleGuard allowedRoles={['instructor']} />}>
            <Route element={<InstructorDashboardLayout />}>
              <Route path={ROUTES.INSTRUCTOR.DASHBOARD} element={<InstructorDashboard />} />
              <Route path={ROUTES.INSTRUCTOR.MY_COURSES} element={<MyCoursesPage />} />
              <Route path={ROUTES.INSTRUCTOR.COURSE_DETAIL} element={<InstructorCourseDetailPage />} />
              <Route
                path={ROUTES.INSTRUCTOR.COURSE_EDIT}
                element={<Navigate to={ROUTES.COURSE_MANAGEMENT} replace />}
              />
              <Route
                path={ROUTES.INSTRUCTOR.COURSE_CREATE}
                element={<Navigate to={ROUTES.COURSE_CREATE} replace />}
              />
              <Route
                path={ROUTES.INSTRUCTOR.CURRICULUM}
                element={<Navigate to={ROUTES.COURSE_MANAGEMENT} replace />}
              />
              <Route path={ROUTES.INSTRUCTOR.QUIZ_BUILDER} element={<QuizBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.QUIZ_EDIT} element={<QuizBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.ASSIGNMENT_CREATE} element={<AssignmentBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.ASSIGNMENT_EDIT} element={<AssignmentBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.GRADES} element={<GradingPage />} />
              <Route path={ROUTES.INSTRUCTOR.STUDENTS} element={<StudentManagementPage />} />
              <Route path={ROUTES.INSTRUCTOR.ANALYTICS} element={<InstructorAnalyticsPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM} element={<ManagementPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_HOST} element={<LiveStreamHostPage />} />
              {/* Redirect old chat route to shared messages page */}
              <Route path={ROUTES.INSTRUCTOR.CHAT} element={<Navigate to={ROUTES.SHARED.MESSAGES} replace />} />
              <Route path={ROUTES.INSTRUCTOR.NOTIFICATIONS} element={<InstructorNotificationsPage />} />
            </Route>
            {/* Livestream create page already defined above in shared route */}
          </Route>

          {/* Admin routes */}
          <Route element={<RoleGuard allowedRoles={['admin', 'super_admin']} />}>
            <Route element={<AdminDashboardLayout />}>
              <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN.USERS} element={<UserManagementPage />} />
              <Route path={ROUTES.ADMIN.COURSES} element={<CourseManagementPage />} />
              {/* Admin course management routes */}
              <Route path={ROUTES.ADMIN.COURSE_EDIT} element={<CourseEditorPage />} />
              <Route path={ROUTES.ADMIN.COURSE_CURRICULUM} element={<CurriculumBuilderPage />} />
              <Route path={ROUTES.ADMIN.CATEGORIES} element={<CategoryManagementPage />} />
              <Route path={ROUTES.ADMIN.SYSTEM_SETTINGS} element={<SystemSettingsPage />} />
              <Route path={ROUTES.ADMIN.REPORTS} element={<ReportsPage />} />
              <Route path={ROUTES.ADMIN.ACTIVITY_LOGS} element={<ActivityLogsPage />} />
              <Route path={ROUTES.ADMIN.NOTIFICATIONS} element={<NotificationManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* Error pages */}
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

        {/* 404 Not Found */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
