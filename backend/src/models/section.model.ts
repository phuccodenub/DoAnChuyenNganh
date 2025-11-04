import { DataTypes, Model } from 'sequelize';
import { SectionAttributes, SectionCreationAttributes, SectionInstance } from '../types/model.types';
import { exportModel, addInstanceMethods, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * Section Model
 * Các phần lớn, chương mục của một khóa học
 * 
 * Nghiệp vụ:
 * - Một khóa học được chia thành nhiều chương mục (1:N)
 * - Mỗi chương mục có thứ tự hiển thị (order_index)
 * - Khi xóa khóa học, tất cả chương mục liên quan cũng bị xóa (CASCADE)
 */
const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID khóa học mà chương mục này thuộc về'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tiêu đề chương mục (VD: "Chương 1: Giới thiệu về Python")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả chi tiết về nội dung chương mục'
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Thứ tự hiển thị của chương mục trong khóa học'
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Chương mục đã được công bố chưa'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Thời lượng ước tính để hoàn thành chương mục (phút)'
  },
  objectives: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Mục tiêu học tập của chương mục (array of strings)'
  }
}, {
  tableName: 'sections',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['course_id', 'order_index']
    },
    {
      unique: true,
      fields: ['course_id', 'order_index'],
      name: 'unique_section_order_per_course'
    }
  ]
});

// Instance & Static Methods (type-safe helpers)
addInstanceMethods(Section as any, {
  async getLessonCount(this: Model): Promise<number> {
    const section = this as unknown as SectionInstance;
    return await sequelize.models.Lesson.count({
      where: { section_id: section.id }
    });
  },
  async getTotalDuration(this: Model): Promise<number> {
    const section = this as unknown as SectionInstance;
    const lessons = await sequelize.models.Lesson.findAll({
      where: { section_id: section.id },
      attributes: ['duration_minutes']
    });
    return lessons.reduce((total: number, lesson: any) => {
      const duration = (lesson as any).duration_minutes as number | null;
      return total + (duration || 0);
    }, 0);
  }
});

addStaticMethods(Section as any, {
  async findByCourse(this: typeof Section, courseId: string) {
    const model = this as any;
    return await model.findAll({
      where: { course_id: courseId },
      order: [['order_index', 'ASC']],
      include: [
        {
          model: sequelize.models.Lesson,
          as: 'lessons',
          order: [['order_index', 'ASC']]
        }
      ]
    });
  },
  async reorderSections(this: typeof Section, courseId: string, sectionOrders: { id: string; order_index: number }[]) {
    const model = this as any;
    const transaction = await sequelize.transaction();
    try {
      for (const { id, order_index } of sectionOrders) {
        await model.update(
          { order_index },
          { where: { id, course_id: courseId }, transaction }
        );
      }
      await transaction.commit();
      return true;
    } catch (error: unknown) {
      await transaction.rollback();
      throw error;
    }
  }
});

export default exportModel(Section as any);







