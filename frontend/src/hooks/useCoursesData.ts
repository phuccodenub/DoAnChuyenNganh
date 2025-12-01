import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi, CourseFilters } from '@/services/api/course.api';
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
      return response.data;
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
