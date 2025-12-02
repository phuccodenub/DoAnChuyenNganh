/**
 * useRoleBasedNavigation Hook
 * 
 * Hook để navigation dựa trên role của user.
 * Giải quyết vấn đề "nhảy role" giữa admin và instructor.
 * 
 * === HYBRID MODEL ===
 * - Admin và Instructor có thể chia sẻ chức năng quản lý khóa học
 * - Mỗi role ở trong workspace riêng (/admin/* hoặc /instructor/*)
 * - Hook này tự động chọn route phù hợp với role hiện tại
 * 
 * @example
 * const { navigateTo, routes } = useRoleBasedNavigation();
 * 
 * // Navigate về danh sách khóa học (tự động chọn route đúng)
 * navigateTo.myCourses();
 * 
 * // Navigate đến chi tiết khóa học
 * navigateTo.courseDetail(courseId);
 * 
 * // Lấy route string để dùng với Link
 * <Link to={routes.myCourses}>Khóa học của tôi</Link>
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from './useRole';
import {
  isAdminRole,
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
  getDashboardByRole,
} from '@/utils/navigation';

export function useRoleBasedNavigation() {
  const navigate = useNavigate();
  const { role, isAdmin, isInstructor } = useRole();

  // Memoized route getters
  const routes = useMemo(() => ({
    // Dashboard
    dashboard: getDashboardByRole(role),
    
    // Course management
    myCourses: getMyCoursesRoute(role),
    courseCreate: getCourseCreateRoute(role),
    
    // Route generators (cần courseId)
    courseDetail: (courseId: string) => getCourseDetailRoute(courseId, role),
    courseEdit: (courseId: string) => getCourseEditRoute(courseId, role),
    courseCurriculum: (courseId: string) => getCourseCurriculumRoute(courseId, role),
    quizCreate: (courseId: string) => getQuizCreateRoute(courseId, role),
    assignmentCreate: (courseId: string) => getAssignmentCreateRoute(courseId, role),
    grades: (courseId: string) => getGradesRoute(courseId, role),
    
    // Livestream
    livestream: getLivestreamRoute(role),
    livestreamCreate: getLivestreamCreateRoute(role),
  }), [role]);

  // Navigation functions
  const navigateTo = useMemo(() => ({
    // Dashboard
    dashboard: () => navigate(routes.dashboard),
    
    // Course management
    myCourses: () => navigate(routes.myCourses),
    courseCreate: () => navigate(routes.courseCreate),
    courseDetail: (courseId: string) => navigate(routes.courseDetail(courseId)),
    courseEdit: (courseId: string) => navigate(routes.courseEdit(courseId)),
    courseCurriculum: (courseId: string) => navigate(routes.courseCurriculum(courseId)),
    quizCreate: (courseId: string) => navigate(routes.quizCreate(courseId)),
    assignmentCreate: (courseId: string) => navigate(routes.assignmentCreate(courseId)),
    grades: (courseId: string) => navigate(routes.grades(courseId)),
    
    // Livestream
    livestream: () => navigate(routes.livestream),
    livestreamCreate: () => navigate(routes.livestreamCreate),
  }), [navigate, routes]);

  // Helper to check if current role can perform certain actions
  const canPerform = useMemo(() => ({
    // Admin không tạo khóa học/quiz/assignment
    createCourse: isInstructor,
    createQuiz: isInstructor,
    createAssignment: isInstructor,
    
    // Cả admin và instructor có thể xem/edit khóa học
    viewCourse: isAdmin || isInstructor,
    editCourse: isAdmin || isInstructor,
    
    // Admin không host livestream (tùy business logic)
    hostLivestream: isInstructor,
  }), [isAdmin, isInstructor]);

  return {
    // Current role info
    role,
    isAdmin,
    isInstructor,
    isAdminRole: isAdminRole(role),
    
    // Route strings for <Link to={...}>
    routes,
    
    // Navigation functions for programmatic navigation
    navigateTo,
    
    // Permission checks
    canPerform,
  };
}

export default useRoleBasedNavigation;
