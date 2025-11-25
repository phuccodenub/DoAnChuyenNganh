import { httpClient } from '@/services/http/client';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface ActivityLogResponse {
  success: boolean;
  data: {
    data: ActivityLog[];
    total: number;
    page: number;
    limit: number;
  };
}

export const activityLogsApi = {
  getLogs: async (
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
  ): Promise<{ data: ActivityLog[]; total: number; page: number; limit: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters || {}).filter(([, v]) => v !== undefined)),
    });
    const response = await httpClient.get<ActivityLogResponse>(`/admin/activity-logs?${params}`);
    return response.data.data;
  },

  getLogDetail: async (logId: string): Promise<ActivityLog> => {
    const response = await httpClient.get<{ success: boolean; data: ActivityLog }>(`/admin/activity-logs/${logId}`);
    return response.data.data;
  },

  clearOldLogs: async (days: number = 90): Promise<{ deleted_count: number }> => {
    const response = await httpClient.post<{ success: boolean; data: { deleted_count: number } }>(
      '/admin/activity-logs/clear',
      { older_than_days: days }
    );
    return response.data.data;
  },

  exportLogs: async (
    format: 'csv' | 'json' = 'csv',
    filters?: {
      action?: string;
      resource_type?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<Blob> => {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(Object.entries(filters || {}).filter(([, v]) => v !== undefined)),
    });
    const response = await httpClient.get(`/admin/activity-logs/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
