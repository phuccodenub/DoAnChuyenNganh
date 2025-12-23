/**
 * Lesson Model Hooks
 * Lifecycle hooks for automatic AI analysis
 */

import AIAnalysisQueueService from '../modules/ai/services/ai-analysis-queue-worker.service';
import logger from '../utils/logger.util';

export interface LessonHookData {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
}

/**
 * After lesson creation - queue full analysis
 */
export async function afterLessonCreate(lesson: LessonHookData): Promise<void> {
  try {
    logger.info(`[Lesson Hooks] Lesson created: ${lesson.id}, queuing full analysis...`);
    
    const queueService = AIAnalysisQueueService.getInstance();
    
    // Queue full analysis (includes video + content)
    await queueService.queueTask({
      lesson_id: lesson.id,
      task_type: 'full_analysis',
      priority: 5, // Medium priority for new lessons
      metadata: {
        trigger: 'lesson_create',
        title: lesson.title
      }
    });

    logger.info(`[Lesson Hooks] Analysis queued for lesson ${lesson.id}`);
  } catch (error) {
    logger.error(`[Lesson Hooks] Failed to queue analysis for lesson ${lesson.id}:`, error);
    // Don't throw - lesson creation should succeed even if analysis fails
  }
}

/**
 * After lesson update - check if re-analysis needed
 */
export async function afterLessonUpdate(
  lesson: LessonHookData,
  changes: Partial<LessonHookData>
): Promise<void> {
  try {
    // Check if content or video changed
    const contentChanged = 'content' in changes;
    const videoChanged = 'video_url' in changes;

    if (!contentChanged && !videoChanged) {
      logger.debug(`[Lesson Hooks] Lesson ${lesson.id} updated but no content changes, skipping re-analysis`);
      return;
    }

    logger.info(`[Lesson Hooks] Lesson ${lesson.id} content changed, queuing re-analysis...`);
    
    const queueService = AIAnalysisQueueService.getInstance();

    // Determine task type based on what changed
    let taskType: 'full_analysis' | 'video_analysis' | 'summary';
    let priority = 3; // Higher priority for updates

    if (contentChanged && videoChanged) {
      taskType = 'full_analysis';
    } else if (videoChanged) {
      taskType = 'video_analysis';
    } else {
      taskType = 'summary'; // Only content changed
    }

    await queueService.queueTask({
      lesson_id: lesson.id,
      task_type: taskType,
      priority,
      metadata: {
        trigger: 'lesson_update',
        title: lesson.title,
        content_changed: contentChanged,
        video_changed: videoChanged
      }
    });

    logger.info(`[Lesson Hooks] Re-analysis queued for lesson ${lesson.id} (type: ${taskType})`);
  } catch (error) {
    logger.error(`[Lesson Hooks] Failed to queue re-analysis for lesson ${lesson.id}:`, error);
    // Don't throw - lesson update should succeed even if analysis fails
  }
}

/**
 * Before lesson delete - cleanup analysis data
 */
export async function beforeLessonDelete(lessonId: string): Promise<void> {
  try {
    logger.info(`[Lesson Hooks] Lesson ${lessonId} being deleted, cleanup will be handled by CASCADE`);
    // No action needed - CASCADE delete will handle cleanup
  } catch (error) {
    logger.error(`[Lesson Hooks] Error in beforeLessonDelete for lesson ${lessonId}:`, error);
  }
}
