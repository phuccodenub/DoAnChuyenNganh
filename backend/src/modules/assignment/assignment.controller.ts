import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from './assignment.service';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class AssignmentController {
  private assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  /**
   * Get all assignments with pagination and filtering
   */
  async getAllAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, course_id, lesson_id, status } = req.query;
      
      const result = await this.assignmentService.getAllAssignments({
        page: Number(page),
        limit: Number(limit),
        course_id: course_id as string,
        lesson_id: lesson_id as string,
        status: status as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignments retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAllAssignments controller:', error);
      next(error);
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const assignment = await this.assignmentService.getAssignmentById(id);
      
      if (!assignment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Assignment not found');
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment retrieved successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in getAssignmentById controller:', error);
      next(error);
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignmentData = req.body;
      
      const assignment = await this.assignmentService.createAssignment(assignmentData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in createAssignment controller:', error);
      next(error);
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const assignment = await this.assignmentService.updateAssignment(id, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in updateAssignment controller:', error);
      next(error);
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.assignmentService.deleteAssignment(id);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteAssignment controller:', error);
      next(error);
    }
  }
}