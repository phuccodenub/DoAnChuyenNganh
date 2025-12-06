import { Request, Response, NextFunction } from 'express';
import { CourseContentService } from './course-content.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';

/**
 * Course Content Controller
 * Handles HTTP requests for course content management
 */
export class CourseContentController {
  private service: CourseContentService;

  constructor() {
    this.service = new CourseContentService();
  }

  // ===================================
  // SECTION ENDPOINTS
  // ===================================

  /**
   * POST /api/courses/:courseId/sections
   * Create a new section
   */
  createSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const section = await this.service.createSection(courseId, userId!, data);
      
      return responseUtils.success(
        res,
        section,
        'Section created successfully',
        201
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * GET /api/courses/:courseId/sections
   * Get all sections of a course
   */
  getCourseSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const includeUnpublished = req.query.include_unpublished === 'true';

      const sections = await this.service.getCourseSections(
        courseId,
        userId,
        includeUnpublished
      );
      
      return responseUtils.success(
        res,
        sections,
        'Sections retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * GET /api/sections/:sectionId
   * Get a single section
   */
  getSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      
      const section = await this.service.getSection(sectionId);
      
      return responseUtils.success(
        res,
        section,
        'Section retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * PUT /api/sections/:sectionId
   * Update a section
   */
  updateSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const section = await this.service.updateSection(sectionId, userId!, data);
      
      return responseUtils.success(
        res,
        section,
        'Section updated successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * DELETE /api/sections/:sectionId
   * Delete a section
   */
  deleteSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const userId = req.user?.userId;

      await this.service.deleteSection(sectionId, userId!);
      
      return responseUtils.success(
        res,
        null,
        'Section deleted successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * POST /api/courses/:courseId/sections/reorder
   * Reorder sections
   */
  reorderSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const { orders } = req.body; // Array of { id, order_index }

      await this.service.reorderSections(courseId, userId!, orders);
      
      return responseUtils.success(
        res,
        null,
        'Sections reordered successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // LESSON ENDPOINTS
  // ===================================

  /**
   * POST /api/sections/:sectionId/lessons
   * Create a new lesson
   */
  createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const lesson = await this.service.createLesson(sectionId, userId!, data);
      
      return responseUtils.success(
        res,
        lesson,
        'Lesson created successfully',
        201
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * GET /api/lessons/:lessonId
   * Get a single lesson
   */
  getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      const lesson = await this.service.getLesson(lessonId, userId);
      
      return responseUtils.success(
        res,
        lesson,
        'Lesson retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * PUT /api/lessons/:lessonId
   * Update a lesson
   */
  updateLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const lesson = await this.service.updateLesson(lessonId, userId!, data);
      
      return responseUtils.success(
        res,
        lesson,
        'Lesson updated successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * DELETE /api/lessons/:lessonId
   * Delete a lesson
   */
  deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      await this.service.deleteLesson(lessonId, userId!);
      
      return responseUtils.success(
        res,
        null,
        'Lesson deleted successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * POST /api/sections/:sectionId/lessons/reorder
   * Reorder lessons
   */
  reorderLessons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sectionId } = req.params;
      const userId = req.user?.userId;
      const { orders } = req.body;

      await this.service.reorderLessons(sectionId, userId!, orders);
      
      return responseUtils.success(
        res,
        null,
        'Lessons reordered successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // LESSON MATERIAL ENDPOINTS
  // ===================================

  /**
   * POST /api/lessons/:lessonId/materials
   * Add material to a lesson
   */
  addMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const material = await this.service.addMaterial(lessonId, userId!, data);
      
      return responseUtils.success(
        res,
        material,
        'Material added successfully',
        201
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * POST /api/lessons/:lessonId/materials/upload
   * Upload material file to Google Drive and create LessonMaterial
   */
  uploadMaterialFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        return responseUtils.error(res, 'No file uploaded', 400);
      }

      const description = (req.body.description as string) || undefined;

      const material = await this.service.addMaterialFromUpload(lessonId, userId!, file, {
        description
      });

      return responseUtils.success(
        res,
        material,
        'Material uploaded and created successfully',
        201
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * DELETE /api/materials/:materialId
   * Delete a material
   */
  deleteMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { materialId } = req.params;
      const userId = req.user?.userId;

      await this.service.deleteMaterial(materialId, userId!);
      
      return responseUtils.success(
        res,
        null,
        'Material deleted successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * POST /api/materials/:materialId/download
   * Track material download
   */
  trackDownload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { materialId } = req.params;

      const material = await this.service.trackDownload(materialId);
      
      return responseUtils.success(
        res,
        material,
        'Download tracked successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // LESSON PROGRESS ENDPOINTS
  // ===================================

  /**
   * PUT /api/lessons/:lessonId/progress
   * Update lesson progress
   */
  updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;
      const data = req.body;

      const progress = await this.service.updateProgress(userId!, lessonId, data);
      
      return responseUtils.success(
        res,
        progress,
        'Progress updated successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * POST /api/lessons/:lessonId/complete
   * Mark lesson as completed
   */
  markAsCompleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      const progress = await this.service.markAsCompleted(userId!, lessonId);
      
      return responseUtils.success(
        res,
        progress,
        'Lesson marked as completed'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * GET /api/lessons/:lessonId/progress
   * Get lesson progress
   */
  getLessonProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.userId;

      const progress = await this.service.getLessonProgress(userId!, lessonId);
      
      return responseUtils.success(
        res,
        progress,
        'Progress retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * GET /api/courses/:courseId/progress
   * Get course progress
   */
  getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      const progress = await this.service.getCourseProgress(userId!, courseId);
      
      return responseUtils.success(
        res,
        progress,
        'Course progress retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get student progress (for instructor - view any student's progress)
   */
  getStudentProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, studentId } = req.params;
      const instructorId = req.user?.userId;

      if (!instructorId) {
        return responseUtils.sendError(res, 'Unauthorized', 401);
      }

      // Verify instructor has access to this course
      // Get course directly from repository to check instructor_id before normalization
      const { CourseRepository } = await import('../course/course.repository');
      const courseRepository = new CourseRepository();
      const courseRaw = await courseRepository.findById(courseId);
      
      if (!courseRaw) {
        return responseUtils.sendError(res, 'Course not found', 404);
      }

      // Check if instructor owns the course or is admin
      const courseInstructorId = (courseRaw as any).instructor_id;
      if (courseInstructorId !== instructorId) {
        // Check if user is admin
        const user = await courseRepository.findUserById(instructorId);
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          return responseUtils.sendError(res, 'Not authorized to view student progress', 403);
        }
      }

      // Get student's progress
      const progress = await this.service.getCourseProgress(studentId, courseId);
      
      return responseUtils.success(
        res,
        progress,
        'Student progress retrieved successfully'
      );
    } catch (error: unknown) {
      logger.error('Error getting student progress:', error);
      next(error);
    }
  };

  /**
   * GET /api/users/me/recent-activity
   * Get user's recent learning activity
   */
  getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      const activity = await this.service.getRecentActivity(userId!, limit);
      
      return responseUtils.success(
        res,
        activity,
        'Recent activity retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // COURSE CONTENT OVERVIEW
  // ===================================

  /**
   * GET /api/courses/:courseId/content
   * Get complete course content overview
   */
  getCourseContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const includeUnpublished = req.query.include_unpublished === 'true';

      const content = await this.service.getCourseContentOverview(
        courseId,
        userId,
        includeUnpublished
      );
      
      return responseUtils.success(
        res,
        content,
        'Course content retrieved successfully'
      );
    } catch (error: unknown) {
      next(error);
    }
  };
}






