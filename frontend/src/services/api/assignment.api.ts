import { apiClient } from '../http/client';

/**
 * Assignment Types
 */
export interface Assignment {
  id: number;
  course_id: number;
  section_id?: number;
  title: string;
  description: string;
  instructions: string | null;
  max_points: number;
  due_date: string | null;
  allow_late_submission: boolean;
  late_penalty_percent: number;
  max_file_size_mb: number;
  allowed_file_types: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    submissions: number;
  };
}

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  submission_text: string | null;
  file_urls: string[];
  submitted_at: string;
  status: 'submitted' | 'graded' | 'late' | 'draft';
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by?: {
    id: number;
    full_name: string;
  };
  is_late: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmitAssignmentPayload {
  assignment_id: number;
  submission_text?: string;
  files?: File[];
}

export interface UpdateSubmissionPayload {
  submission_text?: string;
  files?: File[];
}

/**
 * Assignment API Service
 */
export const assignmentApi = {
  /**
   * Get assignment by ID
   */
  getAssignment: async (assignmentId: number): Promise<Assignment> => {
    const response = await apiClient.get<Assignment>(
      `/assignments/${assignmentId}`
    );
    return response.data;
  },

  /**
   * Get all assignments for a course
   */
  getAssignments: async (courseId: number): Promise<Assignment[]> => {
    const response = await apiClient.get<Assignment[]>(
      `/courses/${courseId}/assignments`
    );
    return response.data;
  },

  /**
   * Submit assignment
   */
  submitAssignment: async (
    assignmentId: number,
    payload: {
      submission_text?: string;
      file_urls?: string[];
    }
  ): Promise<Submission> => {
    const response = await apiClient.post<Submission>(
      `/assignments/${assignmentId}/submit`,
      payload
    );
    return response.data;
  },

  /**
   * Upload assignment file
   */
  uploadFile: async (assignmentId: number, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ url: string }>(
      `/assignments/${assignmentId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get submission by assignment ID (current user)
   */
  getSubmission: async (assignmentId: number): Promise<Submission | null> => {
    try {
      const response = await apiClient.get<Submission>(
        `/assignments/${assignmentId}/submission`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get submission by ID
   */
  getSubmissionById: async (submissionId: number): Promise<Submission> => {
    const response = await apiClient.get<Submission>(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  /**
   * Update submission (draft)
   */
  updateSubmission: async (
    submissionId: number,
    payload: {
      submission_text?: string;
      file_urls?: string[];
    }
  ): Promise<Submission> => {
    const response = await apiClient.put<Submission>(
      `/submissions/${submissionId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete submission file
   */
  deleteFile: async (submissionId: number, fileUrl: string): Promise<void> => {
    await apiClient.delete(`/submissions/${submissionId}/files`, {
      data: { file_url: fileUrl },
    });
  },
};

export default assignmentApi;
