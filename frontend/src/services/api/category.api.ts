import { apiClient } from '../http/client';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryStats,
} from '@/types/course.admin.types';

interface BackendApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  course_count?: number;
  is_active?: boolean;
  icon?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  parent?: {
    id: string;
    name: string;
  } | null;
}

function mapBackendCategory(raw: BackendCategory): Category {
  const createdAt =
    raw.created_at instanceof Date
      ? raw.created_at.toISOString()
      : (raw.created_at as string | undefined) ?? new Date().toISOString();

  const updatedAt =
    raw.updated_at instanceof Date
      ? raw.updated_at.toISOString()
      : (raw.updated_at as string | undefined) ?? createdAt;

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    slug: raw.slug,
    parent_id: raw.parent_id ?? undefined,
    parent: raw.parent ? { id: raw.parent.id, name: raw.parent.name } : undefined,
    course_count: raw.course_count ?? 0,
    is_active: raw.is_active ?? true,
    icon_url: raw.icon ?? undefined,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

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
    // Map include_inactive -> only_active cho backend
    const query: Record<string, unknown> = {
      include_subcategories: false,
      only_active: params.include_inactive === true ? false : true,
    };

    const response = await apiClient.get<BackendApiResponse<BackendCategory[]>>('/categories', {
      params: query,
    });
    const data = response.data.data ?? [];
    return data.map(mapBackendCategory);
  },

  /**
   * Get category by ID
   */
  getById: async (categoryId: string): Promise<Category> => {
    const response = await apiClient.get<BackendApiResponse<BackendCategory>>(
      `/categories/${categoryId}`,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy danh mục');
    }
    return mapBackendCategory(response.data.data);
  },

  /**
   * Create new category (Admin only)
   */
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      parent_id: data.parent_id,
      slug: data.slug,
      is_active: data.is_active,
      icon: data.icon_url,
    };

    const response = await apiClient.post<BackendApiResponse<BackendCategory>>(
      '/categories',
      payload,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Tạo danh mục thất bại');
    }
    return mapBackendCategory(response.data.data);
  },

  /**
   * Update category (Admin only)
   */
  update: async (categoryId: string, data: UpdateCategoryPayload): Promise<Category> => {
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      parent_id: data.parent_id,
      slug: data.slug,
      is_active: data.is_active,
      icon: data.icon_url,
    };

    const response = await apiClient.put<BackendApiResponse<BackendCategory>>(
      `/categories/${categoryId}`,
      payload,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Cập nhật danh mục thất bại');
    }
    return mapBackendCategory(response.data.data);
  },

  /**
   * Delete category (Admin only)
   */
  delete: async (categoryId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<BackendApiResponse<null>>(`/categories/${categoryId}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  // ============================================================================
  // Category Statistics
  // ============================================================================

  /**
   * Get category statistics
   */
  getStats: async (): Promise<CategoryStats> => {
    // Backend chưa có /categories/stats, derive từ danh sách categories
    const categories = await categoryApi.getAll({ include_inactive: true });

    const total = categories.length;
    const active = categories.filter((c) => c.is_active).length;
    const top = [...categories]
      .sort((a, b) => (b.course_count || 0) - (a.course_count || 0))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        name: c.name,
        course_count: c.course_count || 0,
      }));

    return {
      total_categories: total,
      active_categories: active,
      top_categories: top,
    };
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
    // Chưa có endpoint riêng cho courses theo category -> tạm thời trả về rỗng
    void categoryId;
    void params;
    return { courses: [], total: 0 };
  },
};

export default categoryApi;
