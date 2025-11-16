import { CourseStatistics, UserActivityLog } from '../../models';

export class AnalyticsRepository {
  async getCourseStats(courseId: string) {
    return await CourseStatistics.findOne({ where: { course_id: courseId } });
  }

  async getUserActivities(userId: string, limit = 20) {
    return await UserActivityLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }
}




























