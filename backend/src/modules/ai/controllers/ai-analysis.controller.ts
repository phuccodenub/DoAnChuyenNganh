/**
 * AI Analysis Controller
 * 
 * Handles API requests for AI lesson analysis
 * - Request analysis
 * - Get analysis results
 * - Check ProxyPal status
 * - Queue management
 */

import { Request, Response } from 'express';
import AILessonAnalysis from '../models/ai-lesson-analysis.model';
import AIAnalysisQueue from '../models/ai-analysis-queue.model';
import Lesson from '../../../models/lesson.model';
import { LessonAnalysisService } from '../services/lesson-analysis.service';
import { proxyPalHealthCheck } from '../services/proxypal-health.service';
import { queueWorker } from '../services/ai-analysis-queue-worker.service';
import { responseUtils } from '../../../utils/response.util';
import logger from '../../../utils/logger.util';


const lessonAnalysisService = new LessonAnalysisService();

/**
 * Request AI analysis for a lesson
 * POST /api/v1.3.0/lessons/:lessonId/ai-analysis
 */
export async function requestLessonAnalysis(req: Request, res: Response) {
  try {
    const { lessonId } = req.params;
    const { taskType = 'full_analysis', priority = 5 } = req.body;
    const userId = (req.user as any)?.userId;

    // Validate lesson exists
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return responseUtils.sendNotFound(res, 'Bài học không tồn tại');
    }

    // Check if analysis already exists and is recent
    const existingAnalysis = await AILessonAnalysis.findOne({
      where: { lesson_id: lessonId },
    });

    if (existingAnalysis && existingAnalysis.status === 'completed') {
      const hoursSinceUpdate = (Date.now() - existingAnalysis.updated_at.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        return responseUtils.sendSuccess(
          res,
          'Bài học đã được phân tích gần đây',
          existingAnalysis,
          200,
          { feature: 'ai-analysis' }
        );
      }
    }

    // Check if already in queue
    const existingQueueTask = await AIAnalysisQueue.findOne({
      where: {
        lesson_id: lessonId,
        status: ['pending', 'processing'],
      },
    });

    if (existingQueueTask) {
      return responseUtils.sendSuccess(
        res,
        'Bài học đang trong hàng đợi phân tích',
        {
          queueTask: existingQueueTask,
          analysis: existingAnalysis,
        },
        200,
        { feature: 'ai-analysis' }
      );
    }

    // Create analysis record if doesn't exist
    if (!existingAnalysis) {
      await AILessonAnalysis.create({
        lesson_id: lessonId,
        status: 'pending',
      });
    } else {
      await existingAnalysis.update({
        status: 'pending',
        version: existingAnalysis.version + 1,
      });
    }

    // Add to queue
    const queueTask = await AIAnalysisQueue.create({
      lesson_id: lessonId,
      task_type: taskType,
      priority: priority,
      status: 'pending',
      created_by: userId,
    });

    logger.info(`[AIAnalysisController] Queued analysis for lesson ${lessonId} (task: ${queueTask.id})`);

    // Check if ProxyPal is available now
    const proxyPalAvailable = await proxyPalHealthCheck.isAvailable();

    return responseUtils.sendSuccess(
      res,
      proxyPalAvailable
        ? 'Yêu cầu phân tích đã được tạo và sẽ được xử lý sớm'
        : 'Yêu cầu phân tích đã được tạo. Đang chờ ProxyPal online',
      {
        queueTask,
        proxyPalStatus: proxyPalAvailable ? 'online' : 'offline',
      },
      202,
      { feature: 'ai-analysis' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Request analysis error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi tạo yêu cầu phân tích',
      500,
      [{ message: error.message }]
    );
  }
}

/**
 * Get AI analysis for a lesson
 * GET /api/v1.3.0/lessons/:lessonId/ai-analysis
 */
export async function getLessonAnalysis(req: Request, res: Response) {
  try {
    const { lessonId } = req.params;

    const analysis = await AILessonAnalysis.findOne({
      where: { lesson_id: lessonId },
    });

    if (!analysis) {
      return responseUtils.sendNotFound(res, 'Chưa có phân tích cho bài học này');
    }

    // Also check queue status if pending
    let queueTask = null;
    if (analysis.status === 'pending' || analysis.status === 'processing') {
      queueTask = await AIAnalysisQueue.findOne({
        where: {
          lesson_id: lessonId,
          status: ['pending', 'processing'],
        },
      });
    }

    return responseUtils.sendSuccess(
      res,
      'Analysis retrieved',
      {
        analysis,
        queueTask,
      },
      200,
      { feature: 'ai-analysis' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get analysis error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi lấy kết quả phân tích',
      500,
      [{ message: error.message }]
    );
  }
}

/**
 * Delete AI analysis (re-analyze)
 * DELETE /api/v1.3.0/lessons/:lessonId/ai-analysis
 */
export async function deleteLessonAnalysis(req: Request, res: Response) {
  try {
    const { lessonId } = req.params;

    await AILessonAnalysis.destroy({
      where: { lesson_id: lessonId },
    });

    return responseUtils.sendSuccess(
      res,
      'Đã xóa kết quả phân tích. Có thể yêu cầu phân tích lại.',
      null,
      200,
      { feature: 'ai-analysis' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Delete analysis error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi xóa kết quả phân tích',
      500,
      [{ message: error.message }]
    );
  }
}

/**
 * Get ProxyPal status
 * GET /api/v1.3.0/ai/proxypal/status
 */
export async function getProxyPalStatus(req: Request, res: Response) {
  try {
    const status = proxyPalHealthCheck.getHealthStatus();

    return responseUtils.sendSuccess(
      res,
      'ProxyPal status retrieved',
      status,
      200,
      { feature: 'ai-proxypal' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get ProxyPal status error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi kiểm tra trạng thái ProxyPal',
      500,
      [{ message: error.message }]
    );
  }
}

/**
 * Get analysis queue
 * GET /api/v1.3.0/ai/analysis-queue
 */
export async function getAnalysisQueue(req: Request, res: Response) {
  try {
    const { status, limit = 50 } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const tasks = await AIAnalysisQueue.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'content_type'],
        },
      ],
    });

    const workerStatus = queueWorker.getStatus();

    return responseUtils.sendSuccess(
      res,
      'Queue retrieved',
      {
        tasks,
        worker: workerStatus,
      },
      200,
      { feature: 'ai-analysis-queue' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get queue error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi lấy danh sách queue',
      500,
      [{ message: error.message }]
    );
  }
}

/**
 * Force process queue (admin only)
 * POST /api/v1.3.0/ai/analysis-queue/process
 */
export async function forceProcessQueue(req: Request, res: Response) {
  try {
    // Manually trigger queue processing
    const proxyPalAvailable = await proxyPalHealthCheck.forceCheck();

    if (!proxyPalAvailable) {
      return responseUtils.sendServiceUnavailable(res, 'ProxyPal không khả dụng');
    }

    return responseUtils.sendSuccess(
      res,
      'Đã kích hoạt xử lý queue. Worker sẽ xử lý trong vòng 1 phút.',
      null,
      200,
      { feature: 'ai-analysis-queue' }
    );

  } catch (error: any) {
    logger.error('[AIAnalysisController] Force process error:', error);
    return responseUtils.sendError(
      res,
      'Lỗi khi kích hoạt xử lý queue',
      500,
      [{ message: error.message }]
    );
  }
}
