import { UserInstance, UserPublicProfile } from '../types/user.types';
import { comparePassword } from './hash.util';
import { stringUtils } from './string';
import { validatorsUtils } from './validators.util';

/**
 * Type definition for public user fields
 * Picks specific fields from UserInstance for type safety
 */
type PublicUserFields = Pick<
  UserInstance,
  | 'id'
  | 'email'
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'bio'
  | 'avatar'
  | 'role'
  | 'status'
  | 'email_verified'
  | 'created_at'
  | 'student_id'
  | 'class'
  | 'major'
  | 'year'
  | 'gpa'
  | 'instructor_id'
  | 'department'
  | 'specialization'
  | 'experience_years'
  | 'education_level'
  | 'research_interests'
  | 'date_of_birth'
  | 'gender'
  | 'address'
  | 'emergency_contact'
  | 'emergency_phone'
> & {
  avatar_url?: string; // Alias for avatar for frontend compatibility
  full_name?: string;  // Computed full name for frontend
};

/**
 * User utility functions
 * Focused on user data manipulation and validation
 * Role-related functions moved to role.util.ts
 */
export const userUtils = {
  /**
   * Get public profile (exclude sensitive data)
   * @param user - User instance
   * @returns Public user profile
   */
  getPublicProfile(user: UserInstance): PublicUserFields {
    const {
      id,
      email,
      username,
      first_name,
      last_name,
      phone,
      bio,
      avatar,
      role,
      status,
      email_verified,
      created_at,
      student_id,
      class: userClass,
      major,
      year,
      gpa,
      instructor_id,
      department,
      specialization,
      experience_years,
      education_level,
      research_interests,
      date_of_birth,
      gender,
      address,
      emergency_contact,
      emergency_phone
    } = user;

    // Compute full_name
    const fullName = [first_name, last_name].filter(Boolean).join(' ').trim() || undefined;

    return {
      id,
      email,
      username,
      first_name,
      last_name,
      full_name: fullName, // Computed field for frontend
      phone,
      bio,
      avatar,
      avatar_url: avatar, // Alias for frontend compatibility
      role,
      status,
      email_verified,
      created_at,
      student_id,
      class: userClass,
      major,
      year,
      gpa,
      instructor_id,
      department,
      specialization,
      experience_years,
      education_level,
      research_interests,
      date_of_birth,
      gender,
      address,
      emergency_contact,
      emergency_phone
    };
  },

  /**
   * Get user's full name
   * @param user - User instance
   * @returns Full name string
   */
  getFullName(user: UserInstance): string {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return stringUtils.normalize(`${firstName} ${lastName}`, { trim: true });
  },

  /**
   * Get user's display name (full name or email fallback)
   * @param user - User instance
   * @returns Display name string
   */
  getDisplayName(user: UserInstance): string {
    const fullName = this.getFullName(user);
    return fullName || user.email;
  },

  /**
   * Get user's initials
   * @param user - User instance
   * @returns Initials string
   */
  getInitials(user: UserInstance): string {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const firstInitial = firstName.trim().charAt(0).toUpperCase();
    const lastWord = lastName.trim().split(/\s+/).pop() || '';
    const lastInitial = lastWord.charAt(0).toUpperCase();
    const initials = `${firstInitial}${lastInitial}`;
    return initials.trim();
  },

  /**
   * Check if user is active
   * @param user - User instance
   * @returns True if user is active
   */
  isActive(user: UserInstance): boolean {
    return user.status === 'active';
  },

  /**
   * Check if user's email is verified
   * @param user - User instance
   * @returns True if email is verified
   */
  isEmailVerified(user: UserInstance): boolean {
    return user.email_verified === true;
  },

  /**
   * Get user's age (if date_of_birth is available)
   * @param user - User instance
   * @returns Age in years or null if date_of_birth is not available
   */
  getAge(user: UserInstance): number | null {
    if (!user.date_of_birth) return null;
    
    const birthDate = new Date(user.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  },

  /**
   * Get user's academic year (for students)
   * @param user - User instance
   * @returns Academic year string or null if not a student
   */
  getAcademicYear(user: UserInstance): string | null {
    if (user.role !== 'student' || !user.year) return null;
    return `Khóa ${user.year}`;
  },

  /**
   * Get user's department (for instructors)
   * @param user - User instance
   * @returns Department string or null if not an instructor
   */
  getDepartment(user: UserInstance): string | null {
    if (!['instructor', 'admin', 'super_admin'].includes(user.role) || !user.department) {
      return null;
    }
    return user.department;
  },

  /**
   * Validate user data
   * @param userData - User data to validate
   * @returns True if user data is valid
   */
  validateUserData(userData: Partial<UserInstance>): boolean {
    const requiredFields: (keyof UserInstance)[] = ['email', 'first_name', 'last_name'];
    
    return requiredFields.every(field => {
      const value = userData[field];
      return value !== null && value !== undefined && validatorsUtils.isNotEmpty(String(value));
    });
  },

  /**
   * Validate user profile data
   * @param profileData - Profile data to validate
   * @returns Object with validation result and errors
   */
  validateProfileData(profileData: Partial<UserInstance>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate email
    if (profileData.email && !validatorsUtils.isEmail(profileData.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone
    if (profileData.phone && !validatorsUtils.isPhone(profileData.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate names
    if (profileData.first_name && !validatorsUtils.isVietnameseName(profileData.first_name)) {
      errors.push('First name contains invalid characters');
    }

    if (profileData.last_name && !validatorsUtils.isVietnameseName(profileData.last_name)) {
      errors.push('Last name contains invalid characters');
    }

    // Validate student ID
    if (profileData.student_id && !validatorsUtils.isStudentId(profileData.student_id)) {
      errors.push('Invalid student ID format');
    }

    // Validate instructor ID
    if (profileData.instructor_id && !validatorsUtils.isInstructorId(profileData.instructor_id)) {
      errors.push('Invalid instructor ID format');
    }

    // Validate GPA
    if (profileData.gpa !== undefined && !validatorsUtils.isInRange(profileData.gpa, 0, 4)) {
      errors.push('GPA must be between 0 and 4');
    }

    // Validate experience years
    if (profileData.experience_years !== undefined && !validatorsUtils.isPositiveNumber(profileData.experience_years)) {
      errors.push('Experience years must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Compare password (wrapper for hash.util)
   * @param user - User instance
   * @param candidatePassword - Password to compare
   * @returns True if passwords match
   */
  async comparePassword(user: UserInstance, candidatePassword: string): Promise<boolean> {
    try {
      return await comparePassword(candidatePassword, user.password_hash);
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  },

  /**
   * Sanitize user data for public display
   * @param user - User instance
   * @returns Sanitized user data
   */
  sanitizeForPublic(user: UserInstance): Partial<UserInstance> {
    const publicFields: (keyof UserInstance)[] = [
      'id',
      'email',
      'username',
      'first_name',
      'last_name',
      'phone',
      'bio',
      'avatar',
      'role',
      'status',
      'email_verified',
      'created_at',
      'student_id',
      'class',
      'major',
      'year',
      'gpa',
      'instructor_id',
      'department',
      'specialization',
      'experience_years',
      'education_level',
      'research_interests',
      'date_of_birth',
      'gender',
      'address',
      'emergency_contact',
      'emergency_phone'
    ];

    const sanitized: any = {};
    publicFields.forEach(field => {
      const value = user[field];
      if (value !== undefined) {
        sanitized[field] = value as any;
      }
    });

    return sanitized;
  },

  /**
   * Check if user has completed profile
   * @param user - User instance
   * @returns True if profile is complete
   */
  hasCompleteProfile(user: UserInstance): boolean {
    const requiredFields: (keyof UserInstance)[] = [
      'first_name',
      'last_name',
      'phone'
    ];

    return requiredFields.every(field => {
      const value = user[field];
      return value !== null && value !== undefined && validatorsUtils.isNotEmpty(String(value));
    });
  },

  /**
   * Get profile completion percentage
   * @param user - User instance
   * @returns Profile completion percentage (0-100)
   */
  getProfileCompletionPercentage(user: UserInstance): number {
    const fields: (keyof UserInstance)[] = [
      'first_name',
      'last_name',
      'phone',
      'bio',
      'avatar',
      'date_of_birth',
      'gender',
      'address'
    ];

    const completedFields = fields.filter(field => {
      const value = user[field];
      return value !== null && value !== undefined && validatorsUtils.isNotEmpty(String(value));
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }
};

// Legacy export for backward compatibility
export const userHelpers = userUtils;