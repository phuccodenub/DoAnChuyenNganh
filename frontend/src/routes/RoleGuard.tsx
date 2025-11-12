import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { User } from '@/stores/authStore.enhanced';
import { ROUTES } from '@/constants/routes';

type UserRole = User['role'];

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * RoleGuard Component
 * 
 * Guard cho các routes yêu cầu specific roles
 * Redirect nếu user không có quyền truy cập
 * 
 * Usage:
 * <Route element={<RoleGuard allowedRoles={['admin', 'instructor']} />}>
 *   <Route path="/admin" element={<AdminDashboard />} />
 * </Route>
 */
export function RoleGuard({ allowedRoles, redirectTo = ROUTES.UNAUTHORIZED }: RoleGuardProps) {
  const { role, hasAnyRole } = useRole();

  // Không có role (không nên xảy ra nếu đã qua ProtectedRoute)
  if (!role) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Kiểm tra quyền truy cập
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Có quyền truy cập -> render children
  return <Outlet />;
}

export default RoleGuard;
