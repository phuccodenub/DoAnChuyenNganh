/**
 * Message Rate Limiting Middleware
 * Prevents spam by limiting message frequency per user per course
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger.util';

// Configuration
const MAX_MESSAGES_PER_WINDOW = 10;
const WINDOW_SIZE = 60; // seconds

interface RateLimitData {
  count: number;
  windowStart: number;
}

export class MessageRateLimiter {
  private rateLimitMap: Map<string, RateLimitData> = new Map();

  constructor() {
    // No external cache needed, using in-memory Map
  }

  /**
   * Middleware to limit message rate
   */
  limit = (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId;
    const courseId = req.params.courseId;

    if (!userId || !courseId) {
      next();
      return;
    }

    this.checkLimit(userId, courseId, (error: Error | null, limited: boolean) => {
      if (error) {
        logger.error('Rate limit check error:', error);
        next(); // Continue on error, don't block
        return;
      }

      if (limited) {
        res.status(429).json({
          success: false,
          error: 'Too many messages. Please slow down.',
          retryAfter: WINDOW_SIZE
        });
        return;
      }

      next();
    });
  };

  /**
   * Check if user has exceeded rate limit
   */
  private checkLimit(
    userId: string,
    courseId: string,
    callback: (error: Error | null, limited: boolean) => void
  ): void {
    const key = `rate_limit:${userId}:${courseId}`;
    const now = Date.now();

    // Check memory cache first
    const cached = this.rateLimitMap.get(key);
    if (cached) {
      const windowAge = (now - cached.windowStart) / 1000;
      if (windowAge < WINDOW_SIZE) {
        // Still in same window
        if (cached.count >= MAX_MESSAGES_PER_WINDOW) {
          callback(null, true);
          return;
        }
        cached.count++;
        callback(null, false);
        return;
      } else {
        // Window expired
        this.rateLimitMap.delete(key);
      }
    }

    // Create new window
    this.rateLimitMap.set(key, {
      count: 1,
      windowStart: now
    });

    // Cleanup old windows periodically
    if (Math.random() < 0.1) {
      this.cleanupOldWindows();
    }

    callback(null, false);
  }

  /**
   * Cleanup old rate limit windows
   */
  private cleanupOldWindows(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, data] of this.rateLimitMap.entries()) {
      const age = (now - data.windowStart) / 1000;
      if (age > WINDOW_SIZE * 2) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.rateLimitMap.delete(key);
    });

    if (keysToDelete.length > 0) {
      logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit windows`);
    }
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  async resetLimit(userId: string, courseId: string): Promise<void> {
    const key = `rate_limit:${userId}:${courseId}`;
    this.rateLimitMap.delete(key);
    logger.info(`Rate limit reset for user ${userId} in course ${courseId}`);
  }

  /**
   * Get current rate limit status
   */
  getStatus(userId: string, courseId: string): { remaining: number; resetIn: number } {
    const key = `rate_limit:${userId}:${courseId}`;
    const cached = this.rateLimitMap.get(key);

    if (!cached) {
      return {
        remaining: MAX_MESSAGES_PER_WINDOW,
        resetIn: 0
      };
    }

    const now = Date.now();
    const windowAge = (now - cached.windowStart) / 1000;

    if (windowAge >= WINDOW_SIZE) {
      this.rateLimitMap.delete(key);
      return {
        remaining: MAX_MESSAGES_PER_WINDOW,
        resetIn: 0
      };
    }

    return {
      remaining: Math.max(0, MAX_MESSAGES_PER_WINDOW - cached.count),
      resetIn: Math.ceil(WINDOW_SIZE - windowAge)
    };
  }
}

// Export singleton instance
export const messageRateLimiter = new MessageRateLimiter();
