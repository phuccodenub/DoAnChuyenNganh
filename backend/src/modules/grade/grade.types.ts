export interface CreateGradeComponentDto {
  course_id: string;
  name: string;
  description?: string;
  weight: number;
  max_score: number;
  is_required?: boolean;
  category?: string;
}

export interface UpdateGradeComponentDto {
  name?: string;
  description?: string;
  weight?: number;
  max_score?: number;
  is_required?: boolean;
  category?: string;
}

export interface UpsertGradeDto {
  user_id: string;
  grade_component_id: string;
  score: number;
  notes?: string;
}

export interface UpsertFinalGradeDto {
  user_id: string;
  course_id: string;
  final_score: number;
  letter_grade?: string;
  is_complete?: boolean;
}

export interface GradeComponentDto {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  weight: number;
  max_score: number;
  is_required: boolean;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GradeDto {
  id: string;
  user_id: string;
  course_id: string;
  grade_component_id: string;
  score: number;
  notes?: string;
  graded_by: string;
  graded_at: Date;
  component?: GradeComponentDto;
}

export interface FinalGradeDto {
  id: string;
  user_id: string;
  course_id: string;
  final_score: number;
  letter_grade: string;
  is_complete: boolean;
  calculated_at: Date;
}

export interface GradebookDto {
  course_id: string;
  components: GradeComponentDto[];
  students: StudentGradeDto[];
}

export interface StudentGradeDto {
  user_id: string;
  user_name: string;
  user_email: string;
  grades: GradeDto[];
  final_grade?: FinalGradeDto;
}

export interface GradeStatisticsDto {
  component_id: string;
  component_name: string;
  total_students: number;
  graded_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
}



