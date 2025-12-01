import { BaseRepository } from '../../repositories/base.repository';
import Section from '../../models/section.model';
import Lesson from '../../models/lesson.model';
import type { ModelStatic } from '../../types/sequelize-types';
import type { SectionInstance } from '../../types/model.types';
import logger from '../../utils/logger.util';

export class SectionRepository extends BaseRepository<SectionInstance> {
  constructor() {
    super('Section');
  }

  protected getModel(): ModelStatic<SectionInstance> {
    return Section as unknown as ModelStatic<SectionInstance>;
  }

  /**
   * Find all sections with pagination and filtering
   * Includes lessons for each section
   */
  async findAllWithPagination(options: {
    page: number;
    limit: number;
    course_id?: string;
    status?: string;
  }) {
    try {
      const { page, limit, course_id, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (course_id) whereClause.course_id = course_id;
      if (status) whereClause.status = status;

      const model = this.getModel();
      const { count, rows } = await (model as any).findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [
          ['order_index', 'ASC'], 
          ['created_at', 'DESC'],
          [{ model: Lesson, as: 'lessons' }, 'order_index', 'ASC']
        ],
        include: [
          {
            model: Lesson,
            as: 'lessons',
            required: false,
            order: [['order_index', 'ASC']]
          }
        ],
        distinct: true // Important for correct count with includes
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
      logger.error('Error finding sections with pagination:', error);
      throw error;
    }
  }
}
