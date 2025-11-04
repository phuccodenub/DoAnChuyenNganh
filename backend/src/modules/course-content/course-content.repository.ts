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
interface SectionProgressDTO {
  section_id: string;
  section_title: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
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
    return await material.update(data);
  }

  async deleteMaterial(materialId: string) {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) return false;
    await material.destroy();
    return true;
  }

  async incrementDownloadCount(materialId: string) {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) return null;
    material.download_count = (material.download_count ?? 0) + 1;
    await material.save();
    return material;
  }

  // ===================================
  // LESSON PROGRESS OPERATIONS
  // ===================================

  async findOrCreateProgress(userId: string, lessonId: string) {
    const [progress, created] = await LessonProgress.findOrCreate({
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
      await progress.save();
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

    // Calculate section-level progress
    const sectionProgress: SectionProgressDTO[] = sections.map((section) => {
      const sectionLessons = section.lessons;
      const completedInSection = sectionLessons.filter((lesson) => {
        const p = progressMap.get(lesson.id);
        return p?.completed;
      }).length;

      return {
        section_id: section.id,
        section_title: section.title,
        total_lessons: sectionLessons.length,
        completed_lessons: completedInSection,
        completion_percentage: sectionLessons.length > 0 
          ? (completedInSection / sectionLessons.length) * 100 
          : 0
      };
    });

    const completedTotal = progressRecords.filter((p) => p.completed).length;
    const totalTimeSpent = progressRecords.reduce(
      (sum: number, p) => sum + (p.time_spent_seconds || 0), 
      0
    );
    const lastAccessed = progressRecords.length > 0
      ? new Date(Math.max(...progressRecords.map((p) => p.last_accessed_at?.getTime() || 0)))
      : undefined;

    return {
      total_lessons: lessonIds.length,
      completed_lessons: completedTotal,
      completion_percentage: (completedTotal / lessonIds.length) * 100,
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






