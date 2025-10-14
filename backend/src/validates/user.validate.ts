import { z } from 'zod';
import { baseValidation } from './base.validate';
import { validatorsUtils } from '../utils/validators.util';

// User validation schemas
export const userValidation = {
  // Register user schema
  register: z.object({
    email: baseValidation.email,
    password: baseValidation.password,
    first_name: baseValidation.name,
    last_name: baseValidation.name,
    phone: baseValidation.phone,
    role: z.enum(['student', 'instructor', 'admin', 'super_admin']).default('student'),
    
    // ===== STUDENT FIELDS =====
    student_id: z.string().max(20, 'Student ID must be less than 20 characters').optional(),
    class: z.string().max(50, 'Class must be less than 50 characters').optional(),
    major: z.string().max(100, 'Major must be less than 100 characters').optional(),
    year: z.number().int().min(2000).max(2030, 'Year must be between 2000 and 2030').optional(),

    // ===== INSTRUCTOR FIELDS =====
    instructor_id: z.string().max(20, 'Instructor ID must be less than 20 characters').optional(),
    department: z.string().max(100, 'Department must be less than 100 characters').optional(),
    specialization: z.string().max(200, 'Specialization must be less than 200 characters').optional(),
    experience_years: z.number().int().min(0).max(50, 'Experience years must be between 0 and 50').optional(),
    education_level: z.enum(['bachelor', 'master', 'phd', 'professor']).optional(),

    // ===== COMMON FIELDS =====
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().max(500, 'Address must be less than 500 characters').optional()
  }),
  
  // Login schema
  login: z.object({
    email: baseValidation.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  // Create user schema (Admin only)
  createUser: z.object({
    email: baseValidation.email,
    password: baseValidation.password.optional(),
    first_name: baseValidation.name,
    last_name: baseValidation.name,
    phone: baseValidation.phone,
    bio: baseValidation.bio,
    avatar: baseValidation.url,
    role: z.enum(['student', 'instructor', 'admin', 'super_admin']).default('student')
  }),
  
  // Update user profile schema (for authenticated users)
  updateProfile: z.object({
    first_name: baseValidation.name.optional(),
    last_name: baseValidation.name.optional(),
    phone: baseValidation.phone.optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
    
    // ===== STUDENT FIELDS =====
    student_id: z.string().max(20, 'Student ID must be less than 20 characters').optional(),
    class: z.string().max(50, 'Class must be less than 50 characters').optional(),
    major: z.string().max(100, 'Major must be less than 100 characters').optional(),
    year: z.number().int().min(2000).max(2030, 'Year must be between 2000 and 2030').optional(),
    gpa: z.number().min(0).max(4, 'GPA must be between 0 and 4').optional(),

    // ===== INSTRUCTOR FIELDS =====
    instructor_id: z.string().max(20, 'Instructor ID must be less than 20 characters').optional(),
    department: z.string().max(100, 'Department must be less than 100 characters').optional(),
    specialization: z.string().max(200, 'Specialization must be less than 200 characters').optional(),
    experience_years: z.number().int().min(0).max(50, 'Experience years must be between 0 and 50').optional(),
    education_level: z.enum(['bachelor', 'master', 'phd', 'professor']).optional(),
    research_interests: z.string().max(1000, 'Research interests must be less than 1000 characters').optional(),

    // ===== COMMON FIELDS =====
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().max(500, 'Address must be less than 500 characters').optional(),
    emergency_contact: z.string().max(100, 'Emergency contact must be less than 100 characters').optional(),
    emergency_phone: baseValidation.phone.optional()
  }),
  
  // Update user schema
  updateUser: z.object({
    first_name: baseValidation.name.optional(),
    last_name: baseValidation.name.optional(),
    phone: baseValidation.phone,
    bio: baseValidation.bio,
    avatar: baseValidation.url,
    status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional()
  }),
  
  // Change password schema
  changePassword: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: baseValidation.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // User ID parameter schema
  userId: z.object({
    id: baseValidation.uuid
  }),
  
  // User query schema
  userQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).transform(val => val.toUpperCase()).default('DESC'),
    role: z.enum(['student', 'instructor', 'admin', 'super_admin']).optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
    search: z.string().min(1, 'Search term cannot be empty').optional()
  }),
  
  // User role parameter schema
  userRole: z.object({
    role: z.enum(['student', 'instructor', 'admin', 'super_admin'])
  }),

  // Update user status schema
  updateUserStatus: z.object({
    status: z.enum(['active', 'inactive', 'suspended', 'pending'])
  })
};

// User validation helpers
export const userValidateHelpers = {
  // Validate user role
  isValidUserRole: (role: string): boolean => {
    return ['student', 'instructor', 'admin', 'super_admin'].includes(role);
  },
  
  // Validate user status
  isValidUserStatus: (status: string): boolean => {
    return ['active', 'inactive', 'suspended', 'pending'].includes(status);
  },
  
  // Validate password confirmation
  validatePasswordConfirmation: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },
  
  // Sanitize user input
  sanitizeUserInput: (input: any) => {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  },
  
  // Validate user permissions
  validateUserPermissions: (userRole: string, requiredRoles: string[]): boolean => {
    return requiredRoles.includes(userRole);
  }
};

// Legacy export for backward compatibility
export const userSchemas = userValidation;
