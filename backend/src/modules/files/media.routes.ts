/**
 * Media Routes
 * HTTP endpoints for media upload (thumbnails, videos)
 */

import { Router } from 'express';
import { MediaController } from './media.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const mediaController = new MediaController();

// Configure multer for memory storage (required for cloud uploads)
const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req, file, cb) => {
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
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, MOV, and AVI are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /media/thumbnail
 * @desc    Upload thumbnail image to Cloudinary
 * @access  Private
 */
router.post('/thumbnail', imageUpload.single('file'), mediaController.uploadThumbnail);

/**
 * @route   POST /media/video
 * @desc    Upload video to Cloudflare R2
 * @access  Private
 */
router.post('/video', videoUpload.single('file'), mediaController.uploadVideo);

/**
 * @route   POST /media/course-cover
 * @desc    Upload course cover image to Cloudinary
 * @access  Private
 */
router.post('/course-cover', imageUpload.single('file'), mediaController.uploadCourseCover);

/**
 * @route   POST /media/lesson-video
 * @desc    Upload lesson video to Cloudflare R2
 * @access  Private
 */
router.post('/lesson-video', videoUpload.single('file'), mediaController.uploadLessonVideo);

export default router;
