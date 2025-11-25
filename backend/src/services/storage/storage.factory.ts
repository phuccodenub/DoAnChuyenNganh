import { StorageType } from '../../modules/files/files.types';
import { GCSStorageService } from './gcs.service';
import { R2StorageService } from './r2.service';

export interface IStorageService {
  uploadFile(file: Express.Multer.File, options: any): Promise<any>;
  deleteFile(path: string): Promise<boolean>;
  generateSignedUrl(path: string, expiresIn?: number): Promise<string>;
}

export class StorageFactory {
  static createStorageService(type: StorageType): IStorageService | undefined {
    switch (type) {
      case StorageType.GOOGLE_CLOUD:
        return new GCSStorageService();
      case StorageType.R2:
        return new R2StorageService();
      default:
        return undefined; // Local handled trực tiếp bởi FilesService
    }
  }
}
