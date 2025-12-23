/**
 * AI Analysis Queue Worker
 * 
 * Background worker that processes AI analysis tasks
 * - Polls queue every minute
 * - Checks ProxyPal availability
 * - Processes pending tasks with priority
 * - Handles retries with exponential backoff
 */

import logger from '../../../utils/logger.util';
import AIAnalysisQueue, { AIAnalysisQueueAttributes } from '../models/ai-analysis-queue.model';
import AILessonAnalysis, { AILessonAnalysisAttributes } from '../models/ai-lesson-analysis.model';
import { proxyPalHealthCheck } from './proxypal-health.service';
import { LessonAnalysisService } from './lesson-analysis.service';
import { Op, Sequelize } from 'sequelize';

class AIAnalysisQueueWorker {
  private static instance: AIAnalysisQueueWorker;
  private isRunning = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private pollInterval = 60000; // 1 minute
  private maxConcurrent = 3; // Process max 3 tasks at once
  private currentlyProcessing = 0;

  private lessonAnalysisService: LessonAnalysisService;

  private constructor() {
    this.lessonAnalysisService = new LessonAnalysisService();
  }

  static getInstance(): AIAnalysisQueueWorker {
    if (!AIAnalysisQueueWorker.instance) {
      AIAnalysisQueueWorker.instance = new AIAnalysisQueueWorker();
    }
    return AIAnalysisQueueWorker.instance;
  }

  /**
   * Start the queue worker
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('[QueueWorker] Already running');
      return;
    }

    this.isRunning = true;
    logger.info('[QueueWorker] Starting AI Analysis Queue Worker');

    // Process immediately on start
    this.processQueue().catch((error) => {
      logger.error('[QueueWorker] Initial queue processing failed:', error);
    });

    // Then process periodically
    this.workerInterval = setInterval(() => {
      this.processQueue().catch((error) => {
        logger.error('[QueueWorker] Periodic queue processing failed:', error);
      });
    }, this.pollInterval);

    logger.info(`[QueueWorker] ✅ Started (poll interval: ${this.pollInterval / 1000}s)`);
  }

  /**
   * Stop the queue worker
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }

    this.isRunning = false;
    logger.info('[QueueWorker] ✅ Stopped');
  }

  /**
   * Process pending tasks in queue
   */
  private async processQueue(): Promise<void> {
    try {
      // Check if ProxyPal is available
      const proxyPalAvailable = await proxyPalHealthCheck.isAvailable();
      
      if (!proxyPalAvailable) {
        logger.info('[QueueWorker] ProxyPal offline, skipping queue processing');
        return;
      }

      // Don't process if we're at max concurrency
      if (this.currentlyProcessing >= this.maxConcurrent) {
        logger.info(`[QueueWorker] Already processing ${this.currentlyProcessing} tasks, skipping`);
        return;
      }

      // Fetch pending tasks (priority order)
      // Filter tasks where retry_count < max_retries using Sequelize.col for column comparison
      const tasks = await AIAnalysisQueue.findAll({
        where: {
          status: 'pending',
          retry_count: {
            [Op.lt]: Sequelize.col('max_retries'),
          },
          [Op.or]: [
            { scheduled_at: null },
            { scheduled_at: { [Op.lte]: new Date() } },
          ],
        },
        order: [
          ['priority', 'ASC'], // Lower number = higher priority
          ['created_at', 'ASC'], // FIFO
        ],
        limit: this.maxConcurrent - this.currentlyProcessing,
      });

      if (tasks.length === 0) {
        logger.info('[QueueWorker] No pending tasks');
        return;
      }

      logger.info(`[QueueWorker] Found ${tasks.length} pending task(s)`);

      // Process tasks in parallel (up to maxConcurrent)
      const promises = tasks.map((task: any) => this.processTask(task));
      await Promise.allSettled(promises);

    } catch (error: any) {
      logger.error('[QueueWorker] Queue processing error:', error);
    }
  }

