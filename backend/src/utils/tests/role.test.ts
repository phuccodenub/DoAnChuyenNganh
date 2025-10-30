import { roleUtils } from '../role.util';
import { UserInstance } from '../../types/user.types';

// Mock user data for testing
const mockStudent: any = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'student@example.com',
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
  ...mockStudent,
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

const mockAdmin: any = {
  ...mockStudent,
  id: '789e0123-e89b-12d3-a456-426614174002',
  email: 'admin@example.com',
  first_name: 'Lê',
  last_name: 'Văn C',
  role: 'admin'
};

const mockSuperAdmin: any = {
  ...mockStudent,
  id: '012e3456-e89b-12d3-a456-426614174003',
  email: 'superadmin@example.com',
  first_name: 'Phạm',
  last_name: 'Thị D',
  role: 'super_admin'
};

describe('Role Utils', () => {
  describe('hasRole', () => {
    test('should check if user has specific role', () => {
      expect(roleUtils.hasRole(mockStudent, 'student')).toBe(true);
      expect(roleUtils.hasRole(mockInstructor, 'instructor')).toBe(true);
      expect(roleUtils.hasRole(mockAdmin, 'admin')).toBe(true);
      expect(roleUtils.hasRole(mockSuperAdmin, 'super_admin')).toBe(true);
    });

    test('should check if user has any of multiple roles', () => {
      expect(roleUtils.hasRole(mockStudent, ['student', 'instructor'])).toBe(true);
      expect(roleUtils.hasRole(mockInstructor, ['student', 'instructor'])).toBe(true);
      expect(roleUtils.hasRole(mockAdmin, ['student', 'instructor'])).toBe(false);
    });

    test('should return false for non-matching roles', () => {
      expect(roleUtils.hasRole(mockStudent, 'instructor')).toBe(false);
      expect(roleUtils.hasRole(mockInstructor, 'student')).toBe(false);
      expect(roleUtils.hasRole(mockAdmin, 'student')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    test('should check if user is admin', () => {
      expect(roleUtils.isAdmin(mockStudent)).toBe(false);
      expect(roleUtils.isAdmin(mockInstructor)).toBe(false);
      expect(roleUtils.isAdmin(mockAdmin)).toBe(true);
      expect(roleUtils.isAdmin(mockSuperAdmin)).toBe(true);
    });
  });

  describe('isInstructor', () => {
    test('should check if user is instructor', () => {
      expect(roleUtils.isInstructor(mockStudent)).toBe(false);
      expect(roleUtils.isInstructor(mockInstructor)).toBe(true);
      expect(roleUtils.isInstructor(mockAdmin)).toBe(true);
      expect(roleUtils.isInstructor(mockSuperAdmin)).toBe(true);
    });
  });

  describe('isStudent', () => {
    test('should check if user is student', () => {
      expect(roleUtils.isStudent(mockStudent)).toBe(true);
      expect(roleUtils.isStudent(mockInstructor)).toBe(false);
      expect(roleUtils.isStudent(mockAdmin)).toBe(false);
      expect(roleUtils.isStudent(mockSuperAdmin)).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    test('should check if user is super admin', () => {
      expect(roleUtils.isSuperAdmin(mockStudent)).toBe(false);
      expect(roleUtils.isSuperAdmin(mockInstructor)).toBe(false);
      expect(roleUtils.isSuperAdmin(mockAdmin)).toBe(false);
      expect(roleUtils.isSuperAdmin(mockSuperAdmin)).toBe(true);
    });
  });

  describe('getRoleLevel', () => {
    test('should return role hierarchy level', () => {
      expect(roleUtils.getRoleLevel(mockStudent)).toBe(1);
      expect(roleUtils.getRoleLevel(mockInstructor)).toBe(2);
      expect(roleUtils.getRoleLevel(mockAdmin)).toBe(3);
      expect(roleUtils.getRoleLevel(mockSuperAdmin)).toBe(4);
    });

    test('should return 0 for unknown role', () => {
      const unknownRoleUser = { ...mockStudent, role: 'unknown' as any };
      expect(roleUtils.getRoleLevel(unknownRoleUser)).toBe(0);
    });
  });

  describe('hasRoleLevel', () => {
    test('should check if user has higher or equal role level', () => {
      expect(roleUtils.hasRoleLevel(mockStudent, 'student')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockStudent, 'instructor')).toBe(false);
      expect(roleUtils.hasRoleLevel(mockInstructor, 'student')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockInstructor, 'instructor')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockInstructor, 'admin')).toBe(false);
      expect(roleUtils.hasRoleLevel(mockAdmin, 'instructor')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockAdmin, 'admin')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockSuperAdmin, 'admin')).toBe(true);
      expect(roleUtils.hasRoleLevel(mockSuperAdmin, 'super_admin')).toBe(true);
    });
  });

  describe('getManageableRoles', () => {
    test('should return roles that user can manage', () => {
      expect(roleUtils.getManageableRoles(mockStudent)).toEqual(['student']);
      expect(roleUtils.getManageableRoles(mockInstructor)).toEqual(['student', 'instructor']);
      expect(roleUtils.getManageableRoles(mockAdmin)).toEqual(['student', 'instructor', 'admin']);
      expect(roleUtils.getManageableRoles(mockSuperAdmin)).toEqual(['student', 'instructor', 'admin', 'super_admin']);
    });
  });

  describe('canManageUser', () => {
    test('should check if user can manage another user', () => {
      expect(roleUtils.canManageUser(mockStudent, mockStudent)).toBe(false);
      expect(roleUtils.canManageUser(mockInstructor, mockStudent)).toBe(true);
      expect(roleUtils.canManageUser(mockInstructor, mockInstructor)).toBe(false);
      expect(roleUtils.canManageUser(mockAdmin, mockStudent)).toBe(true);
      expect(roleUtils.canManageUser(mockAdmin, mockInstructor)).toBe(true);
      expect(roleUtils.canManageUser(mockAdmin, mockAdmin)).toBe(false);
      expect(roleUtils.canManageUser(mockSuperAdmin, mockStudent)).toBe(true);
      expect(roleUtils.canManageUser(mockSuperAdmin, mockInstructor)).toBe(true);
      expect(roleUtils.canManageUser(mockSuperAdmin, mockAdmin)).toBe(true);
      expect(roleUtils.canManageUser(mockSuperAdmin, mockSuperAdmin)).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    test('should return human-readable role name', () => {
      expect(roleUtils.getRoleDisplayName('student')).toBe('Sinh viên');
      expect(roleUtils.getRoleDisplayName('instructor')).toBe('Giảng viên');
      expect(roleUtils.getRoleDisplayName('admin')).toBe('Quản trị viên');
      expect(roleUtils.getRoleDisplayName('super_admin')).toBe('Siêu quản trị viên');
    });

    test('should return original role for unknown roles', () => {
      expect(roleUtils.getRoleDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getRolePermissions', () => {
    test('should return permissions for student role', () => {
      const permissions = roleUtils.getRolePermissions('student');
      expect(permissions).toContain('view_courses');
      expect(permissions).toContain('enroll_courses');
      expect(permissions).toContain('submit_assignments');
      expect(permissions).toContain('view_grades');
      expect(permissions).toContain('participate_chat');
      expect(permissions).toContain('take_quizzes');
      expect(permissions).not.toContain('create_courses');
      expect(permissions).not.toContain('manage_students');
    });

    test('should return permissions for instructor role', () => {
      const permissions = roleUtils.getRolePermissions('instructor');
      expect(permissions).toContain('view_courses');
      expect(permissions).toContain('create_courses');
      expect(permissions).toContain('edit_courses');
      expect(permissions).toContain('manage_students');
      expect(permissions).toContain('grade_assignments');
      expect(permissions).toContain('create_quizzes');
      expect(permissions).toContain('manage_chat');
      expect(permissions).toContain('view_analytics');
      expect(permissions).not.toContain('delete_courses');
      expect(permissions).not.toContain('manage_all_users');
    });

    test('should return permissions for admin role', () => {
      const permissions = roleUtils.getRolePermissions('admin');
      expect(permissions).toContain('view_courses');
      expect(permissions).toContain('create_courses');
      expect(permissions).toContain('edit_courses');
      expect(permissions).toContain('delete_courses');
      expect(permissions).toContain('manage_all_users');
      expect(permissions).toContain('manage_system');
      expect(permissions).toContain('view_all_analytics');
      expect(permissions).toContain('manage_permissions');
    });

    test('should return permissions for super_admin role', () => {
      const permissions = roleUtils.getRolePermissions('super_admin');
      expect(permissions).toContain('all_permissions');
    });

    test('should return empty array for unknown roles', () => {
      const permissions = roleUtils.getRolePermissions('unknown');
      expect(permissions).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    test('should check if user has specific permission', () => {
      expect(roleUtils.hasPermission(mockStudent, 'view_courses')).toBe(true);
      expect(roleUtils.hasPermission(mockStudent, 'create_courses')).toBe(false);
      expect(roleUtils.hasPermission(mockInstructor, 'create_courses')).toBe(true);
      expect(roleUtils.hasPermission(mockInstructor, 'delete_courses')).toBe(false);
      expect(roleUtils.hasPermission(mockAdmin, 'delete_courses')).toBe(true);
      expect(roleUtils.hasPermission(mockSuperAdmin, 'view_courses')).toBe(true);
      expect(roleUtils.hasPermission(mockSuperAdmin, 'any_permission')).toBe(true);
    });

    test('should return false for unknown permissions', () => {
      expect(roleUtils.hasPermission(mockStudent, 'unknown_permission')).toBe(false);
    });
  });
});

