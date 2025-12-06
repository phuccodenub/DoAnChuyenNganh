import { Section, Lesson, LessonMaterial, LessonProgress, Course } from '../../models';
import type { 
  SectionInstance, 
  LessonInstance, 
  LessonProgressInstance 
} from '../../types/model.types';
import { Op } from 'sequelize';
import { getSequelize } from '../../config/db';

/**
 * Course Content Repository
 * Data access layer for course content management
 */
type CreateLessonMaterialDTO = {
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number;
  file_extension?: string | null;
  description?: string | null;
  is_downloadable?: boolean;
  order_index?: number;
};

// DTOs for progress calculations
interface LessonProgressDTO {
  lesson_id: string;
  lesson_title: string;
  completion_percentage: number;
  is_completed: boolean;
}

interface SectionProgressDTO {
  section_id: string;
  section_title: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  lessons: LessonProgressDTO[];
}

interface CourseProgressDTO {
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  total_time_spent_seconds: number;
  last_accessed_at?: Date;
  sections: SectionProgressDTO[];
}

export class CourseContentRepository {
  private sequelize = getSequelize();

  // ===================================
  // SECTION OPERATIONS
  // ===================================

  async createSection<TData extends object>(courseId: string, data: TData) {
    return await Section.create({
      course_id: courseId,
      ...data
    });
  }