  /**
   * Process a single task
   */
  private async processTask(task: any): Promise<void> {
    this.currentlyProcessing++;
    
    try {
      logger.info(`[QueueWorker] Processing task ${task.id} (lesson: ${task.lesson_id}, type: ${task.task_type})`);

      // Update status to processing
      await task.update({
        status: 'processing',
        processing_started_at: new Date(),
      });

      // Process based on task type
      let result;
      switch (task.task_type) {
        case 'full_analysis':
          result = await this.lessonAnalysisService.analyzeLesson(task.lesson_id);
          break;
        case 'summary':
          result = await this.lessonAnalysisService.generateSummary(task.lesson_id);
          break;
        case 'video_analysis':
          result = await this.lessonAnalysisService.analyzeVideo(task.lesson_id);
          break;
        default:
          throw new Error(`Unknown task type: ${task.task_type}`);
      }

      // Mark as completed
      await task.update({
        status: 'completed',
        processed_at: new Date(),
      });

      logger.info(`[QueueWorker] ✅ Task ${task.id} completed successfully`);

    } catch (error: any) {
      logger.error(`[QueueWorker] ❌ Task ${task.id} failed:`, error);

      // Calculate next retry time (exponential backoff)
      const retryDelay = Math.min(300000, 60000 * Math.pow(2, task.retry_count)); // Max 5 minutes
      const scheduledAt = new Date(Date.now() + retryDelay);

      // Update task with error
      await task.update({
        status: 'pending', // Back to pending for retry
        retry_count: task.retry_count + 1,
        error_message: error.message,
        error_stack: error.stack,
        scheduled_at: scheduledAt,
      });

      // If max retries reached, mark as failed
      if (task.retry_count + 1 >= task.max_retries) {
        await task.update({
          status: 'failed',
        });

        // Also mark analysis as failed
        await AILessonAnalysis.update(
          {
            status: 'failed',
            error_message: `Max retries (${task.max_retries}) exceeded: ${error.message}`,
          },
          {
            where: { lesson_id: task.lesson_id },
          }
        );

        logger.error(`[QueueWorker] Task ${task.id} failed permanently after ${task.max_retries} retries`);
      } else {
        logger.info(`[QueueWorker] Task ${task.id} will retry in ${retryDelay / 1000}s (attempt ${task.retry_count + 1}/${task.max_retries})`);
      }
    } finally {
      this.currentlyProcessing--;
    }
  }

  /**
   * Queue a new analysis task
   */
  async queueTask(params: {
    lesson_id: string;
    task_type: 'summary' | 'video_analysis' | 'full_analysis';
    priority?: number;
    metadata?: any;
  }): Promise<any> {
    try {
      // Check if task already exists and is pending/processing
      const existingTask = await AIAnalysisQueue.findOne({
        where: {
          lesson_id: params.lesson_id,
          status: ['pending', 'processing'],
        },
      });

      if (existingTask) {
        logger.info(`[QueueWorker] Task already exists for lesson ${params.lesson_id}, skipping`);
        return existingTask;
      }

      // Create new task
      const task = await AIAnalysisQueue.create({
        lesson_id: params.lesson_id,
        task_type: params.task_type,
        priority: params.priority || 5,
        status: 'pending',
        scheduled_at: new Date(),
        metadata: params.metadata || {},
      });

      logger.info(`[QueueWorker] Queued task ${task.id} for lesson ${params.lesson_id} (type: ${params.task_type})`);
      return task;
    } catch (error: any) {
      logger.error(`[QueueWorker] Failed to queue task for lesson ${params.lesson_id}:`, error);
      throw error;
    }
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentlyProcessing: this.currentlyProcessing,
      maxConcurrent: this.maxConcurrent,
      pollInterval: this.pollInterval,
    };
  }
}

// Export singleton
export const queueWorker = AIAnalysisQueueWorker.getInstance();
export const AIAnalysisQueueService = AIAnalysisQueueWorker.getInstance();
export default AIAnalysisQueueWorker;
