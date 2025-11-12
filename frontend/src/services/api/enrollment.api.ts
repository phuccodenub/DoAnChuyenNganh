import { httpClient } from '../http/client';

/**
 * Enrollment API Service
 * 
 * Quản lý enrollments và progress tracking
 */

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'enrolled' | 'completed' | 'dropped';
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  updated_at: string;
  course?: {
    id: number;
    title: string;
    thumbnail_url?: string;
    instructor?: {
      full_name: string;
    };
  };
}

export interface EnrollmentStats {
  total: number;
  active: number;
  completed: number;
  dropped: number;
}

export const enrollmentApi = {
  /**
   * Lấy tất cả enrollments (admin/instructor)
   */
  getAll: (filters?: { page?: number; limit?: number }) => {
    return httpClient.get('/enrollments', { params: filters });
  },

  /**
   * Lấy chi tiết enrollment
   */
  getById: (id: number) => {
    return httpClient.get(`/enrollments/${id}`);
  },

  /**
   * Lấy enrollments của user
   */
  getByUser: (userId: number) => {
    return httpClient.get(`/enrollments/user/${userId}`);
  },

  /**
   * Lấy enrollments của course
   */
  getByCourse: (courseId: number) => {
    return httpClient.get(`/enrollments/course/${courseId}`);
  },

  /**
   * Kiểm tra user đã enroll course chưa
   */
  checkEnrollment: (userId: number, courseId: number) => {
    return httpClient.get(`/enrollments/user/${userId}/course/${courseId}`);
  },

  /**
   * Lấy enrollment cụ thể của user trong course
   */
  getEnrollment: (userId: number, courseId: number) => {
    return httpClient.get(`/enrollments/user/${userId}/course/${courseId}/enrollment`);
  },

  /**
   * Tạo enrollment mới (admin)
   */
  create: (data: { user_id: number; course_id: number }) => {
    return httpClient.post('/enrollments', data);
  },

  /**
   * Cập nhật enrollment
   */
  update: (id: number, data: Partial<Enrollment>) => {
    return httpClient.put(`/enrollments/${id}`, data);
  },

  /**
   * Xóa enrollment
   */
  delete: (id: number) => {
    return httpClient.delete(`/enrollments/${id}`);
  },

  /**
   * Đánh dấu enrollment hoàn thành
   */
  markComplete: (id: number) => {
    return httpClient.patch(`/enrollments/${id}/complete`);
  },

  /**
   * Cập nhật tiến độ
   */
  updateProgress: (id: number, progress: number) => {
    return httpClient.put(`/enrollments/${id}/progress`, { progress_percentage: progress });
  },

  /**
   * Lấy thống kê enrollments tổng quan
   */
  getStats: () => {
    return httpClient.get<{
      success: boolean;
      data: EnrollmentStats;
    }>('/enrollments/stats/overview');
  },

  /**
   * Thống kê enrollments theo course
   */
  getStatsByCourse: (courseId: number) => {
    return httpClient.get(`/enrollments/stats/course/${courseId}`);
  },

  /**
   * Thống kê enrollments theo user
   */
  getStatsByUser: (userId: number) => {
    return httpClient.get(`/enrollments/stats/user/${userId}`);
  },
};

export default enrollmentApi;
