import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  MessageSquare,
  FolderOpen,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCourseContent, useLesson, useLessonProgress, useMarkLessonComplete } from '@/hooks/useLessonData';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  VideoPlayer,
  DocumentViewer,
  CurriculumTree,
  DiscussionTab,
  FileTab,
  type Section
} from '@/components/domain/learning';
import { ROUTES, generateRoute } from '@/constants/routes';
import { ChatFloatingButton } from '@/features/chat';

/**
 * LearningPage - Main learning interface
 * 
 * Features:
 * - Three-tab sidebar: Nội dung / Thảo luận / Tài liệu
 * - Video/Document content viewer
 * - Progress tracking with useLessonProgress
 * - Auto mark complete on next lesson
 * - Manual mark complete button
 * - Responsive design (mobile sidebar toggle)
 */
export function LearningPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'content' | 'discussion' | 'files'>('content');
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(
    lessonId
  );

  // Fetch course content
  const { data: courseContent, isLoading: isLoadingContent } = useCourseContent(courseId || '');

  // Fetch current lesson
  const { data: lesson, isLoading: isLoadingLesson } = useLesson(
    currentLessonId || ''
  );

  // Fetch lesson progress (IMPORTANT for LMS)
  const { data: lessonProgress } = useLessonProgress(currentLessonId || '');

  // Mark complete mutation
  const { mutate: markComplete, isPending: isMarkingComplete } = useMarkLessonComplete();

  // Flatten lessons for navigation (filter out undefined)
  const flatLessons = useMemo(() => {
    if (!courseContent) return [];
    return courseContent.sections.flatMap((s) => s.lessons || []).filter(Boolean);
  }, [courseContent]);

  // Auto-select first lesson if no lesson selected
  if (!currentLessonId && courseContent && courseContent.sections.length > 0) {
    const firstSection = courseContent.sections[0];
    const firstLessons = firstSection.lessons || [];
    if (firstLessons.length > 0) {
      setCurrentLessonId(firstLessons[0].id);
    }
  }

  // Get current lesson index
  const currentIndex = useMemo(() => {
    return flatLessons.findIndex((l) => l?.id === currentLessonId);
  }, [flatLessons, currentLessonId]);

  const handleLessonClick = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleMarkComplete = () => {
    if (!currentLessonId) return;

    markComplete(currentLessonId, {
      onSuccess: () => {
        toast.success('Đã đánh dấu hoàn thành bài học!');
      },
      onError: () => {
        toast.error('Không thể đánh dấu hoàn thành');
      }
    });
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = flatLessons[currentIndex - 1];
      if (prevLesson) {
        setCurrentLessonId(prevLesson.id);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < flatLessons.length - 1) {
      const nextLesson = flatLessons[currentIndex + 1];
      if (!nextLesson) return;

      // Auto mark complete current lesson before moving to next
      if (currentLessonId && !lessonProgress?.completed) {
        markComplete(currentLessonId, {
          onSuccess: () => {
            toast.success('Đã hoàn thành bài học!');
            setCurrentLessonId(nextLesson.id);
          },
          onError: () => {
            toast.error('Không thể đánh dấu hoàn thành');
            setCurrentLessonId(nextLesson.id);
          }
        });
      } else {
        setCurrentLessonId(nextLesson.id);
      }
    }
  };

  const handleBackToCourse = () => {
    navigate(ROUTES.STUDENT.MY_COURSES);
  };

  if (isLoadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy nội dung khóa học
          </h1>
          <Button onClick={handleBackToCourse}>
            Quay lại khóa học của tôi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-white">
        <div className="flex items-center gap-4">
          {/* Back to courses */}
          <button
            onClick={handleBackToCourse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Sidebar toggle (mobile) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Course & Lesson Info */}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {lesson?.course?.title || 'Đang tải...'}
            </h1>
            <p className="text-xs text-gray-500">
              Bài {currentIndex + 1}/{flatLessons.length}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleBackToCourse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Tabs */}
        {showSidebar && (
          <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              {([
                { key: 'content', label: 'Nội dung', icon: FileText },
                { key: 'discussion', label: 'Thảo luận', icon: MessageSquare },
                { key: 'files', label: 'Tài liệu', icon: FolderOpen }
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSidebarTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${sidebarTab === key
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'content' && (
                <CurriculumTree
                  sections={courseContent.sections as Section[]}
                  activeLessonId={currentLessonId || null}
                  onLessonClick={handleLessonClick}
                />
              )}
              {sidebarTab === 'discussion' && <DiscussionTab />}
              {sidebarTab === 'files' && <FileTab />}
            </div>

            {/* Progress Footer (only show for content tab) */}
            {sidebarTab === 'content' && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tiến độ khóa học</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {courseContent.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseContent.progress_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {courseContent.completed_lessons}/{courseContent.total_lessons} bài học đã hoàn thành
                </p>
              </div>
            )}
          </aside>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            {isLoadingLesson ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : lesson ? (
              <div className="space-y-6">
                {/* Lesson header */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {lesson.title}
                  </h2>
                  {lesson.description && (
                    <p className="text-gray-600">{lesson.description}</p>
                  )}
                </div>

                {/* Content viewer */}
                {lesson.content_type === 'video' && lesson.video_url && (
                  <VideoPlayer
                    lessonId={lesson.id}
                    videoUrl={lesson.video_url}
                    lastPosition={lessonProgress?.last_position || 0}
                  />
                )}

                {lesson.content_type === 'document' && (lesson.content || lesson.video_url) && (
                  <DocumentViewer
                    lessonId={lesson.id}
                    documentUrl={lesson.content || lesson.video_url || ''}
                    title={lesson.title}
                  />
                )}

                {/* Mark complete button */}
                {!lessonProgress?.completed && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleMarkComplete}
                      isLoading={isMarkingComplete}
                      size="lg"
                      className="gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Đánh dấu hoàn thành
                    </Button>
                  </div>
                )}

                {lessonProgress?.completed && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã hoàn thành</span>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="pt-6 border-t border-gray-200">
                  {/* Report Issue Button */}
                  <div className="mb-4">
                    <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Báo cáo vấn đề
                    </button>
                  </div>

                  {/* Prev/Next Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevLesson}
                      disabled={currentIndex <= 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Bài trước
                    </Button>

                    <Button
                      onClick={handleNextLesson}
                      disabled={currentIndex < 0 || currentIndex >= flatLessons.length - 1}
                      className="gap-2"
                    >
                      Bài tiếp theo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-600">Chọn một bài học để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Floating Button - Entry point to chat with instructor */}
      {courseId && (
        <ChatFloatingButton
          onClick={() => navigate(generateRoute.student.chat(courseId))}
        />
      )}
    </div>
  );
}

export default LearningPage;
