/**
 * Files Module Types
 * Types for file upload/download operations
 */

// ===== FILE UPLOAD TYPES =====

export interface FileUploadOptions {
  folder: string;
  userId: string;
  allowedTypes?: string[];
  maxSize?: number;
  generateThumbnail?: boolean;
}

export interface UploadedFileInfo {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface MultipleFilesUploadResult {
  files: UploadedFileInfo[];
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

// ===== FILE DOWNLOAD TYPES =====

export interface FileDownloadOptions {
  userId: string;
  trackDownload?: boolean;
}

export interface FileInfo {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  exists: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
}

// ===== FILE METADATA TYPES =====

export interface FileMetadata {
  id?: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  folder: string;
  uploadedBy: string;
  relatedTo?: {
    type: 'lesson' | 'assignment' | 'course' | 'user' | 'message';
    id: string;
  };
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== STORAGE TYPES =====

export enum StorageType {
  LOCAL = 'local',
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
  R2 = 'r2'
}

export interface StorageConfig {
  type: StorageType;
  basePath?: string; // For local storage
  bucket?: string; // For cloud storage
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
}

// ===== VALIDATION TYPES =====

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileTypeValidation {
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxSize: number;
  minSize?: number;
}

// ===== PREDEFINED FILE CATEGORIES =====

export const FILE_CATEGORIES = {
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  VIDEO: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    mimeTypes: [
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm'
    ],
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  AUDIO: {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4'
    ],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  ARCHIVE: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip'
    ],
    maxSize: 100 * 1024 * 1024 // 100MB
  }
} as const;

// ===== ERROR TYPES =====

export enum FileErrorCodes {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  INVALID_FILENAME = 'INVALID_FILENAME'
}

export interface FileError {
  code: FileErrorCodes;
  message: string;
  details?: unknown;
}

// ===== STATISTICS TYPES =====

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  filesByFolder: Record<string, number>;
  topDownloaded: Array<{
    filename: string;
    downloadCount: number;
  }>;
}
