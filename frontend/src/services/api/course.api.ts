import { httpClient } from '../http/client';
import type { Section } from './lesson.api';

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
  short_description?: string;
  category?: {
    id: string;
    name: string;
  };
  category_slug?: string;
  subcategory?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_intro?: string;
  status: 'draft' | 'published' | 'archived';
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // deprecated, use level
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language?: string;
  duration_hours?: number;
  total_lessons?: number;
  price?: number;
  currency?: string;
  discount_price?: number;
  discount_percentage?: number;
  discount_start?: string;
  discount_end?: string;
  is_featured?: boolean;
  is_free: boolean;
  learning_objectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  rating?: number;
  total_ratings?: number;
  instructor?: {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  _count?: {
    enrollments: number;
  };
  sections?: Section[];
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  short_description?: string;
  category?: string;
  subcategory?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  price?: number;
  currency?: string;
  discount_price?: number;
  discount_percentage?: number;
  discount_start?: string;
  discount_end?: string;
  thumbnail?: string;
  video_intro?: string;
  duration_hours?: number;
  total_lessons?: number;
  is_featured?: boolean;
  is_free?: boolean;
  prerequisites?: string[];
  learning_objectives?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

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

export interface CourseProgress {
  course_id: string;
  user_id: string;
  lessons_completed: number;
  total_lessons: number;
  percent: number;
  last_activity_at?: string;
}

export interface CourseProgressResponse {
  success: boolean;
  message: string;
  data: CourseProgress;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  lessons_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SectionsResponse {
  success: boolean;
  message: string;
  data: CourseSection[];
}

export interface CourseQuiz {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  questions_count?: number;
  passing_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizzesResponse {
  success: boolean;
  message: string;
  data: CourseQuiz[];
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
  create: (data: CreateCoursePayload) => {
    return httpClient.post<CourseDetailResponse>('/courses', data);
  },

  /**
   * Cập nhật khóa học (instructor)
   */
  update: (id: string, data: UpdateCoursePayload) => {
    return httpClient.put<CourseDetailResponse>(`/courses/${id}`, data);
  },

  /**
   * Xóa khóa học (instructor)
   */
  delete: (id: string) => {
    return httpClient.delete(`/courses/${id}`);
  },

  /**
   * Lấy tiến độ học tập trong khóa học
   * Note: Progress is now in course-content module
   * Use lessonApi.getCourseProgress instead
   * @deprecated Use lessonApi.getCourseProgress() from lesson.api.ts
   */
  getProgress: (courseId: string) => {
    // Redirect to course-content endpoint
    return httpClient.get<CourseProgressResponse>(`/course-content/courses/${courseId}/progress`);
  },

  /**
   * Lấy danh sách sections của khóa học
   * Note: Sections are now in course-content module
   * Use lessonApi.getCourseSections instead
   * @deprecated Use lessonApi.getCourseSections() from lesson.api.ts
   */
  getSections: (courseId: string) => {
    // Redirect to course-content endpoint
    return httpClient.get<SectionsResponse>(`/course-content/courses/${courseId}/sections`);
  },

  /**
   * Lấy danh sách quizzes của khóa học
   */
  getQuizzes: (courseId: string) => {
    return httpClient.get<QuizzesResponse>(`/courses/${courseId}/quizzes`);
  },
};

export default courseApi;
