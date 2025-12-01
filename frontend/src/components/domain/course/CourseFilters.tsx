import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CourseFilters as CourseFiltersType } from '@/services/api/course.api';

interface CourseFiltersProps {
  filters: Partial<CourseFiltersType>;
  onFilterChange: (key: keyof CourseFiltersType, value: any) => void;
  onReset: () => void;
  categories?: Array<{ id: string; name: string }>;
}

/**
 * CourseFilters Component
 * 
 * Component filter cho course catalog với:
 * - Search input
 * - Category filter
 * - Difficulty filter
 * - Price filter (Free/Paid)
 * - Reset button
 */
export function CourseFilters({
  filters,
  onFilterChange,
  onReset,
  categories = [],
}: CourseFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category_id ||
    filters.difficulty ||
    filters.is_free !== undefined;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value || undefined)}
            placeholder="Tìm kiếm khóa học, giảng viên..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Danh mục
          </label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Difficulty */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Độ khó
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => onFilterChange('difficulty', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả cấp độ</option>
          <option value="beginner">Cơ bản</option>
          <option value="intermediate">Trung cấp</option>
          <option value="advanced">Nâng cao</option>
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Giá
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.is_free === true}
              onChange={(e) => onFilterChange('is_free', e.target.checked ? true : undefined)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Miễn phí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.is_free === false}
              onChange={(e) => onFilterChange('is_free', e.target.checked ? false : undefined)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Có phí</span>
          </label>
        </div>
      </div>
    </div>
  );
}

