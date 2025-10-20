import { BaseRepository } from '../../repositories/base.repository';
import Assignment from '../../models/assignment.model';
import logger from '../../utils/logger.util';

export class AssignmentRepository extends BaseRepository<Assignment> {
  constructor() {
    super(Assignment);
  }

  /**
   * Find all assignments with pagination and filtering
   */
  async findAllWithPagination(options: {
    page: number;
    limit: number;
    course_id?: string;
    lesson_id?: string;
    status?: string;
  }) {
    try {
      const { page, limit, course_id, lesson_id, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (course_id) whereClause.course_id = course_id;
      if (lesson_id) whereClause.lesson_id = lesson_id;
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
      logger.error('Error finding assignments with pagination:', error);
      throw error;
    }
  }
}