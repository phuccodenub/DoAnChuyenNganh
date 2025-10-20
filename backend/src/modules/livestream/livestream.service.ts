import { LiveStreamRepository } from './livestream.repository';
import { CreateLiveSessionDto, UpdateLiveSessionStatusDto } from './livestream.types';

export class LiveStreamService {
  private repo: LiveStreamRepository;

  constructor() {
    this.repo = new LiveStreamRepository();
  }

  async createSession(instructorId: string, dto: CreateLiveSessionDto) {
    return await this.repo.createSession(dto);
  }

  async getSession(id: string) {
    return await this.repo.getSessionById(id);
  }

  async updateStatus(id: string, dto: UpdateLiveSessionStatusDto) {
    return await this.repo.updateSession(id, dto);
  }

  async join(sessionId: string, userId: string) {
    return await this.repo.trackAttendance(sessionId, userId, {});
  }
}






