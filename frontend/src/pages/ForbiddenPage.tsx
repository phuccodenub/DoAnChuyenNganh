import { useNavigate } from 'react-router-dom';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { getDashboardByRole } from '@/utils/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * ForbiddenPage (403)
 * 
 * Displayed when a user is authenticated but doesn't have permission
 * to access the requested resource.
 */
function ForbiddenPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const handleGoBack = () => {
    if (isAuthenticated && user) {
      navigate(getDashboardByRole(user.role));
    } else {
      navigate(ROUTES.LANDING_PAGE);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Ban className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-300 mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Truy cập bị từ chối
        </h2>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập trang này. 
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoBack}>
            {isAuthenticated ? 'Về Dashboard' : 'Về trang chủ'}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
