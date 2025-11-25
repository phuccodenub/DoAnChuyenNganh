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
  (Course as any).hasMany(Quiz, {
    foreignKey: 'course_id',
    as: 'quizzes',
    onDelete: 'CASCADE'
  });
  (Quiz as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Quiz 1 ---< QuizQuestion
  (Quiz as any).hasMany(QuizQuestion, {
    foreignKey: 'quiz_id',
    as: 'questions',
    onDelete: 'CASCADE'
  });
  (QuizQuestion as any).belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  // QuizQuestion 1 ---< QuizOption
  (QuizQuestion as any).hasMany(QuizOption, {
    foreignKey: 'question_id',
    as: 'options',
    onDelete: 'CASCADE'
  });
  (QuizOption as any).belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  // User >---< Quiz (through QuizAttempt)
  (User as any).belongsToMany(Quiz, {
    through: QuizAttempt,
    foreignKey: 'user_id',
    otherKey: 'quiz_id',
    as: 'attemptedQuizzes'
  });
  (Quiz as any).belongsToMany(User, {
    through: QuizAttempt,
    foreignKey: 'quiz_id',
    otherKey: 'user_id',
    as: 'attemptedByUsers'
  });

  // Direct associations for QuizAttempt
  (User as any).hasMany(QuizAttempt, {
    foreignKey: 'user_id',
    as: 'quizAttempts'
  });
  (QuizAttempt as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  (Quiz as any).hasMany(QuizAttempt, {
    foreignKey: 'quiz_id',
    as: 'attempts'
  });
  (QuizAttempt as any).belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  // QuizAttempt 1 ---< QuizAnswer
  (QuizAttempt as any).hasMany(QuizAnswer, {
    foreignKey: 'attempt_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });
  (QuizAnswer as any).belongsTo(QuizAttempt, {
    foreignKey: 'attempt_id',
    as: 'attempt'
  });

  // QuizQuestion 1 ---< QuizAnswer
  (QuizQuestion as any).hasMany(QuizAnswer, {
    foreignKey: 'question_id',
    as: 'answers'
  });
  (QuizAnswer as any).belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  // QuizOption 1 ---< QuizAnswer (selected option)
  (QuizOption as any).hasMany(QuizAnswer, {
    foreignKey: 'selected_option_id',
    as: 'selectedInAnswers'
  });
  (QuizAnswer as any).belongsTo(QuizOption, {
    foreignKey: 'selected_option_id',
    as: 'selectedOption'
  });

  // ===================================
  // ASSIGNMENT RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Assignment
  (Course as any).hasMany(Assignment, {
    foreignKey: 'course_id',
    as: 'assignments',
    onDelete: 'CASCADE'
  });
  (Assignment as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User >---< Assignment (through AssignmentSubmission)
  (User as any).belongsToMany(Assignment, {
    through: AssignmentSubmission,
    foreignKey: 'user_id',
    otherKey: 'assignment_id',
    as: 'submittedAssignments'
  });
  (Assignment as any).belongsToMany(User, {
    through: AssignmentSubmission,
    foreignKey: 'assignment_id',
    otherKey: 'user_id',
    as: 'submitters'
  });

  // Direct associations for AssignmentSubmission
  (User as any).hasMany(AssignmentSubmission, {
    foreignKey: 'user_id',
    as: 'assignmentSubmissions'
  });
  (AssignmentSubmission as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  (Assignment as any).hasMany(AssignmentSubmission, {
    foreignKey: 'assignment_id',
    as: 'submissions'
  });
  (AssignmentSubmission as any).belongsTo(Assignment, {
    foreignKey: 'assignment_id',
    as: 'assignment'
  });

  // User (grader) 1 ---< AssignmentSubmission
  (User as any).hasMany(AssignmentSubmission, {
    foreignKey: 'graded_by',
    as: 'gradedSubmissions'
  });
  (AssignmentSubmission as any).belongsTo(User, {
    foreignKey: 'graded_by',
    as: 'grader'
  });

  // ===================================
  // GRADE RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< GradeComponent
  (Course as any).hasMany(GradeComponent, {
    foreignKey: 'course_id',
    as: 'gradeComponents',
    onDelete: 'CASCADE'
  });
  (GradeComponent as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User, Course, GradeComponent -> Grade
  (User as any).hasMany(Grade, {
    foreignKey: 'user_id',
    as: 'grades'
  });
  (Grade as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  (Course as any).hasMany(Grade, {
    foreignKey: 'course_id',
    as: 'grades'
  });
  (Grade as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  (GradeComponent as any).hasMany(Grade, {
    foreignKey: 'component_id',
    as: 'grades'
  });
  (Grade as any).belongsTo(GradeComponent, {
    foreignKey: 'component_id',
    as: 'component'
  });

  // User (grader) 1 ---< Grade
  (User as any).hasMany(Grade, {
    foreignKey: 'graded_by',
    as: 'gradedGrades'
  });
  (Grade as any).belongsTo(User, {
    foreignKey: 'graded_by',
    as: 'grader'
  });

  // User, Course -> FinalGrade
  (User as any).hasMany(FinalGrade, {
    foreignKey: 'user_id',
    as: 'finalGrades'
  });
  (FinalGrade as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  (Course as any).hasMany(FinalGrade, {
    foreignKey: 'course_id',
    as: 'finalGrades'
  });
  (FinalGrade as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ===================================
  // ANALYTICS RELATIONSHIPS
  // ===================================
  
  // User 1 ---< UserActivityLog
  (User as any).hasMany(UserActivityLog, {
    foreignKey: 'user_id',
    as: 'activityLogs'
  });
  (UserActivityLog as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Course 1 --- 1 CourseStatistics
  (Course as any).hasOne(CourseStatistics, {
    foreignKey: 'course_id',
    as: 'statistics',
    onDelete: 'CASCADE'
  });
  (CourseStatistics as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  console.log('✅ Extended model associations setup completed');
};

export default setupExtendedAssociations;






