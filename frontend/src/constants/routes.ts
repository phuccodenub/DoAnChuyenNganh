/**
 * Application Route Constants
 * 
 * Tập trung tất cả route paths để dễ quản lý và avoid hardcoding
 */

export const ROUTES = {
  // Public routes
  LANDING_PAGE: '/',  // Main landing page - removed /home route
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  TWO_FACTOR: '/2fa',
  
  // Course catalog (public)
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  LEARNING: '/student/courses/:courseId/learn',
  // Student routes
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    MY_COURSES: '/student/my-courses',
    LEARNING: '/student/courses/:courseId/learn',
    LESSON: '/student/courses/:courseId/lessons/:lessonId',
    QUIZ: '/student/courses/:courseId/quizzes/:quizId',
    QUIZ_RESULTS: '/student/quizzes/:attemptId/results',
    ASSIGNMENTS: '/student/assignments',
    ASSIGNMENT: '/student/courses/:courseId/assignments/:assignmentId',
    SETTINGS: '/student/settings',
    NOTIFICATIONS: '/student/notifications',
    CHAT: '/student/chat',
  },
  
  // Instructor routes
  INSTRUCTOR: {
    DASHBOARD: '/instructor/dashboard',
    MY_COURSES: '/instructor/my-courses',
    COURSE_CREATE: '/instructor/courses/create',
    COURSE_DETAIL: '/instructor/courses/:courseId',
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
    STUDENTS: '/instructor/students',
    ANALYTICS: '/instructor/analytics',
    LIVESTREAM: '/instructor/livestream',
    LIVESTREAM_CREATE: '/instructor/livestream/create',
    LIVESTREAM_HOST: '/instructor/livestream/:sessionId/host',
    LIVESTREAM_SESSION: '/instructor/livestream/:sessionId',
    CHAT: '/instructor/chat',
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
    ACTIVITY_LOGS: '/admin/activity-logs',
    ANALYTICS: '/admin/analytics',
  },

  // Livestream (common hub)
  LIVESTREAM: {
    HUB: '/livestream',
    SESSION: '/livestream/:sessionId',
  },

  // Shared user routes (for all authenticated users)
  PROFILE: '/profile',

  // Future feature routes (for marketing pages)
  ABOUT: '/about',
  CERTIFICATES: '/certificates',
  CERTIFICATES_VERIFY: '/certificates/verify',
  CHAT: '/chat',  // AI Chat feature

  // Common routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/403',
} as const;

/**
 * Helper functions to generate routes with parameters
 */
export const generateRoute = {
  courseDetail: (id: string) => `/courses/${id}`,
  
  student: {
    learning: (courseId: string) => `/student/courses/${courseId}/learn`,
    lesson: (courseId: string, lessonId: string) => 
      `/student/courses/${courseId}/lessons/${lessonId}`,
    quiz: (quizId: string) => `/student/quizzes/${quizId}`,
    quizAttempt: (quizId: string, attemptId: string) => 
      `/student/quizzes/${quizId}/attempt/${attemptId}`,
    assignment: (assignmentId: string) => `/student/assignments/${assignmentId}`,
    chat: (courseId?: string) => 
      courseId ? `/student/chat?courseId=${courseId}` : '/student/chat',
  },
  
  instructor: {
    courseDetail: (courseId: string) => `/instructor/courses/${courseId}`,
    courseEdit: (courseId: string) => `/instructor/courses/${courseId}/edit`,
    curriculum: (courseId: string) => `/instructor/courses/${courseId}/curriculum`,
    courseStudents: (courseId: string) => `/instructor/courses/${courseId}/students`,
    quizCreate: (courseId: string) => `/instructor/courses/${courseId}/quizzes/create`,
    quizEdit: (quizId: string) => `/instructor/quizzes/${quizId}/edit`,
    quizAttempts: (quizId: string) => `/instructor/quizzes/${quizId}/attempts`,
    assignmentCreate: (courseId: string) => 
      `/instructor/courses/${courseId}/assignments/create`,
    assignmentEdit: (assignmentId: string) => 
      `/instructor/assignments/${assignmentId}/edit`,
    submissions: (assignmentId: string) => 
      `/instructor/assignments/${assignmentId}/submissions`,
    courseGrades: (courseId: string) => `/instructor/courses/${courseId}/grades`,
    livestreamSession: (sessionId: string) => `/instructor/livestream/${sessionId}`,
    chat: (courseId?: string) => 
      courseId ? `/instructor/chat?courseId=${courseId}` : '/instructor/chat',
  },
  livestream: {
    session: (sessionId: string) => `/livestream/${sessionId}`,
  },
  
  admin: {
    userDetail: (userId: string) => `/admin/users/${userId}`,
    courseDetail: (courseId: string) => `/admin/courses/${courseId}`,
  },
};

export default ROUTES;
