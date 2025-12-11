import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/services/api/student.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';

/**
 * Student Data Hooks
 * 
 * React Query hooks cho student dashboard và các trang liên quan
 */

// ================== DASHBOARD HOOKS ==================

/**
 * Hook lấy thống kê dashboard
 */
export function useStudentDashboardStats() {
  return useQuery({
    queryKey: ['student', 'dashboard', 'stats'],
    queryFn: async () => {
      const response = await studentApi.getDashboardStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook lấy thống kê tiến độ (lessons, assignments, quizzes)
 */
export function useStudentProgressStats() {
  return useQuery({
    queryKey: ['student', 'dashboard', 'progress'],
    queryFn: async () => {
      const response = await studentApi.getProgressStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook lấy daily goal
 */
export function useStudentDailyGoal() {
  return useQuery({
    queryKey: ['student', 'dashboard', 'daily-goal'],
    queryFn: async () => {
      const response = await studentApi.getDailyGoal();
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook cập nhật daily goal
 */
export function useUpdateDailyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetMinutes: number) => studentApi.updateDailyGoal(targetMinutes),
    onSuccess: () => {
      toast.success('Đã cập nhật mục tiêu học tập!');
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard', 'daily-goal'] });
    },
    onError: () => {
      toast.error('Không thể cập nhật mục tiêu');
    },
  });
}

// ================== COURSES HOOKS ==================

/**
 * Hook lấy khóa học đã đăng ký với progress
 */
export function useStudentEnrolledCourses(params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'in-progress' | 'completed' | 'not-started';
  search?: string;
}) {
  return useQuery({
    queryKey: ['student', 'courses', 'enrolled', params],
    queryFn: () => studentApi.getEnrolledCourses(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook lấy khóa học đang học (in-progress)
 */
export function useInProgressCourses(limit: number = 2) {
  return useQuery({
    queryKey: ['student', 'courses', 'in-progress', limit],
    queryFn: () => studentApi.getInProgressCourses(limit),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook lấy khóa học được đề xuất
 */
export function useRecommendedCourses(limit: number = 3) {
  return useQuery({
    queryKey: ['student', 'courses', 'recommended', limit],
    queryFn: () => studentApi.getRecommendedCourses(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ================== ASSIGNMENTS HOOKS ==================

/**
 * Hook lấy danh sách bài tập của student
 */
export function useStudentAssignments(params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';
  course_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['student', 'assignments', params],
    queryFn: () => studentApi.getAssignments(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook lấy thống kê bài tập nhanh
 */
export function useStudentAssignmentStats() {
  return useQuery({
    queryKey: ['student', 'assignments', 'stats'],
    queryFn: async () => {
      const response = await studentApi.getAssignmentStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ================== ACTIVITY HOOKS ==================

/**
 * Hook log learning activity
 */
export function useLogLearningActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      course_id: string;
      lesson_id?: string;
      duration_seconds: number;
      activity_type: 'video' | 'reading' | 'quiz' | 'assignment';
    }) => studentApi.logLearningActivity(data),
    onSuccess: () => {
      // Invalidate daily goal to update progress
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard', 'daily-goal'] });
    },
  });
}

/**
 * Hook lấy learning history
 */
export function useLearningHistory(params?: {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
}) {
  return useQuery({
    queryKey: ['student', 'activity', 'history', params],
    queryFn: async () => {
      const response = await studentApi.getLearningHistory(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ================== GAMIFICATION HOOKS ==================

/**
 * Hook lấy gamification stats (points, badges, certificates)
 */
export function useGamificationStats() {
  return useQuery({
    queryKey: ['student', 'gamification'],
    queryFn: async () => {
      const response = await studentApi.getGamificationStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook lấy leaderboard
 */
export function useLeaderboard(params?: {
  period?: 'week' | 'month' | 'all';
  limit?: number;
}) {
  return useQuery({
    queryKey: ['student', 'leaderboard', params],
    queryFn: async () => {
      const response = await studentApi.getLeaderboard(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default {
  useStudentDashboardStats,
  useStudentProgressStats,
  useStudentDailyGoal,
  useUpdateDailyGoal,
  useStudentEnrolledCourses,
  useInProgressCourses,
  useRecommendedCourses,
  useStudentAssignments,
  useStudentAssignmentStats,
  useLogLearningActivity,
  useLearningHistory,
  useGamificationStats,
  useLeaderboard,
};
