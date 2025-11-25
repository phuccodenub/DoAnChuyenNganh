import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import logger from '../../utils/logger.util';

export interface GoogleDriveUploadResult {
  id: string;
  name: string;
  mimeType?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
}

interface UploadBufferOptions {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  parentFolderId?: string;
  makePublic?: boolean;
}

/**
 * Google Drive Service
 * Dùng service account để upload file lên Drive cho:
 * - Tài liệu khóa học (Course Resources)
 * - Raw livestream recordings
 * - Database backups
 */
export class GoogleDriveService {
  private drive: drive_v3.Drive;
  private resourcesFolderId?: string;
  private liveRawFolderId?: string;
  private backupFolderId?: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
      throw new Error(
        'Google Drive OAuth2 is not fully configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN.'
      );
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    this.resourcesFolderId = this.normalizeFolderId(process.env.GDRIVE_RESOURCES_FOLDER_ID);
    this.liveRawFolderId = this.normalizeFolderId(process.env.GDRIVE_LIVE_RAW_FOLDER_ID);
    // Ưu tiên GDRIVE_BACKUP_FOLDER_ID, fallback về GOOGLE_DRIVE_FOLDER_ID nếu được cấu hình
    this.backupFolderId = this.normalizeFolderId(
      process.env.GDRIVE_BACKUP_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID
    );
  }

  /**
   * Upload 1 file (buffer) lên Google Drive
   */
  async uploadBuffer(options: UploadBufferOptions): Promise<GoogleDriveUploadResult> {
    const parentId = options.parentFolderId;

    if (!parentId) {
      throw new Error('Google Drive parent folder ID is required for upload.');
    }

    logger.info('Uploading file to Google Drive', {
      fileName: options.fileName,
      parentId,
      mimeType: options.mimeType
    });

    const fileMetadata: drive_v3.Schema$File = {
      name: options.fileName,
      parents: [parentId]
    };

    const media = {
      mimeType: options.mimeType,
      body: Readable.from(options.buffer)
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, webViewLink, webContentLink'
    });

    const file = response.data;

    if (options.makePublic) {
      try {
        await this.drive.permissions.create({
          fileId: file.id!,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
      } catch (error: unknown) {
        logger.warn('Failed to set Google Drive file as public, continuing anyway', {
          fileId: file.id,
          error
        });
      }
    }

    logger.info('File uploaded to Google Drive', { id: file.id, name: file.name });

    return {
      id: file.id as string,
      name: file.name as string,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  }

  /**
   * Upload tài liệu khóa học (PDF, PPT, ZIP, ...) vào thư mục Resources
   */
  async uploadCourseResource(buffer: Buffer, fileName: string, mimeType: string): Promise<GoogleDriveUploadResult> {
    if (!this.resourcesFolderId) {
      throw new Error('GDRIVE_RESOURCES_FOLDER_ID is not configured.');
    }

    return this.uploadBuffer({
      buffer,
      fileName,
      mimeType,
      parentFolderId: this.resourcesFolderId,
      makePublic: true
    });
  }

  /**
   * Upload raw livestream recording (video gốc nặng)
   */
  async uploadLiveRaw(buffer: Buffer, fileName: string, mimeType: string): Promise<GoogleDriveUploadResult> {
    if (!this.liveRawFolderId) {
      throw new Error('GDRIVE_LIVE_RAW_FOLDER_ID is not configured.');
    }

    return this.uploadBuffer({
      buffer,
      fileName,
      mimeType,
      parentFolderId: this.liveRawFolderId,
      makePublic: false
    });
  }

  /**
   * Upload file backup DB (.sql hoặc .gz) lên thư mục backup
   */
  async uploadBackup(buffer: Buffer, fileName: string, mimeType: string = 'application/sql'): Promise<GoogleDriveUploadResult> {
    if (!this.backupFolderId) {
      throw new Error('GDRIVE_BACKUP_FOLDER_ID is not configured.');
    }

    return this.uploadBuffer({
      buffer,
      fileName,
      mimeType,
      parentFolderId: this.backupFolderId,
      makePublic: false
    });
  }

  /**
   * Xoá các file backup cũ hơn X ngày trong thư mục backup
   */
  async deleteOldBackups(days: number = 30): Promise<number> {
    if (!this.backupFolderId) {
      logger.warn('GDRIVE_BACKUP_FOLDER_ID is not configured; skip deleting old backups.');
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const res = await this.drive.files.list({
      q: `'${this.backupFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, createdTime)',
      pageSize: 1000
    });

    const files = res.data.files || [];
    let deleted = 0;

    for (const file of files) {
      if (!file.id || !file.createdTime) continue;
      const createdAt = new Date(file.createdTime);
      if (createdAt < cutoffDate) {
        try {
          await this.drive.files.delete({ fileId: file.id });
          deleted += 1;
          logger.info('Deleted old backup from Google Drive', { id: file.id, name: file.name });
        } catch (error: unknown) {
          logger.warn('Failed to delete old backup from Google Drive', { id: file.id, error });
        }
      }
    }

    return deleted;
  }

  /**
   * Chấp nhận cả ID thuần hoặc full URL Google Drive và trả về ID folder
   */
  private normalizeFolderId(value?: string): string | undefined {
    if (!value) return undefined;

    // Nếu là URL Drive, lấy phần cuối cùng không rỗng
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const parts = value.split(/[/?#]/).filter(Boolean);
      const last = parts[parts.length - 1];
      return last;
    }

    return value;
  }
}


