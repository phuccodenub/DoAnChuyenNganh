import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES, generateRoute } from '@/constants/routes';
import { Settings, ExternalLink } from 'lucide-react';

interface SettingsTabProps {
  courseId: string;
  course: any;
}

/**
 * SettingsTab
 * 
 * Tab cài đặt khóa học - hiển thị thông tin và link đến editor
 */
export function SettingsTab({ courseId, course }: SettingsTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt khóa học</h2>
        <p className="text-gray-600 mt-1">Quản lý cài đặt và thông tin khóa học</p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Settings className="w-6 h-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Chỉnh sửa thông tin khóa học
            </h3>
            <p className="text-blue-700 mb-4">
              Để chỉnh sửa thông tin chi tiết của khóa học (tiêu đề, mô tả, giá, v.v.), 
              vui lòng sử dụng trang chỉnh sửa chuyên dụng.
            </p>
            <Button
              onClick={() => navigate(generateRoute.courseManagement(courseId))}
              variant="outline"
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink className="w-4 h-4" />
              Mở trang chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <p className="text-sm text-gray-900">
              {course?.status === 'published' ? 'Đã xuất bản' : 
               course?.status === 'draft' ? 'Nháp' : 
               'Lưu trữ'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
            <p className="text-sm text-gray-900">
              {course?.is_free ? 'Miễn phí' : 
               course?.price ? `${course.price.toLocaleString('vi-VN')} đ` : 
               'Chưa đặt giá'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số bài học</label>
            <p className="text-sm text-gray-900">{course?.total_lessons || 0}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
            <p className="text-sm text-gray-900">
              {course?.updated_at 
                ? new Date(course.updated_at).toLocaleDateString('vi-VN')
                : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

