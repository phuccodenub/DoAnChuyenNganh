import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Copy, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES, generateRoute } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { useInstructorCourses } from '@/hooks/useCoursesData';

/**
 * MyCoursesPage
 * 
 * Trang quản lý khóa học của giảng viên:
 * - Danh sách khóa học
 * - Tìm kiếm & lọc
 * - CRUD operations
 * - Vietnamese UI
 */
export function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const { data, isLoading, isError, refetch } = useInstructorCourses(true);

  const courses = data?.data?.courses ?? [];

  const statusLabels = {
    published: 'Đã xuất bản',
    draft: 'Nháp',
    archived: 'Đã lưu trữ',
  };

  const statusColors = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
  } as const;

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Nháp' },
    { value: 'archived', label: 'Đã lưu trữ' },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || course.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [courses, filter, searchQuery]);

  const handleDelete = (courseId: string, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa khóa học "${title}"?`)) {
      // TODO: Implement delete API
      console.log('Delete course:', courseId);
    }
  };

  const handleDuplicate = (courseId: string) => {
    // TODO: Implement duplicate API
    console.log('Duplicate course:', courseId);
  };

  return (
    <MainLayout showSidebar>
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 md:px-8 md:py-8">
    <div className="max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả khóa học của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          {isError && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          )}
          <Link to={ROUTES.COURSE_CREATE}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as typeof filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị <strong>{filteredCourses.length}</strong> / {courses.length} khóa học
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <p className="text-gray-600">Không thể tải danh sách khóa học.</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const statusKey = course.status as keyof typeof statusLabels;
            const statusLabel = statusLabels[statusKey] ?? 'Đang xử lý';
            const statusVariant = statusColors[statusKey] ?? 'default';
            const enrollmentCount = course._count?.enrollments ?? 0;
            return (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <Link to={generateRoute.courseManagement(course.id)}>
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  )}
                </div>
              </Link>

              {/* Content */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <Link
                    to={generateRoute.courseManagement(course.id)}
                    className="hover:text-blue-600"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={statusVariant}>
                      {statusLabel}
                    </Badge>
                    {course.is_free ? (
                      <Badge variant="success">Miễn phí</Badge>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">
                        {course.price?.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours ?? 0} giờ học
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {enrollmentCount.toLocaleString('vi-VN')} học viên
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Cập nhật: {new Date(course.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Link
                    to={generateRoute.courseDetail(course.id)}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" fullWidth className="gap-2">
                      <Eye className="w-4 h-4" />
                      Xem
                    </Button>
                  </Link>

                  <Link
                    to={generateRoute.courseManagement(course.id)}
                    className="flex-1"
                  >
                    <Button size="sm" fullWidth className="gap-2">
                      <Edit className="w-4 h-4" />
                      Sửa
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDuplicate(course.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Nhân bản"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>

                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filter !== 'all'
                ? 'Không tìm thấy khóa học nào'
                : 'Bạn chưa có khóa học nào'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Tạo khóa học đầu tiên của bạn để bắt đầu'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <Link to={ROUTES.COURSE_CREATE}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học mới
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
    </div>
    </MainLayout>
  );
}

export default MyCoursesPage;
