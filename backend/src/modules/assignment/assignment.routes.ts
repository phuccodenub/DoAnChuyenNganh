import { Router } from 'express';
import { AssignmentController } from './assignment.controller';
import { assignmentSchemas } from './assignment.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new AssignmentController();

router.use(authMiddleware);

// ===================================
// STATIC ROUTES (must be before dynamic :id routes)
// ===================================

/**
 * @route   GET /api/assignments/pending-grading
 * @desc    Get all pending submissions for grading (across all courses)
 * @access  Instructor, Admin
 */
router.get(
  '/pending-grading',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getPendingGrading
);

/**
 * @route   GET /api/assignments/submissions/:submissionId
 * @desc    Get submission details
 * @access  Owner or Instructor
 */
router.get('/submissions/:submissionId', controller.getSubmissionDetails);

/**
 * @route   POST /api/assignments/submissions/:submissionId/grade
 * @desc    Grade a submission
 * @access  Instructor, Admin
 */
router.post(
  '/submissions/:submissionId/grade',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.grade
);

/**
 * @route   PUT /api/assignments/submissions/:submissionId/grade
 * @desc    Update grade for a submission
 * @access  Instructor, Admin
 */
router.put(
  '/submissions/:submissionId/grade',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.grade
);

/**
 * @route   GET /api/assignments/course/:courseId
 * @desc    Get all assignments for a course
 * @access  Instructor, Admin, Enrolled Students
 */
router.get('/course/:courseId', controller.getCourseAssignments);

/**
 * @route   GET /api/assignments/course/:courseId/stats
 * @desc    Get assignment statistics for a course (for instructor dashboard)
 * @access  Instructor, Admin
 */
router.get(
  '/course/:courseId/stats',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getCourseAssignmentStats
);

/**
 * @route   GET /api/assignments/course/:courseId/pending-grading
 * @desc    Get pending submissions for a specific course
 * @access  Instructor, Admin
 */
router.get(
  '/course/:courseId/pending-grading',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getCoursePendingGrading
);

// ===================================
// ASSIGNMENT CRUD
// ===================================

/**
 * @route   GET /api/assignments
 * @desc    Get all assignments with pagination and filters
 * @access  Authenticated
 */
router.get('/', validateQuery(assignmentSchemas.assignmentQuery), controller.getAll);

/**
 * @route   GET /api/assignments/my
 * @desc    Get all assignments for current student from enrolled courses
 * @access  Authenticated (Student)
 */
router.get('/my', controller.getMyAssignments);

/**
 * @route   POST /api/assignments
 * @desc    Create new assignment
 * @access  Instructor, Admin
 */
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validateBody(assignmentSchemas.createAssignment),
  controller.create
);

/**
 * @route   GET /api/assignments/:id
 * @desc    Get assignment by ID
 * @access  Authenticated
 */
router.get('/:id', validateParams(assignmentSchemas.assignmentId), controller.getOne);

/**
 * @route   PUT /api/assignments/:id
 * @desc    Update assignment
 * @access  Instructor, Admin
 */
router.put(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validateParams(assignmentSchemas.assignmentId),
  validateBody(assignmentSchemas.updateAssignment),
  controller.update
);

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete assignment
 * @access  Instructor, Admin
 */
router.delete(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validateParams(assignmentSchemas.assignmentId),
  controller.delete
);

// ===================================
// ASSIGNMENT SUBMISSIONS
// ===================================

/**
 * @route   GET /api/assignments/:assignmentId/submissions/my
 * @desc    Get current user's submission for an assignment
 * @access  Authenticated
 */
router.get('/:assignmentId/submissions/my', controller.getMySubmission);

/**
 * @route   PUT /api/assignments/:assignmentId/submissions/my
 * @desc    Update current user's submission
 * @access  Authenticated
 */
router.put('/:assignmentId/submissions/my', controller.updateMySubmission);

/**
 * @route   GET /api/assignments/:assignmentId/submissions
 * @desc    Get all submissions for an assignment (instructor)
 * @access  Instructor, Admin
 */
router.get(
  '/:assignmentId/submissions',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getAssignmentSubmissions
);

/**
 * @route   POST /api/assignments/:assignmentId/submissions
 * @desc    Submit assignment (student)
 * @access  Enrolled Students
 */
router.post('/:assignmentId/submissions', controller.submit);

/**
 * @route   GET /api/assignments/:assignmentId/stats
 * @desc    Get statistics for an assignment
 * @access  Instructor, Admin
 */
router.get(
  '/:assignmentId/stats',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getAssignmentStats
);

export default router;

































