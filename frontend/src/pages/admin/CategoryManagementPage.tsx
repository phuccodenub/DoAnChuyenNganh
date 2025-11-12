import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Spinner } from '@/components/ui/Spinner';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import { useCategories, useCategoryStats, useDeleteCategory } from '@/hooks/useCategories';
import type { Category } from '@/types/course.admin.types';

/**
 * CategoryManagementPage Component
 * 
 * Category management interface with:
 * - Category list/grid display
 * - Create/Edit/Delete operations
 * - Search by name
 * - Category statistics
 */
export default function CategoryManagementPage() {
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useCategories({ include_inactive: true });
  const { data: stats } = useCategoryStats();
  const deleteMutation = useDeleteCategory();

  // Filter categories by search
  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleDelete = async (category: Category) => {
    if (category.course_count > 0) {
      if (
        !confirm(
          `Danh mục "${category.name}" có ${category.course_count} khóa học. Bạn có chắc chắn muốn xóa?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
        return;
      }
    }

    setDeletingId(category.id);
    try {
      await deleteMutation.mutateAsync(category.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục khóa học</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo danh mục</span>
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Tổng danh mục</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_categories}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active_categories}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Top danh mục</p>
            <p className="text-sm text-gray-900 mt-1">
              {stats.top_categories[0]?.name || 'N/A'} (
              {stats.top_categories[0]?.course_count || 0} khóa học)
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách danh mục</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {category.icon_url ? (
                        <img
                          src={category.icon_url}
                          alt={category.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Folder className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                      <p className="text-xs text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>

                {/* Description */}
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Parent Category */}
                {category.parent && (
                  <p className="text-xs text-gray-500 mb-3">
                    Danh mục cha: <span className="font-medium">{category.parent.name}</span>
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-900">{category.course_count}</span> khóa
                    học
                  </span>
                  <span className="text-gray-500">
                    {format(new Date(category.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === category.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">
              {searchInput ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
            </p>
            {!searchInput && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Tạo danh mục đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={showCreateModal || !!editingCategory}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
}
