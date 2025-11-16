import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Course } from '@/services/api/course.api';
import { generateRoute } from '@/constants/routes';

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: number) => void;
  isEnrolling?: boolean;
}

/**
 * CourseCard Component
 * 
 * Reusable card để hiển thị thông tin course
 * Dùng cho: Catalog, My Courses, Search Results
 */
export function CourseCard({ 
  course, 
  showEnrollButton = false,
  onEnroll,
  isEnrolling = false
}: CourseCardProps) {
  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const;

  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <Link to={generateRoute.courseDetail(course.id)} className="block">
        <div className="aspect-video bg-gray-200 relative">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            {course.is_free ? (
              <Badge variant="success">Miễn phí</Badge>
            ) : course.price && (
              <Badge variant="info">
                <DollarSign className="w-3 h-3 inline" />
                {course.price.toLocaleString('vi-VN')} đ
              </Badge>
            )}
          </div>
          
          <div className="absolute bottom-2 left-2">
            <Badge variant={difficultyColors[course.difficulty]}>
              {difficultyLabels[course.difficulty]}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link 
          to={generateRoute.courseDetail(course.id)}
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {course.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {course.description}
        </p>

        {/* Instructor */}
        {course.instructor && course.instructor.full_name && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
              {course.instructor.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">
              {course.instructor.full_name}
            </span>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {course._count && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course._count.enrollments} học viên</span>
            </div>
          )}
          
          {course.duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours}h</span>
            </div>
          )}
        </div>

        {/* Category */}
        {course.category && course.category.name && (
          <div className="mb-4">
            <Badge variant="default" size="sm">
              {course.category.name}
            </Badge>
          </div>
        )}

        {/* Action button */}
        {showEnrollButton && onEnroll && (
          <button
            onClick={() => onEnroll(course.id)}
            disabled={isEnrolling}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEnrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        )}

        {!showEnrollButton && (
          <Link
            to={generateRoute.courseDetail(course.id)}
            className="block w-full text-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Xem chi tiết
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
