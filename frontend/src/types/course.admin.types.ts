import { z } from 'zod';

/**
 * Course status type
 */
export type CourseStatus = 'draft' | 'published' | 'archived';

/**
 * Course difficulty type
 */
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Admin Course interface (with additional admin fields)
 */
export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  status: CourseStatus;
  difficulty: CourseDifficulty;
  price?: number;
  is_free: boolean;
  student_count: number;
  duration_hours?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Course admin filters
 */
export interface CourseAdminFilters {
  search?: string;
  status?: CourseStatus | 'all';
  instructor_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'title' | 'created_at' | 'student_count';
  sort_order?: 'asc' | 'desc';
}

/**
 * Course list response
 */
export interface CourseListResponse {
  courses: AdminCourse[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Course statistics
 */
export interface CourseStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  archived_courses: number;
  total_students: number;
  courses_this_month: number;
  total_revenue: number;
}

/**
 * Course detail with statistics
 */
export interface AdminCourseDetail extends AdminCourse {
  sections_count: number;
  lessons_count: number;
  total_duration_minutes: number;
  enrolled_students_count: number;
  completion_rate: number;
  average_rating?: number;
  total_revenue: number;
  sections?: CourseSection[];
  recent_enrollments?: EnrollmentInfo[];
}

/**
 * Course section
 */
export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons_count: number;
  duration_minutes: number;
}

/**
 * Enrollment info
 */
export interface EnrollmentInfo {
  id: string;
  student: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  enrolled_at: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

/**
 * Update course payload
 */
export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  category_id?: string;
  difficulty?: CourseDifficulty;
  price?: number;
  is_free?: boolean;
}

/**
 * Bulk course action type
 */
export type BulkCourseActionType = 'delete' | 'publish' | 'archive' | 'draft';

/**
 * Bulk course action payload
 */
export interface BulkCourseActionPayload {
  course_ids: string[];
  action: BulkCourseActionType;
}

// ============================================================================
// Category Types
// ============================================================================

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  parent?: {
    id: string;
    name: string;
  };
  course_count: number;
  is_active: boolean;
  icon_url?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Create category payload
 */
export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parent_id?: string;
  slug?: string;
  is_active?: boolean;
  icon_url?: string;
}

/**
 * Update category payload
 */
export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parent_id?: string;
  slug?: string;
  is_active?: boolean;
  icon_url?: string;
}

/**
 * Category statistics
 */
export interface CategoryStats {
  total_categories: number;
  active_categories: number;
  top_categories: Array<{
    id: string;
    name: string;
    course_count: number;
  }>;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

/**
 * Category form schema
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên danh mục là bắt buộc')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
  
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  
  parent_id: z.string().optional().nullable(),
  
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
    .optional()
    .or(z.literal('')),
  
  is_active: z.boolean().optional().default(true),
  
  icon_url: z
    .string()
    .url('URL không hợp lệ')
    .optional()
    .or(z.literal('')),
});

/**
 * Category form data type
 */
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

/**
 * Course update schema (partial)
 */
export const courseUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề là bắt buộc')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự')
    .optional(),
  
  description: z.string().optional(),
  
  category_id: z.string().optional(),
  
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  price: z.number().min(0, 'Giá không được âm').optional(),
  
  is_free: z.boolean().optional(),
  
  thumbnail_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

/**
 * Course admin filters schema
 */
export const courseAdminFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'all']).optional(),
  instructor_id: z.string().optional(),
  category_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  sort_by: z.enum(['title', 'created_at', 'student_count']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

/**
 * Course status change schema
 */
export const courseStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'Trạng thái là bắt buộc',
  }),
});

export default {
  categoryFormSchema,
  courseStatusSchema,
  courseUpdateSchema,
  courseAdminFiltersSchema,
};
