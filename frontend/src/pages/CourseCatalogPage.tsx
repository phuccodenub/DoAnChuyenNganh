import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CourseCard } from '@/components/domain/course/CourseCard';
import { Pagination } from '@/components/common/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useCourses } from '@/hooks/useCoursesData';
import { useDebounce } from '@/hooks/useDebounce';
import { CourseFilters } from '@/services/api/course.api';

/**
 * Course Catalog Page
 * 
 * Trang danh sách khóa học công khai
 * - Search với debounce
 * - Filters (category, difficulty, price)
 * - Pagination
 * - Responsive grid layout
 */
export function CourseCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Partial<CourseFilters>>({
    status: 'published', // Chỉ hiển thị courses đã publish
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search để tránh gọi API quá nhiều
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch courses với filters
  const { data, isLoading, error } = useCourses({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    ...filters,
  });

  const courses = data?.data?.courses || [];
  const pagination = data?.data?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset về trang 1 khi filter thay đổi
  };

  const clearFilters = () => {
    setFilters({ status: 'published' });
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = 
    searchTerm || 
    filters.difficulty || 
    filters.is_free !== undefined ||
    filters.category_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Khám phá khóa học
          </h1>
          <p className="text-gray-600">
            Tìm kiếm và đăng ký các khóa học phù hợp với bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside
            className={`lg:w-64 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Difficulty filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Độ khó
                </h3>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'Tất cả' },
                    { value: 'beginner', label: 'Cơ bản' },
                    { value: 'intermediate', label: 'Trung cấp' },
                    { value: 'advanced', label: 'Nâng cao' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        checked={filters.difficulty === option.value || (!filters.difficulty && !option.value)}
                        onChange={() =>
                          handleFilterChange('difficulty', option.value || undefined)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Giá
                </h3>
                <div className="space-y-2">
                  {[
                    { value: undefined, label: 'Tất cả' },
                    { value: true, label: 'Miễn phí' },
                    { value: false, label: 'Có phí' },
                  ].map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        checked={filters.is_free === option.value}
                        onChange={() =>
                          handleFilterChange('is_free', option.value)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Search & filter toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex gap-4">
                {/* Search input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Active filters badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchTerm && (
                    <Badge variant="info">
                      Tìm kiếm: {searchTerm}
                    </Badge>
                  )}
                  {filters.difficulty && (
                    <Badge variant="default">
                      Độ khó: {
                        filters.difficulty === 'beginner' ? 'Cơ bản' :
                        filters.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'
                      }
                    </Badge>
                  )}
                  {filters.is_free !== undefined && (
                    <Badge variant="success">
                      {filters.is_free ? 'Miễn phí' : 'Có phí'}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="xl" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Không thể tải danh sách khóa học</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">
                  Không tìm thấy khóa học nào
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Hiển thị {courses.length} trong tổng số{' '}
                    {pagination?.total || 0} khóa học
                  </p>
                </div>

                {/* Courses grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CourseCatalogPage;
