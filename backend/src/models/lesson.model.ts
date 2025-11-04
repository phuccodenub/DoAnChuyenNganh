import { DataTypes, Model } from 'sequelize';
import { LessonAttributes, LessonCreationAttributes, LessonInstance } from '../types/model.types';
import { exportModel, addInstanceMethods, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * Lesson Model
 * Các bài học nhỏ trong mỗi chương mục
 * 
 * Nghiệp vụ:
 * - Một chương mục bao gồm nhiều bài học (1:N)
 * - Bài học có các loại nội dung khác nhau: video, document, text, link
 * - Mỗi bài học có thứ tự hiển thị trong chương
 */
const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  section_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sections',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID chương mục mà bài học này thuộc về'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tiêu đề bài học'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả nội dung bài học'
  },
  content_type: {
    type: DataTypes.ENUM('video', 'document', 'text', 'link', 'quiz', 'assignment'),
    allowNull: false,
    defaultValue: 'text',
    comment: 'Loại nội dung bài học'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Nội dung chi tiết của bài học (HTML, Markdown, hoặc text)'
  },
  video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL video bài học (YouTube, Vimeo, hoặc server riêng)'
  },
  video_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Thời lượng video (giây)'
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Thứ tự hiển thị của bài học trong chương mục'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Thời lượng ước tính để hoàn thành bài học (phút)'
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Bài học đã được công bố chưa'
  },
  is_free_preview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Bài học có thể xem trước miễn phí không (trước khi đăng ký)'
  },
  completion_criteria: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Tiêu chí để đánh dấu bài học hoàn thành (VD: xem hết video, đọc hết nội dung)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata bổ sung (keywords, tags, thumbnail...)'
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['section_id']
    },
    {
      fields: ['section_id', 'order_index']
    },
    {
      unique: true,
      fields: ['section_id', 'order_index'],
      name: 'unique_lesson_order_per_section'
    },
    {
      fields: ['content_type']
    }
  ]
});

// Instance & Static Methods (type-safe helpers)
addInstanceMethods(Lesson as any, {
  async getMaterialCount(this: Model): Promise<number> {
    const lesson = this as unknown as LessonInstance;
    return await sequelize.models.LessonMaterial.count({
      where: { lesson_id: lesson.id }
    });
  },
  async getCompletionRate(this: Model): Promise<number> {
    const lesson = this as unknown as LessonInstance;
    const total = await sequelize.models.LessonProgress.count({
      where: { lesson_id: lesson.id }
    });
    const completed = await sequelize.models.LessonProgress.count({
      where: { lesson_id: lesson.id, completed: true }
    });
    return total > 0 ? (completed / total) * 100 : 0;
  }
});

addStaticMethods(Lesson as any, {
  async findBySection(this: typeof Lesson, sectionId: string, includeUnpublished: boolean = false) {
    const model = this as any;
    const where: { section_id: string; is_published?: boolean } = { section_id: sectionId };
    if (!includeUnpublished) {
      where.is_published = true;
    }
    return await model.findAll({
      where,
      order: [['order_index', 'ASC']],
      include: [
        {
          model: sequelize.models.LessonMaterial,
          as: 'materials'
        }
      ]
    });
  },
  async reorderLessons(this: typeof Lesson, sectionId: string, lessonOrders: { id: string; order_index: number }[]) {
    const model = this as any;
    const transaction = await sequelize.transaction();
    try {
      for (const { id, order_index } of lessonOrders) {
        await model.update(
          { order_index },
          { where: { id, section_id: sectionId }, transaction }
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

export default exportModel(Lesson as any);







