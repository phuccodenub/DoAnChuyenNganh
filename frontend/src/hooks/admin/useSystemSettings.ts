import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemSettingsApi, SystemSettings } from '@/services/api/system-settings.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useSystemSettings = () => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: QUERY_KEYS.systemSettings.all,
    queryFn: () => systemSettingsApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => systemSettingsApi.updateSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.systemSettings.all, data);
      toast.success(t('settings_updated_successfully'));
    },
    onError: () => {
      toast.error(t('error_updating_settings'));
    },
  });
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      site_name: string;
      site_logo_url: string;
      site_favicon_url: string;
      timezone: string;
      language: string;
      currency: string;
      max_upload_size: number;
    }) => systemSettingsApi.updateGeneralSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.systemSettings.all, data);
      toast.success(t('general_settings_updated'));
    },
    onError: () => {
      toast.error(t('error_updating_general_settings'));
    },
  });
};

export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      email_from: string;
      email_provider: 'smtp' | 'sendgrid' | 'aws_ses';
      email_host: string;
      email_port: number;
      email_username: string;
      email_use_tls: boolean;
      smtp_encryption: 'none' | 'ssl' | 'tls';
    }) => systemSettingsApi.updateEmailSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.systemSettings.all, data);
      toast.success(t('email_settings_updated'));
    },
    onError: () => {
      toast.error(t('error_updating_email_settings'));
    },
  });
};

export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      password_min_length: number;
      session_timeout_minutes: number;
      require_email_verification: boolean;
      feature_two_factor: boolean;
      api_rate_limit: number;
      api_rate_limit_window: number;
    }) => systemSettingsApi.updateSecuritySettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.systemSettings.all, data);
      toast.success(t('security_settings_updated'));
    },
    onError: () => {
      toast.error(t('error_updating_security_settings'));
    },
  });
};

export const useUpdateFeatureFlags = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      feature_two_factor: boolean;
      feature_social_login: boolean;
      feature_live_stream: boolean;
      feature_chat: boolean;
      feature_forums: boolean;
      enable_course_reviews: boolean;
      enable_user_profiles: boolean;
      allow_registration: boolean;
      maintenance_mode: boolean;
    }) => systemSettingsApi.updateFeatureFlags(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.systemSettings.all, data);
      toast.success(t('feature_flags_updated'));
    },
    onError: () => {
      toast.error(t('error_updating_feature_flags'));
    },
  });
};

export const useTestEmailConnection = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      email_host: string;
      email_port: number;
      email_username: string;
      email_password: string;
      smtp_encryption: 'none' | 'ssl' | 'tls';
    }) => systemSettingsApi.testEmailConnection(data),
    onSuccess: () => {
      toast.success(t('email_connection_successful'));
    },
    onError: () => {
      toast.error(t('email_connection_failed'));
    },
  });
};
