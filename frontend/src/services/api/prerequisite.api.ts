import { httpClient } from '../http/client';

/**
 * Prerequisite API Service
 * 
 * Tất cả endpoints liên quan đến course prerequisites
 */

// ================== TYPES ==================

export interface PrerequisiteCourse {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  short_description?: string;
}

export interface CoursePrerequisite {
  id: string;
  course_id: string;
  prerequisite_course_id: string;
  is_required: boolean;
  order_index: number;
  prerequisite_course: PrerequisiteCourse | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrerequisiteData {
  prerequisite_course_id: string;
  is_required?: boolean;
  order_index?: number;
}

export interface BulkCreatePrerequisitesData {
  prerequisites: CreatePrerequisiteData[];
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ================== API FUNCTIONS ==================

export const prerequisiteApi = {
  /**
   * Lấy danh sách prerequisites của khóa học
   */
  getPrerequisites: async (courseId: string) => {
    const response = await httpClient.get<ApiResponse<CoursePrerequisite[]>>(
      `/courses/${courseId}/prerequisites`
    );
    return response.data;
  },

  /**
   * Tạo prerequisite mới
   */
  createPrerequisite: async (courseId: string, data: CreatePrerequisiteData) => {
    const response = await httpClient.post<ApiResponse<CoursePrerequisite>>(
      `/courses/${courseId}/prerequisites`,
      data
    );
    return response.data;
  },

  /**
   * Bulk create prerequisites
   */
  bulkCreatePrerequisites: async (courseId: string, data: BulkCreatePrerequisitesData) => {
    const response = await httpClient.post<ApiResponse<CoursePrerequisite[]>>(
      `/courses/${courseId}/prerequisites/bulk`,
      data
    );
    return response.data;
  },

  /**
   * Xóa prerequisite
   */
  deletePrerequisite: async (courseId: string, prerequisiteId: string) => {
    const response = await httpClient.delete<ApiResponse<void>>(
      `/courses/${courseId}/prerequisites/${prerequisiteId}`
    );
    return response.data;
  },
};

