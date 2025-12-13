import { Request, Response, NextFunction } from 'express';
import { responseUtils } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ActivityLogsService } from './activity-logs.service';

export class ActivityLogsAdminController {
  private service: ActivityLogsService;

  constructor() {
    this.service = new ActivityLogsService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);

      const filters = {
        user_id: (req.query.user_id as string) || undefined,
        action: (req.query.action as string) || undefined,
        resource_type: (req.query.resource_type as string) || undefined,
        status: (req.query.status as 'success' | 'failed') || undefined,
        date_from: (req.query.date_from as string) || undefined,
        date_to: (req.query.date_to as string) || undefined,
      };

      const result = await this.service.list(page, limit, filters);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  };

  detail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { logId } = req.params;
      const log = await this.service.getById(logId);
      if (!log) {
        return responseUtils.sendNotFound(res, 'Không tìm thấy nhật ký');
      }
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, log);
    } catch (error) {
      next(error);
    }
  };

  clearOld = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const olderThanDays = typeof req.body?.older_than_days === 'number' ? req.body.older_than_days : 90;
      const deletedCount = await this.service.clearOld(olderThanDays);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, { deleted_count: deletedCount });
    } catch (error) {
      next(error);
    }
  };

  export = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = ((req.query.format as string) || 'csv') as 'csv' | 'json';
      const filters = {
        action: (req.query.action as string) || undefined,
        resource_type: (req.query.resource_type as string) || undefined,
        date_from: (req.query.date_from as string) || undefined,
        date_to: (req.query.date_to as string) || undefined,
      };

      if (format === 'json') {
        const data = await this.service.exportJson(filters);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.json"');
        res.status(200).send(JSON.stringify(data, null, 2));
        return;
      }

      const csv = await this.service.exportCsv(filters);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };
}
