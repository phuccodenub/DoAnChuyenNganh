import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { getModelSequelize } from '../../utils/model-extension.util';
import { responseUtils } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

const sequelize = getModelSequelize();

function toISODate(value: unknown): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export class ReportsAdminController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [totalsRow] = (await sequelize.query(
        `
        SELECT
          (SELECT COUNT(*)::bigint FROM users) AS total_users,
          (SELECT COUNT(*)::bigint FROM courses) AS total_courses,
          (SELECT COUNT(*)::bigint FROM enrollments) AS total_enrollments,
          (
            SELECT COALESCE(SUM(
              (CASE WHEN c.is_free THEN 0 ELSE COALESCE(c.price, 0) END) * 1
            ), 0)::numeric
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
          ) AS total_revenue
        `,
        { type: QueryTypes.SELECT },
      )) as any[];

      const [activeRow] = (await sequelize.query(
        `
        SELECT
          (SELECT COUNT(DISTINCT id)::bigint FROM users WHERE last_login >= :startOfToday) AS active_users_today,
          (SELECT COUNT(DISTINCT id)::bigint FROM users WHERE last_login >= :weekAgo) AS active_users_week,
          (SELECT COUNT(DISTINCT id)::bigint FROM users WHERE last_login >= :monthAgo) AS active_users_month
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { startOfToday, weekAgo, monthAgo },
        },
      )) as any[];

      const [ratingRow] = (await sequelize.query(
        `
        SELECT
          COALESCE(AVG(NULLIF(e.rating, 0)), 0)::float AS average_course_rating,
          COALESCE(
            (SUM(CASE WHEN (e.status = 'completed' OR COALESCE(e.progress_percentage, 0) >= 100) THEN 1 ELSE 0 END)::float)
            / NULLIF(COUNT(*)::float, 0),
            0
          )::float AS completion_rate
        FROM enrollments e
        `,
        { type: QueryTypes.SELECT },
      )) as any[];

      const payload = {
        total_users: toNumber(totalsRow?.total_users),
        total_courses: toNumber(totalsRow?.total_courses),
        total_enrollments: toNumber(totalsRow?.total_enrollments),
        total_revenue: toNumber(totalsRow?.total_revenue),
        active_users_today: toNumber(activeRow?.active_users_today),
        active_users_week: toNumber(activeRow?.active_users_week),
        active_users_month: toNumber(activeRow?.active_users_month),
        average_course_rating: toNumber(ratingRow?.average_course_rating),
        completion_rate: toNumber(ratingRow?.completion_rate),
      };

      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, payload);
    } catch (error: unknown) {
      logger.error('Error getting admin report stats:', error);
      next(error);
    }
  }

  async getTopCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? '10'), 10) || 10));

      const rows = (await sequelize.query(
        `
        SELECT
          c.title AS course_name,
          COUNT(e.id)::integer AS enrollments,
          ((CASE WHEN c.is_free THEN 0 ELSE COALESCE(c.price, 0) END) * COUNT(e.id))::numeric AS revenue,
          COALESCE(AVG(NULLIF(e.rating, 0)), 0)::float AS rating
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, c.title, c.is_free, c.price
        ORDER BY enrollments DESC, c.created_at DESC
        LIMIT :limit
        `,
        { type: QueryTypes.SELECT, replacements: { limit } },
      )) as any[];

      const data = rows.map((r) => ({
        course_name: String(r.course_name ?? ''),
        enrollments: toNumber(r.enrollments),
        revenue: toNumber(r.revenue),
        rating: toNumber(r.rating),
      }));

      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, data);
    } catch (error: unknown) {
      logger.error('Error getting top courses report:', error);
      next(error);
    }
  }

  async getLoginTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Math.max(1, Math.min(365, parseInt(String(req.query.days ?? '30'), 10) || 30));
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const rows = (await sequelize.query(
        `
        SELECT
          DATE_TRUNC('day', last_login)::date AS date,
          COUNT(*)::integer AS count
        FROM users
        WHERE last_login IS NOT NULL
          AND last_login BETWEEN :startDate AND :endDate
        GROUP BY DATE_TRUNC('day', last_login)
        ORDER BY date ASC
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { startDate, endDate },
        },
      )) as any[];

      // Fill missing days
      const map = new Map<string, number>();
      for (const r of rows) map.set(toISODate(r.date), toNumber(r.count));

      const out: Array<{ date: string; count: number }> = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, count: map.get(key) ?? 0 });
      }

      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, out);
    } catch (error: unknown) {
      logger.error('Error getting login trend:', error);
      next(error);
    }
  }
}
