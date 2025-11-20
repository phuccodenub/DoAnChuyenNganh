import React, { useState } from 'react';
import { useActivityLogs, useExportActivityLogs, useClearOldLogs } from '@/hooks/admin/useActivityLogs';
import { ActivityLog } from '@/services/api/activity-logs.api';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
    if (window.confirm(t('confirm_clear_old_logs'))) {
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
      header: t('timestamp'),
      render: (row) => format(new Date(row.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi }),
      sortable: true,
    },
    {
      key: 'user_name',
      header: t('user'),
      render: (row) => row.user_name,
      sortable: true,
    },
    {
      key: 'action',
      header: t('action'),
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.action}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'resource_type',
      header: t('resource_type'),
      render: (row) => (
        <span className="text-gray-600">{row.resource_type}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: t('status'),
      render: (row) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status === 'success' ? '✓ ' : '✗ '}{t(row.status)}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: t('ip_address'),
      render: (row) => <span className="text-gray-600 font-mono text-xs">{row.ip_address}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('activity_logs')}</h1>
        <p className="mt-2 text-gray-600">{t('system_activity_tracking')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('action')}
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('all_actions')}</option>
              <option value="create">CREATE</option>
              <option value="update">UPDATE</option>
              <option value="delete">DELETE</option>
              <option value="login">LOGIN</option>
              <option value="logout">LOGOUT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resource_type')}
            </label>
            <select
              value={filters.resource_type || ''}
              onChange={(e) => setFilters({ ...filters, resource_type: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('all_types')}</option>
              <option value="user">Người dùng</option>
              <option value="course">Khóa học</option>
              <option value="lesson">Bài học</option>
              <option value="quiz">Bài kiểm tra</option>
              <option value="assignment">Bài tập</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('status')}
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                status: (e.target.value as 'success' | 'failed') || undefined 
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('all_statuses')}</option>
              <option value="success">{t('success')}</option>
              <option value="failed">{t('failed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting && <Spinner className="w-4 h-4" />}
            {t('export_csv')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting && <Spinner className="w-4 h-4" />}
            {t('export_json')}
          </Button>
        </div>
        <Button
          variant="secondary"
          onClick={handleClearOldLogs}
          disabled={isClearing}
          className="gap-2 text-red-600 hover:text-red-700"
        >
          {isClearing && <Spinner className="w-4 h-4" />}
          {t('clear_old_logs')}
        </Button>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns as any}
          data={data?.data || []}
          keyExtractor={(row) => row.id}
          emptyMessage={t('no_activity_logs')}
        />
      </div>
    </div>
  );
};

export default ActivityLogsPage;
