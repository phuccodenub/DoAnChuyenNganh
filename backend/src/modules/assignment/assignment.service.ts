import { AssignmentRepository } from './assignment.repository';
import { CreateAssignmentDto, SubmitAssignmentDto, UpdateAssignmentDto } from './assignment.types';
import { ApiError } from '../../errors/api.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';

export class AssignmentService {
  private repo: AssignmentRepository;

  constructor() {
    this.repo = new AssignmentRepository();
  }

  // ===================================
  // ASSIGNMENT MANAGEMENT
  // ===================================

  async createAssignment(userId: string, dto: CreateAssignmentDto) {
    try {
      // Verify user is instructor of the course
      await this.verifyInstructorAccess(dto.course_id, userId);
      
      const assignment = await this.repo.createAssignment(dto);
      logger.info(`Assignment created: ${assignment.id} by user ${userId}`);
      return assignment;
    } catch (error: unknown) {
      logger.error(`Error creating assignment: ${error}`);
      throw error;
    }
  }

  async getAssignment(assignmentId: string, userId?: string) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      // Check if assignment is published or user is instructor
      if (!assignment.is_published && userId) {
        await this.verifyInstructorAccess(assignment.course_id, userId);
      }

      return assignment;
    } catch (error: unknown) {
      logger.error(`Error getting assignment: ${error}`);
      throw error;
    }
  }

  async updateAssignment(assignmentId: string, userId: string, data: UpdateAssignmentDto) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      await this.verifyInstructorAccess(assignment.course_id, userId);

      const updated = await this.repo.updateAssignment(assignmentId, data);
      logger.info(`Assignment updated: ${assignmentId} by user ${userId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating assignment: ${error}`);
      throw error;
    }
  }

  async deleteAssignment(assignmentId: string, userId: string) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      await this.verifyInstructorAccess(assignment.course_id, userId);

      await this.repo.deleteAssignment(assignmentId);
      logger.info(`Assignment deleted: ${assignmentId} by user ${userId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting assignment: ${error}`);
      throw error;
    }
  }

  async getCourseAssignments(courseId: string, userId?: string, includeUnpublished: boolean = false) {
    try {
      if (includeUnpublished && userId) {
        await this.verifyInstructorAccess(courseId, userId);
      }

      return await this.repo.getCourseAssignments(courseId, includeUnpublished);
    } catch (error: unknown) {
      logger.error(`Error getting course assignments: ${error}`);
      throw error;
    }
  }

  // ===================================
  // SUBMISSION MANAGEMENT
  // ===================================

  async submitAssignment(assignmentId: string, userId: string, dto: SubmitAssignmentDto) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      // Check if assignment is published and available
      if (!assignment.is_published) {
        throw new ApiError('Assignment is not published', 403);
      }

      const now = new Date();
      if (assignment.due_date && new Date(assignment.due_date) < now) {
        if (!assignment.allow_late_submission) {
          throw new ApiError('Assignment deadline has passed', 403);
        }
      }

      // Check if user already has a submission
      const existingSubmission = await this.repo.getUserSubmission(assignmentId, userId);
      if (existingSubmission) {
        throw new ApiError('Assignment already submitted', 400);
      }

      // Verify enrollment
      await this.verifyEnrollment(assignment.course_id, userId);

      const submission = await this.repo.submit(assignmentId, userId, dto);
      logger.info(`Assignment submitted: ${assignmentId} by user ${userId}`);
      return submission;
    } catch (error: unknown) {
      logger.error(`Error submitting assignment: ${error}`);
      throw error;
    }
  }

  async updateSubmission(submissionId: string, userId: string, dto: Partial<SubmitAssignmentDto>) {
    try {
      const submission = await this.repo.getSubmissionById(submissionId);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
      }

      if (submission.user_id !== userId) {
        throw new AuthorizationError('Not authorized to update this submission');
      }

      if (submission.status === 'graded') {
        throw new ApiError('Cannot update graded submission', 400);
      }

      const assignment = await this.repo.getAssignmentById(submission.assignment_id);
      if (assignment!.due_date && new Date(assignment!.due_date) < new Date() && !assignment!.allow_late_submission) {
        throw new ApiError('Assignment deadline has passed', 403);
      }

      const updated = await this.repo.updateSubmission(submissionId, dto);
      logger.info(`Submission updated: ${submissionId} by user ${userId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating submission: ${error}`);
      throw error;
    }
  }

  async getMySubmission(assignmentId: string, userId: string) {
    return await this.repo.getUserSubmission(assignmentId, userId);
  }

  async getSubmissionDetails(submissionId: string, userId: string) {
    try {
      const submission = await this.repo.getSubmissionWithDetails(submissionId);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
      }

      // Check if user owns the submission or is instructor
      if (submission.user_id !== userId) {
        const assignment = await this.repo.getAssignmentById(submission.assignment_id);
        await this.verifyInstructorAccess(assignment!.course_id, userId);
      }

      return submission;
    } catch (error: unknown) {
      logger.error(`Error getting submission details: ${error}`);
      throw error;
    }
  }

  // ===================================
  // GRADING (INSTRUCTOR)
  // ===================================

  async gradeSubmission(submissionId: string, graderId: string, data: { score?: number; feedback?: string }) {
    try {
      const submission = await this.repo.getSubmissionById(submissionId);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
      }

      const assignment = await this.repo.getAssignmentById(submission.assignment_id);
      await this.verifyInstructorAccess(assignment!.course_id, graderId);

      // Validate score
      if (data.score !== undefined) {
        if (data.score < 0 || data.score > assignment!.max_score) {
          throw new ApiError(`Score must be between 0 and ${assignment!.max_score}`, 400);
        }
      }

      const graded = await this.repo.grade(submissionId, { ...data, graded_by: graderId });
      logger.info(`Submission graded: ${submissionId} by user ${graderId}`);
      return graded;
    } catch (error: unknown) {
      logger.error(`Error grading submission: ${error}`);
      throw error;
    }
  }

  async getAssignmentSubmissions(assignmentId: string, userId: string, page: number = 1, limit: number = 20) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      await this.verifyInstructorAccess(assignment.course_id, userId);

      return await this.repo.getAssignmentSubmissions(assignmentId, page, limit);
    } catch (error: unknown) {
      logger.error(`Error getting assignment submissions: ${error}`);
      throw error;
    }
  }

  async getAssignmentStatistics(assignmentId: string, userId: string) {
    try {
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      await this.verifyInstructorAccess(assignment.course_id, userId);

      return await this.repo.getAssignmentStatistics(assignmentId);
    } catch (error: unknown) {
      logger.error(`Error getting assignment statistics: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  private async verifyInstructorAccess(courseId: string, userId: string) {
    const { Course } = await import('../../models');
    const course = await Course.findByPk(courseId);
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    return course;
  }

  private async verifyEnrollment(courseId: string, userId: string) {
    const { Enrollment } = await import('../../models');
    const enrollment = await Enrollment.findOne({
      where: { course_id: courseId, user_id: userId }
    });

    if (!enrollment) {
      throw new AuthorizationError('You must be enrolled in this course to submit assignments');
    }

    return enrollment;
  }
}



