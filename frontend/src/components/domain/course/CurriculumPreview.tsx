import { BookOpen, Lock, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Section, Lesson } from '@/services/api/lesson.api';

interface CurriculumPreviewProps {
  sections: Section[];
  isEnrolled?: boolean;
  completedLessons?: string[];
  onLessonClick?: (lessonId: string) => void;
  showPreviewOnly?: boolean;
}

/**
 * CurriculumPreview Component
 * 
 * Component preview curriculum cho course detail:
 * - Hiển thị sections và lessons
 * - Lock icon cho lessons chưa unlock (nếu có prerequisites)
 * - Check icon cho lessons đã hoàn thành
 * - Preview mode (chỉ xem, không click) nếu chưa enroll
 */
export function CurriculumPreview({
  sections,
  isEnrolled = false,
  completedLessons = [],
  onLessonClick,
  showPreviewOnly = false,
}: CurriculumPreviewProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (showPreviewOnly || !isEnrolled) {
      return;
    }
    onLessonClick?.(lesson.id);
  };

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Chưa có nội dung khóa học</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Nội dung khóa học
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="border-l-2 border-blue-200 pl-4">
              {/* Section Header */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">
                  Chương {sectionIndex + 1}: {section.title}
                </h4>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {section.lessons?.length || 0} bài học
                </p>
              </div>

              {/* Lessons */}
              {section.lessons && section.lessons.length > 0 && (
                <div className="space-y-2 ml-4">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isLocked = !isEnrolled && showPreviewOnly;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border transition-colors
                          ${
                            isLocked
                              ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                              : isEnrolled
                              ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                              : 'bg-white border-gray-200'
                          }
                        `}
                      >
                        {/* Lesson Number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                          {lessonIndex + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900 truncate">
                              {lesson.title}
                            </h5>
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            {isLocked && (
                              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        {/* Lesson Meta */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {lesson.duration_minutes && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(lesson.duration_minutes)}</span>
                            </div>
                          )}
                          {lesson.content_type && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.content_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {!isEnrolled && showPreviewOnly && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Đăng ký khóa học để truy cập đầy đủ nội dung và bắt đầu học ngay!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

