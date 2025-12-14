import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { SystemSetting } from '../../models';

export type SystemSettings = {
  id?: string;
  // General
  site_name?: string;
  site_logo_url?: string;
  site_favicon_url?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  max_upload_size?: number;
  // Flags
  maintenance_mode?: boolean;
  allow_registration?: boolean;
  require_email_verification?: boolean;
  // Security
  password_min_length?: number;
  session_timeout_minutes?: number;
  // Email
  email_from?: string;
  email_provider?: 'smtp' | 'sendgrid' | 'aws_ses' | string;
  email_host?: string;
  email_port?: number;
  email_username?: string;
  email_use_tls?: boolean;
  smtp_encryption?: 'none' | 'ssl' | 'tls' | string;
  // Features
  feature_two_factor?: boolean;
  feature_social_login?: boolean;
  feature_live_stream?: boolean;
  feature_chat?: boolean;
  feature_forums?: boolean;
  enable_course_reviews?: boolean;
  enable_user_profiles?: boolean;
  // API
  api_rate_limit?: number;
  api_rate_limit_window?: number;
  // Legacy (for backward compatibility)
  allowRegistration?: boolean;
  twoFactorForAdmin?: boolean;
  autoEmailNotifications?: boolean;
  maintenanceMode?: boolean;
  debugMode?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

const SYSTEM_SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

const defaultSettings: SystemSettings = {
  allowRegistration: true,
  twoFactorForAdmin: true,
  autoEmailNotifications: true,
  maintenanceMode: false,
  debugMode: false,
};

export class SystemSettingsService {
  private settingsPath: string;
  private useDatabase: boolean = true;

  constructor() {
    const root = process.cwd();
    // store under logs to avoid permission issues
    this.settingsPath = path.join(root, 'logs', 'system-settings.json');
    this.ensureFile();
  }

  private ensureFile() {
    const dir = path.dirname(this.settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.settingsPath)) {
      fs.writeFileSync(this.settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
  }

  private async getOrCreateFromDB(): Promise<any | null> {
    try {
      const existing = await (SystemSetting as any).findByPk(SYSTEM_SETTINGS_SINGLETON_ID);
      if (existing) return existing;
      return await (SystemSetting as any).create({ id: SYSTEM_SETTINGS_SINGLETON_ID });
    } catch {
      // Table doesn't exist yet, fall back to file
      this.useDatabase = false;
      return null;
    }
  }

  async getSettings(): Promise<SystemSettings> {
    // Try database first
    if (this.useDatabase) {
      const row = await this.getOrCreateFromDB();
      if (row) {
        const dbSettings = row.toJSON() as SystemSettings;
        // Map new fields to legacy for backward compatibility
        return {
          ...dbSettings,
          allowRegistration: dbSettings.allow_registration ?? true,
          twoFactorForAdmin: dbSettings.feature_two_factor ?? true,
          maintenanceMode: dbSettings.maintenance_mode ?? false,
        };
      }
    }

    // Fallback to file
    try {
      const raw = await fs.promises.readFile(this.settingsPath, 'utf-8');
      const json = JSON.parse(raw);
      return { ...defaultSettings, ...json } as SystemSettings;
    } catch {
      return defaultSettings;
    }
  }

  async updateSettings(partial: Partial<SystemSettings>): Promise<SystemSettings> {
    // Try database first
    if (this.useDatabase) {
      const row = await this.getOrCreateFromDB();
      if (row) {
        await row.update(partial);
        const updated = row.toJSON() as SystemSettings;
        return {
          ...updated,
          allowRegistration: updated.allow_registration ?? true,
          twoFactorForAdmin: updated.feature_two_factor ?? true,
          maintenanceMode: updated.maintenance_mode ?? false,
        };
      }
    }

    // Fallback to file
    const current = await this.getSettings();
    const next = { ...current, ...partial } as SystemSettings;
    await fs.promises.writeFile(this.settingsPath, JSON.stringify(next, null, 2));
    return next;
  }

  async testEmailConnection(params: {
    email_host: string;
    email_port: number;
    email_username: string;
    email_password: string;
    smtp_encryption: 'none' | 'ssl' | 'tls';
  }): Promise<{ success: boolean; message: string }> {
    const secure = params.smtp_encryption === 'ssl';
    const requireTls = params.smtp_encryption === 'tls';

    const transport = nodemailer.createTransport({
      host: params.email_host,
      port: params.email_port,
      secure,
      auth: {
        user: params.email_username,
        pass: params.email_password,
      },
      tls: requireTls ? { rejectUnauthorized: false } : undefined,
    });

    await transport.verify();
    return { success: true, message: 'Kết nối email thành công' };
  }

  /**
   * Send a test email to a specific recipient using .env configuration
   */
  async sendTestEmail(params: {
    to_email: string;
    subject?: string;
    message?: string;
  }): Promise<{ success: boolean; message: string }> {
    const host = process.env.MAIL_HOST || process.env.EMAIL_HOST;
    const port = Number(process.env.MAIL_PORT || process.env.EMAIL_PORT || 587);
    const user = process.env.MAIL_USER || process.env.EMAIL_USER;
    const pass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
    const from = process.env.MAIL_FROM || process.env.EMAIL_FROM || user;
    const secure = process.env.MAIL_SECURE === 'true';

    if (!host || !user || !pass) {
      throw new Error('Cấu hình email chưa được thiết lập trong .env (MAIL_HOST, MAIL_USER, MAIL_PASS)');
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    const subject = params.subject || '[LMS] Email kiểm tra từ hệ thống';
    const message = params.message || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🎉 Email kiểm tra thành công!</h2>
        <p>Xin chào,</p>
        <p>Đây là email kiểm tra được gửi từ hệ thống LMS.</p>
        <p>Nếu bạn nhận được email này, điều đó có nghĩa là cấu hình email của hệ thống đã hoạt động đúng.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Email được gửi lúc: ${new Date().toLocaleString('vi-VN')}
        </p>
      </div>
    `;

    await transport.sendMail({
      from,
      to: params.to_email,
      subject,
      html: message,
    });

    return { success: true, message: `Email đã được gửi thành công đến ${params.to_email}` };
  }
}
