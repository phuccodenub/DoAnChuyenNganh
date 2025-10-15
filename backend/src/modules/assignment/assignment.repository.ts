import { Assignment, AssignmentSubmission, User, Course } from '../../models';
import { Op } from 'sequelize';

export class AssignmentRepository {
  // ===================================
  // ASSIGNMENT CRUD
  // ===================================

  async createAssignment(data: any) {
    return await Assignment.create(data);
  }

  async getAssignmentById(id: string) {
    return await Assignment.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor_id']
        }
      ]
    });
  }

  async updateAssignment(assignmentId: string, data: any) {
    await Assignment.update(data, { where: { id: assignmentId } });
    return await this.getAssignmentById(assignmentId);
  }

  async deleteAssignment(assignmentId: string) {
    return await Assignment.destroy({ where: { id: assignmentId } });
  }

  async getCourseAssignments(courseId: string, includeUnpublished: boolean = false) {
    const whereClause: any = { course_id: courseId };
    
    if (!includeUnpublished) {
      whereClause.is_published = true;
    }

    return await Assignment.findAll({
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

  async submit(assignmentId: string, userId: string, data: any) {
    return await AssignmentSubmission.create({ 
      assignment_id: assignmentId, 
      user_id: userId, 
      submitted_at: new Date(),
      status: 'submitted',
      ...data 
    });
  }

  async getSubmissionById(submissionId: string) {
    return await AssignmentSubmission.findByPk(submissionId);
  }

  async updateSubmission(submissionId: string, data: any) {
    await AssignmentSubmission.update(
      { ...data, submitted_at: new Date() },
      { where: { id: submissionId } }
    );
    return await this.getSubmissionById(submissionId);
  }

  async getUserSubmission(assignmentId: string, userId: string) {
    return await AssignmentSubmission.findOne({
      where: {
        assignment_id: assignmentId,
        user_id: userId
      },
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'max_score', 'due_date']
        }
      ]
    });
  }

  async getSubmissionWithDetails(submissionId: string) {
    return await AssignmentSubmission.findByPk(submissionId, {
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

  async grade(submissionId: string, data: { score?: number; feedback?: string; graded_by: string }) {
    const submission = await AssignmentSubmission.findByPk(submissionId);
    if (!submission) return null;

    await submission.update({
      score: data.score ?? submission.score,
      feedback: data.feedback ?? submission.feedback,
      graded_by: data.graded_by,
      status: 'graded',
      graded_at: new Date()
    });

    return await this.getSubmissionWithDetails(submissionId);
  }

  // ===================================
  // INSTRUCTOR FEATURES
  // ===================================

  async getAssignmentSubmissions(assignmentId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    return await AssignmentSubmission.findAndCountAll({
      where: { assignment_id: assignmentId },
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

  async getAssignmentStatistics(assignmentId: string) {
    const totalSubmissions = await AssignmentSubmission.count({
      where: { assignment_id: assignmentId }
    });

    const gradedSubmissions = await AssignmentSubmission.count({
      where: { 
        assignment_id: assignmentId,
        status: 'graded'
      }
    });

    const averageScore = await AssignmentSubmission.findOne({
      where: { 
        assignment_id: assignmentId,
        status: 'graded',
        score: { [Op.not]: null }
      },
      attributes: [
        [Assignment.sequelize!.fn('AVG', Assignment.sequelize!.col('score')), 'average_score']
      ],
      raw: true
    });

    const lateSubmissions = await AssignmentSubmission.count({
      where: { 
        assignment_id: assignmentId,
        is_late: true
      }
    });

    return {
      total_submissions: totalSubmissions,
      graded_submissions: gradedSubmissions,
      pending_submissions: totalSubmissions - gradedSubmissions,
      average_score: parseFloat((averageScore as any)?.average_score || '0'),
      late_submissions: lateSubmissions,
      grading_progress: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0
    };
  }

  async getStudentAssignments(courseId: string, userId: string) {
    return await Assignment.findAll({
      where: {
        course_id: courseId,
        is_published: true
      },
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



