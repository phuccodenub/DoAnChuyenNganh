import { AssignmentRepository } from './assignment.repository';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class AssignmentService {
  private assignmentRepository: AssignmentRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
  }

  /**
   * Get all assignments with pagination and filtering
   */
  async getAllAssignments(options: {
    page: number;
    limit: number;
    course_id?: string;
    lesson_id?: string;
    status?: string;
  }) {
    try {
      logger.info('Getting all assignments', options);
      
      const result = await this.assignmentRepository.findAllWithPagination(options);
      
      logger.info('Assignments retrieved successfully', { count: result.data.length });
      return result;
    } catch (error) {
      logger.error('Error getting all assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string) {
    try {
      logger.info('Getting assignment by ID', { assignmentId });
      
      const assignment = await this.assignmentRepository.findById(assignmentId);
      
      if (!assignment) {
        logger.error('Assignment not found', { assignmentId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Assignment not found');
      }

      logger.info('Assignment retrieved successfully', { assignmentId });
      return assignment;
    } catch (error) {
      logger.error('Error getting assignment by ID:', error);
      throw error;
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(assignmentData: any) {
    try {
      logger.info('Creating new assignment', { title: assignmentData.title });
      
      const assignment = await this.assignmentRepository.create(assignmentData);
      
      logger.info('Assignment created successfully', { assignmentId: assignment.id });
      return assignment;
    } catch (error) {
      logger.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(assignmentId: string, updateData: any) {
    try {
      logger.info('Updating assignment', { assignmentId });
      
      const assignment = await this.assignmentRepository.update(assignmentId, updateData);
      
      if (!assignment) {
        logger.error('Assignment not found for update', { assignmentId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Assignment not found');
      }

      logger.info('Assignment updated successfully', { assignmentId });
      return assignment;
    } catch (error) {
      logger.error('Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string) {
    try {
      logger.info('Deleting assignment', { assignmentId });
      
      const deleted = await this.assignmentRepository.delete(assignmentId);
      
      if (!deleted) {
        logger.error('Assignment not found for deletion', { assignmentId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Assignment not found');
      }

      logger.info('Assignment deleted successfully', { assignmentId });
      return true;
    } catch (error) {
      logger.error('Error deleting assignment:', error);
      throw error;
    }
  }
}