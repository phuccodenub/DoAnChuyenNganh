import { httpClient } from '../http/client';

/**
 * Course API Service
 * 
 * Tất cả endpoints liên quan đến courses
 */

// Types
export interface Course {
  id: string;
  instructor_id: string;
  category_id?: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours?: number;
  price?: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  _count?: {
    enrollments: number;
  };
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  status?: string;
  category_id?: string;
  difficulty?: string;
  is_free?: boolean;
  search?: string;
}

export interface CourseListResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: Course;
}

export const courseApi = {
  /**
   * Lấy tất cả khóa học (public)
   */
  getAll: (filters?: CourseFilters) => {
    return httpClient.get<CourseListResponse>('/courses', { params: filters });
  },

  /**
   * Lấy chi tiết khóa học
   */
  getById: (id: string) => {
    return httpClient.get<CourseDetailResponse>(`/courses/${id}`);
  },

  /**
   * Lấy khóa học đã đăng ký (student)
   */
  getEnrolled: (filters?: { page?: number; limit?: number }) => {
    return httpClient.get<CourseListResponse>('/courses/enrolled', { params: filters });
  },

  /**
   * Đăng ký khóa học (student)
   */
  enroll: (courseId: string) => {
    return httpClient.post(`/courses/${courseId}/enroll`);
  },

  /**
   * Hủy đăng ký khóa học (student)
   */
  unenroll: (courseId: string) => {
    return httpClient.delete(`/courses/${courseId}/unenroll`);
  },

  /**
   * Lấy danh sách học viên trong khóa học (instructor)
   */
  getStudents: (courseId: string) => {
    return httpClient.get(`/courses/${courseId}/students`);
  },

  /**
   * Lấy khóa học của instructor
   */
  getInstructorCourses: (instructorId?: string) => {
    const url = instructorId
      ? `/courses/instructor/${instructorId}`
      : '/courses/instructor/my-courses';
    return httpClient.get<CourseListResponse>(url);
  },

  /**
   * Tạo khóa học mới (instructor)
   */
  create: (data: Partial<Course>) => {
    return httpClient.post<CourseDetailResponse>('/courses', data);
  },

  /**
   * Cập nhật khóa học (instructor)
   */
  update: (id: string, data: Partial<Course>) => {
    return httpClient.put<CourseDetailResponse>(`/courses/${id}`, data);
  },

  /**
   * Xóa khóa học (instructor)
   */
  delete: (id: string) => {
    return httpClient.delete(`/courses/${id}`);
  },
};

export default courseApi;
