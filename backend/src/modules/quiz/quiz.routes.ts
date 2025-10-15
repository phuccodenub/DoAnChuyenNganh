import { Router } from 'express';
import { QuizController } from './quiz.controller';
import { quizValidation } from './quiz.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new QuizController();

router.use(authMiddleware);

// ===================================
// QUIZ MANAGEMENT (INSTRUCTOR)
// ===================================

// Create quiz (instructor/admin)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.createQuiz),
  controller.createQuiz
);

// Get quiz
router.get('/:quizId', validate(quizValidation.quizId), controller.getQuiz);

// Update quiz (instructor/admin)
router.put(
  '/:quizId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.updateQuiz),
  controller.updateQuiz
);

// Delete quiz (instructor/admin)
router.delete(
  '/:quizId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.quizId),
  controller.deleteQuiz
);

// ===================================
// QUESTION MANAGEMENT (INSTRUCTOR)
// ===================================

// Add question (instructor/admin)
router.post(
  '/:quizId/questions',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.addQuestion),
  controller.addQuestion
);

// Update question (instructor/admin)
router.put(
  '/questions/:questionId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.updateQuestion),
  controller.updateQuestion
);

// Delete question (instructor/admin)
router.delete(
  '/questions/:questionId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.questionId),
  controller.deleteQuestion
);

// List questions
router.get('/:quizId/questions', validate(quizValidation.quizId), controller.getQuizQuestions);

// Add option (instructor/admin)
router.post(
  '/questions/:questionId/options',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.addOption),
  controller.addOption
);

// ===================================
// QUIZ ATTEMPTS (STUDENT)
// ===================================

// Start quiz attempt
router.post(
  '/:quizId/attempts',
  authorizeRoles([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.quizId),
  controller.startAttempt
);

// Submit quiz attempt
router.post(
  '/attempts/:attemptId/submit',
  authorizeRoles([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.submitQuiz),
  controller.submitAttempt
);

// Get my attempts for a quiz
router.get(
  '/:quizId/my-attempts',
  authorizeRoles([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.quizId),
  controller.getMyAttempts
);

// Get attempt details
router.get(
  '/attempts/:attemptId',
  authorizeRoles([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.attemptId),
  controller.getAttemptDetails
);

// ===================================
// INSTRUCTOR ANALYTICS
// ===================================

// Get quiz statistics (instructor/admin)
router.get(
  '/:quizId/statistics',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.quizId),
  controller.getQuizStatistics
);

// Get all quiz attempts (instructor/admin)
router.get(
  '/:quizId/attempts',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(quizValidation.quizId),
  controller.getQuizAttempts
);

export default router;





