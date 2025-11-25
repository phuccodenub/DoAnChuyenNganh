import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, GripVertical, Video, FileText, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// import { Modal } from '@/components/ui/ModalNew';
import { ROUTES } from '@/constants/routes';

/**
 * CurriculumBuilderPage
 * 
 * Quản lý nội dung khóa học:
 * - Section CRUD (add/edit/delete/reorder)
 * - Lesson CRUD (add/edit/delete/reorder)
 * - Vietnamese UI
 */

type ContentType = 'video' | 'document' | 'quiz' | 'assignment';

interface Lesson {
  id: string;
  title: string;
  content_type: ContentType;
  duration_minutes: number;
  is_preview: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

export function CurriculumBuilderPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Chương 1: Giới thiệu',
      isExpanded: true,
      lessons: [
        { id: '1', title: 'Bài 1: Tổng quan', content_type: 'video', duration_minutes: 15, is_preview: true },
        { id: '2', title: 'Bài 2: Cài đặt môi trường', content_type: 'video', duration_minutes: 20, is_preview: false },
      ],
    },
  ]);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; sectionId: string } | null>(null);

  const [sectionForm, setSectionForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content_type: 'video' as ContentType,
    duration_minutes: 0,
    is_preview: false,
  });

  const contentTypeLabels: Record<ContentType, string> = {
    video: 'Video',
    document: 'Tài liệu',
    quiz: 'Bài kiểm tra',
    assignment: 'Bài tập',
  };

  const contentTypeIcons: Record<ContentType, typeof Video> = {
    video: Video,
    document: FileText,
    quiz: FileText,
    assignment: FileText,
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const handleAddSection = () => {
    setSectionForm({ title: '' });
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section: Section) => {
    setSectionForm({ title: section.title });
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (editingSection) {
      setSections(sections.map(s => s.id === editingSection.id ? { ...s, title: sectionForm.title } : s));
    } else {
      const newSection: Section = {
        id: Date.now().toString(),
        title: sectionForm.title,
        lessons: [],
        isExpanded: true,
      };
      setSections([...sections, newSection]);
    }
    setShowSectionModal(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Xóa chương này? Tất cả bài học trong chương sẽ bị xóa.')) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
  };

  const handleAddLesson = (sectionId: string) => {
    setLessonForm({ title: '', content_type: 'video', duration_minutes: 0, is_preview: false });
    setEditingLesson({ lesson: null as unknown as Lesson, sectionId });
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson: Lesson, sectionId: string) => {
    setLessonForm({ ...lesson });
    setEditingLesson({ lesson, sectionId });
    setShowLessonModal(true);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;

    setSections(sections.map(s => {
      if (s.id === editingLesson.sectionId) {
        if (editingLesson.lesson) {
          return {
            ...s,
            lessons: s.lessons.map(l => l.id === editingLesson.lesson.id ? { ...l, ...lessonForm } : l),
          };
        } else {
          const newLesson: Lesson = { id: Date.now().toString(), ...lessonForm };
          return { ...s, lessons: [...s.lessons, newLesson] };
        }
      }
      return s;
    }));
    setShowLessonModal(false);
  };

  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    if (confirm('Xóa bài học này?')) {
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
      ));
    }
  };

  const handleSave = () => {
    // TODO: Implement API call
    console.log('Save curriculum:', sections);
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung</h1>
          <p className="text-gray-600 mt-1">Tổ chức chương và bài học của khóa học</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </Button>
      </div>

      {/* Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nội dung khóa học</CardTitle>
          <Button onClick={handleAddSection} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm chương
          </Button>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có chương nào. Nhấn "Thêm chương" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, sectionIdx) => (
                <div key={section.id} className="border border-gray-200 rounded-lg">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <button
                      onClick={() => toggleSection(section.id)}
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
                      <span className="text-sm text-gray-500 ml-2">
                        ({section.lessons.length} bài)
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSection(section)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons */}
                  {section.isExpanded && (
                    <div className="p-4 space-y-2">
                      {section.lessons.map((lesson, lessonIdx) => {
                        const Icon = contentTypeIcons[lesson.content_type];
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                            <Icon className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Bài {lessonIdx + 1}: {lesson.title}
                                </span>
                                {lesson.is_preview && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                    Xem trước
                                  </span>
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
                                onClick={() => handleEditLesson(lesson, section.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => handleAddLesson(section.id)}
                        className="w-full p-3 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        + Thêm bài học
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingSection ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề chương"
            value={sectionForm.title}
            onChange={(e) => setSectionForm({ title: e.target.value })}
            placeholder="VD: Giới thiệu về React"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSectionModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveSection}>
              {editingSection ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingLesson?.lesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề bài học"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="VD: Cài đặt React"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại nội dung
            </label>
            <select
              value={lessonForm.content_type}
              onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value as ContentType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                <option key={type} value={type}>
                  {contentTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="Thời lượng (phút)"
            value={lessonForm.duration_minutes}
            onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
            min={0}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lessonForm.is_preview}
              onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Cho phép xem trước miễn phí</span>
          </label>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowLessonModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveLesson}>
              {editingLesson?.lesson ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurriculumBuilderPage;
