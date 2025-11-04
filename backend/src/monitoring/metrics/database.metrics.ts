/**
 * Database Metrics Collection
 * Tracks database query metrics, slow queries, and connection pool stats
 */

import { Sequelize } from 'sequelize';
import { MetricsService } from './metrics.service';
import logger from '../../utils/logger.util';

export class DatabaseMetrics {
  private metricsService: MetricsService;
  private sequelize: Sequelize;
  private slowQueryThreshold: number = 1000; // 1 second

  constructor(metricsService: MetricsService, sequelize: Sequelize) {
    this.metricsService = metricsService;
    this.sequelize = sequelize;
    this.setupQueryHooks();
  }

  /**
   * Setup Sequelize query hooks to track metrics
   */
  private setupQueryHooks(): void {
    // Track query execution
    this.sequelize.addHook('beforeQuery', (options: any) => {
      options.startTime = Date.now();
    });

    this.sequelize.addHook('afterQuery', (options: any, query: any) => {
      const duration = Date.now() - options.startTime;
      const queryType = this.extractQueryType(query.sql);
      
      // Increment total query counter
      this.metricsService.incrementCounter('database_queries_total', {
        query_type: queryType,
        operation: options.type || 'unknown'
      });

      // Track slow queries
      if (duration > this.slowQueryThreshold) {
        this.metricsService.incrementCounter('database_slow_queries_total', {
          query_type: queryType,
          operation: options.type || 'unknown'
        });

        logger.warn('Slow database query detected', {
          duration,
          sql: query.sql?.substring(0, 200) + '...',
          queryType,
          operation: options.type
        });
      }

      // Record query duration histogram
      this.metricsService.recordHistogram('database_query_duration_seconds', duration / 1000, {
        query_type: queryType,
        operation: options.type || 'unknown'
      });
    });

    // Track connection pool metrics
    this.setupConnectionPoolMetrics();
  }

  /**
   * Setup connection pool metrics collection
   */
  private setupConnectionPoolMetrics(): void {
    const pool = (this.sequelize.connectionManager as any).pool;
    
    if (pool) {
      // Track connection pool stats periodically
      setInterval(() => {
        const poolStats = {
          total: pool.size || 0,
          idle: pool.available || 0,
          using: pool.using || 0,
          waiting: pool.pending || 0
        };

        // Set gauge metrics for connection pool
        this.metricsService.setGauge('database_connections_total', poolStats.total);
        this.metricsService.setGauge('database_connections_idle', poolStats.idle);
        this.metricsService.setGauge('database_connections_using', poolStats.using);
        this.metricsService.setGauge('database_connections_waiting', poolStats.waiting);

        // Calculate utilization percentage
        const utilization = poolStats.total > 0 ? (poolStats.using / poolStats.total) * 100 : 0;
        this.metricsService.setGauge('database_connection_utilization_percent', utilization);

      }, 5000); // Every 5 seconds
    }
  }

  /**
   * Extract query type from SQL
   */
  private extractQueryType(sql: string): string {
    if (!sql) return 'unknown';
    
    const normalizedSql = sql.trim().toLowerCase();
    
    if (normalizedSql.startsWith('select')) return 'select';
    if (normalizedSql.startsWith('insert')) return 'insert';
    if (normalizedSql.startsWith('update')) return 'update';
    if (normalizedSql.startsWith('delete')) return 'delete';
    if (normalizedSql.startsWith('create')) return 'create';
    if (normalizedSql.startsWith('drop')) return 'drop';
    if (normalizedSql.startsWith('alter')) return 'alter';
    if (normalizedSql.startsWith('truncate')) return 'truncate';
    
    return 'other';
  }

  /**
   * Track transaction metrics
   */
  public trackTransaction(operation: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    
    return operation()
      .then((result) => {
        const duration = Date.now() - startTime;
        this.metricsService.incrementCounter('database_transactions_total', {
          status: 'success'
        });
        this.metricsService.recordHistogram('database_transaction_duration_seconds', duration / 1000);
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.metricsService.incrementCounter('database_transactions_total', {
          status: 'error',
          error_type: error.name || 'unknown'
        });
        this.metricsService.recordHistogram('database_transaction_duration_seconds', duration / 1000);
        throw error;
      });
  }

  /**
   * Track migration metrics
   */
  public trackMigration(migrationName: string, operation: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    
    return operation()
      .then((result) => {
        const duration = Date.now() - startTime;
        this.metricsService.incrementCounter('database_migrations_total', {
          migration: migrationName,
          status: 'success'
        });
        this.metricsService.recordHistogram('database_migration_duration_seconds', duration / 1000);
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.metricsService.incrementCounter('database_migrations_total', {
          migration: migrationName,
          status: 'error',
          error_type: error.name || 'unknown'
        });
        this.metricsService.recordHistogram('database_migration_duration_seconds', duration / 1000);
        throw error;
      });
  }

  /**
   * Get database metrics summary
   */
  public getDatabaseMetrics(): {
    queries: { total: number; slow: number; byType: Record<string, number> };
    connections: { total: number; idle: number; using: number; waiting: number; utilization: number };
    transactions: { total: number; successful: number; failed: number };
    migrations: { total: number; successful: number; failed: number };
  } {
    return {
      queries: {
        total: this.metricsService.getCounter('database_queries_total'),
        slow: this.metricsService.getCounter('database_slow_queries_total'),
        byType: this.getQueryTypeStats()
      },
      connections: {
        total: this.metricsService.getGauge('database_connections_total'),
        idle: this.metricsService.getGauge('database_connections_idle'),
        using: this.metricsService.getGauge('database_connections_using'),
        waiting: this.metricsService.getGauge('database_connections_waiting'),
        utilization: this.metricsService.getGauge('database_connection_utilization_percent')
      },
      transactions: {
        total: this.metricsService.getCounter('database_transactions_total'),
        successful: this.getLabeledCounterValue('database_transactions_total', { status: 'success' }),
        failed: this.getLabeledCounterValue('database_transactions_total', { status: 'error' })
      },
      migrations: {
        total: this.metricsService.getCounter('database_migrations_total'),
        successful: this.getLabeledCounterValue('database_migrations_total', { status: 'success' }),
        failed: this.getLabeledCounterValue('database_migrations_total', { status: 'error' })
      }
    };
  }

  /**
   * Get query type statistics
   */
  private getQueryTypeStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    const labeledCounters = this.metricsService.getLabeledCounters('database_queries_total');
    
    for (const counter of labeledCounters) {
      const queryType = counter.labels.query_type || 'unknown';
      stats[queryType] = (stats[queryType] || 0) + counter.value;
    }
    
    return stats;
  }

  /**
   * Get labeled counter value for specific labels
   */
  private getLabeledCounterValue(name: string, labels: Record<string, string>): number {
    const labeledCounters = this.metricsService.getLabeledCounters(name);
    
    for (const counter of labeledCounters) {
      const matches = Object.keys(labels).every(key => 
        counter.labels[key] === labels[key]
      );
      if (matches) {
        return counter.value;
      }
    }
    
    return 0;
  }
}
