/**
 * Health Check Service
 * Provides health check logic and system monitoring
 */

import { getSequelize } from '../../config/db';
import { redisClient } from '../../config/redis.config';
import logger from '../../utils/logger.util';
import { dateUtils } from '../../utils/date.util';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    memory: ServiceHealth;
  };
  checks: {
    database: boolean;
    redis: boolean;
    memory: boolean;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  checks: {
    database: boolean;
    redis: boolean;
    memory: boolean;
  };
  timestamp: string;
}

export interface LivenessStatus {
  status: 'alive' | 'not_alive';
  uptime: number;
  timestamp: string;
}

export interface DatabaseHealth extends ServiceHealth {
  connectionPool: {
    total: number;
    used: number;
    idle: number;
  };
  queries: {
    total: number;
    active: number;
  };
}

export interface RedisHealth extends ServiceHealth {
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  clients: {
    connected: number;
    blocked: number;
  };
  keyspace: {
    keys: number;
    expires: number;
  };
}

export interface MemoryHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  percentage: number;
  threshold: {
    warning: number;
    critical: number;
  };
}

export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: MemoryHealth;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  process: {
    pid: number;
    version: string;
    platform: string;
    arch: string;
  };
  environment: string;
}

export class HealthService {
  private readonly startTime: number;
  private readonly memoryThresholds = {
    warning: 80, // 80% memory usage
    critical: 95  // 95% memory usage
  };

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Get basic health status
   */
  public async getBasicHealth(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    
    return {
      status: 'healthy',
      timestamp: dateUtils.formatDate(new Date()),
      uptime,
      version: (await import('../../config/env.config')).default.api.defaultVersion,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Get detailed health status
   */
  public async getDetailedHealth(): Promise<DetailedHealthStatus> {
    const [databaseHealth, redisHealth, memoryHealth] = await Promise.allSettled([
      this.getDatabaseHealth(),
      this.getRedisHealth(),
      this.getMemoryHealth()
    ]);

    const checks = {
      database: databaseHealth.status === 'fulfilled' && databaseHealth.value.status === 'healthy',
      redis: redisHealth.status === 'fulfilled' && redisHealth.value.status === 'healthy',
      memory: memoryHealth.status === 'fulfilled' && memoryHealth.value.status === 'healthy'
    };

    const healthyCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (healthyCount === totalCount) {
      overallStatus = 'healthy';
    } else if (healthyCount === 0) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: dateUtils.formatDate(new Date()),
      uptime: Date.now() - this.startTime,
      version: (await import('../../config/env.config')).default.api.defaultVersion,
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : { status: 'unhealthy', error: 'Failed to check database health' },
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : { status: 'unhealthy', error: 'Failed to check Redis health' },
        memory: memoryHealth.status === 'fulfilled' ? memoryHealth.value : { status: 'unhealthy', error: 'Failed to check memory health' }
      },
      checks
    };
  }

