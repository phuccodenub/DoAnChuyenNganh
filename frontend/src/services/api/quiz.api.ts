import { apiClient } from '../http/client';

/**
 * Quiz Types
 */
export interface Quiz {
  id: number;
  course_id: number;
  section_id?: number;
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
  id: number;
  quiz_id: number;
  question_type: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank';
  question_text: string;
  points: number;
  order_index: number;
  options?: QuestionOption[];
  correct_answer?: string | string[]; // Only visible after submission
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean; // Only visible after submission
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id: number;
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
  question_id: number;
  answer: string | string[];
  is_correct?: boolean;
  points_earned?: number;
}

export interface StartQuizPayload {
  quiz_id: number;
}

export interface SubmitAnswerPayload {
  attempt_id: number;
  question_id: number;
  answer: string | string[];
}

export interface SubmitQuizPayload {
  attempt_id: number;
}

export interface QuizAttemptResult extends QuizAttempt {
  quiz: {
    id: number;
    title: string;
    passing_score: number;
  };
  questions: Question[];
  percentage: number;
}

/**
 * Quiz API Service
 */
export const quizApi = {
  /**
   * Get quiz by ID
   */
  getQuiz: async (quizId: number): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
    return response.data;
  },

  /**
   * Get quiz questions (only available during active attempt)
   */
  getQuizQuestions: async (quizId: number): Promise<Question[]> => {
    const response = await apiClient.get<Question[]>(
      `/quizzes/${quizId}/questions`
    );
    return response.data;
  },

  /**
   * Start a new quiz attempt
   */
  startQuiz: async (quizId: number): Promise<QuizAttempt> => {
    const response = await apiClient.post<QuizAttempt>(
      `/quizzes/${quizId}/start`
    );
    return response.data;
  },

  /**
   * Submit answer for a question
   */
  submitAnswer: async (
    attemptId: number,
    questionId: number,
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
  submitQuiz: async (attemptId: number): Promise<QuizAttemptResult> => {
    const response = await apiClient.post<QuizAttemptResult>(
      `/quiz-attempts/${attemptId}/submit`
    );
    return response.data;
  },

  /**
   * Get quiz attempt by ID
   */
  getAttempt: async (attemptId: number): Promise<QuizAttemptResult> => {
    const response = await apiClient.get<QuizAttemptResult>(
      `/quiz-attempts/${attemptId}`
    );
    return response.data;
  },

  /**
   * Get all attempts for a quiz by current user
   */
  getAttempts: async (quizId: number): Promise<QuizAttempt[]> => {
    const response = await apiClient.get<QuizAttempt[]>(
      `/quizzes/${quizId}/attempts`
    );
    return response.data;
  },

  /**
   * Get current/active attempt for a quiz
   */
  getCurrentAttempt: async (quizId: number): Promise<QuizAttempt | null> => {
    try {
      const response = await apiClient.get<QuizAttempt>(
        `/quizzes/${quizId}/current-attempt`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

export default quizApi;
