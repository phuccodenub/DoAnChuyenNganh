import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { User } from '@/stores/authStore.enhanced';

type UserRole = User['role'];

/**
 * useRole Hook
 * 
 * Hook để check user roles
 * 
 * ⚠️ PERFORMANCE OPTIMIZATION:
 * - Chỉ subscribe vào user.role thay vì toàn bộ user object
 * - Sử dụng useCallback cho các functions để tránh re-render
 * - Tránh gây cascade re-renders khi user object thay đổi
 * 
 * Sử dụng: const { isStudent, isInstructor, isAdmin, hasRole } = useRole();
 */
export function useRole() {
  // ✅ CHỈ subscribe vào role, không subscribe toàn bộ user object
  // Điều này ngăn re-render khi các field khác của user thay đổi
  const role = useAuthStore((state) => state.user?.role);
  
  // Memoize các boolean values
  const isStudent = role === 'student';
  const isInstructor = role === 'instructor';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  
  /**
   * Check if user has specific role
   * Memoized với useCallback để tránh tạo function mới mỗi render
   */
  const hasRole = useCallback((requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  }, [role]);
  
  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  }, [role]);
  
  /**
   * Check if user can access admin features
   */
  const canAccessAdmin = useCallback((): boolean => {
    return role === 'admin' || role === 'super_admin';
  }, [role]);

  // Memoize return object để tránh tạo object mới mỗi render
  return useMemo(() => ({
    role,
    isStudent,
    isInstructor,
    isAdmin,
    isSuperAdmin,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
  }), [role, isStudent, isInstructor, isAdmin, isSuperAdmin, hasRole, hasAnyRole, canAccessAdmin]);
}

export default useRole;
