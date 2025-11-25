import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { courseAdminApi } from '@/services/api/course.admin.api';
import type {
  AdminCourse,
  AdminCourseDetail,
  CourseAdminFilters,
  CourseStats,
  UpdateCoursePayload,
  BulkCourseActionPayload,
} from '@/types/course.admin.types';

// ============================================================================
// Query Keys
// ============================================================================

export const courseAdminQueryKeys = {
  all: ['admin-courses'] as const,
  lists: () => [...courseAdminQueryKeys.all, 'list'] as const,
  list: (filters: CourseAdminFilters) => [...courseAdminQueryKeys.lists(), filters] as const,
  details: () => [...courseAdminQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseAdminQueryKeys.details(), id] as const,
  stats: () => [...courseAdminQueryKeys.all, 'stats'] as const,
  students: (courseId: string) => [...courseAdminQueryKeys.all, 'students', courseId] as const,
  analytics: (courseId: string) => [...courseAdminQueryKeys.all, 'analytics', courseId] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all courses with filters
 */
export function useAdminCourses(filters: CourseAdminFilters = {}) {
  return useQuery({
    queryKey: courseAdminQueryKeys.list(filters),
    queryFn: () => courseAdminApi.getAllCourses(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get course by ID
 */
export function useAdminCourse(courseId: string, enabled: boolean = true) {
  return useQuery<AdminCourseDetail>({
    queryKey: courseAdminQueryKeys.detail(courseId),
    queryFn: () => courseAdminApi.getCourseById(courseId),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get course statistics
 */
export function useCourseStats() {
  return useQuery<CourseStats>({
    queryKey: courseAdminQueryKeys.stats(),
    queryFn: () => courseAdminApi.getCourseStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get course students
 */
export function useCourseStudents(courseId: string, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: [...courseAdminQueryKeys.students(courseId), params],
    queryFn: () => courseAdminApi.getCourseStudents(courseId, params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get course analytics
 */
export function useCourseAnalytics(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: courseAdminQueryKeys.analytics(courseId),
    queryFn: () => courseAdminApi.getCourseAnalytics(courseId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Update course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: UpdateCoursePayload }) =>
      courseAdminApi.updateCourse(courseId, data),
    onSuccess: (updatedCourse) => {
      // Update course in cache
      queryClient.setQueryData(courseAdminQueryKeys.detail(updatedCourse.id), updatedCourse);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.lists() });
      toast.success('Cập nhật khóa học thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Cập nhật khóa học thất bại';
      toast.error(message);
    },
  });
}

/**
 * Delete course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseAdminApi.deleteCourse(courseId),
    onSuccess: () => {
      // Invalidate all course queries
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.all });
      toast.success('Xóa khóa học thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xóa khóa học thất bại';
      toast.error(message);
    },
  });
}

/**
 * Change course status with optimistic update
 */
export function useChangeCourseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: 'draft' | 'published' | 'archived' }) =>
      courseAdminApi.changeCourseStatus(courseId, status),
    onMutate: async ({ courseId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: courseAdminQueryKeys.detail(courseId) });

      // Snapshot previous value
      const previousCourse = queryClient.getQueryData<AdminCourseDetail>(
        courseAdminQueryKeys.detail(courseId)
      );

      // Optimistically update
      if (previousCourse) {
        queryClient.setQueryData<AdminCourseDetail>(courseAdminQueryKeys.detail(courseId), {
          ...previousCourse,
          status,
        });
      }

      return { previousCourse };
    },
    onSuccess: (updatedCourse) => {
      // Update with server response
      queryClient.setQueryData(courseAdminQueryKeys.detail(updatedCourse.id), updatedCourse);
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.lists() });
      toast.success('Thay đổi trạng thái thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }, _variables, context) => {
      // Rollback on error
      if (context?.previousCourse) {
        queryClient.setQueryData(
          courseAdminQueryKeys.detail(context.previousCourse.id),
          context.previousCourse
        );
      }
      const message = error?.response?.data?.message || 'Thay đổi trạng thái thất bại';
      toast.error(message);
    },
  });
}

/**
 * Bulk delete courses
 */
export function useBulkDeleteCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseIds: string[]) => courseAdminApi.bulkDeleteCourses(courseIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.all });
      toast.success(response.message || `Đã xóa ${response.affected} khóa học`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xóa hàng loạt thất bại';
      toast.error(message);
    },
  });
}

/**
 * Bulk update course status
 */
export function useBulkUpdateCourseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseIds, status }: { courseIds: string[]; status: 'draft' | 'published' | 'archived' }) =>
      courseAdminApi.bulkUpdateStatus(courseIds, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.all });
      toast.success(response.message || `Đã cập nhật ${response.affected} khóa học`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Cập nhật hàng loạt thất bại';
      toast.error(message);
    },
  });
}

/**
 * Bulk action on courses
 */
export function useBulkCourseAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCourseActionPayload) => courseAdminApi.bulkAction(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: courseAdminQueryKeys.all });
      toast.success(response.message || `Đã thực hiện trên ${response.affected} khóa học`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Thao tác hàng loạt thất bại';
      toast.error(message);
    },
  });
}

/**
 * Export courses to CSV
 */
export function useExportCourses() {
  return useMutation({
    mutationFn: (filters: CourseAdminFilters) => courseAdminApi.exportCoursesToCSV(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `courses_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất dữ liệu thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xuất dữ liệu thất bại';
      toast.error(message);
    },
  });
}
