import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES, generateRoute } from '@/constants/routes';
import { 
  Settings, 
  ExternalLink, 
  Globe, 
  Award, 
  DollarSign, 
  BookOpen,
  Tag,
  Target,
  Trash2,
  Copy,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useUpdateCourse } from '@/hooks/useInstructorCourse';
import { usePrerequisites, useCreatePrerequisite, useDeletePrerequisite } from '@/hooks/usePrerequisites';
import { useCourseSearch } from '@/hooks/useCourseSearch';
import toast from 'react-hot-toast';
import type { InstructorCourse } from '@/services/api/instructor.api';

interface SettingsTabProps {
  courseId: string;
  course: InstructorCourse;
}

/**
 * SettingsTab
 * 
 * Tab cài đặt khóa học - cho phép chỉnh sửa các settings quan trọng
 */
export function SettingsTab({ courseId, course }: SettingsTabProps) {
  const navigate = useNavigate();
  const updateCourseMutation = useUpdateCourse();
  const [isSaving, setIsSaving] = useState(false);
  const { data: prerequisitesData, isLoading: isLoadingPrereq } = usePrerequisites(courseId);
  const createPrereqMutation = useCreatePrerequisite(courseId);
  const deletePrereqMutation = useDeletePrerequisite(courseId);

  // Form state - sync với course data
  const [formData, setFormData] = useState({
    level: course?.level || 'beginner',
    language: course?.language || 'vi',
    currency: course?.currency || 'VND',
    is_featured: course?.is_featured || false,
  });

  // Sync formData khi course data thay đổi
  useEffect(() => {
    if (course) {
      setFormData({
        level: course.level || 'beginner',
        language: course.language || 'vi',
        currency: course.currency || 'VND',
        is_featured: course.is_featured || false,
      });
    }
  }, [course]);

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: formData,
      });
      toast.success('Đã lưu cài đặt thành công');
      // Update local formData to match saved data
      setFormData({
        level: formData.level,
        language: formData.language,
        currency: formData.currency,
        is_featured: formData.is_featured,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.')) {
      return;
    }
    
    // TODO: Implement delete course API call
    toast.error('Tính năng xóa khóa học đang được phát triển');
  };

  const handleDuplicateCourse = () => {
    // TODO: Implement duplicate course
    toast.error('Tính năng sao chép khóa học đang được phát triển');
  };

  // Prerequisite form
  const [prereqCourseId, setPrereqCourseId] = useState('');
  const [prereqRequired, setPrereqRequired] = useState(true);
  const [prereqSearch, setPrereqSearch] = useState('');
  const { data: searchResults } = useCourseSearch(prereqSearch, 6);

  const selectedOption = searchResults?.find((c: any) => c.id === prereqCourseId);
  const existingIds = new Set(prerequisitesData?.data?.map((p) => p.prerequisite_course_id));

  const handleAddPrerequisite = async () => {
    if (!prereqCourseId) {
      toast.error('Vui lòng chọn khóa học yêu cầu trước');
      return;
    }
    if (prereqCourseId === courseId) {
      toast.error('Không thể chọn chính khóa học này làm yêu cầu trước');
      return;
    }
    if (existingIds.has(prereqCourseId)) {
      toast.error('Khóa học này đã nằm trong danh sách yêu cầu trước');
      return;
    }
    try {
      await createPrereqMutation.mutateAsync({
        prerequisite_course_id: prereqCourseId,
        is_required: prereqRequired,
      });
      setPrereqCourseId('');
      setPrereqRequired(true);
      setPrereqSearch('');
    } catch (error: any) {
      // toast handled in hook
      console.error(error);
    }
  };

  const handleDeletePrerequisite = async (id: string) => {
    try {
      await deletePrereqMutation.mutateAsync(id);
    } catch (error) {
      // toast handled in hook
      console.error(error);
    }
  };

  const levelOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'expert', label: 'Chuyên gia' },
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
  ];

  const currencyOptions = [
    { value: 'VND', label: 'VND (₫)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cài đặt khóa học</h2>
          <p className="text-gray-600 mt-1">Quản lý cài đặt và cấu hình khóa học</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving || updateCourseMutation.isPending}
          className="flex items-center gap-2"
        >
          {isSaving || updateCourseMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </Button>
      </div>

      {/* Course Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt cơ bản</h3>
          </div>
          
          <div className="space-y-4">
            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ khóa học
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị tiền tệ
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa học nổi bật
                </label>
                <p className="text-xs text-gray-500">
                  Hiển thị khóa học ở trang chủ và danh mục nổi bật
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  formData.is_featured ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.is_featured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Course Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Thông tin khóa học</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                course?.status === 'published' ? 'bg-green-100 text-green-700' : 
                course?.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 
                course?.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {course?.status === 'published' ? 'Đã xuất bản' : 
                 course?.status === 'draft' ? 'Nháp' : 
                 course?.status === 'archived' ? 'Lưu trữ' :
                 course?.status === 'suspended' ? 'Đã tạm ngưng' :
                 'Chưa xác định'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Giá:</span>
              <span className="text-sm font-semibold text-gray-900">
                {course?.is_free ? 'Miễn phí' : formatCurrency(course?.price || 0, course?.currency || 'VND')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Số bài học:</span>
              <span className="text-sm font-semibold text-gray-900">
                {course?.total_lessons || course?.total_lessons === 0 ? course.total_lessons : '0'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Số phần học:</span>
              <span className="text-sm font-semibold text-gray-900">
                {course?.total_sections || course?.total_sections === 0 ? course.total_sections : '0'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng học viên:</span>
              <span className="text-sm font-semibold text-gray-900">
                {course?.total_students || course?.total_students === 0 ? course.total_students : '0'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đánh giá trung bình:</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {course?.average_rating || course?.rating ? (course.average_rating || course.rating || 0).toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-gray-500">
                  ({course?.total_ratings || course?.total_ratings === 0 ? course.total_ratings : '0'} đánh giá)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Ngày tạo:</span>
              <span className="text-sm font-medium text-gray-900">
                {course?.created_at 
                  ? new Date(course.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'Chưa có'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cập nhật lần cuối:</span>
              <span className="text-sm font-medium text-gray-900">
                {course?.updated_at 
                  ? new Date(course.updated_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Chưa có'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate(generateRoute.courseDetail(courseId))}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Xem khóa học công khai
          </Button>

          <Button
            onClick={() => {
              const url = `${window.location.origin}${generateRoute.courseDetail(courseId)}`;
              navigator.clipboard.writeText(url);
              toast.success('Đã sao chép link khóa học');
            }}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Copy className="w-4 h-4" />
            Sao chép link chia sẻ
          </Button>

          <Button
            onClick={() => navigate(generateRoute.courseManagement(courseId))}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Settings className="w-4 h-4" />
            Chỉnh sửa chi tiết
          </Button>

          <Button
            onClick={handleDuplicateCourse}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Copy className="w-4 h-4" />
            Sao chép khóa học
          </Button>

          <Button
            onClick={() => {
              // TODO: Implement export report
              toast.error('Tính năng xuất báo cáo đang được phát triển');
            }}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Xuất báo cáo
          </Button>

          <Button
            onClick={handleDeleteCourse}
            variant="outline"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Xóa khóa học
          </Button>
        </div>
      </Card>

      {/* Prerequisites */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Yêu cầu trước (Prerequisites)</h3>
          </div>
          {isLoadingPrereq && (
            <div className="text-sm text-gray-500">Đang tải...</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm khóa học yêu cầu trước
            </label>
            <div className="relative">
              <input
                value={prereqSearch}
                onChange={(e) => {
                  setPrereqSearch(e.target.value);
                  setPrereqCourseId('');
                }}
                placeholder="Nhập tên khóa học hoặc từ khóa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {/* Dropdown results */}
              {prereqSearch.length > 1 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults && searchResults.length > 0 ? (
                    searchResults.map((item: any) => (
                      <button
                        key={item.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        onClick={() => {
                          setPrereqCourseId(item.id);
                          setPrereqSearch(item.title);
                        }}
                      >
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {item.level || 'level'} • {item.status} • ID: {item.id}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy khóa học</div>
                  )}
                </div>
              )}
            </div>
            {selectedOption && (
              <p className="mt-2 text-sm text-gray-600">
                Đã chọn: <span className="font-medium text-gray-900">{selectedOption.title}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <label className="text-sm text-gray-700">Bắt buộc</label>
            <button
              type="button"
              onClick={() => setPrereqRequired((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                prereqRequired ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prereqRequired ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={handleAddPrerequisite}
            disabled={createPrereqMutation.isPending || !prereqCourseId}
            className="flex items-center gap-2"
          >
            {createPrereqMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang thêm...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Thêm yêu cầu</span>
              </>
            )}
          </Button>
          <span className="text-sm text-gray-500">
            Nhập ID khóa học và đánh dấu “Bắt buộc” nếu cần.
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh sách yêu cầu trước</h4>
          {(!prerequisitesData?.data || prerequisitesData.data.length === 0) && (
            <div className="text-sm text-gray-500">Chưa có yêu cầu trước nào.</div>
          )}
          <div className="space-y-3">
            {prerequisitesData?.data?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.prerequisite_course?.title || 'Khóa học'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {item.prerequisite_course_id} • {item.is_required ? 'Bắt buộc' : 'Khuyến nghị'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-200"
                  onClick={() => handleDeletePrerequisite(item.id)}
                  disabled={deletePrereqMutation.isPending}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Advanced Settings Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Chỉnh sửa thông tin chi tiết
            </h3>
            <p className="text-blue-700 mb-4">
              Để chỉnh sửa thông tin chi tiết của khóa học như tiêu đề, mô tả, giá cả, hình ảnh, 
              video giới thiệu, v.v., vui lòng sử dụng trang chỉnh sửa chuyên dụng.
            </p>
            <Button
              onClick={() => navigate(generateRoute.courseManagement(courseId))}
              variant="outline"
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink className="w-4 h-4" />
              Mở trang chỉnh sửa chi tiết
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
