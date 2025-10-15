import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from './assignment.service';
import { responseUtils } from '../../utils/response.util';

export class AssignmentController {
  private service: AssignmentService;

  constructor() {
    this.service = new AssignmentService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const assignment = await this.service.createAssignment(userId, req.body);
      return responseUtils.success(res, assignment, 'Assignment created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await this.service.getAssignment(assignmentId);
      return responseUtils.success(res, assignment, 'Assignment retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { assignmentId } = req.params;
      const submission = await this.service.submitAssignment(assignmentId, userId, req.body);
      return responseUtils.success(res, submission, 'Submission created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  grade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const graderId = req.user!.userId;
      const { submissionId } = req.params;
      const graded = await this.service.gradeSubmission(submissionId, graderId, req.body);
      return responseUtils.success(res, graded, 'Submission graded');
    } catch (error: unknown) {
      next(error);
    }
  };
}




