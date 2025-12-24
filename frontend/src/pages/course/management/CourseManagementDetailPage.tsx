import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '@/components/courseEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  BookOpen, 
  Settings, 
  Users, 
  Loader2, 
  AlertCircle,
  Info,
  ListChecks,
  FileCheck,
  Bot,
} from 'lucide-react';
import { ROUTES, generateRoute } from '@/constants/routes';
import { useInstructorCourseDetail, useCourseStats } from '@/hooks/useInstructorCourse';
import { CourseDashboardTab } from './tabs/DashboardTab';
import { CurriculumTab } from './tabs/CurriculumTab';
import { SettingsTab } from './tabs/SettingsTab';
import { StudentsTab } from './tabs/StudentsTab';
import { CourseInfoTab } from './tabs/CourseInfoTab';
import { ContentTab } from './tabs/ContentTab';
import { SubmissionsTab } from './tabs/SubmissionsTab';
import { AiGraderTab } from './tabs/AiGraderTab';

/**
 * CourseManagementDetailPage
 * 
 * Trang quản lý chi tiết khóa học với tabs:
 * - Dashboard: Thống kê tổng quát
 * - Curriculum: Quản lý nội dung (sections, lessons)
 * - Content: Tổng quan tương tác nội dung (lesson/quiz/assignment)
 * - Students: Danh sách học viên
 * - Settings: Cài đặt khóa học
 */
export function CourseManagementDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!courseId) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Mã khóa học không hợp lệ</p>
        </div>
      </PageWrapper>
    );
  }

  // Fetch course data
  const { data: courseData, isLoading: isCourseLoading, error: courseError } = useInstructorCourseDetail(courseId);
  const { data: statsData, isLoading: isStatsLoading } = useCourseStats(courseId);

  const course = courseData?.data;
  const stats = statsData?.data;

  // Loading state
  if (isCourseLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải khóa học...</span>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  const errorStatus = (courseError as any)?.response?.status || (courseError as any)?.status;
  const errorMessage =
    errorStatus === 403
      ? 'Bạn không có quyền quản lý khóa học này.'
      : errorStatus === 404
      ? 'Khóa học không tồn tại hoặc đã bị xóa.'
      : 'Đã có lỗi xảy ra khi tải thông tin khóa học.';

  if (courseError || !course) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải khóa học</h3>
          <p className="text-gray-600 mb-4 text-center px-4">{errorMessage}</p>
          <button
            onClick={() => navigate(ROUTES.INSTRUCTOR.MY_COURSES)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
        {/* Page Header */}
        <PageHeader
          title={course.title || 'Quản lý khóa học'}
          breadcrumbs={['Quản lý khóa học', course.title || 'Chi tiết']}
        />

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="w-full bg-white border-b border-gray-200">
            <div className="flex items-center justify-start space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'dashboard'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Info className="w-4 h-4 mr-2" />
                Thông tin
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'curriculum'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Giáo trình
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'content'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Nội dung
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Users className="w-4 h-4 mr-2" />
                Học viên
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'submissions'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Bài nộp
              </button>
              <button
                onClick={() => setActiveTab('ai-grader')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'ai-grader'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Grader
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium transition-colors',
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600 bg-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'dashboard' && (
            <div className="mt-6">
              <CourseDashboardTab courseId={courseId} course={course} stats={stats} isLoading={isStatsLoading} />
            </div>
          )}

          {activeTab === 'info' && (
            <div className="mt-6">
              <CourseInfoTab courseId={courseId} course={course} />
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="mt-6">
              <CurriculumTab courseId={courseId} />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="mt-6">
              <ContentTab courseId={courseId} />
            </div>
          )}

          {activeTab === 'students' && (
            <div className="mt-6">
              <StudentsTab courseId={courseId} />
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="mt-6">
              <SubmissionsTab courseId={courseId} />
            </div>
          )}

          {activeTab === 'ai-grader' && (
            <div className="mt-6">
              <AiGraderTab courseId={courseId} courseTitle={course.title || ''} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="mt-6">
              <SettingsTab courseId={courseId} course={course} />
            </div>
          )}
        </Tabs>
    </PageWrapper>
  );
}

export default CourseManagementDetailPage;

