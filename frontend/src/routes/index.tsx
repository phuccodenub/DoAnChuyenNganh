import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Spinner';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { ROUTES } from '@/constants/routes';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Public course pages
const HomePage = lazy(() => import('@/pages/HomePage/index'));
const Home = lazy(() => import('@/pages/Home/index'));
const CourseCatalogPage = lazy(() => import('@/pages/CourseCatalogPage'));
const CourseDetailPage = lazy(() => import('@/pages/CourseDetailPage'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/DashboardPage'));
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
const LiveStreamManagementPage = lazy(() => import('@/pages/instructor/LiveStreamManagementPage'));
const CreateLiveStreamPage = lazy(() => import('@/pages/instructor/CreateLiveStreamPage'));
const LiveStreamHostPage = lazy(() => import('@/pages/instructor/LiveStreamHostPage'));

// Admin pages
const AdminDashboardLayout = lazy(() => import('@/layouts/AdminDashboardLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const CourseManagementPage = lazy(() => import('@/pages/admin/CourseManagementPage'));
const CategoryManagementPage = lazy(() => import('@/pages/admin/CategoryManagementPage'));

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
        
        {/* Protected routes - Cần authentication */}
        <Route element={<ProtectedRoute />}>
          {/* Student routes */}
          <Route element={<RoleGuard allowedRoles={['student']} />}>
            <Route path={ROUTES.STUDENT.DASHBOARD} element={<StudentDashboard />} />
            <Route path={ROUTES.STUDENT.MY_COURSES} element={<StudentDashboard />} />
            <Route path={ROUTES.STUDENT.LEARNING} element={<LearningPage />} />
            <Route path={ROUTES.STUDENT.QUIZ} element={<QuizPage />} />
            <Route path={ROUTES.STUDENT.QUIZ_RESULTS} element={<QuizResultsPage />} />
            <Route path={ROUTES.STUDENT.ASSIGNMENT} element={<AssignmentPage />} />
            <Route path={ROUTES.STUDENT.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.STUDENT.SETTINGS} element={<SettingsPage />} />
          </Route>
          
          {/* Instructor routes */}
          <Route element={<RoleGuard allowedRoles={['instructor']} />}>
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
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM} element={<LiveStreamManagementPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_CREATE} element={<CreateLiveStreamPage />} />
              <Route path={ROUTES.INSTRUCTOR.LIVESTREAM_HOST} element={<LiveStreamHostPage />} />
            </Route>
          </Route>
          
          {/* Admin routes */}
          <Route element={<RoleGuard allowedRoles={['admin', 'super_admin']} />}>
            <Route element={<AdminDashboardLayout />}>
              <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN.USERS} element={<UserManagementPage />} />
              <Route path={ROUTES.ADMIN.COURSES} element={<CourseManagementPage />} />
              <Route path={ROUTES.ADMIN.CATEGORIES} element={<CategoryManagementPage />} />
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
