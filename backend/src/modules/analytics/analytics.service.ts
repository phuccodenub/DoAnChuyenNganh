import { AnalyticsRepository } from './analytics.repository';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor() {
    this.repo = new AnalyticsRepository();
  }

  async getCourseStats(courseId: string) {
    return await this.repo.getCourseStats(courseId);
  }

  async getUserActivities(userId: string, limit?: number) {
    return await this.repo.getUserActivities(userId, limit ?? 20);
  }
}




