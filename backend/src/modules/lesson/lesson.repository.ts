import { BaseRepository } from '../../repositories/base.repository';
import Lesson from '../../models/lesson.model';
import logger from '../../utils/logger.util';

export class LessonRepository extends BaseRepository<Lesson> {
  constructor() {
    super(Lesson);
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
        order: [['created_at', 'DESC']]
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
