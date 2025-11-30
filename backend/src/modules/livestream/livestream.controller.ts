import { Request, Response, NextFunction } from 'express';
import { LiveStreamService } from './livestream.service';
import { responseUtils } from '../../utils/response.util';
import { ListLiveSessionsQuery } from './livestream.types';

export class LiveStreamController {
  private service: LiveStreamService;

  constructor() {
    this.service = new LiveStreamService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hostUserId = req.user!.userId;
      const session = await this.service.createSession(hostUserId, req.body);
      return responseUtils.success(res, session, 'Live session created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: ListLiveSessionsQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as any,
        search: req.query.search as string | undefined,
      };
      const result = await this.service.listSessions(query);
      return responseUtils.success(res, result, 'Live sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  mySessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hostUserId = req.user!.userId;
      const query: ListLiveSessionsQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as any,
        search: req.query.search as string | undefined,
      };
      const result = await this.service.listHostSessions(hostUserId, query);
      return responseUtils.success(res, result, 'Live sessions retrieved successfully');
    } catch (error) {
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
      
      // Emit SESSION_ENDED event if status is 'ended'
      if (req.body.status === 'ended') {
        const livestreamGateway = (global as any).livestreamGateway;
        if (livestreamGateway) {
          livestreamGateway.emitSessionEnded(sessionId);
        }
      }
      
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

  leave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { sessionId } = req.params;
      const attendance = await this.service.leave(sessionId, userId);
      return responseUtils.success(res, attendance, 'Left live session');
    } catch (error) {
      next(error);
    }
  };

  getViewers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const data = await this.service.getSessionViewers(sessionId);
      return responseUtils.success(res, data, 'Live session viewers retrieved');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      await this.service.deleteSession(sessionId);
      return responseUtils.success(res, null, 'Live session deleted');
    } catch (error) {
      next(error);
    }
  };

  uploadThumbnail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;
      const file = req.file;
      if (!file) {
        return responseUtils.sendValidationError(res, 'Thumbnail file is required');
      }
      const session = await this.service.updateThumbnail(sessionId, file as any, userId);
      return responseUtils.success(res, session, 'Thumbnail updated');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get ICE servers for WebRTC (with Twilio NTS support)
   * This endpoint generates a Twilio NTS token and returns ICE servers
   * that can be used for cross-network WebRTC connections
   */
  getIceServers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const iceServers = await this.service.getTwilioIceServers();
      return responseUtils.success(res, { iceServers }, 'ICE servers retrieved');
    } catch (error) {
      next(error);
    }
  };
}

































