/**
 * USER DTOs - Data Transfer Objects for User Entity
 * Fixes multiple 'any' instances in repositories and services
 */

import { UserRole, UserStatus } from '../../constants/roles.enum';

// ===================================
// CREATE USER DTOs
// ===================================

export interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  avatar?: string;
  
  // Student-specific fields (when role is 'student')
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  
  // Instructor-specific fields (when role is 'instructor')
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;
  
  // Common optional fields
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

// ===================================
// UPDATE USER DTOs
// ===================================

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  
  // Student fields
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;
  
  // Instructor fields
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;
  
  // Common fields
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  
  // Note: email, role, password are NOT updatable via this DTO
  // Use separate DTOs for those operations
}

export interface UpdateUserEmailDTO {
  email: string;
  password: string; // Require password confirmation
}

export interface UpdateUserPasswordDTO {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateUserRoleDTO {
  role: UserRole;
  // Additional fields when changing role
  student_id?: string;
  instructor_id?: string;
}

// ===================================
// RESPONSE DTOs
// ===================================

/**
 * Public user profile (safe for external exposure)
 * Excludes sensitive fields like password_hash, token_version
 */
export interface UserResponseDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  email_verified_at?: Date;
  last_login?: Date;
  
  // Student fields
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;
  
  // Instructor fields
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: string;
  research_interests?: string;
  
  // Common fields
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Minimal user info for listings
 */
export interface UserListItemDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
}

/**
 * User profile summary for cards/references
 */
export interface UserSummaryDTO {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: UserRole;
  
  // Role-specific identifier
  student_id?: string;
  instructor_id?: string;
}

// ===================================
// QUERY/FILTER DTOs
// ===================================

export interface UserFilterDTO {
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  email_verified?: boolean;
  search?: string; // Search in name, email, student_id, instructor_id
  
  // Student filters
  class?: string;
  major?: string;
  year?: number;
  
  // Instructor filters
  department?: string;
  specialization?: string;
  education_level?: string;
}

export interface UserSortDTO {
  field: 'created_at' | 'last_login' | 'first_name' | 'last_name' | 'email' | 'gpa';
  order: 'ASC' | 'DESC';
}

// ===================================
// AUTHENTICATION DTOs
// ===================================

export interface UserAuthPayloadDTO {
  id: string;
  email: string;
  role: UserRole;
  token_version: number;
}

export interface UserSessionDTO {
  user: UserResponseDTO;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ===================================
// ADMIN DTOs
// ===================================

export interface UpdateUserStatusDTO {
  status: UserStatus;
  reason?: string;
}

export interface BulkUserOperationDTO {
  user_ids: string[];
  action: 'activate' | 'suspend' | 'delete' | 'verify_email';
  reason?: string;
}

// ===================================
// EXPORT ALL
// ===================================
