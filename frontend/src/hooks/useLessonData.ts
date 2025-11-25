import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonApi, CourseContent, LessonDetail, LessonProgress, UpdateProgressPayload } from '@/services/api/lesson.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Hook to fetch course content (sections and lessons)
 */
export function useCourseContent(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.content(courseId),
    queryFn: () => lessonApi.getCourseContent(courseId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch lesson detail
 */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lessons.detail(lessonId),
    queryFn: () => lessonApi.getLesson(lessonId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!lessonId,
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
    onSuccess: (data, lessonId) => {
      // Invalidate lesson progress
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.progress(lessonId),
      });

      // Invalidate lesson detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.detail(lessonId),
      });

      // Invalidate course content
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lessons.contentAll,
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

export default {
  useCourseContent,
  useLesson,
  useLessonProgress,
  useUpdateProgress,
  useMarkLessonComplete,
  useCourseSections,
};
