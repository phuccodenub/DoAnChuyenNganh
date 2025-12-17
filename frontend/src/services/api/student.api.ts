import { httpClient } from '../http/client';

/**
 * Student API Service
 * 
 * Tất cả endpoints liên quan đến student dashboard
 */

// ================== TYPES ==================

export interface StudentCourse {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'archived';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  instructor?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  // Enrollment info
  enrollment?: {
    id: string;
    enrolled_at: string;
    progress_percentage: number;
    last_accessed_at?: string;
    completed_at?: string;
    status: 'active' | 'completed' | 'dropped';
  };
  // Course stats
  total_lessons?: number;
  completed_lessons?: number;
  total_duration_minutes?: number;
  materials_count?: number;
}

export interface StudentDashboardStats {
  total_enrolled_courses: number;
  in_progress_courses: number;
  completed_courses: number;
  total_learning_time_minutes: number;
  total_points: number;
  badges_count: number;
  certificates_count: number;
  current_streak_days: number;
  longest_streak_days: number;
}

export interface StudentProgressStats {
  lessons: {
    completed: number;
    total: number;
  };
  assignments: {
    completed: number;
    total: number;
  };
  quizzes: {
    completed: number;
    total: number;
  };
}

export interface StudentAssignment {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  course_name: string;
  course_thumbnail?: string;
  due_date: string | null;
  status: 'pending' | 'submitted' | 'graded' | 'overdue' | 'late';
  max_score: number;
  score?: number | null;
  submitted_at?: string | null;
  graded_at?: string | null;
  feedback?: string | null;
}

