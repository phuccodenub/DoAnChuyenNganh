/**
 * File Upload Middleware
 * Multer configuration for handling file uploads
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { FILE_CATEGORIES, FileErrorCodes } from './files.types';
import logger from '../../utils/logger.util';

// Determine storage mode
const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase();
const isCloudStorage =
  storageType === 'google_cloud' ||
  storageType === 'aws_s3' ||
  storageType === 'azure_blob' ||
  storageType === 'r2';

// Ensure upload directory exists for local storage only
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!isCloudStorage) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/**
 * Configure storage
 */
const localDiskStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Get folder from request or use default
    const folder = (req.body.folder as string) || 'misc';
    const fullPath = path.join(uploadDir, folder);

    // Create folder if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const userId = req.user?.userId || 'anonymous';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = nameWithoutExt
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 50);
    
    const filename = `${userId}_${timestamp}_${randomString}_${sanitizedName}${ext}`;
    
    cb(null, filename);
  }
});

// Dynamic storage selection: memory for cloud storage, disk for local
const storage = isCloudStorage ? multer.memoryStorage() : localDiskStorage;

/**
 * File filter function
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  try {
    // Get allowed types from request or use all
    const category = (req.body.category as string) || 'all';
    
    if (category === 'all') {
      cb(null, true);
      return;
    }

    // Check against specific category
    const categoryConfig = FILE_CATEGORIES[category.toUpperCase() as keyof typeof FILE_CATEGORIES];
    
    if (!categoryConfig) {
      cb(new Error(`Invalid file category: ${category}`));
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const isValidExt = (categoryConfig.extensions as readonly string[]).includes(ext);
    const isValidMime = (categoryConfig.mimeTypes as readonly string[]).includes(file.mimetype);

    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${categoryConfig.extensions.join(', ')}`));
    }
  } catch (error: unknown) {
    logger.error('File filter error:', error);
    cb(new Error('File validation failed'));
  }
};

/**
 * Multer upload configurations
 */

// Single file upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
  }
}).single('file');

// Multiple files upload (max 10 files)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: 10
  }
}).array('files', 10);

// Upload with specific field name
export const uploadFields = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: 20
  }
}).fields([
  { name: 'document', maxCount: 5 },
  { name: 'image', maxCount: 5 },
  { name: 'video', maxCount: 2 },
  { name: 'thumbnail', maxCount: 1 }
]);

/**
 * Custom upload middleware with enhanced error handling
 */
export const uploadMiddleware = (fieldName: string = 'file', maxCount: number = 1) => {
  const upload = maxCount === 1
    ? multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') } }).single(fieldName)
    : multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), files: maxCount } }).array(fieldName, maxCount);

  return (req: Request, res: any, next: any) => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large',
            error: {
              code: FileErrorCodes.FILE_TOO_LARGE,
              maxSize: process.env.MAX_FILE_SIZE
            }
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files',
            error: {
              code: 'FILE_COUNT_EXCEEDED',
              maxCount
            }
          });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name',
            error: {
              code: 'INVALID_FIELD_NAME',
              field: err.field
            }
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        // Other errors
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
          error: {
            code: FileErrorCodes.UPLOAD_FAILED
          }
        });
      }
      
      next();
    });
  };
};

/**
 * Validate file size before processing
 */
export const validateFileSize = (maxSize: number) => {
  return (req: Request, res: any, next: any) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.file ? [req.file] : (req.files as Express.Multer.File[] || []);
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size`,
          error: {
            code: FileErrorCodes.FILE_TOO_LARGE,
            filename: file.originalname,
            size: file.size,
            maxSize
          }
        });
      }
    }

    next();
  };
};
