import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { FileUploadOptions, UploadedFileInfo } from '../../modules/files/files.types';
import logger from '../../utils/logger.util';
import type { IStorageService } from './storage.factory';

/**
 * Cloudflare R2 Storage Service
 * Sử dụng giao thức S3-compatible để upload/đọc/xoá file trên R2
 */
export class R2StorageService implements IStorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Cloudflare R2 is not fully configured. Please check R2_* environment variables.');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    this.bucket = bucketName;
    this.publicUrl = publicUrl || `${endpoint.replace(/\/$/, '')}/${bucketName}`;
  }

  async uploadFile(file: Express.Multer.File, options: FileUploadOptions): Promise<UploadedFileInfo> {
    const folder = options.folder || 'misc';
    const safeName = this.sanitizeFilename(file.originalname);
    const objectPath = `${folder}/${Date.now()}_${safeName}`;

    if (!(file as any).buffer) {
      throw new Error('R2 uploads require memory storage (file.buffer is missing).');
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectPath,
          Body: (file as any).buffer,
          ContentType: file.mimetype,
          Metadata: {
            uploadedBy: options.userId,
            uploadedAt: new Date().toISOString()
          }
        })
      );

      const url = `${this.publicUrl}/${objectPath}`;

      const result: UploadedFileInfo = {
        filename: objectPath.split('/').pop() || safeName,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: objectPath,
        url,
        uploadedBy: options.userId,
        uploadedAt: new Date()
      };

      logger.info('Uploaded file to Cloudflare R2', { objectPath, size: file.size });
      return result;
    } catch (error: unknown) {
      logger.error('R2 upload error:', error);
      throw error;
    }
  }

  async deleteFile(objectPath: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: objectPath
        })
      );
      logger.info('Deleted R2 object', { objectPath });
      return true;
    } catch (error: unknown) {
      logger.error('R2 delete error:', error);
      return false;
    }
  }

  async generateSignedUrl(path: string, _expiresIn: number = 3600): Promise<string> {
    // Bucket R2 đã public qua R2_PUBLIC_URL, nên dùng URL công khai là đủ.
    // Nếu sau này cần signed URL thực sự, có thể dùng @aws-sdk/s3-request-presigner.
    const objectPath = path.replace(/^\/+/, '');
    return `${this.publicUrl}/${objectPath}`;
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}