export interface DailyGoal {
  target_minutes: number;
  current_minutes: number;
  streak_days: number;
  longest_streak_days: number;
  last_activity_date?: string;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  thumbnail_url?: string;
  short_description?: string;
  level?: string;
  materials_count?: number;
  tags?: string[];
  instructor?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  rating?: number;
  total_ratings?: number;
  price?: number;
  is_free?: boolean;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Helper function to get level name based on level number
function getLevelName(level: number): string {
  if (level <= 1) return 'Người mới';
  if (level <= 3) return 'Học viên';
  if (level <= 5) return 'Thành viên tích cực';
  if (level <= 10) return 'Chuyên gia';
  return 'Cao thủ';
}

// ================== API FUNCTIONS ==================

export const studentApi = {
  // ===== DASHBOARD =====

  /**
   * Lấy thống kê dashboard của student
   * Tính toán từ enrolled courses data
   */
  getDashboardStats: async (): Promise<ApiResponse<StudentDashboardStats>> => {
    try {
      // Lấy enrolled courses để tính stats - dùng pagination để lấy tổng số chính xác
      const enrolledResponse = await httpClient.get<ApiResponse<{
        courses: StudentCourse[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>>('/courses/enrolled', { params: { page: 1, limit: 1000 } }); // Lấy nhiều để tính stats chính xác
      
      const courses = enrolledResponse.data?.data?.courses || [];
      const pagination = enrolledResponse.data?.data?.pagination;
      
      // Dùng pagination.total thay vì courses.length để đảm bảo đếm chính xác
      const totalCourses = pagination?.total ?? courses.length;
      const completedCourses = courses.filter(c => c.enrollment?.status === 'completed' || c.enrollment?.progress_percentage === 100).length;
      const inProgressCourses = courses.filter(c => 
        c.enrollment?.status === 'active' && 
        (c.enrollment?.progress_percentage || 0) > 0 && 
        (c.enrollment?.progress_percentage || 0) < 100
      ).length;
      
      return {
        success: true,
        message: 'Dashboard stats retrieved',
        data: {
          total_enrolled_courses: totalCourses,
          in_progress_courses: inProgressCourses,
          completed_courses: completedCourses,
          total_learning_time_minutes: 0, // TODO: Calculate from activity
          total_points: 0, // Gamification not implemented yet
          badges_count: 0,
          certificates_count: completedCourses,
          current_streak_days: 0,
          longest_streak_days: 0,
        }
      };
    } catch {
      // Return default values if API fails
      return {
        success: true,
        message: 'Dashboard stats (default)',
        data: {
          total_enrolled_courses: 0,
          in_progress_courses: 0,
          completed_courses: 0,
          total_learning_time_minutes: 0,
          total_points: 0,
          badges_count: 0,
          certificates_count: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
        }
      };
    }
  },

  /**
   * Lấy thống kê tiến độ học tập (lessons, assignments, quizzes)
   */
  getProgressStats: async (): Promise<ApiResponse<StudentProgressStats>> => {
    try {
      // Gọi endpoint chính xác từ backend
      const response = await httpClient.get<ApiResponse<StudentProgressStats>>('/student/progress-stats');
      return response.data;
    } catch {
      // Fallback: tính từ enrolled courses
      try {
        const enrolledResponse = await httpClient.get<ApiResponse<{
          courses: StudentCourse[];
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }>>('/courses/enrolled', { params: { page: 1, limit: 1000 } });
        
        const courses = enrolledResponse.data?.data?.courses || [];
        let totalLessons = 0;
        let completedLessons = 0;
        let totalAssignments = 0;
        let completedAssignments = 0;
        let totalQuizzes = 0;
        let completedQuizzes = 0;
        
        // Tính toán từ các khóa học đã đăng ký
        for (const course of courses) {
          totalLessons += course.total_lessons || 0;
          completedLessons += course.completed_lessons || 0;
          // Không có thông tin assignment và quiz từ course nên dùng mặc định
        }
        
        return {
          success: true,
          message: 'Progress stats (calculated from enrolled courses)',
          data: {
            lessons: { completed: completedLessons, total: totalLessons },
            assignments: { completed: completedAssignments, total: totalAssignments },
            quizzes: { completed: completedQuizzes, total: totalQuizzes },
          }
        };
      } catch {
        // Return default values if all API calls fail
        return {
          success: true,
          message: 'Progress stats (default)',
          data: {
            lessons: { completed: 0, total: 0 },
            assignments: { completed: 0, total: 0 },
            quizzes: { completed: 0, total: 0 },
          }
        };
      }
    }
  },

  /**
   * Lấy daily goal và streak
   */
  getDailyGoal: async (): Promise<ApiResponse<DailyGoal>> => {
    try {
      // Gọi endpoint chính xác từ backend
      const response = await httpClient.get<ApiResponse<DailyGoal>>('/student/daily-goal');
      return response.data;
    } catch {
      // Fallback: lấy từ user profile hoặc dùng mặc định
      try {
        const profileResponse = await httpClient.get('/users/profile');
        const userData = profileResponse.data?.data;
        return {
          success: true,
          message: 'Daily goal (from profile)',
          data: {
            target_minutes: userData?.daily_goal_target || 30,
            current_minutes: userData?.daily_learning_minutes || 0,
            streak_days: userData?.learning_streak || 0,
            longest_streak_days: userData?.longest_learning_streak || 0,
          }
        };
      } catch {
        // Return default values if all API calls fail
        return {
          success: true,
          message: 'Daily goal (default)',
          data: {
            target_minutes: 30,
            current_minutes: 0,
            streak_days: 0,
            longest_streak_days: 0,
          }
        };
      }
    }
  },

  /**
   * Cập nhật daily goal target
   */
  updateDailyGoal: async (targetMinutes: number): Promise<ApiResponse<DailyGoal>> => {
    try {
      // Gọi endpoint chính xác từ backend
      const response = await httpClient.put<ApiResponse<DailyGoal>>('/student/daily-goal', {
        target_minutes: targetMinutes
      });
      return response.data;
    } catch {
      // Fallback: cập nhật thông qua user profile
      try {
        const profileResponse = await httpClient.put('/users/profile', {
          daily_goal_target: targetMinutes
        });
        const userData = profileResponse.data?.data;
        return {
          success: true,
          message: 'Daily goal updated (via profile)',
          data: {
            target_minutes: userData?.daily_goal_target || targetMinutes,
            current_minutes: userData?.daily_learning_minutes || 0,
            streak_days: userData?.learning_streak || 0,
            longest_streak_days: userData?.longest_learning_streak || 0,
          }
        };
      } catch {
        // Return updated values if API fails
        return {
          success: true,
          message: 'Daily goal updated (local)',
          data: {
            target_minutes: targetMinutes,
            current_minutes: 0,
            streak_days: 0,
            longest_streak_days: 0,
          }
        };
      }
    }
  },

  // ===== COURSES =====

  /**
   * Lấy danh sách khóa học đã đăng ký với progress
   */
  getEnrolledCourses: async (params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'in-progress' | 'completed' | 'not-started';
    search?: string;
  }) => {
    const response = await httpClient.get<ApiResponse<{
      courses: StudentCourse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/courses/enrolled', { params });
    // Return the inner data for direct component access
    return response.data.data;
  },

  /**
   * Lấy khóa học đang học (in-progress) - cho Continue Learning section
   */
  getInProgressCourses: async (limit: number = 2) => {
    const response = await httpClient.get<ApiResponse<{
      courses: StudentCourse[];
    }>>('/courses/enrolled', {
      params: { status: 'in-progress', limit, sort: 'last_accessed' }
    });
    // Return the inner data for direct component access
    return response.data.data;
  },

  /**
   * Lấy khóa học được đề xuất
   */
  getRecommendedCourses: async (limit: number = 3) => {
    try {
      // Gọi endpoint chính xác từ backend
      const response = await httpClient.get<ApiResponse<RecommendedCourse[]>>(
        '/student/recommended-courses',
        { params: { limit } }
      );
      return response.data.data;
    } catch {
      try {
        // Fallback: lấy tất cả khóa học và chọn ngẫu nhiên
        const response = await httpClient.get<ApiResponse<{
          courses: RecommendedCourse[];
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }>>('/courses', { params: { limit: 20 } }); // Lấy 20 khóa học ngẫu nhiên
        
        const allCourses = response.data?.data?.courses || [];
        // Lấy ngẫu nhiên `limit` khóa học từ danh sách
        const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      } catch {
        return [];
      }
    }
  },

  // ===== ASSIGNMENTS =====

  /**
   * Lấy danh sách bài tập của student từ enrolled courses
   * Sử dụng endpoint /assignments/my đã có trong assignment module
   */
  getAssignments: async (params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';
    course_id?: string;
    search?: string;
  }) => {
    const response = await httpClient.get<ApiResponse<{
      assignments: StudentAssignment[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
      stats: {
        pending: number;
        overdue: number;
        submitted: number;
        graded: number;
      };
    }>>('/assignments/my', { params });
    // Return the inner data for direct component access
    return response.data.data;
  },

  /**
   * Lấy thống kê bài tập nhanh (dùng chung endpoint /assignments/my)
   */
  getAssignmentStats: async () => {
    const response = await httpClient.get<ApiResponse<{
      assignments: StudentAssignment[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
      stats: {
        pending: number;
        overdue: number;
        submitted: number;
        graded: number;
        total: number;
      };
    }>>('/assignments/my', { params: { limit: 1 } });
    return { ...response.data, data: response.data.data.stats };
  },

  // ===== LEARNING ACTIVITY =====

  /**
   * Log learning activity (để tính daily goal)
   * TODO: Implement backend endpoint
   */
  logLearningActivity: async (data: {
    course_id: string;
    lesson_id?: string;
    duration_seconds: number;
    activity_type: 'video' | 'reading' | 'quiz' | 'assignment';
  }): Promise<ApiResponse<{ total_today_minutes: number }>> => {
    // Return mock - backend endpoint chưa có
    console.log('Learning activity logged (mock):', data);
    return {
      success: true,
      message: 'Activity logged (mock)',
      data: { total_today_minutes: Math.round(data.duration_seconds / 60) }
    };
  },

  /**
   * Lấy learning activity history
   * Sử dụng endpoint /course-content/users/me/recent-activity
   */
  getLearningHistory: async (params?: {
    page?: number;
    limit?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    try {
      const response = await httpClient.get<ApiResponse<any[]>>(
        '/course-content/users/me/recent-activity',
        { params: { limit: params?.limit || 10 } }
      );
      // Transform response to expected format
      const activities = (response.data?.data || []).map((item: any) => ({
        id: item.id || '',
        course_id: item.course_id || '',
        course_title: item.course?.title || 'Unknown Course',
        lesson_id: item.lesson_id,
        lesson_title: item.lesson?.title,
        duration_seconds: item.time_spent_seconds || 0,
        activity_type: 'reading',
        created_at: item.updated_at || item.created_at || new Date().toISOString()
      }));
      return {
        success: true,
        message: 'Activities retrieved',
        data: {
          activities,
          pagination: { page: params?.page || 1, limit: params?.limit || 10, total: activities.length, totalPages: 1 }
        }
      };
    } catch {
      return {
        success: true,
        message: 'Activities (empty)',
        data: {
          activities: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        }
      };
    }
  },

  // ===== GAMIFICATION =====

  /**
   * Lấy điểm và badges
   */
  getGamificationStats: async () => {
    try {
      // Gọi endpoint chính xác từ backend
      const response = await httpClient.get<ApiResponse<{
        total_points: number;
        level: number;
        badges: Array<{ id: string; name: string; icon: string }>;
        achievements: number;
      }>>('/student/gamification');
      return {
        success: true,
        message: 'Gamification stats retrieved',
        data: {
          total_points: response.data.data.total_points || 0,
          level: response.data.data.level || 1,
          level_name: getLevelName(response.data.data.level || 1),
          points_to_next_level: 100 - ((response.data.data.total_points || 0) % 100),
          badges: response.data.data.badges || [],
          certificates: []
        }
      };
    } catch {
      // Fallback: lấy từ user profile hoặc dùng mặc định
      try {
        const profileResponse = await httpClient.get('/users/profile');
        const userData = profileResponse.data?.data;
        return {
          success: true,
          message: 'Gamification stats (from profile)',
          data: {
            total_points: userData?.points || 0,
            level: userData?.level || 1,
            level_name: getLevelName(userData?.level || 1),
            points_to_next_level: 100 - ((userData?.points || 0) % 100),
            badges: userData?.badges || [],
            certificates: []
          }
        };
      } catch {
        // Return default values if all API calls fail
        return {
          success: true,
          message: 'Gamification stats (default)',
          data: {
            total_points: 0,
            level: 1,
            level_name: 'Người mới',
            points_to_next_level: 100,
            badges: [],
            certificates: []
          }
        };
      }
    }
  },

  /**
   * Lấy leaderboard
   * TODO: Implement backend endpoint, hiện return default
   */
  getLeaderboard: async (_params?: {
    period?: 'week' | 'month' | 'all';
    limit?: number;
  }): Promise<ApiResponse<Array<{
    rank: number;
    user_id: string;
    user_name: string;
    avatar_url?: string;
    points: number;
    is_current_user: boolean;
  }>>> => {
    // Return default empty leaderboard - backend endpoint chưa có
    return {
      success: true,
      message: 'Leaderboard (default)',
      data: []
    };
  },
};

export default studentApi;
