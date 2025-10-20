import express, { Request, Response, NextFunction } from 'express';
import { QuizController } from './quiz.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { quizSchemas } from './quiz.validate';

const router = express.Router();
const quizController = new QuizController();

// All routes require authentication
router.use(authMiddleware);

// ===== QUIZ MANAGEMENT ROUTES =====

// Get all quizzes (All authenticated users)
router.get(
  '/',
  validateQuery(quizSchemas.quizQuery),
  (req: Request, res: Response, next: NextFunction) => quizController.getAllQuizzes(req, res, next)
);

// Get quiz by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(quizSchemas.quizId),
  (req: Request, res: Response, next: NextFunction) => quizController.getQuizById(req, res, next)
);

// Create new quiz (Instructor/Admin only)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(quizSchemas.createQuiz),
  (req: Request, res: Response, next: NextFunction) => quizController.createQuiz(req, res, next)
);

// Update quiz (Instructor/Admin only)
router.put(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(quizSchemas.quizId),
  validateBody(quizSchemas.updateQuiz),
  (req: Request, res: Response, next: NextFunction) => quizController.updateQuiz(req, res, next)
);

// Delete quiz (Instructor/Admin only)
router.delete(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(quizSchemas.quizId),
  (req: Request, res: Response, next: NextFunction) => quizController.deleteQuiz(req, res, next)
);

// ===== QUIZ QUESTIONS MANAGEMENT ROUTES =====

// Get all questions for a quiz (All authenticated users)
router.get(
  '/:id/questions',
  validateParams(quizSchemas.quizId),
  (req: Request, res: Response, next: NextFunction) => quizController.getQuizQuestions(req, res, next)
);

// Get question by ID (All authenticated users)
router.get(
  '/:quizId/questions/:questionId',
  validateParams(quizSchemas.quizQuestionParams),
  (req: Request, res: Response, next: NextFunction) => quizController.getQuizQuestionById(req, res, next)
);

// Create new question for quiz (Instructor/Admin only)
router.post(
  '/:id/questions',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(quizSchemas.quizId),
  validateBody(quizSchemas.createQuestion),
  (req: Request, res: Response, next: NextFunction) => quizController.createQuizQuestion(req, res, next)
);

// Update question (Instructor/Admin only)
router.put(
  '/:quizId/questions/:questionId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(quizSchemas.quizQuestionParams),
  validateBody(quizSchemas.updateQuestion),
  (req: Request, res: Response, next: NextFunction) => quizController.updateQuizQuestion(req, res, next)
);

// Delete question (Instructor/Admin only)
router.delete(
  '/:quizId/questions/:questionId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(quizSchemas.quizQuestionParams),
  (req: Request, res: Response, next: NextFunction) => quizController.deleteQuizQuestion(req, res, next)
);

// ===== QUIZ ATTEMPT MANAGEMENT ROUTES =====

// Start quiz attempt (All authenticated users)
router.post(
  '/:id/start',
  validateParams(quizSchemas.quizId),
  (req: Request, res: Response, next: NextFunction) => quizController.startQuizAttempt(req, res, next)
);

// Submit quiz attempt (All authenticated users)
router.post(
  '/attempts/:attemptId/submit',
  validateParams(quizSchemas.quizAttemptParams),
  validateBody(quizSchemas.submitQuizAttempt),
  (req: Request, res: Response, next: NextFunction) => quizController.submitQuizAttempt(req, res, next)
);

// Get quiz attempt by ID (All authenticated users)
router.get(
  '/attempts/:attemptId',
  validateParams(quizSchemas.quizAttemptParams),
  (req: Request, res: Response, next: NextFunction) => quizController.getQuizAttemptById(req, res, next)
);

// Get user's quiz attempts (All authenticated users)
router.get(
  '/:id/attempts',
  validateParams(quizSchemas.quizId),
  (req: Request, res: Response, next: NextFunction) => quizController.getUserQuizAttempts(req, res, next)
);

export default router;