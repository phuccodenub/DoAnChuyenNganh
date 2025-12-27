import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CourseContentController } from './course-content.controller';
import { courseContentValidation } from './course-content.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate, validateRequest } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';
import { uploadMiddleware } from '../files/upload.middleware';
import multer, { FileFilterCallback } from 'multer';
import { FILE_CATEGORIES } from '../files/files.types';

const router = Router();
const controller = new CourseContentController();

// All routes require authentication
router.use(authMiddleware);

// ===================================
// SECTION ROUTES
// ===================================

// Create section (instructor only)
router.post(
  '/courses/:courseId/sections',
  validate([
    ...courseContentValidation.courseId,
    ...courseContentValidation.createSection
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.createSection
);

// Get course sections
router.get(
  '/courses/:courseId/sections',
  validate([
    ...courseContentValidation.courseId,
    ...courseContentValidation.includeUnpublished
  ]),
  controller.getCourseSections
);

// Get single section
router.get(
  '/sections/:sectionId',
  validate(courseContentValidation.sectionId),
  controller.getSection
);

// Update section (instructor only)
router.put(
  '/sections/:sectionId',
  validate([
    ...courseContentValidation.sectionId,
    ...courseContentValidation.updateSection
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.updateSection
);

// Delete section (instructor only)
router.delete(
  '/sections/:sectionId',
  validate(courseContentValidation.sectionId),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.deleteSection
);

// Reorder sections (instructor only)
router.post(
  '/courses/:courseId/sections/reorder',
  validate([
    ...courseContentValidation.courseId,
    ...courseContentValidation.reorderSections
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.reorderSections
);

// ===================================
// LESSON ROUTES
// ===================================

// Create lesson (instructor only)
router.post(
  '/sections/:sectionId/lessons',
  validate([
    ...courseContentValidation.sectionId,
    ...courseContentValidation.createLesson
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.createLesson
);

// Get single lesson
router.get(
  '/lessons/:lessonId',
  validate(courseContentValidation.lessonId),
  controller.getLesson
);

// Update lesson (instructor only)
router.put(
  '/lessons/:lessonId',
  validate([
    ...courseContentValidation.lessonId,
    ...courseContentValidation.updateLesson
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.updateLesson
);

// Delete lesson (instructor only)
router.delete(
  '/lessons/:lessonId',
  validate(courseContentValidation.lessonId),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.deleteLesson
);

// Reorder lessons (instructor only)
router.post(
  '/sections/:sectionId/lessons/reorder',
  validate([
    ...courseContentValidation.sectionId,
    ...courseContentValidation.reorderSections // Same validation structure
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.reorderLessons
);

// ===================================
// LESSON MATERIAL ROUTES
// ===================================

// Add material (instructor only)
router.post(
  '/lessons/:lessonId/materials',
  validate([
    ...courseContentValidation.lessonId,
    ...courseContentValidation.addMaterial
  ]),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.addMaterial
);

// Upload material file to R2 (or Google Drive) and create LessonMaterial (instructor only)
// Custom upload middleware với limit 50MB cho materials
const materialUpload = (() => {
  const storageType = (process.env.STORAGE_TYPE || 'local').toLowerCase();
  const isCloudStorage = storageType === 'r2' || storageType === 'google_cloud' || storageType === 'aws_s3';
  const storage = isCloudStorage ? multer.memoryStorage() : multer.diskStorage({});
  
  return multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const category = (req.body as any)?.category || 'DOCUMENT';
      const categoryConfig = FILE_CATEGORIES[category.toUpperCase() as keyof typeof FILE_CATEGORIES];
      
      if (!categoryConfig) {
        return cb(new Error(`Invalid file category: ${category}`), false);
      }
      
      const path = require('path');
      const ext = path.extname(file.originalname).toLowerCase();
      const isValidExt = (categoryConfig.extensions as readonly string[]).includes(ext);
      const isValidMime = (categoryConfig.mimeTypes as readonly string[]).includes(file.mimetype);
      
      if (isValidExt && isValidMime) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Allowed: ${categoryConfig.extensions.join(', ')}`), false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB for materials
    }
  }).single('file');
})();

router.post(
  '/lessons/:lessonId/materials/upload',
  // Dùng category DOCUMENT để giới hạn PDF, DOCX, PPT, ZIP...
  (req: Request, _res: Response, next: NextFunction) => {
    // Khởi tạo req.body nếu chưa có
    if (!req.body) {
      (req as any).body = {};
    }
    // Gắn category để fileFilter biết validate
    (req as any).body.category = (req as any).body.category || 'DOCUMENT';
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    materialUpload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn. Kích thước tối đa: 50MB',
            error: { code: 'FILE_TOO_LARGE', maxSize: 50 * 1024 * 1024 }
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  },
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.uploadMaterialFile
);

// Delete material (instructor only)
router.delete(
  '/materials/:materialId',
  validate(courseContentValidation.materialId),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.deleteMaterial
);

// Track download
router.post(
  '/materials/:materialId/download',
  validate(courseContentValidation.materialId),
  controller.trackDownload
);

// ===================================
// LESSON PROGRESS ROUTES
// ===================================

// Update progress (students)
router.put(
  '/lessons/:lessonId/progress',
  validate([
    ...courseContentValidation.lessonId,
    ...courseContentValidation.updateProgress
  ]),
  controller.updateProgress
);

// Mark as completed (students)
router.post(
  '/lessons/:lessonId/complete',
  validate(courseContentValidation.lessonId),
  controller.markAsCompleted
);

// Get lesson progress
router.get(
  '/lessons/:lessonId/progress',
  validate(courseContentValidation.lessonId),
  controller.getLessonProgress
);

// Get course progress (for current user)
router.get(
  '/courses/:courseId/progress',
  validate(courseContentValidation.courseId),
  controller.getCourseProgress
);

// Get bookmarked lessons in a course (current user)
router.get(
  '/courses/:courseId/bookmarks',
  validate(courseContentValidation.courseId),
  controller.getBookmarkedLessons
);

// Get student progress (for instructor - view any student's progress)
router.get(
  '/courses/:courseId/students/:studentId/progress',
  validateRequest({
    params: z.object({
      courseId: z.string().uuid('Invalid course ID'),
      studentId: z.string().uuid('Invalid student ID')
    })
  }),
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  controller.getStudentProgress
);

// Get recent activity
router.get(
  '/users/me/recent-activity',
  validate(courseContentValidation.limit),
  controller.getRecentActivity
);

// ===================================
// COURSE CONTENT OVERVIEW
// ===================================

/**
 * @swagger
 * /api/course-content/courses/{courseId}/content:
 *   get:
 *     summary: Get complete course content (mục lục khóa học)
 *     description: Lấy toàn bộ nội dung khóa học bao gồm sections, lessons, quizzes và assignments
 *     tags: [Course Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *       - in: query
 *         name: include_unpublished
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include unpublished content (chỉ instructor mới có thể dùng)
 *     responses:
 *       200:
 *         description: Course content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course content retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course_id:
 *                       type: string
 *                       format: uuid
 *                     total_sections:
 *                       type: integer
 *                       example: 5
 *                     total_lessons:
 *                       type: integer
 *                       example: 20
 *                     total_duration_minutes:
 *                       type: integer
 *                       example: 300
 *                     total_materials:
 *                       type: integer
 *                       example: 15
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           lessons:
 *                             type: array
 *                             items:
 *                               type: object
 *                           quizzes:
 *                             type: array
 *                             description: Section-level quizzes
 *                             items:
 *                               type: object
 *                           assignments:
 *                             type: array
 *                             description: Section-level assignments
 *                             items:
 *                               type: object
 *                     course_level_quizzes:
 *                       type: array
 *                       description: Course-level quizzes (không thuộc section nào)
 *                       items:
 *                         type: object
 *                     course_level_assignments:
 *                       type: array
 *                       description: Course-level assignments (không thuộc section nào)
 *                       items:
 *                         type: object
 *                     completed_lessons:
 *                       type: integer
 *                       description: Số bài học đã hoàn thành (nếu user đã enroll)
 *                     progress_percentage:
 *                       type: number
 *                       description: Phần trăm tiến độ (nếu user đã enroll)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (khi dùng include_unpublished nhưng không phải instructor)
 *       404:
 *         description: Course not found
 */
router.get(
  '/courses/:courseId/content',
  validate([
    ...courseContentValidation.courseId,
    ...courseContentValidation.includeUnpublished
  ]),
  controller.getCourseContent
);

export default router;






