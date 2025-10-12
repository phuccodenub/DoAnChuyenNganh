import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// File utility functions
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  path: string;
  lastModified: Date;
  created: Date;
}

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  destination?: string;
  generateUniqueName?: boolean;
}

export const fileUtils = {
  // Generate unique filename
  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    
    return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
  },

  // Get file extension
  getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  },

  // Get MIME type from extension
  getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  },

  // Validate file type
  validateFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = this.getFileExtension(filename);
    return allowedTypes.includes(extension);
  },

  // Validate file size
  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  },

  // Get file info
  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.stat(filePath);
      const parsedPath = path.parse(filePath);
      
      return {
        name: parsedPath.base,
        size: stats.size,
        type: this.getMimeTypeFromExtension(parsedPath.ext),
        extension: parsedPath.ext,
        path: filePath,
        lastModified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error}`);
    }
  },

  // Check if file exists
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  // Create directory if it doesn't exist
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error}`);
    }
  },

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  },

  // Copy file
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await fs.copyFile(sourcePath, destinationPath);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  },

  // Move file
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      throw new Error(`Failed to move file: ${error}`);
    }
  },

  // Read file content
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      return await fs.readFile(filePath, encoding);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  },

  // Write file content
  async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    try {
      await fs.writeFile(filePath, content, encoding);
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  },

  // Get file hash
  async getFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    try {
      const hash = crypto.createHash(algorithm);
      const stream = createReadStream(filePath);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to get file hash: ${error}`);
    }
  },

  // Stream file
  async streamFile(filePath: string, destinationPath: string): Promise<void> {
    try {
      const sourceStream = createReadStream(filePath);
      const destinationStream = createWriteStream(destinationPath);
      
      await pipeline(sourceStream, destinationStream);
    } catch (error) {
      throw new Error(`Failed to stream file: ${error}`);
    }
  },

  // Get directory size
  async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      throw new Error(`Failed to get directory size: ${error}`);
    }
  },

  // Clean old files
  async cleanOldFiles(dirPath: string, maxAge: number): Promise<number> {
    try {
      const files = await fs.readdir(dirPath);
      let deletedCount = 0;
      const cutoffTime = Date.now() - maxAge;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to clean old files: ${error}`);
    }
  },

  // Format file size
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  // Validate upload options
  validateUploadOptions(options: UploadOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (options.maxSize && options.maxSize <= 0) {
      errors.push('Max size must be greater than 0');
    }

    if (options.allowedTypes && !Array.isArray(options.allowedTypes)) {
      errors.push('Allowed types must be an array');
    }

    if (options.allowedExtensions && !Array.isArray(options.allowedExtensions)) {
      errors.push('Allowed extensions must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate safe filename
  generateSafeFilename(filename: string): string {
    // Remove or replace unsafe characters
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }
};
