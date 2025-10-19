/**
 * QUIZ DTOs - Data Transfer Objects for Quiz Entity
 */

// ===================================
// CREATE QUIZ DTOs
// ===================================

export interface CreateQuizDTO {
  course_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  is_randomized?: boolean;
  show_results?: boolean;
}

export interface CreateQuizQuestionDTO {
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index: number;
  explanation?: string;
}

export interface CreateQuizOptionDTO {
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizQuestionOptionDTO {
  option_text: string;
  is_correct: boolean;
  order_index?: number;
}

// ===================================
// UPDATE QUIZ DTOs
// ===================================

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  is_randomized?: boolean;
  show_results?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateQuizQuestionDTO {
  question_text?: string;
  question_type?: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index?: number;
  options?: QuizQuestionOptionDTO[];
  correct_answer?: string;
  explanation?: string;
}

// ===================================
// RESPONSE DTOs
// ===================================

export interface QuizResponseDTO {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  is_randomized?: boolean;
  show_results?: boolean;
  status: string;
  total_questions?: number;
  total_points?: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestionResponseDTO {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  points: number;
  order_index: number;
  options?: QuizQuestionOptionDTO[];
  explanation?: string;
}

// ===================================
// SUBMISSION DTOs
// ===================================

export interface SubmitQuizAnswerDTO {
  question_id: string;
  selected_option_ids: string[];
  answer?: string | string[]; // For backward compatibility
}

export interface SubmitQuizAttemptDTO {
  quiz_id: string;
  answers: SubmitQuizAnswerDTO[];
}

// ===================================
// QUIZ ATTEMPT DTOs
// ===================================

export interface StartQuizAttemptDTO {
  quiz_id: string;
  user_id: string;
  attempt_number: number;
}

export interface QuizAttemptResponseDTO {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: Date;
  submitted_at?: Date;
  score?: number;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// STATISTICS DTOs
// ===================================

export interface QuizStatisticsDTO {
  total_attempts: number;
  average_score: number;
  completion_rate: number;
}

export interface QuizAttemptResultDTO {
  attempt_id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent_minutes?: number;
  submitted_at: Date;
  answers?: QuizAnswerResultDTO[];
}

export interface QuizAnswerResultDTO {
  question_id: string;
  question_text: string;
  student_answer: string | string[];
  correct_answer?: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  explanation?: string;
}
