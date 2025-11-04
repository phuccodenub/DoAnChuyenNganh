export interface CreateQuizDto {
  course_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string | Date | null;
  available_until?: string | Date | null;
  is_published?: boolean;
  auto_grade?: boolean;
  time_limit_minutes?: number;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  available_from?: string | Date | null;
  available_until?: string | Date | null;
  is_published?: boolean;
  auto_grade?: boolean;
  time_limit_minutes?: number;
}

export interface CreateQuestionDto {
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index: number;
  explanation?: string;
  correct_answer?: string; // For true_false questions
}

export interface UpdateQuestionDto {
  question_text?: string;
  question_type?: 'single_choice' | 'multiple_choice' | 'true_false';
  points?: number;
  order_index?: number;
  explanation?: string;
  correct_answer?: string;
}

export interface CreateOptionDto {
  option_text: string;
  is_correct?: boolean;
  order_index: number;
}

export interface QuizAnswerDto {
  question_id: string;
  selected_option_id?: string; // for single_choice/true_false
  selected_options?: string[]; // for multiple_choice
}

export interface SubmitQuizDto {
  answers: QuizAnswerDto[];
}

export interface QuizAttemptDto {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: Date;
  submitted_at?: Date;
  score?: number;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface QuizStatisticsDto {
  total_attempts: number;
  average_score: number;
  completion_rate: number;
  highest_score?: number;
  lowest_score?: number;
}

export interface QuizResultDto {
  attempt_id: string;
  submitted_at: Date;
  score: number | null;
  answers: QuizAnswerDto[];
}





