import { CourseContentRepository } from './course-content.repository';
import type { SectionInput, SectionWithLessons, ReorderItem, LessonInput, LessonMaterialInput, LessonProgressInput, CourseProgressSummary, CourseContentOverview } from './course-content.types';
import type { SectionInstance, LessonInstance, LessonMaterialInstance, CourseInstance } from '../../types/model.types';
import { ApiError } from '../../errors/api.error';
import { DatabaseError } from '../../errors/database.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import { GoogleDriveService } from '../../services/storage/google-drive.service';

/**
 * Course Content Service
 * Business logic for course content management
 */
export class CourseContentService {
  private repository: CourseContentRepository;
  private driveService: GoogleDriveService;

  constructor() {
    this.repository = new CourseContentRepository();
    this.driveService = new GoogleDriveService();
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
      
      return sections as any;
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

    // If lesson is not published, verify instructor access
    if (!lesson.is_published && userId) {
      const courseId = (lesson as any).section?.course?.id;
      if (courseId) {
        await this.verifyInstructorAccess(courseId, userId);
      }
    }

    return lesson;
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

      const courseId = (lesson as any).section?.course?.id;
      await this.verifyInstructorAccess(courseId, userId);

      const updated = await this.repository.updateLesson(lessonId, data);
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
   * Upload file lên Google Drive và tạo LessonMaterial tương ứng
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

      // Upload file lên Google Drive (thư mục Resources)
      const driveResult = await this.driveService.uploadCourseResource(
        file.buffer as Buffer,
        file.originalname,
        file.mimetype
      );

      const input: LessonMaterialInput = {
        file_name: driveResult.name,
        file_url: driveResult.webViewLink || driveResult.webContentLink || '',
        file_type: file.mimetype,
        file_size: file.size,
        file_extension: this.getFileExtension(file.originalname),
        description: options?.description,
        is_downloadable: true
      };

      const material = await this.repository.createMaterial(lessonId, userId, input) as LessonMaterialInstance;
      logger.info(`Material uploaded to Google Drive and added: ${material.id} to lesson ${lessonId}`);

      return material;
    } catch (error: unknown) {
      logger.error(`Error uploading material to Google Drive: ${error}`);
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
   * Get user's overall progress for a course
   */
  async getCourseProgress(
    userId: string,
    courseId: string
): Promise<CourseProgressSummary> {
    return await this.repository.getUserCourseProgress(userId, courseId) as any;
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

      const totalSections = sections.length;
      const totalLessons = sections.reduce(
        (sum: number, section: any) => sum + (section.lessons?.length || 0),
        0
      );
      const totalDuration = sections.reduce((sum: number, section: any) => {
        return sum + (section.lessons?.reduce(
          (lessonSum: number, lesson: any) => lessonSum + (lesson.duration_minutes || 0),
          0
        ) || 0);
      }, 0);
      const totalMaterials = sections.reduce((sum: number, section: any) => {
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
        sections: sections as any
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






