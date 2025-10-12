import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';
import { stringUtils } from '../../utils/string';
import { dateUtils } from '../../utils/date.util';

export interface SessionData {
  id: string;
  userId: string;
  device: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

export class SessionManagementService {
  private cacheService: CacheService;
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor() {
    this.cacheService = new CacheService();
  }

  // Create new session
  async createSession(userId: string, device: string, ipAddress: string, userAgent: string): Promise<SessionData> {
    try {
      const sessionId = this.generateSessionId();
      const now = dateUtils.now();
      
      const sessionData: SessionData = {
        id: sessionId,
        userId,
        device,
        ipAddress,
        userAgent,
        loginTime: now,
        lastActivity: now,
        isActive: true
      };

      // Cache session data
      const sessionKey = `session:${sessionId}`;
      await this.cacheService.set(sessionKey, sessionData, this.SESSION_TTL);

      // Add session to user's active sessions list
      await this.addToUserSessions(userId, sessionId);

      logger.info(`Session ${sessionId} created for user ${userId}`);
      return sessionData;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Get session data
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `session:${sessionId}`;
      return await this.cacheService.get<SessionData>(sessionKey);
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  // Update session activity
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      session.lastActivity = new Date();
      const sessionKey = `session:${sessionId}`;
      await this.cacheService.set(sessionKey, session, this.SESSION_TTL);
    } catch (error) {
      logger.error('Error updating session activity:', error);
    }
  }

  // Get user's active sessions
  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await this.cacheService.get<string[]>(userSessionsKey) || [];
      
      const sessions: SessionData[] = [];
      
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session && session.isActive) {
          sessions.push(session);
        }
      }
      
      return sessions;
    } catch (error) {
      logger.error('Error getting user active sessions:', error);
      return [];
    }
  }

  // Invalidate session
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      // Mark session as inactive
      session.isActive = false;
      const sessionKey = `session:${sessionId}`;
      await this.cacheService.set(sessionKey, session, this.SESSION_TTL);

      // Remove from user's active sessions
      await this.removeFromUserSessions(session.userId, sessionId);

      logger.info(`Session ${sessionId} invalidated`);
    } catch (error) {
      logger.error('Error invalidating session:', error);
    }
  }

  // Invalidate all user sessions
  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await this.cacheService.get<string[]>(userSessionsKey) || [];
      
      for (const sessionId of sessionIds) {
        await this.invalidateSession(sessionId);
      }
      
      // Clear user sessions list
      await this.cacheService.delete(userSessionsKey);
      
      logger.info(`All sessions invalidated for user ${userId}`);
    } catch (error) {
      logger.error('Error invalidating all user sessions:', error);
    }
  }

  // Check for suspicious activity
  async checkSuspiciousActivity(userId: string, ipAddress: string, userAgent: string): Promise<{
    isSuspicious: boolean;
    reason?: string;
  }> {
    try {
      const sessions = await this.getUserActiveSessions(userId);
      
      // Check for multiple IP addresses
      const uniqueIPs = new Set(sessions.map(s => s.ipAddress));
      if (uniqueIPs.size > 3) {
        return {
          isSuspicious: true,
          reason: 'Multiple IP addresses detected'
        };
      }
      
      // Check for different user agents
      const uniqueUserAgents = new Set(sessions.map(s => s.userAgent));
      if (uniqueUserAgents.size > 2) {
        return {
          isSuspicious: true,
          reason: 'Multiple devices detected'
        };
      }
      
      // Check for rapid login attempts
      const recentSessions = sessions.filter(s => {
        const timeDiff = Date.now() - s.loginTime.getTime();
        return timeDiff < 5 * 60 * 1000; // 5 minutes
      });
      
      if (recentSessions.length > 2) {
        return {
          isSuspicious: true,
          reason: 'Rapid login attempts detected'
        };
      }
      
      return { isSuspicious: false };
    } catch (error) {
      logger.error('Error checking suspicious activity:', error);
      return { isSuspicious: false };
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // This would typically be run as a cron job
      // For now, we rely on Redis TTL to handle expiration
      logger.info('Session cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  // Private methods
  private generateSessionId(): string {
    return stringUtils.generateRandomString(32);
  }

  private async addToUserSessions(userId: string, sessionId: string): Promise<void> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await this.cacheService.get<string[]>(userSessionsKey) || [];
      
      if (!sessionIds.includes(sessionId)) {
        sessionIds.push(sessionId);
        await this.cacheService.set(userSessionsKey, sessionIds, this.SESSION_TTL);
      }
    } catch (error) {
      logger.error('Error adding to user sessions:', error);
    }
  }

  private async removeFromUserSessions(userId: string, sessionId: string): Promise<void> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await this.cacheService.get<string[]>(userSessionsKey) || [];
      
      const index = sessionIds.indexOf(sessionId);
      if (index > -1) {
        sessionIds.splice(index, 1);
        await this.cacheService.set(userSessionsKey, sessionIds, this.SESSION_TTL);
      }
    } catch (error) {
      logger.error('Error removing from user sessions:', error);
    }
  }
}
