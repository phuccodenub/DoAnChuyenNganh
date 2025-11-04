import { Storage } from '@google-cloud/storage';
import { FileUploadOptions, UploadedFileInfo } from '../../modules/files/files.types';
import logger from '../../utils/logger.util';

export class GCSStorageService {
  private storage: Storage;
  private bucket: any;
  private publicUrl: string;

  constructor() {
    const projectId = process.env.GCP_PROJECT_ID;
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const bucketName = process.env.GCS_BUCKET;
    this.publicUrl = process.env.GCS_PUBLIC_URL || `https://storage.googleapis.com/${bucketName}`;

    if (!bucketName) {
      throw new Error('GCS_BUCKET is not configured');
    }

    this.storage = new Storage({ projectId, keyFilename });
    this.bucket = this.storage.bucket(bucketName);
  }

  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<UploadedFileInfo> {
    const folder = options.folder || 'misc';
    const safeName = this.sanitizeFilename(file.originalname);
    const objectPath = `${folder}/${Date.now()}_${safeName}`;

    const gcsFile: any = this.bucket.file(objectPath);

    await new Promise<void>((resolve, reject) => {
      const stream = gcsFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: options.userId,
            uploadedAt: new Date().toISOString(),
          }
        },
        resumable: false
      });

      stream.on('error', (err: unknown) => {
        logger.error('GCS upload error:', err);
        reject(err);
      });

      stream.on('finish', async () => {
        try {
          // Make the file public if public URL serving is desired
          await gcsFile.makePublic();
          resolve();
        } catch (e) {
          // If making public fails, still resolve to allow signed URL usage
          logger.warn('GCS makePublic failed; consider using signed URLs only');
          resolve();
        }
      });

      stream.end(file.buffer);
    });

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

    logger.info('Uploaded file to GCS', { objectPath, size: file.size });
    return result;
  }

  async generateSignedUrl(objectPath: string, expiresIn: number = 3600): Promise<string> {
    const [url] = await this.bucket.file(objectPath).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }

  async deleteFile(objectPath: string): Promise<boolean> {
    try {
      await this.bucket.file(objectPath).delete();
      logger.info('Deleted GCS object', { objectPath });
      return true;
    } catch (error) {
      logger.error('GCS delete error:', error);
      return false;
    }
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
