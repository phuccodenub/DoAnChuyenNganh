/**
 * Files Controller
 * HTTP endpoints for file operations
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { FilesService } from './files.service';
import { FileUploadOptions } from './files.types';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/response.util';
import logger from '../../utils/logger.util';

export class FilesController {
  private filesService: FilesService;

  constructor() {
    this.filesService = new FilesService();
  }

  /**
   * Upload single file
   * POST /files/upload
   */
  uploadSingle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        sendErrorResponse(res, 'No file uploaded', 400);
        return;
      }

      const userId = req.user!.userId;
      const folder = req.body.folder || 'misc';

      const options: FileUploadOptions = {
        folder,
        userId
      };

      const fileInfo = await this.filesService.processUpload(req.file as any, options);

      sendSuccessResponse(res, 'File uploaded successfully', fileInfo, 201);
    } catch (error: unknown) {
      logger.error('Error in uploadSingle:', error);
      next(error);
    }
  };

  /**
   * Upload multiple files
   * POST /files/upload/multiple
   */
  uploadMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        sendErrorResponse(res, 'No files uploaded', 400);
        return;
      }

      const userId = req.user!.userId;
      const folder = req.body.folder || 'misc';

      const options: FileUploadOptions = {
        folder,
        userId
      };

      const filesInfo = await this.filesService.processMultipleUploads(files, options);

      sendSuccessResponse(res, 'Files uploaded successfully', {
        count: filesInfo.length,
        files: filesInfo
      }, 201);
    } catch (error: unknown) {
      logger.error('Error in uploadMultiple:', error);
      next(error);
    }
  };

  /**
   * Download file
   * GET /files/download/:folder/:filename
   */
  downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder, filename } = req.params;

      const fileInfo = await this.filesService.getFileInfo(folder, filename);

      if (!fileInfo.exists) {
        sendErrorResponse(res, 'File not found', 404);
        return;
      }

      // Set headers for download
      res.setHeader('Content-Type', fileInfo.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
      res.setHeader('Content-Length', fileInfo.size);

      // Send file
      res.sendFile(fileInfo.path, (err: Error | null) => {
        if (err) {
          logger.error('Error sending file:', err);
          if (!res.headersSent) {
            sendErrorResponse(res, 'Error downloading file', 500);
          }
        }
      });
    } catch (error: unknown) {
      logger.error('Error in downloadFile:', error);
      next(error);
    }
  };

  /**
   * View file (inline)
   * GET /files/view/:folder/:filename
   */
  viewFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder, filename } = req.params;

      const fileInfo = await this.filesService.getFileInfo(folder, filename);

      if (!fileInfo.exists) {
        sendErrorResponse(res, 'File not found', 404);
        return;
      }

      // Set headers for inline view
      res.setHeader('Content-Type', fileInfo.mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${fileInfo.filename}"`);
      res.setHeader('Content-Length', fileInfo.size);

      // Send file
      res.sendFile(fileInfo.path, (err: Error | null) => {
        if (err) {
          logger.error('Error sending file:', err);
          if (!res.headersSent) {
            sendErrorResponse(res, 'Error viewing file', 500);
          }
        }
      });
    } catch (error: unknown) {
      logger.error('Error in viewFile:', error);
      next(error);
    }
  };

  /**
   * Get file info
   * GET /files/info/:folder/:filename
   */
  getFileInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder, filename } = req.params;

      const fileInfo = await this.filesService.getFileInfo(folder, filename);

      if (!fileInfo.exists) {
        sendErrorResponse(res, 'File not found', 404);
        return;
      }

      sendSuccessResponse(res, 'File info retrieved successfully', fileInfo);
    } catch (error: unknown) {
      logger.error('Error in getFileInfo:', error);
      next(error);
    }
  };

  /**
   * Delete file
   * DELETE /files/:folder/:filename
   */
  deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder, filename } = req.params;

      const deleted = await this.filesService.deleteFile(folder, filename);

      if (!deleted) {
        sendErrorResponse(res, 'File not found', 404);
        return;
      }

      sendSuccessResponse(res, 'File deleted successfully', null);
    } catch (error: unknown) {
      logger.error('Error in deleteFile:', error);
      next(error);
    }
  };

  /**
   * List files in folder
   * GET /files/list/:folder
   */
  listFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder } = req.params;

      const files = await this.filesService.listFiles(folder);

      sendSuccessResponse(res, 'Files retrieved successfully', {
        folder,
        count: files.length,
        files
      });
    } catch (error: unknown) {
      logger.error('Error in listFiles:', error);
      next(error);
    }
  };

  /**
   * Get folder size
   * GET /files/folder-size/:folder
   */
  getFolderSize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder } = req.params;

      const size = await this.filesService.getFolderSize(folder);

      sendSuccessResponse(res, 'Folder size retrieved successfully', {
        folder,
        size,
        formattedSize: this.filesService.formatFileSize(size)
      });
    } catch (error: unknown) {
      logger.error('Error in getFolderSize:', error);
      next(error);
    }
  };

  /**
   * Generate signed URL
   * POST /files/signed-url
   */
  generateSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folder, filename, expiresIn } = req.body;

      if (!folder || !filename) {
        sendErrorResponse(res, 'Folder and filename are required', 400);
        return;
      }

      const url = await this.filesService.generateSignedUrl(
        folder,
        filename,
        expiresIn || 3600
      );

      sendSuccessResponse(res, 'Signed URL generated successfully', { url });
    } catch (error: unknown) {
      logger.error('Error in generateSignedUrl:', error);
      next(error);
    }
  };
}
