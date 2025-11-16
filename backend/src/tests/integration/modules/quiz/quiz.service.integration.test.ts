/**
 * Quiz Service Integration Tests
 */

import { Sequelize } from 'sequelize';
import { QuizService } from '../../../../modules/quiz';
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

maybeDescribe('QuizService Integration', () => {
  let quizService: QuizService;
  let sequelize: Sequelize;
  let instructorId: string;
  let studentId: string;
  let courseId: string;

  beforeAll(async () => {
    quizService = new QuizService();
    sequelize = getSequelize();
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await cleanupTables();
    await seedBaseData();
  });

  const cleanupTables = async () => {
    await sequelize.query('DELETE FROM quiz_answers');
    await sequelize.query('DELETE FROM quiz_options');
    await sequelize.query('DELETE FROM quiz_questions');
    await sequelize.query('DELETE FROM quiz_attempts');
    await sequelize.query('DELETE FROM quizzes');
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
      email_verified: true
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
      email_verified: true
    });

    await (Course as any).create({
      id: courseId,
      instructor_id: instructorId,
      title: 'Quiz Ready Course',
      description: 'Used for quiz integration tests',
      status: 'published',
      price: 0,
      currency: 'USD',
      is_free: true
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

  const buildQuizDto = (overrides: Record<string, unknown> = {}) => ({
    course_id: courseId,
    title: 'Midterm Quiz',
    description: 'Covers chapters 1-3',
    duration_minutes: 30,
    max_attempts: 2,
    passing_score: 60,
    is_published: true,
    show_correct_answers: true,
    shuffle_questions: false,
    ...overrides
  });

  it('should allow instructors to create quizzes', async () => {
    const quiz = await quizService.createQuiz(instructorId, buildQuizDto());

    expect(quiz).toBeDefined();
    expect(quiz.course_id).toBe(courseId);
    expect(quiz.title).toBe('Midterm Quiz');
  });

  it('should prevent non-instructors from creating quizzes', async () => {
    await expect(
      quizService.createQuiz(studentId, buildQuizDto())
    ).rejects.toThrow('Only the course instructor can perform this action');
  });

  it('should allow students to complete a quiz attempt end-to-end', async () => {
    const quiz = await quizService.createQuiz(instructorId, buildQuizDto());

    const question = await quizService.addQuestion(quiz.id, instructorId, {
      question_text: 'What is 2 + 2?',
      question_type: 'single_choice',
      order_index: 1,
      points: 10
    });

    const correctOption = await quizService.addOption(question.id, instructorId, {
      option_text: '4',
      is_correct: true,
      order_index: 1
    });

    await quizService.addOption(question.id, instructorId, {
      option_text: '5',
      is_correct: false,
      order_index: 2
    });

    const attempt = await quizService.startQuizAttempt(quiz.id, studentId);
    expect(attempt.quiz_id).toBe(quiz.id);
    expect(attempt.status).toBe('in_progress');

    const result = await quizService.submitQuizAttempt(attempt.id, studentId, {
      answers: [{
        question_id: question.id,
        selected_option_id: correctOption.id
      }]
    });

    expect(result).toBeDefined();
    expect(result.score).toBe(100);
    expect(result.answers).toHaveLength(1);
  });
});

