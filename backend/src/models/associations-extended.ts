/**
 * Extended Model Associations
 * Phần bổ sung cho associations.ts - chứa associations cho Quiz, Assignment, Grade, LiveStream, Analytics
 * 
 * Import và gọi setupExtendedAssociations() sau setupAssociations() trong db.ts
 */

import Course from './course.model';
import User from './user.model';
import Quiz from './quiz.model';
import QuizQuestion from './quiz-question.model';
import QuizOption from './quiz-option.model';
import QuizAttempt from './quiz-attempt.model';
import QuizAnswer from './quiz-answer.model';
import Assignment from './assignment.model';
import AssignmentSubmission from './assignment-submission.model';
import GradeComponent from './grade-component.model';
import Grade from './grade.model';
import FinalGrade from './final-grade.model';
import LiveSession from './live-session.model';
import LiveSessionAttendance from './live-session-attendance.model';
import UserActivityLog from './user-activity-log.model';
import CourseStatistics from './course-statistics.model';

export const setupExtendedAssociations = () => {
  // ===================================
  // QUIZ RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Quiz
  Course.hasMany(Quiz, {
    foreignKey: 'course_id',
    as: 'quizzes',
    onDelete: 'CASCADE'
  });
  Quiz.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Quiz 1 ---< QuizQuestion
  Quiz.hasMany(QuizQuestion, {
    foreignKey: 'quiz_id',
    as: 'questions',
    onDelete: 'CASCADE'
  });
  QuizQuestion.belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  // QuizQuestion 1 ---< QuizOption
  QuizQuestion.hasMany(QuizOption, {
    foreignKey: 'question_id',
    as: 'options',
    onDelete: 'CASCADE'
  });
  QuizOption.belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  // User >---< Quiz (through QuizAttempt)
  User.belongsToMany(Quiz, {
    through: QuizAttempt,
    foreignKey: 'user_id',
    otherKey: 'quiz_id',
    as: 'attemptedQuizzes'
  });
  Quiz.belongsToMany(User, {
    through: QuizAttempt,
    foreignKey: 'quiz_id',
    otherKey: 'user_id',
    as: 'attemptedByUsers'
  });

  // Direct associations for QuizAttempt
  User.hasMany(QuizAttempt, {
    foreignKey: 'user_id',
    as: 'quizAttempts'
  });
  QuizAttempt.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Quiz.hasMany(QuizAttempt, {
    foreignKey: 'quiz_id',
    as: 'attempts'
  });
  QuizAttempt.belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  // QuizAttempt 1 ---< QuizAnswer
  QuizAttempt.hasMany(QuizAnswer, {
    foreignKey: 'attempt_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });
  QuizAnswer.belongsTo(QuizAttempt, {
    foreignKey: 'attempt_id',
    as: 'attempt'
  });

  // QuizQuestion 1 ---< QuizAnswer
  QuizQuestion.hasMany(QuizAnswer, {
    foreignKey: 'question_id',
    as: 'answers'
  });
  QuizAnswer.belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  // QuizOption 1 ---< QuizAnswer (selected option)
  QuizOption.hasMany(QuizAnswer, {
    foreignKey: 'selected_option_id',
    as: 'selectedInAnswers'
  });
  QuizAnswer.belongsTo(QuizOption, {
    foreignKey: 'selected_option_id',
    as: 'selectedOption'
  });

  // ===================================
  // ASSIGNMENT RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Assignment
  Course.hasMany(Assignment, {
    foreignKey: 'course_id',
    as: 'assignments',
    onDelete: 'CASCADE'
  });
  Assignment.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User >---< Assignment (through AssignmentSubmission)
  User.belongsToMany(Assignment, {
    through: AssignmentSubmission,
    foreignKey: 'user_id',
    otherKey: 'assignment_id',
    as: 'submittedAssignments'
  });
  Assignment.belongsToMany(User, {
    through: AssignmentSubmission,
    foreignKey: 'assignment_id',
    otherKey: 'user_id',
    as: 'submitters'
  });

  // Direct associations for AssignmentSubmission
  User.hasMany(AssignmentSubmission, {
    foreignKey: 'user_id',
    as: 'assignmentSubmissions'
  });
  AssignmentSubmission.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  Assignment.hasMany(AssignmentSubmission, {
    foreignKey: 'assignment_id',
    as: 'submissions'
  });
  AssignmentSubmission.belongsTo(Assignment, {
    foreignKey: 'assignment_id',
    as: 'assignment'
  });

  // User (grader) 1 ---< AssignmentSubmission
  User.hasMany(AssignmentSubmission, {
    foreignKey: 'graded_by',
    as: 'gradedSubmissions'
  });
  AssignmentSubmission.belongsTo(User, {
    foreignKey: 'graded_by',
    as: 'grader'
  });

  // ===================================
  // GRADE RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< GradeComponent
  Course.hasMany(GradeComponent, {
    foreignKey: 'course_id',
    as: 'gradeComponents',
    onDelete: 'CASCADE'
  });
  GradeComponent.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User, Course, GradeComponent -> Grade
  User.hasMany(Grade, {
    foreignKey: 'user_id',
    as: 'grades'
  });
  Grade.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  Course.hasMany(Grade, {
    foreignKey: 'course_id',
    as: 'grades'
  });
  Grade.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  GradeComponent.hasMany(Grade, {
    foreignKey: 'component_id',
    as: 'grades'
  });
  Grade.belongsTo(GradeComponent, {
    foreignKey: 'component_id',
    as: 'component'
  });

  // User (grader) 1 ---< Grade
  User.hasMany(Grade, {
    foreignKey: 'graded_by',
    as: 'gradedGrades'
  });
  Grade.belongsTo(User, {
    foreignKey: 'graded_by',
    as: 'grader'
  });

  // User, Course -> FinalGrade
  User.hasMany(FinalGrade, {
    foreignKey: 'user_id',
    as: 'finalGrades'
  });
  FinalGrade.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  Course.hasMany(FinalGrade, {
    foreignKey: 'course_id',
    as: 'finalGrades'
  });
  FinalGrade.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ===================================
  // LIVESTREAM RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< LiveSession
  Course.hasMany(LiveSession, {
    foreignKey: 'course_id',
    as: 'liveSessions',
    onDelete: 'CASCADE'
  });
  LiveSession.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User (instructor) 1 ---< LiveSession
  User.hasMany(LiveSession, {
    foreignKey: 'instructor_id',
    as: 'hostedSessions'
  });
  LiveSession.belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // User >---< LiveSession (through LiveSessionAttendance)
  User.belongsToMany(LiveSession, {
    through: LiveSessionAttendance,
    foreignKey: 'user_id',
    otherKey: 'session_id',
    as: 'attendedSessions'
  });
  LiveSession.belongsToMany(User, {
    through: LiveSessionAttendance,
    foreignKey: 'session_id',
    otherKey: 'user_id',
    as: 'attendees'
  });

  // Direct associations for LiveSessionAttendance
  User.hasMany(LiveSessionAttendance, {
    foreignKey: 'user_id',
    as: 'sessionAttendances'
  });
  LiveSessionAttendance.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'attendee'
  });

  LiveSession.hasMany(LiveSessionAttendance, {
    foreignKey: 'session_id',
    as: 'attendances'
  });
  LiveSessionAttendance.belongsTo(LiveSession, {
    foreignKey: 'session_id',
    as: 'session'
  });

  // ===================================
  // ANALYTICS RELATIONSHIPS
  // ===================================
  
  // User 1 ---< UserActivityLog
  User.hasMany(UserActivityLog, {
    foreignKey: 'user_id',
    as: 'activityLogs'
  });
  UserActivityLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Course 1 --- 1 CourseStatistics
  Course.hasOne(CourseStatistics, {
    foreignKey: 'course_id',
    as: 'statistics',
    onDelete: 'CASCADE'
  });
  CourseStatistics.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  console.log('✅ Extended model associations setup completed');
};

export default setupExtendedAssociations;






