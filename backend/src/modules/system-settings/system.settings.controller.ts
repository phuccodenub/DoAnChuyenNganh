import { Request, Response, NextFunction } from 'express';
import { SystemSettingsService, SystemSettings } from './system.settings.service';
import { responseUtils } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';

export class SystemSettingsController {
  private service: SystemSettingsService;

  constructor() {
    this.service = new SystemSettingsService();
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.service.getSettings();
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, settings);
    } catch (e) {
      next(e);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as Partial<SystemSettings>;
      // Allow both legacy and new field names
      const allowed: (keyof SystemSettings)[] = [
        // Legacy
        'allowRegistration',
        'twoFactorForAdmin',
        'autoEmailNotifications',
        'maintenanceMode',
        'debugMode',
        // New database fields
        'site_name',
        'site_logo_url',
        'site_favicon_url',
        'timezone',
        'language',
        'currency',
        'max_upload_size',
        'maintenance_mode',
        'allow_registration',
        'require_email_verification',
        'password_min_length',
        'session_timeout_minutes',
        'email_from',
        'email_provider',
        'email_host',
        'email_port',
        'email_username',
        'email_use_tls',
        'smtp_encryption',
        'feature_two_factor',
        'feature_social_login',
        'feature_live_stream',
        'feature_chat',
        'feature_forums',
        'enable_course_reviews',
        'enable_user_profiles',
        'api_rate_limit',
        'api_rate_limit_window',
      ];
      const filtered: Partial<SystemSettings> = {};
      for (const k of allowed) {
        if (k in body) {
          (filtered as any)[k] = (body as any)[k];
        }
      }
      const updated = await this.service.updateSettings(filtered);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, updated);
    } catch (e) {
      next(e);
    }
  }

  async testEmailConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { email_host, email_port, email_username, email_password, smtp_encryption } = req.body;
      if (!email_host || !email_port || !email_username || !email_password) {
        return responseUtils.sendBadRequest(res, 'Missing required email parameters');
      }
      const result = await this.service.testEmailConnection({
        email_host,
        email_port: Number(email_port),
        email_username,
        email_password,
        smtp_encryption: smtp_encryption || 'tls',
      });
      responseUtils.sendSuccess(res, result.message, result);
    } catch (e: any) {
      responseUtils.sendBadRequest(res, `Email connection failed: ${e.message || 'Unknown error'}`);
    }
  }
}
