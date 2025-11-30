import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Globe, Bell, Lock, ImageIcon } from 'lucide-react';
import type { CreateSessionForm } from '../types';

interface PostDetailsFormProps {
  register: UseFormRegister<CreateSessionForm>;
  errors: FieldErrors<CreateSessionForm>;
  watch: UseFormWatch<CreateSessionForm>;
  courses: Array<{ id: string; title: string }>;
}

export function PostDetailsForm({ register, errors, watch, courses }: PostDetailsFormProps) {
  const audience = watch('audience');
  const goLiveTiming = watch('goLiveTiming');
  const presetCommentEnabled = watch('presetCommentEnabled');

  return (
    <aside className="space-y-4">
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Chi tiết bài đăng</h3>
          <p className="text-sm text-gray-500">Thông tin hiển thị tới người xem</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Vui lòng nhập tiêu đề',
              maxLength: { value: 255, message: 'Tối đa 255 ký tự' },
            })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tên buổi phát trực tiếp"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mô tả</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Mô tả livestream..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Gắn với khóa học</label>
          <select
            {...register('course_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Không gắn khóa học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Đối tượng</label>
          {[
            { id: 'public' as const, label: 'Công khai', icon: Globe, description: 'Bất kỳ ai cũng xem được' },
            { id: 'followers' as const, label: 'Người theo dõi', icon: Bell, description: 'Chỉ người theo dõi' },
            { id: 'private' as const, label: 'Riêng tư', icon: Lock, description: 'Giới hạn người xem' },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                audience === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input type="radio" value={item.id} {...register('audience')} className="accent-blue-600 cursor-pointer" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </label>
          ))}
        </div> */}

        {/* <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Thời điểm phát sóng</label>
            <select
              {...register('goLiveTiming')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="now">Phát ngay</option>
              <option value="schedule">Lên lịch sau</option>
            </select>
          </div>

          {goLiveTiming === 'schedule' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Thời gian phát <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('scheduled_start', { required: 'Vui lòng chọn thời gian' })}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.scheduled_start ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduled_start && <p className="text-red-500 text-xs mt-1">{errors.scheduled_start.message}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Thời lượng dự kiến (phút) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('duration_minutes', {
                required: 'Vui lòng nhập thời lượng',
                min: { value: 15, message: 'Tối thiểu 15 phút' },
                max: { value: 480, message: 'Tối đa 480 phút' },
              })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}
          </div>
        </div> */}
      </section>

      {/* <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Comment ghim sẵn</h3>
            <p className="text-sm text-gray-500">Comment sẽ tự động pin khi bạn live</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('presetCommentEnabled')} className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <span className="text-sm text-gray-700">Bật</span>
          </label>
        </div>

        {presetCommentEnabled && (
          <textarea
            {...register('presetComment')}
            rows={3}
            placeholder="Ví dụ: Chào mọi người, hãy đặt câu hỏi tại đây!"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        )}
      </section>

      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Danh mục / Tag</label>
          <input
            type="text"
            {...register('category')}
            placeholder="Q&A, Workshop..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            Thumbnail URL
          </label>
          <input
            type="url"
            {...register('thumbnail_url')}
            placeholder="https://example.com/thumbnail.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </section> */}
    </aside>
  );
}

