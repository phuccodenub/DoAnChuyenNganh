import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { CourseCard } from '@/components/domain/course/CourseCard';
import { Spinner } from '@/components/ui/Spinner';
import { useCourses } from '@/hooks/useCoursesData';
import { useDebounce } from '@/hooks/useDebounce';
import { CourseFilters, Course } from '@/services/api/course.api';
import { generateRoute } from '@/constants/routes';

/**
 * Course Catalog Page - Dashboard Layout
 * 
 * Layout mới với 4 sections chính:
 * 1. SearchHeader - Thanh search lớn + filters
 * 2. CourseGrid - 8 khóa học đầu tiên (4 cột)
 * 3. PlatformPromotion - Quảng cáo nền tảng + instructor avatars
 * 4. RecommendedSection - Khóa học gợi ý (4 khóa học, 4 cột)
 */

// ============================================================================
// SearchHeader Component
// ============================================================================
interface SearchHeaderProps {
  searchTerm: string;
  filters: Partial<CourseFilters>;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof CourseFilters, value: any) => void;
  onSearch: () => void;
}

function SearchHeader({
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
  onSearch,
}: SearchHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 rounded-2xl p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-3">
          Khám phá khóa học của bạn
        </h1>
        <p className="text-blue-100 text-center mb-8">
          Tìm kiếm từ hàng nghìn khóa học chất lượng cao
        </p>

        {/* Large Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm khóa học, giảng viên, chủ đề..."
                className="w-full pl-12 pr-4 py-3 text-lg border-0 focus:outline-none focus:ring-0"
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              {/* Category Dropdown */}
              <select
                value={filters.category_id || ''}
                onChange={(e) => onFilterChange('category_id', e.target.value || undefined)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Danh mục</option>
                <option value="1">Lập trình</option>
                <option value="2">Thiết kế</option>
                <option value="3">Kinh doanh</option>
                <option value="4">Marketing</option>
              </select>

              {/* Difficulty Dropdown */}
              <select
                value={filters.difficulty || ''}
                onChange={(e) => onFilterChange('difficulty', e.target.value || undefined)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Độ khó</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              
              {/* Search Button */}
              <button
                onClick={onSearch}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['React', 'Python', 'UI/UX Design', 'Digital Marketing', 'Data Science'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CourseGrid Component - Hiển thị 4 khóa học đầu
// ============================================================================
interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
  onCourseClick: (courseId: string) => void;
}

function CourseGrid({ courses, isLoading, onCourseClick }: CourseGridProps) {
  // Lấy 4 khóa học đầu tiên
  const displayCourses = courses.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Khóa học phổ biến</h2>
          <p className="text-gray-600 mt-1">Các khóa học được học viên yêu thích nhất</p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Xem tất cả
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCourses.map((course) => (
          <CourseCard key={course.id} course={course} onCourseClick={onCourseClick} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PlatformPromotion Component
// ============================================================================
function PlatformPromotion() {
  const instructors = [
    { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=9' },
    { name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=7' },
  ];

  const stats = [
    { icon: BookOpen, label: 'Khóa học', value: '10,000+' },
    { icon: Users, label: 'Học viên', value: '500K+' },
    { icon: Award, label: 'Chứng chỉ', value: '250K+' },
    { icon: TrendingUp, label: 'Tỷ lệ hoàn thành', value: '95%' },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 mb-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tìm hiểu về nền tảng học tập
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Tham gia cùng hàng nghìn học viên đang học tập và phát triển kỹ năng 
              với các giảng viên hàng đầu. Nền tảng của chúng tôi cung cấp trải nghiệm 
              học tập tương tác, chứng chỉ được công nhận và hỗ trợ 24/7.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <Icon className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Khám phá thêm
            </button>
          </div>

          {/* Right side - Instructor Avatars */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giảng viên hàng đầu
              </h3>
              <div className="flex flex-wrap gap-4">
                {instructors.map((instructor, index) => (
                  <div key={index} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-md group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center max-w-[80px] truncate">
                      {instructor.name}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                Xem tất cả giảng viên
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
export function CourseCatalogPage() {
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
        {/* 1. Search Header */}
        <SearchHeader
          searchTerm={searchTerm}
          filters={filters}
          onSearchChange={setSearchTerm}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

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

        {/* 2. Course Grid - 4 khóa học đầu */}
        {!error && (
          <CourseGrid
            courses={courses.slice(0, 4)}
            isLoading={isLoading}
            onCourseClick={handleCourseClick}
          />
        )}

        {/* 3. Platform Promotion */}
        {!isLoading && !error && courses.length > 0 && (
          <PlatformPromotion />
        )}

        {/* 4. Recommended Section - 4 khóa học gợi ý */}
        {!isLoading && !error && courses.length > 4 && (
          <RecommendedSection courses={courses} onCourseClick={handleCourseClick} />
        )}
      </div>
    </MainLayout>
  );
}

export default CourseCatalogPage;
