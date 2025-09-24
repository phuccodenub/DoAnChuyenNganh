/**
 * Course Routes
 * Course management, enrollment, and basic course operations
 */

const express = require('express');
const Joi = require('joi');

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ChatMessage = require('../models/ChatMessage');
const logger = require('../config/logger');
const { 
  authenticateToken, 
  requireInstructor, 
  optionalAuth 
} = require('../middlewares/auth');

const router = express.Router();

// Validation schemas
const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Course title must be at least 3 characters long',
    'string.max': 'Course title cannot exceed 255 characters',
    'any.required': 'Course title is required'
  }),
  description: Joi.string().max(5000).optional().allow(''),
  max_students: Joi.number().integer().min(1).max(10000).optional().allow(null),
  start_date: Joi.date().optional().allow(null),
  end_date: Joi.date().optional().allow(null)
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(5000).optional().allow(''),
  max_students: Joi.number().integer().min(1).max(10000).optional().allow(null),
  start_date: Joi.date().optional().allow(null),
  end_date: Joi.date().optional().allow(null),
  status: Joi.string().valid('draft', 'active', 'archived', 'cancelled').optional()
});

/**
 * @route   GET /api/courses
 * @desc    Get all active courses (public with optional auth for enrolled status)
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '',
      instructor_id = null
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNumber - 1) * pageSize;

    let courses;
    let totalCount;

    if (search.trim()) {
      // Search courses
      courses = await Course.searchCourses(search.trim(), pageSize);
      totalCount = courses.length; // Simplified - could implement proper count
    } else if (instructor_id) {
      // Get courses by instructor
      courses = await Course.getCoursesByInstructor(parseInt(instructor_id), false);
      totalCount = courses.length;
      
      // Apply pagination manually for instructor filter
      courses = courses.slice(offset, offset + pageSize);
    } else {
      // Get all active courses
      courses = await Course.getActiveCourses(pageSize, offset);
      totalCount = await Course.count({ where: { status: 'active' } });
    }

    // If user is authenticated, add enrollment status
    if (req.userId) {
      for (let course of courses) {
        const enrollment = await Enrollment.getByUserAndCourse(req.userId, course.id);
        course.dataValues.user_enrolled = !!enrollment;
        course.dataValues.enrollment_status = enrollment ? enrollment.status : null;
      }
    }

    // Add instructor and enrollment count to each course
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        return await course.getDetailedInfo();
      })
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses: coursesWithDetails,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_count: totalCount,
          page_size: pageSize,
          has_next: pageNumber < totalPages,
          has_prev: pageNumber > 1
        }
      }
    });

  } catch (error) {
    logger.logError('Failed to get courses', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public (with optional auth for enrollment status)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get detailed course info
    const courseDetails = await course.getDetailedInfo();

    // If user is authenticated, add enrollment status
    if (req.userId) {
      const enrollment = await Enrollment.getByUserAndCourse(req.userId, courseId);
      courseDetails.user_enrolled = !!enrollment;
      courseDetails.enrollment_status = enrollment ? enrollment.status : null;
      
      // Add user enrollment details if enrolled
      if (enrollment) {
        courseDetails.enrollment_details = {
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress,
          last_accessed: enrollment.last_accessed
        };
      }
    }

    res.json({
      success: true,
      message: 'Course retrieved successfully',
      data: {
        course: courseDetails
      }
    });

  } catch (error) {
    logger.logError('Failed to get course', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Instructor/Admin only)
 */
router.post('/', authenticateToken, requireInstructor, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createCourseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // Create course with instructor ID
    const course = await Course.createCourse(value, req.userId);

    logger.logInfo('Course created successfully', { 
      courseId: course.id,
      instructorId: req.userId,
      title: course.title
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course: await course.getDetailedInfo()
      }
    });

  } catch (error) {
    logger.logError('Failed to create course', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Course instructor or Admin only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    // Validate input
    const { error, value } = updateCourseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is authorized to update this course
    if (req.userRole !== 'admin' && course.instructor_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own courses'
      });
    }

    // Update course
    Object.assign(course, value);
    await course.save();

    logger.logInfo('Course updated successfully', { 
      courseId: course.id,
      userId: req.userId
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: await course.getDetailedInfo()
      }
    });

  } catch (error) {
    logger.logError('Failed to update course', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Course instructor or Admin only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is authorized to delete this course
    if (req.userRole !== 'admin' && course.instructor_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own courses'
      });
    }

    // Instead of hard delete, mark as cancelled
    await course.updateStatus('cancelled');

    logger.logInfo('Course deleted (cancelled)', { 
      courseId: course.id,
      userId: req.userId
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    logger.logError('Failed to delete course', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll in course
 * @access  Private (Students only)
 */
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.createEnrollment(req.userId, courseId);

    logger.logInfo('User enrolled in course', { 
      userId: req.userId,
      courseId,
      enrollmentId: enrollment.id
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: await enrollment.getDetailedInfo()
      }
    });

  } catch (error) {
    if (error.message.includes('already enrolled') || 
        error.message.includes('not active') ||
        error.message.includes('full')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    logger.logError('Failed to enroll in course', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/courses/:id/enrolled-students
 * @desc    Get enrolled students for a course
 * @access  Private (Course instructor or Admin only)
 */
router.get('/:id/enrolled-students', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is authorized to view enrolled students
    if (req.userRole !== 'admin' && course.instructor_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only course instructor can view enrolled students'
      });
    }

    const students = await course.getEnrolledStudents();

    res.json({
      success: true,
      message: 'Enrolled students retrieved successfully',
      data: {
        students,
        count: students.length
      }
    });

  } catch (error) {
    logger.logError('Failed to get enrolled students', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/courses/:id/messages
 * @desc    Get course chat messages
 * @access  Private (Enrolled users only)
 */
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { limit = 50, before_id = null } = req.query;
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    // Check if user has access to course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify user has access (enrolled, instructor, or admin)
    const isInstructor = course.instructor_id === req.userId;
    const isEnrolled = await Enrollment.isUserEnrolled(req.userId, courseId);
    
    if (!isInstructor && !isEnrolled && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You must be enrolled in this course'
      });
    }

    const messages = await ChatMessage.getCourseMessages(
      courseId,
      Math.min(100, parseInt(limit) || 50),
      0,
      before_id ? parseInt(before_id) : null
    );

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages
      }
    });

  } catch (error) {
    logger.logError('Failed to get course messages', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/courses/my-courses
 * @desc    Get current user's courses (enrolled courses for students, taught courses for instructors)
 * @access  Private
 */
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    let courses;

    if (req.userRole === 'instructor' || req.userRole === 'admin') {
      // Get courses where user is instructor
      courses = await Course.getCoursesByInstructor(req.userId);
      
      // Add detailed info for each course
      courses = await Promise.all(
        courses.map(async (course) => await course.getDetailedInfo())
      );
    } else {
      // Get enrolled courses for students
      const enrollments = await Enrollment.getUserActiveCourses(req.userId);
      courses = enrollments.map(enrollment => ({
        ...enrollment.Course.get(),
        enrollment_details: {
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress,
          status: enrollment.status,
          last_accessed: enrollment.last_accessed
        }
      }));
    }

    res.json({
      success: true,
      message: 'Your courses retrieved successfully',
      data: {
        courses,
        role: req.userRole
      }
    });

  } catch (error) {
    logger.logError('Failed to get user courses', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;