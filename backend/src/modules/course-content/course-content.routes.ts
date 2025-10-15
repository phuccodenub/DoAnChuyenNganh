import { Router } from 'express';
import { CourseContentController } from './course-content.controller';
import { courseContentValidation } from './course-content.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

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

// Get course progress
router.get(
  '/courses/:courseId/progress',
  validate(courseContentValidation.courseId),
  controller.getCourseProgress
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

// Get complete course content
router.get(
  '/courses/:courseId/content',
  validate([
    ...courseContentValidation.courseId,
    ...courseContentValidation.includeUnpublished
  ]),
  controller.getCourseContent
);

export default router;






