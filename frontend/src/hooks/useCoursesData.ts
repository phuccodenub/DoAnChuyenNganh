import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi, CourseFilters, CreateCoursePayload, UpdateCoursePayload, Course } from '@/services/api/course.api';

import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';

/**
 * Hook lấy danh sách courses
 */
export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(filters),
    queryFn: async () => {
      const response = await courseApi.getAll(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function extractCourses(data: unknown): Course[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data as Course[];
  }
  if (typeof data !== 'object') {
    return [];
  }
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.courses)) {
    return record.courses as Course[];
  }
  const nested = record.data as Record<string, unknown> | undefined;
  if (!nested) {
    return [];
  }
  if (Array.isArray(nested)) {
    return nested as Course[];
  }
  if (Array.isArray(nested.courses)) {
    return nested.courses as Course[];
  }
  return [];
}


/**
 * Hook lấy chi tiết course
 */
export function useCourse(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(id),
    queryFn: async () => {
      if (!id) {
        throw new Error('Course ID is required');
      }
      const response = await courseApi.getById(id);
      return response.data.data;
    },
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook lấy courses đã đăng ký (student)
 */
export function useEnrolledCourses(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.enrolled(filters),
    queryFn: async () => {
      const response = await courseApi.getEnrolled(filters);
      // response.data = { success, message, data: { courses, pagination } }
      // Return the inner data object for component usage
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook lấy courses của instructor hiện tại
 */
export function useInstructorCourses(enabled: boolean = true, instructorId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.instructor(instructorId),
    queryFn: async () => {
      const response = await courseApi.getInstructorCourses(instructorId);
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook tạo mới course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCoursePayload) => {
      const response = await courseApi.create(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.list(undefined) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.instructor(undefined) });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Tạo khóa học thất bại';
      toast.error(message);
    },
  });
}

/**
 * Hook cập nhật course (instructor)
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCoursePayload }) => {
      const response = await courseApi.update(id, data);
      return response.data.data;
    },
    onSuccess: (course) => {
      if (course?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(course.id) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.instructor(undefined) });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Cập nhật khóa học thất bại';
      toast.error(message);
    },
  });
}

/**
 * Hook đăng ký course
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseApi.enroll(courseId),
    onSuccess: () => {
      toast.success('Đăng ký khóa học thành công!');
      
      // Invalidate enrolled courses
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.courses.enrolled() 
      });
      
      // Invalidate enrollment stats
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.enrollments.stats.overview 
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Đăng ký khóa học thất bại';
      toast.error(message);
    },
  });
}

/**
 * Hook hủy đăng ký course
 */
export function useUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseApi.unenroll(courseId),
    onSuccess: () => {
      toast.success('Hủy đăng ký thành công');
      
      // Invalidate enrolled courses
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.courses.enrolled() 
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Hủy đăng ký thất bại';
      toast.error(message);
    },
  });
}

/**
 * Hook lấy tiến độ học tập trong khóa học
 */
export function useCourseProgress(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.progress(courseId),
    queryFn: async () => {
      const response = await courseApi.getProgress(courseId);
      return response.data.data;
    },
    enabled: !!courseId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook lấy sections của khóa học
 */
export function useCourseSections(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.sections(courseId),
    queryFn: async () => {
      const response = await courseApi.getSections(courseId);
      return response.data.data;
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook lấy quizzes của khóa học
 */
export function useCourseQuizzes(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.quizzes(courseId),
    queryFn: async () => {
      const response = await courseApi.getQuizzes(courseId);
      return response.data.data;
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default useCourses;
