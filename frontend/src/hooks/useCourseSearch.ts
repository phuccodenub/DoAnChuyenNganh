import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/services/api/course.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useDebounce } from './useDebounce';

/**
 * Hook tìm kiếm khóa học (sử dụng public course list with search)
 * Dùng cho chọn prerequisites, v.v.
 */
export function useCourseSearch(term: string, limit: number = 5) {
  const debouncedTerm = useDebounce(term, 400);

  return useQuery({
    queryKey: ['course-search', debouncedTerm, limit],
    enabled: debouncedTerm.length > 1,
    queryFn: async () => {
      const response = await courseApi.getAll({
        search: debouncedTerm,
        limit,
        page: 1,
        status: 'published',
      });
      return response.data.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export default useCourseSearch;

