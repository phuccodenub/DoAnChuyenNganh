import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Copy, Loader2, AlertCircle, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES, generateRoute } from '@/constants/routes';
import { useInstructorCourses } from '@/hooks/useInstructorCourse';
import { Pagination } from '@/components/common/Pagination';

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
  const [sortField, setSortField] = useState<'title' | 'updated_at' | 'students' | 'lessons'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch courses from API
  const { data: coursesResponse, isLoading, error } = useInstructorCourses({
    status: filter === 'all' ? undefined : filter,
  });

  // Course type for this component
  interface CourseItem {
    id: string;
    title: string;
    status: string;
    students: number;
    lessons: number;
    thumbnail_url: string | null;
    updated_at: string;
    is_free: boolean;
    price?: number;
  }

  // Transform API response to component format
  const courses: CourseItem[] = useMemo(() => {
    if (!coursesResponse?.data) return [];
    // API returns { data: [...], pagination: {...} } format
    const responseData = coursesResponse.data as any;
    const coursesData = Array.isArray(responseData)
      ? responseData
      : responseData?.data || [];

    return coursesData.map((course: any) => {
      // Filter out invalid blob URLs - they don't persist across page reloads
      const thumbnailUrl = course.thumbnail_url?.startsWith('blob:') ? null : course.thumbnail_url;
      return {
        id: course.id,
        title: course.title,
        status: course.status || 'draft',
        students: course.total_students || 0,
        lessons: course.total_lessons || 0,
        thumbnail_url: thumbnailUrl,
        updated_at: course.updated_at,
        is_free: course.is_free || course.price === 0,
        price: course.price,
      };
    });
  }, [coursesResponse]);

  const statusLabels: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Nháp',
    archived: 'Lưu trữ',
  };

  const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Nháp' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  const filteredCourses = useMemo(() => {
    const result = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || course.status === filter;
      return matchesSearch && matchesFilter;
    });

    // Sort courses
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'students':
          aValue = a.students;
          bValue = b.students;
          break;
        case 'lessons':
          aValue = a.lessons;
          bValue = b.lessons;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [courses, searchQuery, filter, sortField, sortDirection]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Calculate display range
  const displayStart = filteredCourses.length > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(endIndex, filteredCourses.length);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải khóa học...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải khóa học</h3>
          <p className="text-gray-600 mb-4">Đã có lỗi xảy ra khi tải danh sách khóa học.</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Quản lý tất cả khóa học của bạn</p>
          </div>
          <Link to={ROUTES.COURSE_CREATE}>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1.5">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as typeof filter)}
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all ${filter === option.value
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        {filteredCourses.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors group"
                      >
                        Tiêu đề
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('students')}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors group"
                      >
                        Học viên
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('lessons')}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors group"
                      >
                        Bài học
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('updated_at')}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors group"
                      >
                        Cập nhật
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        <Link to={generateRoute.courseManagement(course.id)} className="block">
                          <div className="w-40 aspect-video bg-gray-100 relative overflow-hidden rounded-md border border-gray-200">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${course.thumbnail_url ? 'hidden' : ''
                                }`}
                            >
                              <img
                                src="/GekLearn.png"
                                alt="GekLearn logo"
                                className="h-12 w-auto object-contain opacity-80"
                              />
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <Link
                          to={generateRoute.courseManagement(course.id)}
                          className="block group"
                        >
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5 max-w-md">
                            {course.title}
                          </div>
                          <div className="flex items-center gap-2">
                            {course.is_free ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                Miễn phí
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600 font-medium">
                                {course.price?.toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge
                          variant={statusColors[course.status as keyof typeof statusColors]}
                          size="sm"
                        >
                          {statusLabels[course.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>

                      {/* Students */}
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {course.students.toLocaleString('vi-VN')}
                      </td>

                      {/* Lessons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{course.lessons}</span>
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(course.updated_at).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={generateRoute.instructor.courseDetail(course.id)}>
                            <button
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link to={generateRoute.courseManagement(course.id)}>
                            <button
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDuplicate(course.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="Nhân bản"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id, course.title)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results count & Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results count */}
                <p className="text-sm text-gray-500">
                  {filteredCourses.length > 0 ? (
                    <>
                      Hiển thị <span className="font-semibold text-gray-900">{displayStart}-{displayEnd}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học
                    </>
                  ) : (
                    'Không có khóa học nào'
                  )}
                </p>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showFirstLast={true}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filter !== 'all'
                ? 'Không tìm thấy khóa học nào'
                : 'Bạn chưa có khóa học nào'
              }
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {searchQuery || filter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Tạo khóa học đầu tiên của bạn để bắt đầu'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <Link to={ROUTES.COURSE_CREATE}>
                <Button className="gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học mới
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCoursesPage;
