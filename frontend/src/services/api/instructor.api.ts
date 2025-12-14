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
   * Aggregates data from my-courses API
   */
  getDashboardStats: async (): Promise<InstructorDashboardStats> => {
    // Fetch all courses for instructor
    const response = await httpClient.get<ApiResponse<{
      data: InstructorCourse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/courses/instructor/my-courses', { params: { limit: 100 } });
    
    const courses = response.data.data?.data || [];
    
    // Calculate stats from courses
    const stats: InstructorDashboardStats = {
      total_courses: courses.length,
      published_courses: courses.filter(c => c.status === 'published').length,
      draft_courses: courses.filter(c => c.status === 'draft').length,
      total_students: courses.reduce((sum, c) => sum + (c.total_students || 0), 0),
      total_revenue: courses.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      total_lessons: courses.reduce((sum, c) => sum + (c.total_lessons || 0), 0),
      total_sections: courses.reduce((sum, c) => sum + (c.total_sections || 0), 0),
      avg_rating: courses.length > 0 
        ? courses.reduce((sum, c) => sum + (c.average_rating || 0), 0) / courses.length 
        : 0,
      total_reviews: courses.reduce((sum, c) => sum + (c.total_ratings || 0), 0),
      pending_assignments: 0, // TODO: Add assignment stats
      this_month_enrollments: 0, // TODO: Need separate API
      completion_rate: 0, // TODO: Calculate from enrollments
    };
    
    return stats;
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
   */
  getAllMyStudents: async (params?: { page?: number; limit?: number; search?: string }) => {
    // First get all courses
    const coursesResponse = await httpClient.get<ApiResponse<{
      data: InstructorCourse[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>>('/courses/instructor/my-courses', { params: { limit: 100 } });
    
    const courses = coursesResponse.data.data?.data || [];
    const courseIds = courses.map(c => c.id);
    
    // Fetch students for each course and combine
    const allStudents: Array<CourseStudent & { course_id: string; course_title: string }> = [];
    const studentMap = new Map<string, CourseStudent & { course_id: string; course_title: string; courses: string[] }>();
    
    for (const course of courses) {
      try {
        const studentsResponse = await httpClient.get<ApiResponse<{
          students: CourseStudent[];
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }>>(`/courses/${course.id}/students`, { params: { limit: 100 } });
        
        const students = studentsResponse.data.data?.students || [];
        
        for (const student of students) {
          const existing = studentMap.get(student.id);
          if (existing) {
            existing.courses.push(course.title);
          } else {
            studentMap.set(student.id, {
              ...student,
              course_id: course.id,
              course_title: course.title,
              courses: [course.title],
            });
          }
        }
      } catch (e) {
        // Skip if error fetching students for a course
        console.warn(`Failed to fetch students for course ${course.id}`, e);
      }
    }
    
    let students = Array.from(studentMap.values());
    
    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      students = students.filter(s => 
        s.name?.toLowerCase().includes(search) || 
        s.email?.toLowerCase().includes(search)
      );
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginatedStudents = students.slice(start, start + limit);
    
    return {
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: paginatedStudents,
        pagination: {
          page,
          limit,
          total: students.length,
          totalPages: Math.ceil(students.length / limit),
        },
      },
    };
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
};

export default instructorApi;
