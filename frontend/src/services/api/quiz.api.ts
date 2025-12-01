import { apiClient } from '../http/client';

/**
 * Quiz Types
 */
export interface Quiz {
  id: string;
  course_id: string;
  section_id?: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface Question {
  id: string;
  quiz_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'single_choice' | 'essay' | 'fill_blank';
  question_text: string;
  points: number;
  order_index: number;
  explanation?: string;
  options?: QuestionOption[];
  correct_answer?: string | string[]; // Only visible after submission
}

export interface QuestionOption {
  id: string;
  text: string;
  option_text?: string; // Backend uses this
  is_correct?: boolean; // Only visible after submission
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  max_score: number;
  passed: boolean | null;
  time_spent_minutes: number;
  answers: QuizAnswer[];
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface QuizAnswer {
  question_id: string;
  answer: string | string[];
  is_correct?: boolean;
  points_earned?: number;
}

export interface StartQuizPayload {
  quiz_id: string;
}

export interface SubmitAnswerPayload {
  attempt_id: string;
  question_id: string;
  answer: string | string[];
}

export interface SubmitQuizPayload {
  attempt_id: string;
}

export interface QuizAttemptResult extends QuizAttempt {
  quiz: {
    id: string;
    title: string;
    passing_score: number;
  };
  questions: Question[];
  percentage: number;
}

// ==================== INSTRUCTOR TYPES ====================

export interface CreateQuizData {
  title: string;
  description?: string;
  course_id: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string;
  available_until?: string;
  is_published?: boolean;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  course_id?: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string;
  available_until?: string;
  is_published?: boolean;
}

export interface CreateQuestionData {
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index?: number;
  explanation?: string;
  options?: {
    option_text: string;
    is_correct: boolean;
    order_index?: number;
  }[];
}

export interface UpdateQuestionData {
  question_text?: string;
  question_type?: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index?: number;
  explanation?: string;
  options?: {
    option_text: string;
    is_correct: boolean;
    order_index?: number;
  }[];
}

export interface CreateQuestionOptionData {
  option_text: string;
  is_correct: boolean;
}

/**
 * Quiz API Service
 */
export const quizApi = {
  /**
   * Get quiz by ID
   */
  getQuiz: async (quizId: string): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
    return response.data;
  },

  /**
   * Get quiz questions (only available during active attempt)
   */
  getQuizQuestions: async (quizId: string): Promise<Question[]> => {
    const response = await apiClient.get<Question[]>(
      `/quizzes/${quizId}/questions`
    );
    return response.data;
  },

  /**
   * Start a new quiz attempt
   */
  startQuiz: async (quizId: string): Promise<QuizAttempt> => {
    const response = await apiClient.post<QuizAttempt>(
      `/quizzes/${quizId}/start`
    );
    return response.data;
  },

  /**
   * Submit answer for a question
   */
  submitAnswer: async (
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      `/quiz-attempts/${attemptId}/answers`,
      { question_id: questionId, answer }
    );
    return response.data;
  },

  /**
   * Submit quiz (finish attempt)
   */
  submitQuiz: async (attemptId: string): Promise<QuizAttemptResult> => {
    const response = await apiClient.post<QuizAttemptResult>(
      `/quiz-attempts/${attemptId}/submit`
    );
    return response.data;
  },

  /**
   * Get quiz attempt by ID
   */
  getAttempt: async (attemptId: string): Promise<QuizAttemptResult> => {
    const response = await apiClient.get<QuizAttemptResult>(
      `/quiz-attempts/${attemptId}`
    );
    return response.data;
  },

  /**
   * Get all attempts for a quiz by current user
   */
  getAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<QuizAttempt[]>(
      `/quizzes/${quizId}/attempts`
    );
    return response.data;
  },

  /**
   * Get current/active attempt for a quiz
   */
  getCurrentAttempt: async (quizId: string): Promise<QuizAttempt | null> => {
    try {
      const response = await apiClient.get<QuizAttempt>(
        `/quizzes/${quizId}/current-attempt`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // ==================== INSTRUCTOR API ====================

  /**
   * Get all quizzes (with optional filters)
   */
  getQuizzes: async (params?: {
    page?: number;
    limit?: number;
    course_id?: string;
    status?: 'draft' | 'published' | 'archived';
  }): Promise<{ data: Quiz[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const response = await apiClient.get<{ data: Quiz[]; pagination: any }>('/quizzes', { params });
    return response.data;
  },

  /**
   * Create a new quiz (Instructor only)
   */
  createQuiz: async (data: CreateQuizData): Promise<Quiz> => {
    const response = await apiClient.post<Quiz>('/quizzes', data);
    return response.data;
  },

  /**
   * Update a quiz (Instructor only)
   */
  updateQuiz: async (quizId: string, data: UpdateQuizData): Promise<Quiz> => {
    const response = await apiClient.put<Quiz>(`/quizzes/${quizId}`, data);
    return response.data;
  },

  /**
   * Delete a quiz (Instructor only)
   */
  deleteQuiz: async (quizId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}`);
  },

  /**
   * Publish/unpublish a quiz
   */
  publishQuiz: async (quizId: string, isPublished: boolean): Promise<Quiz> => {
    const response = await apiClient.put<Quiz>(`/quizzes/${quizId}`, { is_published: isPublished });
    return response.data;
  },

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Get a single question by ID
   */
  getQuestion: async (quizId: string, questionId: string): Promise<Question> => {
    const response = await apiClient.get<Question>(`/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  },

  /**
   * Add a question to a quiz (Instructor only)
   */
  addQuestion: async (quizId: string, data: CreateQuestionData): Promise<Question> => {
    const response = await apiClient.post<Question>(`/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  /**
   * Update a question (Instructor only)
   */
  updateQuestion: async (quizId: string, questionId: string, data: UpdateQuestionData): Promise<Question> => {
    const response = await apiClient.put<Question>(`/quizzes/${quizId}/questions/${questionId}`, data);
    return response.data;
  },

  /**
   * Delete a question (Instructor only)
   */
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  /**
   * Reorder questions in a quiz
   */
  reorderQuestions: async (quizId: string, questionIds: string[]): Promise<void> => {
    await apiClient.put(`/quizzes/${quizId}/questions/reorder`, { question_ids: questionIds });
  },

  /**
   * Bulk add questions to a quiz
   */
  bulkAddQuestions: async (quizId: string, questions: CreateQuestionData[]): Promise<Question[]> => {
    const results: Question[] = [];
    for (const question of questions) {
      const result = await apiClient.post<Question>(`/quizzes/${quizId}/questions`, question);
      results.push(result.data);
    }
    return results;
  },
};

export default quizApi;
