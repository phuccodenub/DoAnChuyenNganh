import { LiveSession, LiveSessionAttendance } from '../../models';

export class LiveStreamRepository {
  async createSession(data: any) {
    return await LiveSession.create(data);
  }

  async getSessionById(id: string) {
    return await LiveSession.findByPk(id);
  }

  async updateSession(id: string, data: any) {
    const session = await LiveSession.findByPk(id);
    if (!session) return null;
    return await session.update(data);
  }

  async trackAttendance(sessionId: string, userId: string, data: any) {
    const [row] = await LiveSessionAttendance.findOrCreate({
      where: { session_id: sessionId, user_id: userId },
      defaults: { joined_at: new Date(), ...data }
    });
    return row;
  }
}










