/**
 * React Query Keys Constants
 * 
 * Centralized query keys để đảm bảo consistency và easy invalidation
 * Keys được tổ chức theo domain/module
 */

export const QUERY_KEYS = {
  // Auth
  auth: {
    profile: ['auth', 'profile'] as const,
    verify: ['auth', 'verify'] as const,
    sessions: ['auth', 'sessions'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: (filters?: unknown) => ['users', 'list', filters] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
    profile: ['users', 'profile'] as const,
    byRole: (role: string) => ['users', 'role', role] as const,
    byEmail: (email: string) => ['users', 'email', email] as const,
    stats: ['users', 'stats'] as const,
  },

  // Courses
  courses: {
    all: ['courses'] as const,
    list: (filters?: unknown) => ['courses', 'list', filters] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
    enrolled: (filters?: unknown) => ['courses', 'enrolled', filters] as const,
    instructor: (id?: number) => ['courses', 'instructor', id] as const,
    students: (courseId: number) => ['courses', courseId, 'students'] as const,
    progress: (courseId: number) => ['courses', courseId, 'progress'] as const,
  },

  // Course Content
  courseContent: {
    all: (courseId: number) => ['course-content', courseId] as const,
    sections: (courseId: number) => ['course-content', courseId, 'sections'] as const,
    section: (sectionId: number) => ['course-content', 'section', sectionId] as const,
    lessons: (sectionId: number) => ['course-content', 'section', sectionId, 'lessons'] as const,
    lesson: (lessonId: number) => ['course-content', 'lesson', lessonId] as const,
    progress: (courseId: number) => ['course-content', courseId, 'progress'] as const,
    lessonProgress: (lessonId: number) => ['course-content', 'lesson', lessonId, 'progress'] as const,
    recentActivity: ['course-content', 'recent-activity'] as const,
  },

  // Lessons (new structure for learning interface)
  lessons: {
    all: ['lessons'] as const,
    contentAll: ['lessons', 'content'] as const,
    content: (courseId: number) => ['lessons', 'content', courseId] as const,
    detail: (lessonId: number) => ['lessons', 'detail', lessonId] as const,
    progress: (lessonId: number) => ['lessons', 'progress', lessonId] as const,
    sections: (courseId: number) => ['lessons', 'sections', courseId] as const,
  },

  // Enrollments
  enrollments: {
    all: ['enrollments'] as const,
    list: (filters?: unknown) => ['enrollments', 'list', filters] as const,
    detail: (id: number) => ['enrollments', 'detail', id] as const,
    byUser: (userId: number) => ['enrollments', 'user', userId] as const,
    byCourse: (courseId: number) => ['enrollments', 'course', courseId] as const,
    check: (userId: number, courseId: number) => 
      ['enrollments', 'check', userId, courseId] as const,
    stats: {
      overview: ['enrollments', 'stats', 'overview'] as const,
      byCourse: (courseId: number) => ['enrollments', 'stats', 'course', courseId] as const,
      byUser: (userId: number) => ['enrollments', 'stats', 'user', userId] as const,
    },
  },

  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    list: (filters?: unknown) => ['quizzes', 'list', filters] as const,
    detail: (id: number) => ['quizzes', 'detail', id] as const,
    questions: (quizId: number) => ['quizzes', quizId, 'questions'] as const,
    question: (quizId: number, questionId: number) => 
      ['quizzes', quizId, 'questions', questionId] as const,
    attempts: (quizId: number) => ['quizzes', quizId, 'attempts'] as const,
    attempt: (attemptId: number) => ['quizzes', 'attempt', attemptId] as const,
    userAttempts: (quizId: number) => ['quizzes', quizId, 'user-attempts'] as const,
  },

  // Assignments
  assignments: {
    all: ['assignments'] as const,
    list: (filters?: unknown) => ['assignments', 'list', filters] as const,
    detail: (id: number) => ['assignments', 'detail', id] as const,
    submissions: (assignmentId: number) => ['assignments', assignmentId, 'submissions'] as const,
    submission: (submissionId: number) => ['assignments', 'submission', submissionId] as const,
  },

  // Grades
  grades: {
    all: ['grades'] as const,
    byCourse: (courseId: number) => ['grades', 'course', courseId] as const,
    byUser: (userId: number, courseId: number) => 
      ['grades', 'user', userId, 'course', courseId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: unknown) => ['notifications', 'list', filters] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    list: (filters?: unknown) => ['categories', 'list', filters] as const,
    detail: (id: number) => ['categories', 'detail', id] as const,
  },

  // Analytics
  analytics: {
    courseStats: (courseId: number) => ['analytics', 'course', courseId, 'stats'] as const,
    userActivities: (userId: number) => ['analytics', 'user', userId, 'activities'] as const,
    platformStats: ['analytics', 'platform', 'stats'] as const,
  },

  // Livestream
  livestream: {
    all: ['livestream'] as const,
    list: (filters?: unknown) => ['livestream', 'list', filters] as const,
    session: (sessionId: number) => ['livestream', 'session', sessionId] as const,
  },

  // Chat
  chat: {
    messages: (courseId: number, filters?: unknown) => 
      ['chat', 'course', courseId, 'messages', filters] as const,
    search: (courseId: number, query: string) => 
      ['chat', 'course', courseId, 'search', query] as const,
    statistics: (courseId: number) => ['chat', 'course', courseId, 'statistics'] as const,
  },

  // Files
  files: {
    list: (folder: string) => ['files', 'list', folder] as const,
    info: (folder: string, filename: string) => ['files', 'info', folder, filename] as const,
    folderSize: (folder: string) => ['files', 'folder-size', folder] as const,
  },

  // System Settings
  systemSettings: {
    all: ['system-settings'] as const,
    general: ['system-settings', 'general'] as const,
    email: ['system-settings', 'email'] as const,
    security: ['system-settings', 'security'] as const,
    features: ['system-settings', 'features'] as const,
  },

  // Reports & Analytics (Admin)
  reports: {
    stats: (period?: string) => ['reports', 'stats', period] as const,
    userGrowth: (days?: number) => ['reports', 'user-growth', days] as const,
    coursePopularity: (limit?: number) => ['reports', 'course-popularity', limit] as const,
    userActivity: (days?: number) => ['reports', 'user-activity', days] as const,
    enrollmentTrends: (months?: number) => ['reports', 'enrollment-trends', months] as const,
    revenue: (period?: string) => ['reports', 'revenue', period] as const,
  },

  // Activity Logs (Admin)
  activityLogs: {
    all: ['activity-logs'] as const,
    list: (filters?: unknown) => ['activity-logs', 'list', filters] as const,
    detail: (logId: number) => ['activity-logs', 'detail', logId] as const,
  },

  // Admin section
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    settings: ['admin', 'settings'] as const,
    reports: ['admin', 'reports'] as const,
    logs: ['admin', 'logs'] as const,
  },
} as const;

export default QUERY_KEYS;
