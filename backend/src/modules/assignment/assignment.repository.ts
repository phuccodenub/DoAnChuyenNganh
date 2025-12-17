import { Assignment, AssignmentSubmission, User, Course, Section } from '../../models';
import { Op } from 'sequelize';
import type { ModelStatic, WhereOptions } from '../../types/sequelize-types';
import type {
  AssignmentInstance,
  AssignmentCreationAttributes,
  AssignmentAttributes,
  AssignmentSubmissionInstance,
  AssignmentSubmissionCreationAttributes,
  AssignmentSubmissionAttributes
} from '../../types/model.types';

export class AssignmentRepository {
  private readonly AssignmentModel = Assignment as unknown as ModelStatic<AssignmentInstance>;
  private readonly AssignmentSubmissionModel = AssignmentSubmission as unknown as ModelStatic<AssignmentSubmissionInstance>;

  // ===================================
  // ASSIGNMENT CRUD
  // ===================================

  async createAssignment(data: AssignmentCreationAttributes): Promise<AssignmentInstance> {
    return this.AssignmentModel.create(data);
  }

  async getAssignmentById(id: string): Promise<AssignmentInstance | null> {
    return this.AssignmentModel.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor_id']
        }
      ]
    });
  }

  async updateAssignment(assignmentId: string, data: Partial<AssignmentAttributes>): Promise<AssignmentInstance | null> {
    await this.AssignmentModel.update(data, { where: { id: assignmentId } as WhereOptions<AssignmentAttributes> });
    return this.getAssignmentById(assignmentId);
  }

  async deleteAssignment(assignmentId: string): Promise<number> {
    return this.AssignmentModel.destroy({ where: { id: assignmentId } as WhereOptions<AssignmentAttributes> });
  }

  async getCourseAssignments(courseId: string, includeUnpublished: boolean = false): Promise<AssignmentInstance[]> {
    const { default: Section } = await import('../../models/section.model');
    const sections = await (Section as any).findAll({ where: { course_id: courseId }, attributes: ['id'] });
    const sectionIds = sections.map((s: any) => s.id);

    // Tìm assignments: course-level (course_id = courseId) hoặc section-level (section_id trong danh sách sectionIds)
    const whereClause: WhereOptions<AssignmentAttributes> = {
      [Op.or]: [
        { course_id: courseId },
        ...(sectionIds.length ? [{ section_id: sectionIds }] : [])
      ]
    };
    
    if (!includeUnpublished) {
      (whereClause as any).is_published = true;
    }

    const assignments = await this.AssignmentModel.findAll({
      where: whereClause,
      order: [['due_date', 'ASC'], ['created_at', 'DESC']],
      // Không cần specify attributes - lấy tất cả fields để đảm bảo section_id có trong response
      // Sequelize sẽ tự động serialize sang JSON khi response
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    // Convert Sequelize instances to plain objects để đảm bảo section_id có trong response
    // Giống như quiz - Sequelize tự serialize nhưng convert explicit để chắc chắn
    return assignments.map((a: any) => {
      const plain = a.toJSON ? a.toJSON() : a;
      // Đảm bảo section_id có trong response (kể cả khi null)
      return {
        ...plain,
        section_id: plain.section_id || null,
        course_id: plain.course_id || null
      };
    }) as any;
  }

  // ===================================
  // SUBMISSION CRUD
  // ===================================

  async submit(assignmentId: string, userId: string, data: Partial<AssignmentSubmissionCreationAttributes>): Promise<AssignmentSubmissionInstance> {
    return this.AssignmentSubmissionModel.create({ 
      assignment_id: assignmentId, 
      user_id: userId, 
      submitted_at: new Date(),
      status: 'submitted',
      ...data 
    });
  }

  async getSubmissionById(submissionId: string): Promise<AssignmentSubmissionInstance | null> {
    return this.AssignmentSubmissionModel.findByPk(submissionId);
  }

  async updateSubmission(submissionId: string, data: Partial<AssignmentSubmissionAttributes>): Promise<AssignmentSubmissionInstance | null> {
    await this.AssignmentSubmissionModel.update(
      { ...data, submitted_at: new Date() },
      { where: { id: submissionId } as WhereOptions<AssignmentSubmissionAttributes> }
    );
    return this.getSubmissionById(submissionId);
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.AssignmentSubmissionModel.destroy({
      where: { id: submissionId } as WhereOptions<AssignmentSubmissionAttributes>
    });
  }

  async getUserSubmission(assignmentId: string, userId: string): Promise<AssignmentSubmissionInstance | null> {
    return this.AssignmentSubmissionModel.findOne({
      where: {
        assignment_id: assignmentId,
        user_id: userId
      } as WhereOptions<AssignmentSubmissionAttributes>,
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'max_score', 'due_date']
        },
        {
          model: User,
          as: 'grader',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ]
    });
  }

  async getSubmissionWithDetails(submissionId: string): Promise<AssignmentSubmissionInstance | null> {
    return this.AssignmentSubmissionModel.findByPk(submissionId, {
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'description', 'max_score', 'due_date'],
          required: false
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ]
    });
  }

  // ===================================
  // GRADING
  // ===================================

  async grade(submissionId: string, data: { score?: number; feedback?: string; graded_by: string }): Promise<AssignmentSubmissionInstance | null> {
    const submission = await this.AssignmentSubmissionModel.findByPk(submissionId);
    if (!submission) return null;

    await (submission as any).update({
      score: data.score ?? submission.score,
      feedback: data.feedback ?? submission.feedback,
      graded_by: data.graded_by,
      status: 'graded',
      graded_at: new Date()
    });

    return this.getSubmissionWithDetails(submissionId);
  }

  // ===================================
  // INSTRUCTOR FEATURES
  // ===================================

  async getAssignmentSubmissions(assignmentId: string, page: number = 1, limit: number = 20): Promise<{ rows: AssignmentSubmissionInstance[]; count: number }> {
    const offset = (page - 1) * limit;
    
    return (this.AssignmentSubmissionModel as any).findAndCountAll({
      where: { assignment_id: assignmentId } as WhereOptions<AssignmentSubmissionAttributes>,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ],
      order: [['submitted_at', 'DESC']],
      limit,
      offset
    });
  }

  async getAssignmentStatistics(assignmentId: string): Promise<{
    total_submissions: number;
    graded_submissions: number;
    pending_submissions: number;
    average_score: number;
    late_submissions: number;
    grading_progress: number;
  }> {
    const { getSequelize } = await import('../../config/db');
    const sequelize = getSequelize();

    const totalSubmissions = await this.AssignmentSubmissionModel.count({
      where: { assignment_id: assignmentId } as WhereOptions<AssignmentSubmissionAttributes>
    });

    const gradedSubmissions = await this.AssignmentSubmissionModel.count({
      where: { 
        assignment_id: assignmentId,
        status: 'graded'
      } as WhereOptions<AssignmentSubmissionAttributes>
    });

    const averageScore = await (this.AssignmentSubmissionModel as any).findOne({
      where: {
        assignment_id: assignmentId,
        status: 'graded'
      } as WhereOptions<AssignmentSubmissionAttributes>,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'average_score']
      ],
      raw: true
    }) as { average_score: string | null } | null;

    // Calculate late submissions: need to get assignment due_date and compare with submitted_at
    const assignment = await this.AssignmentModel.findByPk(assignmentId, {
      attributes: ['id', 'due_date']
    });

    let lateSubmissions = 0;
    if (assignment && (assignment as any).due_date) {
      const dueDate = new Date((assignment as any).due_date);
      const { Op } = await import('sequelize');
      
      // Count submissions where submitted_at > due_date
      lateSubmissions = await this.AssignmentSubmissionModel.count({
        where: { 
          assignment_id: assignmentId,
          submitted_at: {
            [Op.gt]: dueDate
          }
        } as WhereOptions<AssignmentSubmissionAttributes>
      });
    }

    return {
      total_submissions: totalSubmissions,
      graded_submissions: gradedSubmissions,
      pending_submissions: totalSubmissions - gradedSubmissions,
      average_score: parseFloat(averageScore?.average_score || '0'),
      late_submissions: lateSubmissions,
      grading_progress: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0
    };
  }

  async getStudentAssignments(courseId: string, userId: string): Promise<AssignmentInstance[]> {
    return this.AssignmentModel.findAll({
      where: {
        course_id: courseId,
        is_published: true
      } as WhereOptions<AssignmentAttributes>,
      include: [
        {
          model: AssignmentSubmission,
          as: 'submissions',
          where: { user_id: userId },
          required: false,
          attributes: ['id', 'status', 'score', 'submitted_at', 'graded_at']
        }
      ],
      order: [['due_date', 'ASC']]
    });
  }

  // ===================================
  // COURSE STATISTICS
  // ===================================

  /**
   * Get assignment statistics for a course (instructor dashboard)
   */
  async getCourseAssignmentStats(courseId: string): Promise<{
    total_assignments: number;
    total_submissions: number;
    pending_grading: number;
    graded_submissions: number;
    average_score: number;
    assignments: Array<{
      id: string;
      title: string;
      due_date: Date | null;
      total_submissions: number;
      pending_grading: number;
      average_score: number;
    }>;
  }> {
    // Get all assignments for the course
    const assignments = await this.AssignmentModel.findAll({
      where: { course_id: courseId } as WhereOptions<AssignmentAttributes>,
      order: [['due_date', 'ASC']]
    });

    let totalSubmissions = 0;
    let totalPendingGrading = 0;
    let totalGraded = 0;
    let totalScore = 0;
    let scoredCount = 0;

    const assignmentStats = await Promise.all(
      assignments.map(async (assignment) => {
        const stats = await this.getAssignmentStatistics(assignment.id);
        
        totalSubmissions += stats.total_submissions;
        totalPendingGrading += stats.pending_submissions;
        totalGraded += stats.graded_submissions;
        
        if (stats.graded_submissions > 0) {
          totalScore += stats.average_score * stats.graded_submissions;
          scoredCount += stats.graded_submissions;
        }

        return {
          id: assignment.id,
          title: assignment.title,
          due_date: assignment.due_date || null,
          total_submissions: stats.total_submissions,
          pending_grading: stats.pending_submissions,
          average_score: stats.average_score
        };
      })
    );

    return {
      total_assignments: assignments.length,
      total_submissions: totalSubmissions,
      pending_grading: totalPendingGrading,
      graded_submissions: totalGraded,
      average_score: scoredCount > 0 ? totalScore / scoredCount : 0,
      assignments: assignmentStats
    };
  }

  // ===================================
  // PENDING GRADING
  // ===================================

  /**
   * Get all pending submissions for grading (instructor's courses)
   */
  async getPendingGrading(instructorId: string, page: number = 1, limit: number = 20): Promise<{
    rows: AssignmentSubmissionInstance[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;

    // First get all courses by this instructor
    const instructorCourses = await Course.findAll({
      where: { instructor_id: instructorId },
      attributes: ['id']
    });

    const courseIds = instructorCourses.map((c: any) => c.id);

    if (courseIds.length === 0) {
      return {
        rows: [],
        count: 0,
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    // Get assignments for these courses
    const assignments = await this.AssignmentModel.findAll({
      where: { course_id: courseIds } as any,
      attributes: ['id']
    });

    const assignmentIds = assignments.map((a: any) => a.id);

    if (assignmentIds.length === 0) {
      return {
        rows: [],
        count: 0,
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }

    // Get pending submissions
    const { rows, count } = await (this.AssignmentSubmissionModel as any).findAndCountAll({
      where: {
        assignment_id: assignmentIds,
        status: 'submitted'
      } as WhereOptions<AssignmentSubmissionAttributes>,
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'course_id', 'max_score', 'due_date'],
          include: [{
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          }]
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email', 'avatar_url']
        }
      ],
      order: [['submitted_at', 'ASC']], // Oldest first for grading priority
      limit,
      offset
    });

    return {
      rows,
      count,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get pending submissions for a specific course
   */
  async getCoursePendingGrading(courseId: string, page: number = 1, limit: number = 20): Promise<{
    rows: AssignmentSubmissionInstance[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get assignments for this course
      const assignments = await this.AssignmentModel.findAll({
        where: { course_id: courseId } as WhereOptions<AssignmentAttributes>,
        attributes: ['id']
      });

      const assignmentIds = assignments.map((a: any) => a.id);

      if (assignmentIds.length === 0) {
        return {
          rows: [],
          count: 0,
          pagination: { page, limit, total: 0, totalPages: 0 }
        };
      }

      // Get pending submissions - use Op.in for array
      const { Op } = await import('sequelize');
      const { rows, count } = await (this.AssignmentSubmissionModel as any).findAndCountAll({
        where: {
          assignment_id: { [Op.in]: assignmentIds },
          status: 'submitted'
        },
        include: [
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['id', 'title', 'max_score', 'due_date'],
            required: false
          },
          {
            model: User,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar_url'],
            required: false
          }
        ],
        order: [['submitted_at', 'ASC']],
        limit,
        offset
      });

      return {
        rows: rows || [],
        count: count || 0,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error in getCoursePendingGrading:', error);
      // Return empty result instead of throwing
      return {
        rows: [],
        count: 0,
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Get all assignments for a student from their enrolled courses (with status and stats)
   */
  async getMyAssignmentsWithStats(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<any> {
    try {
      const { Op } = await import('sequelize');
      const { Enrollment } = await import('../../models');
      
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;

      // Get enrolled course IDs
      const enrollments = await Enrollment.findAll({
        where: { user_id: userId },
        attributes: ['course_id'],
        raw: true
      });
      
      const courseIds = enrollments.map((e: any) => e.course_id);
      
      if (courseIds.length === 0) {
        return {
          assignments: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          stats: { pending: 0, overdue: 0, submitted: 0, graded: 0, total: 0 }
        };
      }

      // Get section IDs for enrolled courses to include section-level assignments
      const { Section } = await import('../../models');
      const sections = await Section.findAll({
        where: { course_id: { [Op.in]: courseIds } },
        attributes: ['id', 'course_id'],
        raw: true
      });
      const sectionIds = sections.map((s: any) => s.id);

      // Build where clause for assignments:
      // 1. Course-level assignments (course_id is set, section_id is null)
      // 2. Section-level assignments (section_id is set, course_id may be null)
      // Also only include published assignments for students
      const assignmentWhere: any = {
        is_published: true, // Only published assignments for students
        [Op.or]: [
          // Course-level assignments
          { course_id: { [Op.in]: courseIds } },
          // Section-level assignments
          ...(sectionIds.length > 0 ? [{ section_id: { [Op.in]: sectionIds } }] : [])
        ]
      };

      if (options.search) {
        assignmentWhere.title = { [Op.iLike]: `%${options.search}%` };
      }

      // Get all assignments from enrolled courses (course-level and section-level)
      const assignments = await this.AssignmentModel.findAll({
        where: assignmentWhere,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'thumbnail'],
            required: false // Allow section-level assignments without direct course relation
          },
          {
            model: Section,
            as: 'section',
            attributes: ['id', 'title', 'course_id'],
            required: false,
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'title', 'thumbnail']
              }
            ]
          }
        ],
        order: [['due_date', 'ASC']],
        raw: false
      });

      // Get submissions for this user
      const assignmentIds = assignments.map((a: any) => a.id);
      const submissions = await this.AssignmentSubmissionModel.findAll({
        where: {
          assignment_id: { [Op.in]: assignmentIds },
          user_id: userId
        },
        raw: true
      });

      // Map submissions by assignment_id
      const submissionMap = new Map<string, any>();
      submissions.forEach((sub: any) => {
        submissionMap.set(sub.assignment_id, sub);
      });

      // Calculate status for each assignment
      const now = new Date();
      const assignmentsWithStatus = assignments.map((assignment: any) => {
        const a = assignment.toJSON ? assignment.toJSON() : assignment;
        const submission = submissionMap.get(a.id);
        
        let status = 'pending';
        if (submission) {
          if (submission.graded_at) {
            status = 'graded';
          } else if (submission.submitted_at && a.due_date && new Date(submission.submitted_at) > new Date(a.due_date)) {
            status = 'late';
          } else {
            status = 'submitted';
          }
        } else if (a.due_date && new Date(a.due_date) < now) {
          status = 'overdue';
        }

        // Handle both course-level and section-level assignments
        // For section-level: get course info from section.course
        const courseFromSection = a.section?.course;
        const course = a.course || courseFromSection;
        const effectiveCourseId = a.course_id || a.section?.course_id || course?.id;

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          course_id: effectiveCourseId,
          section_id: a.section_id,
          section_name: a.section?.title || null,
          course_name: course?.title || '',
          course_thumbnail: course?.thumbnail || null,
          due_date: a.due_date,
          status,
          max_score: a.max_score, // Trả đúng tên trường để frontend hiển thị tổng điểm
          score: submission?.score || null,
          submitted_at: submission?.submitted_at || null,
          graded_at: submission?.graded_at || null,
          feedback: submission?.feedback || null
        };
      });

      // Filter by status if specified
      let filteredAssignments = assignmentsWithStatus;
      if (options.status && options.status !== 'all') {
        filteredAssignments = assignmentsWithStatus.filter((a: any) => a.status === options.status);
      }

      // Calculate stats
      const stats = {
        pending: assignmentsWithStatus.filter((a: any) => a.status === 'pending').length,
        overdue: assignmentsWithStatus.filter((a: any) => a.status === 'overdue').length,
        submitted: assignmentsWithStatus.filter((a: any) => a.status === 'submitted' || a.status === 'late').length,
        graded: assignmentsWithStatus.filter((a: any) => a.status === 'graded').length,
        total: assignmentsWithStatus.length
      };

      // Paginate
      const paginatedAssignments = filteredAssignments.slice(offset, offset + limit);

      return {
        assignments: paginatedAssignments,
        pagination: {
          page,
          limit,
          total: filteredAssignments.length,
          totalPages: Math.ceil(filteredAssignments.length / limit)
        },
        stats
      };
    } catch (error) {
      console.error('Error in getStudentAssignments:', error);
      return {
        assignments: [],
        pagination: { page: options.page || 1, limit: options.limit || 20, total: 0, totalPages: 0 },
        stats: { pending: 0, overdue: 0, submitted: 0, graded: 0, total: 0 }
      };
    }
  }
}



