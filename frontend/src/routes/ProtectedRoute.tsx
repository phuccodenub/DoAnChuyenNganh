import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';

/**
 * ProtectedRoute Component
 * 
 * Guard cho các routes yêu cầu authentication
 * Redirect to login nếu user chưa đăng nhập
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Đang khởi tạo auth state
  if (!isInitialized) {
    return <PageLoader />;
  }

  // Chưa đăng nhập -> redirect to login với return URL
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Đã đăng nhập -> render children
  return <Outlet />;
}

export default ProtectedRoute;
