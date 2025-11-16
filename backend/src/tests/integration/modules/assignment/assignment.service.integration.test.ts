/**
 * Assignment Service Integration Tests
 */

import { Sequelize } from 'sequelize';
import { AssignmentService } from '../../../../modules/assignment';
import User from '../../../../models/user.model';
import Course from '../../../../models/course.model';
import Enrollment from '../../../../models/enrollment.model';
import { generateUUID } from '../../../utils/test.utils';
import { getSequelize } from '../../../../config/db';

const wantsSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.SQLITE === 'true';
let sqliteAvailable = true;
if (wantsSqlite) {
  try { require('sqlite3'); } catch { sqliteAvailable = false; }
}
const maybeDescribe: jest.Describe = (wantsSqlite && !sqliteAvailable) ? (describe.skip as any) : (describe as any);

maybeDescribe('AssignmentService Integration', () => {
  let assignmentService: AssignmentService;
  let sequelize: Sequelize;
  let instructorId: string;
  let studentId: string;
  let courseId: string;

  beforeAll(async () => {
    assignmentService = new AssignmentService();
    sequelize = getSequelize();
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await cleanupTables();
    await seedBaseData();
  });

  const cleanupTables = async () => {
    await sequelize.query('DELETE FROM assignment_submissions');
    await sequelize.query('DELETE FROM assignments');
    await sequelize.query('DELETE FROM enrollments');
    await sequelize.query('DELETE FROM courses');
    await sequelize.query('DELETE FROM users');
  };

  const seedBaseData = async () => {
    instructorId = generateUUID();
    studentId = generateUUID();
    courseId = generateUUID();

    await (User as any).create({
      id: instructorId,
      email: `instructor-${instructorId}@example.com`,
      username: `instructor_${instructorId.slice(0, 8)}`,
      password_hash: 'TestPassword123!',
      first_name: 'Instructor',
      last_name: 'User',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false
    });

    await (User as any).create({
      id: studentId,
      email: `student-${studentId}@example.com`,
      username: `student_${studentId.slice(0, 8)}`,
      password_hash: 'TestPassword123!',
      first_name: 'Student',
      last_name: 'User',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false
    });

    await (Course as any).create({
      id: courseId,
      instructor_id: instructorId,
      title: 'Integration Testing 101',
      description: 'Course used for assignment tests',
      status: 'published',
      price: 0,
      currency: 'USD',
      is_free: true,
      total_lessons: 0,
      total_students: 0
    });

    await (Enrollment as any).create({
      id: generateUUID(),
      user_id: studentId,
      course_id: courseId,
      status: 'active',
      enrollment_type: 'free',
      progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: 0
    });
  };

  const buildAssignmentDto = (overrides: Record<string, unknown> = {}) => ({
    course_id: courseId,
    title: 'Assignment Alpha',
    description: 'Complete all tasks',
    max_score: 100,
    due_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    allow_late_submission: false,
    submission_type: 'text',
    is_published: true,
    ...overrides
  });

  it('should allow the instructor to create an assignment for their course', async () => {
    const assignment = await assignmentService.createAssignment(instructorId, buildAssignmentDto());

    expect(assignment).toBeDefined();
    expect(assignment.course_id).toBe(courseId);
    expect(assignment.title).toBe('Assignment Alpha');
  });

  it('should prevent non-instructors from creating assignments', async () => {
    await expect(
      assignmentService.createAssignment(studentId, buildAssignmentDto())
    ).rejects.toThrow('Only the course instructor can perform this action');
  });

  it('should allow an enrolled student to submit once and block duplicates', async () => {
    const assignment = await assignmentService.createAssignment(instructorId, buildAssignmentDto());

    const submission = await assignmentService.submitAssignment(assignment.id, studentId, {
      submission_text: 'My completed work'
    });

    expect(submission).toBeDefined();
    expect(submission.assignment_id).toBe(assignment.id);
    expect(submission.user_id).toBe(studentId);

    await expect(
      assignmentService.submitAssignment(assignment.id, studentId, { submission_text: 'Sending twice' })
    ).rejects.toThrow('Assignment already submitted');
  });

  it('should allow instructors to grade submissions and reject unauthorized graders', async () => {
    const assignment = await assignmentService.createAssignment(instructorId, buildAssignmentDto());
    const submission = await assignmentService.submitAssignment(assignment.id, studentId, {
      submission_text: 'Ready to grade'
    });

    const graded = await assignmentService.gradeSubmission(submission.id, instructorId, {
      score: 85,
      feedback: 'Great job'
    });

    expect(graded).toBeDefined();
    expect(Number(graded?.score)).toBe(85);
    expect(graded?.feedback).toBe('Great job');

    await expect(
      assignmentService.gradeSubmission(submission.id, studentId, { score: 50 })
    ).rejects.toThrow('Only the course instructor can perform this action');
  });
});

