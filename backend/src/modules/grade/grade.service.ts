import { GradeRepository } from './grade.repository';
import { UpsertFinalGradeDto, UpsertGradeDto, CreateGradeComponentDto } from './grade.types';
import { ApiError } from '../../errors/api.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import { CourseInstance, EnrollmentInstance, GradeInstance } from '../../types/model.types';

export class GradeService {
  private repo: GradeRepository;

  constructor() {
    this.repo = new GradeRepository();
  }

  // ===================================
  // GRADE COMPONENT MANAGEMENT
  // ===================================

  async createGradeComponent(instructorId: string, dto: CreateGradeComponentDto) {
    try {
      await this.verifyInstructorAccess(dto.course_id, instructorId);
      
      const component = await this.repo.createGradeComponent(dto);
      logger.info(`Grade component created: ${component.id} by user ${instructorId}`);
      return component;
    } catch (error: unknown) {
      logger.error(`Error creating grade component: ${error}`);
      throw error;
    }
  }

  async updateGradeComponent(componentId: string, instructorId: string, data: Partial<CreateGradeComponentDto>) {
    try {
      const component = await this.repo.getGradeComponentById(componentId);
      if (!component) {
        throw new ApiError('Grade component not found', 404);
      }

      await this.verifyInstructorAccess(component.course_id, instructorId);

      const updated = await this.repo.updateGradeComponent(componentId, data);
      logger.info(`Grade component updated: ${componentId} by user ${instructorId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating grade component: ${error}`);
      throw error;
    }
  }

  async deleteGradeComponent(componentId: string, instructorId: string) {
    try {
      const component = await this.repo.getGradeComponentById(componentId);
      if (!component) {
        throw new ApiError('Grade component not found', 404);
      }

      await this.verifyInstructorAccess(component.course_id, instructorId);

      await this.repo.deleteGradeComponent(componentId);
      logger.info(`Grade component deleted: ${componentId} by user ${instructorId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting grade component: ${error}`);
      throw error;
    }
  }

  async getCourseGradeComponents(courseId: string, instructorId?: string) {
    try {
      if (instructorId) {
        await this.verifyInstructorAccess(courseId, instructorId);
      }

      return await this.repo.getCourseGradeComponents(courseId);
    } catch (error: unknown) {
      logger.error(`Error getting course grade components: ${error}`);
      throw error;
    }
  }

  // ===================================
  // INDIVIDUAL GRADE MANAGEMENT
  // ===================================

  async upsertGrade(instructorId: string, dto: UpsertGradeDto) {
    try {
      // Verify component exists and instructor has access
      const component = await this.repo.getGradeComponentById(dto.grade_component_id);
      if (!component) {
        throw new ApiError('Grade component not found', 404);
      }

      await this.verifyInstructorAccess(component.course_id, instructorId);

      // Validate score
      if (dto.score < 0 || dto.score > component.max_score) {
        throw new ApiError(`Score must be between 0 and ${component.max_score}`, 400);
      }

      const grade = await this.repo.upsertGrade({
        user_id: dto.user_id,
        course_id: component.course_id,
        component_id: dto.grade_component_id,
        score: dto.score,
        max_score: component.max_score,
        graded_by: instructorId,
        graded_at: new Date(),
        feedback: dto.notes
      });

      logger.info(`Grade upserted for user ${dto.user_id} in component ${dto.grade_component_id}`);
      
      // Recalculate final grade
      await this.calculateAndUpdateFinalGrade(dto.user_id, component.course_id);
      
      return grade;
    } catch (error: unknown) {
      logger.error(`Error upserting grade: ${error}`);
      throw error;
    }
  }

  async deleteGrade(gradeId: string, instructorId: string) {
    try {
      const grade = await this.repo.getGradeById(gradeId);
      if (!grade) {
        throw new ApiError('Grade not found', 404);
      }

      await this.verifyInstructorAccess(grade.course_id, instructorId);

      await this.repo.deleteGrade(gradeId);
      
      // Recalculate final grade
      await this.calculateAndUpdateFinalGrade(grade.user_id, grade.course_id);
      
      logger.info(`Grade deleted: ${gradeId} by user ${instructorId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting grade: ${error}`);
      throw error;
    }
  }

