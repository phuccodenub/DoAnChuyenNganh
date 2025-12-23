/**
 * Navigation Utilities
 * 
 * Helper functions for routing and navigation across the application.
 * Centralized logic to ensure consistent navigation behavior.
 * 
 * === HYBRID MODEL FOR LMS ===
 * Mô hình Hybrid kết hợp:
 * 1. Resource-Centric: Tài nguyên chung (courses, lessons) được quản lý bởi cả admin & instructor
 * 2. Role-Centric: Mỗi role có workspace riêng với UI/UX phù hợp
 * 
 * Admin và Instructor có thể CHIA SẺ chức năng quản lý khóa học, nhưng mỗi role
 * sẽ ở trong WORKSPACE riêng của mình (/admin/* hoặc /instructor/*)
 */

import { ROUTES, generateRoute } from '@/constants/routes';
import type { User } from '@/stores/authStore.enhanced';

type UserRole = User['role'];

/**
 * Check if user has admin role (admin or super_admin)
 */
export const isAdminRole = (role?: UserRole | null): boolean => {
  return role === 'admin' || role === 'super_admin';
};

/**
 * Check if user has instructor role
 */
export const isInstructorRole = (role?: UserRole | null): boolean => {
  return role === 'instructor';
};

/**
 * Check if user can manage courses (admin, super_admin, or instructor)
 */
export const canManageCourses = (role?: UserRole | null): boolean => {
  return isAdminRole(role) || isInstructorRole(role);
};

// ============================================================
// ROLE-BASED ROUTE GENERATORS
// Các hàm này trả về route phù hợp với role của user
// ============================================================

/**
 * Get the appropriate "My Courses" route based on role
 * Admin: /admin/courses
 * Instructor: /instructor/my-courses
 */
export const getMyCoursesRoute = (role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return ROUTES.ADMIN.COURSES;
  }
  return ROUTES.INSTRUCTOR.MY_COURSES;
};

/**
 * Get the appropriate course detail route based on role
 * Admin: /admin/courses/:courseId (view only, no assignments/grades)
 * Instructor: /instructor/courses/:courseId (full management)
 */
export const getCourseDetailRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return generateRoute.admin.courseDetail(courseId);
  }
  return generateRoute.instructor.courseDetail(courseId);
};

/**
 * Get the appropriate course edit route based on role
 */
export const getCourseEditRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return generateRoute.admin.courseEdit(courseId);
  }
  return generateRoute.instructor.courseEdit(courseId);
};

/**
 * Get the appropriate curriculum route based on role
 */
export const getCourseCurriculumRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return generateRoute.admin.courseCurriculum(courseId);
  }
  return generateRoute.instructor.curriculum(courseId);
};

/**
 * Get the appropriate course create route based on role
 * Note: Admin typically doesn't create courses, but navigates to admin dashboard
 */
export const getCourseCreateRoute = (role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    // Admin không tạo khóa học, redirect về danh sách
    return ROUTES.ADMIN.COURSES;
  }
  return ROUTES.INSTRUCTOR.COURSE_CREATE;
};

/**
 * Get the appropriate quiz create route based on role
 * Admin: redirect to admin courses (không có quyền tạo quiz)
 * Instructor: /instructor/courses/:courseId/quizzes/create
 */
export const getQuizCreateRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    // Admin không tạo quiz, redirect về chi tiết khóa học
    return generateRoute.admin.courseDetail(courseId);
  }
  return generateRoute.instructor.quizCreate(courseId);
};

/**
 * Get the appropriate assignment create route based on role
 */
export const getAssignmentCreateRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return generateRoute.admin.courseDetail(courseId);
  }
  return generateRoute.instructor.assignmentCreate(courseId);
};

/**
 * Get the appropriate grades route based on role
 */
export const getGradesRoute = (courseId: string, role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    return generateRoute.admin.courseDetail(courseId);
  }
  return generateRoute.instructor.courseGrades(courseId);
};

/**
 * Get the appropriate livestream management route based on role
 * Both admin and instructor can manage livestreams.
 *
 * NOTE:
 * - Ban đầu admin bị redirect về dashboard để tránh vào workspace instructor.
 * - Tuy nhiên, UI quản lý livestream hiện tại chỉ tồn tại ở phía instructor.
 * - Để admin vẫn dùng được full tính năng livestream, ta cho admin dùng chung
 *   route `/instructor/livestream` thay vì đẩy về `/admin/dashboard`.
 */
