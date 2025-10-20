export interface CreateAssignmentDto {
  course_id: string;
  title: string;
  description?: string;
  max_score?: number;
  due_date?: string | Date | null;
  allow_late_submission?: boolean;
  submission_type: 'file' | 'text' | 'both';
  is_published?: boolean;
  instructions?: string;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  max_score?: number;
  due_date?: string | Date | null;
  allow_late_submission?: boolean;
  submission_type?: 'file' | 'text' | 'both';
  is_published?: boolean;
  instructions?: string;
}

export interface SubmitAssignmentDto {
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export interface UpdateSubmissionDto {
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export interface GradeSubmissionDto {
  score: number;
  feedback?: string;
}

export interface AssignmentStatisticsDto {
  total_submissions: number;
  graded_submissions: number;
  pending_submissions: number;
  average_score: number;
  late_submissions: number;
  grading_progress: number;
}

export interface AssignmentSubmissionDto {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  submitted_at: Date;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  is_late: boolean;
}



