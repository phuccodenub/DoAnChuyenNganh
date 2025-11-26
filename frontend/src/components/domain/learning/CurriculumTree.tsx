import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, FileText } from 'lucide-react';

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  content_type: string;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons: Lesson[];
}

interface CurriculumTreeProps {
  sections: Section[];
  activeLessonId: string | null;
  onLessonClick: (lessonId: string) => void;
}

/**
 * CurriculumTree - Hiển thị danh sách sections và lessons dạng cây
 * 
 * Features:
 * - Expand/collapse sections
 * - Highlight active lesson
 * - Show completion status
 * - Display lesson duration and type
 */
export function CurriculumTree({ sections, activeLessonId, onLessonClick }: CurriculumTreeProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(() => 
    sections.map(s => s.id) // Expand all by default
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="py-2">
      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.includes(section.id);
        const completedCount = section.lessons.filter(l => l.is_completed).length;
        const totalCount = section.lessons.length;
        
        return (
          <div key={section.id} className="mb-1">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2 flex-1">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Phần {sectionIndex + 1}: {section.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {completedCount}/{totalCount} bài học
                  </p>
                </div>
              </div>
            </button>

            {/* Lessons List */}
            {isExpanded && (
              <div className="bg-white">
                {section.lessons.map((lesson, lessonIndex) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = lesson.is_completed;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonClick(lesson.id)}
                      className={`w-full px-4 py-3 pl-12 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                        isActive ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                      }`}
                    >
                      {/* Completion Icon */}
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                        {lesson.duration_minutes && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lesson.duration_minutes} phút
                          </p>
                        )}
                      </div>

                      {/* Content Type Icon */}
                      {lesson.content_type === 'video' && (
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
