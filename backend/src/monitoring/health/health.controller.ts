/**
 * Health Check Controller
 * Provides health check endpoints for monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { HealthService } from './health.service';
import { responseUtils } from '../../utils/response.util';
import { ApiError } from '../../errors';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Basic health check endpoint
   * GET /health
   */
  public getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.healthService.getBasicHealth();
      responseUtils.sendSuccess(res, 'Health check passed', health);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Detailed health check endpoint
   * GET /health/detailed
   */
  public getDetailedHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.healthService.getDetailedHealth();
      responseUtils.sendSuccess(res, 'Detailed health check completed', health);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Readiness probe endpoint
   * GET /health/ready
   */
  public getReadiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const readiness = await this.healthService.getReadiness();
      
      if (readiness.status === 'ready') {
        responseUtils.sendSuccess(res, 'Service is ready', readiness);
      } else {
        responseUtils.sendError(res, 'Service is not ready', 503, [readiness]);
      }
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Liveness probe endpoint
   * GET /health/live
   */
  public getLiveness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const liveness = await this.healthService.getLiveness();
      
      if (liveness.status === 'alive') {
        responseUtils.sendSuccess(res, 'Service is alive', liveness);
      } else {
        responseUtils.sendError(res, 'Service is not alive', 503, [liveness]);
      }
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Database health check
   * GET /health/database
   */
  public getDatabaseHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbHealth = await this.healthService.getDatabaseHealth();
      
      if (dbHealth.status === 'healthy') {
        responseUtils.sendSuccess(res, 'Database is healthy', dbHealth);
      } else {
        responseUtils.sendError(res, 'Database is unhealthy', 503, [dbHealth]);
      }
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Redis health check
   * GET /health/redis
   */
  public getRedisHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redisHealth = await this.healthService.getRedisHealth();
      
      if (redisHealth.status === 'healthy') {
        responseUtils.sendSuccess(res, 'Redis is healthy', redisHealth);
      } else {
        responseUtils.sendError(res, 'Redis is unhealthy', 503, [redisHealth]);
      }
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Memory usage check
   * GET /health/memory
   */
  public getMemoryHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memoryHealth = await this.healthService.getMemoryHealth();
      responseUtils.sendSuccess(res, 'Memory health check completed', memoryHealth);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * System metrics
   * GET /health/metrics
   */
  public getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.healthService.getSystemMetrics();
      responseUtils.sendSuccess(res, 'System metrics retrieved', metrics);
    } catch (error: unknown) {
      next(error);
    }
  };
}

