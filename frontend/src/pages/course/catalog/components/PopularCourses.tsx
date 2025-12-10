import { TrendingUp } from 'lucide-react';
import { CourseCard } from '@/components/domain/course/CourseCard';
import { Spinner } from '@/components/ui/Spinner';
import type { Course } from '@/services/api/course.api';
import { useEnrolledCourses } from '@/hooks/useCoursesData';

interface PopularCoursesProps {
  courses: Course[];
  isLoading: boolean;
  onCourseClick: (courseId: string) => void;
}

/**
 * PopularCourses Component
 * 
 * Hiển thị khóa học phổ biến với design đơn giản, clean
 */
export function PopularCourses({ courses, isLoading, onCourseClick }: PopularCoursesProps) {
  // Lấy 4 khóa học đầu tiên cho phổ biến
  const displayCourses = courses.slice(0, 4);

  // Lấy danh sách khóa học đang học (enrolled) - không giới hạn tối đa ở FE
  const { data: enrolledData, isLoading: isLoadingEnrolled } = useEnrolledCourses();
  const studyingCourses = enrolledData?.courses ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* 1. Danh sách khóa học đang học */}
      {studyingCourses.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Khóa học đang học</h2>
              <p className="text-gray-600 mt-1 text-sm">
                Tiếp tục hành trình học tập của bạn với các khóa học đang theo học
              </p>
            </div>
          </div>

          {isLoadingEnrolled ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {studyingCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  rating={course.rating ?? 0}
                  totalRatings={course.total_ratings ?? 0}
                  onCourseClick={onCourseClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Khóa học phổ biến */}
      {displayCourses.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Khóa học phổ biến</h2>
              <p className="text-gray-600 mt-1 text-sm">
                Các khóa học được học viên yêu thích nhất
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                rating={course.rating ?? 0}
                totalRatings={course.total_ratings ?? 0}
                onCourseClick={onCourseClick}
              />
            ))}
          </div>
        </>
      )}

      {/* View More Link - Simple */}
      {/* {courses.length > 4 && (
        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Xem thêm {courses.length - 4} khóa học khác
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      )} */}
    </div>
  );
}

