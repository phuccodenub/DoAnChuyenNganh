import { DataTypes, ModelStatic } from 'sequelize';
import { getSequelize } from '../config/db';
import { LessonMaterialInstance } from '../types/model.types';
import { exportModel, addInstanceMethods, addStaticMethods } from '../utils/model-extension.util';

const sequelize = getSequelize();

/**
 * LessonMaterial Model
 * Các file tài liệu đính kèm cho mỗi bài học
 * 
 * Nghiệp vụ:
 * - Một bài học có thể có nhiều tài liệu đính kèm (1:N)
 * - Tài liệu có thể là PDF, DOCX, PPTX, ZIP, hoặc các file khác
 * - Lưu trữ metadata về file (tên, loại, kích thước, URL)
 */
const LessonMaterial = sequelize.define('LessonMaterial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID bài học mà tài liệu này thuộc về'
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tên file gốc (VD: "Slide-Chuong-1.pdf")'
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL để download/xem file (có thể là S3, CDN, hoặc local storage)'
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'MIME type của file (VD: "application/pdf", "application/zip")'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Kích thước file (bytes)'
  },
  file_extension: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Phần mở rộng file (VD: "pdf", "docx", "zip")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả về tài liệu'
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Số lần tải xuống'
  },
  is_downloadable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Cho phép tải xuống không (có file chỉ cho xem online)'
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID người upload tài liệu'
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Thứ tự hiển thị'
  }
}, {
  tableName: 'lesson_materials',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['lesson_id']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['file_type']
    }
  ]
});

const LessonMaterialModel = LessonMaterial as unknown as ModelStatic<LessonMaterialInstance>;

// Instance Methods (type-safe)
addInstanceMethods(LessonMaterialModel, {
 getFormattedSize(this: LessonMaterialInstance): string {
   if (!this.file_size) return 'N/A';
   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(this.file_size) / Math.log(1024));
   return `${(this.file_size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
 },
 async incrementDownloadCount(this: LessonMaterialInstance) {
   this.download_count += 1;
   await this.save();
   return this.download_count;
 }
});

// Static Methods (type-safe)
addStaticMethods(LessonMaterialModel, {
 async findByLesson(this: ModelStatic<LessonMaterialInstance>, lessonId: string) {
   return await this.findAll({
     where: { lesson_id: lessonId },
     order: [['order_index', 'ASC'], ['created_at', 'ASC']],
     include: [
       {
         model: sequelize.models.User,
         as: 'uploader',
         attributes: ['id', 'first_name', 'last_name', 'email']
       }
     ]
   });
 },
 async getTotalSizeByLesson(this: ModelStatic<LessonMaterialInstance>, lessonId: string): Promise<number> {
   const materials = await this.findAll({
     where: { lesson_id: lessonId },
     attributes: ['file_size']
   });
   return materials.reduce((total: number, material: LessonMaterialInstance) => {
     return total + (material.file_size ?? 0);
   }, 0);
 }
});

export default exportModel(LessonMaterialModel);







