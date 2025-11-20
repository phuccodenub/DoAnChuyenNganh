import { z } from 'zod';

export const SystemSettingsSchema = z.object({
  site_name: z.string().min(1, 'Tên trang web là bắt buộc').max(100),
  site_logo_url: z.string().url('URL logo không hợp lệ').or(z.literal('')),
  site_favicon_url: z.string().url('URL favicon không hợp lệ').or(z.literal('')),
  timezone: z.string().min(1, 'Múi giờ là bắt buộc'),
  language: z.enum(['vi', 'en']),
  currency: z.string().min(1, 'Tiền tệ là bắt buộc'),
  max_upload_size: z.number().positive('Kích thước upload phải là số dương'),
  maintenance_mode: z.boolean(),
  allow_registration: z.boolean(),
  require_email_verification: z.boolean(),
  password_min_length: z.number().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(128),
  session_timeout_minutes: z.number().positive('Timeout phải là số dương'),
});

export const EmailSettingsSchema = z.object({
  email_from: z.string().email('Email từ không hợp lệ'),
  email_provider: z.enum(['smtp', 'sendgrid', 'aws_ses']),
  email_host: z.string().min(1, 'Host email là bắt buộc'),
  email_port: z.number().positive('Cổng phải là số dương').max(65535),
  email_username: z.string().min(1, 'Tên đăng nhập email là bắt buộc'),
  email_use_tls: z.boolean(),
  smtp_encryption: z.enum(['none', 'ssl', 'tls']),
}).refine((data) => {
  if (data.email_provider === 'smtp' && !data.email_host) {
    return false;
  }
  return true;
}, {
  message: 'Host email là bắt buộc khi sử dụng SMTP',
  path: ['email_host'],
});

export const SecuritySettingsSchema = z.object({
  password_min_length: z.number().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(128),
  session_timeout_minutes: z.number().positive('Timeout phải là số dương').max(1440),
  require_email_verification: z.boolean(),
  feature_two_factor: z.boolean(),
  api_rate_limit: z.number().positive('Rate limit phải là số dương'),
  api_rate_limit_window: z.number().positive('Cửa sổ rate limit phải là số dương'),
});

export const FeatureFlagsSchema = z.object({
  feature_two_factor: z.boolean(),
  feature_social_login: z.boolean(),
  feature_live_stream: z.boolean(),
  feature_chat: z.boolean(),
  feature_forums: z.boolean(),
  enable_course_reviews: z.boolean(),
  enable_user_profiles: z.boolean(),
  allow_registration: z.boolean(),
  maintenance_mode: z.boolean(),
});

export type SystemSettingsFormData = z.infer<typeof SystemSettingsSchema>;
export type EmailSettingsFormData = z.infer<typeof EmailSettingsSchema>;
export type SecuritySettingsFormData = z.infer<typeof SecuritySettingsSchema>;
export type FeatureFlagsFormData = z.infer<typeof FeatureFlagsSchema>;
