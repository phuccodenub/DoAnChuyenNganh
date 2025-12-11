/**
 * Course Module Types
 * Defines TypeScript interfaces for course-related data structures
 */

export namespace CourseTypes {
  // Course status enum
  export type CourseStatus = 'draft' | 'published' | 'archived';

  // Course difficulty levels
  export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

  // Course categories
  export type CourseCategory = 'programming' | 'design' | 'business' | 'marketing' | 'data-science' | 'other';

  // Base course interface
  export interface Course {
    id: string;
    title: string;
    description?: string;
    instructor_id: string;
    status: CourseStatus;
    start_date?: Date;
    end_date?: Date;
    max_students: number;
    thumbnail_url?: string;
    tags: string[];
    settings: CourseSettings;
    created_at: Date;
    updated_at: Date;
  }

  // Course settings interface
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

  // Course material interface
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

  // Course creation request
  export interface CreateCourseRequest {
    title: string;
    description?: string;
    instructor_id: string;
    start_date?: Date;
    end_date?: Date;
    max_students?: number;
    thumbnail_url?: string;
    tags?: string[];
    settings?: Partial<CourseSettings>;
  }

  // Course update request
  export interface UpdateCourseRequest {
    title?: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    max_students?: number;
    thumbnail_url?: string;
    tags?: string[];
    settings?: Partial<CourseSettings>;
  }

  // Course update data
  export interface UpdateCourseData {
    title?: string;
    description?: string;
    instructor_id?: string;
    status?: CourseStatus;
    start_date?: Date;
    end_date?: Date;
    max_students?: number;
    thumbnail_url?: string;
    tags?: string[];
    settings?: Partial<CourseSettings>;
  }

  // Course creation data
  export interface CreateCourseData {
    title: string;
    description?: string;
    short_description?: string;
    instructor_id: string;
    status?: CourseStatus;
    start_date?: Date;
    end_date?: Date;
    max_students?: number;
    thumbnail?: string;
    thumbnail_url?: string;
    tags?: string[];
    settings?: CourseSettings;
    category?: string;
    category_id?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    price?: number;
    is_free?: boolean;
    language?: string;
    prerequisites?: string[];
    learning_objectives?: string[];
    metadata?: Record<string, any>;
  }

  // Course query parameters
  export interface CourseQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: CourseStatus;
    instructor_id?: string;
    category?: CourseCategory;
    level?: CourseLevel;
    tags?: string[];
    sort?: string;
    order?: 'ASC' | 'DESC';
  }

  // Course list response
  export interface CourseListResponse {
    courses: Course[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }

  // Course statistics
  export interface CourseStats {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    average_rating: number;
    total_ratings: number;
    completion_rate: number;
    last_activity: Date;
  }

  // Course with instructor details
  export interface CourseWithInstructor extends Course {
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

  // Course enrollment info
  export interface CourseEnrollmentInfo {
    is_enrolled: boolean;
    enrollment_date?: Date;
    enrollment_status?: 'active' | 'completed' | 'dropped';
    progress_percentage?: number;
    last_accessed?: Date;
  }

  // Course with enrollment info
  export interface CourseWithEnrollment extends CourseWithInstructor {
    enrollment_info?: CourseEnrollmentInfo;
  }

  // Course analytics
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

  // Course search filters
  export interface CourseSearchFilters {
    query?: string;
    status?: CourseStatus[];
    instructor_id?: string[];
    category?: CourseCategory[];
    level?: CourseLevel[];
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

  // Course recommendation
  export interface CourseRecommendation {
    course: CourseWithInstructor;
    score: number;
    reasons: string[];
  }

  // Course export data
  export interface CourseExportData {
    course: Course;
    enrollments: any[];
    assignments: any[];
    submissions: any[];
    grades: any[];
    analytics: CourseAnalytics;
  }

  // Repository helper option/response types expected by repositories
  export interface GetCoursesOptions {
    page: number;
    limit: number;
    status?: CourseStatus;
    instructor_id?: string;
    search?: string;
  }

  export interface GetCoursesByInstructorOptions {
    page: number;
    limit: number;
    status?: CourseStatus;
  }

  // Enrollment progress status for filtering enrolled courses
  export type EnrollmentProgressStatus = 'all' | 'in-progress' | 'completed' | 'not-started';

  export interface GetEnrolledCoursesOptions {
    page: number;
    limit: number;
    status?: EnrollmentProgressStatus;
    search?: string;
    sort?: 'last_accessed' | 'progress' | 'title' | 'created_at';
  }

  export interface CoursesResponse {
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
}

// Re-export types outside of namespace for compatibility
export type CreateCourseData = CourseTypes.CreateCourseData;
export type UpdateCourseData = CourseTypes.UpdateCourseData;
export type CourseStatus = CourseTypes.CourseStatus;

// Top-level exports for repository usage
export interface GetCoursesOptions {
  page: number;
  limit: number;
  status?: CourseTypes.CourseStatus;
  instructor_id?: string;
  search?: string;
  category?: string; // Category slug or ID for filtering
}

export interface GetCoursesByInstructorOptions {
  page: number;
  limit: number;
  status?: CourseTypes.CourseStatus;
}

export interface GetEnrolledCoursesOptions {
  page: number;
  limit: number;
  status?: CourseTypes.EnrollmentProgressStatus;
  search?: string;
  sort?: 'last_accessed' | 'progress' | 'title' | 'created_at';
}

export interface GetCourseStudentsOptions {
  page: number;
  limit: number;
}

export interface CoursesResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentsResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Course statistics response for instructor dashboard
 */
export interface CourseStatsResponse {
  total_students: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  avg_progress: number;
  avg_score: number;
  pending_grading: number;
  max_students: number;
  new_students_this_week: number;
}

// Aliases to support namespace-qualified imports elsewhere
export type CourseSearchFilters = CourseTypes.CourseSearchFilters;