export const getLivestreamRoute = (role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    // Admin dùng chung trang quản lý livestream với instructor
    return ROUTES.INSTRUCTOR.LIVESTREAM;
  }
  return ROUTES.INSTRUCTOR.LIVESTREAM;
};

/**
 * Get the appropriate livestream create route based on role
 */
export const getLivestreamCreateRoute = (role?: UserRole | null): string => {
  if (isAdminRole(role)) {
    // Admin dùng chung trang tạo livestream với instructor
    return ROUTES.INSTRUCTOR.LIVESTREAM_CREATE;
  }
  return ROUTES.INSTRUCTOR.LIVESTREAM_CREATE;
};

// ============================================================
// ROLE-BASED NAVIGATION OBJECT
// Object tập trung tất cả role-aware routes
// ============================================================

export const roleBasedRoutes = {
  myCourses: getMyCoursesRoute,
  courseDetail: getCourseDetailRoute,
  courseEdit: getCourseEditRoute,
  courseCurriculum: getCourseCurriculumRoute,
  courseCreate: getCourseCreateRoute,
  quizCreate: getQuizCreateRoute,
  assignmentCreate: getAssignmentCreateRoute,
  grades: getGradesRoute,
  livestream: getLivestreamRoute,
  livestreamCreate: getLivestreamCreateRoute,
};

/**
 * Get the appropriate dashboard route based on user role
 * 
 * @param role - The user's role (student, instructor, admin, super_admin)
 * @returns The dashboard route path for the given role
 * 
 * @example
 * const dashboard = getDashboardByRole('instructor');
 * // Returns: '/instructor/dashboard'
 */
export const getDashboardByRole = (role?: UserRole | null): string => {
  if (!role) {
    return ROUTES.STUDENT.DASHBOARD;
  }

  switch (role) {
    case 'admin':
    case 'super_admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'instructor':
      return ROUTES.INSTRUCTOR.DASHBOARD;
    case 'student':
    default:
      return ROUTES.STUDENT.DASHBOARD;
  }
};

/**
 * Build a URL with query parameters from the base route
 * 
 * @param baseUrl - The base URL path
 * @param params - Object containing query parameters
 * @returns URL string with query parameters appended
 * 
 * @example
 * buildUrlWithParams(ROUTES.COURSES, { category: 'web-dev', level: 'beginner' });
 * // Returns: '/courses?category=web-dev&level=beginner'
 */
export const buildUrlWithParams = (
  baseUrl: string, 
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return baseUrl;
  
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  
  if (Object.keys(filteredParams).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams(filteredParams);
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Check if the current path matches a given route pattern
 * Handles dynamic route segments like :id, :courseId, etc.
 * 
 * @param currentPath - The current browser path
 * @param routePattern - The route pattern to match against
 * @returns True if the path matches the pattern
 * 
 * @example
 * isRouteMatch('/courses/123', '/courses/:id');
 * // Returns: true
 */
export const isRouteMatch = (currentPath: string, routePattern: string): boolean => {
  // Convert route pattern to regex
  const regexPattern = routePattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/'); // Escape slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPath);
};

/**
 * Get the home route for authenticated users based on their role
 * This is used after successful login/register
 */
export const getHomeRouteByRole = getDashboardByRole;

/**
 * Get the landing page route for unauthenticated users
 */
export const getLandingRoute = (): string => ROUTES.LANDING_PAGE;

/**
 * Get the login route with optional redirect parameter
 */
export const getLoginRoute = (redirectTo?: string): string => {
  if (redirectTo) {
    return buildUrlWithParams(ROUTES.LOGIN, { redirect: redirectTo });
  }
  return ROUTES.LOGIN;
};

export default {
  // Role checking
  isAdminRole,
  isInstructorRole,
  canManageCourses,
  // Dashboard routes
  getDashboardByRole,
  getHomeRouteByRole,
  // Role-based routes
  roleBasedRoutes,
  getMyCoursesRoute,
  getCourseDetailRoute,
  getCourseEditRoute,
  getCourseCurriculumRoute,
  getCourseCreateRoute,
  getQuizCreateRoute,
  getAssignmentCreateRoute,
  getGradesRoute,
  getLivestreamRoute,
  getLivestreamCreateRoute,
  // Utility functions
  buildUrlWithParams,
  isRouteMatch,
  getLandingRoute,
  getLoginRoute,
};
