/**
 * Quiz Service - REST API Integration
 * Handles quiz CRUD operations, attempts, and statistics
 */

import { apiClient } from './apiClient'

export interface QuizOption {
  id: string
  text: string
  is_correct: boolean
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  time_limit?: number
  explanation?: string
  options?: QuizOption[]
  correct_answer?: string
  order_index: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  course_id: string
  instructor_id: number
  time_limit?: number
  max_attempts: number
  show_correct_answers: boolean
  randomize_questions: boolean
  is_published: boolean
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
  questions?: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: number
  attempt_number: number
  started_at: string
  completed_at?: string
  score?: number
  max_score?: number
  percentage?: number
  time_spent?: number
  status: 'in_progress' | 'completed' | 'graded'
}

export interface QuizAnswer {
  id: string
  attempt_id: string
  question_id: string
  answer_text?: string
  selected_option_id?: string
  is_correct?: boolean
  points_earned?: number
  answered_at: string
}

export interface QuizStatistics {
  quiz_id: string
  total_attempts: number
  completed_attempts: number
  average_score: number
  highest_score: number
  lowest_score: number
  average_time: number
  question_statistics: Array<{
    question_id: string
    correct_answers: number
    total_answers: number
    accuracy_rate: number
  }>
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface CreateQuizData {
  title: string
  description?: string
  course_id: string
  time_limit?: number
  max_attempts?: number
  show_correct_answers?: boolean
  randomize_questions?: boolean
  start_time?: string
  end_time?: string
}

export interface CreateQuestionData {
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  time_limit?: number
  explanation?: string
  correct_answer?: string
  order_index: number
}

export interface CreateOptionData {
  text: string
  is_correct: boolean
}

export interface SubmitAnswersData {
  answers: Array<{
    question_id: string
    answer_text?: string
    selected_option_id?: string
  }>
}

export const quizService = {
  // ===== QUIZ MANAGEMENT =====
  async createQuiz(data: CreateQuizData): Promise<ApiResponse<Quiz>> {
    const res = await apiClient.post<ApiResponse<Quiz>>('/quizzes', data)
    return res.data
  },

  async getQuiz(quizId: string): Promise<ApiResponse<Quiz>> {
    const res = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`)
    return res.data
  },

  async updateQuiz(quizId: string, data: Partial<CreateQuizData>): Promise<ApiResponse<Quiz>> {
    const res = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${quizId}`, data)
    return res.data
  },

  async deleteQuiz(quizId: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/quizzes/${quizId}`)
    return res.data
  },

  // ===== QUESTIONS =====
  async addQuestion(quizId: string, data: CreateQuestionData): Promise<ApiResponse<QuizQuestion>> {
    const res = await apiClient.post<ApiResponse<QuizQuestion>>(`/quizzes/${quizId}/questions`, data)
    return res.data
  },

  async updateQuestion(questionId: string, data: Partial<CreateQuestionData>): Promise<ApiResponse<QuizQuestion>> {
    const res = await apiClient.put<ApiResponse<QuizQuestion>>(`/quizzes/questions/${questionId}`, data)
    return res.data
  },

  async deleteQuestion(questionId: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/quizzes/questions/${questionId}`)
    return res.data
  },

  async getQuizQuestions(quizId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const res = await apiClient.get<ApiResponse<QuizQuestion[]>>(`/quizzes/${quizId}/questions`)
    return res.data
  },

  async addOption(questionId: string, data: CreateOptionData): Promise<ApiResponse<QuizOption>> {
    const res = await apiClient.post<ApiResponse<QuizOption>>(`/quizzes/questions/${questionId}/options`, data)
    return res.data
  },

  // ===== ATTEMPTS =====
  async startAttempt(quizId: string): Promise<ApiResponse<QuizAttempt>> {
    const res = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/attempts`)
    return res.data
  },

  async submitAttempt(attemptId: string, data: SubmitAnswersData): Promise<ApiResponse<QuizAttempt>> {
    const res = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/attempts/${attemptId}/submit`, data)
    return res.data
  },

  async getMyAttempts(quizId: string): Promise<ApiResponse<QuizAttempt[]>> {
    const res = await apiClient.get<ApiResponse<QuizAttempt[]>>(`/quizzes/${quizId}/my-attempts`)
    return res.data
  },

  async getAttemptDetails(attemptId: string): Promise<ApiResponse<QuizAttempt & { answers: QuizAnswer[] }>> {
    const res = await apiClient.get<ApiResponse<QuizAttempt & { answers: QuizAnswer[] }>>(`/quizzes/attempts/${attemptId}`)
    return res.data
  },

  // ===== STATISTICS =====
  async getQuizStatistics(quizId: string): Promise<ApiResponse<QuizStatistics>> {
    const res = await apiClient.get<ApiResponse<QuizStatistics>>(`/quizzes/${quizId}/statistics`)
    return res.data
  },

  async getQuizAttempts(quizId: string, params?: PaginationParams): Promise<ApiResponse<{ attempts: QuizAttempt[], pagination: any }>> {
    const res = await apiClient.get<ApiResponse<{ attempts: QuizAttempt[], pagination: any }>>(`/quizzes/${quizId}/attempts`, { params })
    return res.data
  }
}
