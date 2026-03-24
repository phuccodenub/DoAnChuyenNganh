/**
 * Learning Support Controller
 * HTTP endpoints for Learning Support features (Remediation, Study Planner, Flashcards)
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { Request, Response, NextFunction } from 'express';
import { RemediationService, RemediationRequest } from './services/remediation.service';
import { StudyPlannerService, StudyPlanRequest, InstructorInsightsRequest } from './services/study-planner.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';
import env from '../../config/env.config';

export class LearningSupportController {
  private remediationService: RemediationService;
  private studyPlannerService: StudyPlannerService;

  constructor() {
    this.remediationService = new RemediationService();
    this.studyPlannerService = new StudyPlannerService();
  }

  // ==================== REMEDIATION ====================

  /**
   * Get remediation cards for a quiz attempt
   * GET /learning-support/remediation
   * Query: attemptId (required)
   */
  getRemediation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { attemptId, maxCards } = req.query;

      if (!attemptId || typeof attemptId !== 'string') {
        return responseUtils.sendValidationError(res, 'attemptId là bắt buộc');
      }

      const request: RemediationRequest = {
        attemptId,
        userId,
        maxCards: maxCards ? Number(maxCards) : undefined,
      };

      const result = await this.remediationService.generateRemediation(request);

      return responseUtils.sendSuccess(
        res,
        'Remediation cards generated successfully',
        result,
        200,
        { feature: 'learning-support-remediation' }
      );
    } catch (error: any) {
      logger.error('[LearningSupportController] getRemediation error:', {
        message: error.message,
        stack: error.stack,
      });
      
      if (error.message?.includes('not found') || error.message?.includes('not owned')) {
        return responseUtils.sendNotFound(res, error.message);
      }
      
      next(error);
    }
  };

  /**
   * Clear remediation cache for an attempt
   * DELETE /learning-support/remediation/:attemptId/cache
   */
  clearRemediationCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { attemptId } = req.params;

      if (!attemptId) {
        return responseUtils.sendValidationError(res, 'attemptId là bắt buộc');
      }

      await this.remediationService.clearCache(attemptId);

      return responseUtils.sendSuccess(
        res,
        'Cache cleared successfully',
        { attemptId },
        200
      );
    } catch (error) {
      logger.error('[LearningSupportController] clearRemediationCache error:', error);
      next(error);
    }
  };

  // ==================== STUDY PLANNER ====================

  /**
   * Get study plan for a student in a course
   * GET /learning-support/plan
   * Query: courseId (required)
   */
  getStudyPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.query;

      if (!courseId || typeof courseId !== 'string') {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      const request: StudyPlanRequest = {
        userId,
        courseId,
      };

      const result = await this.studyPlannerService.generateStudyPlan(request);

      return responseUtils.sendSuccess(
        res,
        'Study plan generated successfully',
        result,
        200,
        { feature: 'learning-support-study-plan' }
      );
    } catch (error: any) {
      logger.error('[LearningSupportController] getStudyPlan error:', {
        message: error.message,
        stack: error.stack,
      });
      
      if (error.message?.includes('not found')) {
        return responseUtils.sendNotFound(res, error.message);
      }
      
      next(error);
    }
  };

  /**
   * Clear study plan cache
   * DELETE /learning-support/plan/cache
   * Query: courseId (required)
   */
  clearStudyPlanCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.query;

      if (!courseId || typeof courseId !== 'string') {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      await this.studyPlannerService.clearStudentCache(userId, courseId);

      return responseUtils.sendSuccess(
        res,
        'Cache cleared successfully',
        { userId, courseId },
        200
      );
    } catch (error) {
      logger.error('[LearningSupportController] clearStudyPlanCache error:', error);
      next(error);
    }
  };

  // ==================== INSTRUCTOR INSIGHTS ====================

  /**
   * Get aggregated insights for instructor
   * GET /learning-support/instructor/insights
   * Query: courseId (required)
   */
  getInstructorInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.user!.userId;
      const { courseId } = req.query;

      if (!courseId || typeof courseId !== 'string') {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      const request: InstructorInsightsRequest = {
        instructorId,
        courseId,
      };

      const result = await this.studyPlannerService.generateInstructorInsights(request);

      return responseUtils.sendSuccess(
        res,
        'Instructor insights generated successfully',
        result,
        200,
        { feature: 'learning-support-instructor-insights' }
      );
    } catch (error: any) {
      logger.error('[LearningSupportController] getInstructorInsights error:', {
        message: error.message,
        stack: error.stack,
      });
      
      if (error.message?.includes('not found') || error.message?.includes('access denied')) {
        return responseUtils.sendForbidden(res, error.message);
      }
      
      next(error);
    }
  };

  /**
   * Clear instructor insights cache
   * DELETE /learning-support/instructor/insights/cache
   * Query: courseId (required)
   */
  clearInstructorInsightsCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.query;

      if (!courseId || typeof courseId !== 'string') {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      await this.studyPlannerService.clearInstructorCache(courseId);

      return responseUtils.sendSuccess(
        res,
        'Cache cleared successfully',
        { courseId },
        200
      );
    } catch (error) {
      logger.error('[LearningSupportController] clearInstructorInsightsCache error:', error);
      next(error);
    }
  };

  // ==================== FLASHCARDS (MVP-1) ====================
  // TODO: Implement flashcard generation from lesson analysis
  // This will be added in the next sprint

  /**
   * Generate flashcards from lesson
   * GET /learning-support/flashcards
   * Query: lessonId (required)
   */
  getFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement
      return responseUtils.sendServiceUnavailable(
        res,
        'Flashcards feature is coming soon (MVP-1)'
      );
    } catch (error) {
      logger.error('[LearningSupportController] getFlashcards error:', error);
      next(error);
    }
  };

  // ==================== PRACTICE (MVP-1) ====================
  // TODO: Implement targeted practice generation

  /**
   * Generate practice questions
   * POST /learning-support/practice
   * Body: { mode: 'retake' | 'concept', targetId: string }
   */
  generatePractice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Implement
      return responseUtils.sendServiceUnavailable(
        res,
        'Practice generation feature is coming soon (MVP-1)'
      );
    } catch (error) {
      logger.error('[LearningSupportController] generatePractice error:', error);
      next(error);
    }
  };
}
