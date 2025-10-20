import { z } from 'zod';
import { baseValidation } from './base.validate';
import { validatorsUtils } from '../utils/validators.util';

// File upload validation schemas
export const fileValidation = {
  // Single file upload schema
  uploadFile: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB limit
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional()
  }),
  
  // Multiple files upload schema
  uploadFiles: z.array(z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional()
  })),
  
  // File type validation schema
  fileType: z.object({
    allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
    maxSize: z.number().default(10 * 1024 * 1024) // 10MB
  })
};

// File validation helpers
export const fileValidateHelpers = {
  // Allowed file types
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  
  // Validate file type
  isValidFileType: (mimetype: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(mimetype);
  },
  
  // Validate file size
  isValidFileSize: (size: number, maxSize: number = 10 * 1024 * 1024): boolean => {
    return size <= maxSize;
  },
  
  // Validate image file
  isValidImage: (mimetype: string, size: number): boolean => {
    return fileValidateHelpers.isValidFileType(mimetype, fileValidateHelpers.allowedImageTypes) &&
           fileValidateHelpers.isValidFileSize(size, 5 * 1024 * 1024); // 5MB for images
  },
  
  // Validate document file
  isValidDocument: (mimetype: string, size: number): boolean => {
    return fileValidateHelpers.isValidFileType(mimetype, fileValidateHelpers.allowedDocumentTypes) &&
           fileValidateHelpers.isValidFileSize(size, 10 * 1024 * 1024); // 10MB for documents
  },
  
  // Validate video file
  isValidVideo: (mimetype: string, size: number): boolean => {
    return fileValidateHelpers.isValidFileType(mimetype, fileValidateHelpers.allowedVideoTypes) &&
           fileValidateHelpers.isValidFileSize(size, 100 * 1024 * 1024); // 100MB for videos
  },
  
  // Get file extension
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },
  
  // Generate unique filename
  generateUniqueFilename: (originalname: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = fileValidateHelpers.getFileExtension(originalname);
    return `${timestamp}_${random}.${extension}`;
  }
};

// Legacy export for backward compatibility
export const fileSchemas = fileValidation;


