/**
 * GRADE DTOs - Grade Management Data Transfer Objects
 */

// ===================================
// GRADE DTOs
// ===================================

export interface CreateGradeDTO {
  user_id: string;
  course_id: string;
  grade_component_id: string;
  score: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
}

export interface UpdateGradeDTO {
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
}

export interface GradeResponseDTO {
  id: string;
  user_id: string;
  course_id: string;
  grade_component_id: string;
  score: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// FINAL GRADE DTOs
// ===================================

export interface CreateFinalGradeDTO {
  user_id: string;
  course_id: string;
  final_score: number;
  letter_grade?: string;
  grade_points?: number;
  is_passing?: boolean;
  calculated_at?: Date;
}

export interface UpdateFinalGradeDTO {
  final_score?: number;
  letter_grade?: string;
  grade_points?: number;
  is_passing?: boolean;
  calculated_at?: Date;
}

export interface FinalGradeResponseDTO {
  id: string;
  user_id: string;
  course_id: string;
  final_score: number;
  letter_grade?: string;
  grade_points?: number;
  is_passing: boolean;
  calculated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// GRADE COMPONENT DTOs
// ===================================

export interface CreateGradeComponentDTO {
  course_id: string;
  name: string;
  description?: string;
  weight: number;
  max_score: number;
  component_type: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'other';
  due_date?: Date;
  is_published?: boolean;
  is_required?: boolean;
  category?: string;
}

export interface UpdateGradeComponentDTO {
  name?: string;
  description?: string;
  weight?: number;
  max_score?: number;
  component_type?: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'other';
  due_date?: Date;
  is_published?: boolean;
}

export interface GradeComponentResponseDTO {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  weight: number;
  max_score: number;
  component_type: string;
  due_date?: Date;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// GRADE STATISTICS DTOs
// ===================================

export interface GradeStatisticsDTO {
  count: number;
  average: number;
  min?: number;
  max?: number;
  median?: number;
  standard_deviation?: number;
}

export interface CourseGradebookDTO {
  course_id: string;
  students: StudentGradeDTO[];
  components: GradeComponentResponseDTO[];
  statistics: GradeStatisticsDTO;
}

export interface StudentGradeDTO {
  user_id: string;
  student_name: string;
  email: string;
  grades: GradeResponseDTO[];
  final_grade?: FinalGradeResponseDTO;
  total_score?: number;
  percentage?: number;
}
