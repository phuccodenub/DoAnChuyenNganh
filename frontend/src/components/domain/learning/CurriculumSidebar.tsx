import { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle, Lock, Clock } from 'lucide-react';
import { Section, Lesson } from '@/services/api/lesson.api';
import { cn } from '@/lib/utils';

interface CurriculumSidebarProps {
  sections: Section[];
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
  courseProgress?: {
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
  };
}

/**
 * CurriculumSidebar Component
 * 
 * Hiển thị danh sách sections và lessons
 * Features:
 * - Expandable/collapsible sections
 * - Progress indicators
 * - Current lesson highlight
 * - Lock icons for restricted content
 */
export function CurriculumSidebar({
  sections,
  currentLessonId,
  onLessonClick,
  courseProgress,
}: CurriculumSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.is_completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    switch (lesson.content_type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'quiz':
      case 'assignment':
        return <FileText className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSectionProgress = (section: Section) => {
    const completedLessons = section.lessons.filter(l => l.is_completed).length;
    const totalLessons = section.lessons.length;
    return { completed: completedLessons, total: totalLessons };
  };

  return (
    <div className="bg-white h-full flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Nội dung khóa học</h2>
        {courseProgress && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tiến độ</span>
              <span>{courseProgress.completed_lessons}/{courseProgress.total_lessons} bài</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${courseProgress.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const progress = getSectionProgress(section);

          return (
            <div key={section.id} className="border-b border-gray-200">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {progress.completed}/{progress.total} bài học
                    </p>
                  </div>
                </div>
              </button>

              {/* Lessons list */}
              {isExpanded && (
                <div className="bg-gray-50">
                  {section.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isLocked = !lesson.is_preview && false; // TODO: Add lock logic

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !isLocked && onLessonClick(lesson.id)}
                        disabled={isLocked}
                        className={cn(
                          'w-full px-4 py-3 pl-10 flex items-start gap-3 hover:bg-gray-100 transition-colors text-left',
                          isActive && 'bg-blue-50 border-l-4 border-blue-600',
                          isLocked && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            getLessonIcon(lesson)
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              'text-sm font-medium line-clamp-2',
                              isActive ? 'text-blue-600' : 'text-gray-900',
                              lesson.is_completed && 'text-gray-700'
                            )}
                          >
                            {lesson.title}
                          </h4>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.duration_minutes && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration_minutes} phút</span>
                              </div>
                            )}
                            
                            {lesson.is_preview && (
                              <span className="text-xs text-green-600 font-medium">
                                Xem trước
                              </span>
                            )}
                          </div>

                          {/* Progress bar for video lessons */}
                          {lesson.content_type === 'video' && 
                           lesson.progress_percentage !== undefined && 
                           lesson.progress_percentage > 0 && 
                           lesson.progress_percentage < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${lesson.progress_percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CurriculumSidebar;
