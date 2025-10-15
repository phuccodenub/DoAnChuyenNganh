import { Request, Response, NextFunction } from 'express';
import { GradeService } from './grade.service';
import { responseUtils } from '../../utils/response.util';

export class GradeController {
  private service: GradeService;

  constructor() {
    this.service = new GradeService();
  }

  upsertGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user!.userId;
      const result = await this.service.upsertGrade(instructorId, req.body);
      return responseUtils.success(res, result, 'Grade upserted');
    } catch (error: unknown) {
      next(error);
    }
  };

  upsertFinalGrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user!.userId;
      const result = await this.service.upsertGrade(instructorId, req.body);
      return responseUtils.success(res, result, 'Final grade upserted');
    } catch (error: unknown) {
      next(error);
    }
  };

  getUserGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, courseId } = req.params;
      const rows = await this.service.getUserGrades(userId, courseId);
      return responseUtils.success(res, rows, 'Grades retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };
}




