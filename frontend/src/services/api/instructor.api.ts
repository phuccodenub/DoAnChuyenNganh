import { httpClient } from '../http/client';
import type { Course } from './course.api';

/**
 * Instructor API Service
 * 
 * Tất cả endpoints liên quan đến instructor course management
 */

// ================== TYPES ==================

export interface InstructorDashboardStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_students: number;
  total_revenue: number;
  total_lessons: number;
  total_sections: number;
  avg_rating: number;
  total_reviews: number;
  pending_assignments: number;
  this_month_enrollments: number;
  completion_rate: number;
}

export interface InstructorCourse extends Course {
  total_students?: number;
  total_lessons?: number;
  total_sections?: number;
  total_revenue?: number;
  average_rating?: number;
  total_ratings?: number;
}

export interface CourseStats {
  total_students: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  avg_progress: number;
  avg_score: number;
  pending_grading: number;
  max_students: number;
  new_students_this_week: number;
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  student_id?: string; // MSSV
  enrolled_at: string;
  progress_percent: number;
  last_activity_at: string;
  completed_lessons: number;
  total_lessons: number;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
  duration_minutes: number;
  is_free_preview: boolean;
  is_published: boolean;
  order_index: number;
  video_url?: string;
  content?: string;
  description?: string;
  materials?: Array<{
    id: string;
    lesson_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    file_extension?: string;
    description?: string;
    download_count: number;
    is_downloadable: boolean;
    uploaded_by?: string;
    order_index: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface CreateSectionData {
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

export interface UpdateSectionData {
  title?: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface CreateLessonData {
  section_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
  description?: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  is_free_preview?: boolean;
  is_published?: boolean;
  order_index?: number;
}

export interface UpdateLessonData {
  title?: string;
  content_type?: 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
  description?: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  is_free_preview?: boolean;
  is_published?: boolean;
  order_index?: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  thumbnail_url?: string; // Alias for thumbnail
  price?: number;
  is_free?: boolean;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status?: 'draft' | 'published' | 'archived';
  category_id?: string;
  language?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  tags?: string[];
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

// ================== API FUNCTIONS ==================

export const instructorApi = {
  // ===== DASHBOARD =====

  /**
   * Lấy thống kê dashboard cho instructor
   * Uses new /instructor/dashboard/stats endpoint
   */
  getDashboardStats: async (): Promise<InstructorDashboardStats> => {
    const response = await httpClient.get<ApiResponse<InstructorDashboardStats>>('/instructor/dashboard/stats');
    return response.data.data;
  },

  /**
   * Lấy hoạt động gần đây
   */
  getRecentActivities: async (limit: number = 20) => {
    const response = await httpClient.get<ApiResponse<any[]>>('/instructor/activities/recent', { params: { limit } });
    return response.data.data;
  },

  // ===== COURSE MANAGEMENT =====

  /**
   * Lấy danh sách khóa học của instructor hiện tại
   */
  getMyCourses: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await httpClient.get<ApiResponse<{
      data: InstructorCourse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/courses/instructor/my-courses', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết khóa học
   */
  getCourseById: async (courseId: string) => {
    // Use management endpoint to enforce owner/admin access on BE
    const response = await httpClient.get<ApiResponse<InstructorCourse>>(`/courses/${courseId}/manage`);
    return response.data;
  },

  /**
   * Tạo khóa học mới
   */
  createCourse: async (data: {
    title: string;
    description?: string;
    short_description?: string;
    thumbnail_url?: string;
    price?: number;
    is_free?: boolean;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category_id?: string;
    language?: string;
    prerequisites?: string[];
    learning_objectives?: string[];
    tags?: string[];
  }) => {
    const response = await httpClient.post<ApiResponse<InstructorCourse>>('/courses', data);
    return response.data;
  },

  /**
   * Cập nhật thông tin khóa học
   */
  updateCourse: async (courseId: string, data: UpdateCourseData) => {
    const response = await httpClient.put<ApiResponse<InstructorCourse>>(`/courses/${courseId}`, data);
    return response.data;
  },

  /**
   * Lấy thống kê khóa học
   */
  getCourseStats: async (courseId: string) => {
    const response = await httpClient.get<ApiResponse<CourseStats>>(`/courses/${courseId}/stats`);
    return response.data;
  },

  // ===== STUDENTS MANAGEMENT =====

  /**
   * Lấy tất cả học viên từ tất cả khóa học của instructor
   * Uses new /instructor/students endpoint
   */
  getAllMyStudents: async (params?: { page?: number; limit?: number; search?: string; course_id?: string }) => {
    const response = await httpClient.get<ApiResponse<{
      students: Array<CourseStudent & { course_id: string; course_title: string; enrollment_id: string }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/instructor/students', { params });
    return response.data;
  },

  /**
   * Xóa học viên khỏi khóa học (unenroll)
   */
  unenrollStudent: async (enrollmentId: string) => {
    const response = await httpClient.delete<ApiResponse<null>>(`/instructor/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * Lấy danh sách học viên của khóa học với tiến độ
   */
  getCourseStudents: async (courseId: string, params?: { page?: number; limit?: number; search?: string }) => {
    const response = await httpClient.get<ApiResponse<{
      students: CourseStudent[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>(`/courses/${courseId}/students`, { params });
    return response.data;
  },

  // ===== SECTIONS MANAGEMENT =====

  /**
   * Lấy danh sách sections của khóa học (với lessons)
   */
  getCourseSections: async (courseId: string) => {
    const response = await httpClient.get<ApiResponse<CourseSection[]>>('/sections', {
      params: { course_id: courseId }
    });
    return response.data;
  },

  /**
   * Tạo section mới
   */
  createSection: async (data: CreateSectionData) => {
    const response = await httpClient.post<ApiResponse<CourseSection>>('/sections', data);
    return response.data;
  },

  /**
   * Cập nhật section
   */
  updateSection: async (sectionId: string, data: UpdateSectionData) => {
    const response = await httpClient.put<ApiResponse<CourseSection>>(`/sections/${sectionId}`, data);
    return response.data;
  },

  /**
   * Xóa section
   */
  deleteSection: async (sectionId: string) => {
    const response = await httpClient.delete<ApiResponse<null>>(`/sections/${sectionId}`);
    return response.data;
  },

  // ===== LESSONS MANAGEMENT =====

  /**
   * Lấy danh sách lessons của section
   */
  getSectionLessons: async (sectionId: string) => {
    const response = await httpClient.get<ApiResponse<CourseLesson[]>>('/lessons', {
      params: { section_id: sectionId }
    });
    return response.data;
  },

  /**
   * Tạo lesson mới
   */
  createLesson: async (data: CreateLessonData) => {
    console.log('[instructorApi.createLesson] Sending request to /lessons with data:', data);
    try {
      const response = await httpClient.post<ApiResponse<CourseLesson>>('/lessons', data);
      console.log('[instructorApi.createLesson] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[instructorApi.createLesson] Error:', error);
      console.error('[instructorApi.createLesson] Error response:', error?.response?.data);
      throw error;
    }
  },

  /**
   * Cập nhật lesson
   */
  updateLesson: async (lessonId: string, data: UpdateLessonData) => {
    const response = await httpClient.put<ApiResponse<CourseLesson>>(`/lessons/${lessonId}`, data);
    return response.data;
  },

  /**
   * Xóa lesson
   */
  deleteLesson: async (lessonId: string) => {
    const response = await httpClient.delete<ApiResponse<null>>(`/lessons/${lessonId}`);
    return response.data;
  },

  // ===== COURSE STATUS =====

  /**
   * Publish khóa học
   */
  publishCourse: async (courseId: string) => {
    const response = await httpClient.put<ApiResponse<InstructorCourse>>(`/courses/${courseId}`, {
      status: 'published'
    });
    return response.data;
  },

  /**
   * Chuyển khóa học về draft
   */
  unpublishCourse: async (courseId: string) => {
    const response = await httpClient.put<ApiResponse<InstructorCourse>>(`/courses/${courseId}`, {
      status: 'draft'
    });
    return response.data;
  },

  /**
   * Archive khóa học
   */
  archiveCourse: async (courseId: string) => {
    const response = await httpClient.put<ApiResponse<InstructorCourse>>(`/courses/${courseId}`, {
      status: 'archived'
    });
    return response.data;
  },

  // ===== ASSIGNMENTS MANAGEMENT =====

  /**
   * Lấy danh sách bài tập chờ chấm (pending submissions)
   */
  getPendingSubmissions: async (params?: { page?: number; limit?: number }) => {
    const response = await httpClient.get<ApiResponse<{
      submissions: Array<{
        id: string;
        assignment_id: string;
        assignment_title: string;
        course_id: string;
        course_title: string;
        max_score: number;
        due_date: string;
        student: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string;
        };
        submitted_at: string;
        is_late: boolean;
        submission_text?: string;
        file_url?: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/instructor/assignments/pending', { params });
    return response.data;
  },

  /**
   * Lấy danh sách bài tập của một khóa học
   */
  getCourseAssignments: async (courseId: string) => {
    const response = await httpClient.get<ApiResponse<Array<{
      id: string;
      title: string;
      description?: string;
      max_score: number;
      due_date?: string;
      is_published: boolean;
      allow_late_submission: boolean;
      created_at: string;
      stats: {
        total_submissions: number;
        pending: number;
        graded: number;
        avg_score: string | null;
      };
    }>>>(`/instructor/courses/${courseId}/assignments`);
    return response.data;
  },

  /**
   * Lấy danh sách bài nộp của một bài tập
   */
  getAssignmentSubmissions: async (assignmentId: string, params?: { page?: number; limit?: number; status?: string }) => {
    const response = await httpClient.get<ApiResponse<{
      assignment: {
        id: string;
        title: string;
        max_score: number;
        due_date?: string;
        course_title: string;
      };
      submissions: Array<{
        id: string;
        student: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string;
        };
        submitted_at: string;
        status: 'submitted' | 'graded' | 'returned';
        is_late: boolean;
        score?: number;
        feedback?: string;
        graded_at?: string;
        submission_text?: string;
        file_url?: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>(`/instructor/assignments/${assignmentId}/submissions`, { params });
    return response.data;
  },

  /**
   * Chấm điểm bài nộp
   */
  gradeSubmission: async (submissionId: string, data: { score: number; feedback?: string }) => {
    const response = await httpClient.post<ApiResponse<{
      id: string;
      score: number;
      feedback?: string;
      status: string;
      graded_at: string;
    }>>(`/instructor/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  /**
   * Gửi thông báo hàng loạt cho học viên
   */
  sendBulkNotification: async (data: {
    student_ids: string[];
    course_id?: string;
    title: string;
    message: string;
    type?: string;
  }) => {
    const response = await httpClient.post<ApiResponse<{ count: number }>>('/instructor/notifications/bulk', data);
    return response.data;
  },
};

export default instructorApi;
