import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, FileText, Monitor, BookOpen, HelpCircle, ClipboardList, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Section, Lesson } from '@/services/api/lesson.api';

interface CurriculumTreeProps {
  sections: Section[];
  activeLessonId?: string | null;
  onLessonClick?: (lessonId: string) => void;
  isPreviewMode?: boolean;
}

/**
 * Lấy icon tương ứng với loại bài học
 */
const getLessonIcon = (contentType: string) => {
  switch (contentType) {
    case 'video':
      return <Monitor className="w-4 h-4 text-gray-500" />;
    case 'document':
    case 'text':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'quiz':
      return <ClipboardList className="w-4 h-4 text-gray-500" />; // Đổi từ HelpCircle sang ClipboardList để nhất quán
    case 'assignment':
      return <ClipboardList className="w-4 h-4 text-gray-500" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-500" />;
  }
};

/**
 * CurriculumTree - Hiển thị danh sách sections và lessons dạng Accordion
 * 
 * Features:
 * - Expand/collapse sections (Accordion style)
 * - Section header with lesson count
 * - Lesson items with type icons
 * - Clean, modern UI with borders and rounded corners
 */
export function CurriculumTree({
  sections,
  activeLessonId,
  onLessonClick,
  isPreviewMode = true
}: CurriculumTreeProps) {
  // Tìm section chứa activeLessonId để mở rộng mặc định
  const findSectionContainingLesson = (lessonId: string | null | undefined): string | null => {
    if (!lessonId) return null;
    for (const section of sections) {
      if (section.lessons?.some(lesson => lesson.id === lessonId)) {
        return section.id;
      }
    }
    return null;
  };

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Ưu tiên mở section chứa activeLessonId, nếu không có thì mở section đầu tiên
    const activeSectionId = findSectionContainingLesson(activeLessonId);
    if (activeSectionId) {
      return new Set([activeSectionId]);
    }
    return new Set(sections.length > 0 ? [sections[0].id] : []);
  });

  // Tự động mở rộng section chứa activeLessonId khi activeLessonId thay đổi
  useEffect(() => {
    if (activeLessonId) {
      const activeSectionId = findSectionContainingLesson(activeLessonId);
      if (activeSectionId) {
        setExpandedSections(prev => {
          const next = new Set(prev);
          next.add(activeSectionId); // Thêm section chứa active lesson vào expanded
          return next;
        });
      }
    }
  }, [activeLessonId, sections]);

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

  if (sections.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Mục lục khóa học đang được cập nhật.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        // Sort lessons theo order_index để đảm bảo thứ tự đúng
        const sectionLessons = (section.lessons || []).sort((a, b) => 
          (a.order_index || 0) - (b.order_index || 0)
        );
        const lessonCount = sectionLessons.length;

        return (
          <div key={section.id}>
            {/* Section Header - Accordion Trigger */}
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                "w-full px-5 py-4 flex items-center justify-between",
                "hover:bg-gray-50 transition-colors text-left",
                isExpanded && "bg-gray-50"
              )}
            >
              {/* Left: Section Title */}
              <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-4">
                {section.title}
              </h3>

              {/* Right: Metadata + Chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {lessonCount} bài học
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Lesson Items - Accordion Content */}
            {isExpanded && sectionLessons.length > 0 && (
              <div className="bg-gray-50/50 border-t border-gray-100">
                {sectionLessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonClick?.(lesson.id)}
                      disabled={!onLessonClick}
                      className={cn(
                        "w-full px-5 py-3 flex items-center gap-3 text-left transition-colors",
                        "hover:bg-gray-100 border-b border-gray-100 last:border-b-0",
                        isActive && "bg-blue-50 border-l-2 border-l-blue-600",
                        !onLessonClick && "cursor-default"
                      )}
                    >
                      {/* Icon loại bài học */}
                      <div className="flex-shrink-0">
                        {getLessonIcon(lesson.content_type)}
                      </div>

                      {/* Tên bài học */}
                      <span className={cn(
                        "text-sm flex-1",
                        isActive ? "text-blue-600 font-medium" : "text-gray-700"
                      )}>
                        {lesson.title}
                      </span>

                      {/* Practice/Graded badge for quiz/assignment */}
                      {(lesson.content_type === 'quiz' || lesson.content_type === 'assignment') && 
                       lesson.is_practice !== undefined && (
                        <Badge 
                          variant={lesson.is_practice ? "warning" : "success"} 
                          size="sm"
                          className="mr-1"
                        >
                          {lesson.is_practice ? 'Luyện tập' : 'Tính điểm'}
                        </Badge>
                      )}

                      {/* Preview badge (optional) - use is_free_preview from backend */}
                      {lesson.is_free_preview && isPreviewMode && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          Xem trước
                        </span>
                      )}

                      {/* Completion checkmark - hiển thị tích xanh nếu đã hoàn thành */}
                      {lesson.is_completed && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
