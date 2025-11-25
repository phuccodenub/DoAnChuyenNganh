import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useCourseContent, useLesson, useLessonProgress, useMarkLessonComplete } from '@/hooks/useLessonData';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { CurriculumSidebar } from '@/components/domain/learning/CurriculumSidebar';
import { VideoPlayer } from '@/components/domain/learning/VideoPlayer';
import { DocumentViewer } from '@/components/domain/learning/DocumentViewer';
import { ROUTES } from '@/constants/routes';

/**
 * LearningPage - Main learning interface
 * 
 * Features:
 * - Curriculum sidebar (expandable sections)
 * - Video/Document content viewer
 * - Progress tracking
 * - Prev/Next lesson navigation
 * - Mark as complete button
 * - Responsive design (mobile sidebar toggle)
 */
export function LearningPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(
    lessonId ? lessonId : undefined
  );

  const parsedCourseId = courseId!;

  // Fetch course content
  const { data: courseContent, isLoading: isLoadingContent } = useCourseContent(parsedCourseId);
  
  // Fetch current lesson
  const { data: lesson, isLoading: isLoadingLesson } = useLesson(
    currentLessonId!
  );

  // Fetch lesson progress
  const { data: lessonProgress } = useLessonProgress(currentLessonId!);

  // Mark complete mutation
  const { mutate: markComplete, isPending: isMarkingComplete } = useMarkLessonComplete();

  // Auto-select first lesson if no lesson selected
  if (!currentLessonId && courseContent && courseContent.sections.length > 0) {
    const firstSection = courseContent.sections[0];
    if (firstSection.lessons.length > 0) {
      setCurrentLessonId(firstSection.lessons[0].id);
    }
  }

  const handleLessonClick = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleMarkComplete = () => {
    if (currentLessonId) {
      markComplete(currentLessonId);
    }
  };

  const handlePrevLesson = () => {
    if (lesson?.prev_lesson) {
      setCurrentLessonId(lesson.prev_lesson.id);
    }
  };

  const handleNextLesson = () => {
    if (lesson?.next_lesson) {
      setCurrentLessonId(lesson.next_lesson.id);
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle (mobile) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Course title */}
          <div>
            <h1 className="font-semibold text-gray-900 text-sm md:text-base">
              {courseContent.course_title}
            </h1>
            {lesson && (
              <p className="text-xs text-gray-600 mt-0.5">
                {lesson.title}
              </p>
            )}
          </div>
        </div>

        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToCourse}
        >
          Quay lại
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0 overflow-hidden">
            <CurriculumSidebar
              sections={courseContent.sections}
              currentLessonId={currentLessonId}
              onLessonClick={handleLessonClick}
              courseProgress={{
                total_lessons: courseContent.total_lessons,
                completed_lessons: courseContent.completed_lessons,
                progress_percentage: courseContent.progress_percentage,
              }}
            />
          </div>
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
                {lesson.content_type === 'video' && lesson.content_url && (
                  <VideoPlayer
                    lessonId={lesson.id}
                    videoUrl={lesson.content_url}
                    lastPosition={lessonProgress?.last_position_seconds || 0}
                  />
                )}

                {lesson.content_type === 'document' && lesson.content_url && (
                  <DocumentViewer
                    lessonId={lesson.id}
                    documentUrl={lesson.content_url}
                    title={lesson.title}
                  />
                )}

                {/* Mark complete button */}
                {!lessonProgress?.is_completed && (
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

                {lessonProgress?.is_completed && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Đã hoàn thành</span>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={!lesson.prev_lesson}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Bài trước
                  </Button>

                  <Button
                    onClick={handleNextLesson}
                    disabled={!lesson.next_lesson}
                    className="gap-2"
                  >
                    Bài tiếp theo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
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
    </div>
  );
}

export default LearningPage;
