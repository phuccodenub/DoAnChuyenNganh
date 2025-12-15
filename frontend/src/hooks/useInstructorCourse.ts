import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApi } from '@/services/api/instructor.api';
import type {
  InstructorCourse,
  InstructorDashboardStats,
  CourseStats,
  CourseStudent,
  CourseSection,
  CourseLesson,
  CreateSectionData,
  UpdateSectionData,
  CreateLessonData,
  UpdateLessonData,
  UpdateCourseData,
} from '@/services/api/instructor.api';

/**
 * React Query hooks for Instructor Course Management
 */

// Query keys
export const instructorCourseKeys = {
  all: ['instructor-courses'] as const,
  dashboard: () => [...instructorCourseKeys.all, 'dashboard'] as const,
  allStudents: (filters?: Record<string, unknown>) => [...instructorCourseKeys.all, 'all-students', filters] as const,
  lists: () => [...instructorCourseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...instructorCourseKeys.lists(), filters] as const,
  details: () => [...instructorCourseKeys.all, 'detail'] as const,
  detail: (id: string) => [...instructorCourseKeys.details(), id] as const,
  stats: (id: string) => [...instructorCourseKeys.detail(id), 'stats'] as const,
  students: (id: string) => [...instructorCourseKeys.detail(id), 'students'] as const,
  sections: (id: string) => [...instructorCourseKeys.detail(id), 'sections'] as const,
};

// ===== DASHBOARD QUERY =====

/**
 * Hook để lấy thống kê dashboard cho instructor
 */
export function useInstructorDashboardStats() {
  return useQuery({
    queryKey: instructorCourseKeys.dashboard(),
    queryFn: () => instructorApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy tất cả học viên từ tất cả khóa học
 */
export function useAllMyStudents(params?: { page?: number; limit?: number; search?: string; course_id?: string }) {
  return useQuery({
    queryKey: instructorCourseKeys.allStudents(params),
    queryFn: () => instructorApi.getAllMyStudents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ===== COURSE QUERIES =====

/**
 * Hook để lấy danh sách khóa học của instructor
 * @param params - Query parameters (page, limit, status)
 * @param options - Additional options including 'enabled' to conditionally disable the query
 */
export function useInstructorCourses(
  params?: { page?: number; limit?: number; status?: string },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false; // Default to true if not specified
  
  return useQuery({
    queryKey: instructorCourseKeys.list(params || {}),
    queryFn: () => instructorApi.getMyCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
}

/**
 * Hook để lấy chi tiết khóa học
 */
export function useInstructorCourseDetail(courseId: string) {
  return useQuery({
    queryKey: instructorCourseKeys.detail(courseId),
    queryFn: () => instructorApi.getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook để lấy thống kê khóa học
 */
export function useCourseStats(courseId: string) {
  return useQuery({
    queryKey: instructorCourseKeys.stats(courseId),
    queryFn: () => instructorApi.getCourseStats(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change more frequently
  });
}

/**
 * Hook để lấy danh sách học viên
 */
export function useCourseStudents(courseId: string, params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [...instructorCourseKeys.students(courseId), params],
    queryFn: () => instructorApi.getCourseStudents(courseId, params),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook để lấy sections và lessons của khóa học
 */
export function useCourseSections(courseId: string) {
  return useQuery({
    queryKey: instructorCourseKeys.sections(courseId),
    queryFn: () => instructorApi.getCourseSections(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

// ===== COURSE MUTATIONS =====

/**
 * Hook để tạo khóa học mới
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      short_description?: string;
      thumbnail_url?: string;
      price?: number;
      is_free?: boolean;
      level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      category_id?: string;
      language?: string;
      prerequisites?: string[];
      learning_objectives?: string[];
      tags?: string[];
    }) => instructorApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.lists() });
    },
  });
}

/**
 * Hook để cập nhật khóa học
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: UpdateCourseData }) =>
      instructorApi.updateCourse(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.lists() });
    },
  });
}

/**
 * Hook để publish khóa học
 */
export function usePublishCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => instructorApi.publishCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.lists() });
    },
  });
}

/**
 * Hook để unpublish khóa học
 */
export function useUnpublishCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => instructorApi.unpublishCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.lists() });
    },
  });
}

// ===== SECTION MUTATIONS =====

/**
 * Hook để tạo section mới
 */
export function useCreateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSectionData) => instructorApi.createSection(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(variables.course_id) });
    },
  });
}

/**
 * Hook để cập nhật section
 */
export function useUpdateSection(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: UpdateSectionData }) =>
      instructorApi.updateSection(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(courseId) });
    },
  });
}

/**
 * Hook để xóa section
 */
export function useDeleteSection(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => instructorApi.deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(courseId) });
    },
  });
}

// ===== LESSON MUTATIONS =====

/**
 * Hook để tạo lesson mới
 */
export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateLessonData) => {
      console.log('[useCreateLesson] Creating lesson with data:', data);
      const result = await instructorApi.createLesson(data);
      console.log('[useCreateLesson] Lesson created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[useCreateLesson] onSuccess - invalidating queries');
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(courseId) });
    },
    onError: (error: any) => {
      console.error('[useCreateLesson] Error creating lesson:', error);
      console.error('[useCreateLesson] Error response:', error?.response?.data);
    },
  });
}

/**
 * Hook để cập nhật lesson
 */
export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: UpdateLessonData }) =>
      instructorApi.updateLesson(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(courseId) });
    },
  });
}

/**
 * Hook để xóa lesson
 */
export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lessonId: string) => instructorApi.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.sections(courseId) });
    },
  });
}

// ===== ASSIGNMENTS HOOKS =====

/**
 * Hook để lấy bài tập chờ chấm
 */
export function usePendingSubmissions(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['instructor-pending-submissions', params],
    queryFn: () => instructorApi.getPendingSubmissions(params),
    staleTime: 1 * 60 * 1000, // 1 minute - frequently updated
  });
}

/**
 * Hook để lấy danh sách bài tập của khóa học
 */
export function useCourseAssignments(courseId: string) {
  return useQuery({
    queryKey: ['instructor-course-assignments', courseId],
    queryFn: () => instructorApi.getCourseAssignments(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook để lấy danh sách bài nộp của một bài tập
 */
export function useAssignmentSubmissions(assignmentId: string, params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['instructor-assignment-submissions', assignmentId, params],
    queryFn: () => instructorApi.getAssignmentSubmissions(assignmentId, params),
    enabled: !!assignmentId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook để chấm điểm bài nộp
 */
export function useGradeSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: { score: number; feedback?: string } }) =>
      instructorApi.gradeSubmission(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-pending-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-assignment-submissions'] });
    },
  });
}

/**
 * Hook để xóa học viên khỏi khóa học
 */
export function useUnenrollStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => instructorApi.unenrollStudent(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.allStudents() });
      queryClient.invalidateQueries({ queryKey: instructorCourseKeys.dashboard() });
    },
  });
}

/**
 * Hook để gửi thông báo hàng loạt
 */
export function useSendBulkNotification() {
  return useMutation({
    mutationFn: (data: {
      student_ids: string[];
      course_id?: string;
      title: string;
      message: string;
      type?: string;
    }) => instructorApi.sendBulkNotification(data),
  });
}

// ===== TYPE EXPORTS =====
export type {
  InstructorCourse,
  CourseStats,
  CourseStudent,
  CourseSection,
  CourseLesson,
  CreateSectionData,
  UpdateSectionData,
  CreateLessonData,
  UpdateLessonData,
  UpdateCourseData,
};
