/**
 * Media Routes
 * HTTP endpoints for media upload (thumbnails, videos)
 */

import { Router } from 'express';
import { MediaController } from './media.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import multer, { FileFilterCallback } from 'multer';

const router = Router();
const mediaController = new MediaController();

// Configure multer for memory storage (required for cloud uploads)
const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, MOV, and AVI are allowed.'));
    }
  }
});

// Upload routes require authentication
router.post('/thumbnail', authMiddleware, imageUpload.single('file'), mediaController.uploadThumbnail);
router.post('/video', authMiddleware, videoUpload.single('file'), mediaController.uploadVideo);
router.post('/course-cover', authMiddleware, imageUpload.single('file'), mediaController.uploadCourseCover);
router.post('/lesson-video', authMiddleware, videoUpload.single('file'), mediaController.uploadLessonVideo);

/**
 * @route   GET /media/video-proxy
 * @desc    Proxy video from R2 with CORS headers
 * @access  Public (for video playback, CORS handled by proxy)
 */
router.get('/video-proxy', mediaController.proxyVideo);

export default router;
