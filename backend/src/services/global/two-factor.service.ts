import crypto from 'crypto';
import QRCode from 'qrcode';
import { CacheService } from './cache.service';
import { stringUtils } from '../../utils/string';
import { dateUtils } from '../../utils/date.util';
import logger from '../../utils/logger.util';

export class TwoFactorService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  // Generate TOTP secret
  generateSecret(): string {
    return stringUtils.generateRandomString(20, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
  }

  // Generate QR code cho authenticator app
  async generateQRCode(userEmail: string, secret: string): Promise<string> {
    try {
      const appName = 'LMS System';
      const issuer = 'LMS Backend';
      
      const otpAuthUrl = `otpauth://totp/${appName}:${userEmail}?secret=${secret}&issuer=${issuer}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } catch (error: unknown) {
      logger.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate TOTP code
  generateTOTPCode(secret: string): string {
    try {
      // Decode base32 secret manually (RFC4648, no padding)
      const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const clean = secret.replace(/=+$/g, '').toUpperCase();
      let bits = '';
      for (const ch of clean) {
        const val = base32Alphabet.indexOf(ch);
        if (val < 0) continue;
        bits += val.toString(2).padStart(5, '0');
      }
      const bytes: number[] = [];
      for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
      }
      const key = Buffer.from(bytes);
      const epoch = Math.round(dateUtils.timestamp() / 1000.0);
      const time = Math.floor(epoch / 30);
      
      const hash = crypto.createHmac('sha1', key)
        .update(Buffer.from(time.toString(16).padStart(16, '0'), 'hex'))
        .digest();
      
      const offset = hash[hash.length - 1] & 0xf;
      const code = ((hash[offset] & 0x7f) << 24) |
                  ((hash[offset + 1] & 0xff) << 16) |
                  ((hash[offset + 2] & 0xff) << 8) |
                  (hash[offset + 3] & 0xff);
      
      return (code % 1000000).toString().padStart(6, '0');
    } catch (error: unknown) {
      logger.error('Error generating TOTP code:', error);
      throw new Error('Failed to generate TOTP code');
    }
  }

  // Verify TOTP code
  verifyTOTPCode(secret: string, code: string, window: number = 1): boolean {
    try {
      const currentCode = this.generateTOTPCode(secret);
      
      // Check current time window
      if (code === currentCode) {
        return true;
      }
      
      // Check previous and next time windows for clock drift
      for (let i = -window; i <= window; i++) {
        if (i === 0) continue;
        
        const timeOffset = i * 30;
        const offsetEpoch = Math.round((new Date().getTime() + timeOffset * 1000) / 1000.0);
        const offsetTime = Math.floor(offsetEpoch / 30);
        
        const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const clean = secret.replace(/=+$/g, '').toUpperCase();
        let bits = '';
        for (const ch of clean) {
          const val = base32Alphabet.indexOf(ch);
          if (val < 0) continue;
          bits += val.toString(2).padStart(5, '0');
        }
        const bytes: number[] = [];
        for (let j = 0; j + 8 <= bits.length; j += 8) {
          bytes.push(parseInt(bits.substring(j, j + 8), 2));
        }
        const key = Buffer.from(bytes);
        const hash = crypto.createHmac('sha1', key)
          .update(Buffer.from(offsetTime.toString(16).padStart(16, '0'), 'hex'))
          .digest();
        
        const offset = hash[hash.length - 1] & 0xf;
        const offsetCode = ((hash[offset] & 0x7f) << 24) |
                          ((hash[offset + 1] & 0xff) << 16) |
                          ((hash[offset + 2] & 0xff) << 8) |
                          (hash[offset + 3] & 0xff);
        
        const offsetCodeStr = (offsetCode % 1000000).toString().padStart(6, '0');
        
        if (code === offsetCodeStr) {
          return true;
        }
      }
      
      return false;
    } catch (error: unknown) {
      logger.error('Error verifying TOTP code:', error);
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  // Verify backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const backupCodesKey = `backup_codes:${userId}`;
      const backupCodes = await this.cacheService.get<string[]>(backupCodesKey);
      
      if (!backupCodes) {
        return false;
      }
      
      const index = backupCodes.indexOf(code.toUpperCase());
      if (index === -1) {
        return false;
      }
      
      // Remove used backup code
      backupCodes.splice(index, 1);
      await this.cacheService.set(backupCodesKey, backupCodes, 86400 * 30); // 30 days
      
      return true;
    } catch (error: unknown) {
      logger.error('Error verifying backup code:', error);
      return false;
    }
  }

  // Enable 2FA for user
  async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    try {
      const secretKey = `2fa_secret:${userId}`;
      const backupCodesKey = `backup_codes:${userId}`;
      
      await this.cacheService.set(secretKey, secret, 86400 * 365); // 1 year
      await this.cacheService.set(backupCodesKey, backupCodes, 86400 * 30); // 30 days
      
      logger.info(`2FA enabled for user ${userId}`);
    } catch (error: unknown) {
      logger.error('Error enabling 2FA:', error);
      throw new Error('Failed to enable 2FA');
    }
  }

  // Disable 2FA for user
  async disable2FA(userId: string): Promise<void> {
    try {
      const secretKey = `2fa_secret:${userId}`;
      const backupCodesKey = `backup_codes:${userId}`;
      
      await this.cacheService.delete(secretKey);
      await this.cacheService.delete(backupCodesKey);
      
      logger.info(`2FA disabled for user ${userId}`);
    } catch (error: unknown) {
      logger.error('Error disabling 2FA:', error);
      throw new Error('Failed to disable 2FA');
    }
  }

  // Check if 2FA is enabled
  async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const secretKey = `2fa_secret:${userId}`;
      const secret = await this.cacheService.get<string>(secretKey);
      return !!secret;
    } catch (error: unknown) {
      logger.error('Error checking 2FA status:', error);
      return false;
    }
  }

  // Get 2FA secret
  async get2FASecret(userId: string): Promise<string | null> {
    try {
      const secretKey = `2fa_secret:${userId}`;
      return await this.cacheService.get<string>(secretKey);
    } catch (error: unknown) {
      logger.error('Error getting 2FA secret:', error);
      return null;
    }
  }
}

