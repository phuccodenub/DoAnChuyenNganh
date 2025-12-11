import { useQuery } from '@tanstack/react-query';
import { courseApi, type Course } from '@/services/api/course.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useDebounce } from './useDebounce';

/**
 * Hook tìm kiếm khóa học (sử dụng public course list with search)
 * Dùng cho chọn prerequisites, v.v.
 */
export function useCourseSearch(term: string, limit: number = 5) {
  const debouncedTerm = useDebounce(term, 400);

  return useQuery<Course[]>({
    queryKey: ['course-search', debouncedTerm, limit],
    enabled: debouncedTerm.length > 1,
    queryFn: async () => {
      const response = await courseApi.getAll({
        search: debouncedTerm,
        limit,
        page: 1,
        status: 'published',
      });
      return response.data.data?.courses || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export default useCourseSearch;

