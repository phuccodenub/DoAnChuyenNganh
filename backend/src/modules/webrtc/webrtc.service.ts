/**
 * WebRTC Service
 * Business logic for WebRTC sessions
 */

import LiveSession from '../../models/live-session.model';
import LiveSessionAttendance from '../../models/live-session-attendance.model';
import logger from '../../utils/logger.util';
import { CourseInstance, LiveSessionInstance, LiveSessionAttributes } from '../../types/model.types';

export class WebRTCService {
  /**
   * Validate user access to session
   */
  async validateUserAccess(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Check if session exists
      const session = (await LiveSession.findByPk(sessionId)) as LiveSessionInstance | null;
      if (!session) {
        return false;
      }

      // Public sessions allow any authenticated user
      if (session.is_public) {
        return true;
      }

      // Check if user is host
      if (session.host_user_id === userId) {
        return true;
      }

      // Check if user is instructor
      const Course = (await import('../../models/course.model')).default;
      const course = (await Course.findByPk(session.course_id)) as CourseInstance | null;
      
      if (course && course.instructor_id === userId) {
        return true;
      }

      // Check if user is enrolled
      const Enrollment = (await import('../../models/enrollment.model')).default;
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: session.course_id,
          status: 'active'
        }
      });

      return !!enrollment;
    } catch (error: unknown) {
      logger.error('Error validating user access:', error);
      return false;
    }
  }

  /**
   * Track user joining session
   */
  async trackJoinSession(userId: string, sessionId: string): Promise<void> {
    try {
      // Check if attendance record exists
      const attendance = await LiveSessionAttendance.findOne({
        where: {
          session_id: sessionId,
          user_id: userId
        }
      });

      if (attendance) {
        // Update join time & reset left_at (user rejoined)
        await (attendance as any).update({
          joined_at: new Date(),
          left_at: null,
        });
      } else {
        // Create new attendance record
        await LiveSessionAttendance.create({
          session_id: sessionId,
          user_id: userId,
          joined_at: new Date(),
          left_at: null,
        } as any);
      }

      logger.info(`User ${userId} joined session ${sessionId}`);
    } catch (error: unknown) {
      logger.error('Error tracking join session:', error);
      throw error;
    }
  }

  /**
   * Track user leaving session
   */
  async trackLeaveSession(userId: string, sessionId: string): Promise<void> {
    try {
      const attendance = await LiveSessionAttendance.findOne({
        where: {
          session_id: sessionId,
          user_id: userId
        }
      });

      if (attendance) {
        await (attendance as any).update({
          left_at: new Date()
        });
      }

      logger.info(`User ${userId} left session ${sessionId}`);
    } catch (error: unknown) {
      logger.error('Error tracking leave session:', error);
      throw error;
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId: string) {
    try {
      return await LiveSession.findByPk(sessionId);
    } catch (error: unknown) {
      logger.error('Error getting session details:', error);
      throw error;
    }
  }

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId: string, status: LiveSessionAttributes['status']) {
    try {
      const session = await LiveSession.findByPk(sessionId) as LiveSessionInstance | null;
      
      if (!session) {
        throw new Error('Session not found');
      }

      await (session as any).update({ status });

      logger.info(`Session ${sessionId} status updated to ${status}`);
      return session;
    } catch (error: unknown) {
      logger.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Get session participants count
   */
  async getParticipantsCount(sessionId: string): Promise<number> {
    try {
      return await LiveSessionAttendance.count({
        where: {
          session_id: sessionId
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting participants count:', error);
      return 0;
    }
  }
}
