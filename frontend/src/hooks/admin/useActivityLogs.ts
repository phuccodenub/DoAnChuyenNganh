import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityLogsApi, ActivityLog } from '@/services/api/activity-logs.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useActivityLogs = (
  page: number = 1,
  limit: number = 20,
  filters?: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    status?: 'success' | 'failed';
    date_from?: string;
    date_to?: string;
  }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.activityLogs.list(filters),
    queryFn: () => activityLogsApi.getLogs(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivityLogDetail = (logId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.activityLogs.detail(logId),
    queryFn: () => activityLogsApi.getLogDetail(logId),
  });
};

export const useClearOldLogs = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (days: number) => activityLogsApi.clearOldLogs(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activityLogs.all });
      toast.success(t('admin.activity_logs.toast.old_logs_cleared_successfully'));
    },
    onError: () => {
      toast.error(t('admin.activity_logs.toast.error_clearing_old_logs'));
    },
  });
};

export const useExportActivityLogs = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (params: {
      format: 'csv' | 'json';
      filters?: {
        action?: string;
        resource_type?: string;
        date_from?: string;
        date_to?: string;
      };
    }) => activityLogsApi.exportLogs(params.format, params.filters),
    onSuccess: (blob, params) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs.${params.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('admin.activity_logs.toast.logs_exported_successfully'));
    },
    onError: () => {
      toast.error(t('admin.activity_logs.toast.error_exporting_logs'));
    },
  });
};
