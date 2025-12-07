import { apiClient } from '../http/client';

/**
 * Quiz Types
 */
export interface Quiz {
  id: string;
  course_id: string;
  lesson_id?: string;
  section_id?: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  is_published: boolean;
  is_practice: boolean; // true = Practice Quiz, false = Graded Quiz
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
    is_practice: boolean;
    max_attempts: number;
    shuffle_questions: boolean;
    show_correct_answers: boolean;
    available_from: string;
    available_until: string;
    is_published: boolean;
  };
  questions: Question[];
  percentage: number;
}

// ==================== INSTRUCTOR TYPES ====================

export interface CreateQuizData {
  title: string;
  description?: string;
  course_id?: string;
  section_id?: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string;
  available_until?: string;
  is_published?: boolean;
  is_practice?: boolean; // true = Practice Quiz, false = Graded Quiz
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  course_id?: string;
  section_id?: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string;
  available_until?: string;
  is_published?: boolean;
  is_practice?: boolean; // true = Practice Quiz, false = Graded Quiz
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
    const response = await apiClient.get<{ success: boolean; message: string; data: Quiz }>(`/quizzes/${quizId}`);
    // Backend trả về: { success, message, data: Quiz }
    return response.data?.data || response.data as any;
  },

  /**
   * Get quiz questions (only available during active attempt)
   */
  getQuizQuestions: async (quizId: string): Promise<Question[]> => {
    const response = await apiClient.get<any>(`/quizzes/${quizId}/questions`);
    const raw = response.data;

    const questionsArray: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

    // Chuẩn hoá options: đảm bảo có field text để UI hiển thị
    return questionsArray.map((q) => ({
      ...q,
      options: (q.options || []).map((opt: any) => ({
        ...opt,
        text: opt.text ?? opt.option_text ?? '',
      })),
    })) as Question[];
  },

  /**
   * Get quiz questions WITH answers (instructor view)
   */
  getQuizQuestionsWithAnswers: async (quizId: string): Promise<Question[]> => {
    const response = await apiClient.get<any>(`/quizzes/${quizId}/questions-with-answers`);
    const raw = response.data;

    const questionsArray: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

    return questionsArray.map((q) => ({
      ...q,
      options: (q.options || []).map((opt: any) => ({
        ...opt,
        text: opt.text ?? opt.option_text ?? '',
      })),
    })) as Question[];
  },

  /**
   * Start a new quiz attempt
   */
  startQuiz: async (quizId: string): Promise<QuizAttempt> => {
    const response = await apiClient.post<any>(
      `/quizzes/${quizId}/start`
    );
    const raw = response.data;
    // Backend: { success, message, data }
    return (raw?.data || raw) as QuizAttempt;
  },

  /**
   * Submit quiz (finish attempt)
   */
  submitQuiz: async (
    attemptId: string,
    answers: {
      question_id: string;
      selected_option_id?: string;
      selected_options?: string[];
    }[]
  ): Promise<QuizAttemptResult> => {
    const response = await apiClient.post<any>(
      `/quizzes/attempts/${attemptId}/submit`,
      { answers }
    );
    const raw = response.data;
    return (raw?.data || raw) as QuizAttemptResult;
  },

  /**
   * Get quiz attempt by ID
   */
  getAttempt: async (attemptId: string): Promise<QuizAttemptResult> => {
    const response = await apiClient.get<any>(`/quizzes/attempts/${attemptId}`);
    const raw = response.data;
    // Backend: { success, message, data }
    return (raw?.data || raw) as QuizAttemptResult;
  },

  /**
   * Get all attempts for a quiz by current user
   */
  getAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<{ success: boolean; message: string; data: QuizAttempt[] }>(
      `/quizzes/${quizId}/attempts`
    );
    // Backend trả về: { success, message, data: QuizAttempt[] }
    const attempts = response.data?.data || response.data || [];
    return Array.isArray(attempts) ? attempts : [];
  },

  /**
   * Get quiz attempts for a specific student (Instructor only)
   */
  getStudentAttempts: async (quizId: string, studentId: string): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<{ success: boolean; message: string; data: QuizAttempt[] }>(
      `/quizzes/${quizId}/attempts/student/${studentId}`
    );
    return response.data?.data || response.data || [];
  },

  /**
   * Delete all quiz attempts for a specific student (Instructor only)
   * Reset lượt làm bài cho học viên
   */
  resetStudentAttempts: async (quizId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}/attempts/student/${studentId}`);
  },

  /**
   * Get current/active attempt for a quiz
   */
  getCurrentAttempt: async (quizId: string): Promise<QuizAttempt | null> => {
    try {
      const response = await apiClient.get<any>(
        `/quizzes/${quizId}/current-attempt`
      );
      const raw = response.data;
      // Backend: { success, message, data } or directly DTO
      const dto = (raw?.data || raw) as QuizAttempt | null;
      return dto;
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
    lesson_id?: string;
    status?: 'draft' | 'published' | 'archived';
  }): Promise<{ data: Quiz[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const response = await apiClient.get<any>('/quizzes', { params });
    // Backend trả về: { success, message, data: { data: [...], pagination: {...} } }
    // Vậy response.data.data sẽ là { data: [...], pagination: {...} }
    return response.data?.data || response.data;
  },

  /**
   * Create a new quiz (Instructor only)
   */
  createQuiz: async (data: CreateQuizData): Promise<Quiz> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: Quiz }>('/quizzes', data);
    // Backend trả về: { success, message, data: Quiz }
    return response.data?.data || response.data as any;
  },

  /**
   * Update a quiz (Instructor only)
   */
  updateQuiz: async (quizId: string, data: UpdateQuizData): Promise<Quiz> => {
    const response = await apiClient.put<{ success: boolean; message: string; data: Quiz }>(`/quizzes/${quizId}`, data);
    // Backend trả về: { success, message, data: Quiz }
    return response.data?.data || response.data as any;
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
