import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoryApi } from '@/services/api/category.api';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryStats,
} from '@/types/course.admin.types';

// ============================================================================
// Query Keys
// ============================================================================

export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (params: { include_inactive?: boolean }) => [...categoryQueryKeys.lists(), params] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryQueryKeys.details(), id] as const,
  stats: () => [...categoryQueryKeys.all, 'stats'] as const,
  courses: (categoryId: number) => [...categoryQueryKeys.all, 'courses', categoryId] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all categories
 */
export function useCategories(params: { include_inactive?: boolean } = {}) {
  return useQuery<Category[]>({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => categoryApi.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change rarely)
  });
}

/**
 * Get category by ID
 */
export function useCategory(categoryId: number, enabled: boolean = true) {
  return useQuery<Category>({
    queryKey: categoryQueryKeys.detail(categoryId),
    queryFn: () => categoryApi.getById(categoryId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get category statistics
 */
export function useCategoryStats() {
  return useQuery<CategoryStats>({
    queryKey: categoryQueryKeys.stats(),
    queryFn: () => categoryApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get category courses
 */
export function useCategoryCourses(
  categoryId: number,
  params: { page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: [...categoryQueryKeys.courses(categoryId), params],
    queryFn: () => categoryApi.getCategoryCourses(categoryId, params),
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoryApi.create(data),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      toast.success('Tạo danh mục thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Tạo danh mục thất bại';
      toast.error(message);
    },
  });
}

/**
 * Update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: UpdateCategoryPayload }) =>
      categoryApi.update(categoryId, data),
    onSuccess: (updatedCategory) => {
      // Update category in cache
      queryClient.setQueryData(categoryQueryKeys.detail(updatedCategory.id), updatedCategory);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Cập nhật danh mục thất bại';
      toast.error(message);
    },
  });
}

/**
 * Delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => categoryApi.delete(categoryId),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      toast.success('Xóa danh mục thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xóa danh mục thất bại';
      toast.error(message);
    },
  });
}
