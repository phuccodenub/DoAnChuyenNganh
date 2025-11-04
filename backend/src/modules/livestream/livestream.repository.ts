import { LiveSession, LiveSessionAttendance } from '../../models';
import type { 
  LiveSessionInstance, 
  LiveSessionCreationAttributes,
  LiveSessionAttendanceInstance,
  LiveSessionAttendanceCreationAttributes 
} from '../../types/model.types';

export class LiveStreamRepository {
  async createSession(data: LiveSessionCreationAttributes): Promise<LiveSessionInstance> {
    return await LiveSession.create(data) as LiveSessionInstance;
  }

  async getSessionById(id: string): Promise<LiveSessionInstance | null> {
    return await LiveSession.findByPk(id) as LiveSessionInstance | null;
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
    const [row] = await (LiveSessionAttendance as any).findOrCreate({
      where: { session_id: sessionId, user_id: userId },
      defaults: { 
        session_id: sessionId,
        user_id: userId,
        joined_at: new Date(), 
        ...data 
      }
    }) as [LiveSessionAttendanceInstance, boolean];
    return row;
  }
}



















