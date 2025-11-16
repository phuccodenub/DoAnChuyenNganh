import { LiveStreamRepository } from './livestream.repository';
import { CreateLiveSessionDto, UpdateLiveSessionStatusDto } from './livestream.types';
import type { LiveSessionCreationAttributes } from '../../types/model.types';

export class LiveStreamService {
  private repo: LiveStreamRepository;

  constructor() {
    this.repo = new LiveStreamRepository();
  }

  async createSession(instructorId: string, dto: CreateLiveSessionDto) {
    // Normalize dates
    const sessionData: LiveSessionCreationAttributes = {
      ...dto,
      scheduled_at: typeof dto.scheduled_at === 'string' ? new Date(dto.scheduled_at) : dto.scheduled_at
    };
    return await this.repo.createSession(sessionData);
  }

  async getSession(id: string) {
    return await this.repo.getSessionById(id);
  }

  async updateStatus(id: string, dto: UpdateLiveSessionStatusDto) {
    // Normalize dates
    const updateData = {
      status: dto.status,
      recording_url: dto.recording_url,
      started_at: dto.started_at ? (typeof dto.started_at === 'string' ? new Date(dto.started_at) : dto.started_at) : undefined,
      ended_at: dto.ended_at ? (typeof dto.ended_at === 'string' ? new Date(dto.ended_at) : dto.ended_at) : undefined
    };
    return await this.repo.updateSession(id, updateData);
  }

  async join(sessionId: string, userId: string) {
    return await this.repo.trackAttendance(sessionId, userId, {});
  }
}






























