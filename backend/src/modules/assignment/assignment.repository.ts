import { Assignment, AssignmentSubmission, User, Course } from '../../models';
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
    const { default: Lesson } = await import('../../models/lesson.model');
    const sections = await (Section as any).findAll({ where: { course_id: courseId }, attributes: ['id'] });
    const sectionIds = sections.map((s: any) => s.id);
    const lessons = sectionIds.length
      ? await (Lesson as any).findAll({ where: { section_id: sectionIds }, attributes: ['id'] })
      : [];
    const lessonIds = lessons.map((l: any) => l.id);

    const whereClause: WhereOptions<AssignmentAttributes> = {
      [Op.or]: [
        { course_id: courseId },
        ...(lessonIds.length ? [{ lesson_id: lessonIds }] : [])
      ]
    };
    
    if (!includeUnpublished) {
      (whereClause as any).is_published = true;
    }

    return this.AssignmentModel.findAll({
      where: whereClause,
      order: [['due_date', 'ASC'], ['created_at', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
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
        [(Assignment as any).sequelize!.fn('AVG', (Assignment as any).sequelize!.col('score')), 'average_score']
      ],
      raw: true
    }) as { average_score: string | null } | null;

    const lateSubmissions = await this.AssignmentSubmissionModel.count({
      where: { 
        assignment_id: assignmentId,
        is_late: true
      } as WhereOptions<AssignmentSubmissionAttributes>
    });

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
}



