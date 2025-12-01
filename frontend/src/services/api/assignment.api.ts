import { apiClient } from '../http/client';

/**
 * Assignment Types
 */
export interface Assignment {
  id: string;
  course_id: string;
  section_id?: string;
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
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text: string | null;
  file_urls: string[];
  submitted_at: string;
  status: 'submitted' | 'graded' | 'late' | 'draft';
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by?: {
    id: string;
    full_name: string;
  };
  is_late: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmitAssignmentPayload {
  assignment_id: string;
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
  getAssignment: async (assignmentId: string): Promise<Assignment> => {
    const response = await apiClient.get<Assignment>(
      `/assignments/${assignmentId}`
    );
    return response.data;
  },

  /**
   * Get all assignments for a course
   */
  getAssignments: async (courseId: string): Promise<Assignment[]> => {
    const response = await apiClient.get<Assignment[]>(
      `/courses/${courseId}/assignments`
    );
    return response.data;
  },

  /**
   * Submit assignment
   */
  submitAssignment: async (
    assignmentId: string,
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
  uploadFile: async (assignmentId: string, file: File): Promise<{ url: string }> => {
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
  getSubmission: async (assignmentId: string): Promise<Submission | null> => {
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
  getSubmissionById: async (submissionId: string): Promise<Submission> => {
    const response = await apiClient.get<Submission>(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  /**
   * Update submission (draft)
   */
  updateSubmission: async (
    submissionId: string,
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
  deleteFile: async (submissionId: string, fileUrl: string): Promise<void> => {
    await apiClient.delete(`/submissions/${submissionId}/files`, {
      data: { file_url: fileUrl },
    });
  },

  // ===================================
  // INSTRUCTOR APIs
  // ===================================

  /**
   * Get all assignments for a course (instructor)
   */
  getCourseAssignments: async (courseId: string): Promise<Assignment[]> => {
    const response = await apiClient.get<{ data: Assignment[] }>(
      `/assignments/course/${courseId}`
    );
    return response.data.data || response.data;
  },

  /**
   * Get assignment statistics for a course
   */
  getCourseAssignmentStats: async (courseId: string): Promise<{
    total_assignments: number;
    total_submissions: number;
    pending_grading: number;
    graded_submissions: number;
    average_score: number;
    assignments: Array<{
      id: string;
      title: string;
      due_date: string | null;
      total_submissions: number;
      pending_grading: number;
      average_score: number;
    }>;
  }> => {
    const response = await apiClient.get(`/assignments/course/${courseId}/stats`);
    return response.data.data || response.data;
  },

  /**
   * Get all submissions for an assignment (instructor)
   */
  getAssignmentSubmissions: async (
    assignmentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    rows: SubmissionWithStudent[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get(
      `/assignments/${assignmentId}/submissions`,
      { params: { page, limit } }
    );
    return response.data.data || response.data;
  },

  /**
   * Get assignment statistics
   */
  getAssignmentStats: async (assignmentId: string): Promise<{
    total_submissions: number;
    graded_submissions: number;
    pending_submissions: number;
    average_score: number;
    late_submissions: number;
    grading_progress: number;
  }> => {
    const response = await apiClient.get(`/assignments/${assignmentId}/stats`);
    return response.data.data || response.data;
  },

  /**
   * Get pending submissions for grading (all courses)
   */
  getPendingGrading: async (page: number = 1, limit: number = 20): Promise<{
    rows: SubmissionWithStudent[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get('/assignments/pending-grading', {
      params: { page, limit }
    });
    return response.data.data || response.data;
  },

  /**
   * Get pending submissions for a specific course
   */
  getCoursePendingGrading: async (
    courseId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    rows: SubmissionWithStudent[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get(
      `/assignments/course/${courseId}/pending-grading`,
      { params: { page, limit } }
    );
    return response.data.data || response.data;
  },

  /**
   * Grade a submission
   */
  gradeSubmission: async (
    submissionId: string,
    data: { score: number; feedback?: string }
  ): Promise<Submission> => {
    const response = await apiClient.post<{ data: Submission }>(
      `/assignments/submissions/${submissionId}/grade`,
      data
    );
    return response.data.data || response.data;
  },

  /**
   * Create assignment (instructor)
   */
  createAssignment: async (data: CreateAssignmentPayload): Promise<Assignment> => {
    const response = await apiClient.post<{ data: Assignment }>('/assignments', data);
    return response.data.data || response.data;
  },

  /**
   * Update assignment (instructor)
   */
  updateAssignment: async (
    assignmentId: string,
    data: Partial<CreateAssignmentPayload>
  ): Promise<Assignment> => {
    const response = await apiClient.put<{ data: Assignment }>(
      `/assignments/${assignmentId}`,
      data
    );
    return response.data.data || response.data;
  },

  /**
   * Delete assignment (instructor)
   */
  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/assignments/${assignmentId}`);
  },
};

// Additional types for instructor APIs
export interface SubmissionWithStudent extends Submission {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  assignment?: {
    id: string;
    title: string;
    max_score: number;
    due_date: string | null;
    course?: {
      id: string;
      title: string;
    };
  };
}

export interface CreateAssignmentPayload {
  course_id: string;
  title: string;
  description?: string;
  max_score: number;
  due_date?: string;
  allow_late_submission?: boolean;
  submission_type?: 'text' | 'file' | 'both';
  is_published?: boolean;
}

export default assignmentApi;
