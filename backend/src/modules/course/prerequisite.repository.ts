import CoursePrerequisite from '../../models/course-prerequisite.model';
import Course from '../../models/course.model';
import Enrollment from '../../models/enrollment.model';
import logger from '../../utils/logger.util';
import type { ModelStatic } from '../../types/sequelize-types';
import type { CoursePrerequisiteInstance } from '../../types/model.types';

export class PrerequisiteRepository {
  /**
   * Get all prerequisites for a course
   */
  async getPrerequisitesByCourseId(courseId: string): Promise<CoursePrerequisiteInstance[]> {
    try {
      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      const prerequisites = await CoursePrerequisiteModel.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: Course,
            as: 'prerequisiteCourse',
            attributes: ['id', 'title', 'level', 'status', 'thumbnail', 'short_description'],
          },
        ],
        order: [['order_index', 'ASC'], ['created_at', 'ASC']],
      });
      return prerequisites;
    } catch (error: unknown) {
      logger.error('Error getting prerequisites by course ID:', error);
      throw error;
    }
  }

  /**
   * Get prerequisite by ID
   */
  async getPrerequisiteById(id: string): Promise<CoursePrerequisiteInstance | null> {
    try {
      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      return await CoursePrerequisiteModel.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'prerequisiteCourse',
            attributes: ['id', 'title', 'level', 'status'],
          },
        ],
      });
    } catch (error: unknown) {
      logger.error('Error getting prerequisite by ID:', error);
      throw error;
    }
  }

  /**
   * Create prerequisite
   */
  async createPrerequisite(data: {
    course_id: string;
    prerequisite_course_id: string;
    is_required?: boolean;
    order_index?: number;
  }): Promise<CoursePrerequisiteInstance> {
    try {
      // Check if prerequisite already exists
      const existing = await this.findPrerequisite(data.course_id, data.prerequisite_course_id);
      if (existing) {
        throw new Error('Prerequisite already exists');
      }

      // Check if course is trying to prerequisite itself
      if (data.course_id === data.prerequisite_course_id) {
        throw new Error('Course cannot be a prerequisite of itself');
      }

      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      return await CoursePrerequisiteModel.create({
        course_id: data.course_id,
        prerequisite_course_id: data.prerequisite_course_id,
        is_required: data.is_required ?? true,
        order_index: data.order_index ?? 0,
      });
    } catch (error: unknown) {
      logger.error('Error creating prerequisite:', error);
      throw error;
    }
  }

  /**
   * Find specific prerequisite
   */
  async findPrerequisite(courseId: string, prerequisiteCourseId: string): Promise<CoursePrerequisiteInstance | null> {
    try {
      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      return await CoursePrerequisiteModel.findOne({
        where: {
          course_id: courseId,
          prerequisite_course_id: prerequisiteCourseId,
        },
      });
    } catch (error: unknown) {
      logger.error('Error finding prerequisite:', error);
      throw error;
    }
  }

  /**
   * Delete prerequisite
   */
  async deletePrerequisite(id: string): Promise<void> {
    try {
      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      await CoursePrerequisiteModel.destroy({
        where: { id },
      });
    } catch (error: unknown) {
      logger.error('Error deleting prerequisite:', error);
      throw error;
    }
  }

  /**
   * Bulk create prerequisites
   */
  async bulkCreatePrerequisites(
    courseId: string,
    prerequisites: Array<{ prerequisite_course_id: string; is_required?: boolean; order_index?: number }>
  ): Promise<CoursePrerequisiteInstance[]> {
    try {
      const CoursePrerequisiteModel = CoursePrerequisite as unknown as ModelStatic<CoursePrerequisiteInstance>;
      
      // Check for duplicates and self-references
      const prerequisiteIds = prerequisites.map(p => p.prerequisite_course_id);
      if (prerequisiteIds.includes(courseId)) {
        throw new Error('Course cannot be a prerequisite of itself');
      }

      const uniqueIds = new Set(prerequisiteIds);
      if (uniqueIds.size !== prerequisiteIds.length) {
        throw new Error('Duplicate prerequisites found');
      }

      // Check existing prerequisites
      const existing = await CoursePrerequisiteModel.findAll({
        where: {
          course_id: courseId,
          prerequisite_course_id: prerequisiteIds,
        },
      });

      if (existing.length > 0) {
        throw new Error('Some prerequisites already exist');
      }

      // Create prerequisites
      const created = await Promise.all(
        prerequisites.map((prereq, index) =>
          CoursePrerequisiteModel.create({
            course_id: courseId,
            prerequisite_course_id: prereq.prerequisite_course_id,
            is_required: prereq.is_required ?? true,
            order_index: prereq.order_index ?? index,
          })
        )
      );

      return created;
    } catch (error: unknown) {
      logger.error('Error bulk creating prerequisites:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed required prerequisites
   */
  async checkPrerequisitesSatisfied(courseId: string, userId: string): Promise<{
    satisfied: boolean;
    missingPrerequisites: Array<{ id: string; title: string; is_required: boolean }>;
  }> {
    try {
      const prerequisites = await this.getPrerequisitesByCourseId(courseId);
      const requiredPrerequisites = prerequisites.filter(p => p.is_required);

      if (requiredPrerequisites.length === 0) {
        return { satisfied: true, missingPrerequisites: [] };
      }

      // Get user's completed enrollments
      const EnrollmentModel = Enrollment as unknown as ModelStatic<any>;
      const completedEnrollments = await EnrollmentModel.findAll({
        where: {
          user_id: userId,
          status: 'completed',
          course_id: requiredPrerequisites.map(p => p.prerequisite_course_id),
        },
        attributes: ['course_id'],
      });

      const completedCourseIds = new Set(completedEnrollments.map((e: any) => e.course_id));

      const missingPrerequisites = requiredPrerequisites
        .filter(p => !completedCourseIds.has(p.prerequisite_course_id))
        .map(p => ({
          id: p.prerequisite_course_id,
          title: (p as any).prerequisiteCourse?.title || 'Unknown Course',
          is_required: p.is_required,
        }));

      return {
        satisfied: missingPrerequisites.length === 0,
        missingPrerequisites,
      };
    } catch (error: unknown) {
      logger.error('Error checking prerequisites satisfied:', error);
      throw error;
    }
  }
}

