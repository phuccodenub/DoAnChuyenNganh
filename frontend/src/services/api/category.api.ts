import { apiClient } from '../http/client';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryStats,
} from '@/types/course.admin.types';

/**
 * Category API Service
 * 
 * Handles all category-related API calls:
 * - CRUD operations (Admin only for create/update/delete)
 * - Category listing (Public read)
 * - Statistics
 */
export const categoryApi = {
  // ============================================================================
  // Category CRUD
  // ============================================================================

  /**
   * Get all categories
   */
  getAll: async (params: { include_inactive?: boolean } = {}): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories', { params });
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (categoryId: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Create new category (Admin only)
   */
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },

  /**
   * Update category (Admin only)
   */
  update: async (categoryId: string, data: UpdateCategoryPayload): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${categoryId}`, data);
    return response.data;
  },

  /**
   * Delete category (Admin only)
   */
  delete: async (categoryId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/categories/${categoryId}`
    );
    return response.data;
  },

  // ============================================================================
  // Category Statistics
  // ============================================================================

  /**
   * Get category statistics
   */
  getStats: async (): Promise<CategoryStats> => {
    const response = await apiClient.get<CategoryStats>('/categories/stats');
    return response.data;
  },

  /**
   * Get courses in a category
   */
  getCategoryCourses: async (
    categoryId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{
    courses: Array<{
      id: string;
      title: string;
      thumbnail_url?: string;
      instructor_name: string;
      student_count: number;
    }>;
    total: number;
  }> => {
    const response = await apiClient.get(`/categories/${categoryId}/courses`, { params });
    return response.data;
  },
};

export default categoryApi;
