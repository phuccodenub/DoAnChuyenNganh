import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  X,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Key,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminUser } from '@/types/admin.types';
import {
  useAdminUser,
  useUserStats,
  useDeleteUser,
  useChangeUserStatus,
  useResetUserPassword,
} from '@/hooks/useAdminUsers';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEdit: (user: AdminUser) => void;
}

/**
 * UserDetailModal Component
 * 
 * Display full user details with statistics and action buttons
 * Features:
 * - User info display
 * - User statistics (role-based)
 * - Action buttons (edit, delete, reset password, change status)
 */
export default function UserDetailModal({ isOpen, onClose, userId, onEdit }: UserDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { data: user, isLoading } = useAdminUser(userId, isOpen);
  const { data: stats } = useUserStats(userId, isOpen);
  const deleteUserMutation = useDeleteUser();
  const changeStatusMutation = useChangeUserStatus();
  const resetPasswordMutation = useResetUserPassword();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!user) return;
    await deleteUserMutation.mutateAsync(user.id);
    onClose();
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await changeStatusMutation.mutateAsync({ userId: user.id, status: newStatus });
  };

  const handleResetPassword = async () => {
    if (!user) return;
    await resetPasswordMutation.mutateAsync(user.id);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Quản trị cấp cao',
      admin: 'Quản trị viên',
      instructor: 'Giảng viên',
      student: 'Học viên',
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getRoleBadgeColor(user.role))}>
                      {getRoleLabel(user.role)}
                    </span>
                    {user.status === 'active' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Tạm ngưng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Tiểu sử</h4>
                  <p className="text-sm text-gray-600">{user.bio}</p>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Ngày tạo</h4>
                  <p className="text-sm text-gray-900">
                    {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
                {user.last_login && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Đăng nhập cuối</h4>
                    <p className="text-sm text-gray-900">
                      {format(new Date(user.last_login), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Email xác thực</h4>
                  <p className="text-sm text-gray-900">
                    {user.email_verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Chưa xác thực
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Xác thực 2 yếu tố</h4>
                  <p className="text-sm text-gray-900">
                    {user.two_factor_enabled ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đã bật
                      </span>
                    ) : (
                      <span className="text-gray-600">Chưa bật</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Thống kê</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {user.role === 'student' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{stats.enrolled_courses_count || 0}</p>
                          <p className="text-xs text-gray-600 mt-1">Khóa học đã đăng ký</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{stats.completed_courses_count || 0}</p>
                          <p className="text-xs text-gray-600 mt-1">Khóa học hoàn thành</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{stats.quiz_average_score || 0}%</p>
                          <p className="text-xs text-gray-600 mt-1">Điểm trung bình</p>
                        </div>
                      </>
                    )}
                    {user.role === 'instructor' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{stats.courses_created_count || 0}</p>
                          <p className="text-xs text-gray-600 mt-1">Khóa học đã tạo</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{stats.total_students_count || 0}</p>
                          <p className="text-xs text-gray-600 mt-1">Tổng học viên</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.total_revenue ? `${stats.total_revenue.toLocaleString()}đ` : '0đ'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Doanh thu</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Hành động</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onEdit(user);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={changeStatusMutation.isPending}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
                      user.status === 'active'
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    )}
                  >
                    {user.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                  >
                    <Key className="w-4 h-4" />
                    Đặt lại mật khẩu
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteUserMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa người dùng
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
                      Bạn có chắc chắn muốn xóa người dùng <strong>{user.full_name}</strong>? Hành động này không thể hoàn tác.
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
                        disabled={deleteUserMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {deleteUserMutation.isPending && <Spinner size="sm" />}
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Không tìm thấy người dùng</div>
          )}
        </div>
      </div>
    </div>
  );
}
