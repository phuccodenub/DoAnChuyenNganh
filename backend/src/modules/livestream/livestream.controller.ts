import { Request, Response, NextFunction } from 'express';
import { LiveStreamService } from './livestream.service';
import { responseUtils } from '../../utils/response.util';

export class LiveStreamController {
  private service: LiveStreamService;

  constructor() {
    this.service = new LiveStreamService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user!.userId;
      const session = await this.service.createSession(instructorId, req.body);
      return responseUtils.success(res, session, 'Live session created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const session = await this.service.getSession(sessionId);
      return responseUtils.success(res, session, 'Live session retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const session = await this.service.updateStatus(sessionId, req.body);
      return responseUtils.success(res, session, 'Live session updated');
    } catch (error: unknown) {
      next(error);
    }
  };

  join = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { sessionId } = req.params;
      const attendance = await this.service.join(sessionId, userId);
      return responseUtils.success(res, attendance, 'Joined live session');
    } catch (error: unknown) {
      next(error);
    }
  };
}






























