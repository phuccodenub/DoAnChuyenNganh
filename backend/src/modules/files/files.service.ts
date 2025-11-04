/**
 * Files Service
 * Enhanced file operations with actual implementation
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import {
  FileUploadOptions,
  UploadedFileInfo,
  FileDownloadOptions,
  FileInfo,
  FileMetadata,
  StorageType,
  FileErrorCodes
} from './files.types';
import logger from '../../utils/logger.util';
import { GCSStorageService } from '../../services/storage/gcs.service';

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);
const accessAsync = promisify(fs.access);

export class FilesService {
  private uploadDir: string;
  private storageType: StorageType;
  private publicUrl: string;
  private gcs?: GCSStorageService;

  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || './uploads';
    this.storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;
    this.publicUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Initialize cloud storage clients if needed
    if (this.storageType === StorageType.GOOGLE_CLOUD) {
      this.gcs = new GCSStorageService();
    } else {
      // Ensure upload directory exists for local storage
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  /**
   * Process uploaded file and return file info
   */
  async processUpload(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<UploadedFileInfo> {
    try {
      // Cloud storage path
      if (this.storageType === StorageType.GOOGLE_CLOUD) {
        if (!this.gcs) throw new Error('GCS service not initialized');
        // Expect memory storage providing file.buffer
        if (!(file as any).buffer) {
          throw new Error('Memory storage required for cloud uploads (file.buffer missing)');
        }
        const result = await this.gcs.uploadFile(file, options);
        return result;
      }

      const fileInfo: UploadedFileInfo = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: this.generateFileUrl(options.folder, file.filename),
        uploadedBy: options.userId,
        uploadedAt: new Date()
      };

      logger.info('File uploaded successfully', {
        filename: file.filename,
        size: file.size,
        folder: options.folder
      });

      return fileInfo;
    } catch (error: unknown) {
      logger.error('Error processing upload:', error);
      throw new Error('File upload processing failed');
    }
  }

  /**
   * Process multiple uploaded files
   */
  async processMultipleUploads(
    files: Express.Multer.File[],
    options: FileUploadOptions
  ): Promise<UploadedFileInfo[]> {
    try {
      const uploadedFiles: UploadedFileInfo[] = [];

      for (const file of files) {
        const fileInfo = await this.processUpload(file, options);
        uploadedFiles.push(fileInfo);
      }

      return uploadedFiles;
    } catch (error: unknown) {
      logger.error('Error processing multiple uploads:', error);
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(folder: string, filename: string): Promise<FileInfo> {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);

      // Check if file exists
      const exists = await this.fileExists(filePath);

      if (!exists) {
        return {
          filename,
          originalName: filename,
          mimetype: 'unknown',
          size: 0,
          path: filePath,
          url: this.generateFileUrl(folder, filename),
          exists: false
        };
      }

      // Get file stats
      const stats = await statAsync(filePath);

      return {
        filename,
        originalName: filename,
        mimetype: this.getMimeType(filename),
        size: stats.size,
        path: filePath,
        url: this.generateFileUrl(folder, filename),
        exists: true,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error: unknown) {
      logger.error('Error getting file info:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(folder: string, filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);

      // Check if file exists
      const exists = await this.fileExists(filePath);

      if (!exists) {
        logger.warn('File not found for deletion:', filePath);
        return false;
      }

      // Delete file
      await unlinkAsync(filePath);

      logger.info('File deleted successfully:', filePath);
      return true;
    } catch (error: unknown) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL for temporary access (for future cloud storage)
   */
  async generateSignedUrl(
    folder: string,
    filename: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      // Local storage -> regular URL
      if (this.storageType === StorageType.LOCAL) {
        return this.generateFileUrl(folder, filename);
      }

      if (this.storageType === StorageType.GOOGLE_CLOUD) {
        if (!this.gcs) throw new Error('GCS service not initialized');
        const objectPath = `${folder}/${filename}`;
        return await this.gcs.generateSignedUrl(objectPath, expiresIn);
      }

      // Fallback for other cloud types (not implemented)
      return `${this.generateFileUrl(folder, filename)}?expires=${Date.now() + expiresIn * 1000}`;
    } catch (error: unknown) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Move file to different folder
   */
  async moveFile(
    currentFolder: string,
    currentFilename: string,
    targetFolder: string,
    targetFilename?: string
  ): Promise<UploadedFileInfo> {
    try {
      const sourcePath = path.join(this.uploadDir, currentFolder, currentFilename);
      const targetPath = path.join(
        this.uploadDir,
        targetFolder,
        targetFilename || currentFilename
      );

      // Ensure target folder exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Move file
      fs.renameSync(sourcePath, targetPath);

      // Get file stats
      const stats = await statAsync(targetPath);

      return {
        filename: targetFilename || currentFilename,
        originalName: currentFilename,
        mimetype: this.getMimeType(targetFilename || currentFilename),
        size: stats.size,
        path: targetPath,
        url: this.generateFileUrl(targetFolder, targetFilename || currentFilename),
        uploadedBy: 'system',
        uploadedAt: new Date()
      };
    } catch (error: unknown) {
      logger.error('Error moving file:', error);
      throw error;
    }
  }

  /**
   * Copy file
   */
  async copyFile(
    sourceFolder: string,
    sourceFilename: string,
    targetFolder: string,
    targetFilename?: string
  ): Promise<UploadedFileInfo> {
    try {
      const sourcePath = path.join(this.uploadDir, sourceFolder, sourceFilename);
      const targetPath = path.join(
        this.uploadDir,
        targetFolder,
        targetFilename || sourceFilename
      );

      // Ensure target folder exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(sourcePath, targetPath);

      // Get file stats
      const stats = await statAsync(targetPath);

      return {
        filename: targetFilename || sourceFilename,
        originalName: sourceFilename,
        mimetype: this.getMimeType(targetFilename || sourceFilename),
        size: stats.size,
        path: targetPath,
        url: this.generateFileUrl(targetFolder, targetFilename || sourceFilename),
        uploadedBy: 'system',
        uploadedAt: new Date()
      };
    } catch (error: unknown) {
      logger.error('Error copying file:', error);
      throw error;
    }
  }

  /**
   * Get folder size
   */
  async getFolderSize(folder: string): Promise<number> {
    try {
      const folderPath = path.join(this.uploadDir, folder);

      if (!fs.existsSync(folderPath)) {
        return 0;
      }

      let totalSize = 0;
      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await statAsync(filePath);

        if (stats.isFile()) {
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error: unknown) {
      logger.error('Error getting folder size:', error);
      return 0;
    }
  }

  /**
   * List files in folder
   */
  async listFiles(folder: string): Promise<FileInfo[]> {
    try {
      const folderPath = path.join(this.uploadDir, folder);

      if (!fs.existsSync(folderPath)) {
        return [];
      }

      const files = fs.readdirSync(folderPath);
      const fileInfos: FileInfo[] = [];

      for (const file of files) {
        const info = await this.getFileInfo(folder, file);
        fileInfos.push(info);
      }

      return fileInfos;
    } catch (error: unknown) {
      logger.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(folder: string, daysOld: number = 30): Promise<number> {
    try {
      const folderPath = path.join(this.uploadDir, folder);

      if (!fs.existsSync(folderPath)) {
        return 0;
      }

      const files = fs.readdirSync(folderPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await statAsync(filePath);

        if (stats.mtime < cutoffDate) {
          await unlinkAsync(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old files from ${folder}`);
      return deletedCount;
    } catch (error: unknown) {
      logger.error('Error cleaning up old files:', error);
      return 0;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await accessAsync(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate file URL
   */
  private generateFileUrl(folder: string, filename: string): string {
    return `${this.publicUrl}/uploads/${folder}/${filename}`;
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
