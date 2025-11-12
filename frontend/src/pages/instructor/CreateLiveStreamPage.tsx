/**
 * CreateLiveStreamPage - Instructor
 * 
 * Trang tạo phiên livestream mới
 * Features:
 * - Form with validation
 * - Course selector
 * - Schedule future session
 * - Meeting info configuration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, Clock, Video, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateSession } from '@/hooks/useLivestream';
import { useCourses } from '@/hooks/useCoursesData';
import { ROUTES } from '@/constants/routes';

interface CreateSessionForm {
  course_id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
}

/**
 * CreateLiveStreamPage Component
 */
export function CreateLiveStreamPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch instructor's courses
  const { data: coursesResponse } = useCourses();
  const courses = coursesResponse?.data?.courses || [];

  // Create session mutation
  const createSession = useCreateSession();

  // Form
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateSessionForm>({
    defaultValues: {
      duration_minutes: 60,
    },
  });

  const selectedCourseId = watch('course_id');

  // Submit handler
  const onSubmit = async (data: CreateSessionForm) => {
    try {
      setIsSubmitting(true);

      // Validate scheduled time is in future
      const scheduledDate = new Date(data.scheduled_at);
      if (scheduledDate <= new Date()) {
        alert('Thời gian bắt đầu phải là thời điểm trong tương lai');
        setIsSubmitting(false);
        return;
      }

      await createSession.mutateAsync({
        course_id: data.course_id,
        instructor_id: '', // Will be set by backend from auth
        title: data.title,
        description: data.description,
        scheduled_at: data.scheduled_at,
        duration_minutes: Number(data.duration_minutes),
        meeting_url: data.meeting_url,
        meeting_id: data.meeting_id,
        meeting_password: data.meeting_password,
      } as any);

      alert('Tạo phiên livestream thành công!');
      navigate('/instructor/livestream');
    } catch (error: any) {
      console.error('Create session error:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo phiên livestream');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/livestream')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Tạo phiên Livestream mới</h1>
        <p className="text-gray-600 mt-2">
          Lên lịch một phiên livestream để kết nối trực tiếp với học viên
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            {/* Course Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khóa học <span className="text-red-500">*</span>
              </label>
              <select
                {...register('course_id', { required: 'Vui lòng chọn khóa học' })}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.course_id ? 'border-red-500' : 'border-gray-300'}
                `}
              >
                <option value="">Chọn khóa học</option>
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="text-red-500 text-sm mt-1">{errors.course_id.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề phiên livestream <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Vui lòng nhập tiêu đề',
                  maxLength: { value: 255, message: 'Tiêu đề không được quá 255 ký tự' }
                })}
                placeholder="VD: Ôn tập giữa kỳ - Chương 1-3"
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.title ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả (tùy chọn)
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Mô tả nội dung sẽ được thảo luận trong phiên livestream..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Lịch trình
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scheduled Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('scheduled_at', { required: 'Vui lòng chọn thời gian' })}
                min={new Date().toISOString().slice(0, 16)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.scheduled_at ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.scheduled_at && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduled_at.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng (phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('duration_minutes', { 
                  required: 'Vui lòng nhập thời lượng',
                  min: { value: 15, message: 'Thời lượng tối thiểu 15 phút' },
                  max: { value: 480, message: 'Thời lượng tối đa 8 giờ (480 phút)' }
                })}
                placeholder="60"
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.duration_minutes ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.duration_minutes && (
                <p className="text-red-500 text-sm mt-1">{errors.duration_minutes.message}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Đề xuất: 60 phút cho phiên thông thường
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Thông tin họp (tùy chọn)
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Nếu bạn sử dụng nền tảng bên thứ ba (Zoom, Google Meet), điền thông tin bên dưới
          </p>

          <div className="space-y-4">
            {/* Meeting URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link họp
              </label>
              <input
                type="url"
                {...register('meeting_url')}
                placeholder="https://zoom.us/j/123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Meeting ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting ID
              </label>
              <input
                type="text"
                {...register('meeting_id')}
                placeholder="123 456 789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Meeting Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="text"
                {...register('meeting_password')}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/instructor/livestream')}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedCourseId}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu và lên lịch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateLiveStreamPage;
