import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Video,
    FileText,
    Link2,
    Type,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Section, Lesson, ContentType, contentTypeLabels } from './types';

// Content type icons mapping
const contentTypeIcons: Record<ContentType, typeof Video> = {
    video: Video,
    document: FileText,
    quiz: FileText,
    assignment: FileText,
    text: Type,
    link: Link2,
};

interface CurriculumTabProps {
    sections: Section[];
    onToggleSection: (sectionId: string) => void;
    onAddSection: () => void;
    onEditSection: (section: Section) => void;
    onDeleteSection: (sectionId: string) => void;
    onAddLesson: (sectionId: string) => void;
    onEditLesson: (lesson: Lesson, sectionId: string) => void;
    onDeleteLesson: (sectionId: string, lessonId: string) => void;
}

/**
 * CurriculumTab Component
 * 
 * Quản lý nội dung khóa học:
 * - CRUD Sections (Chương)
 * - CRUD Lessons (Bài học)
 * - Drag-drop reorder (UI ready, cần implement logic)
 * 
 * TODO: API calls
 * - POST /api/instructor/courses/:courseId/sections (tạo chương)
 * - PUT /api/instructor/courses/:courseId/sections/:sectionId (sửa chương)
 * - DELETE /api/instructor/courses/:courseId/sections/:sectionId (xóa chương)
 * - POST /api/instructor/sections/:sectionId/lessons (tạo bài học)
 * - PUT /api/instructor/lessons/:lessonId (sửa bài học)
 * - DELETE /api/instructor/lessons/:lessonId (xóa bài học)
 */
export function CurriculumTab({
    sections,
    onToggleSection,
    onAddSection,
    onEditSection,
    onDeleteSection,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
}: CurriculumTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Nội dung khóa học</h2>
                    <p className="text-sm text-gray-500">Quản lý chương và bài học</p>
                </div>
                <Button onClick={onAddSection} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm chương
                </Button>
            </div>

            {sections.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có nội dung. Nhấn "Thêm chương" để bắt đầu.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sections.map((section, sectionIdx) => (
                        <Card key={section.id} className="overflow-hidden">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                <button
                                    onClick={() => onToggleSection(section.id)}
                                    className="flex items-center gap-2 flex-1 text-left"
                                >
                                    {section.isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                    <span className="font-semibold text-gray-900">
                                        Chương {sectionIdx + 1}: {section.title}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({section.lessons.length} bài học)
                                    </span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditSection(section)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Sửa chương"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteSection(section.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Xóa chương"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Lessons */}
                            {section.isExpanded && (
                                <CardContent className="p-4 space-y-2">
                                    {section.lessons.map((lesson, lessonIdx) => {
                                        const Icon = contentTypeIcons[lesson.content_type];
                                        return (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                            >
                                                <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                                                <Icon className="w-5 h-5 text-gray-500" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900 truncate">
                                                            Bài {lessonIdx + 1}: {lesson.title}
                                                        </span>
                                                        {lesson.is_preview && (
                                                            <Badge variant="info" className="text-xs">
                                                                Xem trước
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span>{contentTypeLabels[lesson.content_type]}</span>
                                                        <span>•</span>
                                                        <span>{lesson.duration_minutes} phút</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => onEditLesson(lesson, section.id)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Sửa bài học"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteLesson(section.id, lesson.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Xóa bài học"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button
                                        onClick={() => onAddLesson(section.id)}
                                        className="w-full p-3 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        + Thêm bài học
                                    </button>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CurriculumTab;