  async findSectionById(sectionId: string) {
    return await Section.findByPk(sectionId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructor_id']
        }
      ]
    });
  }

  async findSectionsByCourse(courseId: string, includeUnpublished: boolean = false) {
    const where: Record<string, unknown> = { course_id: courseId };
    if (!includeUnpublished) {
      where.is_published = true;
    }

    return await Section.findAll({
      where,
      order: [
        ['order_index', 'ASC'],
        ['created_at', 'ASC']
      ],
      include: [
        {
          model: Lesson,
          as: 'lessons',
          where: includeUnpublished ? {} : { is_published: true },
          required: false,
          order: [['order_index', 'ASC']],
          include: [
            {
              model: LessonMaterial,
              as: 'materials',
              order: [['order_index', 'ASC']]
            }
          ]
        }
      ]
    });
  }

  async updateSection<TData extends object>(sectionId: string, data: TData) {
    const section = await Section.findByPk(sectionId);
    if (!section) return null;
    return await section.update(data);
  }

  async deleteSection(sectionId: string) {
    const section = await Section.findByPk(sectionId);
    if (!section) return false;
    await section.destroy();
    return true;
  }

  async reorderSections(courseId: string, orders: { id: string; order_index: number }[]) {
    const transaction = await this.sequelize.transaction();
    try {
      for (const { id, order_index } of orders) {
        await Section.update(
          { order_index },
          { 
            where: { id, course_id: courseId },
            transaction 
          }
        );
      }
      await transaction.commit();
      return true;
    } catch (error: unknown) {
      await transaction.rollback();
      throw error;
    }
  }

  // ===================================
  // LESSON OPERATIONS
  // ===================================

  async createLesson<TData extends object>(sectionId: string, data: TData) {
    return await Lesson.create({
      section_id: sectionId,
      ...data
    });
  }

  async findLessonById(lessonId: string) {
    return await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Section,
          as: 'section',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'instructor_id']
            }
          ]
        },
        {
          model: LessonMaterial,
          as: 'materials',
          order: [['order_index', 'ASC']]
        }
      ]
    });
  }

  async findLessonsBySection(sectionId: string, includeUnpublished: boolean = false) {
    const where: Record<string, unknown> = { section_id: sectionId };
    if (!includeUnpublished) {
      where.is_published = true;
    }

    return await Lesson.findAll({
      where,
      order: [['order_index', 'ASC']],
      include: [
        {
          model: LessonMaterial,
          as: 'materials',
          order: [['order_index', 'ASC']]
        }
      ]
    });
  }

  async updateLesson<TData extends object>(lessonId: string, data: TData) {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return null;
    return await lesson.update(data);
  }

  async deleteLesson(lessonId: string) {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return false;
    await lesson.destroy();
    return true;
  }

  async reorderLessons(sectionId: string, orders: { id: string; order_index: number }[]) {
    const transaction = await this.sequelize.transaction();
    try {
      for (const { id, order_index } of orders) {
        await Lesson.update(
          { order_index },
          { 
            where: { id, section_id: sectionId },
            transaction 
          }
        );
      }
      await transaction.commit();
      return true;
    } catch (error: unknown) {
      await transaction.rollback();
      throw error;
    }
  }

  // ===================================
  // LESSON MATERIAL OPERATIONS
  // ===================================


  async createMaterial(lessonId: string, uploadedBy: string, data: CreateLessonMaterialDTO) {
    const payload = {
      lesson_id: lessonId,
      uploaded_by: uploadedBy,
      file_name: data.file_name,
      file_url: data.file_url,
      file_type: data.file_type ?? null,
      file_size: data.file_size,
      file_extension: data.file_extension ?? null,
      description: data.description ?? null,
      is_downloadable: data.is_downloadable ?? true,
      order_index: data.order_index ?? 0,
      download_count: 0,
    };
    return await LessonMaterial.create(payload);
  }

  async findMaterialById(materialId: string) {
    return await LessonMaterial.findByPk(materialId);
  }

  async findMaterialsByLesson(lessonId: string) {
    return await LessonMaterial.findAll({
      where: { lesson_id: lessonId },
      order: [['order_index', 'ASC'], ['created_at', 'ASC']]
    });
  }

  async updateMaterial<TData extends object>(materialId: string, data: TData) {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) return null;
    return await (material as any).update(data);
  }

  async deleteMaterial(materialId: string) {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) return false;
    await (material as any).destroy();
    return true;
  }

  async incrementDownloadCount(materialId: string) {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) return null;
    material.download_count = (material.download_count ?? 0) + 1;
    await (material as any).save();
    return material;
  }

  // ===================================
  // LESSON PROGRESS OPERATIONS
  // ===================================

  async findOrCreateProgress(userId: string, lessonId: string) {
    const [progress, created] = await (LessonProgress as any).findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: {
        user_id: userId,
        lesson_id: lessonId,
        started_at: new Date(),
        last_accessed_at: new Date()
      }
    });

    if (!created && !progress.started_at) {
      progress.started_at = new Date();
      await (progress as any).save();
    }

    return progress;
  }

  async updateProgress(
    userId: string,
    lessonId: string,
    data: Partial<{
      last_position: number;
      completion_percentage: number;
      time_spent_seconds: number;
      notes: string;
      bookmarked: boolean;
    }>
  ) {
    const progress = await this.findOrCreateProgress(userId, lessonId);
    
    if (data.last_position !== undefined) {
      progress.last_position = data.last_position;
    }
    if (data.completion_percentage !== undefined) {
      progress.completion_percentage = data.completion_percentage;
    }
    if (data.time_spent_seconds !== undefined) {
      progress.time_spent_seconds = data.time_spent_seconds;
    }
    if (data.notes !== undefined) {
      progress.notes = data.notes;
    }
    if (data.bookmarked !== undefined) {
      progress.bookmarked = data.bookmarked;
    }
    
    progress.last_accessed_at = new Date();
    
    // Auto-complete if 100%
    if (progress.completion_percentage >= 100 && !progress.completed) {
      progress.completed = true;
      progress.completed_at = new Date();
    }
    
    await progress.save();
    return progress;
  }

  async markLessonAsCompleted(userId: string, lessonId: string) {
    const progress = await this.findOrCreateProgress(userId, lessonId);
    progress.completed = true;
    progress.completion_percentage = 100;
    progress.completed_at = new Date();
    await progress.save();
    return progress;
  }

  async getUserLessonProgress(userId: string, lessonId: string) {
    return await LessonProgress.findOne({
      where: { user_id: userId, lesson_id: lessonId }
    });
  }

  async getUserCourseProgress(userId: string, courseId: string): Promise<CourseProgressDTO> {
    // Get all sections and lessons for the course
    const sections = await Section.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'order_index'],
          order: [['order_index', 'ASC']]
        }
      ],
      order: [['order_index', 'ASC']]
    }) as (SectionInstance & { lessons: LessonInstance[] })[];

    const lessonIds = sections.flatMap((section) => 
      section.lessons.map((lesson) => lesson.id)
    );

    if (lessonIds.length === 0) {
      return {
        total_lessons: 0,
        completed_lessons: 0,
        completion_percentage: 0,
        total_time_spent_seconds: 0,
        sections: []
      };
    }

    // Get all progress records
    const progressRecords = await LessonProgress.findAll({
      where: {
        user_id: userId,
        lesson_id: lessonIds
      }
    }) as LessonProgressInstance[];

    const progressMap = new Map<string, LessonProgressInstance>(
      progressRecords.map((p) => [p.lesson_id, p])
    );

    // Fetch section-level quizzes and assignments (không phải practice)
    const { Quiz, Assignment, QuizAttempt, AssignmentSubmission } = await import('../../models');
    const sectionIds = sections.map((s) => s.id);
    
    console.log('[Progress] Fetching section quizzes:', {
      course_id: courseId,
      section_ids: sectionIds,
      section_count: sectionIds.length
    });
    
    // Fetch quizzes: có thể có course_id hoặc không (nếu có section_id thì đã đảm bảo thuộc course)
    const sectionQuizzes = sectionIds.length > 0
      ? await (Quiz as any).findAll({
          where: {
            section_id: { [Op.in]: sectionIds },
            is_practice: false,
            is_published: true
          },
          attributes: ['id', 'section_id', 'title', 'passing_score']
        })
      : [];
    
    console.log('[Progress] Fetched section quizzes:', {
      count: sectionQuizzes.length,
      quizzes: sectionQuizzes.map((q: any) => ({
        id: q.id,
        title: q.title,
        section_id: q.section_id,
        passing_score: q.passing_score
      }))
    });

    // Fetch assignments: có thể có course_id hoặc không (nếu có section_id thì đã đảm bảo thuộc course)
    const sectionAssignments = sectionIds.length > 0
      ? await (Assignment as any).findAll({
          where: {
            section_id: { [Op.in]: sectionIds },
            is_practice: false,
            is_published: true
          },
          attributes: ['id', 'section_id', 'title', 'max_score']
        })
      : [];

    // Fetch quiz attempts và assignment submissions cho user (cần score để kiểm tra passing)
    // Lấy tất cả attempts đã submit, sau đó chọn attempt mới nhất cho mỗi quiz
    const allQuizAttempts = sectionQuizzes.length > 0
      ? await (QuizAttempt as any).findAll({
          where: {
            user_id: userId,
            quiz_id: { [Op.in]: sectionQuizzes.map((q: any) => q.id) },
            submitted_at: { [Op.ne]: null } // Chỉ lấy attempts đã submit
          },
          attributes: ['quiz_id', 'submitted_at', 'score', 'max_score', 'created_at'],
          order: [['created_at', 'DESC']]
        })
      : [];
    
    // Chọn attempt mới nhất cho mỗi quiz (submitted/graded)
    const quizAttemptsMap = new Map();
    allQuizAttempts.forEach((attempt: any) => {
      if (!quizAttemptsMap.has(attempt.quiz_id)) {
        quizAttemptsMap.set(attempt.quiz_id, attempt);
      }
    });
    const quizAttempts = Array.from(quizAttemptsMap.values());

    const assignmentSubmissions = sectionAssignments.length > 0
      ? await (AssignmentSubmission as any).findAll({
          where: {
            user_id: userId,
            assignment_id: { [Op.in]: sectionAssignments.map((a: any) => a.id) },
            submitted_at: { [Op.ne]: null }
          },
          attributes: ['assignment_id', 'submitted_at', 'score']
        })
      : [];

    // Create maps for quick lookup - chỉ tính quiz/assignment đã đạt điểm đạt
    // Quiz: score >= passing_score (tính theo %)
    const completedQuizMap = new Set(
      quizAttempts
        .filter((attempt: any) => {
          const quiz = sectionQuizzes.find((q: any) => q.id === attempt.quiz_id);
          if (!quiz) {
            console.log('[Progress] Quiz not found for attempt:', attempt.quiz_id);
            return false;
          }
          
          // Nếu không có passing_score, chỉ cần đã submit
          if (quiz.passing_score == null || quiz.passing_score === 0) {
            const result = attempt.submitted_at != null;
            console.log('[Progress] Quiz no passing_score check:', {
              quiz_id: quiz.id,
              quiz_title: quiz.title,
              submitted_at: attempt.submitted_at,
              result
            });
            return result;
          }
          
          // Tính % điểm: (score / max_score) * 100
          // Nếu max_score không có hoặc = 0, lấy từ quiz.total_points
          const attemptMaxScore = Number(attempt.max_score || 0);
          const score = Number(attempt.score || 0);
          const passingScore = Number(quiz.passing_score || 0);
          const quizTotalPoints = Number(quiz.total_points || 0);
          
          // Ưu tiên dùng max_score từ attempt, nếu không có thì dùng total_points từ quiz
          let maxScore = attemptMaxScore;
          if (maxScore === 0 || maxScore === null || isNaN(maxScore)) {
            maxScore = quizTotalPoints > 0 ? quizTotalPoints : 100; // Default to 100 if both are 0
          }
          
          const scorePercent = maxScore > 0 
            ? (score / maxScore) * 100 
            : 0;
          
          // Chỉ tính nếu đạt điểm đạt
          const isPassed = scorePercent >= passingScore;
          
          // Debug log để kiểm tra (luôn in ra để debug)
          console.log('[Progress] Quiz completion check:', {
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            score,
            max_score: maxScore,
            score_percent: scorePercent.toFixed(2),
            passing_score: passingScore,
            passing_score_type: typeof quiz.passing_score,
            passing_score_raw: quiz.passing_score,
            is_passed: isPassed
          });
          
          return isPassed;
        })
        .map((a: any) => a.quiz_id)
    );
    
    console.log('[Progress] Completed quiz IDs:', Array.from(completedQuizMap));
    
    // Assignment: chỉ cần đã submit (assignments không có passing_score field)
    // Có thể thêm logic kiểm tra điểm sau nếu cần
    const completedAssignmentMap = new Set(
      assignmentSubmissions
        .filter((submission: any) => {
          const assignment = sectionAssignments.find((a: any) => a.id === submission.assignment_id);
          if (!assignment) return false;
          
          // Với assignment, chỉ cần đã submit là được tính vào completion
          // (Có thể thêm logic kiểm tra điểm sau nếu cần)
          return submission.submitted_at != null;
        })
        .map((s: any) => s.assignment_id)
    );

    // Calculate section-level progress with lesson-level details
    const sectionProgress: SectionProgressDTO[] = sections.map((section) => {
      const sectionLessons = section.lessons;
      
      // Get section-level quizzes and assignments
      const sectionQuizzesForSection = sectionQuizzes.filter(
        (q: any) => q.section_id === section.id
      );
      const sectionAssignmentsForSection = sectionAssignments.filter(
        (a: any) => a.section_id === section.id
      );

      // Calculate lesson-level progress
      const lessonProgress: LessonProgressDTO[] = sectionLessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);
        const completionPercentage = progress?.completion_percentage || 0;
        const isCompleted = progress?.completed || false;

        return {
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          completion_percentage: completionPercentage,
          is_completed: isCompleted
        };
      });

      // Count completed items: lessons + quizzes + assignments
      const completedLessons = lessonProgress.filter((lp) => lp.is_completed).length;
      const completedQuizzes = sectionQuizzesForSection.filter(
        (q: any) => completedQuizMap.has(q.id)
      ).length;
      const completedAssignments = sectionAssignmentsForSection.filter(
        (a: any) => completedAssignmentMap.has(a.id)
      ).length;

      const totalItems = sectionLessons.length + sectionQuizzesForSection.length + sectionAssignmentsForSection.length;
      const completedItems = completedLessons + completedQuizzes + completedAssignments;
      
      const sectionCompletionPercentage = totalItems > 0 
        ? (completedItems / totalItems) * 100 
        : 0;
      
      // Debug log để kiểm tra (luôn in ra để debug)
      console.log('[Progress] Section completion calculation:', {
        section_id: section.id,
        section_title: section.title,
        total_lessons: sectionLessons.length,
        completed_lessons: completedLessons,
        total_quizzes: sectionQuizzesForSection.length,
        completed_quizzes: completedQuizzes,
        quiz_ids: sectionQuizzesForSection.map((q: any) => q.id),
        quiz_titles: sectionQuizzesForSection.map((q: any) => q.title),
        completed_quiz_ids: Array.from(completedQuizMap).filter((id: any) => 
          sectionQuizzesForSection.some((q: any) => q.id === id)
        ),
        total_assignments: sectionAssignmentsForSection.length,
        completed_assignments: completedAssignments,
        total_items: totalItems,
        completed_items: completedItems,
        completion_percentage: sectionCompletionPercentage.toFixed(2)
      });

      return {
        section_id: section.id,
        section_title: section.title,
        total_lessons: sectionLessons.length,
        completed_lessons: completedLessons,
        completion_percentage: sectionCompletionPercentage,
        lessons: lessonProgress
      };
    });

    // Calculate total completion including lessons, quizzes, and assignments
    // Tính tổng completion dựa trên completion_percentage của từng section (có trọng số)
    // Hoặc tính đơn giản: tổng số items đã completed / tổng số items
    
    const completedLessonsTotal = progressRecords.filter((p) => p.completed).length;
    const completedQuizzesTotal = completedQuizMap.size; // Chỉ tính quizzes đã đạt điểm đạt
    const completedAssignmentsTotal = completedAssignmentMap.size; // Chỉ tính assignments đã submit
    
    const totalItems = lessonIds.length + sectionQuizzes.length + sectionAssignments.length;
    const completedItemsTotal = completedLessonsTotal + completedQuizzesTotal + completedAssignmentsTotal;
    
    // Debug log để kiểm tra
    console.log('[Progress] Total completion calculation:', {
      total_lessons: lessonIds.length,
      completed_lessons: completedLessonsTotal,
      total_section_quizzes: sectionQuizzes.length,
      completed_section_quizzes: completedQuizzesTotal,
      total_section_assignments: sectionAssignments.length,
      completed_section_assignments: completedAssignmentsTotal,
      total_items: totalItems,
      completed_items: completedItemsTotal,
      completion_percentage: totalItems > 0 ? (completedItemsTotal / totalItems) * 100 : 0
    });
    
    const totalTimeSpent = progressRecords.reduce(
      (sum: number, p) => sum + (p.time_spent_seconds || 0), 
      0
    );
    const lastAccessed = progressRecords.length > 0
      ? new Date(Math.max(...progressRecords.map((p) => p.last_accessed_at?.getTime() || 0)))
      : undefined;

    return {
      total_lessons: lessonIds.length,
      completed_lessons: completedLessonsTotal,
      completion_percentage: totalItems > 0 ? (completedItemsTotal / totalItems) * 100 : 0,
      total_time_spent_seconds: totalTimeSpent,
      last_accessed_at: lastAccessed,
      sections: sectionProgress
    };
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    return await LessonProgress.findAll({
      where: { user_id: userId },
      order: [['last_accessed_at', 'DESC']],
      limit,
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'content_type'],
          include: [
            {
              model: Section,
              as: 'section',
              attributes: ['id', 'title'],
              include: [
                {
                  model: Course,
                  as: 'course',
                  attributes: ['id', 'title', 'thumbnail_url']
                }
              ]
            }
          ]
        }
      ]
    });
  }
}






