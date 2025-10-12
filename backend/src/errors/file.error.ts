/**
 * File Error Class
 * For file operation-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface FileErrorOptions extends BaseErrorOptions {
  filename?: string;
  filepath?: string;
  filesize?: number;
  filetype?: string;
  operation?: 'upload' | 'download' | 'delete' | 'move' | 'copy';
  maxSize?: number;
  allowedTypes?: string[];
  destination?: string;
}

export class FileError extends BaseError {
  public readonly filename?: string;
  public readonly filepath?: string;
  public readonly filesize?: number;
  public readonly filetype?: string;
  public readonly operation?: 'upload' | 'download' | 'delete' | 'move' | 'copy';
  public readonly maxSize?: number;
  public readonly allowedTypes?: string[];
  public readonly destination?: string;

  constructor(options: FileErrorOptions = {}) {
    const {
      code = 'FILE_UPLOAD_FAILED',
      statusCode = 400,
      type = 'FILE',
      severity = 'MEDIUM',
      filename,
      filepath,
      filesize,
      filetype,
      operation,
      maxSize,
      allowedTypes,
      destination,
      ...baseOptions
    } = options;

    super({
      code,
      statusCode,
      type,
      severity,
      ...baseOptions
    });

    this.filename = filename;
    this.filepath = filepath;
    this.filesize = filesize;
    this.filetype = filetype;
    this.operation = operation;
    this.maxSize = maxSize;
    this.allowedTypes = allowedTypes;
    this.destination = destination;

    // Add file-specific context
    if (filename) this.addContext('filename', filename);
    if (filepath) this.addContext('filepath', filepath);
    if (filesize) this.addContext('filesize', filesize);
    if (filetype) this.addContext('filetype', filetype);
    if (operation) this.addContext('operation', operation);
    if (maxSize) this.addContext('maxSize', maxSize);
    if (allowedTypes) this.addContext('allowedTypes', allowedTypes);
    if (destination) this.addContext('destination', destination);
  }

  /**
   * Create upload failed error
   */
  static uploadFailed(filename?: string, details?: Record<string, any>): FileError {
    return new FileError({
      code: 'FILE_UPLOAD_FAILED',
      message: 'File upload failed',
      statusCode: 400,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      operation: 'upload',
      details
    });
  }

  /**
   * Create file size exceeded error
   */
  static sizeExceeded(
    filename: string,
    filesize: number,
    maxSize: number
  ): FileError {
    return new FileError({
      code: 'FILE_SIZE_EXCEEDED',
      message: `File size exceeds maximum allowed size. File: ${filesize} bytes, Max: ${maxSize} bytes`,
      statusCode: 400,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filesize,
      maxSize,
      operation: 'upload'
    });
  }

  /**
   * Create file type not allowed error
   */
  static typeNotAllowed(
    filename: string,
    filetype: string,
    allowedTypes: string[]
  ): FileError {
    return new FileError({
      code: 'FILE_TYPE_NOT_ALLOWED',
      message: `File type '${filetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      statusCode: 400,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filetype,
      allowedTypes,
      operation: 'upload'
    });
  }

  /**
   * Create file not found error
   */
  static notFound(filename?: string, filepath?: string): FileError {
    return new FileError({
      code: 'FILE_NOT_FOUND',
      message: 'File not found',
      statusCode: 404,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filepath,
      operation: 'download'
    });
  }

  /**
   * Create file delete failed error
   */
  static deleteFailed(filename?: string, filepath?: string): FileError {
    return new FileError({
      code: 'FILE_DELETE_FAILED',
      message: 'File deletion failed',
      statusCode: 500,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filepath,
      operation: 'delete'
    });
  }

  /**
   * Create file move failed error
   */
  static moveFailed(
    filename: string,
    source: string,
    destination: string
  ): FileError {
    return new FileError({
      code: 'FILE_UPLOAD_FAILED',
      message: `Failed to move file from ${source} to ${destination}`,
      statusCode: 500,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filepath: source,
      destination,
      operation: 'move'
    });
  }

  /**
   * Create file copy failed error
   */
  static copyFailed(
    filename: string,
    source: string,
    destination: string
  ): FileError {
    return new FileError({
      code: 'FILE_UPLOAD_FAILED',
      message: `Failed to copy file from ${source} to ${destination}`,
      statusCode: 500,
      type: 'FILE',
      severity: 'MEDIUM',
      filename,
      filepath: source,
      destination,
      operation: 'copy'
    });
  }

  /**
   * Convert to JSON with file-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      filename: this.filename,
      filepath: this.filepath,
      filesize: this.filesize,
      filetype: this.filetype,
      operation: this.operation,
      maxSize: this.maxSize,
      allowedTypes: this.allowedTypes,
      destination: this.destination
    };
  }
}
