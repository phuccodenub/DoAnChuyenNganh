import { useState, useMemo, useCallback } from 'react';
import { Search, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Spinner } from '@/components/ui/Spinner';
import CourseDetailModal from '@/components/admin/CourseDetailModal';
import { useAdminCourses, useCourseStats, useBulkCourseAction, useExportCourses } from '@/hooks/useAdminCourses';
import { useCategories } from '@/hooks/useCategories';
import type { AdminCourse, CourseAdminFilters, CourseStatus } from '@/types/course.admin.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CourseAdminFilters>({
    page: 1,
    per_page: 25,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [viewingCourseId, setViewingCourseId] = useState<number | null>(null);

  const finalFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch]
  );
  
  const { data: coursesData, isLoading } = useAdminCourses(finalFilters);
  const { data: stats } = useCourseStats();
  const { data: categories } = useCategories();
  const bulkActionMutation = useBulkCourseAction();
  const exportMutation = useExportCourses();

  const handleFilterChange = useCallback((key: keyof CourseAdminFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleSort = useCallback((key: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sort_by: key as 'title' | 'created_at' | 'student_count',
      sort_order: order,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePerPageChange = useCallback((perPage: number) => {
    setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
  }, []);

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} khóa học?`)) return;
    await bulkActionMutation.mutateAsync({
      course_ids: selectedRows.map(Number),
      action: 'delete',
    });
    setSelectedRows([]);
  };

  const handleBulkStatusChange = async (action: 'publish' | 'archive' | 'draft') => {
    if (selectedRows.length === 0) return;
    await bulkActionMutation.mutateAsync({
      course_ids: selectedRows.map(Number),
      action,
    });
    setSelectedRows([]);
  };

  const handleExport = async () => {
    await exportMutation.mutateAsync(finalFilters);
  };

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<AdminCourse>[] = [
    {
      key: 'title',
      header: 'Khóa học',
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title} className="w-16 h-16 object-cover rounded-lg" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{course.title}</p>
            <p className="text-sm text-gray-500 truncate">{course.instructor.full_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      sortable: false,
      render: (course) => (
        <span className="text-sm text-gray-600">{course.category?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (course) => (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(course.status))}>
          {course.status === 'published' ? 'Đã xuất bản' : course.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
        </span>
      ),
    },
    {
      key: 'student_count',
      header: 'Học viên',
      sortable: true,
      render: (course) => <span className="text-sm font-medium text-gray-900">{course.student_count}</span>,
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      sortable: true,
      render: (course) => (
        <span className="text-sm text-gray-600">{format(new Date(course.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      sortable: false,
      render: (course) => (
        <button
          onClick={() => setViewingCourseId(course.id)}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          Xem
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả khóa học trong hệ thống</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Tổng khóa học</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_courses}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Đã xuất bản</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.published_courses}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Bản nháp</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.draft_courses}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Tổng học viên</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total_students}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <select
            value={filters.category_id || ''}
            onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-900">Đã chọn {selectedRows.length} khóa học</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('publish')}
              disabled={bulkActionMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              Xuất bản
            </button>
            <button
              onClick={() => handleBulkStatusChange('archive')}
              disabled={bulkActionMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Lưu trữ
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
            >
              {bulkActionMutation.isPending ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách khóa học</h2>
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {exportMutation.isPending ? <Spinner size="sm" /> : <Download className="w-4 h-4" />}
            Xuất CSV
          </button>
        </div>

        <DataTable
          columns={columns}
          data={coursesData?.courses || []}
          keyExtractor={(course) => course.id}
          loading={isLoading}
          emptyMessage="Không tìm thấy khóa học nào"
          sortable={true}
          onSort={handleSort}
          defaultSortKey={filters.sort_by}
          defaultSortOrder={filters.sort_order}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          pagination={
            coursesData
              ? {
                  page: coursesData.pagination.page,
                  perPage: coursesData.pagination.per_page,
                  total: coursesData.pagination.total,
                  onPageChange: handlePageChange,
                  onPerPageChange: handlePerPageChange,
                }
              : undefined
          }
        />
      </div>

      {/* Modals */}
      {viewingCourseId && (
        <CourseDetailModal
          isOpen={true}
          onClose={() => setViewingCourseId(null)}
          courseId={viewingCourseId}
          onEdit={(course) => {
            setViewingCourseId(null);
            // Navigate to instructor course editor
            navigate(`/instructor/courses/${course.id}/edit`);
          }}
        />
      )}
    </div>
  );
}
