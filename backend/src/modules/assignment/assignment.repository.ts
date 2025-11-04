import { Assignment, AssignmentSubmission, User, Course } from '../../models';
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
    const whereClause: WhereOptions<AssignmentAttributes> = { course_id: courseId };
    
    if (!includeUnpublished) {
      whereClause.is_published = true;
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
          attributes: ['id', 'title', 'description', 'max_score', 'due_date']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'grader',
          attributes: ['id', 'first_name', 'last_name', 'email']
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
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'grader',
          attributes: ['id', 'first_name', 'last_name', 'email']
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

    const averageScore = await this.AssignmentSubmissionModel.findOne({
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
}



