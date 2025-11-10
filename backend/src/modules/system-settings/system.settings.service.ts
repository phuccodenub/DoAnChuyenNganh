import fs from 'fs';
import path from 'path';

export type SystemSettings = {
  allowRegistration: boolean;
  twoFactorForAdmin: boolean;
  autoEmailNotifications: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
};

const defaultSettings: SystemSettings = {
  allowRegistration: true,
  twoFactorForAdmin: true,
  autoEmailNotifications: true,
  maintenanceMode: false,
  debugMode: false,
};

export class SystemSettingsService {
  private settingsPath: string;

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

  async getSettings(): Promise<SystemSettings> {
    try {
      const raw = await fs.promises.readFile(this.settingsPath, 'utf-8');
      const json = JSON.parse(raw);
      return { ...defaultSettings, ...json } as SystemSettings;
    } catch {
      return defaultSettings;
    }
  }

  async updateSettings(partial: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSettings();
    const next = { ...current, ...partial } as SystemSettings;
    await fs.promises.writeFile(this.settingsPath, JSON.stringify(next, null, 2));
    return next;
  }
}