  /**
   * Get readiness status
   */
  public async getReadiness(): Promise<ReadinessStatus> {
    const [databaseCheck, redisCheck, memoryCheck] = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkRedisConnection(),
      this.checkMemoryUsage()
    ]);

    const checks = {
      database: databaseCheck.status === 'fulfilled' && databaseCheck.value,
      redis: redisCheck.status === 'fulfilled' && redisCheck.value,
      memory: memoryCheck.status === 'fulfilled' && memoryCheck.value
    };

    const allReady = Object.values(checks).every(Boolean);

    return {
      status: allReady ? 'ready' : 'not_ready',
      checks,
      timestamp: dateUtils.formatDate(new Date())
    };
  }

  /**
   * Get liveness status
   */
  public async getLiveness(): Promise<LivenessStatus> {
    return {
      status: 'alive',
      uptime: Date.now() - this.startTime,
      timestamp: dateUtils.formatDate(new Date())
    };
  }

  /**
   * Get database health
   */
  public async getDatabaseHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    
    try {
      // Test database connection
      const db = getSequelize();
      await db.authenticate();
      
      // Get connection pool info
      const pool = (db as any).connectionManager.pool;
      const connectionPool = {
        total: pool.size,
        used: pool.used,
        idle: pool.idle
      };

      // Get query info
      const queries = {
        total: 0, // Would need to track this
        active: 0  // Would need to track this
      };

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        connectionPool,
        queries
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Database health check failed', { error: err.message });
      
      return {
        status: 'unhealthy',
        error: err.message,
        connectionPool: { total: 0, used: 0, idle: 0 },
        queries: { total: 0, active: 0 }
      };
    }
  }

  /**
   * Get Redis health
   */
  public async getRedisHealth(): Promise<RedisHealth> {
    const startTime = Date.now();
    
    try {
      // Test Redis connection
      await redisClient.ping();
      
      // Get Redis info
      const info = await redisClient.info('memory');
      const memoryInfo = this.parseRedisInfo(info);
      
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        memory: memoryInfo.memory,
        clients: memoryInfo.clients,
        keyspace: memoryInfo.keyspace
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Redis health check failed', { error: err.message });
      
      return {
        status: 'unhealthy',
        error: err.message,
        memory: { used: 0, peak: 0, fragmentation: 0 },
        clients: { connected: 0, blocked: 0 },
        keyspace: { keys: 0, expires: 0 }
      };
    }
  }

  /**
   * Get memory health
   */
  public async getMemoryHealth(): Promise<MemoryHealth> {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const percentage = (usage.rss / totalMemory) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (percentage >= this.memoryThresholds.critical) {
      status = 'unhealthy';
    } else if (percentage >= this.memoryThresholds.warning) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      usage,
      percentage: Math.round(percentage * 100) / 100,
      threshold: this.memoryThresholds
    };
  }

  /**
   * Get system metrics
   */
  public async getSystemMetrics(): Promise<SystemMetrics> {
    const memory = await this.getMemoryHealth();
    const os = require('os');
    
    return {
      timestamp: dateUtils.formatDate(new Date()),
      uptime: Date.now() - this.startTime,
      memory,
      cpu: {
        usage: 0, // Would need to calculate this
        loadAverage: os.loadavg()
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Check database connection
   */
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const db = getSequelize();
      await db.authenticate();
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Database connection check failed', { error: err.message });
      return false;
    }
  }

  /**
   * Check Redis connection
   */
  private async checkRedisConnection(): Promise<boolean> {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error('Redis connection check failed', { error: err.message });
      return false;
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<boolean> {
    const memory = await this.getMemoryHealth();
    return memory.status !== 'unhealthy';
  }

  /**
   * Parse Redis info string
   */
  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {
      memory: { used: 0, peak: 0, fragmentation: 0 },
      clients: { connected: 0, blocked: 0 },
      keyspace: { keys: 0, expires: 0 }
    };

    for (const line of lines) {
      if (line.includes('used_memory:')) {
        result.memory.used = parseInt(line.split(':')[1]);
      } else if (line.includes('used_memory_peak:')) {
        result.memory.peak = parseInt(line.split(':')[1]);
      } else if (line.includes('mem_fragmentation_ratio:')) {
        result.memory.fragmentation = parseFloat(line.split(':')[1]);
      } else if (line.includes('connected_clients:')) {
        result.clients.connected = parseInt(line.split(':')[1]);
      } else if (line.includes('blocked_clients:')) {
        result.clients.blocked = parseInt(line.split(':')[1]);
      } else if (line.includes('keyspace:')) {
        // Parse keyspace info
        const keyspace = line.split(':')[1];
        if (keyspace) {
          const matches = keyspace.match(/keys=(\d+),expires=(\d+)/);
          if (matches) {
            result.keyspace.keys = parseInt(matches[1]);
            result.keyspace.expires = parseInt(matches[2]);
          }
        }
      }
    }

    return result;
  }
}
