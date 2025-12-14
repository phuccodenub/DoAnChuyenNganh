import React, { useState } from 'react';
import { useActivityLogs, useExportActivityLogs, useClearOldLogs } from '@/hooks/admin/useActivityLogs';
import { ActivityLog } from '@/services/api/activity-logs.api';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Activity, Filter, Download, Trash2, FileJson, FileText, 
  Clock, User, Tag, Server, CheckCircle2, XCircle, Globe 
} from 'lucide-react';

// Helper function to safely format dates
const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
    if (!isValid(date)) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
  } catch {
    return 'N/A';
  }
};

// Helper function to get action label in Vietnamese
const getActionLabel = (action: string): { label: string; color: string } => {
  const actionMap: Record<string, { label: string; color: string }> = {
    login: { label: 'Đăng nhập', color: 'bg-green-100 text-green-800' },
    logout: { label: 'Đăng xuất', color: 'bg-gray-100 text-gray-800' },
    create: { label: 'Tạo mới', color: 'bg-blue-100 text-blue-800' },
    update: { label: 'Cập nhật', color: 'bg-yellow-100 text-yellow-800' },
    delete: { label: 'Xóa', color: 'bg-red-100 text-red-800' },
    register: { label: 'Đăng ký', color: 'bg-purple-100 text-purple-800' },
    password_change: { label: 'Đổi mật khẩu', color: 'bg-orange-100 text-orange-800' },
  };
  return actionMap[action?.toLowerCase()] || { label: action || 'N/A', color: 'bg-gray-100 text-gray-800' };
};

// Helper function to get resource type label in Vietnamese
const getResourceTypeLabel = (resourceType: string): string => {
  const resourceMap: Record<string, string> = {
    auth: 'Xác thực',
    users: 'Người dùng',
    courses: 'Khóa học',
    enrollments: 'Đăng ký',
    lessons: 'Bài học',
    sections: 'Chương',
    quizzes: 'Bài kiểm tra',
    assignments: 'Bài tập',
    'system-settings': 'Cài đặt',
    system: 'Hệ thống',
  };
  return resourceMap[resourceType?.toLowerCase()] || resourceType || 'N/A';
};

export const ActivityLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<{
    action?: string;
    resource_type?: string;
    status?: 'success' | 'failed';
  }>({});

  const { data, isLoading } = useActivityLogs(page, limit, filters);
  const { mutate: exportLogs, isPending: isExporting } = useExportActivityLogs();
  const { mutate: clearLogs, isPending: isClearing } = useClearOldLogs();

  const handleExport = (format: 'csv' | 'json') => {
    exportLogs({ format, filters });
  };

  const handleClearOldLogs = () => {
    if (window.confirm(t('admin.activity_logs.confirm_clear_old_logs'))) {
      clearLogs(90); // Clear logs older than 90 days
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  const columns: Column<ActivityLog>[] = [
    {
      key: 'created_at',
      header: t('admin.activity_logs.timestamp'),
      render: (row) => formatDate(row.created_at),
      sortable: true,
    },
    {
      key: 'user_name',
      header: t('admin.activity_logs.user'),
      render: (row) => row.user_name,
      sortable: true,
    },
    {
      key: 'action',
      header: t('admin.activity_logs.action'),
      render: (row) => {
        const { label, color } = getActionLabel(row.action);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'resource_type',
      header: t('admin.activity_logs.resource_type'),
      render: (row) => (
        <span className="text-gray-600">{getResourceTypeLabel(row.resource_type)}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: t('admin.activity_logs.status'),
      render: (row) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status === 'success' ? '✓ ' : '✗ '}{t(`admin.activity_logs.${row.status}`)}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: t('admin.activity_logs.ip_address'),
      render: (row) => <span className="text-gray-600 font-mono text-xs">{row.ip_address}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {t('admin.activity_logs.activity_logs')}
          </h1>
          <p className="mt-1 text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('admin.activity_logs.system_activity_tracking')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t('admin.activity_logs.filters')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              {t('admin.activity_logs.action')}
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">{t('admin.activity_logs.all_actions')}</option>
              <option value="login">Đăng nhập</option>
              <option value="logout">Đăng xuất</option>
              <option value="create">Tạo mới</option>
              <option value="update">Cập nhật</option>
              <option value="delete">Xóa</option>
              <option value="register">Đăng ký</option>
              <option value="password_change">Đổi mật khẩu</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Server className="w-4 h-4" />
              {t('admin.activity_logs.resource_type')}
            </label>
            <select
              value={filters.resource_type || ''}
              onChange={(e) => setFilters({ ...filters, resource_type: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">{t('admin.activity_logs.all_types')}</option>
              <option value="auth">Xác thực</option>
              <option value="users">Người dùng</option>
              <option value="courses">Khóa học</option>
              <option value="enrollments">Đăng ký khóa học</option>
              <option value="lessons">Bài học</option>
              <option value="sections">Chương</option>
              <option value="quizzes">Bài kiểm tra</option>
              <option value="assignments">Bài tập</option>
              <option value="system-settings">Cài đặt hệ thống</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('admin.activity_logs.status')}
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                status: (e.target.value as 'success' | 'failed') || undefined 
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">{t('admin.activity_logs.all_statuses')}</option>
              <option value="success">{t('admin.activity_logs.success')}</option>
              <option value="failed">{t('admin.activity_logs.failed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {isExporting ? <Spinner className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {t('admin.activity_logs.export_csv')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {isExporting ? <Spinner className="w-4 h-4" /> : <FileJson className="w-4 h-4" />}
            {t('admin.activity_logs.export_json')}
          </Button>
        </div>
        <Button
          variant="secondary"
          onClick={handleClearOldLogs}
          disabled={isClearing}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-md hover:shadow-lg transition-all"
        >
          {isClearing ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          {t('admin.activity_logs.clear_old_logs')}
        </Button>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            {t('admin.activity_logs.activity_history')}
          </h2>
        </div>
        <DataTable
          columns={columns as any}
          data={data?.data || []}
          keyExtractor={(row) => row.id}
          emptyMessage={t('admin.activity_logs.no_activity_logs')}
        />
      </div>
    </div>
  );
};

export default ActivityLogsPage;
