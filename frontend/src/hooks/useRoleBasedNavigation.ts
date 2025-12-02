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
 * ⚠️ PERFORMANCE OPTIMIZATION:
 * - Sử dụng useCallback thay vì useMemo cho navigation functions
 * - Tránh tạo object mới mỗi render
 * - Dependencies được tối ưu để giảm re-render
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

import { useCallback, useMemo, useRef } from 'react';
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
  
  // Sử dụng ref để giữ navigate function stable
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Memoized route getters - chỉ phụ thuộc vào role
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

  // ✅ Sử dụng useCallback cho từng navigation function
  // Điều này đảm bảo functions stable và không gây re-render
  const navigateToDashboard = useCallback(() => {
    navigateRef.current(getDashboardByRole(role));
  }, [role]);

  const navigateToMyCourses = useCallback(() => {
    navigateRef.current(getMyCoursesRoute(role));
  }, [role]);

  const navigateToCourseCreate = useCallback(() => {
    navigateRef.current(getCourseCreateRoute(role));
  }, [role]);

  const navigateToCourseDetail = useCallback((courseId: string) => {
    navigateRef.current(getCourseDetailRoute(courseId, role));
  }, [role]);

  const navigateToCourseEdit = useCallback((courseId: string) => {
    navigateRef.current(getCourseEditRoute(courseId, role));
  }, [role]);

  const navigateToCourseCurriculum = useCallback((courseId: string) => {
    navigateRef.current(getCourseCurriculumRoute(courseId, role));
  }, [role]);

  const navigateToQuizCreate = useCallback((courseId: string) => {
    navigateRef.current(getQuizCreateRoute(courseId, role));
  }, [role]);

  const navigateToAssignmentCreate = useCallback((courseId: string) => {
    navigateRef.current(getAssignmentCreateRoute(courseId, role));
  }, [role]);

  const navigateToGrades = useCallback((courseId: string) => {
    navigateRef.current(getGradesRoute(courseId, role));
  }, [role]);

  const navigateToLivestream = useCallback(() => {
    navigateRef.current(getLivestreamRoute(role));
  }, [role]);

  const navigateToLivestreamCreate = useCallback(() => {
    navigateRef.current(getLivestreamCreateRoute(role));
  }, [role]);

  // Navigation object với stable references
  const navigateTo = useMemo(() => ({
    dashboard: navigateToDashboard,
    myCourses: navigateToMyCourses,
    courseCreate: navigateToCourseCreate,
    courseDetail: navigateToCourseDetail,
    courseEdit: navigateToCourseEdit,
    courseCurriculum: navigateToCourseCurriculum,
    quizCreate: navigateToQuizCreate,
    assignmentCreate: navigateToAssignmentCreate,
    grades: navigateToGrades,
    livestream: navigateToLivestream,
    livestreamCreate: navigateToLivestreamCreate,
  }), [
    navigateToDashboard,
    navigateToMyCourses,
    navigateToCourseCreate,
    navigateToCourseDetail,
    navigateToCourseEdit,
    navigateToCourseCurriculum,
    navigateToQuizCreate,
    navigateToAssignmentCreate,
    navigateToGrades,
    navigateToLivestream,
    navigateToLivestreamCreate,
  ]);

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

  // Memoize toàn bộ return value
  return useMemo(() => ({
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
  }), [role, isAdmin, isInstructor, routes, navigateTo, canPerform]);
}

export default useRoleBasedNavigation;
