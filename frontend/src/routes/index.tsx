import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ROUTES, generateRoute } from '@/constants/routes';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Public course pages
const HomePage = lazy(() => import('@/pages/HomePage/index'));
const Home = lazy(() => import('@/pages/Home/index'));
const CourseCatalogPage = lazy(() => import('@/pages/CourseCatalogPage'));
const CourseDetailPage = lazy(() => import('@/pages/CourseDetailPage'));
const LiveStreamLobbyPage = lazy(() => import('@/pages/livestream/lobby/LobbyPage'));
const LiveStreamSessionPage = lazy(() => import('@/pages/livestream/session/SessionPage'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/DashboardPage'));
const StudentMyCoursesPage = lazy(() => import('@/pages/student/MyCoursesPage'));
const StudentAssignmentsPage = lazy(() => import('@/pages/student/StudentAssignmentsPage'));
const LearningPage = lazy(() => import('@/pages/student/LearningPage'));
const QuizPage = lazy(() => import('@/pages/student/QuizPage'));
const QuizResultsPage = lazy(() => import('@/pages/student/QuizResultsPage'));
const AssignmentPage = lazy(() => import('@/pages/student/AssignmentPage'));
const ProfilePage = lazy(() => import('@/pages/student/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/student/SettingsPage'));

// Instructor pages
const InstructorDashboardLayout = lazy(() => import('@/layouts/InstructorDashboardLayout'));
const InstructorDashboard = lazy(() => import('@/pages/instructor/DashboardPage'));
const MyCoursesPage = lazy(() => import('@/pages/instructor/MyCoursesPage'));
const CourseEditorPage = lazy(() => import('@/pages/instructor/CourseEditorPage'));
const CurriculumBuilderPage = lazy(() => import('@/pages/instructor/CurriculumBuilderPage'));
const QuizBuilderPage = lazy(() => import('@/pages/instructor/QuizBuilderPage'));
const AssignmentBuilderPage = lazy(() => import('@/pages/instructor/AssignmentBuilderPage'));
const GradingPage = lazy(() => import('@/pages/instructor/GradingPage'));
const StudentManagementPage = lazy(() => import('@/pages/instructor/StudentManagementPage'));
const ManagementPage = lazy(() => import('@/pages/livestream/management/ManagementPage'));
const CreateLiveStreamPage = lazy(() => import('@/pages/livestream/create/CreatePage'));

// Admin pages
const AdminDashboardLayout = lazy(() => import('@/layouts/AdminDashboardLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const CourseManagementPage = lazy(() => import('@/pages/admin/CourseManagementPage'));
const CategoryManagementPage = lazy(() => import('@/pages/admin/CategoryManagementPage'));
const SystemSettingsPage = lazy(() => import('@/pages/admin/SystemSettingsPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const ActivityLogsPage = lazy(() => import('@/pages/admin/ActivityLogsPage'));

// Auth pages (Batch 9)
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const TwoFactorSetupPage = lazy(() => import('@/pages/auth/TwoFactorSetupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const NotificationsPage = lazy(() => import('@/pages/student/NotificationsPage'));

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
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.COURSES} element={<CourseCatalogPage />} />
        <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />

        {/* Auth routes - Public (no authentication required) */}
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.TWO_FACTOR} element={<TwoFactorSetupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        
        {/* Temporary Public Learning Route - ONLY FOR TESTING UI */}
        <Route path={ROUTES.STUDENT.LEARNING} element={<LearningPage />} />

        {/* Protected routes - Cần authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Shared livestream hub */}
          <Route path={ROUTES.LIVESTREAM.HUB} element={<LiveStreamLobbyPage />} />
          <Route path={ROUTES.LIVESTREAM.SESSION} element={<LiveStreamSessionPage />} />
          <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_SESSION} element={<InstructorLivestreamRedirect />} />

          {/* Student routes */}
          <Route element={<RoleGuard allowedRoles={['student']} />}>
            <Route path={ROUTES.STUDENT.DASHBOARD} element={<StudentDashboard />} />
            <Route path={ROUTES.STUDENT.MY_COURSES} element={<StudentMyCoursesPage />} />
            <Route path={ROUTES.STUDENT.ASSIGNMENTS} element={<StudentAssignmentsPage />} />
            <Route path={ROUTES.STUDENT.QUIZ} element={<QuizPage />} />
            <Route path={ROUTES.STUDENT.QUIZ_RESULTS} element={<QuizResultsPage />} />
            <Route path={ROUTES.STUDENT.ASSIGNMENT} element={<AssignmentPage />} />
            <Route path={ROUTES.STUDENT.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.STUDENT.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.STUDENT.NOTIFICATIONS} element={<NotificationsPage />} />
          </Route>
          
          {/* Instructor & Admin routes (admin cũng có thể host livestream) */}
          <Route element={<RoleGuard allowedRoles={['instructor', 'admin']} />}>
            <Route element={<InstructorDashboardLayout />}>
              <Route path={ROUTES.INSTRUCTOR.DASHBOARD} element={<InstructorDashboard />} />
              <Route path={ROUTES.INSTRUCTOR.MY_COURSES} element={<MyCoursesPage />} />
              <Route path={ROUTES.INSTRUCTOR.COURSE_EDIT} element={<CourseEditorPage />} />
              <Route path={ROUTES.INSTRUCTOR.COURSE_CREATE} element={<CourseEditorPage />} />
              <Route path={ROUTES.INSTRUCTOR.CURRICULUM} element={<CurriculumBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.QUIZ_BUILDER} element={<QuizBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.QUIZ_EDIT} element={<QuizBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.ASSIGNMENT_CREATE} element={<AssignmentBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.ASSIGNMENT_EDIT} element={<AssignmentBuilderPage />} />
              <Route path={ROUTES.INSTRUCTOR.GRADES} element={<GradingPage />} />
              <Route path="/instructor/students" element={<StudentManagementPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM} element={<ManagementPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_CREATE} element={<CreateLiveStreamPage />} />
            </Route>
          </Route>
          
          {/* Admin routes */}
          <Route element={<RoleGuard allowedRoles={['admin', 'super_admin']} />}>
            <Route element={<AdminDashboardLayout />}>
              <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN.USERS} element={<UserManagementPage />} />
              <Route path={ROUTES.ADMIN.COURSES} element={<CourseManagementPage />} />
              <Route path={ROUTES.ADMIN.CATEGORIES} element={<CategoryManagementPage />} />
              <Route path={ROUTES.ADMIN.SYSTEM_SETTINGS} element={<SystemSettingsPage />} />
              <Route path={ROUTES.ADMIN.REPORTS} element={<ReportsPage />} />
              <Route path={ROUTES.ADMIN.ACTIVITY_LOGS} element={<ActivityLogsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
