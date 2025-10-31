import { StorageType } from '../../modules/files/files.types';
import { GCSStorageService } from './gcs.service';

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
      default:
        return undefined; // Local handled directly by FilesService for now
    }
  }
}
