import { userUtils } from '../user.util';
import { UserInstance } from '../../types/user.types';

// Mock user data for testing
const mockUser: any = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  first_name: 'Nguyễn',
  last_name: 'Văn A',
  phone: '0123456789',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.jpg',
  role: 'student',
  status: 'active',
  email_verified: true,
  email_verified_at: new Date(),
  token_version: 1,
  last_login: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  student_id: 'SV12345678',
  class: 'CNTT-K62',
  major: 'Công nghệ thông tin',
  year: 2021,
  gpa: 3.5,
  instructor_id: undefined,
  department: undefined,
  specialization: undefined,
  experience_years: undefined,
  education_level: undefined,
  research_interests: undefined,
  date_of_birth: '2000-01-01',
  gender: 'male',
  address: 'Hà Nội, Việt Nam',
  emergency_contact: 'Nguyễn Thị B',
  emergency_phone: '0987654321'
};

const mockInstructor: any = {
  ...mockUser,
  id: '456e7890-e89b-12d3-a456-426614174001',
  email: 'instructor@example.com',
  first_name: 'Trần',
  last_name: 'Thị B',
  role: 'instructor',
  student_id: undefined,
  class: undefined,
  major: undefined,
  year: undefined,
  gpa: undefined,
  instructor_id: 'GV123456',
  department: 'Khoa Công nghệ thông tin',
  specialization: 'Lập trình web',
  experience_years: 5,
  education_level: 'phd',
  research_interests: 'Machine Learning, AI'
};

