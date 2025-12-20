import { CourseContentRepository } from './course-content.repository';
import type { SectionInput, SectionWithLessons, ReorderItem, LessonInput, LessonMaterialInput, LessonProgressInput, CourseProgressSummary, CourseContentOverview } from './course-content.types';
import type { SectionInstance, LessonInstance, LessonMaterialInstance, CourseInstance } from '../../types/model.types';
import { ApiError } from '../../errors/api.error';
import { DatabaseError } from '../../errors/database.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import { GoogleDriveService } from '../../services/storage/google-drive.service';
import { R2StorageService } from '../../services/storage/r2.service';

/**
 * Course Content Service
 * Business logic for course content management
 */
export class CourseContentService {
  private repository: CourseContentRepository;
  private driveService: GoogleDriveService;
  private r2Service: R2StorageService | null = null;

  constructor() {
    this.repository = new CourseContentRepository();
    this.driveService = new GoogleDriveService();
    
    // Initialize R2 service if configured
    try {
      this.r2Service = new R2StorageService();
    } catch (error) {
      logger.warn('R2 storage not configured, will fallback to Google Drive for material uploads');
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  /**
   * Update last_content_update timestamp for a course
   * Called when course content is modified (lessons, sections, etc.)
   */
  private async updateCourseLastContentUpdate(courseId: string): Promise<void> {
    try {
      if (!courseId) {
        logger.warn(`[updateCourseLastContentUpdate] courseId is null/undefined`);
        return;
      }

      const { Course } = await import('../../models');
      const course = await (Course as any).findByPk(courseId);
      if (course) {
        const now = new Date();
        await course.update({
          last_content_update: now
        });
        logger.info(`[updateCourseLastContentUpdate] Successfully updated last_content_update to ${now.toISOString()} for course: ${courseId}`);
      } else {
        logger.warn(`[updateCourseLastContentUpdate] Course not found: ${courseId}`);
      }
    } catch (error) {
      logger.error(`[updateCourseLastContentUpdate] Error updating last_content_update for course ${courseId}:`, error);
      // Don't throw - this is not critical, but log the error
    }
  }

  // ===================================
  // SECTION SERVICES
  // ===================================

  /**
   * Create a new section in a course
   */
  async createSection(
    courseId: string,
    userId: string,
data: SectionInput
  ) {
    try {
      // Verify user is the instructor of the course
      await this.verifyInstructorAccess(courseId, userId);

      const section = await this.repository.createSection(courseId, data) as SectionInstance;
      
      // Update course last_content_update khi thêm section mới
      await this.updateCourseLastContentUpdate(courseId);
      
      logger.info(`Section created: ${section.id} in course ${courseId}`);
      
      return section;
    } catch (error: unknown) {
      logger.error(`Error creating section: ${error}`);
      throw error;
    }
  }

  /**
   * Get all sections of a course
   */
  async getCourseSections(
    courseId: string,
    userId?: string,
    includeUnpublished: boolean = false
): Promise<SectionWithLessons[]> {
    try {
      // If includeUnpublished, verify instructor access
      if (includeUnpublished && userId) {
        await this.verifyInstructorAccess(courseId, userId);
      }

      const sections = await this.repository.findSectionsByCourse(
        courseId,
        includeUnpublished
      );
      
      // Enrich lessons with is_practice
      const enrichedSections = await this.enrichLessonsWithPracticeFlag(sections, courseId);
      
      return enrichedSections as any;
    } catch (error: unknown) {
      logger.error(`Error getting course sections: ${error}`);
      throw error;
    }
  }

  /**
   * Get a single section by ID
   */
  async getSection(sectionId: string) {
    const section = await this.repository.findSectionById(sectionId);
    if (!section) {
      throw new ApiError('Section not found', 404);
    }
    
    // Enrich lessons with is_practice
    const courseId = (section as any).course_id;
    if (courseId) {
      const enrichedSections = await this.enrichLessonsWithPracticeFlag([section], courseId);
      return enrichedSections[0];
    }
    
    return section;
  }

  /**
   * Update a section
   */
  async updateSection(
    sectionId: string,
    userId: string,
data: Partial<SectionInput>
  ) {
    try {
      const section = await this.repository.findSectionById(sectionId) as SectionInstance;
      if (!section) {
        throw new ApiError('Section not found', 404);
      }

      // Verify instructor access
      await this.verifyInstructorAccess(section.course_id, userId);

      const updated = await this.repository.updateSection(sectionId, data);
      
      // Update course last_content_update khi chỉnh section (title, description, etc.)
      await this.updateCourseLastContentUpdate(section.course_id);
      
      logger.info(`Section updated: ${sectionId}`);
      
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating section: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a section
   */
  async deleteSection(sectionId: string, userId: string) {
    try {
      const section = await this.repository.findSectionById(sectionId) as SectionInstance;
      if (!section) {
        throw new ApiError('Section not found', 404);
      }

      // Verify instructor access
      await this.verifyInstructorAccess(section.course_id, userId);

      await this.repository.deleteSection(sectionId);
      
      // Update course last_content_update khi xóa section
      await this.updateCourseLastContentUpdate(section.course_id);
      
      logger.info(`Section deleted: ${sectionId}`);
      
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting section: ${error}`);
      throw error;
    }
  }

  /**
   * Reorder sections
   */
  async reorderSections(
    courseId: string,
    userId: string,
orders: ReorderItem[]
  ) {
    try {
      await this.verifyInstructorAccess(courseId, userId);
      await this.repository.reorderSections(courseId, orders);
      logger.info(`Sections reordered in course: ${courseId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error reordering sections: ${error}`);
      throw error;
    }
  }

  // ===================================
  // LESSON SERVICES
  // ===================================

  /**
   * Create a new lesson in a section
   */
  async createLesson(
    sectionId: string,
    userId: string,
data: LessonInput
  ) {
    try {
      const section = await this.repository.findSectionById(sectionId) as SectionInstance;
      if (!section) {
        throw new ApiError('Section not found', 404);
      }

      await this.verifyInstructorAccess(section.course_id, userId);

      const lesson = await this.repository.createLesson(sectionId, data) as LessonInstance;
      
      // Update course last_content_update khi thêm lesson mới
      await this.updateCourseLastContentUpdate(section.course_id);
      
      logger.info(`Lesson created: ${lesson.id} in section ${sectionId}`);
      
      return lesson;
    } catch (error: unknown) {
      logger.error(`Error creating lesson: ${error}`);
      throw error;
    }
  }

  /**
   * Get a single lesson by ID
   */
  async getLesson(lessonId: string, userId?: string) {
    const lesson = await this.repository.findLessonById(lessonId) as LessonInstance | null;
    if (!lesson) {
      throw new ApiError('Lesson not found', 404);
    }

    const courseId = (lesson as any).section?.course?.id;
    logger.info('Getting lesson - course info', {
      lessonId,
      userId,
      hasSection: !!(lesson as any).section,
      hasCourse: !!(lesson as any).section?.course,
      courseId,
      courseInstructorId: (lesson as any).section?.course?.instructor_id,
      isPublished: lesson.is_published,
      isFreePreview: lesson.is_free_preview
    });
    
    if (!courseId) {
      logger.error('Course not found for lesson', { lessonId, hasSection: !!(lesson as any).section });
      throw new ApiError('Course not found for this lesson', 404);
    }

    // If no userId provided, only allow free preview lessons
    if (!userId) {
      if (!lesson.is_free_preview || !lesson.is_published) {
        throw new AuthorizationError('You need to be logged in to access this lesson');
      }
      // Enrich quiz/assignment info for public preview
      const enrichedLesson = await this.attachPracticeInfoToLesson(lesson, courseId);
      return enrichedLesson as any;
    }

    // Check if user is instructor of the course first
    let isInstructor = false;
    try {
      await this.verifyInstructorAccess(courseId, userId);
      isInstructor = true;
      logger.info('User is instructor of course', { courseId, userId, lessonId });
      // Instructor can access any lesson (published or not)
      const enrichedLesson = await this.attachPracticeInfoToLesson(lesson, courseId);
      return enrichedLesson as any;
    } catch (error) {
      // Not instructor, will check enrollment or free preview below
      logger.debug('User is not instructor of course', { courseId, userId, lessonId });
    }

    // If lesson is not published and user is not instructor, check enrollment first
    // Enrolled users should be able to access unpublished lessons (they're already enrolled)
    // Only deny if lesson is truly draft and user hasn't enrolled
    if (!lesson.is_published) {
      logger.info('Lesson not published, checking enrollment for access', { lessonId, courseId, userId });
      // Will check enrollment below - if enrolled, allow access even if unpublished
    }

    // Check if lesson is free preview
    if (lesson.is_free_preview) {
      const enrichedLesson = await this.attachPracticeInfoToLesson(lesson, courseId);
      return enrichedLesson as any;
    }

    // Check if user is enrolled in the course
    // Try multiple ways to verify enrollment
    let enrollment = null;
    
    // Method 1: Use CourseRepository
    try {
      const { CourseRepository } = await import('../course/course.repository');
      const courseRepository = new CourseRepository();
      enrollment = await courseRepository.findEnrollment(courseId, userId);
      logger.debug('Enrollment check via CourseRepository', { found: !!enrollment });
    } catch (error) {
      logger.error('Error finding enrollment via CourseRepository:', error);
    }
    
    // Method 2: Direct model query (fallback)
    if (!enrollment) {
      try {
        const { Enrollment } = await import('../../models');
        const EnrollmentModel = Enrollment as any;
        enrollment = await EnrollmentModel.findOne({
          where: {
            course_id: courseId,
            user_id: userId
          },
          raw: false // Get Sequelize instance, not plain object
        });
        logger.debug('Enrollment check via direct model', { found: !!enrollment });
      } catch (fallbackError) {
        logger.error('Error in fallback enrollment check:', fallbackError);
      }
    }
    
    // Method 3: Check all enrollments for this user (debug)
    if (!enrollment) {
      try {
        const { Enrollment } = await import('../../models');
        const EnrollmentModel = Enrollment as any;
        const allUserEnrollments = await EnrollmentModel.findAll({
          where: { user_id: userId },
          attributes: ['id', 'course_id', 'user_id', 'status'],
          limit: 10
        });
        logger.warn('User enrollments (for debugging)', {
          userId,
          totalEnrollments: allUserEnrollments.length,
          enrollments: allUserEnrollments.map((e: any) => ({
            id: e.id,
            course_id: e.course_id,
            status: e.status
          }))
        });
      } catch (debugError) {
        logger.error('Error in debug enrollment check:', debugError);
      }
    }
    
    logger.info('Checking enrollment for lesson access', {
      lessonId,
      courseId,
      userId,
      hasEnrollment: !!enrollment,
      enrollmentStatus: enrollment?.status,
      enrollmentId: enrollment?.id,
      enrollmentData: enrollment ? {
        id: enrollment.id,
        course_id: (enrollment as any).course_id,
        user_id: (enrollment as any).user_id,
        status: enrollment.status
      } : null
    });
    
    if (!enrollment) {
      logger.warn('User not enrolled in course', { courseId, userId, lessonId });
      throw new AuthorizationError('You need to enroll in this course to access this lesson');
    }
    
    // Allow access if enrollment exists (regardless of status for now)
    // Status can be 'active', 'completed', 'cancelled', etc.
    // We'll allow access for any enrollment status except explicitly blocked ones
    if (enrollment.status === 'cancelled' || enrollment.status === 'suspended') {
      logger.warn('User enrollment is not active', { courseId, userId, status: enrollment.status });
      throw new AuthorizationError('Your enrollment in this course is not active');
    }

    logger.info('Lesson access granted', { lessonId, courseId, userId, enrollmentStatus: enrollment.status });
    const enrichedLesson = await this.attachPracticeInfoToLesson(lesson, courseId);
    return enrichedLesson as any;
  }

  /**
   * Update a lesson
   */
  async updateLesson(
    lessonId: string,
    userId: string,
data: Partial<LessonInput>
  ) {
    try {
      const lesson = await this.repository.findLessonById(lessonId) as LessonInstance | null;
      if (!lesson) {
        throw new ApiError('Lesson not found', 404);
      }

      // Lấy courseId từ lesson - có thể từ section.course.id hoặc section.course_id
      let courseId = (lesson as any).section?.course?.id;
      if (!courseId && (lesson as any).section?.course_id) {
        courseId = (lesson as any).section.course_id;
      }
      // Fallback: query trực tiếp từ section nếu không có trong include
      if (!courseId && (lesson as any).section_id) {
        const { Section } = await import('../../models');
        const section = await (Section as any).findByPk((lesson as any).section_id, {
          attributes: ['course_id']
        });
        if (section) {
          courseId = section.course_id;
        }
      }

      if (!courseId) {
        logger.error(`[updateLesson] Could not find courseId for lesson ${lessonId}`, {
          hasSection: !!(lesson as any).section,
          hasSectionCourse: !!(lesson as any).section?.course,
          sectionId: (lesson as any).section_id
        });
        throw new ApiError('Course not found for this lesson', 404);
      }

      await this.verifyInstructorAccess(courseId, userId);

      const updated = await this.repository.updateLesson(lessonId, data);
      
      // Update course last_content_update khi chỉnh lesson (content, title, description, etc.)
      await this.updateCourseLastContentUpdate(courseId);
      logger.info(`[updateLesson] Updated last_content_update for course ${courseId} after updating lesson ${lessonId}`);
      
      logger.info(`Lesson updated: ${lessonId}`);
      
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating lesson: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: string, userId: string) {
    try {
      const lesson = await this.repository.findLessonById(lessonId) as LessonInstance | null;
      if (!lesson) {
        throw new ApiError('Lesson not found', 404);
      }

      const courseId = (lesson as any).section?.course?.id;
      await this.verifyInstructorAccess(courseId, userId);

      await this.repository.deleteLesson(lessonId);
      
      // Update course last_content_update khi xóa lesson
      if (courseId) {
        await this.updateCourseLastContentUpdate(courseId);
      }
      
      logger.info(`Lesson deleted: ${lessonId}`);
      
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting lesson: ${error}`);
      throw error;
    }
  }

  /**
   * Reorder lessons in a section
   */
  async reorderLessons(
    sectionId: string,
    userId: string,
orders: ReorderItem[]
  ) {
    try {
      const section = await this.repository.findSectionById(sectionId) as SectionInstance | null;
      if (!section) {
        throw new ApiError('Section not found', 404);
      }

      await this.verifyInstructorAccess(section.course_id, userId);
      await this.repository.reorderLessons(sectionId, orders);
      logger.info(`Lessons reordered in section: ${sectionId}`);
      
      return true;
    } catch (error: unknown) {
      logger.error(`Error reordering lessons: ${error}`);
      throw error;
    }
  }

  // ===================================
  // LESSON MATERIAL SERVICES
  // ===================================

  /**
   * Add material to a lesson
   */
  async addMaterial(
    lessonId: string,
    userId: string,
  data: LessonMaterialInput
  ) {
    try {
      const lesson = await this.repository.findLessonById(lessonId) as LessonInstance | null;
      if (!lesson) {
        throw new ApiError('Lesson not found', 404);
      }

      const courseId = (lesson as any).section?.course?.id;
      await this.verifyInstructorAccess(courseId, userId);

      const material = await this.repository.createMaterial(lessonId, userId, data) as LessonMaterialInstance;
      logger.info(`Material added: ${material.id} to lesson ${lessonId}`);
      
      return material;
    } catch (error: unknown) {
      logger.error(`Error adding material: ${error}`);
      throw error;
    }
  }

  /**
   * Upload file lên Cloudflare R2 (hoặc Google Drive nếu R2 không có) và tạo LessonMaterial tương ứng
   */
  async addMaterialFromUpload(
    lessonId: string,
    userId: string,
    file: Express.Multer.File,
    options?: { description?: string }
  ) {
    try {
      const lesson = await this.repository.findLessonById(lessonId) as LessonInstance | null;
      if (!lesson) {
        throw new ApiError('Lesson not found', 404);
      }

      const courseId = (lesson as any).section?.course?.id;
      await this.verifyInstructorAccess(courseId, userId);

      let fileUrl: string;
      let fileName: string;

      // Ưu tiên sử dụng R2 (giống như video upload)
      if (this.r2Service) {
        try {
          const folder = `materials/${courseId}/${lessonId}`;
          const r2Result = await this.r2Service.uploadFile(file, {
            folder,
            userId
          });
          fileUrl = r2Result.url;
          fileName = r2Result.originalName || file.originalname;
          logger.info(`Material uploaded to R2: ${r2Result.path}`);
        } catch (r2Error) {
          logger.warn('R2 upload failed, falling back to Google Drive', r2Error);
          // Fallback to Google Drive nếu R2 fail
          const driveResult = await this.driveService.uploadCourseResource(
            file.buffer as Buffer,
            file.originalname,
            file.mimetype
          );
          fileUrl = driveResult.webViewLink || driveResult.webContentLink || '';
          fileName = driveResult.name;
        }
      } else {
        // Nếu R2 không được config, dùng Google Drive
        const driveResult = await this.driveService.uploadCourseResource(
          file.buffer as Buffer,
          file.originalname,
          file.mimetype
        );
        fileUrl = driveResult.webViewLink || driveResult.webContentLink || '';
        fileName = driveResult.name;
      }

      const input: LessonMaterialInput = {
        file_name: fileName,
        file_url: fileUrl,
        file_type: file.mimetype,
        file_size: file.size,
        file_extension: this.getFileExtension(file.originalname),
        description: options?.description,
        is_downloadable: true
      };

      const material = await this.repository.createMaterial(lessonId, userId, input) as LessonMaterialInstance;
      logger.info(`Material uploaded and added: ${material.id} to lesson ${lessonId}`);

      return material;
    } catch (error: unknown) {
      logger.error(`Error uploading material: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a material
   */
  async deleteMaterial(materialId: string, userId: string) {
    try {
      const material = await this.repository.findMaterialById(materialId) as LessonMaterialInstance | null;
      if (!material) {
        throw new ApiError('Material not found', 404);
      }

      const lesson = await this.repository.findLessonById(material.lesson_id);
      const courseId = (lesson as any)?.section?.course?.id;
      await this.verifyInstructorAccess(courseId, userId);

      await this.repository.deleteMaterial(materialId);
      logger.info(`Material deleted: ${materialId}`);
      
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting material: ${error}`);
      throw error;
    }
  }

  /**
   * Track material download
   */
  async trackDownload(materialId: string) {
    const material = await this.repository.incrementDownloadCount(materialId);
    if (!material) {
      throw new ApiError('Material not found', 404);
    }
    return material;
  }

  private getFileExtension(fileName: string): string | undefined {
    const parts = fileName.split('.');
    if (parts.length < 2) return undefined;
    return parts.pop();
  }

  // ===================================
  // LESSON PROGRESS SERVICES
  // ===================================

  /**
   * Update lesson progress for a user
   */
  async updateProgress(
    userId: string,
    lessonId: string,
data: LessonProgressInput
  ) {
    try {
      const progress = await this.repository.updateProgress(userId, lessonId, data);
      logger.info(`Progress updated for user ${userId} on lesson ${lessonId}`);
      return progress;
    } catch (error: unknown) {
      logger.error(`Error updating progress: ${error}`);
      throw error;
    }
  }

  /**
   * Mark lesson as completed
   */
  async markAsCompleted(userId: string, lessonId: string) {
    try {
      const progress = await this.repository.markLessonAsCompleted(userId, lessonId);
      logger.info(`Lesson marked as completed: ${lessonId} by user ${userId}`);
      return progress;
    } catch (error: unknown) {
      logger.error(`Error marking lesson as completed: ${error}`);
      throw error;
    }
  }

  /**
   * Get user's progress for a specific lesson
   */
  async getLessonProgress(userId: string, lessonId: string) {
    return await this.repository.getUserLessonProgress(userId, lessonId);
  }

  /**
   * Get user's bookmarked lessons in a course
   */
  async getBookmarkedLessons(userId: string, courseId: string) {
    // Allow if enrolled OR instructor OR admin
    await this.verifyEnrollmentOrInstructorLegacy(courseId, userId);
    return this.repository.getBookmarkedLessons(userId, courseId);
  }

  /**
   * Legacy helper: allow course instructor, admin/super_admin, or enrolled student
   */
  private async verifyEnrollmentOrInstructorLegacy(courseId: string, userId: string) {
    // Try instructor check
    try {
      await this.verifyInstructorAccess(courseId, userId);
      return;
    } catch (_) {
      // ignore, fallback to enrollment check
    }

    // Check enrollment
    const { CourseRepository } = await import('../course/course.repository');
    const courseRepository = new CourseRepository();
    const enrollment = await courseRepository.findEnrollment(courseId, userId);
    if (enrollment) return;

    // Check admin/super_admin
    const user = await courseRepository.findUserById(userId);
    if (user && (user.role === 'admin' || user.role === 'super_admin')) return;

    throw new (await import('../../errors/authorization.error')).AuthorizationError(
      'Only enrolled students or instructors/admins can access bookmarks'
    );
  }

  /**
   * Get user's overall progress for a course
   */
  async getCourseProgress(
    userId: string,
    courseId: string
): Promise<CourseProgressSummary> {
    const progress = await this.repository.getUserCourseProgress(userId, courseId) as any;
    
    // Update enrollment progress if completion changed
    if (progress.completion_percentage !== undefined) {
      try {
        const { Enrollment } = await import('../../models');
        const enrollment = await (Enrollment as any).findOne({
          where: {
            user_id: userId,
            course_id: courseId,
          },
        });
        
        if (enrollment) {
          const newProgress = Number(progress.completion_percentage);
          const oldProgress = Number(enrollment.progress_percentage) || 0;
          
          // Update progress if changed
          if (Math.abs(newProgress - oldProgress) > 0.01) {
            await enrollment.update({
              progress_percentage: newProgress,
              status: newProgress >= 100 ? 'completed' : enrollment.status,
              completion_date: newProgress >= 100 && !enrollment.completion_date 
                ? new Date() 
                : enrollment.completion_date,
            });
            
            // Auto-issue certificate if completion reaches 100%
            if (newProgress >= 100 && oldProgress < 100) {
              try {
                const { certificateAutoIssueService } = await import('../certificate/certificate.auto-issue.service');
                certificateAutoIssueService.checkAndIssueCertificate(
                  userId,
                  courseId,
                  enrollment.id
                ).catch((err: any) => {
                  logger.error('[CourseContentService] Auto-issue certificate error:', err);
                });
              } catch (certError) {
                logger.error('[CourseContentService] Certificate auto-issue error:', certError);
              }
            }
          }
        }
      } catch (error) {
        logger.error('[CourseContentService] Error updating enrollment progress:', error);
        // Don't throw - progress calculation should still return
      }
    }
    
    return progress;
  }

  /**
   * Get user's recent learning activity
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    return await this.repository.getRecentActivity(userId, limit);
  }

  // ===================================
  // COURSE CONTENT OVERVIEW
  // ===================================

  /**
   * Get complete course content overview
   */
  async getCourseContentOverview(
    courseId: string,
    userId?: string,
    includeUnpublished: boolean = false
): Promise<CourseContentOverview> {
    try {
      if (includeUnpublished && userId) {
        await this.verifyInstructorAccess(courseId, userId);
      }

      const sections = await this.repository.findSectionsByCourse(
        courseId,
        includeUnpublished
      );

      // Enrich lessons with is_practice
      const enrichedSections = await this.enrichLessonsWithPracticeFlag(sections, courseId);

      // Fetch quiz và assignment độc lập (không phải lesson)
      const { Quiz, Assignment } = await import('../../models');
      const { Op } = await import('sequelize');
      
      // Lấy tất cả section IDs - normalize để đảm bảo lấy đúng từ Sequelize instances
      const sectionIds = enrichedSections.map((s: any) => {
        // Nếu là Sequelize instance, convert sang plain object trước
        const sectionPlain = s.toJSON ? s.toJSON() : s;
        return sectionPlain.id || s.id;
      }).filter(Boolean); // Loại bỏ null/undefined
      
      logger.info(`[getCourseContentOverview] Course ${courseId}: Found ${enrichedSections.length} sections, ${sectionIds.length} section IDs:`, sectionIds);
      
      // Fetch quiz: tất cả quiz của course (course-level và section-level)
      // Nếu có sections, chỉ lấy quiz của các sections đó
      // Nếu không có sections, vẫn lấy tất cả quiz của course để có thể hiển thị course-level quizzes
      const quizWhere: any = {
        course_id: courseId
      };
      if (sectionIds.length > 0) {
        // Có sections: lấy course-level (section_id null) hoặc section-level (trong danh sách sections)
        quizWhere[Op.or] = [
          { section_id: null },
          { section_id: sectionIds }
        ];
      } else {
        // Không có sections: chỉ lấy course-level (section_id null)
        quizWhere.section_id = null;
      }
      if (!includeUnpublished) {
        quizWhere.is_published = true;
      }
      
      const allQuizzes = await (Quiz as any).findAll({
        where: quizWhere,
        attributes: ['id', 'title', 'description', 'duration_minutes', 'is_published', 'is_practice', 'section_id', 'course_id', 'created_at'],
        order: [['created_at', 'ASC']]
      });

      // Fetch assignment: LUÔN fetch tất cả assignments của course (course-level và section-level)
      // Không phụ thuộc vào sections được fetch hay không
      // Điều này đảm bảo assignments trong sections sẽ được fetch và gán vào sections sau này
      const assignmentWhere: any = {
        course_id: courseId
      };
      // Không thêm điều kiện section_id - fetch tất cả assignments của course
      // Sau đó sẽ filter và gán vào sections tương ứng dựa trên section_id
      if (!includeUnpublished) {
        assignmentWhere.is_published = true;
      }
      
      const allAssignments = await (Assignment as any).findAll({
        where: assignmentWhere,
        attributes: ['id', 'title', 'description', 'instructions', 'max_score', 'due_date', 'is_published', 'is_practice', 'section_id', 'course_id', 'submission_type', 'created_at'],
        order: [['created_at', 'ASC']]
      });
      
      logger.info(`[getCourseContentOverview] Course ${courseId}: Found ${allQuizzes.length} quizzes, ${allAssignments.length} assignments`);
      if (allAssignments.length > 0) {
        const assignmentsBySection = allAssignments.reduce((acc: any, a: any) => {
          const sectionId = a.section_id || 'course-level';
          if (!acc[sectionId]) acc[sectionId] = [];
          acc[sectionId].push(a.title);
          return acc;
        }, {});
        logger.info(`[getCourseContentOverview] Assignments breakdown:`, assignmentsBySection);
      }

      // Convert Sequelize instances to plain objects
      const quizzesPlain = allQuizzes.map((q: any) => q.toJSON ? q.toJSON() : q);
      const assignmentsPlain = allAssignments.map((a: any) => a.toJSON ? a.toJSON() : a);

      // Phân loại quiz/assignment: course-level và section-level
      const courseLevelQuizzes = quizzesPlain.filter((q: any) => !q.section_id && q.course_id === courseId);
      const courseLevelAssignments = assignmentsPlain.filter((a: any) => !a.section_id && a.course_id === courseId);

      // Thêm quiz/assignment vào sections tương ứng
      const sectionsWithContent = enrichedSections.map((section: any) => {
        // Convert section to plain object if it's a Sequelize instance
        const sectionPlain = section.toJSON ? section.toJSON() : section;
        const sectionId = sectionPlain.id || section.id;
        
        if (!sectionId) {
          logger.warn(`[getCourseContentOverview] Section missing ID:`, sectionPlain);
        }
        
        // Filter quizzes and assignments by section_id (convert to string for comparison)
        const sectionQuizzes = quizzesPlain.filter((q: any) => {
          const qSectionId = q.section_id ? String(q.section_id).trim() : null;
          const currentSectionId = sectionId ? String(sectionId).trim() : null;
          return qSectionId && currentSectionId && qSectionId === currentSectionId;
        });
        const sectionAssignments = assignmentsPlain.filter((a: any) => {
          const aSectionId = a.section_id ? String(a.section_id).trim() : null;
          const currentSectionId = sectionId ? String(sectionId).trim() : null;
          const match = aSectionId && currentSectionId && aSectionId === currentSectionId;
          if (match) {
            logger.debug(`[getCourseContentOverview] Assignment "${a.title}" matched section "${sectionPlain.title}" (${sectionId})`);
          }
          return match;
        });
        
        if (sectionAssignments.length > 0) {
          logger.info(`[getCourseContentOverview] Section "${sectionPlain.title}" (${sectionId}): Found ${sectionAssignments.length} assignments:`, 
            sectionAssignments.map((a: any) => a.title));
        } else {
          // Log để debug nếu không tìm thấy assignments
          const assignmentsForThisSection = assignmentsPlain.filter((a: any) => {
            const aSectionId = a.section_id ? String(a.section_id).trim() : null;
            return aSectionId && aSectionId === String(sectionId).trim();
          });
          if (assignmentsForThisSection.length > 0) {
            logger.warn(`[getCourseContentOverview] Section "${sectionPlain.title}" (${sectionId}): Found ${assignmentsForThisSection.length} assignments but filter failed. Section ID type: ${typeof sectionId}, Assignment section_id types:`, 
              assignmentsForThisSection.map((a: any) => typeof a.section_id));
          }
        }
        
        return {
          ...sectionPlain,
          quizzes: sectionQuizzes.length > 0 ? sectionQuizzes : [],
          assignments: sectionAssignments.length > 0 ? sectionAssignments : []
        };
      });

      const totalSections = sectionsWithContent.length;
      const totalLessons = sectionsWithContent.reduce(
        (sum: number, section: any) => sum + (section.lessons?.length || 0),
        0
      );
      const totalDuration = sectionsWithContent.reduce((sum: number, section: any) => {
        return sum + (section.lessons?.reduce(
          (lessonSum: number, lesson: any) => lessonSum + (lesson.duration_minutes || 0),
          0
        ) || 0);
      }, 0);
      const totalMaterials = sectionsWithContent.reduce((sum: number, section: any) => {
        return sum + (section.lessons?.reduce(
          (materialSum: number, lesson: any) => materialSum + (lesson.materials?.length || 0),
          0
        ) || 0);
      }, 0);

      return {
        course_id: courseId,
        total_sections: totalSections,
        total_lessons: totalLessons,
        total_duration_minutes: totalDuration,
        total_materials: totalMaterials,
        sections: sectionsWithContent as any,
        course_level_quizzes: courseLevelQuizzes.length > 0 ? courseLevelQuizzes : [],
        course_level_assignments: courseLevelAssignments.length > 0 ? courseLevelAssignments : []
      };
    } catch (error: unknown) {
      logger.error(`Error getting course content overview: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  /**
   * Enrich lessons with is_practice from quizzes and assignments
   */
  private async enrichLessonsWithPracticeFlag(
    sections: any[],
    courseId: string
  ): Promise<any[]> {
    // Fetch quizzes and assignments for this course
    const { Quiz, Assignment } = await import('../../models');
    const quizzes = await (Quiz as any).findAll({
      where: { course_id: courseId },
      attributes: ['id', 'title', 'is_practice']
    });
    const assignments = await (Assignment as any).findAll({
      where: { course_id: courseId },
      attributes: ['id', 'title', 'is_practice']
    });

    // Enrich lessons with is_practice from quiz/assignment
    return sections.map((section: any) => {
      if (section.lessons && section.lessons.length > 0) {
        const enrichedLessons = section.lessons.map((lesson: any) => {
          if (lesson.content_type === 'quiz') {
            // Find matching quiz by title
            const matchingQuiz = quizzes.find((q: any) => 
              q.title && lesson.title && 
              q.title.trim().toLowerCase() === lesson.title.trim().toLowerCase()
            );
            if (matchingQuiz) {
              return {
                ...lesson.toJSON ? lesson.toJSON() : lesson,
                is_practice: matchingQuiz.is_practice,
                quiz_id: matchingQuiz.id
              };
            }
          } else if (lesson.content_type === 'assignment') {
            // Find matching assignment by title
            const matchingAssignment = assignments.find((a: any) => 
              a.title && lesson.title && 
              a.title.trim().toLowerCase() === lesson.title.trim().toLowerCase()
            );
            if (matchingAssignment) {
              return {
                ...lesson.toJSON ? lesson.toJSON() : lesson,
                is_practice: matchingAssignment.is_practice,
                assignment_id: matchingAssignment.id
              };
            }
          }
          return lesson.toJSON ? lesson.toJSON() : lesson;
        });
        return {
          ...section.toJSON ? section.toJSON() : section,
          lessons: enrichedLessons
        };
      }
      return section.toJSON ? section.toJSON() : section;
    });
  }

  /**
   * Enrich a single lesson with practice flag and related quiz/assignment id
   */
  private async attachPracticeInfoToLesson(lesson: any, courseId: string): Promise<any> {
    if (!lesson || !lesson.content_type || (lesson.content_type !== 'quiz' && lesson.content_type !== 'assignment')) {
      return lesson;
    }

    const { Quiz, Assignment } = await import('../../models');

    const base = lesson.toJSON ? lesson.toJSON() : lesson;

    if (lesson.content_type === 'quiz') {
      // Ưu tiên match theo lesson_id (chuẩn mới)
      const quizByLesson = await (Quiz as any).findOne({
        where: { course_id: courseId, lesson_id: lesson.id },
        attributes: ['id', 'title', 'is_practice', 'lesson_id']
      });

      if (quizByLesson) {
        return {
          ...base,
          is_practice: quizByLesson.is_practice,
          quiz_id: quizByLesson.id
        };
      }

      // Backward compatible: fallback match theo title cho data cũ
      const quizzes = await (Quiz as any).findAll({
        where: { course_id: courseId },
        attributes: ['id', 'title', 'is_practice', 'lesson_id']
      });

      const matchingQuiz = quizzes.find((q: any) =>
        !q.lesson_id &&
        q.title && lesson.title &&
        q.title.trim().toLowerCase() === lesson.title.trim().toLowerCase()
      );

      if (matchingQuiz) {
        return {
          ...base,
          is_practice: matchingQuiz.is_practice,
          quiz_id: matchingQuiz.id
        };
      }
    }

    if (lesson.content_type === 'assignment') {
      // Ưu tiên match theo lesson_id
      const assignmentByLesson = await (Assignment as any).findOne({
        where: { course_id: courseId, lesson_id: lesson.id },
        attributes: ['id', 'title', 'is_practice', 'lesson_id']
      });

      if (assignmentByLesson) {
        return {
          ...base,
          is_practice: assignmentByLesson.is_practice,
          assignment_id: assignmentByLesson.id
        };
      }

      // Fallback title cho data cũ
      const assignments = await (Assignment as any).findAll({
        where: { course_id: courseId },
        attributes: ['id', 'title', 'is_practice', 'lesson_id']
      });

      const matchingAssignment = assignments.find((a: any) =>
        !a.lesson_id &&
        a.title && lesson.title &&
        a.title.trim().toLowerCase() === lesson.title.trim().toLowerCase()
      );

      if (matchingAssignment) {
        return {
          ...base,
          is_practice: matchingAssignment.is_practice,
          assignment_id: matchingAssignment.id
        };
      }
    }

    return base;
  }

  /**
   * Verify that user is the instructor of the course
   */
  private async verifyInstructorAccess(courseId: string, userId: string) {
    const { Course } = await import('../../models');
    const course = await Course.findByPk(courseId) as CourseInstance | null;
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    return course;
  }
}






