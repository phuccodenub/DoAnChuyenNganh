import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from './assignment.service';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class AssignmentController {
  private assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  // ===================================
  // ASSIGNMENT CRUD
  // ===================================

  /**
   * Create new assignment
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const assignment = await this.assignmentService.createAssignment(userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in create controller:', error);
      next(error);
    }
  };

  /**
   * Get all assignments with pagination and filters
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, course_id, section_id, status } = req.query;
      
      const result = await this.assignmentService.getAllAssignments({
        page: Number(page),
        limit: Number(limit),
        course_id: course_id as string,
        section_id: section_id as string,
        status: status as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignments retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAll controller:', error);
      next(error);
    }
  };

  /**
   * Get assignment by ID
   */
  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string | undefined;
      const assignment = await this.assignmentService.getAssignment(req.params.id || req.params.assignmentId, userId);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment retrieved successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in getOne controller:', error);
      next(error);
    }
  };

  /**
   * Update assignment
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = (req as any).user?.userId as string;
      const assignment = await this.assignmentService.updateAssignment(id, userId, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error in update controller:', error);
      next(error);
    }
  };

  /**
   * Delete assignment
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId as string;
      await this.assignmentService.deleteAssignment(id, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in delete controller:', error);
      next(error);
    }
  };

  // ===================================
  // COURSE ASSIGNMENTS
  // ===================================

  /**
   * Get all assignments for a course
   */
  getCourseAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.userId as string;
      const userRole = (req as any).user?.role as string;
      
      // Instructors and admins can see unpublished assignments
      // Nhưng chỉ nếu họ là instructor của course này
      // Nếu không phải instructor của course, chỉ cho xem published (giống quiz)
      const isInstructorOrAdmin = ['instructor', 'admin', 'super_admin'].includes(userRole);
      const isAdmin = ['admin', 'super_admin'].includes(userRole);
      
      // Kiểm tra xem user có phải instructor của course không
      let includeUnpublished = false;
      let requesterId: string | undefined = userId;
      if (isAdmin) {
        includeUnpublished = true;
        requesterId = undefined;
      } else if (isInstructorOrAdmin && userId) {
        const isInstructor = await this.assignmentService.isCourseInstructor(courseId, userId);
        if (isInstructor) {
          includeUnpublished = true;
        } else {
          // Nếu không phải instructor của course, chỉ xem published (giống quiz)
          logger.info(`User ${userId} (role: ${userRole}) is not instructor of course ${courseId}, showing only published assignments`);
        }
      }
      
      const assignments = await this.assignmentService.getCourseAssignments(courseId, requesterId, includeUnpublished);


      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Course assignments retrieved successfully',
        data: assignments
      });
    } catch (error) {
      logger.error('Error in getCourseAssignments controller:', error);
      next(error);
    }
  };

  /**
   * Get assignment completion status for a course (current user)
   */
  getCompletionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.userId as string;

      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      const status = await this.assignmentService.getCourseCompletionStatus(courseId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment completion status retrieved successfully',
        data: status
      });
    } catch (error) {
      logger.error('Error in getCompletionStatus controller:', error);
      next(error);
    }
  };

  /**
   * Get assignment statistics for a course (instructor dashboard)
   */
  getCourseAssignmentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      const stats = await this.assignmentService.getCourseAssignmentStats(courseId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Course assignment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error in getCourseAssignmentStats controller:', error);
      next(error);
    }
  };


  // ===================================
  // SUBMISSIONS
  // ===================================

  /**
   * Submit assignment (student)
   */
  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const submission = await this.assignmentService.submitAssignment(req.params.assignmentId, userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: submission
      });
    } catch (error) {
      logger.error('Error in submit controller:', error);
      next(error);
    }
  };

  /**
   * Cancel/delete own submission (student) - only if not graded
   */
  cancelSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const { assignmentId } = req.params;
      
      await this.assignmentService.cancelSubmission(assignmentId, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Submission cancelled successfully'
      });
    } catch (error) {
      logger.error('Error in cancelSubmission controller:', error);
      next(error);
    }
  };

  /**
   * Get all submissions for an assignment (instructor)
   */
  getAssignmentSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const userId = (req as any).user?.userId as string;
      
      const result = await this.assignmentService.getAssignmentSubmissions(
        assignmentId,
        userId,
        Number(page),
        Number(limit)
      );

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment submissions retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAssignmentSubmissions controller:', error);
      next(error);
    }
  };

  /**
   * Get current user's submission for an assignment
   */
  getMySubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      const submission = await this.assignmentService.getMySubmission(assignmentId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Submission retrieved successfully',
        data: submission
      });
    } catch (error) {
      logger.error('Error in getMySubmission controller:', error);
      next(error);
    }
  };

  /**
   * Update current user's submission
   */
  updateMySubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      // First get the existing submission
      const existingSubmission = await this.assignmentService.getMySubmission(assignmentId, userId);
      if (!existingSubmission) {
        throw new ApiError('Submission not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }
      
      const submission = await this.assignmentService.updateSubmission(existingSubmission.id, userId, req.body);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Submission updated successfully',
        data: submission
      });
    } catch (error) {
      logger.error('Error in updateMySubmission controller:', error);
      next(error);
    }
  };

  /**
   * Get statistics for an assignment
   */
  getAssignmentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      const stats = await this.assignmentService.getAssignmentStatistics(assignmentId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Assignment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error in getAssignmentStats controller:', error);
      next(error);
    }
  };

  /**
   * Get submission details
   */
  getSubmissionDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      const submission = await this.assignmentService.getSubmissionDetails(submissionId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Submission details retrieved successfully',
        data: submission
      });
    } catch (error) {
      logger.error('Error in getSubmissionDetails controller:', error);
      next(error);
    }
  };

  /**
   * Save AI grader result to submission
   */
  saveAiGrading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userId = (req as any).user?.userId as string;
      const { aiResult, rubric, overwriteScore } = req.body;

      if (!aiResult || !rubric || !Array.isArray(rubric) || rubric.length === 0) {
        throw new ApiError('aiResult and rubric are required', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const updated = await this.assignmentService.saveAiGrading(submissionId, userId, {
        aiResult,
        rubric,
        overwriteScore: !!overwriteScore
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'AI grading saved successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Error in saveAiGrading controller:', error);
      next(error);
    }
  };


  // ===================================
  // GRADING
  // ===================================

  /**
   * Grade a submission
   */
  grade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const result = await this.assignmentService.gradeSubmission(req.params.submissionId, userId, req.body);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Submission graded successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in grade controller:', error);
      next(error);
    }
  };

  /**
   * Get all pending submissions for grading (instructor's courses)
   */
  getPendingGrading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await this.assignmentService.getPendingGrading(userId, Number(page), Number(limit));

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Pending submissions retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getPendingGrading controller:', error);
      next(error);
    }
  };

  /**
   * Get pending submissions for a specific course
   */
  getCoursePendingGrading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.userId as string;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await this.assignmentService.getCoursePendingGrading(courseId, userId, Number(page), Number(limit));

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Course pending submissions retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getCoursePendingGrading controller:', error);
      next(error);
    }
  };

  /**
   * Get all assignments for current student from enrolled courses
   */
  getMyAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId as string;
      const { page = 1, limit = 20, status, search } = req.query;
      
      const result = await this.assignmentService.getStudentAssignments(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        search: search as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Student assignments retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getMyAssignments controller:', error);
      next(error);
    }
  };

  /**
   * Upload assignment file (student)
   * Files are uploaded to R2/Google Drive and URL is returned
   */
  uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user?.userId as string;
      
      // Verify assignment exists
      const assignment = await this.assignmentService.getAssignment(assignmentId, userId);
      if (!assignment) {
        throw new ApiError('Assignment not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Check if file was uploaded
      const file = req.file;
      if (!file) {
        throw new ApiError('No file uploaded', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      // Validate file size (max 50MB - controlled by multer)
      const maxSizeMB = 50;
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new ApiError(`File too large. Maximum size: ${maxSizeMB}MB`, RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      // Upload file using the service
      const result = await this.assignmentService.uploadSubmissionFile(assignmentId, userId, file);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: result.url,
          originalName: result.originalName,
          size: file.size
        }
      });
    } catch (error) {
      logger.error('Error in uploadFile controller:', error);
      next(error);
    }
  };
}