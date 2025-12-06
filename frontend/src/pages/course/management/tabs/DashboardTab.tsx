import { 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  FileText,
  Loader2,
  Globe,
  EyeOff,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateCourse } from '@/hooks/useInstructorCourse';
import toast from 'react-hot-toast';
import type { InstructorCourse, CourseStats } from '@/services/api/instructor.api';

interface DashboardTabProps {
  courseId: string;
  course: InstructorCourse;
  stats?: CourseStats;
  isLoading: boolean;
}

/**
 * CourseDashboardTab
 * 
 * Tab Dashboard hiển thị thống kê tổng quát của khóa học:
 * - Tổng số học viên
 * - Doanh thu
 * - Đánh giá trung bình
 * - Tỷ lệ hoàn thành
 * - Tiến độ trung bình
 * - Điểm trung bình
 * - Bài tập chờ chấm
 * - Học viên mới tuần này
 */
export function CourseDashboardTab({ course, stats, isLoading, courseId }: DashboardTabProps) {
  const updateCourseMutation = useUpdateCourse();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handlePublish = async () => {
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'published' },
      });
      toast.success('Khóa học đã được xuất bản');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xuất bản khóa học');
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'draft' },
      });
      toast.success('Khóa học đã được chuyển về trạng thái nháp');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể chuyển trạng thái khóa học');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học sẽ không còn hiển thị công khai.')) {
      return;
    }
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'archived' },
      });
      toast.success('Khóa học đã được lưu trữ');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu trữ khóa học');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải thống kê...</span>
      </div>
    );
  }

  const statsData = stats || {
    total_students: 0,
    total_revenue: 0,
    average_rating: 0,
    total_reviews: 0,
    completion_rate: 0,
    avg_progress: 0,
    avg_score: 0,
    pending_grading: 0,
    max_students: 0,
    new_students_this_week: 0,
  };

  const statCards = [
    {
      title: 'Tổng học viên',
      value: formatNumber(statsData.total_students),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: statsData.new_students_this_week > 0 ? `+${statsData.new_students_this_week} tuần này` : undefined,
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(statsData.total_revenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Đánh giá trung bình',
      value: statsData.average_rating > 0 ? statsData.average_rating.toFixed(1) : '(Trống)',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: `${formatNumber(statsData.total_reviews)} đánh giá`,
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${statsData.completion_rate}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tiến độ trung bình',
      value: `${Math.round(statsData.avg_progress)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Điểm trung bình',
      value: statsData.avg_score > 0 ? statsData.avg_score.toFixed(1) : '(Trống)',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Bài tập chờ chấm',
      value: formatNumber(statsData.pending_grading),
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Học viên mới',
      value: formatNumber(statsData.new_students_this_week),
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      subtitle: 'Tuần này',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan khóa học</h2>
        <p className="text-gray-600 mt-1">Thống kê và hiệu suất của khóa học "{course.title}"</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                course.status === 'published' ? 'text-green-700 bg-green-50' : 
                course.status === 'draft' ? 'text-yellow-700 bg-yellow-50' : 
                'text-gray-700 bg-gray-50'
              }`}>
                {course.status === 'published' ? 'Đã xuất bản' : 
                 course.status === 'draft' ? 'Nháp' : 
                 'Lưu trữ'}
              </span>
            </div>
            {/* Publish/Unpublish Button */}
            <div className="pt-2 border-t border-gray-200">
              {course.status === 'draft' ? (
                <Button
                  onClick={handlePublish}
                  disabled={updateCourseMutation.isPending}
                  className="w-full"
                  variant="primary"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {updateCourseMutation.isPending ? 'Đang xuất bản...' : 'Xuất bản khóa học'}
                </Button>
              ) : course.status === 'published' ? (
                <div className="space-y-2">
                  <Button
                    onClick={handleUnpublish}
                    disabled={updateCourseMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    {updateCourseMutation.isPending ? 'Đang chuyển...' : 'Chuyển về nháp'}
                  </Button>
                  <Button
                    onClick={handleArchive}
                    disabled={updateCourseMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Lưu trữ
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={updateCourseMutation.isPending}
                  className="w-full"
                  variant="primary"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {updateCourseMutation.isPending ? 'Đang khôi phục...' : 'Khôi phục khóa học'}
                </Button>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Giá:</span>
              <span className="text-sm font-medium text-gray-900">
                {course.is_free ? 'Miễn phí' : formatCurrency(course.price || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Số bài học:</span>
              <span className="text-sm font-medium text-gray-900">
                {course.total_lessons || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cập nhật lần cuối:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(course.updated_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Xem khóa học công khai
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Chia sẻ khóa học
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Xuất báo cáo
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Sao chép khóa học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

