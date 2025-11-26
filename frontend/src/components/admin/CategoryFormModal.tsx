import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { categoryFormSchema, type CategoryFormData, type Category } from '@/types/course.admin.types';
import { useCreateCategory, useUpdateCategory, useCategories } from '@/hooks/useCategories';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null; // null = create, Category = edit
}

/**
 * CategoryFormModal Component
 * 
 * Modal for creating and editing categories
 * Features:
 * - React Hook Form with Zod validation
 * - Create/Edit mode
 * - Auto-generate slug from name
 * - Parent category selection (for hierarchy)
 */
export default function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const isEditMode = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { data: categories } = useCategories({ include_inactive: false });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: undefined,
      slug: '',
      is_active: true,
      icon_url: '',
    },
  });

  // Watch name to auto-generate slug
  const nameValue = watch('name');

  useEffect(() => {
    if (!isEditMode && nameValue) {
      // Auto-generate slug from name
      const slug = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove multiple hyphens
      setValue('slug', slug);
    }
  }, [nameValue, isEditMode, setValue]);

  // Reset form when category changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          parent_id: category.parent_id || undefined,
          slug: category.slug,
          is_active: category.is_active,
          icon_url: category.icon_url || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          parent_id: undefined,
          slug: '',
          is_active: true,
          icon_url: '',
        });
      }
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditMode && category) {
        // Update category
        await updateMutation.mutateAsync({
          categoryId: category.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            parent_id: data.parent_id || undefined,
            slug: data.slug || undefined,
            is_active: data.is_active,
            icon_url: data.icon_url || undefined,
          },
        });
      } else {
        // Create category
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          parent_id: data.parent_id || undefined,
          slug: data.slug || undefined,
          is_active: data.is_active,
          icon_url: data.icon_url || undefined,
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
      title={isEditMode ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Lập trình, Thiết kế, Kinh doanh..."
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả <span className="text-gray-500 text-xs">(Tùy chọn)</span>
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả ngắn về danh mục..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Parent Category */}
        <div>
          <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục cha <span className="text-gray-500 text-xs">(Tùy chọn)</span>
          </label>
          <select
            {...register('parent_id', {
              setValueAs: (v) => (v === '' ? undefined : v),
            })}
            id="parent_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Không có --</option>
            {categories
              ?.filter((c) => !isEditMode || c.id !== category?.id) // Don't show self
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-gray-500 text-xs">(URL thân thiện)</span>
          </label>
          <input
            {...register('slug')}
            type="text"
            id="slug"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="lap-trinh, thiet-ke..."
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Chỉ chữ thường, số và dấu gạch ngang. Tự động tạo từ tên nếu để trống.
          </p>
        </div>

        {/* Icon URL */}
        <div>
          <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">
            URL biểu tượng <span className="text-gray-500 text-xs">(Tùy chọn)</span>
          </label>
          <input
            {...register('icon_url')}
            type="url"
            id="icon_url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/icon.png"
          />
          {errors.icon_url && (
            <p className="mt-1 text-sm text-red-600">{errors.icon_url.message}</p>
          )}
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3">
          <input
            {...register('is_active')}
            type="checkbox"
            id="is_active"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Danh mục hoạt động
          </label>
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
