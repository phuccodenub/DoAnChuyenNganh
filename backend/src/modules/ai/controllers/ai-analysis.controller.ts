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
      return res.status(404).json({
        success: false,
        message: 'Bài học không tồn tại',
      });
    }

    // Check if analysis already exists and is recent
    const existingAnalysis = await AILessonAnalysis.findOne({
      where: { lesson_id: lessonId },
    });

    if (existingAnalysis && existingAnalysis.status === 'completed') {
      const hoursSinceUpdate = (Date.now() - existingAnalysis.updated_at.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        return res.status(200).json({
          success: true,
          message: 'Bài học đã được phân tích gần đây',
          data: existingAnalysis,
        });
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
      return res.status(200).json({
        success: true,
        message: 'Bài học đang trong hàng đợi phân tích',
        data: {
          queueTask: existingQueueTask,
          analysis: existingAnalysis,
        },
      });
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

    res.status(202).json({
      success: true,
      message: proxyPalAvailable
        ? 'Yêu cầu phân tích đã được tạo và sẽ được xử lý sớm'
        : 'Yêu cầu phân tích đã được tạo. Đang chờ ProxyPal online',
      data: {
        queueTask,
        proxyPalStatus: proxyPalAvailable ? 'online' : 'offline',
      },
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Request analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo yêu cầu phân tích',
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: 'Chưa có phân tích cho bài học này',
      });
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

    res.status(200).json({
      success: true,
      data: {
        analysis,
        queueTask,
      },
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy kết quả phân tích',
      error: error.message,
    });
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

    res.status(200).json({
      success: true,
      message: 'Đã xóa kết quả phân tích. Có thể yêu cầu phân tích lại.',
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa kết quả phân tích',
      error: error.message,
    });
  }
}

/**
 * Get ProxyPal status
 * GET /api/v1.3.0/ai/proxypal/status
 */
export async function getProxyPalStatus(req: Request, res: Response) {
  try {
    const status = proxyPalHealthCheck.getHealthStatus();

    res.status(200).json({
      success: true,
      data: status,
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get ProxyPal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái ProxyPal',
      error: error.message,
    });
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

    res.status(200).json({
      success: true,
      data: {
        tasks,
        worker: workerStatus,
      },
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Get queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách queue',
      error: error.message,
    });
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
      return res.status(503).json({
        success: false,
        message: 'ProxyPal không khả dụng',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã kích hoạt xử lý queue. Worker sẽ xử lý trong vòng 1 phút.',
    });

  } catch (error: any) {
    logger.error('[AIAnalysisController] Force process error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt xử lý queue',
      error: error.message,
    });
  }
}
