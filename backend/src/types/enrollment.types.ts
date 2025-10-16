/**
 * Enrollment Types
 * Defines TypeScript interfaces for enrollment-related data structures
 */

export interface EnrollmentInstance {
  id: string;
  user_id: string;
  course_id: string;
  status: string; // 'pending', 'enrolled', 'completed', 'dropped'
  enrollment_type: string; // 'free', 'paid'
  payment_status: string; // 'pending', 'paid', 'failed', 'refunded'
  payment_method?: string;
  payment_id?: string;
  amount_paid?: number;
  currency?: string;
  progress_percentage: number; // 0-100
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at?: Date;
  completion_date?: Date;
  certificate_issued: boolean;
  certificate_url?: string;
  rating?: number; // 1-5
  review?: string;
  review_date?: Date;
  access_expires_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  
  // Associations
  student?: any;
  course?: any;
  
  // Methods
  toJSON(): any;
}

export interface CreateEnrollmentPayload {
  user_id: string;
  course_id: string;
  status?: 'enrolled' | 'completed' | 'dropped';
}

export interface UpdateEnrollmentPayload {
  status?: 'enrolled' | 'completed' | 'dropped';
  progress?: number; // legacy naming in some places
  progress_percentage?: number; // aligns with model
  grade?: number;
  completed_at?: Date; // legacy naming in some places
  completion_date?: Date; // aligns with model
  rating?: number;
}

export interface EnrollmentFilterOptions {
  page?: number;
  limit?: number;
  user_id?: string;
  course_id?: string;
  status?: 'enrolled' | 'completed' | 'dropped';
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EnrollmentWithDetails extends EnrollmentInstance {
  student: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
    description?: string;
    instructor_id: string;
    status: string;
    thumbnail?: string;
    price: number;
    currency: string;
  };
}

export interface EnrollmentStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  dropped_enrollments: number;
  average_progress: number;
  average_grade: number;
  completion_rate: number;
}

export interface CourseEnrollmentStats {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  average_progress: number;
  average_grade: number;
  completion_rate: number;
}

export interface UserEnrollmentStats {
  user_id: string;
  username: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  average_progress: number;
  average_grade: number;
  completion_rate: number;
}

export interface EnrollmentAnalytics {
  enrollment_trends: {
    date: string;
    enrollments: number;
  }[];
  status_distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  progress_distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  grade_distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  top_courses: {
    course_id: string;
    course_title: string;
    enrollments: number;
    completion_rate: number;
  }[];
  top_students: {
    user_id: string;
    username: string;
    enrollments: number;
    average_grade: number;
  }[];
}
