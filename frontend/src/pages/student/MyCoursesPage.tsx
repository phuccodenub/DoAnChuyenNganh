import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Bot,
  ArrowRight,
  BookOpen,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { useStudentEnrolledCourses, useInProgressCourses } from '@/hooks/useStudentData';
import { generateRoute } from '@/constants/routes';

// Status filter type
type CourseStatus = 'all' | 'not-started' | 'in-progress' | 'completed';

const STATUS_TABS: { id: string; label: string; value: CourseStatus }[] = [
  { id: 'all', label: 'Tất cả', value: 'all' },
  { id: 'not-started', label: 'Chưa bắt đầu', value: 'not-started' },
  { id: 'in-progress', label: 'Đang học', value: 'in-progress' },
  { id: 'completed', label: 'Đã hoàn thành', value: 'completed' },
];

export function MyCoursesPage() {
  const [activeStatus, setActiveStatus] = useState<CourseStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API Hooks
  const { data: coursesData, isLoading: isLoadingCourses } = useStudentEnrolledCourses();
  const { data: inProgressData, isLoading: isLoadingInProgress } = useInProgressCourses(2);

  const allCourses = coursesData?.courses || [];
  const inProgressCourses = inProgressData?.courses || [];

  // Helper function to get lesson route
  const getLessonRoute = (course: any) => {
    // Priority 1: next_lesson_id if available
    if (course.next_lesson_id) {
      return generateRoute.student.lesson(course.id, course.next_lesson_id);
    }
    // Priority 2: first_lesson_id if available
    if (course.first_lesson_id) {
      return generateRoute.student.lesson(course.id, course.first_lesson_id);
    }
    // Fallback: course detail page
    return generateRoute.courseDetail(course.id);
  };

  // Filter logic
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course: any) => {
      // Status filter
      let matchesStatus = true;
      if (activeStatus !== 'all') {
        const progress = course.enrollment?.progress_percentage || 0;
        if (activeStatus === 'not-started') matchesStatus = progress === 0;
        else if (activeStatus === 'in-progress') matchesStatus = progress > 0 && progress < 100;
        else if (activeStatus === 'completed') matchesStatus = progress === 100;
      }

      // Search filter
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [allCourses, activeStatus, searchQuery]);

  return (
    <StudentDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* --- SECTION 1: TIẾP TỤC HỌC --- */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiếp tục học</h2>
            {isLoadingInProgress ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : inProgressCourses.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Bạn chưa bắt đầu khóa học nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inProgressCourses.map((course: any) => {
                  const progress = course.enrollment?.progress_percentage || 0;
                  return (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-5">
                        {/* Thumbnail */}
                        <div className="relative w-full md:w-48 aspect-video md:aspect-auto rounded-xl overflow-hidden flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
                              {course.total_lessons || 0} bài học
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-2">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Khóa học</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2">
                              {course.title}
                            </h3>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                              <span>Tiến độ: {progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Link to={getLessonRoute(course)}>
                                <Button variant="outline" size="sm" className="rounded-lg">
                                  Tiếp tục
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Suggestion */}
                      {course.next_lesson_title && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">
                              Tiếp tục với <span className="text-indigo-600 font-medium cursor-pointer hover:underline">{course.next_lesson_title}</span>
                              <ArrowRight className="w-3 h-3 inline ml-1" />
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* --- SECTION 2: TẤT CẢ KHÓA HỌC --- */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tất cả khóa học</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium">
                {filteredCourses.length}
              </span>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              {/* Left: Status Tabs */}
              <div className="flex flex-wrap gap-2 bg-gray-100/50 p-1 rounded-xl">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStatus(tab.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      activeStatus === tab.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <Filter className="w-4 h-4" />
                  Thêm bộ lọc
                </Button>
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <ArrowUpDown className="w-4 h-4" />
                  Sắp xếp
                </Button>
              </div>
            </div>

            {/* Courses Grid */}
            {isLoadingCourses ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course: any) => {
                    const progress = course.enrollment?.progress_percentage || 0;
                    const isStarted = progress > 0;
                    const isCompleted = progress === 100;

                    return (
                      <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                        <div className="h-32 bg-gray-200 relative overflow-hidden">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-[10px] px-2 py-1 rounded-full">
                            {course.total_lessons || 0} bài học
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center gap-1 mb-2">
                            <BookOpen size={12} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Khóa học</span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3 flex-1">{course.title}</h3>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Tiến độ</span>
                              <span className={isCompleted ? 'text-green-600 font-medium' : ''}>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <Link to={getLessonRoute(course)} className="mt-auto">
                            <Button
                              variant={isCompleted ? "outline" : "primary"}
                              size="sm"
                              className="w-full"
                            >
                              {isCompleted ? 'Xem lại' : isStarted ? 'Tiếp tục' : 'Bắt đầu'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Không tìm thấy khóa học</h3>
                    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default MyCoursesPage;
