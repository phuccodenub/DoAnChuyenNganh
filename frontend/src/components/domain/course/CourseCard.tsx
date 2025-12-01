import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Course } from '@/services/api/course.api';
import { generateRoute } from '@/constants/routes';

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: string) => void;
  isEnrolling?: boolean;
  onCourseClick?: (courseId: string) => void;
  isBestseller?: boolean;
  rating?: number;
  totalRatings?: number;
  originalPrice?: number;
}

/**
 * CourseCard Component - Udemy Style
 * 
 * Design giống Udemy với:
 * - Thumbnail lớn với aspect ratio 16:9
 * - Title và instructor name
 * - Badges inline: Bestseller + Rating + Ratings count
 * - Price với discount strikethrough
 */
export function CourseCard({
  course,
  showEnrollButton = false,
  onEnroll,
  isEnrolling = false,
  onCourseClick,
  isBestseller = false,
  rating = 4.5,
  totalRatings = 0,
  originalPrice,
}: CourseCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [previewPosition, setPreviewPosition] = useState<'right' | 'left'>('right');

  const detailPath = generateRoute.courseDetail(course.id);
  const handleCourseClick = () => {
    if (onCourseClick) {
      onCourseClick(course.id);
    }
  };

  const isFree = course.is_free || !course.price || course.price === 0;

  const instructorName = course.instructor
    ? course.instructor.full_name ??
      [course.instructor.first_name, course.instructor.last_name].filter(Boolean).join(' ')
    : '';

  const Wrapper = ({ children, className = '' }: { children: ReactNode; className?: string }) =>
    onCourseClick ? (
      <button
        type="button"
        onClick={handleCourseClick}
        className={`block w-full text-left ${className}`.trim()}
      >
        {children}
      </button>
    ) : (
      <Link to={detailPath} className={`block ${className}`.trim()}>
        {children}
      </Link>
    );

  const handleMouseEnter = () => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const panelWidth = 320; // ~w-80
    const margin = 24;

    if (rect.right + panelWidth + margin > window.innerWidth) {
      setPreviewPosition('left');
    } else {
      setPreviewPosition('right');
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      className="relative bg-white rounded-2xl border border-gray-300 p-3 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <Wrapper>
        <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-lg">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${
              course.thumbnail_url ? 'hidden' : ''
            }`}
          >
            <img
              src="/GekLearn.png"
              alt="GekLearn logo"
              className="h-14 w-auto object-contain opacity-80"
            />
          </div>
        </div>
      </Wrapper>

      <div className="pt-3">
        {/* Title - tối đa 2 dòng, dư thì ... */}
        <Wrapper>
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-0 line-clamp-2 min-h-[2.4rem]">
            {course.title}
          </h3>
        </Wrapper>

        {/* Instructor - sát ngay dưới title */}
        {instructorName && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-1 mt-0.5">{instructorName}</p>
        )}

        <div className="flex items-center gap-2 mb-2">
          {isBestseller && (
            <span className="inline-flex items-center rounded-lg border border-gray-400 px-3 py-1 text-xs font-semibold text-gray-900">
              Bestseller
            </span>
          )}

          <span className="inline-flex items-center rounded-lg border border-gray-400 px-3 py-1 text-xs text-gray-900">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
            {rating.toFixed(1)}
          </span>

          {totalRatings > 0 && (
            <span className="inline-flex items-center rounded-lg border border-gray-400 px-3 py-1 text-xs text-gray-700">
              {totalRatings.toLocaleString('vi-VN')} ratings
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          {isFree ? (
            <span className="text-lg font-medium text-green-600">Miễn phí</span>
          ) : (
            <>
              {course.price && (
                <span className="text-lg font-bold text-gray-900">
                  đ{course.price.toLocaleString('vi-VN')}
                </span>
              )}
              {originalPrice && originalPrice > (course.price || 0) && (
                <span className="text-sm text-gray-500 line-through">
                  đ{originalPrice.toLocaleString('vi-VN')}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hover preview panel (desktop only) */}
      <div
        className={`hidden lg:group-hover:block absolute top-3 z-30 pointer-events-none ${
          previewPosition === 'right' ? 'left-full ml-4' : 'right-full mr-4'
        }`}
      >
        <div className="w-80 bg-white rounded-2xl border border-gray-200 shadow-xl p-4 pointer-events-auto">
          <p className="text-xs font-semibold text-blue-600 mb-1">Khóa học</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>

          {instructorName && (
            <p className="text-xs text-gray-600 mb-3">{instructorName}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            {rating > 0 && (
              <div className="inline-flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                {totalRatings > 0 && (
                  <span className="text-gray-500">
                    ({totalRatings.toLocaleString('vi-VN')})
                  </span>
                )}
              </div>
            )}
            {course.duration_hours && <span>{course.duration_hours} giờ học</span>}
            {course._count?.enrollments && (
              <span>{course._count.enrollments.toLocaleString('vi-VN')} học viên</span>
            )}
          </div>

          {/* Description */}
          {course.description && (
            <p className="text-xs text-gray-700 mb-3 line-clamp-5">
              {course.description}
            </p>
          )}

          {/* Simple CTA */}
          <button className="w-full mt-1 rounded-lg border border-blue-600 text-blue-600 text-sm font-semibold py-2 hover:bg-blue-50 transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;