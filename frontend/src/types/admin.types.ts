import { z } from 'zod';

/**
 * User role type
 */
export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';

/**
 * User status type
 */
export type UserStatus = 'active' | 'suspended';

/**
 * Admin User interface (extended from base User)
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  email_verified: boolean;
  two_factor_enabled?: boolean;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  // Admin-specific fields
  status: UserStatus;
}

/**
 * User statistics by role
 */
export interface UserStatsByRole {
  student: number;
  instructor: number;
  admin: number;
  super_admin: number;
  total: number;
}

/**
 * User statistics by status
 */
export interface UserStatsByStatus {
  active: number;
  suspended: number;
  total: number;
}

/**
 * User statistics for individual user
 */
export interface UserStats {
  // Student stats
  enrolled_courses_count?: number;
  completed_courses_count?: number;
  quiz_average_score?: number;
  // Instructor stats
  courses_created_count?: number;
  total_students_count?: number;
  total_revenue?: number;
}

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
  total_users: number;
  users_by_role: UserStatsByRole;
  users_by_status: UserStatsByStatus;
  total_courses: number;
  courses_published: number;
  courses_draft: number;
  courses_archived: number;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  revenue_this_month: number;
}

/**
 * User growth data point
 */
export interface UserGrowthData {
  date: string;
  count: number;
}

/**
 * Course enrollment trend data point
 */
export interface EnrollmentTrendData {
  date: string;
  enrollments: number;
}

/**
 * Top instructor data
 */
export interface TopInstructor {
  id: string;
  full_name: string;
  avatar_url?: string;
  total_enrollments: number;
  total_courses: number;
}

/**
 * Recent activity type
 */
export type ActivityType = 'user_registration' | 'course_creation' | 'enrollment';

/**
 * Recent activity
 */
export interface RecentActivity {
  id: string;
  type: ActivityType;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  description: string;
  created_at: string;
}

/**
 * User list response
 */
export interface UserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * User list filters
 */
export interface UserListFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
}

/**
 * Create user payload
 */
export interface CreateUserPayload {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  avatar_url?: string;
}

/**
 * Update user payload
 */
export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  bio?: string;
  avatar_url?: string;
}

/**
 * Bulk action type
 */
export type BulkActionType = 'delete' | 'activate' | 'suspend';

/**
 * Bulk action payload
 */
export interface BulkActionPayload {
  user_ids: string[];
  action: BulkActionType;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

/**
 * User form schema for create/edit
 */
export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự'),
  
  full_name: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .max(255, 'Họ tên không được vượt quá 255 ký tự'),
  
  role: z.enum(['student', 'instructor', 'admin', 'super_admin'], {
    required_error: 'Vai trò là bắt buộc',
  }),
  
  status: z.enum(['active', 'suspended'], {
    required_error: 'Trạng thái là bắt buộc',
  }),
  
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .optional()
    .or(z.literal('')),
  
  bio: z.string().max(1000, 'Tiểu sử không được vượt quá 1000 ký tự').optional(),
  
  avatar_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

/**
 * User form data type (inferred from schema)
 */
export type UserFormData = z.infer<typeof userFormSchema>;

/**
 * User list filters schema
 */
export const userListFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['student', 'instructor', 'admin', 'super_admin', 'all']).optional(),
  status: z.enum(['active', 'suspended', 'all']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  sort_by: z.enum(['created_at', 'full_name', 'email']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export default {
  userFormSchema,
  userListFiltersSchema,
};
