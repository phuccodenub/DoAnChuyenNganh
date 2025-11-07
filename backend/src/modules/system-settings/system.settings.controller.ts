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
      const allowed: (keyof SystemSettings)[] = [
        'allowRegistration',
        'twoFactorForAdmin',
        'autoEmailNotifications',
        'maintenanceMode',
        'debugMode',
      ];
      const filtered: Partial<SystemSettings> = {};
      for (const k of allowed) {
        if (k in body && typeof (body as any)[k] === 'boolean') {
          (filtered as any)[k] = (body as any)[k];
        }
      }
      const updated = await this.service.updateSettings(filtered);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, updated);
    } catch (e) {
      next(e);
    }
  }
}
