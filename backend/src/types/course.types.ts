/**
 * Course Types
 * Defines TypeScript interfaces for course-related data structures
 */

export interface CourseInstance {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  instructor_id: string;
  category?: string;
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  currency: string;
  discount_price?: number;
  discount_percentage?: number;
  discount_start?: Date;
  discount_end?: Date;
  thumbnail?: string;
  video_intro?: string;
  duration_hours?: number;
  total_lessons: number;
  total_students: number;
  rating: number;
  total_ratings: number;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  is_featured: boolean;
  is_free: boolean;
  prerequisites?: string[];
  learning_objectives?: string[];
  tags?: string[];
  metadata?: any;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Associations
  instructor?: any;
  enrollments?: any[];
  
  // Methods
  toJSON(): any;
}

export interface CourseSettings {
  allow_enrollment?: boolean;
  require_approval?: boolean;
  enable_discussions?: boolean;
  enable_assignments?: boolean;
  enable_quizzes?: boolean;
  enable_certificates?: boolean;
  grading_policy?: 'pass_fail' | 'letter_grade' | 'percentage';
  passing_score?: number;
  max_attempts?: number;
  time_limit?: number; // in minutes
  prerequisites?: string[];
  learning_objectives?: string[];
  course_materials?: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'quiz' | 'assignment';
  url?: string;
  content?: string;
  duration?: number; // in minutes
  order: number;
  is_required: boolean;
}

export interface CourseStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  average_rating: number;
  total_ratings: number;
  completion_rate: number;
  last_activity: Date;
}

export interface CourseWithInstructor extends CourseInstance {
  instructor: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    bio?: string;
  };
  stats?: CourseStats;
}

export interface CourseEnrollmentInfo {
  is_enrolled: boolean;
  enrollment_date?: Date;
  enrollment_status?: 'active' | 'completed' | 'dropped';
  progress_percentage?: number;
  last_accessed?: Date;
}

export interface CourseWithEnrollment extends CourseWithInstructor {
  enrollment_info?: CourseEnrollmentInfo;
}

export interface CourseAnalytics {
  enrollment_trends: {
    date: string;
    enrollments: number;
  }[];
  completion_rates: {
    week: string;
    rate: number;
  }[];
  student_engagement: {
    date: string;
    active_students: number;
    time_spent: number;
  }[];
  popular_content: {
    material_id: string;
    title: string;
    views: number;
    completion_rate: number;
  }[];
}

export interface CourseSearchFilters {
  query?: string;
  status?: ('draft' | 'published' | 'archived')[];
  instructor_id?: string[];
  category?: ('programming' | 'design' | 'business' | 'marketing' | 'data-science' | 'other')[];
  level?: ('beginner' | 'intermediate' | 'advanced')[];
  tags?: string[];
  price_range?: {
    min?: number;
    max?: number;
  };
  duration_range?: {
    min?: number; // in days
    max?: number;
  };
  rating_min?: number;
  enrollment_min?: number;
}

export interface CourseRecommendation {
  course: CourseWithInstructor;
  score: number;
  reasons: string[];
}

export interface CourseExportData {
  course: CourseInstance;
  enrollments: any[];
  assignments: any[];
  submissions: any[];
  grades: any[];
  analytics: CourseAnalytics;
}
