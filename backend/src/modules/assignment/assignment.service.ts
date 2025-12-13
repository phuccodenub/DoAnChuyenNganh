import { AssignmentRepository } from './assignment.repository';
import { CreateAssignmentDto, SubmitAssignmentDto, UpdateAssignmentDto } from './assignment.types';
import { ApiError } from '../../errors/api.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import type { CourseInstance } from '../../types/model.types';
import { Op } from 'sequelize';

export class AssignmentService {
  private repo: AssignmentRepository;

  constructor() {
    this.repo = new AssignmentRepository();
  }

  // ===================================
  // ASSIGNMENT MANAGEMENT
  // ===================================

  // List assignments with basic filters and pagination (used by controller)
  async getAllAssignments(options: { page: number; limit: number; course_id?: string; section_id?: string; status?: string; }) {
    const { page = 1, limit = 20, course_id, section_id, status } = options || ({} as any);
    const offset = (page - 1) * limit;
    try {
      const { default: AssignmentModel } = await import('../../models/assignment.model');
      const where: any = {};
      if (course_id) {
        const { default: Section } = await import('../../models/section.model');
        const sections = await (Section as any).findAll({ where: { course_id }, attributes: ['id'] });
        const sectionIds = sections.map((s: any) => s.id);
        where[Op.or] = [
          { course_id },
          ...(sectionIds.length ? [{ section_id: sectionIds }] : []),
        ];
      }
      if (section_id) where.section_id = section_id;
      // Map status → is_published giống quiz
      if (status === 'published') {
        where.is_published = true;
      } else if (status === 'draft') {
        where.is_published = false;
      }
      const { rows, count } = await (AssignmentModel as any).findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });
      return {
        data: rows,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
      };
    } catch (error: unknown) {
      logger.error(`Error listing assignments: ${error}`);
      throw error;
    }
  }

  async createAssignment(userId: string, dto: CreateAssignmentDto) {
    try {
      // Verify user is instructor of the course
      await this.verifyInstructorAccess(dto.course_id, userId, dto.section_id);
      
      // Convert DTO to model attributes - XOR logic giống quiz
      // Nếu có section_id thì course_id = null, ngược lại
      const createData = {
        ...dto,
        course_id: dto.section_id ? null : (dto.course_id ?? null),
        section_id: dto.section_id ?? null,
        due_date: dto.due_date === null ? undefined : (dto.due_date ? new Date(dto.due_date) : undefined)
      } as any;
      
      const assignment = await this.repo.createAssignment(createData);
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

      // Giống quiz: Nếu assignment đã published, cho phép mọi người xem
      // Chỉ verify instructor access nếu assignment chưa published VÀ có userId
      if (!assignment.is_published) {
        // Nếu assignment chưa published, chỉ instructor mới được xem
        if (!userId) {
          throw new ApiError('Assignment is not published', 403);
        }
        // Verify instructor access
        await this.verifyInstructorAccess(assignment.course_id, userId, (assignment as any)?.section_id);
      }
      // Nếu assignment đã published, cho phép mọi người xem (không cần verify)

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

      await this.verifyInstructorAccess(assignment.course_id, userId, (assignment as any)?.section_id);

      // Convert DTO to model attributes - XOR logic giống quiz
      const updateData: any = {
        ...data,
        due_date: data.due_date === null ? undefined : (data.due_date ? new Date(data.due_date) : undefined)
      };

      // Xử lý course_id và section_id - XOR logic
      if (data.course_id !== undefined || data.section_id !== undefined) {
        if (data.section_id) {
          // Có section_id → course_id = null
          updateData.section_id = data.section_id;
          updateData.course_id = null;
        } else {
          // Có course_id hoặc section_id = null → chỉ có course_id
          updateData.course_id = data.course_id ?? null;
          updateData.section_id = null;
        }
      }

      const updated = await this.repo.updateAssignment(assignmentId, updateData);
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

      await this.verifyInstructorAccess(assignment.course_id, userId, (assignment as any)?.section_id);

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
      // Chỉ verify instructor access nếu thực sự muốn include unpublished
      // Nếu chỉ xem published assignments, không cần verify (giống quiz)
      if (includeUnpublished && userId) {
        await this.verifyInstructorAccess(courseId, userId);
      }

      // Luôn cho phép fetch published assignments (không cần verify)
      // Repository sẽ tự filter theo includeUnpublished
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

      // Resolve course_id từ section_id nếu course_id là null (XOR logic)
      const resolvedCourseId = assignment.course_id ?? await this.resolveCourseIdFromSection((assignment as any)?.section_id);
      if (!resolvedCourseId) {
        throw new ApiError('Course context not found for assignment', 400);
      }

      // Verify enrollment - nhưng cho phép instructor submit (giống quiz)
      // Instructor có thể submit để test/preview assignment
      try {
        await this.verifyEnrollment(resolvedCourseId, userId);
        logger.info(`User ${userId} is enrolled in course ${resolvedCourseId}, allowing submission`);
      } catch (enrollmentError) {
        // Nếu không enrolled, kiểm tra xem có phải instructor của course không
        logger.info(`User ${userId} is not enrolled, checking if instructor of course ${resolvedCourseId}`);
        const isInstructor = await this.isCourseInstructor(resolvedCourseId, userId);
        if (!isInstructor) {
          // Nếu không phải instructor, throw lỗi enrollment
          logger.warn(`User ${userId} is not enrolled and not instructor of course ${resolvedCourseId}, denying submission`);
          throw enrollmentError;
        }
        // Nếu là instructor, cho phép submit (bỏ qua enrollment check)
        logger.info(`Instructor ${userId} submitting assignment ${assignmentId} without enrollment (preview/test mode)`);
      }

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
        await this.verifyInstructorAccess(assignment!.course_id, userId, (assignment as any)?.section_id);
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
      await this.verifyInstructorAccess(assignment!.course_id, graderId, (assignment as any)?.section_id);

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

      await this.verifyInstructorAccess(assignment.course_id, userId, (assignment as any)?.section_id);

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

      await this.verifyInstructorAccess(assignment.course_id, userId, (assignment as any)?.section_id);

      return await this.repo.getAssignmentStatistics(assignmentId);
    } catch (error: unknown) {
      logger.error(`Error getting assignment statistics: ${error}`);
      throw error;
    }
  }

  /**
   * Get assignment statistics for a course (instructor dashboard)
   */
  async getCourseAssignmentStats(courseId: string, userId: string) {
    try {
      await this.verifyInstructorAccess(courseId, userId);
      return await this.repo.getCourseAssignmentStats(courseId);
    } catch (error: unknown) {
      logger.error(`Error getting course assignment stats: ${error}`);
      throw error;
    }
  }

  /**
   * Get all pending submissions for grading (instructor's courses)
   */
  async getPendingGrading(userId: string, page: number = 1, limit: number = 20) {
    try {
      return await this.repo.getPendingGrading(userId, page, limit);
    } catch (error: unknown) {
      logger.error(`Error getting pending grading: ${error}`);
      throw error;
    }
  }

  /**
   * Get pending submissions for a specific course
   */
  async getCoursePendingGrading(courseId: string, userId: string, page: number = 1, limit: number = 20) {
    try {
      await this.verifyInstructorAccess(courseId, userId);
      return await this.repo.getCoursePendingGrading(courseId, page, limit);
    } catch (error: unknown) {
      logger.error(`Error getting course pending grading: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  private async resolveCourseIdFromSection(sectionId?: string | null): Promise<string | null> {
    if (!sectionId) return null;
    const { default: Section } = await import('../../models/section.model');
    const section = await (Section as any).findByPk(sectionId, { attributes: ['id', 'course_id'] });
    if (!section) {
      throw new ApiError('Section not found', 404);
    }
    return section.course_id;
  }

  private async verifyInstructorAccess(courseId: string | null | undefined, userId: string, sectionId?: string | null) {
    const resolvedCourseId = courseId ?? await this.resolveCourseIdFromSection(sectionId);
    if (!resolvedCourseId) {
      throw new ApiError('Course context not found', 400);
    }
    const { Course } = await import('../../models');
    const course = await Course.findByPk(resolvedCourseId) as CourseInstance | null;
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    return course;
  }

  /**
   * Check if user is instructor of a course (public method for controller)
   */
  async isCourseInstructor(courseId: string, userId: string): Promise<boolean> {
    try {
      await this.verifyInstructorAccess(courseId, userId);
      return true;
    } catch (error) {
      return false;
    }
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

  /**
   * Get all assignments for a student from their enrolled courses
   */
  async getStudentAssignments(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    try {
      return await this.repo.getMyAssignmentsWithStats(userId, options);
    } catch (error: unknown) {
      logger.error(`Error getting student assignments: ${error}`);
      throw error;
    }
  }
}



