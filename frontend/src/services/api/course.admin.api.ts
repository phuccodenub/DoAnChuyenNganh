import { apiClient } from '../http/client';
import type {
  AdminCourse,
  AdminCourseDetail,
  CourseAdminFilters,
  CourseListResponse,
  CourseStats,
  UpdateCoursePayload,
  BulkCourseActionPayload,
  EnrollmentInfo,
} from '@/types/course.admin.types';

/**
 * Course Admin API Service
 * 
 * Handles all admin course management API calls:
 * - View all courses (cross-instructor)
 * - CRUD operations
 * - Status management
 * - Bulk operations
 * - Statistics & analytics
 */
export const courseAdminApi = {
  // ============================================================================
  // Course Management
  // ============================================================================

  /**
   * Get all courses (admin can see all courses from all instructors)
   */
  getAllCourses: async (filters: CourseAdminFilters = {}): Promise<CourseListResponse> => {
    const response = await apiClient.get<CourseListResponse>('/admin/courses', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get course by ID (with admin-level details)
   */
  getCourseById: async (courseId: string): Promise<AdminCourseDetail> => {
    const response = await apiClient.get<AdminCourseDetail>(`/admin/courses/${courseId}`);
    return response.data;
  },

  /**
   * Update course
   */
  updateCourse: async (courseId: string, data: UpdateCoursePayload): Promise<AdminCourse> => {
    const response = await apiClient.put<AdminCourse>(`/admin/courses/${courseId}`, data);
    return response.data;
  },

  /**
   * Delete course
   */
  deleteCourse: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}`
    );
    return response.data;
  },

  /**
   * Change course status
   */
  changeCourseStatus: async (
    courseId: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<AdminCourse> => {
    const response = await apiClient.patch<AdminCourse>(`/admin/courses/${courseId}/status`, {
      status,
    });
    return response.data;
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Bulk delete courses
   */
  bulkDeleteCourses: async (
    courseIds: string[]
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-delete', { course_ids: courseIds });
    return response.data;
  },

  /**
   * Bulk update course status
   */
  bulkUpdateStatus: async (
    courseIds: string[],
    status: 'draft' | 'published' | 'archived'
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-status', { course_ids: courseIds, status });
    return response.data;
  },

  /**
   * Perform bulk action on courses
   */
  bulkAction: async (
    payload: BulkCourseActionPayload
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-action', payload);
    return response.data;
  },

  // ============================================================================
  // Statistics & Analytics
  // ============================================================================

  /**
   * Get course statistics (admin overview)
   */
  getCourseStats: async (): Promise<CourseStats> => {
    const response = await apiClient.get<CourseStats>('/admin/courses/stats');
    return response.data;
  },

  /**
   * Get course students (enrollments)
   */
  getCourseStudents: async (
    courseId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ students: EnrollmentInfo[]; total: number }> => {
    const response = await apiClient.get<{ students: EnrollmentInfo[]; total: number }>(
      `/admin/courses/${courseId}/students`,
      { params }
    );
    return response.data;
  },

  /**
   * Get course analytics
   */
  getCourseAnalytics: async (courseId: string): Promise<{
    total_enrollments: number;
    active_students: number;
    completed_students: number;
    completion_rate: number;
    average_progress: number;
    total_revenue: number;
  }> => {
    const response = await apiClient.get(`/admin/analytics/courses/${courseId}/stats`);
    return response.data;
  },

  // ============================================================================
  // Export
  // ============================================================================

  /**
   * Export courses to CSV
   */
  exportCoursesToCSV: async (filters: CourseAdminFilters = {}): Promise<Blob> => {
    const response = await apiClient.get<Blob>('/admin/courses/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default courseAdminApi;
