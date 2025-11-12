/**
 * Application Route Constants
 * 
 * Tập trung tất cả route paths để dễ quản lý và avoid hardcoding
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  TWO_FACTOR: '/2fa',
  
  // Course catalog (public)
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  
  // Student routes
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    MY_COURSES: '/student/my-courses',
    LEARNING: '/student/courses/:courseId/learn',
    LESSON: '/student/courses/:courseId/lessons/:lessonId',
    QUIZ: '/student/courses/:courseId/quizzes/:quizId',
    QUIZ_RESULTS: '/student/quizzes/:attemptId/results',
    ASSIGNMENT: '/student/courses/:courseId/assignments/:assignmentId',
    PROFILE: '/student/profile',
    SETTINGS: '/student/settings',
    NOTIFICATIONS: '/student/notifications',
  },
  
  // Instructor routes
  INSTRUCTOR: {
    DASHBOARD: '/instructor/dashboard',
    MY_COURSES: '/instructor/my-courses',
    COURSE_CREATE: '/instructor/courses/create',
    COURSE_EDIT: '/instructor/courses/:courseId/edit',
    CURRICULUM: '/instructor/courses/:courseId/curriculum',
    COURSE_STUDENTS: '/instructor/courses/:courseId/students',
    QUIZ_BUILDER: '/instructor/courses/:courseId/quizzes/create',
    QUIZ_EDIT: '/instructor/quizzes/:quizId/edit',
    QUIZ_ATTEMPTS: '/instructor/quizzes/:quizId/attempts',
    ASSIGNMENT_CREATE: '/instructor/courses/:courseId/assignments/create',
    ASSIGNMENT_EDIT: '/instructor/assignments/:assignmentId/edit',
    SUBMISSIONS: '/instructor/assignments/:assignmentId/submissions',
    GRADES: '/instructor/courses/:courseId/grades',
    ANALYTICS: '/instructor/analytics',
    LIVESTREAM: '/instructor/livestream',
    LIVESTREAM_CREATE: '/instructor/livestream/create',
    LIVESTREAM_HOST: '/instructor/livestream/:sessionId/host',
    LIVESTREAM_SESSION: '/instructor/livestream/:sessionId',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:userId',
    COURSES: '/admin/courses',
    COURSE_DETAIL: '/admin/courses/:courseId',
    CATEGORIES: '/admin/categories',
    SYSTEM_SETTINGS: '/admin/settings',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
  },
  
  // Common routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/403',
} as const;

/**
 * Helper functions to generate routes with parameters
 */
export const generateRoute = {
  courseDetail: (id: number | string) => `/courses/${id}`,
  
  student: {
    learning: (courseId: number | string) => `/student/courses/${courseId}/learn`,
    lesson: (courseId: number | string, lessonId: number | string) => 
      `/student/courses/${courseId}/lessons/${lessonId}`,
    quiz: (quizId: number | string) => `/student/quizzes/${quizId}`,
    quizAttempt: (quizId: number | string, attemptId: number | string) => 
      `/student/quizzes/${quizId}/attempt/${attemptId}`,
    assignment: (assignmentId: number | string) => `/student/assignments/${assignmentId}`,
  },
  
  instructor: {
    courseEdit: (courseId: number | string) => `/instructor/courses/${courseId}/edit`,
    courseStudents: (courseId: number | string) => `/instructor/courses/${courseId}/students`,
    quizCreate: (courseId: number | string) => `/instructor/courses/${courseId}/quizzes/create`,
    quizEdit: (quizId: number | string) => `/instructor/quizzes/${quizId}/edit`,
    quizAttempts: (quizId: number | string) => `/instructor/quizzes/${quizId}/attempts`,
    assignmentCreate: (courseId: number | string) => 
      `/instructor/courses/${courseId}/assignments/create`,
    assignmentEdit: (assignmentId: number | string) => 
      `/instructor/assignments/${assignmentId}/edit`,
    submissions: (assignmentId: number | string) => 
      `/instructor/assignments/${assignmentId}/submissions`,
    courseGrades: (courseId: number | string) => `/instructor/courses/${courseId}/grades`,
    livestreamSession: (sessionId: number | string) => `/instructor/livestream/${sessionId}`,
  },
  
  admin: {
    userDetail: (userId: number | string) => `/admin/users/${userId}`,
    courseDetail: (courseId: number | string) => `/admin/courses/${courseId}`,
  },
};

export default ROUTES;
