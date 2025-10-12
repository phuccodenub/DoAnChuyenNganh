import { z } from 'zod';
import { baseValidation } from './base.validate';
import { validatorsUtils } from '../utils/validators.util';

// Auth validation schemas
export const authValidation = {
  // Register schema
  register: z.object({
    username: baseValidation.username,
    email: baseValidation.email,
    password: baseValidation.password,
    first_name: baseValidation.name,
    last_name: baseValidation.name,
    phone: baseValidation.phone,
    role: z.enum(['student', 'instructor', 'admin', 'super_admin']).default('student')
  }),
  
  // Login schema
  login: z.object({
    username: baseValidation.username,
    password: z.string().min(1, 'Password is required')
  }),
  
  // Refresh token schema
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  }),
  
  // Change password schema
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: baseValidation.password
  }),
  
  // Forgot password schema
  forgotPassword: z.object({
    email: baseValidation.email
  }),
  
  // Reset password schema
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: baseValidation.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // Verify email schema
  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required')
  }),
  
  // Resend verification schema
  resendVerification: z.object({
    email: baseValidation.email
  }),
  
  // Login with 2FA schema
  loginWith2FA: z.object({
    username: baseValidation.username,
    password: z.string().min(1, 'Password is required'),
    code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d{6}$/, '2FA code must contain only numbers')
  }),
  
  // Verify 2FA schema
  verify2FA: z.object({
    code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d{6}$/, '2FA code must contain only numbers')
  })
};

// Auth validation helpers
export const authValidateHelpers = {
  // Validate JWT token format
  isValidJWTFormat: (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3;
  },
  
  // Validate refresh token
  validateRefreshToken: (token: string): boolean => {
    return authValidateHelpers.isValidJWTFormat(token);
  },
  
  // Validate password strength
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Validate email domain (optional)
  validateEmailDomain: (email: string, allowedDomains?: string[]): boolean => {
    if (!allowedDomains || allowedDomains.length === 0) {
      return true;
    }
    
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  },
  
  // Sanitize auth input
  sanitizeAuthInput: (input: any) => {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }
};

// Legacy export for backward compatibility
export const authSchemas = authValidation;
