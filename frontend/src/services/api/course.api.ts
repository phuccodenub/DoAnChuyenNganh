import { httpClient } from '../http/client';

/**
 * Course API Service
 * 
 * Tất cả endpoints liên quan đến courses
 */

// Types
export interface Course {
  id: number;
  instructor_id: number;
  category_id?: number;
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
    id: number;
    full_name: string;
    avatar_url?: string;
  };
  category?: {
    id: number;
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
  category_id?: number;
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
  data: {
    course: Course;
  };
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
  getById: (id: number) => {
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
  enroll: (courseId: number) => {
    return httpClient.post(`/courses/${courseId}/enroll`);
  },

  /**
   * Hủy đăng ký khóa học (student)
   */
  unenroll: (courseId: number) => {
    return httpClient.delete(`/courses/${courseId}/unenroll`);
  },

  /**
   * Lấy danh sách học viên trong khóa học (instructor)
   */
  getStudents: (courseId: number) => {
    return httpClient.get(`/courses/${courseId}/students`);
  },

  /**
   * Lấy khóa học của instructor
   */
  getInstructorCourses: (instructorId?: number) => {
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
  update: (id: number, data: Partial<Course>) => {
    return httpClient.put<CourseDetailResponse>(`/courses/${id}`, data);
  },

  /**
   * Xóa khóa học (instructor)
   */
  delete: (id: number) => {
    return httpClient.delete(`/courses/${id}`);
  },
};

export default courseApi;
