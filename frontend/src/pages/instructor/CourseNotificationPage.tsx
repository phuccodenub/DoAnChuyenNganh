import React, { useState, useCallback } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  BookOpen,
  Clock, 
  ChevronDown,
  AlertCircle,
  Loader2,
  FileText,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Target,
  Search,
  Sparkles,
  Eye,
  X
} from 'lucide-react';
import { useSendBulkNotification, useSentNotifications, BulkNotificationDto } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/services/http/client';
import toast from 'react-hot-toast';

/**
 * Course Notification Page for Instructor
 * - Send notifications to students in a specific course
 * - Multiple notification types: course updates, assignment reminders, quiz announcements
 * - Student selection (all or specific)
 */

interface Course {
  id: string;
  title: string;
  thumbnail_url?: string;
  enrolled_count?: number;
  status?: string;
}

interface CreateCourseNotificationFormData {
  notification_type: string;
  category: string;
  title: string;
  message: string;
  course_id: string;
  target_students: 'all' | 'selected';
  student_ids?: string[];
  link_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Instructor notification types for course
const NOTIFICATION_TYPES = [
  { 
    value: 'course', 
    label: 'Thông báo khóa học', 
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    description: 'Cập nhật, thay đổi khóa học'
  },
  { 
    value: 'assignment', 
    label: 'Bài tập', 
    icon: FileText,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    activeColor: 'bg-purple-600 text-white border-purple-600',
    description: 'Bài tập mới, deadline'
  },
  { 
    value: 'quiz', 
    label: 'Kiểm tra', 
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    activeColor: 'bg-orange-500 text-white border-orange-500',
    description: 'Quiz, bài kiểm tra'
  },
  { 
    value: 'reminder', 
    label: 'Nhắc nhở', 
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
    description: 'Nhắc nhở tiến độ học'
  },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-600' },
  { value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-600' },
  { value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-600' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-600' },
];

// Quick templates for instructors
const QUICK_TEMPLATES = [
  {
    title: '📚 Bài học mới đã được cập nhật',
    message: 'Xin chào các bạn! Mình vừa cập nhật bài học mới trong khóa học. Hãy vào học và hoàn thành bài tập nhé!',
    notification_type: 'course',
    category: 'course',
    priority: 'normal' as const,
  },
  {
    title: '📝 Bài tập mới - Deadline sắp đến',
    message: 'Mình vừa giao bài tập mới. Deadline là [ngày]. Các bạn nhớ hoàn thành đúng hạn nhé!',
    notification_type: 'assignment',
    category: 'assignment',
    priority: 'high' as const,
  },
  {
    title: '⏰ Nhắc nhở: Kiểm tra sắp diễn ra',
    message: 'Bài kiểm tra [tên quiz] sẽ diễn ra vào [thời gian]. Các bạn chuẩn bị ôn tập nhé!',
    notification_type: 'quiz',
    category: 'quiz',
    priority: 'high' as const,
  },
  {
    title: '💪 Nhắc nhở tiến độ học tập',
    message: 'Mình thấy một số bạn chưa hoàn thành bài học [tên bài]. Cố gắng hoàn thành để không bị chậm tiến độ nhé!',
    notification_type: 'reminder',
    category: 'course',
    priority: 'normal' as const,
  },
];

// Fetch instructor's courses
async function fetchInstructorCourses(): Promise<Course[]> {
  const response = await httpClient.get('/courses/instructor/my-courses');
  // Backend returns: { success, message, data: { data: [...], pagination: {...} } }
  const rawCourses = response.data?.data?.data || response.data?.data?.courses || response.data?.data || response.data?.courses || [];
  // Map total_students to enrolled_count for frontend compatibility
  return rawCourses.map((course: any) => ({
    ...course,
    enrolled_count: course.enrolled_count ?? course.total_students ?? 0
  }));
}

const initialFormData: CreateCourseNotificationFormData = {
  notification_type: 'course',
  category: 'course',
  title: '',
  message: '',
  course_id: '',
  target_students: 'all',
  priority: 'normal',
};

export function CourseNotificationPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [formData, setFormData] = useState<CreateCourseNotificationFormData>(initialFormData);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchCourse, setSearchCourse] = useState('');

