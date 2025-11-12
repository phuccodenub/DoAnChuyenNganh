import { useAuthStore } from '@/stores/authStore.enhanced';
import { User } from '@/stores/authStore.enhanced';

type UserRole = User['role'];

/**
 * useRole Hook
 * 
 * Hook để check user roles
 * Sử dụng: const { isStudent, isInstructor, isAdmin, hasRole } = useRole();
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  
  const role = user?.role;
  
  const isStudent = role === 'student';
  const isInstructor = role === 'instructor';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  
  /**
   * Check if user has specific role
   */
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user || !role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };
  
  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user || !role) return false;
    return roles.includes(role);
  };
  
  /**
   * Check if user can access admin features
   */
  const canAccessAdmin = (): boolean => {
    return isAdmin || isSuperAdmin;
  };

  return {
    role,
    isStudent,
    isInstructor,
    isAdmin,
    isSuperAdmin,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
  };
}

export default useRole;
