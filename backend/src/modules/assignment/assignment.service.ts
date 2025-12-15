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

      // Send notification to all enrolled students (in background, don't block response)
      this.notifyStudentsAboutNewAssignment(assignment, dto.course_id, dto.section_id).catch((err) => {
        logger.error(`Error sending assignment notifications: ${err}`);
      });

      return assignment;
    } catch (error: unknown) {
      logger.error(`Error creating assignment: ${error}`);
      throw error;
    }
  }

  /**
   * Send notification to all enrolled students about a new assignment
   */
  private async notifyStudentsAboutNewAssignment(
    assignment: any,
    courseId?: string | null,
    sectionId?: string | null
  ): Promise<void> {
    try {
      // Determine course_id
      let effectiveCourseId = courseId;
      if (!effectiveCourseId && sectionId) {
        const { Section } = await import('../../models');
        const section = await Section.findByPk(sectionId);
        effectiveCourseId = (section as any)?.course_id;
      }

      if (!effectiveCourseId) {
        logger.warn(`Cannot send notification: No course_id found for assignment ${assignment.id}`);
        return;
      }

      // Get course info
      const { Course, Enrollment } = await import('../../models');
      const course = await Course.findByPk(effectiveCourseId);
      if (!course) return;

      // Get all enrolled student IDs
      const enrollments = await Enrollment.findAll({
        where: { course_id: effectiveCourseId },
        attributes: ['user_id'],
        raw: true
      });

      const studentIds = enrollments.map((e: any) => e.user_id);
      if (studentIds.length === 0) return;

      // Format due date for notification
      let dueDateStr = '';
      if (assignment.due_date) {
        const dueDate = new Date(assignment.due_date);
        dueDateStr = ` (Hạn nộp: ${dueDate.toLocaleDateString('vi-VN')})`;
      }

      // Create notification
      const { NotificationsService } = await import('../notifications/notifications.service');
      const notificationService = new NotificationsService();

      await notificationService.create(null, {
        notification_type: 'course',
        title: 'Bài tập mới',
        message: `Bài tập "${assignment.title}" đã được thêm vào khóa học "${(course as any).title}"${dueDateStr}`,
        link_url: `/student/assignments/${assignment.id}`,
        priority: 'high',
        category: 'assignment',
        related_resource_type: 'assignment',
        related_resource_id: assignment.id,
        recipient_ids: studentIds,
        is_broadcast: false
      });

      logger.info(`Notification sent to ${studentIds.length} students for assignment ${assignment.id}`);
    } catch (error) {
      logger.error(`Failed to send assignment notification: ${error}`);
      // Don't throw - this is a background task
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

      // Convert file_urls array to JSON string for file_url field
      const submissionData: any = { ...dto };
      if (dto.file_urls && Array.isArray(dto.file_urls) && dto.file_urls.length > 0) {
        // Store as JSON string in file_url field
        submissionData.file_url = JSON.stringify(dto.file_urls);
        delete submissionData.file_urls;
        logger.info(`Converting file_urls array (${dto.file_urls.length} files) to JSON string`);
      }

      const submission = await this.repo.submit(assignmentId, userId, submissionData);
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

  /**
   * Cancel/delete student's own submission - only if not graded
   */
  async cancelSubmission(assignmentId: string, userId: string): Promise<void> {
    try {
      const submission = await this.repo.getUserSubmission(assignmentId, userId);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
      }

      if (submission.user_id !== userId) {
        throw new AuthorizationError('Not authorized to cancel this submission');
      }

      if (submission.status === 'graded') {
        throw new ApiError('Cannot cancel graded submission', 400);
      }

      await this.repo.deleteSubmission(submission.id);
      logger.info(`Submission cancelled: ${submission.id} by user ${userId}`);
    } catch (error: unknown) {
      logger.error(`Error cancelling submission: ${error}`);
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

  /**
   * Upload a file for assignment submission
   * Uses R2 storage (or Google Drive as fallback)
   */
  async uploadSubmissionFile(assignmentId: string, userId: string, file: Express.Multer.File): Promise<{
    url: string;
    originalName: string;
  }> {
    try {
      // Get assignment to retrieve course_id
      const assignment = await this.repo.getAssignmentById(assignmentId);
      if (!assignment) {
        throw new ApiError('Assignment not found', 404);
      }

      // Get course_id (from assignment or from section)
      let courseId = assignment.course_id;
      if (!courseId && assignment.section_id) {
        const { Section } = await import('../../models');
        const section = await Section.findByPk(assignment.section_id);
        courseId = (section as any)?.course_id;
      }

      // Verify user is enrolled in the course
      if (courseId) {
        await this.verifyEnrollment(courseId, userId);
      }

      // Import R2 storage service
      const { R2StorageService } = await import('../../services/storage/r2.service');
      const r2Service = new R2StorageService();

      // Upload to R2
      const folder = `assignments/${assignmentId}/submissions/${userId}`;
      const result = await r2Service.uploadFile(file, {
        folder,
        userId
      });

      logger.info(`Assignment file uploaded: ${result.path} by user ${userId}`);

      return {
        url: result.url,
        originalName: result.originalName || file.originalname
      };
    } catch (error: unknown) {
      logger.error(`Error uploading assignment file: ${error}`);
      throw error;
    }
  }
}



