const { body, param, query } = require('express-validator');
import { validatorsUtils } from '../../utils/validators.util';

/**
 * User module validation schemas
 */

export const userValidation = {
  /**
   * Validation for updating user profile
   */
  updateProfile: [
    body('first_name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('last_name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('phone')
      .optional()
      .custom((value: string) => validatorsUtils.isPhone(value))
      .withMessage('Invalid phone number format'),
    
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid ISO date')
      .custom((value: string) => {
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
      .customSanitizer((value: string) => value?.trim()),
    
    body('emergency_contact')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Emergency contact must not exceed 100 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('emergency_phone')
      .optional()
      .custom((value: string) => validatorsUtils.isPhone(value))
      .withMessage('Invalid emergency phone number format'),
    
    // Student-specific fields
    body('student_id')
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Student ID must be between 3 and 20 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('class')
      .optional()
      .isLength({ min: 2, max: 20 })
      .withMessage('Class must be between 2 and 20 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('major')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Major must be between 2 and 50 characters')
      .customSanitizer((value: string) => value?.trim()),
    
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
      .customSanitizer((value: string) => value?.trim()),
    
    body('department')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Department must be between 2 and 50 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    body('specialization')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Specialization must be between 2 and 100 characters')
      .customSanitizer((value: string) => value?.trim()),
    
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
      .custom((value: any[]) => {
        if (value && value.length > 10) {
          throw new Error('Maximum 10 research interests allowed');
        }
        return true;
      })
  ],

  /**
   * Validation for updating user preferences
   */
  updatePreferences: [
    body('theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Theme must be light, dark, or auto'),
    
    body('language')
      .optional()
      .isLength({ min: 2, max: 10 })
      .withMessage('Language must be between 2 and 10 characters'),
    
    body('timezone')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Timezone must be between 3 and 50 characters'),
    
    body('email_notifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be a boolean')
      .toBoolean(),
    
    body('push_notifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be a boolean')
      .toBoolean(),
    
    body('sms_notifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be a boolean')
      .toBoolean(),
    
    body('marketing_emails')
      .optional()
      .isBoolean()
      .withMessage('Marketing emails must be a boolean')
      .toBoolean()
  ],

  /**
   * Validation for linking social account
   */
  linkSocialAccount: [
    body('provider')
      .notEmpty()
      .withMessage('Provider is required')
      .isIn(['google', 'facebook', 'github', 'linkedin', 'twitter'])
      .withMessage('Provider must be google, facebook, github, linkedin, or twitter'),
    
    body('socialId')
      .notEmpty()
      .withMessage('Social ID is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Social ID must be between 1 and 100 characters')
  ],

  /**
   * Validation for updating notification settings
   */
  updateNotificationSettings: [
    body('email')
      .optional()
      .isObject()
      .withMessage('Email settings must be an object'),
    
    body('email.course_updates')
      .optional()
      .isBoolean()
      .withMessage('Course updates email setting must be a boolean'),
    
    body('email.announcements')
      .optional()
      .isBoolean()
      .withMessage('Announcements email setting must be a boolean'),
    
    body('email.reminders')
      .optional()
      .isBoolean()
      .withMessage('Reminders email setting must be a boolean'),
    
    body('push')
      .optional()
      .isObject()
      .withMessage('Push settings must be an object'),
    
    body('push.course_updates')
      .optional()
      .isBoolean()
      .withMessage('Course updates push setting must be a boolean'),
    
    body('push.announcements')
      .optional()
      .isBoolean()
      .withMessage('Announcements push setting must be a boolean'),
    
    body('push.reminders')
      .optional()
      .isBoolean()
      .withMessage('Reminders push setting must be a boolean'),
    
    body('sms')
      .optional()
      .isObject()
      .withMessage('SMS settings must be an object'),
    
    body('sms.urgent_updates')
      .optional()
      .isBoolean()
      .withMessage('Urgent updates SMS setting must be a boolean'),
    
    body('sms.security_alerts')
      .optional()
      .isBoolean()
      .withMessage('Security alerts SMS setting must be a boolean')
  ],

  /**
   * Validation for updating privacy settings
   */
  updatePrivacySettings: [
    body('profile_visibility')
      .optional()
      .isIn(['public', 'private', 'friends_only'])
      .withMessage('Profile visibility must be public, private, or friends_only'),
    
    body('email_visibility')
      .optional()
      .isIn(['public', 'private', 'friends_only'])
      .withMessage('Email visibility must be public, private, or friends_only'),
    
    body('phone_visibility')
      .optional()
      .isIn(['public', 'private', 'friends_only'])
      .withMessage('Phone visibility must be public, private, or friends_only'),
    
    body('show_online_status')
      .optional()
      .isBoolean()
      .withMessage('Show online status must be a boolean')
      .toBoolean(),
    
    body('allow_friend_requests')
      .optional()
      .isBoolean()
      .withMessage('Allow friend requests must be a boolean')
      .toBoolean(),
    
    body('show_last_seen')
      .optional()
      .isBoolean()
      .withMessage('Show last seen must be a boolean')
      .toBoolean(),
    
    body('data_sharing')
      .optional()
      .isObject()
      .withMessage('Data sharing settings must be an object'),
    
    body('data_sharing.analytics')
      .optional()
      .isBoolean()
      .withMessage('Analytics data sharing must be a boolean'),
    
    body('data_sharing.marketing')
      .optional()
      .isBoolean()
      .withMessage('Marketing data sharing must be a boolean'),
    
    body('data_sharing.research')
      .optional()
      .isBoolean()
      .withMessage('Research data sharing must be a boolean')
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
   * Validation for session ID parameter
   */
  sessionId: [
    param('sessionId')
      .notEmpty()
      .withMessage('Session ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid session ID format')
  ],

  /**
   * Validation for pagination query parameters
   */
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ],

  /**
   * Validation for user search
   */
  searchUsers: [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters')
      .customSanitizer((value: string) => value?.trim()),
    
    query('role')
      .optional()
      .isIn(['student', 'instructor', 'admin', 'super_admin'])
      .withMessage('Role must be student, instructor, admin, or super_admin'),
    
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be active, inactive, or suspended'),
    
    query('department')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Department must be between 2 and 50 characters'),
    
    query('major')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Major must be between 2 and 50 characters'),
    
    query('year')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Year must be between 1 and 10')
      .toInt()
  ],

  /**
   * Validation for avatar upload
   */
  avatarUpload: [
    // File validation is handled by multer middleware
    // Additional validation can be added here if needed
  ],

  /**
   * Validation for two-factor authentication
   */
  twoFactorAuth: [
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits')
      .isNumeric()
      .withMessage('Verification code must be numeric')
  ]
};


