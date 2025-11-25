import { Op } from 'sequelize';
import { LiveSession, LiveSessionAttendance, Course, User } from '../../models';
import type {
  LiveSessionInstance,
  LiveSessionCreationAttributes,
  LiveSessionAttendanceInstance,
  LiveSessionAttendanceCreationAttributes,
} from '../../types/model.types';
import type { ListLiveSessionsQuery } from './livestream.types';

export class LiveStreamRepository {
  async createSession(data: LiveSessionCreationAttributes): Promise<LiveSessionInstance> {
    return await LiveSession.create(data) as LiveSessionInstance;
  }

  async getSessionById(id: string): Promise<LiveSessionInstance | null> {
    return await LiveSession.findByPk(id, {
      include: [
        { model: User, as: 'host', attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'category_id'] },
      ],
    }) as LiveSessionInstance | null;
  }

  async updateSession(id: string, data: Partial<LiveSessionCreationAttributes>): Promise<LiveSessionInstance | null> {
    const session = await LiveSession.findByPk(id) as LiveSessionInstance | null;
    if (!session) return null;
    return await (session as any).update(data) as LiveSessionInstance;
  }

  async trackAttendance(
    sessionId: string, 
    userId: string, 
    data: Partial<LiveSessionAttendanceCreationAttributes>
  ): Promise<LiveSessionAttendanceInstance> {
    const [row, created] = await (LiveSessionAttendance as any).findOrCreate({
      where: { session_id: sessionId, user_id: userId },
      defaults: { 
        session_id: sessionId,
        user_id: userId,
        joined_at: new Date(), 
        ...data 
      }
    }) as [LiveSessionAttendanceInstance, boolean];

    if (!created) {
      await (row as any).update({
        joined_at: new Date(),
        left_at: null,
        ...data,
      });
    }

    return row;
  }

  async leaveSession(
    sessionId: string,
    userId: string
  ): Promise<LiveSessionAttendanceInstance | null> {
    const record = await LiveSessionAttendance.findOne({
      where: { session_id: sessionId, user_id: userId },
    }) as LiveSessionAttendanceInstance | null;
    if (!record) return null;
    return await (record as any).update({
      left_at: new Date(),
    }) as LiveSessionAttendanceInstance;
  }

  async listSessions(params: ListLiveSessionsQuery) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 12;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (params.host_user_id) {
      where.host_user_id = params.host_user_id;
    } else {
      where.is_public = true;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${params.search}%` } },
        { description: { [Op.iLike]: `%${params.search}%` } },
      ];
    }

    const result = await LiveSession.findAndCountAll({
      where,
      include: [
        { model: User, as: 'host', attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'] },
        { model: Course, as: 'course', attributes: ['id', 'title', 'category_id'] },
      ],
      order: [
        ['status', 'ASC'],
        ['scheduled_start', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit,
      offset,
    });

    return {
      sessions: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit) || 1,
      },
    };
  }

  async getSessionViewers(sessionId: string) {
    const viewers = await LiveSessionAttendance.findAll({
      where: { session_id: sessionId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'avatar'] },
      ],
      order: [['joined_at', 'DESC']],
    });

    return {
      count: viewers.length,
      viewers,
    };
  }

  async deleteSession(id: string): Promise<number> {
    return await LiveSession.destroy({ where: { id } });
  }
}































