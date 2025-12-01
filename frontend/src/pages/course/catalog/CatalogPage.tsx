import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, BookOpen } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { CourseCard } from '@/components/domain/course/CourseCard';
import { Spinner } from '@/components/ui/Spinner';
import { useCourses } from '@/hooks/useCoursesData';
import { useDebounce } from '@/hooks/useDebounce';
import { CourseFilters, Course } from '@/services/api/course.api';
import { generateRoute } from '@/constants/routes';
import { HeroBanner } from './components/HeroBanner';
import { PopularCourses } from './components/PopularCourses';

// Course Catalog Page - Hero + Popular + Recommended

// ============================================================================
// RecommendedSection Component - 4 khóa học gợi ý
// ============================================================================
interface RecommendedSectionProps {
  courses: Course[];
  onCourseClick: (courseId: string) => void;
}

function RecommendedSection({ courses, onCourseClick }: RecommendedSectionProps) {
  // 1. Lấy tất cả các khóa học sau 4 khóa đầu tiên (index 4 trở đi)
  const availableCourses = courses.slice(4);

  // Kiểm tra nếu không còn khóa học nào để gợi ý
  if (availableCourses.length === 0) return null;

  let recommendedCourses: Course[];

  if (availableCourses.length <= 4) {
    // 2. Nếu chỉ còn 4 khóa học hoặc ít hơn, lấy tất cả
    recommendedCourses = availableCourses;
  } else {
    // 3. Nếu còn nhiều hơn 4 khóa học, chọn 4 khóa học ngẫu nhiên
    const shuffled = availableCourses
      .map(value => ({ value, sort: Math.random() })) // Gán số ngẫu nhiên cho mỗi khóa học
      .sort((a, b) => a.sort - b.sort) // Sắp xếp ngẫu nhiên
      .map(({ value }) => value); // Lấy lại khóa học

    recommendedCourses = shuffled.slice(0, 4); // Lấy 4 khóa học đầu tiên sau khi sắp xếp ngẫu nhiên
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gợi ý cho bạn</h2>
          <p className="text-gray-600 mt-1">Dựa trên sở thích và lịch sử học tập của bạn</p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Tùy chỉnh gợi ý
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedCourses.map((course) => (
          <CourseCard key={course.id} course={course} onCourseClick={onCourseClick} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main CourseCatalogPage Component
// ============================================================================
export function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<CourseFilters>>({
    status: 'published',
  });
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 500);

  
  // Fetch courses - lấy 12 khóa học (8 cho grid chính + 4 cho recommended)
  const { data, isLoading, error } = useCourses({
    page: 1,
    limit: 12,
    search: debouncedSearch || undefined,
    ...filters,
  });

  const courses = data?.data?.courses || [];

  const handleCourseClick = (courseId: string) => {
    navigate(generateRoute.courseDetail(courseId));
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    // Trigger search - debounce sẽ tự động xử lý
    console.log('Searching with:', searchTerm, filters);
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Hero Banner Slider */}
        <HeroBanner />

        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-red-50 rounded-lg mb-8">
            <p className="text-red-600 mb-4">Không thể tải danh sách khóa học</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && courses.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-lg mb-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              Không tìm thấy khóa học nào
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ status: 'published' });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* 2. Popular Courses */}
        {!error && (
          <PopularCourses
            courses={courses}
            isLoading={isLoading}
            onCourseClick={handleCourseClick}
          />
        )}

        {/* 3. Recommended Section - 4 khóa học gợi ý */}
        {!isLoading && !error && courses.length > 4 && (
          <RecommendedSection courses={courses} onCourseClick={handleCourseClick} />
        )}
      </div>
    </MainLayout>
  );
}

export default CatalogPage;
