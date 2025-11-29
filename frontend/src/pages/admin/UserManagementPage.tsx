import { useState, useMemo, useCallback } from 'react';
import { UserPlus, Search, Filter, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Spinner } from '@/components/ui/Spinner';
import UserFormModal from '@/components/admin/UserFormModal';
import UserDetailModal from '@/components/admin/UserDetailModal';
import { useAdminUsers, useBulkAction, useExportUsers } from '@/hooks/useAdminUsers';
import type { AdminUser, UserListFilters, UserRole, UserStatus } from '@/types/admin.types';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * UserManagementPage Component
 * 
 * Complete user management interface with:
 * - DataTable with sorting, pagination, row selection
 * - Advanced filters (search, role, status, date range)
 * - Bulk actions (delete, activate, suspend)
 * - Create/Edit/View user modals
 * - Export to CSV
 */
export default function UserManagementPage() {
  // State management
  const [filters, setFilters] = useState<UserListFilters>({
    page: 1,
    per_page: 25,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  // API hooks
  const finalFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch || undefined }),
    [filters, debouncedSearch]
  );
  const { data: usersData, isLoading } = useAdminUsers(finalFilters);
  const bulkActionMutation = useBulkAction();
  const exportMutation = useExportUsers();

  // Handler functions
  const handleFilterChange = useCallback((key: keyof UserListFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  }, []);

  const handleSort = useCallback((key: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sort_by: key as 'created_at' | 'full_name' | 'email',
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
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} người dùng?`)) return;

    await bulkActionMutation.mutateAsync({
      user_ids: selectedRows,
      action: 'delete',
    });
    setSelectedRows([]);
  };

  const handleBulkActivate = async () => {
    if (selectedRows.length === 0) return;
    await bulkActionMutation.mutateAsync({
      user_ids: selectedRows,
      action: 'activate',
    });
    setSelectedRows([]);
  };

  const handleBulkSuspend = async () => {
    if (selectedRows.length === 0) return;
    await bulkActionMutation.mutateAsync({
      user_ids: selectedRows,
      action: 'suspend',
    });
    setSelectedRows([]);
  };

  const handleExport = async () => {
    await exportMutation.mutateAsync(finalFilters);
  };

  // DataTable columns
  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name',
      header: 'Người dùng',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{user.full_name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      sortable: false,
      render: (user) => {
        const roleColors: Record<UserRole, string> = {
          super_admin: 'bg-purple-100 text-purple-800',
          admin: 'bg-blue-100 text-blue-800',
          instructor: 'bg-green-100 text-green-800',
          student: 'bg-gray-100 text-gray-800',
        };
        const roleLabels: Record<UserRole, string> = {
          super_admin: 'Quản trị cấp cao',
          admin: 'Quản trị viên',
          instructor: 'Giảng viên',
          student: 'Học viên',
        };
        return (
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', roleColors[user.role])}>
            {roleLabels[user.role]}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (user) =>
        user.status === 'active' ? (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Hoạt động
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <XCircle className="w-4 h-4" />
            Tạm ngưng
          </span>
        ),
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600">{format(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      sortable: false,
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingUserId(user.id)}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Xem
          </button>
          <button
            onClick={() => setEditingUser(user)}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sửa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tạo người dùng</span>
        </button>
      </div>

      {/* Stats Summary */}
      {usersData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Tổng số</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{usersData.pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Học viên</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {usersData.users.filter((u) => u.role === 'student').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Giảng viên</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {usersData.users.filter((u) => u.role === 'instructor').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Quản trị viên</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {usersData.users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleFilterChange('role', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Học viên</option>
              <option value="instructor">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="suspended">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-900">Đã chọn {selectedRows.length} người dùng</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              disabled={bulkActionMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-white border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Kích hoạt
            </button>
            <button
              onClick={handleBulkSuspend}
              disabled={bulkActionMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Tạm ngưng
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
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
          <h2 className="text-lg font-semibold text-gray-900">Danh sách người dùng</h2>
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
          data={usersData?.users || []}
          keyExtractor={(user) => user.id}
          loading={isLoading}
          emptyMessage="Không tìm thấy người dùng nào"
          sortable={true}
          onSort={handleSort}
          defaultSortKey={filters.sort_by}
          defaultSortOrder={filters.sort_order}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={(ids) => setSelectedRows(ids.map(String))}
          pagination={
            usersData
              ? {
                  page: usersData.pagination.page,
                  perPage: usersData.pagination.per_page,
                  total: usersData.pagination.total,
                  onPageChange: handlePageChange,
                  onPerPageChange: handlePerPageChange,
                }
              : undefined
          }
        />
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showCreateModal || !!editingUser}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
      />

      {viewingUserId && (
        <UserDetailModal
          isOpen={true}
          onClose={() => setViewingUserId(null)}
          userId={viewingUserId}
          onEdit={(user) => {
            setViewingUserId(null);
            setEditingUser(user);
          }}
        />
      )}
    </div>
  );
}
