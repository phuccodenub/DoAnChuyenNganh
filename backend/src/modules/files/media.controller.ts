/**
 * Media Controller
 * Handles thumbnail (Cloudinary) and video (R2) uploads
 */

import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '../../services/media/cloudinary.service';
import { R2StorageService } from '../../services/storage/r2.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';

export class MediaController {
  private cloudinaryService: CloudinaryService;
  private r2Service: R2StorageService | null = null;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
    
    // Initialize R2 only if configured
    try {
      this.r2Service = new R2StorageService();
    } catch (error) {
      logger.warn('R2 storage not configured, video uploads will be disabled');
    }
  }

  /**
   * Upload thumbnail image to Cloudinary
   * POST /media/thumbnail
   */
  uploadThumbnail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        responseUtils.sendError(res, 'No file uploaded', 400);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        responseUtils.sendError(res, 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', 400);
        return;
      }

      // Upload to Cloudinary
      const folder = req.body.folder || 'thumbnails';
      const result = await this.cloudinaryService.uploadImage(req.file, folder);

      responseUtils.sendCreated(res, 'Thumbnail uploaded successfully', {
        url: result.url,
        publicId: result.publicId,
        format: result.format
      });
    } catch (error: unknown) {
      logger.error('Error uploading thumbnail:', error);
      next(error);
    }
  };

  /**
   * Upload video to Cloudflare R2
   * POST /media/video
   */
  uploadVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.r2Service) {
        responseUtils.sendError(res, 'Video upload service is not configured', 503);
        return;
      }

      if (!req.file) {
        responseUtils.sendError(res, 'No file uploaded', 400);
        return;
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        responseUtils.sendError(res, 'Invalid file type. Only MP4, WebM, MOV, and AVI are allowed.', 400);
        return;
      }

      // Upload to R2
      const folder = req.body.folder || 'videos';
      const userId = req.user?.userId || 'anonymous';
      
      const result = await this.r2Service.uploadFile(req.file, {
        folder,
        userId
      });

      responseUtils.sendCreated(res, 'Video uploaded successfully', {
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimetype: result.mimetype
      });
    } catch (error: unknown) {
      logger.error('Error uploading video:', error);
      next(error);
    }
  };

  /**
   * Upload course cover image
   * POST /media/course-cover
   */
  uploadCourseCover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        responseUtils.sendError(res, 'No file uploaded', 400);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        responseUtils.sendError(res, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400);
        return;
      }

      // Upload to Cloudinary with course-specific folder
      const courseId = req.body.courseId || 'general';
      const folder = `courses/${courseId}`;
      const result = await this.cloudinaryService.uploadImage(req.file, folder);

      responseUtils.sendCreated(res, 'Course cover uploaded successfully', {
        url: result.url,
        publicId: result.publicId,
        format: result.format
      });
    } catch (error: unknown) {
      logger.error('Error uploading course cover:', error);
      next(error);
    }
  };

  /**
   * Upload lesson video
   * POST /media/lesson-video
   */
  uploadLessonVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.r2Service) {
        responseUtils.sendError(res, 'Video upload service is not configured', 503);
        return;
      }

      if (!req.file) {
        responseUtils.sendError(res, 'No file uploaded', 400);
        return;
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        responseUtils.sendError(res, 'Invalid file type. Only MP4, WebM, and MOV are allowed.', 400);
        return;
      }

      // Upload to R2 with lesson-specific folder
      const courseId = req.body.courseId || 'general';
      const lessonId = req.body.lessonId || Date.now().toString();
      const folder = `lessons/${courseId}/${lessonId}`;
      const userId = req.user?.userId || 'anonymous';
      
      const result = await this.r2Service.uploadFile(req.file, {
        folder,
        userId
      });

      responseUtils.sendCreated(res, 'Lesson video uploaded successfully', {
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimetype: result.mimetype,
        path: result.path
      });
    } catch (error: unknown) {
      logger.error('Error uploading lesson video:', error);
      next(error);
    }
  };

  /**
   * Proxy video from R2 with CORS headers
   * GET /media/video-proxy
   * Fetches video from R2 public URL and streams it with proper CORS headers
   */
  proxyVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const videoUrl = req.query.url as string;
      if (!videoUrl) {
        responseUtils.sendError(res, 'Video URL is required', 400);
        return;
      }

      // Validate that it's an R2 URL
      if (!videoUrl.includes('.r2.dev')) {
        responseUtils.sendError(res, 'Invalid video URL. Only R2 URLs are supported.', 400);
        return;
      }

      // Fetch video from R2 public URL
      const range = req.headers.range;
      const headers: Record<string, string> = {};
      
      // Forward Range header for video seeking
      if (range) {
        headers['Range'] = range;
      }

      try {
        const fetchResponse = await fetch(videoUrl, { headers });
        
        if (!fetchResponse.ok) {
          responseUtils.sendError(res, 'Video not found', 404);
          return;
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
        res.setHeader('Accept-Ranges', 'bytes');

        // Forward status code (206 for partial content, 200 for full)
        res.status(fetchResponse.status);

        // Forward content headers
        const contentType = fetchResponse.headers.get('content-type');
        const contentLength = fetchResponse.headers.get('content-length');
        const contentRange = fetchResponse.headers.get('content-range');

        if (contentType) {
          res.setHeader('Content-Type', contentType);
        } else {
          res.setHeader('Content-Type', 'video/mp4');
        }

        if (contentLength) {
          res.setHeader('Content-Length', contentLength);
        }

        if (contentRange) {
          res.setHeader('Content-Range', contentRange);
        }

        // Stream response body to client
        if (fetchResponse.body) {
          const reader = fetchResponse.body.getReader();
          const stream = new ReadableStream({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
                controller.close();
              } catch (error) {
                controller.error(error);
              }
            }
          });

          // Convert Web ReadableStream to Node.js stream
          const { Readable } = await import('stream');
          const nodeStream = Readable.fromWeb(stream as any);
          nodeStream.pipe(res);
        } else {
          res.end();
        }
      } catch (fetchError: unknown) {
        logger.error('Error fetching video from R2:', fetchError);
        responseUtils.sendError(res, 'Failed to fetch video', 500);
      }
    } catch (error: unknown) {
      logger.error('Error proxying video:', error);
      next(error);
    }
  };
}