  // Fetch instructor's courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: fetchInstructorCourses,
  });

  // Hooks
  const { mutate: sendBulk, isPending: isSending } = useSendBulkNotification();
  const { data: sentData, isLoading: isLoadingSent, refetch: refetchSent } = useSentNotifications({ limit: 50 });

  const selectedCourse = courses?.find(c => c.id === formData.course_id);
  
  const filteredCourses = courses?.filter(c => 
    c.title.toLowerCase().includes(searchCourse.toLowerCase())
  ) || [];

  const handleInputChange = useCallback((field: keyof CreateCourseNotificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setFormData(prev => ({
      ...prev,
      notification_type: type,
      category: type,
    }));
  }, []);

  const applyTemplate = useCallback((template: typeof QUICK_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      notification_type: template.notification_type,
      category: template.category,
      priority: template.priority,
    }));
    toast.success('Đã áp dụng mẫu thông báo');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id) {
      toast.error('Vui lòng chọn khóa học');
      return;
    }

    const dto: BulkNotificationDto = {
      notification_type: formData.notification_type,
      title: formData.title,
      message: formData.message,
      category: formData.category as any,
      target_audience: {
        type: 'course',
        course_id: formData.course_id,
      },
      priority: formData.priority,
      link_url: formData.link_url || undefined,
      related_resource_type: 'course',
      related_resource_id: formData.course_id,
      metadata: {
        course_name: selectedCourse?.title,
      },
    };

    sendBulk(dto, {
      onSuccess: (data) => {
        toast.success(`Đã gửi thông báo đến ${data?.data?.recipients_count || 0} học viên`);
        setFormData(prev => ({
          ...initialFormData,
          course_id: prev.course_id, // Keep course selected
        }));
        refetchSent();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Không thể gửi thông báo');
      }
    });
  }, [formData, selectedCourse, sendBulk, refetchSent]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Bell className="w-8 h-8 text-indigo-600" />
            </div>
            Thông báo Khóa học
          </h1>
          <p className="text-gray-500 mt-2">Gửi thông báo đến học viên trong khóa học của bạn</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Send className="w-4 h-4" />
            Tạo thông báo
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Lịch sử gửi
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Course Selection - Top Priority */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Target className="w-4 h-4 inline-block mr-1.5" />
                    Chọn khóa học <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                      disabled={isLoadingCourses}
                      className="w-full flex items-center justify-between px-4 py-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm"
                    >
                      {isLoadingCourses ? (
                        <span className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang tải khóa học...
                        </span>
                      ) : selectedCourse ? (
                        <span className="flex items-center gap-3">
                          {selectedCourse.thumbnail_url ? (
                            <img 
                              src={selectedCourse.thumbnail_url} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{selectedCourse.title}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {selectedCourse.enrolled_count || 0} học viên
                            </p>
                          </div>
                        </span>
                      ) : (
                        <span className="text-gray-500">Chọn khóa học để gửi thông báo...</span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCourseDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-80">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={searchCourse}
                              onChange={(e) => setSearchCourse(e.target.value)}
                              placeholder="Tìm khóa học..."
                              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        
                        {/* Course List */}
                        <div className="overflow-y-auto max-h-56">
                          {filteredCourses.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Không tìm thấy khóa học</p>
                            </div>
                          ) : (
                            filteredCourses.map(course => (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => {
                                  handleInputChange('course_id', course.id);
                                  setShowCourseDropdown(false);
                                  setSearchCourse('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                                  formData.course_id === course.id ? 'bg-indigo-50' : ''
                                }`}
                              >
                                {course.thumbnail_url ? (
                                  <img 
                                    src={course.thumbnail_url} 
                                    alt="" 
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 truncate">{course.title}</p>
                                  <p className="text-sm text-gray-500">{course.enrolled_count || 0} học viên</p>
                                </div>
                                {formData.course_id === course.id && (
                                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Type */}
                <div className="p-6 border-b border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Loại thông báo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {NOTIFICATION_TYPES.map(type => {
                      const Icon = type.icon;
                      const isActive = formData.notification_type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeChange(type.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isActive ? type.activeColor : `${type.color} hover:border-gray-300`
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="font-medium text-sm">{type.label}</span>
                          <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-500'}`}>
                            {type.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title & Message */}
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Nhập tiêu đề thông báo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Nhập nội dung thông báo chi tiết..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.message.length}/1000 ký tự</p>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mức độ ưu tiên
                    </label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map(priority => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => handleInputChange('priority', priority.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            formData.priority === priority.value
                              ? `${priority.color} border-current`
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link đính kèm <span className="text-gray-400 font-normal">(tùy chọn)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.link_url || ''}
                      onChange={(e) => handleInputChange('link_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedCourse && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Sẽ gửi đến <strong>{selectedCourse.enrolled_count || 0}</strong> học viên
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem trước
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || !formData.title || !formData.message || !formData.course_id}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Gửi thông báo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Templates */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Mẫu nhanh
                </h3>
                <div className="space-y-2">
                  {QUICK_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                      <p className="font-medium text-gray-900 group-hover:text-indigo-700">
                        {template.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.message}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  Xem trước
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {formData.title || formData.message ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          NOTIFICATION_TYPES.find(t => t.value === formData.notification_type)?.color || 'bg-gray-100'
                        }`}>
                          {React.createElement(
                            NOTIFICATION_TYPES.find(t => t.value === formData.notification_type)?.icon || Bell,
                            { className: 'w-4 h-4' }
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {formData.title || 'Tiêu đề thông báo'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                            {formData.message || 'Nội dung thông báo...'}
                          </p>
                          {selectedCourse && (
                            <p className="text-xs text-indigo-600 mt-2">
                              📚 {selectedCourse.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Nhập nội dung để xem trước
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoadingSent ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : sentData?.notifications?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có thông báo nào được gửi</p>
                  <p className="text-sm text-gray-400 mt-1">Tạo thông báo đầu tiên cho học viên!</p>
                </div>
              ) : (
                sentData?.notifications?.map((notif: any) => {
                  const typeConfig = NOTIFICATION_TYPES.find(t => t.value === notif.notification_type) || NOTIFICATION_TYPES[0];
                  const Icon = typeConfig.icon;
                  return (
                    <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${typeConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                              {notif.metadata?.course_name && (
                                <p className="text-xs text-indigo-600 mt-1">📚 {notif.metadata.course_name}</p>
                              )}
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                              notif.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              notif.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              notif.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {PRIORITY_OPTIONS.find(p => p.value === notif.priority)?.label || 'Bình thường'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {notif.total_recipients || 0} học viên
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {notif.read_count || 0} đã đọc
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(notif.created_at), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Xem trước thông báo</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    NOTIFICATION_TYPES.find(t => t.value === formData.notification_type)?.color || 'bg-gray-100'
                  }`}>
                    {React.createElement(
                      NOTIFICATION_TYPES.find(t => t.value === formData.notification_type)?.icon || Bell,
                      { className: 'w-6 h-6' }
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{formData.title || 'Tiêu đề'}</h4>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{formData.message || 'Nội dung...'}</p>
                    {selectedCourse && (
                      <p className="text-sm text-indigo-600 mt-3">📚 {selectedCourse.title}</p>
                    )}
                    {formData.link_url && (
                      <a href={formData.link_url} className="text-blue-600 text-sm mt-3 inline-block hover:underline">
                        Xem chi tiết →
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setPreviewMode(false);
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
                  }}
                  disabled={!formData.course_id}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                >
                  Gửi ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseNotificationPage;
