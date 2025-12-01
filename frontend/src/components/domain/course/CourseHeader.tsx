import { BookOpen, Users, Clock, Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Course } from '@/services/api/course.api';

interface CourseHeaderProps {
  course: Course;
  totalSections?: number;
  totalLessons?: number;
  rating?: number;
  totalRatings?: number;
}

/**
 * CourseHeader Component
 * 
 * Component header hiển thị thông tin chính của course:
 * - Title, Description
 * - Instructor info
 * - Meta info (difficulty, students, duration, sections/lessons)
 * - Rating (nếu có)
 */
export function CourseHeader({
  course,
  totalSections = 0,
  totalLessons = 0,
  rating,
  totalRatings,
}: CourseHeaderProps) {
  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  } as const;

  const difficultyVariants = {
    beginner: 'success' as const,
    intermediate: 'warning' as const,
    advanced: 'danger' as const,
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-lg p-6 lg:p-8 text-white">
      {/* Category badge */}
      {course.category && (
        <div className="mb-4">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {course.category.name}
          </Badge>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>

      {/* Description */}
      {course.description && (
        <p className="text-lg text-blue-50 mb-6 line-clamp-2">{course.description}</p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Difficulty */}
        <Badge variant={difficultyVariants[course.difficulty]}>
          {difficultyLabels[course.difficulty]}
        </Badge>

        {/* Students count */}
        {course._count?.enrollments !== undefined && (
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{course._count.enrollments} học viên</span>
          </div>
        )}

        {/* Duration */}
        {course.duration_hours && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{course.duration_hours} giờ</span>
          </div>
        )}

        {/* Sections & Lessons */}
        {totalSections > 0 && (
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>
              {totalSections} chương • {totalLessons} bài học
            </span>
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>
              {rating.toFixed(1)} ({totalRatings || 0} đánh giá)
            </span>
          </div>
        )}
      </div>

      {/* Instructor */}
      {course.instructor && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/20">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
            {course.instructor.avatar_url ? (
              <img
                src={course.instructor.avatar_url}
                alt={course.instructor.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              course.instructor.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm text-blue-100">Giảng viên</p>
            <p className="font-semibold text-lg">{course.instructor.full_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

