/**
 * React Query hooks for Assignment management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi, type Assignment, type Submission, type SubmissionWithStudent, type CreateAssignmentPayload } from '@/services/api/assignment.api';
import toast from 'react-hot-toast';

// Query keys
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  courseAssignments: (courseId: string) => [...assignmentKeys.all, 'course', courseId] as const,
  courseStats: (courseId: string) => [...assignmentKeys.all, 'course', courseId, 'stats'] as const,
  submissions: (assignmentId: string) => [...assignmentKeys.all, assignmentId, 'submissions'] as const,
  stats: (assignmentId: string) => [...assignmentKeys.all, assignmentId, 'stats'] as const,
  pendingGrading: () => [...assignmentKeys.all, 'pending-grading'] as const,
  coursePendingGrading: (courseId: string) => [...assignmentKeys.all, 'course', courseId, 'pending-grading'] as const,
  mySubmission: (assignmentId: string) => [...assignmentKeys.all, assignmentId, 'my-submission'] as const,
};

// ===================================
// STUDENT HOOKS
// ===================================

/**
 * Get assignment by ID
 */
export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(assignmentId),
    queryFn: () => assignmentApi.getAssignment(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Get current user's submission for an assignment
 */
export function useMySubmission(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.mySubmission(assignmentId),
    queryFn: () => assignmentApi.getSubmission(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Submit assignment mutation
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: { submission_text?: string; file_urls?: string[] } }) =>
      assignmentApi.submitAssignment(assignmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.mySubmission(variables.assignmentId) });
      toast.success('Nộp bài thành công!');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi nộp bài: ${error.message}`);
    },
  });
}

// ===================================
// INSTRUCTOR HOOKS
// ===================================

/**
 * Get all assignments for a course
 */
export function useCourseAssignments(courseId: string) {
  return useQuery({
    queryKey: assignmentKeys.courseAssignments(courseId),
    queryFn: () => assignmentApi.getCourseAssignments(courseId),
    enabled: !!courseId,
  });
}

/**
 * Get assignment statistics for a course
 */
export function useCourseAssignmentStats(courseId: string) {
  return useQuery({
    queryKey: assignmentKeys.courseStats(courseId),
    queryFn: () => assignmentApi.getCourseAssignmentStats(courseId),
    enabled: !!courseId,
  });
}

/**
 * Get all submissions for an assignment
 */
export function useAssignmentSubmissions(assignmentId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...assignmentKeys.submissions(assignmentId), { page, limit }],
    queryFn: () => assignmentApi.getAssignmentSubmissions(assignmentId, page, limit),
    enabled: !!assignmentId,
  });
}

/**
 * Get assignment statistics
 */
export function useAssignmentStats(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.stats(assignmentId),
    queryFn: () => assignmentApi.getAssignmentStats(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Get pending submissions for grading (all courses)
 */
export function usePendingGrading(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...assignmentKeys.pendingGrading(), { page, limit }],
    queryFn: () => assignmentApi.getPendingGrading(page, limit),
  });
}

/**
 * Get pending submissions for a specific course
 */
export function useCoursePendingGrading(courseId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...assignmentKeys.coursePendingGrading(courseId), { page, limit }],
    queryFn: () => assignmentApi.getCoursePendingGrading(courseId, page, limit),
    enabled: !!courseId,
  });
}

/**
 * Grade submission mutation
 */
export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: { score: number; feedback?: string } }) =>
      assignmentApi.gradeSubmission(submissionId, data),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Chấm điểm thành công!');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi chấm điểm: ${error.message}`);
    },
  });
}

/**
 * Create assignment mutation
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentPayload) => assignmentApi.createAssignment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.courseAssignments(variables.course_id) });
      toast.success('Tạo bài tập thành công!');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo bài tập: ${error.message}`);
    },
  });
}

/**
 * Update assignment mutation
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: Partial<CreateAssignmentPayload> }) =>
      assignmentApi.updateAssignment(assignmentId, data),
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignment.id) });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.courseAssignments(assignment.course_id) });
      toast.success('Cập nhật bài tập thành công!');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật bài tập: ${error.message}`);
    },
  });
}

/**
 * Delete assignment mutation
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => assignmentApi.deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Xóa bài tập thành công!');
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa bài tập: ${error.message}`);
    },
  });
}

// Export types
export type { Assignment, Submission, SubmissionWithStudent, CreateAssignmentPayload };
