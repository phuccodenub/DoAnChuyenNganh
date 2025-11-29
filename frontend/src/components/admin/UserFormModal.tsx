import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { userFormSchema, type UserFormData, type AdminUser } from '@/types/admin.types';
import { useCreateUser, useUpdateUser } from '@/hooks/useAdminUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser | null; // null = create, AdminUser = edit
}

/**
 * UserFormModal Component
 * 
 * Modal for creating and editing users
 * Features:
 * - React Hook Form with Zod validation
 * - Create/Edit mode
 * - Avatar URL input
 * - Role and status selectors
 */
export default function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const isEditMode = !!user;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      full_name: '',
      role: 'student',
      status: 'active',
      password: '',
      bio: '',
      avatar_url: '',
    },
  });

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
          password: '', // Don't populate password in edit mode
          bio: user.bio || '',
          avatar_url: user.avatar_url || '',
        });
      } else {
        reset({
          email: '',
          full_name: '',
          role: 'student',
          status: 'active',
          password: '',
          bio: '',
          avatar_url: '',
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode && user) {
        // Update user
        await updateUserMutation.mutateAsync({
          userId: user.id,
          data: {
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            status: data.status,
            bio: data.bio || undefined,
            avatar_url: data.avatar_url || undefined,
            password: data.password || undefined, // Only send if provided
          },
        });
      } else {
        // Create user
        if (!data.password) {
          // This should never happen due to validation, but TypeScript safety
          return;
        }
        await createUserMutation.mutateAsync({
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          status: data.status,
          password: data.password,
          bio: data.bio || undefined,
          avatar_url: data.avatar_url || undefined,
        });
      }
      onClose();
      reset();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Submit error:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register('full_name')}
            type="text"
            id="full_name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nguyễn Văn A"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <select
            {...register('role')}
            id="role"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="student">Học viên</option>
            <option value="instructor">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('status')}
                type="radio"
                value="active"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('status')}
                type="radio"
                value="suspended"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tạm ngưng</span>
            </label>
          </div>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu {!isEditMode && <span className="text-red-500">*</span>}
            {isEditMode && <span className="text-gray-500 text-xs ml-2">(Để trống nếu không đổi)</span>}
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isEditMode ? '••••••••' : 'Tối thiểu 8 ký tự'}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Tiểu sử <span className="text-gray-500 text-xs">(Tùy chọn)</span>
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả ngắn về người dùng..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
            URL ảnh đại diện <span className="text-gray-500 text-xs">(Tùy chọn)</span>
          </label>
          <input
            {...register('avatar_url')}
            type="url"
            id="avatar_url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar_url && (
            <p className="mt-1 text-sm text-red-600">{errors.avatar_url.message}</p>
          )}
        </div>

        {/* Footer */}
        <ModalFooter>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Spinner size="sm" />}
            <span>{isEditMode ? 'Cập nhật' : 'Tạo mới'}</span>
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
