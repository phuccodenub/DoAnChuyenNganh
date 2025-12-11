import { httpClient } from '../http/client';

/**
 * Enrollment API Service
 * 
 * Quản lý enrollments và progress tracking
 */

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'completed' | 'dropped';
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  updated_at: string;
  course?: {
    id: string;
    title: string;
    thumbnail_url?: string;
    instructor?: {
      full_name: string;
    };
  };
}

export interface EnrollmentStats {
  user_id?: string;
  username?: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  average_progress: number;
  average_grade: number;
  completion_rate: number;
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
  getById: (id: string) => {
    return httpClient.get(`/enrollments/${id}`);
  },

  /**
   * Lấy enrollments của user
   */
  getByUser: (userId: string) => {
    return httpClient.get(`/enrollments/user/${userId}`);
  },

  /**
   * Lấy enrollment stats của user
   */
  getUserStats: (userId: string) => {
    return httpClient.get(`/enrollments/stats/user/${userId}`);
  },

  /**
   * Lấy enrollments của current user (từ user profile)
   */
  getMyEnrollments: () => {
    return httpClient.get('/users/profile/enrollments');
  },

  /**
   * Lấy enrollments của course
   */
  getByCourse: (courseId: string) => {
    return httpClient.get(`/enrollments/course/${courseId}`);
  },

  /**
   * Kiểm tra user đã enroll course chưa
   */
  checkEnrollment: (userId: string, courseId: string) => {
    return httpClient.get(`/enrollments/user/${userId}/course/${courseId}`);
  },

  /**
   * Lấy enrollment cụ thể của user trong course
   */
  getEnrollment: (userId: string, courseId: string) => {
    return httpClient.get(`/enrollments/user/${userId}/course/${courseId}/enrollment`);
  },

  /**
   * Tạo enrollment mới (admin)
   */
  create: (data: { user_id: string; course_id: string }) => {
    return httpClient.post('/enrollments', data);
  },

  /**
   * Cập nhật enrollment
   */
  update: (id: string, data: Partial<Enrollment>) => {
    return httpClient.put(`/enrollments/${id}`, data);
  },

  /**
   * Xóa enrollment
   */
  delete: (id: string) => {
    return httpClient.delete(`/enrollments/${id}`);
  },

  /**
   * Đánh dấu enrollment hoàn thành
   */
  markComplete: (id: string) => {
    return httpClient.patch(`/enrollments/${id}/complete`);
  },

  /**
   * Cập nhật tiến độ
   */
  updateProgress: (id: string, progress: number) => {
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
  getStatsByCourse: (courseId: string) => {
    return httpClient.get(`/enrollments/stats/course/${courseId}`);
  },

  /**
   * Thống kê enrollments theo user
   */
  getStatsByUser: (userId: string) => {
    return httpClient.get(`/enrollments/stats/user/${userId}`);
  },
};

export default enrollmentApi;