describe('User Utils', () => {
  describe('getPublicProfile', () => {
    test('should return public profile without sensitive data', () => {
      const profile = userUtils.getPublicProfile(mockUser);
      
      expect(profile.id).toBe(mockUser.id);
      expect(profile.email).toBe(mockUser.email);
      expect(profile.first_name).toBe(mockUser.first_name);
      expect(profile.last_name).toBe(mockUser.last_name);
      expect(profile.role).toBe(mockUser.role);
      expect(profile.status).toBe(mockUser.status);
      expect(profile.student_id).toBe(mockUser.student_id);
      expect(profile.instructor_id).toBeUndefined();
      
      // Should not include sensitive data
      expect((profile as any).password_hash).toBeUndefined();
    });

    test('should return instructor profile with instructor fields', () => {
      const profile = userUtils.getPublicProfile(mockInstructor);
      
      expect(profile.id).toBe(mockInstructor.id);
      expect(profile.email).toBe(mockInstructor.email);
      expect(profile.role).toBe(mockInstructor.role);
      expect(profile.instructor_id).toBe(mockInstructor.instructor_id);
      expect(profile.department).toBe(mockInstructor.department);
      expect(profile.specialization).toBe(mockInstructor.specialization);
      expect(profile.experience_years).toBe(mockInstructor.experience_years);
      expect(profile.education_level).toBe(mockInstructor.education_level);
      expect(profile.research_interests).toBe(mockInstructor.research_interests);
      
      // Should not include student fields
      expect(profile.student_id).toBeUndefined();
      expect(profile.class).toBeUndefined();
      expect(profile.major).toBeUndefined();
      expect(profile.year).toBeUndefined();
      expect(profile.gpa).toBeUndefined();
    });
  });

  describe('getFullName', () => {
    test('should return full name', () => {
      expect(userUtils.getFullName(mockUser)).toBe('Nguyễn Văn A');
      expect(userUtils.getFullName(mockInstructor)).toBe('Trần Thị B');
    });

    test('should handle missing names', () => {
      const userWithoutNames = { ...mockUser, first_name: '', last_name: '' };
      expect(userUtils.getFullName(userWithoutNames)).toBe('');
    });
  });

  describe('getDisplayName', () => {
    test('should return full name when available', () => {
      expect(userUtils.getDisplayName(mockUser)).toBe('Nguyễn Văn A');
    });

    test('should return email when full name is empty', () => {
      const userWithoutNames = { ...mockUser, first_name: '', last_name: '' };
      expect(userUtils.getDisplayName(userWithoutNames)).toBe(mockUser.email);
    });
  });

  describe('getInitials', () => {
    test('should return initials', () => {
      expect(userUtils.getInitials(mockUser)).toBe('NA');
      expect(userUtils.getInitials(mockInstructor)).toBe('TB');
    });

    test('should handle missing names', () => {
      const userWithoutNames = { ...mockUser, first_name: '', last_name: '' };
      expect(userUtils.getInitials(userWithoutNames)).toBe('');
    });
  });

  describe('isActive', () => {
    test('should check if user is active', () => {
      expect(userUtils.isActive(mockUser)).toBe(true);
      
      const inactiveUser = { ...mockUser, status: 'inactive' as const };
      expect(userUtils.isActive(inactiveUser)).toBe(false);
    });
  });

  describe('isEmailVerified', () => {
    test('should check if email is verified', () => {
      expect(userUtils.isEmailVerified(mockUser)).toBe(true);
      
      const unverifiedUser = { ...mockUser, email_verified: false };
      expect(userUtils.isEmailVerified(unverifiedUser)).toBe(false);
    });
  });

  describe('getAge', () => {
    test('should calculate age from date of birth', () => {
      const userWithBirthDate = { ...mockUser, date_of_birth: '2000-01-01' };
      const age = userUtils.getAge(userWithBirthDate);
      expect(age).toBeGreaterThan(20);
      expect(age).toBeLessThan(30);
    });

    test('should return null when date of birth is not available', () => {
      const userWithoutBirthDate = { ...mockUser, date_of_birth: undefined };
      expect(userUtils.getAge(userWithoutBirthDate)).toBeNull();
    });
  });

  describe('getAcademicYear', () => {
    test('should return academic year for students', () => {
      expect(userUtils.getAcademicYear(mockUser)).toBe('Khóa 2021');
    });

    test('should return null for non-students', () => {
      expect(userUtils.getAcademicYear(mockInstructor)).toBeNull();
    });

    test('should return null when year is not available', () => {
      const userWithoutYear = { ...mockUser, year: undefined };
      expect(userUtils.getAcademicYear(userWithoutYear)).toBeNull();
    });
  });

  describe('getDepartment', () => {
    test('should return department for instructors', () => {
      expect(userUtils.getDepartment(mockInstructor)).toBe('Khoa Công nghệ thông tin');
    });

    test('should return null for students', () => {
      expect(userUtils.getDepartment(mockUser)).toBeNull();
    });

    test('should return null when department is not available', () => {
      const instructorWithoutDept = { ...mockInstructor, department: undefined };
      expect(userUtils.getDepartment(instructorWithoutDept)).toBeNull();
    });
  });

  describe('validateUserData', () => {
    test('should validate user data', () => {
      expect(userUtils.validateUserData(mockUser)).toBe(true);
    });

    test('should fail validation for missing required fields', () => {
      const invalidUser = { ...mockUser, email: '', first_name: '', last_name: '' };
      expect(userUtils.validateUserData(invalidUser)).toBe(false);
    });

    test('should fail validation for null values', () => {
      const invalidUser = { ...mockUser, email: null, first_name: null, last_name: null };
      expect(userUtils.validateUserData(invalidUser)).toBe(false);
    });
  });

  describe('validateProfileData', () => {
    test('should validate profile data', () => {
      const result = userUtils.validateProfileData(mockUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for invalid email', () => {
      const invalidUser = { ...mockUser, email: 'invalid-email' };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should fail validation for invalid phone', () => {
      const invalidUser = { ...mockUser, phone: '123' };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    test('should fail validation for invalid student ID', () => {
      const invalidUser = { ...mockUser, student_id: '123' };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid student ID format');
    });

    test('should fail validation for invalid instructor ID', () => {
      const invalidUser = { ...mockInstructor, instructor_id: '123' };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid instructor ID format');
    });

    test('should fail validation for invalid GPA', () => {
      const invalidUser = { ...mockUser, gpa: 5.0 };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GPA must be between 0 and 4');
    });

    test('should fail validation for invalid experience years', () => {
      const invalidUser = { ...mockInstructor, experience_years: -1 };
      const result = userUtils.validateProfileData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Experience years must be a positive number');
    });
  });

  describe('sanitizeForPublic', () => {
    test('should sanitize user data for public display', () => {
      const sanitized = userUtils.sanitizeForPublic(mockUser);
      
      expect(sanitized.id).toBe(mockUser.id);
      expect(sanitized.email).toBe(mockUser.email);
      expect(sanitized.first_name).toBe(mockUser.first_name);
      expect(sanitized.last_name).toBe(mockUser.last_name);
      
      // Should not include sensitive data
      expect((sanitized as any).password_hash).toBeUndefined();
    });
  });

  describe('hasCompleteProfile', () => {
    test('should check if user has complete profile', () => {
      expect(userUtils.hasCompleteProfile(mockUser)).toBe(true);
    });

    test('should return false for incomplete profile', () => {
      const incompleteUser = { ...mockUser, first_name: '', last_name: '', phone: '' };
      expect(userUtils.hasCompleteProfile(incompleteUser)).toBe(false);
    });
  });

  describe('getProfileCompletionPercentage', () => {
    test('should calculate profile completion percentage', () => {
      const percentage = userUtils.getProfileCompletionPercentage(mockUser);
      expect(percentage).toBeGreaterThan(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });

    test('should return 0 for empty profile', () => {
      const emptyUser = { ...mockUser, first_name: '', last_name: '', phone: '', bio: '', avatar: '', date_of_birth: undefined, gender: undefined, address: '' };
      const percentage = userUtils.getProfileCompletionPercentage(emptyUser);
      expect(percentage).toBe(0);
    });

    test('should return 100 for complete profile', () => {
      const completeUser = { ...mockUser, first_name: 'John', last_name: 'Doe', phone: '0123456789', bio: 'Test bio', avatar: 'avatar.jpg', date_of_birth: '2000-01-01', gender: 'male', address: 'Test address' };
      const percentage = userUtils.getProfileCompletionPercentage(completeUser);
      expect(percentage).toBe(100);
    });
  });
});

