import { httpClient } from '@/services/http/client';

export interface SystemSettingsResponse {
  success: boolean;
  data: SystemSettings;
}

export interface SystemSettings {
  id: number;
  site_name: string;
  site_logo_url: string;
  site_favicon_url: string;
  timezone: string;
  language: string;
  currency: string;
  max_upload_size: number;
  maintenance_mode: boolean;
  allow_registration: boolean;
  require_email_verification: boolean;
  password_min_length: number;
  session_timeout_minutes: number;
  email_from: string;
  email_provider: 'smtp' | 'sendgrid' | 'aws_ses';
  email_host: string;
  email_port: number;
  email_username: string;
  email_use_tls: boolean;
  smtp_encryption: 'none' | 'ssl' | 'tls';
  feature_two_factor: boolean;
  feature_social_login: boolean;
  feature_live_stream: boolean;
  feature_chat: boolean;
  feature_forums: boolean;
  enable_course_reviews: boolean;
  enable_user_profiles: boolean;
  api_rate_limit: number;
  api_rate_limit_window: number;
  created_at: string;
  updated_at: string;
}

export const systemSettingsApi = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await httpClient.get<SystemSettingsResponse>('/system-settings');
    return response.data.data;
  },

  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await httpClient.put<SystemSettingsResponse>('/system-settings', settings);
    return response.data.data;
  },

  updateGeneralSettings: async (data: {
    site_name: string;
    site_logo_url: string;
    site_favicon_url: string;
    timezone: string;
    language: string;
    currency: string;
    max_upload_size: number;
  }): Promise<SystemSettings> => {
    const response = await httpClient.patch<SystemSettingsResponse>('/system-settings/general', data);
    return response.data.data;
  },

  updateEmailSettings: async (data: {
    email_from: string;
    email_provider: 'smtp' | 'sendgrid' | 'aws_ses';
    email_host: string;
    email_port: number;
    email_username: string;
    email_use_tls: boolean;
    smtp_encryption: 'none' | 'ssl' | 'tls';
  }): Promise<SystemSettings> => {
    const response = await httpClient.patch<SystemSettingsResponse>('/system-settings/email', data);
    return response.data.data;
  },

  updateSecuritySettings: async (data: {
    password_min_length: number;
    session_timeout_minutes: number;
    require_email_verification: boolean;
    feature_two_factor: boolean;
    api_rate_limit: number;
    api_rate_limit_window: number;
  }): Promise<SystemSettings> => {
    const response = await httpClient.patch<SystemSettingsResponse>('/system-settings/security', data);
    return response.data.data;
  },

  updateFeatureFlags: async (data: {
    feature_two_factor: boolean;
    feature_social_login: boolean;
    feature_live_stream: boolean;
    feature_chat: boolean;
    feature_forums: boolean;
    enable_course_reviews: boolean;
    enable_user_profiles: boolean;
    allow_registration: boolean;
    maintenance_mode: boolean;
  }): Promise<SystemSettings> => {
    const response = await httpClient.patch<SystemSettingsResponse>('/system-settings/features', data);
    return response.data.data;
  },

  testEmailConnection: async (data: {
    email_host: string;
    email_port: number;
    email_username: string;
    email_password: string;
    smtp_encryption: 'none' | 'ssl' | 'tls';
  }): Promise<{ success: boolean; message: string }> => {
    const response = await httpClient.post('/system-settings/email/test', data);
    return response.data;
  },
};
