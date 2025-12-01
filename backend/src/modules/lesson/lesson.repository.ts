import { BaseRepository } from '../../repositories/base.repository';
import Lesson from '../../models/lesson.model';
import type { ModelStatic } from '../../types/sequelize-types';
import type { LessonInstance } from '../../types/model.types';
import logger from '../../utils/logger.util';

export class LessonRepository extends BaseRepository<LessonInstance> {
  constructor() {
    super('Lesson');
  }

  protected getModel(): ModelStatic<LessonInstance> {
    return Lesson as unknown as ModelStatic<LessonInstance>;
  }

  /**
   * Get max order_index for a section
   */
  async getMaxOrderIndex(sectionId: string): Promise<number> {
    try {
      const model = this.getModel();
      const result = await (model as any).findOne({
        where: { section_id: sectionId },
        order: [['order_index', 'DESC']],
        attributes: ['order_index']
      });
      return result?.order_index ?? -1;
    } catch (error) {
      logger.error('Error getting max order_index:', error);
      return -1;
    }
  }

  /**
   * Find all lessons with pagination and filtering
   */
  async findAllWithPagination(options: {
    page: number;
    limit: number;
    course_id?: string;
    section_id?: string;
    status?: string;
  }) {
    try {
      const { page, limit, course_id, section_id, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (course_id) whereClause.course_id = course_id;
      if (section_id) whereClause.section_id = section_id;
      if (status) whereClause.status = status;

      const { count, rows } = await this.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['order_index', 'ASC'], ['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding lessons with pagination:', error);
      throw error;
    }
  }
}
