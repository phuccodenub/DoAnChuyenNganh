import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { X, Users, Clock, Star, DollarSign, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminCourse } from '@/types/course.admin.types';
import {
  useAdminCourse,
  useCourseStudents,
  useDeleteCourse,
  useChangeCourseStatus,
} from '@/hooks/useAdminCourses';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onEdit: (course: AdminCourse) => void;
}

/**
 * CourseDetailModal Component (Admin View)
 * 
 * Displays full course information with admin-specific details and actions
 */
export default function CourseDetailModal({ isOpen, onClose, courseId, onEdit }: CourseDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { data: course, isLoading } = useAdminCourse(courseId, isOpen);
  const { data: studentsData } = useCourseStudents(courseId, { limit: 10 });
  const deleteMutation = useDeleteCourse();
  const changeStatusMutation = useChangeCourseStatus();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!course) return;
    await deleteMutation.mutateAsync(course.id);
    onClose();
  };

  const handleStatusChange = async (status: 'draft' | 'published' | 'archived') => {
    if (!course) return;
    await changeStatusMutation.mutateAsync({ courseId: course.id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      beginner: 'Cơ bản',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao',
    };
    return labels[difficulty] || difficulty;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết khóa học</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : course ? (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="flex gap-4">
                {course.thumbnail_url && (
                  <img src={course.thumbnail_url} alt={course.title} className="w-32 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(course.status))}>
                      {course.status === 'published' ? 'Đã xuất bản' : course.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getDifficultyLabel(course.difficulty)}
                    </span>
                    {course.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Giảng viên: <span className="font-medium">{course.instructor.full_name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Giá: {course.is_free ? (
                      <span className="font-medium text-green-600">Miễn phí</span>
                    ) : (
                      <span className="font-medium">{course.price?.toLocaleString()}đ</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description */}
              {course.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h4>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{course.student_count || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Học viên</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{course.sections_count || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Chương</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{course.lessons_count || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Bài học</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{course.completion_rate || 0}%</p>
                  <p className="text-xs text-gray-600 mt-1">Hoàn thành</p>
                </div>
              </div>

              {/* Enrolled Students */}
              {studentsData && studentsData.students.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Học viên đã đăng ký ({studentsData.total})</h4>
                  <div className="space-y-2">
                    {studentsData.students.slice(0, 5).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {enrollment.student.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{enrollment.student.full_name}</p>
                            <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900">{enrollment.progress}%</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(enrollment.enrolled_at), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Hành động</h4>
                
                {/* Status Change */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleStatusChange('published')}
                    disabled={course.status === 'published' || changeStatusMutation.isPending}
                    className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    Xuất bản
                  </button>
                  <button
                    onClick={() => handleStatusChange('draft')}
                    disabled={course.status === 'draft' || changeStatusMutation.isPending}
                    className="px-3 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 disabled:opacity-50"
                  >
                    Chuyển về nháp
                  </button>
                  <button
                    onClick={() => handleStatusChange('archived')}
                    disabled={course.status === 'archived' || changeStatusMutation.isPending}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Lưu trữ
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onEdit(course); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa khóa học
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
                  <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Bạn có chắc chắn muốn xóa khóa học <strong>{course.title}</strong>? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {deleteMutation.isPending && <Spinner size="sm" />}
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Không tìm thấy khóa học</div>
          )}
        </div>
      </div>
    </div>
  );
}
