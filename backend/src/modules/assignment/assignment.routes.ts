import { Router, Request, Response, NextFunction } from 'express';
import { AssignmentController } from './assignment.controller';
import { assignmentSchemas } from './assignment.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';
import multer, { FileFilterCallback } from 'multer';

const router = Router();
const controller = new AssignmentController();

// Multer configuration for assignment file uploads (max 50MB)
const assignmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Allow common document and archive types
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.rtf', '.odt', '.ods', '.odp',
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',
      '.mp4', '.mp3', '.wav', '.avi', '.mov',
      '.py', '.js', '.ts', '.java', '.c', '.cpp', '.h', '.cs', '.rb', '.go', '.rs',
      '.html', '.css', '.json', '.xml', '.yaml', '.yml', '.md'
    ];
    
    const path = require('path');
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed`), false);
    }
  }
}).single('file');

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
 * @route   POST /api/assignments/submissions/:submissionId/ai-grading
 * @desc    Save AI grader result
 * @access  Instructor, Admin
 */
router.post(
  '/submissions/:submissionId/ai-grading',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.saveAiGrading
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
 * @route   DELETE /api/assignments/:assignmentId/submissions
 * @desc    Cancel/delete own submission (student) - only if not graded
 * @access  Enrolled Students
 */
router.delete('/:assignmentId/submissions', controller.cancelSubmission);

/**
 * @route   POST /api/assignments/:assignmentId/upload
 * @desc    Upload assignment file (student)
 * @access  Enrolled Students
 */
router.post(
  '/:assignmentId/upload',
  (req: Request, res: Response, next: NextFunction) => {
    assignmentUpload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn. Kích thước tối đa: 50MB',
            error: { code: 'FILE_TOO_LARGE', maxSize: 50 * 1024 * 1024 }
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  },
  controller.uploadFile
);

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

