  // ===================================
  // FINAL GRADE MANAGEMENT
  // ===================================

  async calculateAndUpdateFinalGrade(userId: string, courseId: string) {
    try {
      const components = await this.repo.getCourseGradeComponents(courseId);
      const userGrades = await this.repo.getGradesByUserCourse(userId, courseId) as GradeInstance[];

      let totalWeightedScore = 0;
      let totalWeight = 0;
      let hasAllRequiredGrades = true;

      for (const component of components) {
        const grade = userGrades.find((g) => g.component_id === component.id);

        if (grade) {
          const percentage = (grade.score / component.max_score) * 100;
          totalWeightedScore += percentage * component.weight;
          totalWeight += component.weight;
        } else if (component.is_required) {
          hasAllRequiredGrades = false;
        }
      }

      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const letterGrade = this.calculateLetterGrade(finalScore);

      const finalGradeData = {
        user_id: userId,
        course_id: courseId,
        final_score: Math.round(finalScore * 100) / 100,
        letter_grade: letterGrade,
        is_complete: hasAllRequiredGrades,
        calculated_at: new Date()
      };

      const finalGrade = await this.repo.upsertFinalGrade(finalGradeData);
      logger.info(`Final grade calculated for user ${userId} in course ${courseId}: ${finalScore}%`);
      
      return finalGrade;
    } catch (error: unknown) {
      logger.error(`Error calculating final grade: ${error}`);
      throw error;
    }
  }

  async getFinalGrade(userId: string, courseId: string) {
    return await this.repo.getFinalGrade(userId, courseId);
  }

  // ===================================
  // STUDENT VIEWS
  // ===================================

  async getUserGrades(userId: string, courseId: string) {
    try {
      const grades = await this.repo.getGradesByUserCourse(userId, courseId);
      const finalGrade = await this.repo.getFinalGrade(userId, courseId);
      
      return {
        grades,
        final_grade: finalGrade
      };
    } catch (error: unknown) {
      logger.error(`Error getting user grades: ${error}`);
      throw error;
    }
  }

  async getUserCoursesGrades(userId: string) {
    return await this.repo.getUserCoursesGrades(userId);
  }

  // ===================================
  // INSTRUCTOR VIEWS
  // ===================================

  async getCourseGradebook(courseId: string, instructorId: string) {
    try {
      await this.verifyInstructorAccess(courseId, instructorId);
      
      return await this.repo.getCourseGradebook(courseId);
    } catch (error: unknown) {
      logger.error(`Error getting course gradebook: ${error}`);
      throw error;
    }
  }

  async getCourseGradeStatistics(courseId: string, instructorId: string) {
    try {
      await this.verifyInstructorAccess(courseId, instructorId);
      
      return await this.repo.getCourseGradeStatistics(courseId);
    } catch (error: unknown) {
      logger.error(`Error getting course grade statistics: ${error}`);
      throw error;
    }
  }

  async bulkCalculateFinalGrades(courseId: string, instructorId: string) {
    try {
      await this.verifyInstructorAccess(courseId, instructorId);
      
      const enrollments = await this.repo.getCourseEnrollments(courseId) as EnrollmentInstance[];
      const results = [];

      for (const enrollment of enrollments) {
        try {
          const finalGrade = await this.calculateAndUpdateFinalGrade(enrollment.user_id, courseId);
          results.push({ user_id: enrollment.user_id, success: true, final_grade: finalGrade });
        } catch (error: unknown) {
          results.push({ user_id: enrollment.user_id, success: false, error: (error as Error).message });
        }
      }

      logger.info(`Bulk final grade calculation completed for course ${courseId}`);
      return results;
    } catch (error: unknown) {
      logger.error(`Error in bulk final grade calculation: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  private async verifyInstructorAccess(courseId: string, userId: string) {
    const { Course } = await import('../../models');
    const course = await Course.findByPk(courseId) as CourseInstance | null;
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    return course;
  }

  private calculateLetterGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}



