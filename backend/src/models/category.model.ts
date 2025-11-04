import { DataTypes } from 'sequelize';
import type { WhereOptions, ModelStatic } from '../types/sequelize-types';
import { getSequelize } from '../config/db';
import { CategoryAttributes, CategoryInstance } from '../types/model.types';
import { addInstanceMethods, addStaticMethods, exportModel } from '../utils/model-extension.util';

const sequelize = getSequelize();

/**
 * Category Model
 * Lưu các danh mục hoặc chủ đề của khóa học
 * (VD: "Lập trình", "Thiết kế", "Kinh doanh", "Ngôn ngữ", "Marketing")
 * 
 * Nghiệp vụ:
 * - Một danh mục có thể chứa nhiều khóa học
 * - Mỗi khóa học chỉ thuộc về một danh mục
 * - Danh mục có thể có cấu trúc phân cấp (parent_id)
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Tên danh mục (VD: "Lập trình", "Thiết kế")'
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Slug URL-friendly cho danh mục (VD: "lap-trinh", "thiet-ke")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả chi tiết về danh mục'
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID của danh mục cha (để tạo cấu trúc phân cấp)'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Icon hoặc emoji đại diện cho danh mục (VD: "💻", "🎨", "📊")'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mã màu đại diện cho danh mục (VD: "#3B82F6")'
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Thứ tự hiển thị của danh mục'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Danh mục có đang hoạt động không'
  },
  course_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Số lượng khóa học trong danh mục (cached, cập nhật định kỳ)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata bổ sung (tags, keywords, SEO data...)'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order_index']
    }
  ]
});

// Typed Model bridge
const CategoryModel = Category as unknown as ModelStatic<CategoryInstance>;

// Instance Methods
addInstanceMethods(CategoryModel, {
  isRootCategory(this: CategoryInstance): boolean {
    return this.parent_id === null;
  },
});

// Static/Class Methods
addStaticMethods(CategoryModel, {
  async findActiveCategories(this: ModelStatic<CategoryInstance>, includeSubcategories: boolean = false) {
    const where: WhereOptions<CategoryAttributes> = { is_active: true };
    if (!includeSubcategories) {
      Object.assign(where, { parent_id: null }); // Chỉ lấy danh mục gốc
    }

    return this.findAll({
      where,
      order: [['order_index', 'ASC'], ['name', 'ASC']],
      include: includeSubcategories
        ? [{
            model: this,
            as: 'subcategories',
            where: { is_active: true },
            required: false,
          }]
        : [],
    });
  },

  async findBySlug(this: ModelStatic<CategoryInstance>, slug: string) {
    return this.findOne({
      where: { slug, is_active: true },
      include: [
        {
          model: this,
          as: 'subcategories',
          where: { is_active: true },
          required: false,
        },
        {
          model: this,
          as: 'parent',
          required: false,
        },
      ],
    });
  },

  async updateCourseCount(this: ModelStatic<CategoryInstance>, categoryId: string) {
    const count = await sequelize.models.Course.count({
      where: { category_id: categoryId },
    });

    await this.update(
      { course_count: count },
      { where: { id: categoryId } },
    );

    return count;
  },
});

export default exportModel(CategoryModel);
