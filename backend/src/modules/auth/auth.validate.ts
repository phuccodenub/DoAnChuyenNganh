import { body, param, query } from 'express-validator';
import { validatorsUtils } from '../../utils/validators.util';

/**
 * Auth module validation schemas
 */

export const authValidation = {
  /**
   * Validation for user registration
   */
  register: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(value => value?.toLowerCase()),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .custom(validatorsUtils.isStrongPassword)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('first_name')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('last_name')
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['student', 'instructor', 'admin', 'super_admin'])
      .withMessage('Role must be student, instructor, admin, or super_admin'),
    
    body('phone')
      .optional()
      .custom(validatorsUtils.isPhoneNumber)
      .withMessage('Invalid phone number format'),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid ISO date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Date of birth cannot be in the future');
        }
        return true;
      }),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
    
    body('address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Address must not exceed 200 characters')
      .customSanitizer(value => value?.trim()),
    
    // Student-specific fields
    body('student_id')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Student ID must be between 3 and 20 characters')
      .customSanitizer(value => value?.trim()),
    
    body('class')
      .optional()
      .isLength({ min: 2, max: 20 })
      .withMessage('Class must be between 2 and 20 characters')
      .customSanitizer(value => value?.trim()),
    
    body('major')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Major must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('year')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Year must be between 1 and 10')
      .toInt(),
    
    body('gpa')
      .optional()
      .isFloat({ min: 0, max: 4 })
      .withMessage('GPA must be between 0 and 4')
      .toFloat(),
    
    // Instructor-specific fields
    body('instructor_id')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Instructor ID must be between 3 and 20 characters')
      .customSanitizer(value => value?.trim()),
    
    body('department')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Department must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('specialization')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Specialization must be between 2 and 100 characters')
      .customSanitizer(value => value?.trim()),
    
    body('experience_years')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Experience years must be between 0 and 50')
      .toInt(),
    
    body('education_level')
      .optional()
      .isIn(['bachelor', 'master', 'phd', 'other'])
      .withMessage('Education level must be bachelor, master, phd, or other'),
    
    body('research_interests')
      .optional()
      .isArray()
      .withMessage('Research interests must be an array')
      .custom((value) => {
        if (value && value.length > 10) {
          throw new Error('Maximum 10 research interests allowed');
        }
        return true;
      })
  ],

  /**
   * Validation for user login
   */
  login: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(value => value?.toLowerCase()),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters')
  ],

  /**
   * Validation for login with 2FA
   */
  loginWith2FA: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(value => value?.toLowerCase()),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
    
    body('code')
      .notEmpty()
      .withMessage('2FA code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA code must be 6 digits')
      .isNumeric()
      .withMessage('2FA code must be numeric')
  ],

  /**
   * Validation for refresh token
   */
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Invalid refresh token format')
  ],

  /**
   * Validation for change password
   */
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Current password must be between 1 and 128 characters'),
    
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .custom(validatorsUtils.isStrongPassword)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],

  /**
   * Validation for forgot password
   */
  forgotPassword: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(value => value?.toLowerCase())
  ],

  /**
   * Validation for reset password
   */
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Invalid reset token format'),
    
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .custom(validatorsUtils.isStrongPassword)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],

  /**
   * Validation for email verification
   */
  verifyEmail: [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Invalid verification token format')
  ],

  /**
   * Validation for resend verification email
   */
  resendVerificationEmail: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .customSanitizer(value => value?.toLowerCase())
  ],

  /**
   * Validation for enable 2FA
   */
  enable2FA: [
    // No body validation needed for enable 2FA
    // The user ID comes from the authenticated request
  ],

  /**
   * Validation for verify 2FA setup
   */
  verify2FASetup: [
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits')
      .isNumeric()
      .withMessage('Verification code must be numeric')
  ],

  /**
   * Validation for disable 2FA
   */
  disable2FA: [
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits')
      .isNumeric()
      .withMessage('Verification code must be numeric')
  ],

  /**
   * Validation for user ID parameter
   */
  userId: [
    param('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid user ID format')
  ],

  /**
   * Validation for token parameter
   */
  token: [
    param('token')
      .notEmpty()
      .withMessage('Token is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Invalid token format')
  ],

  /**
   * Validation for logout
   */
  logout: [
    // No validation needed for logout
    // The user ID comes from the authenticated request
  ],

  /**
   * Validation for get profile
   */
  getProfile: [
    // No validation needed for get profile
    // The user ID comes from the authenticated request
  ],

  /**
   * Validation for update profile
   */
  updateProfile: [
    body('first_name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('last_name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('phone')
      .optional()
      .custom(validatorsUtils.isPhoneNumber)
      .withMessage('Invalid phone number format'),
    
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters')
      .customSanitizer(value => value?.trim()),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid ISO date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Date of birth cannot be in the future');
        }
        return true;
      }),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
    
    body('address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Address must not exceed 200 characters')
      .customSanitizer(value => value?.trim()),
    
    body('emergency_contact')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Emergency contact must not exceed 100 characters')
      .customSanitizer(value => value?.trim()),
    
    body('emergency_phone')
      .optional()
      .custom(validatorsUtils.isPhoneNumber)
      .withMessage('Invalid emergency phone number format')
  ],

  /**
   * Validation for device info
   */
  deviceInfo: [
    body('device')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Device must be between 1 and 100 characters')
      .customSanitizer(value => value?.trim()),
    
    body('ipAddress')
      .optional()
      .custom(validatorsUtils.isIPv4)
      .withMessage('Invalid IP address format'),
    
    body('userAgent')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('User agent must be between 1 and 500 characters')
      .customSanitizer(value => value?.trim())
  ]
};
