/**
 * Instructor Controller
 * Handles instructor-specific business logic
 */

import { Request, Response, NextFunction } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Course, Enrollment, User, Assignment, AssignmentSubmission, Notification, Section, Lesson } from '../../../models';
import logger from '../../../utils/logger.util';

// Types for raw query results
interface CourseRaw {
  id: string;
  title: string;
  status: string;
  total_students: number;
  rating: number | null;
  total_ratings: number;
  price: number | null;
  is_free: boolean;
}

export class InstructorController {
  /**
   * Get instructor dashboard statistics
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;

      // Get all courses by this instructor
      const courses = await Course.findAll({
        where: { instructor_id: instructorId },
        attributes: ['id', 'title', 'status', 'total_students', 'rating', 'total_ratings', 'price', 'is_free'],
        raw: true,
      }) as unknown as CourseRaw[];

      const courseIds = courses.map((c: CourseRaw) => c.id);

      // Calculate stats
      const totalCourses = courses.length;
      const publishedCourses = courses.filter((c: CourseRaw) => c.status === 'published').length;
      const draftCourses = courses.filter((c: CourseRaw) => c.status === 'draft').length;
      const totalStudents = courses.reduce((sum: number, c: CourseRaw) => sum + (c.total_students || 0), 0);
      
      // Calculate revenue (sum of enrollments * course price)
      let totalRevenue = 0;
      for (const course of courses) {
        if (!course.is_free && course.price) {
          const paidEnrollments = await Enrollment.count({
            where: { 
              course_id: course.id, 
              enrollment_type: 'paid',
              status: { [Op.ne]: 'cancelled' }
            }
          });
          totalRevenue += paidEnrollments * course.price;
        }
      }

      // Average rating
      const ratedCourses = courses.filter((c: CourseRaw) => c.rating && c.rating > 0);
      const avgRating = ratedCourses.length > 0
        ? ratedCourses.reduce((sum: number, c: CourseRaw) => sum + (c.rating || 0), 0) / ratedCourses.length
        : 0;
      const totalReviews = courses.reduce((sum: number, c: CourseRaw) => sum + (c.total_ratings || 0), 0);

      // Count lessons and sections
      let totalSections = 0;
      let totalLessons = 0;
      
      for (const courseId of courseIds) {
        const sectionCount = await Section.count({ where: { course_id: courseId } });
        totalSections += sectionCount;
        
        const sections = await Section.findAll({ 
          where: { course_id: courseId }, 
          attributes: ['id'],
          raw: true 
        });
        for (const section of sections) {
          const lessonCount = await Lesson.count({ where: { section_id: section.id } });
          totalLessons += lessonCount;
        }
      }

      // Pending assignments count
      const pendingSubmissions = await AssignmentSubmission.count({
        where: {
          status: 'submitted',
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          required: true,
          where: {
            course_id: { [Op.in]: courseIds }
          }
        }]
      });

      // This month enrollments
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const thisMonthEnrollments = await Enrollment.count({
        where: {
          course_id: { [Op.in]: courseIds },
          created_at: { [Op.gte]: startOfMonth }
        }
      });

      // Completion rate
      const totalEnrollments = await Enrollment.count({
        where: { course_id: { [Op.in]: courseIds } }
      });
      const completedEnrollments = await Enrollment.count({
        where: { 
          course_id: { [Op.in]: courseIds },
          status: 'completed'
        }
      });
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

      res.json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: {
          total_courses: totalCourses,
          published_courses: publishedCourses,
          draft_courses: draftCourses,
          total_students: totalStudents,
          total_revenue: totalRevenue,
          avg_rating: Math.round(avgRating * 10) / 10,
          total_reviews: totalReviews,
          total_sections: totalSections,
          total_lessons: totalLessons,
          pending_assignments: pendingSubmissions,
          this_month_enrollments: thisMonthEnrollments,
          completion_rate: completionRate,
        }
      });
    } catch (error) {
      logger.error('Error getting instructor dashboard stats:', error);
      next(error);
    }
  }

  /**
   * Get recent activities for instructor
   */
  async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      // Get instructor's course IDs
      const courses = await Course.findAll({
        where: { instructor_id: instructorId },
        attributes: ['id', 'title'],
        raw: true,
      }) as unknown as { id: string; title: string }[];
      const courseIds = courses.map((c: { id: string }) => c.id);
      const courseMap = new Map(courses.map((c: { id: string; title: string }) => [c.id, c.title]));

