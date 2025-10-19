import { CourseInstance, UserInstance, EnrollmentInstance } from '../../types/model.types';

/**
 * Course-related TypeScript types and interfaces
 */

// ===== COURSE DATA TYPES =====

export interface CreateCourseData {
  title: string;
  description: string;
  instructor_id: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in hours
  price?: number;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  start_date?: Date;
  end_date?: Date;
  max_students?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  course_materials?: string[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  price?: number;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  start_date?: Date;
  end_date?: Date;
  max_students?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  course_materials?: string[];
}

// ===== QUERY OPTIONS =====

export interface GetCoursesOptions {
  page: number;
  limit: number;
  status?: string;
  instructor_id?: string;
  search?: string;
}

export interface GetCoursesByInstructorOptions {
  page: number;
  limit: number;
  status?: string;
}

export interface GetEnrolledCoursesOptions {
  page: number;
  limit: number;
  status?: string;
}

export interface GetCourseStudentsOptions {
  page: number;
  limit: number;
}

// ===== RESPONSE TYPES =====

export interface CoursesResponse {
  data: CourseInstance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentsResponse {
  data: UserInstance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== COURSE WITH RELATIONS =====

export interface CourseWithInstructor extends CourseInstance {
  instructor: Pick<UserInstance, 'id' | 'first_name' | 'last_name' | 'email'>;
}

export interface CourseWithEnrollments extends CourseInstance {
  enrollments: Pick<EnrollmentInstance, 'id' | 'created_at' | 'status'>[];
  instructor: Pick<UserInstance, 'id' | 'first_name' | 'last_name' | 'email'>;
}

export interface UserWithEnrollments extends UserInstance {
  enrollments: Pick<EnrollmentInstance, 'id' | 'created_at' | 'status'>[];
}

// ===== COURSE STATISTICS =====

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  averageRating?: number;
  totalStudents: number;
}

export interface InstructorStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  averageRating?: number;
}

// ===== COURSE FILTERS =====

export interface CourseFilters {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  instructor_id?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  hasEnrollments?: boolean;
  search?: string;
}

// ===== COURSE SORT OPTIONS =====

export type CourseSortField = 'title' | 'created_at' | 'updated_at' | 'price' | 'duration' | 'enrollment_count';
export type SortOrder = 'ASC' | 'DESC';

export interface CourseSortOptions {
  field: CourseSortField;
  order: SortOrder;
}

// ===== COURSE VALIDATION =====

export interface CourseValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  instructor_id: {
    required: boolean;
  };
  category: {
    required: boolean;
    allowedValues: string[];
  };
  level: {
    required: boolean;
    allowedValues: ('beginner' | 'intermediate' | 'advanced')[];
  };
  duration: {
    min: number;
    max: number;
  };
  price: {
    min: number;
    max: number;
  };
  max_students: {
    min: number;
    max: number;
  };
}

// ===== COURSE PERMISSIONS =====

export interface CoursePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canEnroll: boolean;
  canUnenroll: boolean;
  canViewStudents: boolean;
  canManageStudents: boolean;
}

// ===== COURSE EVENTS =====

export interface CourseEvent {
  type: 'created' | 'updated' | 'deleted' | 'published' | 'archived' | 'enrolled' | 'unenrolled';
  courseId: string;
  userId?: string;
  timestamp: Date;
  data?: any;
}

// ===== COURSE SEARCH =====

export interface CourseSearchOptions {
  query: string;
  filters?: CourseFilters;
  sort?: CourseSortOptions;
  pagination: {
    page: number;
    limit: number;
  };
}

export interface CourseSearchResult {
  courses: CourseInstance[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  facets?: {
    categories: { [key: string]: number };
    levels: { [key: string]: number };
    instructors: { [key: string]: number };
  };
}

