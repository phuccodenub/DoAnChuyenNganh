/**
 * Background Tasks Metrics Collection
 * Tracks cron jobs, background tasks, and scheduled operations
 */

import { MetricsService } from './metrics.service';
import logger from '../../utils/logger.util';

export interface BackgroundTask {
  name: string;
  type: 'cron' | 'job' | 'scheduled' | 'manual';
  interval?: number; // in milliseconds
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
}

export class BackgroundTasksMetrics {
  private metricsService: MetricsService;
  private tasks: Map<string, BackgroundTask> = new Map();
  private taskTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  /**
   * Register a background task
   */
  public registerTask(task: BackgroundTask): void {
    this.tasks.set(task.name, task);
    
    // Start periodic execution if it's a cron job
    if (task.type === 'cron' && task.interval) {
      this.startCronTask(task);
    }
  }

  /**
   * Start a cron task
   */
  private startCronTask(task: BackgroundTask): void {
    const timer = setInterval(async () => {
      await this.executeTask(task.name);
    }, task.interval);

    this.taskTimers.set(task.name, timer);
    
    logger.info('Background task registered', {
      taskName: task.name,
      type: task.type,
      interval: task.interval
    });
  }

  /**
   * Execute a background task with metrics tracking
   */
  public async executeTask(taskName: string, taskFunction?: () => Promise<any>): Promise<any> {
    const task = this.tasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    const startTime = Date.now();
    task.isRunning = true;
    task.lastRun = new Date();

    // Increment task execution counter
    this.metricsService.incrementCounter('background_tasks_executions_total', {
      task_name: taskName,
      task_type: task.type
    });

    try {
      let result;
      if (taskFunction) {
        result = await taskFunction();
      }

      const duration = Date.now() - startTime;
      
      // Record successful execution
      this.metricsService.incrementCounter('background_tasks_success_total', {
        task_name: taskName,
        task_type: task.type
      });

      // Record execution duration
      this.metricsService.recordHistogram('background_tasks_duration_seconds', duration / 1000, {
        task_name: taskName,
        task_type: task.type,
        status: 'success'
      });

      logger.info('Background task completed successfully', {
        taskName,
        duration,
        type: task.type
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed execution
      this.metricsService.incrementCounter('background_tasks_failures_total', {
        task_name: taskName,
        task_type: task.type,
        error_type: error.name || 'unknown'
      });

      // Record execution duration for failed tasks
      this.metricsService.recordHistogram('background_tasks_duration_seconds', duration / 1000, {
        task_name: taskName,
        task_type: task.type,
        status: 'error'
      });

      logger.error('Background task failed', {
        taskName,
        duration,
        error: error.message,
        type: task.type
      });

      throw error;
    } finally {
      task.isRunning = false;
      task.nextRun = task.interval ? new Date(Date.now() + task.interval) : undefined;
    }
  }

  /**
   * Track manual task execution
   */
  public async trackManualTask(taskName: string, taskFunction: () => Promise<any>): Promise<any> {
    return this.executeTask(taskName, taskFunction);
  }

  /**
   * Track job queue metrics
   */
  public trackJobQueued(queueName: string, jobType: string): void {
    this.metricsService.incrementCounter('job_queue_enqueued_total', {
      queue_name: queueName,
      job_type: jobType
    });
  }

  /**
   * Track job processing
   */
  public trackJobProcessing(queueName: string, jobType: string): void {
    this.metricsService.incrementCounter('job_queue_processing_total', {
      queue_name: queueName,
      job_type: jobType
    });
  }

  /**
   * Track job completion
   */
  public trackJobCompleted(queueName: string, jobType: string, duration: number): void {
    this.metricsService.incrementCounter('job_queue_completed_total', {
      queue_name: queueName,
      job_type: jobType
    });

    this.metricsService.recordHistogram('job_queue_duration_seconds', duration / 1000, {
      queue_name: queueName,
      job_type: jobType,
      status: 'success'
    });
  }

  /**
   * Track job failure
   */
  public trackJobFailed(queueName: string, jobType: string, duration: number, error: any): void {
    this.metricsService.incrementCounter('job_queue_failed_total', {
      queue_name: queueName,
      job_type: jobType,
      error_type: error.name || 'unknown'
    });

    this.metricsService.recordHistogram('job_queue_duration_seconds', duration / 1000, {
      queue_name: queueName,
      job_type: jobType,
      status: 'error'
    });
  }

  /**
   * Track scheduled task metrics
   */
  public trackScheduledTask(taskName: string, scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom'): void {
    this.metricsService.incrementCounter('scheduled_tasks_triggered_total', {
      task_name: taskName,
      schedule_type: scheduleType
    });
  }

  /**
   * Track cleanup operations
   */
  public trackCleanupOperation(operationType: string, itemsProcessed: number, duration: number): void {
    this.metricsService.incrementCounter('cleanup_operations_total', {
      operation_type: operationType
    });

    this.metricsService.setGauge('cleanup_items_processed_total', itemsProcessed, {
      operation_type: operationType
    });

    this.metricsService.recordHistogram('cleanup_duration_seconds', duration / 1000, {
      operation_type: operationType
    });
  }

  /**
   * Track data synchronization
   */
  public trackDataSync(syncType: string, recordsProcessed: number, duration: number, status: 'success' | 'error'): void {
    this.metricsService.incrementCounter('data_sync_operations_total', {
      sync_type: syncType,
      status
    });

    this.metricsService.setGauge('data_sync_records_processed_total', recordsProcessed, {
      sync_type: syncType
    });

    this.metricsService.recordHistogram('data_sync_duration_seconds', duration / 1000, {
      sync_type: syncType,
      status
    });
  }

  /**
   * Get background tasks metrics summary
   */
  public getBackgroundTasksMetrics(): {
    tasks: { total: number; running: number; byType: Record<string, number> };
    executions: { total: number; successful: number; failed: number };
    jobs: { enqueued: number; processing: number; completed: number; failed: number };
    schedules: { triggered: number; byType: Record<string, number> };
  } {
    const totalTasks = this.tasks.size;
    const runningTasks = Array.from(this.tasks.values()).filter(task => task.isRunning).length;
    
    const taskTypes: Record<string, number> = {};
    for (const task of this.tasks.values()) {
      taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
    }

    const totalExecutions = this.metricsService.getCounter('background_tasks_executions_total');
    const successfulExecutions = this.metricsService.getCounter('background_tasks_success_total');
    const failedExecutions = this.metricsService.getCounter('background_tasks_failures_total');

    const enqueuedJobs = this.metricsService.getCounter('job_queue_enqueued_total');
    const processingJobs = this.metricsService.getCounter('job_queue_processing_total');
    const completedJobs = this.metricsService.getCounter('job_queue_completed_total');
    const failedJobs = this.metricsService.getCounter('job_queue_failed_total');

    const triggeredSchedules = this.metricsService.getCounter('scheduled_tasks_triggered_total');
    const scheduleTypes: Record<string, number> = {};
    const scheduleCounters = this.metricsService.getLabeledCounters('scheduled_tasks_triggered_total');
    for (const counter of scheduleCounters) {
      const scheduleType = counter.labels.schedule_type || 'unknown';
      scheduleTypes[scheduleType] = (scheduleTypes[scheduleType] || 0) + counter.value;
    }

    return {
      tasks: {
        total: totalTasks,
        running: runningTasks,
        byType: taskTypes
      },
      executions: {
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions
      },
      jobs: {
        enqueued: enqueuedJobs,
        processing: processingJobs,
        completed: completedJobs,
        failed: failedJobs
      },
      schedules: {
        triggered: triggeredSchedules,
        byType: scheduleTypes
      }
    };
  }

  /**
   * Stop all background tasks
   */
  public stopAllTasks(): void {
    for (const [taskName, timer] of this.taskTimers.entries()) {
      clearInterval(timer);
      logger.info('Background task stopped', { taskName });
    }
    this.taskTimers.clear();
  }

  /**
   * Stop a specific task
   */
  public stopTask(taskName: string): void {
    const timer = this.taskTimers.get(taskName);
    if (timer) {
      clearInterval(timer);
      this.taskTimers.delete(taskName);
      logger.info('Background task stopped', { taskName });
    }
  }
}
