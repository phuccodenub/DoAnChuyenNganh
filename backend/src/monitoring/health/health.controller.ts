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
      
      res.status(200).json(responseUtils.success(health, 'Health check passed'));
    } catch (error) {
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
      
      res.status(200).json(responseUtils.success(health, 'Detailed health check completed'));
    } catch (error) {
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
        res.status(200).json(responseUtils.success(readiness, 'Service is ready'));
      } else {
        res.status(503).json(responseUtils.error('Service is not ready', readiness));
      }
    } catch (error) {
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
        res.status(200).json(responseUtils.success(liveness, 'Service is alive'));
      } else {
        res.status(503).json(responseUtils.error('Service is not alive', liveness));
      }
    } catch (error) {
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
        res.status(200).json(responseUtils.success(dbHealth, 'Database is healthy'));
      } else {
        res.status(503).json(responseUtils.error('Database is unhealthy', dbHealth));
      }
    } catch (error) {
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
        res.status(200).json(responseUtils.success(redisHealth, 'Redis is healthy'));
      } else {
        res.status(503).json(responseUtils.error('Redis is unhealthy', redisHealth));
      }
    } catch (error) {
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
      
      res.status(200).json(responseUtils.success(memoryHealth, 'Memory health check completed'));
    } catch (error) {
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
      
      res.status(200).json(responseUtils.success(metrics, 'System metrics retrieved'));
    } catch (error) {
      next(error);
    }
  };
}
