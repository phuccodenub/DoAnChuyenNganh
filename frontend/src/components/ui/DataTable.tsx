import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  // Sorting
  sortable?: boolean;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  // Row selection
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  // Pagination
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
  };
  // Styling
  className?: string;
  responsive?: boolean;
}

// ============================================================================
// DataTable Component
// ============================================================================

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  sortable = true,
  onSort,
  defaultSortKey,
  defaultSortOrder = 'asc',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  className,
  responsive = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Handle column sort
  const handleSort = (key: string) => {
    if (!sortable) return;

    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  // Handle row selection
  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(keyExtractor));
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return;

    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table wrapper */}
      <div className={cn('overflow-hidden border border-gray-200 rounded-lg', responsive && 'overflow-x-auto')}>
        <table className="w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-label="Chọn tất cả"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable !== false && sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => column.sortable !== false && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable !== false && sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const rowId = keyExtractor(row);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-blue-50 hover:bg-blue-100'
                    )}
                  >
                    {/* Selection cell */}
                    {selectable && (
                      <td className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          aria-label={`Chọn hàng ${rowId}`}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.className)}
                      >
                        {column.render
                          ? column.render(row)
                          : String((row as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg sm:px-6">
          {/* Results info */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              Hiển thị{' '}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.perPage + 1}
              </span>{' '}
              đến{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.perPage, pagination.total)}
              </span>{' '}
              trong tổng số <span className="font-medium">{pagination.total}</span> kết quả
            </p>

            {/* Per page selector */}
            {pagination.onPerPageChange && (
              <select
                value={pagination.perPage}
                onChange={(e) => pagination.onPerPageChange?.(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
              </select>
            )}
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                pagination.page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Trước
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.ceil(pagination.total / pagination.perPage) }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and 2 pages around current
                return (
                  page === 1 ||
                  page === Math.ceil(pagination.total / pagination.perPage) ||
                  Math.abs(page - pagination.page) <= 2
                );
              })
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={cn(
                      'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                );
              })}

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                pagination.page >= Math.ceil(pagination.total / pagination.perPage)
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
