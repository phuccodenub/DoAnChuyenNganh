/**
 * Review Routes
 */

import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new ReviewController();

router.use(authMiddleware);

// ===================================
// COURSE REVIEWS (Public for authenticated users)
// ===================================

/**
 * @route   GET /api/reviews/course/:courseId
 * @desc    Get all reviews for a course
 * @access  Authenticated
 */
router.get('/course/:courseId', controller.getCourseReviews);

/**
 * @route   GET /api/reviews/course/:courseId/stats
 * @desc    Get review statistics for a course
 * @access  Authenticated
 */
router.get('/course/:courseId/stats', controller.getCourseReviewStats);

/**
 * @route   GET /api/reviews/course/:courseId/my
 * @desc    Get current user's review for a course
 * @access  Authenticated
 */
router.get('/course/:courseId/my', controller.getMyReview);

// ===================================
// REVIEW CRUD
// ===================================

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Authenticated (enrolled students)
 */
router.post('/', controller.create);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Owner only
 */
router.put('/:reviewId', controller.update);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Owner or Admin
 */
router.delete('/:reviewId', controller.delete);

// ===================================
// INSTRUCTOR ACTIONS
// ===================================

/**
 * @route   POST /api/reviews/:reviewId/reply
 * @desc    Add instructor reply to a review
 * @access  Instructor (course owner)
 */
router.post(
  '/:reviewId/reply',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.addReply
);

export default router;
