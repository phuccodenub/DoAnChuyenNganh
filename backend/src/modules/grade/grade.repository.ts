import { Grade, FinalGrade } from '../../models';
import type { WhereOptions, ModelStatic } from 'sequelize';
import type {
  GradeInstance,
  GradeCreationAttributes,
  GradeAttributes,
  FinalGradeInstance,
  FinalGradeCreationAttributes,
  FinalGradeAttributes,
  GradeComponentInstance,
  GradeComponentCreationAttributes,
  GradeComponentAttributes,
  EnrollmentInstance,
  EnrollmentAttributes,
  UserInstance
} from '../../types/model.types';

export class GradeRepository {
  private readonly GradeModel = Grade as unknown as ModelStatic<GradeInstance>;
  private readonly FinalGradeModel = FinalGrade as unknown as ModelStatic<FinalGradeInstance>;

  async upsertGrade(data: GradeCreationAttributes): Promise<GradeInstance> {
    const [row] = await this.GradeModel.upsert(data, { returning: true });
    return row;
  }

  async upsertFinalGrade(data: FinalGradeCreationAttributes): Promise<FinalGradeInstance> {
    const [row] = await this.FinalGradeModel.upsert(data, { returning: true });
    return row;
  }

  async getGradesByUserCourse(userId: string, courseId: string): Promise<GradeInstance[]> {
    return this.GradeModel.findAll({
      where: { user_id: userId, course_id: courseId } as WhereOptions<GradeAttributes>
    });
  }

  // ===== GradeComponent methods =====
  async createGradeComponent(dto: GradeComponentCreationAttributes): Promise<GradeComponentInstance> {
    const { GradeComponent } = await import('../../models');
    const GradeComponentModel = GradeComponent as unknown as ModelStatic<GradeComponentInstance>;
    return GradeComponentModel.create(dto);
  }

  async getGradeComponentById(id: string): Promise<GradeComponentInstance | null> {
    const { GradeComponent } = await import('../../models');
    const GradeComponentModel = GradeComponent as unknown as ModelStatic<GradeComponentInstance>;
    return GradeComponentModel.findByPk(id);
  }

  async updateGradeComponent(id: string, data: Partial<GradeComponentAttributes>): Promise<GradeComponentInstance | null> {
    const { GradeComponent } = await import('../../models');
    const GradeComponentModel = GradeComponent as unknown as ModelStatic<GradeComponentInstance>;
    await GradeComponentModel.update(data, { where: { id } as WhereOptions<GradeComponentAttributes> });
    return GradeComponentModel.findByPk(id);
  }

  async deleteGradeComponent(id: string): Promise<void> {
    const { GradeComponent } = await import('../../models');
    const GradeComponentModel = GradeComponent as unknown as ModelStatic<GradeComponentInstance>;
    await GradeComponentModel.destroy({ where: { id } as WhereOptions<GradeComponentAttributes> });
  }

  async getCourseGradeComponents(courseId: string): Promise<GradeComponentInstance[]> {
    const { GradeComponent } = await import('../../models');
    const GradeComponentModel = GradeComponent as unknown as ModelStatic<GradeComponentInstance>;
    return GradeComponentModel.findAll({ where: { course_id: courseId } as WhereOptions<GradeComponentAttributes> });
  }

  async getGradeById(id: string): Promise<GradeInstance | null> {
    return this.GradeModel.findByPk(id);
  }

  async deleteGrade(id: string): Promise<void> {
    await this.GradeModel.destroy({ where: { id } as WhereOptions<GradeAttributes> });
  }

  async getFinalGrade(userId: string, courseId: string): Promise<FinalGradeInstance | null> {
    return this.FinalGradeModel.findOne({
      where: { user_id: userId, course_id: courseId } as WhereOptions<FinalGradeAttributes>
    });
  }

  async getUserCoursesGrades(userId: string): Promise<FinalGradeInstance[]> {
    return this.FinalGradeModel.findAll({ where: { user_id: userId } as WhereOptions<FinalGradeAttributes> });
  }

  async getCourseGradebook(courseId: string): Promise<EnrollmentInstance[]> {
    const { Enrollment, User } = await import('../../models');
    const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
    const UserModel = User as unknown as ModelStatic<UserInstance>;
    return EnrollmentModel.findAll({
      where: { course_id: courseId } as WhereOptions<EnrollmentAttributes>,
      include: [{ model: UserModel, as: 'user' }]
    });
  }

  async getCourseGradeStatistics(courseId: string): Promise<{ count: number; average: number }> {
    const grades = await this.FinalGradeModel.findAll({
      where: { course_id: courseId } as WhereOptions<FinalGradeAttributes>
    });
    const count = grades.length;
    const average = count ? grades.reduce((sum, g) => sum + (g.final_score ?? 0), 0) / count : 0;
    return { count, average };
  }

  async getCourseEnrollments(courseId: string): Promise<EnrollmentInstance[]> {
    const { Enrollment } = await import('../../models');
    const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
    return EnrollmentModel.findAll({ where: { course_id: courseId } as WhereOptions<EnrollmentAttributes> });
  }
}




