import { PrerequisiteRepository } from './prerequisite.repository';
import Course from '../../models/course.model';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';
import type { CoursePrerequisiteInstance } from '../../types/model.types';

export class PrerequisiteService {
  private repository: PrerequisiteRepository;

  constructor() {
    this.repository = new PrerequisiteRepository();
  }

  /**
   * Get prerequisites for a course
   */
  async getPrerequisites(courseId: string, userId?: string, userRole?: string): Promise<any[]> {
    try {
      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check access: instructor, admin, or public if course is published
      const isOwner = (course as any).instructor_id === userId;
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';
      const isPublished = (course as any).status === 'published';

      if (!isOwner && !isAdmin && !isPublished) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to view prerequisites');
      }

      const prerequisites = await this.repository.getPrerequisitesByCourseId(courseId);
      
      // Normalize for frontend
      return prerequisites.map((prereq: any) => ({
        id: prereq.id,
        course_id: prereq.course_id,
        prerequisite_course_id: prereq.prerequisite_course_id,
        is_required: prereq.is_required,
        order_index: prereq.order_index,
        prerequisite_course: prereq.prerequisiteCourse ? {
          id: prereq.prerequisiteCourse.id,
          title: prereq.prerequisiteCourse.title,
          level: prereq.prerequisiteCourse.level,
          status: prereq.prerequisiteCourse.status,
          thumbnail: prereq.prerequisiteCourse.thumbnail,
          short_description: prereq.prerequisiteCourse.short_description,
        } : null,
        created_at: prereq.created_at,
        updated_at: prereq.updated_at,
      }));
    } catch (error: unknown) {
      logger.error('Error getting prerequisites:', error);
      throw error;
    }
  }

  /**
   * Create prerequisite (instructor/admin only)
   */
  async createPrerequisite(
    courseId: string,
    data: {
      prerequisite_course_id: string;
      is_required?: boolean;
      order_index?: number;
    },
    userId: string,
    userRole?: string
  ): Promise<any> {
    try {
      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check authorization
      const isOwner = (course as any).instructor_id === userId;
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';

      if (!isOwner && !isAdmin) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to manage prerequisites');
      }

      // Check if prerequisite course exists
      const prerequisiteCourse = await Course.findByPk(data.prerequisite_course_id);
      if (!prerequisiteCourse) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Prerequisite course not found');
      }

      const prerequisite = await this.repository.createPrerequisite({
        course_id: courseId,
        prerequisite_course_id: data.prerequisite_course_id,
        is_required: data.is_required ?? true,
        order_index: data.order_index ?? 0,
      });

      // Reload with associations
      const fullPrerequisite = await this.repository.getPrerequisiteById(prerequisite.id);
      
      return {
        id: fullPrerequisite!.id,
        course_id: fullPrerequisite!.course_id,
        prerequisite_course_id: fullPrerequisite!.prerequisite_course_id,
        is_required: fullPrerequisite!.is_required,
        order_index: fullPrerequisite!.order_index,
        prerequisite_course: (fullPrerequisite as any).prerequisiteCourse ? {
          id: (fullPrerequisite as any).prerequisiteCourse.id,
          title: (fullPrerequisite as any).prerequisiteCourse.title,
          level: (fullPrerequisite as any).prerequisiteCourse.level,
          status: (fullPrerequisite as any).prerequisiteCourse.status,
          thumbnail: (fullPrerequisite as any).prerequisiteCourse.thumbnail,
          short_description: (fullPrerequisite as any).prerequisiteCourse.short_description,
        } : null,
        created_at: fullPrerequisite!.created_at,
        updated_at: fullPrerequisite!.updated_at,
      };
    } catch (error: unknown) {
      logger.error('Error creating prerequisite:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, (error as Error).message);
    }
  }

  /**
   * Bulk create prerequisites
   */
  async bulkCreatePrerequisites(
    courseId: string,
    prerequisites: Array<{ prerequisite_course_id: string; is_required?: boolean; order_index?: number }>,
    userId: string,
    userRole?: string
  ): Promise<any[]> {
    try {
      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check authorization
      const isOwner = (course as any).instructor_id === userId;
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';

      if (!isOwner && !isAdmin) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to manage prerequisites');
      }

      // Verify all prerequisite courses exist
      const prerequisiteIds = prerequisites.map(p => p.prerequisite_course_id);
      const prerequisiteCourses = await Course.findAll({
        where: { id: prerequisiteIds },
        attributes: ['id'],
      });

      if (prerequisiteCourses.length !== prerequisiteIds.length) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Some prerequisite courses not found');
      }

      const created = await this.repository.bulkCreatePrerequisites(courseId, prerequisites);
      
      // Reload with associations
      const fullPrerequisites = await Promise.all(
        created.map(p => this.repository.getPrerequisiteById(p.id))
      );

      return fullPrerequisites
        .filter(p => p !== null)
        .map((prereq: any) => ({
          id: prereq!.id,
          course_id: prereq!.course_id,
          prerequisite_course_id: prereq!.prerequisite_course_id,
          is_required: prereq!.is_required,
          order_index: prereq!.order_index,
          prerequisite_course: prereq!.prerequisiteCourse ? {
            id: prereq!.prerequisiteCourse.id,
            title: prereq!.prerequisiteCourse.title,
            level: prereq!.prerequisiteCourse.level,
            status: prereq!.prerequisiteCourse.status,
            thumbnail: prereq!.prerequisiteCourse.thumbnail,
            short_description: prereq!.prerequisiteCourse.short_description,
          } : null,
          created_at: prereq!.created_at,
          updated_at: prereq!.updated_at,
        }));
    } catch (error: unknown) {
      logger.error('Error bulk creating prerequisites:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, (error as Error).message);
    }
  }

  /**
   * Delete prerequisite
   */
  async deletePrerequisite(
    courseId: string,
    prerequisiteId: string,
    userId: string,
    userRole?: string
  ): Promise<void> {
    try {
      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check authorization
      const isOwner = (course as any).instructor_id === userId;
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';

      if (!isOwner && !isAdmin) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to manage prerequisites');
      }

      // Check if prerequisite exists and belongs to course
      const prerequisite = await this.repository.getPrerequisiteById(prerequisiteId);
      if (!prerequisite) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Prerequisite not found');
      }

      if (prerequisite.course_id !== courseId) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, 'Prerequisite does not belong to this course');
      }

      await this.repository.deletePrerequisite(prerequisiteId);
    } catch (error: unknown) {
      logger.error('Error deleting prerequisite:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Check prerequisites satisfaction for enrollment
   */
  async checkPrerequisitesForEnrollment(courseId: string, userId: string): Promise<{
    satisfied: boolean;
    missingPrerequisites: Array<{ id: string; title: string; is_required: boolean }>;
  }> {
    try {
      return await this.repository.checkPrerequisitesSatisfied(courseId, userId);
    } catch (error: unknown) {
      logger.error('Error checking prerequisites for enrollment:', error);
      throw error;
    }
  }
}

