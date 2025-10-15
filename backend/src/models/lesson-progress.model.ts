import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { LessonProgressAttributes, LessonProgressCreationAttributes, LessonProgressInstance } from '../types/model.types';

const sequelize = getSequelize();

/**
 * LessonProgress Model
 * Ghi lại tiến độ học tập của sinh viên đối với từng bài học
 * 
 * Nghiệp vụ:
 * - Quan hệ Nhiều-Nhiều giữa User và Lesson
 * - Một sinh viên có tiến độ trên nhiều bài học
 * - Một bài học được nhiều sinh viên học
 * - Lưu trạng thái cụ thể (đã hoàn thành chưa, xem đến đâu...)
 */
const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID sinh viên'
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID bài học'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Bài học đã hoàn thành chưa'
  },
  last_position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Vị trí cuối cùng đã xem (giây, cho video) hoặc % tiến độ đọc'
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Phần trăm hoàn thành bài học (0-100)'
  },
  time_spent_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tổng thời gian học bài này (giây)'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm bắt đầu học bài'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm hoàn thành bài học'
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Lần cuối cùng truy cập bài học'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú cá nhân của sinh viên về bài học'
  },
  bookmarked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đánh dấu yêu thích/quan trọng'
  },
  quiz_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Điểm quiz của bài học (nếu có)'
  }
}, {
  tableName: 'lesson_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['lesson_id']
    },
    {
      unique: true,
      fields: ['user_id', 'lesson_id'],
      name: 'unique_user_lesson_progress'
    },
    {
      fields: ['completed']
    },
    {
      fields: ['last_accessed_at']
    }
  ]
});

// Instance Methods
;(LessonProgress as any).prototype.markAsCompleted = async function() {
  this.completed = true;
  this.completion_percentage = 100;
  this.completed_at = new Date();
  await this.save();
  return this;
};

;(LessonProgress as any).prototype.updateProgress = async function(data: {
  last_position?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
}) {
  if (data.last_position !== undefined) {
    this.last_position = data.last_position;
  }
  if (data.completion_percentage !== undefined) {
    this.completion_percentage = data.completion_percentage;
  }
  if (data.time_spent_seconds !== undefined) {
    this.time_spent_seconds = data.time_spent_seconds;
  }
  
  this.last_accessed_at = new Date();
  
  // Auto-complete if 100%
  if (this.completion_percentage >= 100 && !this.completed) {
    await this.markAsCompleted();
  } else {
    await this.save();
  }
  
  return this;
};

// Class Methods
;(LessonProgress as any).findOrCreateProgress = async function(userId: string, lessonId: string) {
  const [progress, created] = await this.findOrCreate({
    where: { user_id: userId, lesson_id: lessonId },
    defaults: {
      started_at: new Date(),
      last_accessed_at: new Date()
    }
  });
  
  if (!created && !progress.started_at) {
    progress.started_at = new Date();
    await progress.save();
  }
  
  return progress;
};

;(LessonProgress as any).getUserCourseProgress = async function(userId: string, courseId: string) {
  // Get all lessons in the course
  const sections = await sequelize.models.Section.findAll({
    where: { course_id: courseId },
    include: [
      {
        model: sequelize.models.Lesson,
        as: 'lessons',
        attributes: ['id']
      }
    ]
  });
  
  const lessonIds = sections.flatMap((section: any) => 
    section.lessons.map((lesson: any) => lesson.id)
  );
  
  if (lessonIds.length === 0) return { total: 0, completed: 0, percentage: 0 };
  
  // Get progress for all lessons
  const progress = await this.findAll({
    where: {
      user_id: userId,
      lesson_id: lessonIds
    }
  });
  
  const completed = progress.filter((p: any) => p.completed).length;
  
  return {
    total: lessonIds.length,
    completed,
    percentage: (completed / lessonIds.length) * 100
  };
};

;(LessonProgress as any).getRecentActivity = async function(userId: string, limit: number = 10) {
  return await this.findAll({
    where: { user_id: userId },
    order: [['last_accessed_at', 'DESC']],
    limit,
    include: [
      {
        model: sequelize.models.Lesson,
        as: 'lesson',
        include: [
          {
            model: sequelize.models.Section,
            as: 'section',
            include: [
              {
                model: sequelize.models.Course,
                as: 'course',
                attributes: ['id', 'title', 'thumbnail_url']
              }
            ]
          }
        ]
      }
    ]
  });
};

export default LessonProgress as any;







