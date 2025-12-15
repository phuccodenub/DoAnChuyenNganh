import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonApi, CourseContent, LessonDetail, LessonProgress, UpdateProgressPayload } from '@/services/api/lesson.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAuthStore } from '@/stores/authStore.enhanced';

/**
 * Hook to fetch course content (sections and lessons)
 * Yêu cầu authentication - chỉ gọi khi user đã đăng nhập
 */
export function useCourseContent(courseId: string, options?: { enabled?: boolean }) {
  // Lấy trạng thái auth từ store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const tokens = useAuthStore((state) => state.tokens);
  
  // Chỉ enabled khi:
  // 1. courseId có giá trị
  // 2. Auth đã initialized
  // 3. User đã authenticated
  // 4. Có token
  // 5. options.enabled !== false
  const shouldFetch = !!courseId && 
                      isInitialized && 
                      isAuthenticated && 
                      !!tokens?.accessToken &&
                      options?.enabled !== false;

  return useQuery({
    queryKey: QUERY_KEYS.lessons.content(courseId),
    queryFn: () => lessonApi.getCourseContent(courseId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: shouldFetch,
    retry: (failureCount, error: any) => {
      // Không retry nếu là lỗi 401 (Unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch lesson detail
 * Refetch ngay khi lessonId thay đổi để đảm bảo hiển thị đúng nội dung
 */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.detail(lessonId),
    queryFn: () => lessonApi.getLesson(lessonId),
    staleTime: 0, // Luôn refetch khi lessonId thay đổi
    enabled: !!lessonId,
    refetchOnMount: 'always', // Luôn refetch khi component mount với lessonId mới
  });
}

/**
 * Hook to fetch lesson progress
 */
export function useLessonProgress(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.progress(lessonId),
    queryFn: () => lessonApi.getLessonProgress(lessonId),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!lessonId,
  });
}

/**
 * Hook to update lesson progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: UpdateProgressPayload }) =>
      lessonApi.updateProgress(lessonId, data),
    onSuccess: (data, variables) => {
      // Invalidate lesson progress
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.progress(variables.lessonId),
      });

      // Invalidate course content to update progress indicators
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.contentAll,
      });
    },
  });
}

/**
 * Hook to mark lesson as complete
 */
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => lessonApi.markComplete(lessonId),
    onMutate: async (lessonId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lessons.detail(lessonId) });

      // Snapshot the previous value
      const previousLesson = queryClient.getQueryData<LessonDetail>(QUERY_KEYS.lessons.detail(lessonId));

      // Optimistically update lesson to mark as completed
      if (previousLesson) {
        queryClient.setQueryData<LessonDetail>(QUERY_KEYS.lessons.detail(lessonId), {
          ...previousLesson,
          is_completed: true,
        });
      }

      return { previousLesson };
    },
    onError: (err, lessonId, context) => {
      // Rollback on error
      if (context?.previousLesson) {
        queryClient.setQueryData(QUERY_KEYS.lessons.detail(lessonId), context.previousLesson);
      }
    },
    onSuccess: (data, lessonId) => {
      // Invalidate lesson progress
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.progress(lessonId),
      });

      // Invalidate lesson detail - force refetch to get latest data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.detail(lessonId),
      });

      // Invalidate all course content queries (will refetch when accessed)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          // Match any course content query
          return (
            (Array.isArray(key) && key[0] === 'lessons' && key[1] === 'content') ||
            (Array.isArray(key) && key[0] === 'course-content')
          );
        },
      });

      // Invalidate enrolled courses (to update progress)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courses.enrolled(),
      });
    },
  });
}

/**
 * Hook to get course sections
 */
export function useCourseSections(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.sections(courseId),
    queryFn: () => lessonApi.getCourseSections(courseId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!courseId,
  });
}

// Bookmarked lessons in a course
export function useCourseBookmarks(courseId: string) {
  return useQuery({
    queryKey: ['lessons', 'bookmarks', courseId],
    queryFn: () => lessonApi.getCourseBookmarks(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

export default {
  useCourseContent,
  useLesson,
  useLessonProgress,
  useUpdateProgress,
  useMarkLessonComplete,
  useCourseSections,
  useCourseBookmarks,
};
