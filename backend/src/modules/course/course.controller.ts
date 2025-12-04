import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { CourseTypes } from './course.types';
import { AuthenticatedRequest } from '../../types/common.types';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ApiError } from '../../middlewares/error.middleware';
import { responseUtils } from '../../utils/response.util';
import { paginationUtils } from '../../utils/pagination.util';
import logger from '../../utils/logger.util';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  // Create new course
  createCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseData = {
        ...req.body,
        instructor_id: req.user?.userId
      };

      const course = await this.courseService.createCourse(courseData);
      
      responseUtils.sendCreated(res, 'Course created successfully', course);
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get all courses
  getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paginationOptions = paginationUtils.parsePaginationOptions(req.query, {
        defaultLimit: 10,
        maxLimit: 100
      });

      const hasExplicitPagination = typeof req.query.page !== 'undefined' || typeof req.query.limit !== 'undefined';
      
      const courses = await this.courseService.getAllCourses({
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        status: req.query.status as CourseTypes.CourseStatus,
        instructor_id: req.query.instructor_id as string,
        search: req.query.search as string,
        category: req.query.category as string
      });
      
      if (hasExplicitPagination) {
        responseUtils.sendSuccess(res, 'Courses retrieved successfully', {
          courses: courses.data,
          pagination: courses.pagination
        });
      } else {
        responseUtils.sendSuccess(res, 'Courses retrieved successfully', courses.data);
      }
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get course by ID
  getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const course = await this.courseService.getCourseById(id);
      
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }
      
      responseUtils.sendSuccess(res, 'Course retrieved successfully', course);
    } catch (error: unknown) {
      next(error);
    }
  };

  // Update course
  updateCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      const course = await this.courseService.updateCourse(id, req.body, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Delete course
  deleteCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      await this.courseService.deleteCourse(id, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Course deleted successfully',
        data: null
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get my courses as instructor (uses current user's ID)
  getMyCoursesAsInstructor = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.user?.userId;
      if (!instructorId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      const { page = 1, limit = 10, status } = req.query;
      
      const courses = await this.courseService.getCoursesByInstructor(instructorId, {
        page: Number(page),
        limit: Number(limit),
        status: status as CourseTypes.CourseStatus
      });
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'My courses retrieved successfully',
        data: courses
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get courses by instructor ID (for admin/other instructors)
  getCoursesByInstructor = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.params.instructorId;
      if (!instructorId) {
        res.status(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST).json({
          success: false,
          message: 'Instructor ID is required'
        });
        return;
      }
      const { page = 1, limit = 10, status } = req.query;
      
      const courses = await this.courseService.getCoursesByInstructor(instructorId, {
        page: Number(page),
        limit: Number(limit),
        status: status as CourseTypes.CourseStatus
      });
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Instructor courses retrieved successfully',
        data: courses
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get enrolled courses for user
  getEnrolledCourses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('CONTROLLER: getEnrolledCourses called');
      const userId = req.user?.userId;
      console.log('CONTROLLER: userId:', userId);
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      const { page = 1, limit = 10, status, search, sort } = req.query;
      console.log('CONTROLLER: calling service with params:', { userId, page, limit, status, search, sort });
      
      const courses = await this.courseService.getEnrolledCourses(userId!, {
        page: Number(page),
        limit: Number(limit),
        status: status as CourseTypes.EnrollmentProgressStatus,
        search: search as string,
        sort: sort as 'last_accessed' | 'progress' | 'title' | 'created_at'
      });
      
      // Transform response: rename 'data' to 'courses' for frontend compatibility
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Enrolled courses retrieved successfully',
        data: {
          courses: courses.data,
          pagination: courses.pagination
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Enroll in course
  enrollInCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      
      const enrollment = await this.courseService.enrollInCourse(courseId, userId!);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Enrolled in course successfully',
        data: enrollment
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Unenroll from course
  unenrollFromCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      await this.courseService.unenrollFromCourse(courseId, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Unenrolled from course successfully',
        data: null
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get course students
  getCourseStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const { page = 1, limit = 10 } = req.query;
      
      const students = await this.courseService.getCourseStudents(courseId, userId!, {
        page: Number(page),
        limit: Number(limit)
      });
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Course students retrieved successfully',
        data: students
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get course statistics for instructor
  getCourseStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }

      const stats = await this.courseService.getCourseStats(courseId, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Course statistics retrieved successfully',
        data: stats
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  // Get recommended courses for student
  getRecommendedCourses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }

      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const courses = await this.courseService.getRecommendedCourses(userId, limit);
      
      responseUtils.sendSuccess(res, 'Recommended courses retrieved successfully', courses);
    } catch (error: unknown) {
      next(error);
    }
  };
}

