import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prerequisiteApi, type CreatePrerequisiteData, type BulkCreatePrerequisitesData } from '@/services/api/prerequisite.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';

/**
 * Hook lấy danh sách prerequisites của khóa học
 */
export function usePrerequisites(courseId: string) {
  return useQuery({
    queryKey: ['prerequisites', courseId],
    queryFn: () => prerequisiteApi.getPrerequisites(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook tạo prerequisite mới
 */
export function useCreatePrerequisite(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrerequisiteData) => prerequisiteApi.createPrerequisite(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prerequisites', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Đã thêm yêu cầu trước thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể thêm yêu cầu trước');
    },
  });
}

/**
 * Hook bulk create prerequisites
 */
export function useBulkCreatePrerequisites(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreatePrerequisitesData) => prerequisiteApi.bulkCreatePrerequisites(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prerequisites', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Đã thêm yêu cầu trước thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể thêm yêu cầu trước');
    },
  });
}

/**
 * Hook xóa prerequisite
 */
export function useDeletePrerequisite(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prerequisiteId: string) => prerequisiteApi.deletePrerequisite(courseId, prerequisiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prerequisites', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Đã xóa yêu cầu trước thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa yêu cầu trước');
    },
  });
}

