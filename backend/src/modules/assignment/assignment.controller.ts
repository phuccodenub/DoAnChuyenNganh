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

  // Aliases used by routes expecting different method names
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const assignment = await this.assignmentService.createAssignment(userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({ success: true, message: 'Assignment created successfully', data: assignment });
    } catch (error) {
      logger.error('Error in create controller:', error);
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string | undefined;
      const assignment = await this.assignmentService.getAssignment(req.params.id || req.params.assignmentId, userId);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({ success: true, message: 'Assignment retrieved successfully', data: assignment });
    } catch (error) {
      logger.error('Error in getOne controller:', error);
      next(error);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const submission = await this.assignmentService.submitAssignment(req.params.assignmentId, userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({ success: true, message: 'Assignment submitted successfully', data: submission });
    } catch (error) {
      logger.error('Error in submit controller:', error);
      next(error);
    }
  };

  grade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const result = await this.assignmentService.gradeSubmission(req.params.submissionId, userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({ success: true, message: 'Submission graded successfully', data: result });
    } catch (error) {
      logger.error('Error in grade controller:', error);
      next(error);
    }
  };

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
      const assignment = await this.assignmentService.getAssignment(id);
      
      if (!assignment) {
        throw new ApiError('Assignment not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
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
      const userId = (req as any).user?.id as string;
      const assignment = await this.assignmentService.createAssignment(userId, assignmentData);

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
      const userId = (req as any).user?.id as string;
      const assignment = await this.assignmentService.updateAssignment(id, userId, updateData);

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
      const userId = (req as any).user?.id as string;
      await this.assignmentService.deleteAssignment(id, userId);

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