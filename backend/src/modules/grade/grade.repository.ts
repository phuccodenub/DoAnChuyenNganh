import { Grade, FinalGrade } from '../../models';

export class GradeRepository {
  async upsertGrade(data: any) {
    const [row] = await Grade.upsert(data, { returning: true } as any);
    return row;
  }

  async upsertFinalGrade(data: any) {
    const [row] = await FinalGrade.upsert(data, { returning: true } as any);
    return row;
  }

  async getGradesByUserCourse(userId: string, courseId: string) {
    return await Grade.findAll({ where: { user_id: userId, course_id: courseId } });
  }

  // ===== Stub methods required by GradeService (to be implemented properly) =====
  async createGradeComponent(dto: any) {
    const { GradeComponent } = await import('../../models');
    return GradeComponent.create(dto as any);
  }

  async getGradeComponentById(id: string) {
    const { GradeComponent } = await import('../../models');
    return GradeComponent.findByPk(id);
  }

  async updateGradeComponent(id: string, data: any) {
    const { GradeComponent } = await import('../../models');
    await GradeComponent.update(data, { where: { id } });
    return GradeComponent.findByPk(id);
  }

  async deleteGradeComponent(id: string) {
    const { GradeComponent } = await import('../../models');
    await GradeComponent.destroy({ where: { id } });
  }

  async getCourseGradeComponents(courseId: string) {
    const { GradeComponent } = await import('../../models');
    return GradeComponent.findAll({ where: { course_id: courseId } });
  }

  async getGradeById(id: string) {
    return Grade.findByPk(id);
  }

  async deleteGrade(id: string) {
    await Grade.destroy({ where: { id } });
  }

  async getFinalGrade(userId: string, courseId: string) {
    return FinalGrade.findOne({ where: { user_id: userId, course_id: courseId } });
  }

  async getUserCoursesGrades(userId: string) {
    return FinalGrade.findAll({ where: { user_id: userId } });
  }

  async getCourseGradebook(courseId: string) {
    const { Enrollment, User } = await import('../../models');
    return Enrollment.findAll({ where: { course_id: courseId }, include: [{ model: User, as: 'user' }] as any });
  }

  async getCourseGradeStatistics(courseId: string) {
    const grades = await FinalGrade.findAll({ where: { course_id: courseId } });
    const count = grades.length;
    const average = count ? grades.reduce((s: number, g: any) => s + (g.final_score || 0), 0) / count : 0;
    return { count, average } as any;
  }

  async getCourseEnrollments(courseId: string) {
    const { Enrollment } = await import('../../models');
    return Enrollment.findAll({ where: { course_id: courseId } });
  }
}