      const activities: any[] = [];

      // Recent enrollments
      const recentEnrollments = await Enrollment.findAll({
        where: { course_id: { [Op.in]: courseIds } },
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }],
        order: [['created_at', 'DESC']],
        limit: 10,
      });

      for (const enrollment of recentEnrollments) {
        const student = (enrollment as any).student;
        activities.push({
          id: `enroll-${enrollment.id}`,
          type: 'enrollment',
          description: `đã đăng ký khóa học "${courseMap.get(enrollment.course_id)}"`,
          user_id: student?.id,
          user_name: student ? `${student.first_name} ${student.last_name}`.trim() : 'Học viên',
          user_avatar: student?.avatar,
          course_id: enrollment.course_id,
          created_at: enrollment.created_at,
        });
      }

      // Recent submissions
      const recentSubmissions = await AssignmentSubmission.findAll({
        include: [
          {
            model: Assignment,
            as: 'assignment',
            required: true,
            where: { course_id: { [Op.in]: courseIds } },
            attributes: ['id', 'title', 'course_id']
          },
          {
            model: User,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'avatar']
          }
        ],
        order: [['submitted_at', 'DESC']],
        limit: 10,
      });

      for (const submission of recentSubmissions) {
        const student = (submission as any).student;
        const assignment = (submission as any).assignment;
        activities.push({
          id: `submit-${submission.id}`,
          type: 'submission',
          description: `đã nộp bài "${assignment?.title}"`,
          user_id: student?.id,
          user_name: student ? `${student.first_name} ${student.last_name}`.trim() : 'Học viên',
          user_avatar: student?.avatar,
          course_id: assignment?.course_id,
          assignment_id: assignment?.id,
          created_at: submission.submitted_at,
        });
      }

      // Sort by date and limit
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const limitedActivities = activities.slice(0, limit);

      res.json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: limitedActivities
      });
    } catch (error) {
      logger.error('Error getting instructor recent activities:', error);
      next(error);
    }
  }

  /**
   * Get all students enrolled in instructor's courses
   */
  async getAllStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const courseId = req.query.course_id as string;

      // Get instructor's course IDs
      const courseWhere: any = { instructor_id: instructorId };
      if (courseId) courseWhere.id = courseId;
      
      const courses = await Course.findAll({
        where: courseWhere,
        attributes: ['id', 'title'],
        raw: true,
      }) as unknown as { id: string; title: string }[];
      const courseIds = courses.map((c: { id: string }) => c.id);
      const courseMap = new Map(courses.map((c: { id: string; title: string }) => [c.id, c.title]));

      if (courseIds.length === 0) {
        res.json({
          success: true,
          message: 'No students found',
          data: {
            students: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
          }
        });
        return;
      }

      // Build user where clause for search
      const userWhere: any = {};
      if (search) {
        userWhere[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Get enrollments with students (filter by role='student' only)
      const studentWhere = Object.keys(userWhere).length > 0 
        ? { ...userWhere, role: 'student' }
        : { role: 'student' };

      // If viewing a specific course, show all enrollments (one row per enrollment)
      // If viewing all courses, deduplicate by student (one row per student)
      if (courseId) {
        // SPECIFIC COURSE VIEW: Show each enrollment separately
        const { count, rows: enrollments } = await Enrollment.findAndCountAll({
          where: { 
            course_id: courseId,
            status: { [Op.ne]: 'cancelled' }
          },
          include: [{
            model: User,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role'],
            where: studentWhere,
          }],
          order: [['created_at', 'DESC']],
          offset: (page - 1) * limit,
          limit,
          distinct: true,
        });

        const students = enrollments.map((enrollment: any) => {
          const student = enrollment.student;
          return {
            id: student?.id,
            enrollment_id: enrollment.id,
            name: student ? `${student.first_name} ${student.last_name}`.trim() : 'Học viên',
            email: student?.email,
            avatar_url: student?.avatar,
            course_id: enrollment.course_id,
            course_title: courseMap.get(enrollment.course_id),
            enrolled_at: enrollment.created_at,
            progress_percent: parseFloat(enrollment.progress_percentage?.toString() || '0'),
            status: enrollment.status,
            last_activity_at: enrollment.last_accessed_at,
          };
        });

        res.json({
          success: true,
          message: 'Students retrieved successfully',
          data: {
            students,
            pagination: {
              page,
              limit,
              total: count,
              totalPages: Math.ceil(count / limit)
            }
          }
        });
      } else {
        // ALL COURSES VIEW: Deduplicate by student_id
        // Get all enrollments first
        const allEnrollments = await Enrollment.findAll({
          where: { 
            course_id: { [Op.in]: courseIds },
            status: { [Op.ne]: 'cancelled' }
          },
          include: [{
            model: User,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role'],
            where: studentWhere,
          }],
          order: [['created_at', 'DESC']],
        });

        // Group by student_id and aggregate data
        const studentMap = new Map<string, any>();
        
        allEnrollments.forEach((enrollment: any) => {
          const student = enrollment.student;
          if (!student) return;
          
          const studentId = student.id;
          
          if (!studentMap.has(studentId)) {
            // First enrollment for this student
            studentMap.set(studentId, {
              id: studentId,
              name: `${student.first_name} ${student.last_name}`.trim(),
              email: student.email,
              avatar_url: student.avatar,
              courses: [courseMap.get(enrollment.course_id)].filter(Boolean),
              enrollments: [enrollment],
              total_progress: parseFloat(enrollment.progress_percentage?.toString() || '0'),
              count: 1,
              last_activity_at: enrollment.last_accessed_at,
              enrolled_at: enrollment.created_at,
            });
          } else {
            // Additional enrollment for existing student
            const existing = studentMap.get(studentId);
            existing.courses.push(courseMap.get(enrollment.course_id));
            existing.enrollments.push(enrollment);
            existing.total_progress += parseFloat(enrollment.progress_percentage?.toString() || '0');
            existing.count += 1;
            
            // Update last activity to most recent
            if (!existing.last_activity_at || 
                (enrollment.last_accessed_at && new Date(enrollment.last_accessed_at) > new Date(existing.last_activity_at))) {
              existing.last_activity_at = enrollment.last_accessed_at;
            }
            
            // Update enrolled_at to earliest
            if (new Date(enrollment.created_at) < new Date(existing.enrolled_at)) {
              existing.enrolled_at = enrollment.created_at;
            }
          }
        });

        // Convert map to array and calculate average progress
        const uniqueStudents = Array.from(studentMap.values()).map(student => ({
          id: student.id,
          enrollment_id: student.enrollments[0].id, // Use first enrollment ID for actions
          name: student.name,
          email: student.email,
          avatar_url: student.avatar_url,
          courses: student.courses,
          enrolled_at: student.enrolled_at,
          progress_percent: Math.round(student.total_progress / student.count),
          last_activity_at: student.last_activity_at,
          completed_lessons: student.enrollments.reduce((sum: number, e: any) => sum + (e.completed_lessons || 0), 0),
          total_lessons: student.enrollments.reduce((sum: number, e: any) => sum + (e.total_lessons || 0), 0),
        }));

        // Apply pagination to deduplicated students
        const total = uniqueStudents.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedStudents = uniqueStudents.slice(startIndex, endIndex);

        res.json({
          success: true,
          message: 'Students retrieved successfully',
          data: {
            students: paginatedStudents,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
            }
          }
        });
      }
    } catch (error) {
      logger.error('Error getting instructor students:', error);
      next(error);
    }
  }

  /**
   * Unenroll a student from a course
   */
  async unenrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const { enrollmentId } = req.params;

      // Find enrollment
      const enrollment = await Enrollment.findByPk(enrollmentId, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id', 'title']
        }]
      });

      if (!enrollment) {
        res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
        return;
      }

      // Check if instructor owns this course
      const course = (enrollment as any).course;
      if (course.instructor_id !== instructorId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to unenroll students from this course'
        });
        return;
      }

      // Delete enrollment
      await enrollment.destroy();

      // Update course total_students
      await Course.decrement('total_students', {
        where: { id: course.id }
      });

      res.json({
        success: true,
        message: 'Student unenrolled successfully'
      });
    } catch (error) {
      logger.error('Error unenrolling student:', error);
      next(error);
    }
  }

  /**
   * Get all pending submissions across instructor's courses
   */
  async getPendingSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get instructor's course IDs
      const courses = await Course.findAll({
        where: { instructor_id: instructorId },
        attributes: ['id', 'title'],
        raw: true,
      }) as unknown as { id: string; title: string }[];
      const courseIds = courses.map((c: { id: string }) => c.id);
      const courseMap = new Map(courses.map((c: { id: string; title: string }) => [c.id, c.title]));

      if (courseIds.length === 0) {
        res.json({
          success: true,
          message: 'No pending submissions',
          data: {
            submissions: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
          }
        });
        return;
      }

      // Get pending submissions
      const { count, rows: submissions } = await AssignmentSubmission.findAndCountAll({
        where: { status: 'submitted' },
        include: [
          {
            model: Assignment,
            as: 'assignment',
            required: true,
            where: { course_id: { [Op.in]: courseIds } },
            attributes: ['id', 'title', 'course_id', 'max_score', 'due_date']
          },
          {
            model: User,
            as: 'student',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          }
        ],
        order: [['submitted_at', 'ASC']], // Oldest first
        offset: (page - 1) * limit,
        limit,
      });

      const formattedSubmissions = submissions.map(sub => {
        const assignment = (sub as any).assignment;
        const student = (sub as any).student;
        
        // Calculate if late
        const isLate = assignment?.due_date && sub.submitted_at 
          ? new Date(sub.submitted_at) > new Date(assignment.due_date)
          : false;
        
        return {
          id: sub.id,
          assignment_id: assignment?.id,
          assignment_title: assignment?.title,
          course_id: assignment?.course_id,
          course_title: courseMap.get(assignment?.course_id),
          max_score: assignment?.max_score,
          due_date: assignment?.due_date,
          student: {
            id: student?.id,
            name: student ? `${student.first_name} ${student.last_name}`.trim() : 'Học viên',
            email: student?.email,
            avatar_url: student?.avatar,
          },
          submitted_at: sub.submitted_at,
          is_late: isLate,
          submission_text: sub.submission_text,
          file_url: sub.file_url,
        };
      });

      res.json({
        success: true,
        message: 'Pending submissions retrieved successfully',
        data: {
          submissions: formattedSubmissions,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting pending submissions:', error);
      next(error);
    }
  }

  /**
   * Get all assignments for a course with submission stats
   */
  async getCourseAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const { courseId } = req.params;

      // Verify instructor owns this course
      const course = await Course.findByPk(courseId);
      if (!course || course.instructor_id !== instructorId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to access this course'
        });
        return;
      }

      // Get assignments with submission stats
      const assignments = await Assignment.findAll({
        where: { course_id: courseId },
        order: [['created_at', 'DESC']],
      });

      const formattedAssignments = await Promise.all(assignments.map(async (assignment) => {
        const totalSubmissions = await AssignmentSubmission.count({
          where: { assignment_id: assignment.id }
        });
        const pendingCount = await AssignmentSubmission.count({
          where: { assignment_id: assignment.id, status: 'submitted' }
        });
        const gradedCount = await AssignmentSubmission.count({
          where: { assignment_id: assignment.id, status: 'graded' }
        });

        // Get average score
        const avgResult = await AssignmentSubmission.findOne({
          where: { 
            assignment_id: assignment.id, 
            status: 'graded',
            score: { [Op.ne]: null }
          },
          attributes: [
            [Sequelize.fn('AVG', Sequelize.col('score')), 'avg_score']
          ],
          raw: true,
        }) as any;

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          max_score: assignment.max_score,
          due_date: assignment.due_date,
          is_published: assignment.is_published,
          allow_late_submission: assignment.allow_late_submission,
          created_at: assignment.created_at,
          stats: {
            total_submissions: totalSubmissions,
            pending: pendingCount,
            graded: gradedCount,
            avg_score: avgResult?.avg_score ? parseFloat(avgResult.avg_score).toFixed(1) : null,
          }
        };
      }));

      res.json({
        success: true,
        message: 'Course assignments retrieved successfully',
        data: formattedAssignments
      });
    } catch (error) {
      logger.error('Error getting course assignments:', error);
      next(error);
    }
  }

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const { assignmentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      // Get assignment and verify ownership
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{
          model: Course,
          as: 'course',
          attributes: ['id', 'instructor_id', 'title']
        }]
      });

      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }

      const course = (assignment as any).course;
      if (course.instructor_id !== instructorId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to access this assignment'
        });
        return;
      }

      // Build where clause
      const where: any = { assignment_id: assignmentId };
      if (status && status !== 'all') {
        where.status = status;
      }

      // Get submissions
      const { count, rows: submissions } = await AssignmentSubmission.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
        }],
        order: [['submitted_at', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      });

      const formattedSubmissions = submissions.map(sub => {
        const student = (sub as any).student;
        
        // Calculate if late
        const isLate = assignment.due_date && sub.submitted_at 
          ? new Date(sub.submitted_at) > new Date(assignment.due_date)
          : false;
        
        return {
          id: sub.id,
          student: {
            id: student?.id,
            name: student ? `${student.first_name} ${student.last_name}`.trim() : 'Học viên',
            email: student?.email,
            avatar_url: student?.avatar,
          },
          submitted_at: sub.submitted_at,
          status: sub.status,
          is_late: isLate,
          score: sub.score,
          feedback: sub.feedback,
          graded_at: sub.graded_at,
          submission_text: sub.submission_text,
          file_url: sub.file_url,
        };
      });

      res.json({
        success: true,
        message: 'Assignment submissions retrieved successfully',
        data: {
          assignment: {
            id: assignment.id,
            title: assignment.title,
            max_score: assignment.max_score,
            due_date: assignment.due_date,
            course_title: course.title,
          },
          submissions: formattedSubmissions,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting assignment submissions:', error);
      next(error);
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const { submissionId } = req.params;
      const { score, feedback } = req.body;

      // Get submission
      const submission = await AssignmentSubmission.findByPk(submissionId, {
        include: [{
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Course,
            as: 'course',
            attributes: ['id', 'instructor_id']
          }]
        }]
      });

      if (!submission) {
        res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
        return;
      }

      const assignment = (submission as any).assignment;
      const course = assignment?.course;

      if (course.instructor_id !== instructorId) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to grade this submission'
        });
        return;
      }

      // Validate score
      if (score !== undefined && score !== null) {
        if (score < 0 || score > assignment.max_score) {
          res.status(400).json({
            success: false,
            message: `Score must be between 0 and ${assignment.max_score}`
          });
          return;
        }
      }

      // Update submission
      await AssignmentSubmission.update(
        {
          score: score ?? submission.score,
          feedback: feedback ?? submission.feedback,
          status: 'graded',
          graded_at: new Date(),
          graded_by: instructorId,
        },
        { where: { id: submissionId } }
      );

      // Refresh data
      const updatedSubmission = await AssignmentSubmission.findByPk(submissionId);

      res.json({
        success: true,
        message: 'Submission graded successfully',
        data: {
          id: updatedSubmission?.id,
          score: updatedSubmission?.score,
          feedback: updatedSubmission?.feedback,
          status: updatedSubmission?.status,
          graded_at: updatedSubmission?.graded_at,
        }
      });
    } catch (error) {
      logger.error('Error grading submission:', error);
      next(error);
    }
  }

  /**
   * Send bulk notification to students
   */
  async sendBulkNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = (req as any).user?.userId;
      const { student_ids, course_id, title, message, type = 'announcement' } = req.body;

      if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'student_ids is required and must be a non-empty array'
        });
        return;
      }

      if (!title || !message) {
        res.status(400).json({
          success: false,
          message: 'title and message are required'
        });
        return;
      }

      // If course_id provided, verify ownership
      if (course_id) {
        const course = await Course.findByPk(course_id);
        if (!course || course.instructor_id !== instructorId) {
          res.status(403).json({
            success: false,
            message: 'You do not have permission to send notifications for this course'
          });
          return;
        }
      }

      // Create notifications for each student
      const notifications = await Promise.all(
        student_ids.map(studentId =>
          Notification.create({
            user_id: studentId,
            title,
            message,
            type,
            is_read: false,
            metadata: {
              sender_id: instructorId,
              course_id,
            }
          })
        )
      );

      res.json({
        success: true,
        message: `Sent ${notifications.length} notifications successfully`,
        data: {
          count: notifications.length
        }
      });
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
      next(error);
    }
  }
}

