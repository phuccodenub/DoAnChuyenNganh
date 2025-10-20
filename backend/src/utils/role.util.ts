type SimpleUser = { role: string } & Record<string, any>;

/**
 * User role utility functions
 * Separated from user.util.ts for better domain separation
 */
export const roleUtils = {
  /**
   * Check if user has specific role(s)
   * @param user - User instance
   * @param roles - Role or array of roles to check
   * @returns True if user has any of the specified roles
   */
  hasRole(user: SimpleUser, roles: string | string[]): boolean {
    const userRole = user.role;
    return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
  },

  /**
   * Check if user is admin (admin or super_admin)
   * @param user - User instance
   * @returns True if user is admin
   */
  isAdmin(user: SimpleUser): boolean {
    return this.hasRole(user, ['admin', 'super_admin']);
  },

  /**
   * Check if user is instructor (instructor, admin, or super_admin)
   * @param user - User instance
   * @returns True if user is instructor
   */
  isInstructor(user: SimpleUser): boolean {
    return this.hasRole(user, ['instructor', 'admin', 'super_admin']);
  },

  /**
   * Check if user is student
   * @param user - User instance
   * @returns True if user is student
   */
  isStudent(user: SimpleUser): boolean {
    return this.hasRole(user, 'student');
  },

  /**
   * Check if user is super admin
   * @param user - User instance
   * @returns True if user is super admin
   */
  isSuperAdmin(user: SimpleUser): boolean {
    return this.hasRole(user, 'super_admin');
  },

  /**
   * Get user role hierarchy level
   * @param user - User instance
   * @returns Role hierarchy level (higher number = more permissions)
   */
  getRoleLevel(user: SimpleUser): number {
    const roleLevels: Record<string, number> = {
      'student': 1,
      'instructor': 2,
      'admin': 3,
      'super_admin': 4
    };
    
    return roleLevels[user.role] || 0;
  },

  /**
   * Check if user has higher or equal role level
   * @param user - User instance
   * @param requiredRole - Required role to compare against
   * @returns True if user has higher or equal role level
   */
  hasRoleLevel(user: SimpleUser, requiredRole: string): boolean {
    const userLevel = this.getRoleLevel(user);
    const requiredLevel = this.getRoleLevel({ role: requiredRole });
    return userLevel >= requiredLevel;
  },

  /**
   * Get all roles that user can manage
   * @param user - User instance
   * @returns Array of roles that user can manage
   */
  getManageableRoles(user: SimpleUser): string[] {
    const userLevel = this.getRoleLevel(user);
    
    if (userLevel >= 4) return ['student', 'instructor', 'admin', 'super_admin'];
    if (userLevel >= 3) return ['student', 'instructor', 'admin'];
    if (userLevel >= 2) return ['student', 'instructor'];
    return ['student'];
  },

  /**
   * Check if user can manage another user
   * @param manager - User who wants to manage
   * @param target - User to be managed
   * @returns True if manager can manage target user
   */
  canManageUser(manager: SimpleUser, target: SimpleUser): boolean {
    const managerLevel = this.getRoleLevel(manager);
    const targetLevel = this.getRoleLevel(target);
    
    // Can only manage users with lower role level
    return managerLevel > targetLevel;
  },

  /**
   * Get role display name
   * @param role - Role string
   * @returns Human-readable role name
   */
  getRoleDisplayName(role: string): string {
    const displayNames: Record<string, string> = {
      'student': 'Sinh viên',
      'instructor': 'Giảng viên',
      'admin': 'Quản trị viên',
      'super_admin': 'Siêu quản trị viên'
    };
    
    return displayNames[role] || role;
  },

  /**
   * Get role permissions
   * @param role - Role string
   * @returns Array of permissions for the role
   */
  getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      'student': [
        'view_courses',
        'enroll_courses',
        'submit_assignments',
        'view_grades',
        'participate_chat',
        'take_quizzes'
      ],
      'instructor': [
        'view_courses',
        'create_courses',
        'edit_courses',
        'manage_students',
        'grade_assignments',
        'create_quizzes',
        'manage_chat',
        'view_analytics'
      ],
      'admin': [
        'view_courses',
        'create_courses',
        'edit_courses',
        'delete_courses',
        'manage_all_users',
        'manage_system',
        'view_all_analytics',
        'manage_permissions'
      ],
      'super_admin': [
        'all_permissions'
      ]
    };
    
    return permissions[role] || [];
  },

  /**
   * Check if user has specific permission
   * @param user - User instance
   * @param permission - Permission to check
   * @returns True if user has the permission
   */
  hasPermission(user: SimpleUser, permission: string): boolean {
    const userPermissions = this.getRolePermissions(user.role);
    return userPermissions.includes('all_permissions') || userPermissions.includes(permission);
  }
};

