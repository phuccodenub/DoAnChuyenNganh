import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

/**
 * UnauthorizedPage (401)
 * 
 * Displayed when a user tries to access a resource that requires authentication
 * but they are not logged in.
 */
function UnauthorizedPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-300 mb-2">401</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Chưa xác thực
        </h2>
        <p className="text-gray-600 mb-8">
          Bạn cần đăng nhập để truy cập trang này. 
          Vui lòng đăng nhập và thử lại.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(ROUTES.LOGIN)}>
            Đăng nhập
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.LANDING_PAGE)}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
