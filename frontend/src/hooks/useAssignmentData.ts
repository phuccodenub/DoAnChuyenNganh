import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '@/services/api/assignment.api';

/**
 * Hook to fetch assignment by ID
 */
export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId],
    queryFn: () => assignmentApi.getAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all assignments for a course
 */
export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: ['assignments', 'course', courseId],
    queryFn: () => assignmentApi.getAssignments(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to submit assignment
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      payload 
    }: { 
      assignmentId: string; 
      payload: { submission_text?: string; file_urls?: string[] };
    }) => assignmentApi.submitAssignment(assignmentId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['assignments', variables.assignmentId, 'submission'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['assignments', variables.assignmentId] 
      });
    },
  });
}

/**
 * Hook to cancel submission
 */
export function useCancelSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignmentId: string) => assignmentApi.cancelSubmission(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: ['assignments', assignmentId, 'submission'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['assignments', assignmentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['student', 'assignments'] 
      });
    },
  });
}

/**
 * Hook to upload assignment file
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: ({ 
      assignmentId, 
      file 
    }: { 
      assignmentId: string; 
      file: File;
    }) => assignmentApi.uploadFile(assignmentId, file),
  });
}

/**
 * Hook to get submission by assignment ID
 */
export function useSubmission(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId, 'submission'],
    queryFn: () => assignmentApi.getSubmission(assignmentId),
    enabled: !!assignmentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get submission by ID
 */
export function useSubmissionById(submissionId: string) {
  return useQuery({
    queryKey: ['submissions', submissionId],
    queryFn: () => assignmentApi.getSubmissionById(submissionId),
    enabled: !!submissionId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to update submission (draft)
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      submissionId, 
      payload 
    }: { 
      submissionId: string; 
      payload: { submission_text?: string; file_urls?: string[] };
    }) => assignmentApi.updateSubmission(submissionId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['submissions', variables.submissionId], data);
      queryClient.invalidateQueries({ 
        queryKey: ['assignments'] 
      });
    },
  });
}

/**
 * Hook to delete file from submission
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      submissionId, 
      fileUrl 
    }: { 
      submissionId: string; 
      fileUrl: string;
    }) => assignmentApi.deleteFile(submissionId, fileUrl),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['submissions', variables.submissionId] 
      });
    },
  });
}

export default {
  useAssignment,
  useAssignments,
  useSubmitAssignment,
  useCancelSubmission,
  useUploadFile,
  useSubmission,
  useSubmissionById,
  useUpdateSubmission,
  useDeleteFile,
};
