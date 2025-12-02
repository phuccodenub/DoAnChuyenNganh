import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/layouts/MainLayout';

// Import components từ courseEditor
import {
  PageWrapper,
  PageHeader,
  TimelineConnector,
  DragHandle,
  InlineEditInput,
  ActionGroup,
  ContentTypeSelector,
  ContentItem,
  StepWizard,
} from '@/components/courseEditor';

import { LessonModal } from './components/courseDetail/LessonModal';
import { ContentType as LessonContentType } from './components/courseDetail/types';
import { ROUTES, generateRoute } from '@/constants/routes';

/**
 * CurriculumBuilderPage
 *
 * Quản lý nội dung khóa học theo cấu trúc phân cấp 3 cấp:
 * Section (Chương) > Lesson (Bài học) > Content Items (Video/Document/Quiz/Assignment)
 *
 * Sử dụng PageWrapper và PageHeader để có layout nhất quán.
 * Bao gồm tính năng drag & drop để sắp xếp lại thứ tự.
 */

type ContentType = 'video' | 'document' | 'quiz' | 'assignment';

interface ContentItemData {
  id: string;
  type: ContentType;
  title: string;
  duration_minutes?: number;
  is_preview?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  contentItems: ContentItemData[];
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

  // ================== STATE MANAGEMENT ==================
  /**
   * Quản lý danh sách sections (chương) của khóa học
   * Mỗi section chứa nhiều lessons, mỗi lesson chứa nhiều content items
   */
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Introduction to React',
      isExpanded: true,
      lessons: [
        {
          id: '1',
          title: 'Welcome to the Course',
          contentItems: [
            {
              id: '1',
              type: 'video',
              title: 'Course Overview',
              duration_minutes: 15,
              is_preview: true,
            },
            {
              id: '2',
              type: 'document',
              title: 'Course Syllabus',
              duration_minutes: 10,
            },
          ],
        },
        {
          id: '2',
          title: 'Setting Up Development Environment',
          contentItems: [
            {
              id: '3',
              type: 'video',
              title: 'Installing Node.js',
              duration_minutes: 20,
            },
            {
              id: '4',
              type: 'quiz',
              title: 'Environment Setup Quiz',
              duration_minutes: 15,
            },
          ],
        },
      ],
    },
  ]);

  // ================== LESSON MODAL STATE ==================
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<{
    sectionId: string;
    lessonId: string;
    contentItem: ContentItemData;
  } | null>(null);

  // Form state for LessonModal
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content_type: 'video' as LessonContentType,
    duration_minutes: 0,
    is_preview: false,
    video_url: '',
  });

  // Step wizard data
  const steps = [
    {
      id: 'landing',
      title: 'Course Landing',
      description: 'Basic info & description',
      route: courseId ? generateRoute.courseManagement(courseId) : ROUTES.COURSE_CREATE,
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: 'Lessons & content',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Pricing & publish',
    },
  ];

  // ================== SECTION MANAGEMENT ==================

  /**
   * Thêm một section mới vào cuối danh sách
   * TODO: API call - POST /api/instructor/courses/:courseId/sections
   */
  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'New Section',
      lessons: [],
      isExpanded: true,
    };
    setSections([...sections, newSection]);
  };

  /**
   * Cập nhật tiêu đề của section
   * @param sectionId - ID của section cần cập nhật
   * @param newTitle - Tiêu đề mới
   * TODO: API call - PUT /api/instructor/sections/:sectionId
   */
  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, title: newTitle } : s
    ));
  };

  /**
   * Xóa section và tất cả lessons/content bên trong
   * @param sectionId - ID của section cần xóa
   * TODO: API call - DELETE /api/instructor/sections/:sectionId
   */
  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Delete this section and all its content?')) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
  };

  /**
   * Toggle trạng thái expanded/collapsed của section
   * @param sectionId - ID của section
   */
  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  // ================== LESSON MANAGEMENT ==================

  /**
   * Thêm lesson mới vào section
   * @param sectionId - ID của section chứa lesson
   * TODO: API call - POST /api/instructor/sections/:sectionId/lessons
   */
  const handleAddLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'New Lesson',
      contentItems: [],
    };

    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, lessons: [...s.lessons, newLesson] }
        : s
    ));
  };

  /**
   * Cập nhật tiêu đề của lesson
   * @param sectionId - ID của section chứa lesson
   * @param lessonId - ID của lesson
   * @param newTitle - Tiêu đề mới
   * TODO: API call - PUT /api/instructor/lessons/:lessonId
   */
  const handleUpdateLessonTitle = (sectionId: string, lessonId: string, newTitle: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
          ...s,
          lessons: s.lessons.map(l =>
            l.id === lessonId ? { ...l, title: newTitle } : l
          )
        }
        : s
    ));
  };

  /**
   * Xóa lesson và tất cả content items bên trong
   * @param sectionId - ID của section
   * @param lessonId - ID của lesson cần xóa
   * TODO: API call - DELETE /api/instructor/lessons/:lessonId
   */
  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    if (confirm('Delete this lesson and all its content?')) {
      setSections(sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
          : s
      ));
    }
  };

  // ================== CONTENT ITEM MANAGEMENT ==================

  /**
   * Thêm content item mới vào lesson
   * @param sectionId - ID của section
   * @param lessonId - ID của lesson
   * @param type - Loại content (video/document/quiz/assignment)
   * TODO: API call - POST /api/instructor/lessons/:lessonId/content
   */
  const handleAddContentItem = (sectionId: string, lessonId: string, type: ContentType) => {
    const newContentItem: ContentItemData = {
      id: Date.now().toString(),
      type,
      title: `New ${type}`,
      duration_minutes: type === 'video' || type === 'document' ? 15 : undefined,
      is_preview: false,
    };

    setSections(sections.map(s =>
      s.id === sectionId
        ? {
          ...s,
          lessons: s.lessons.map(l =>
            l.id === lessonId
              ? { ...l, contentItems: [...l.contentItems, newContentItem] }
              : l
          )
        }
        : s
    ));
  };

  /**
   * Xử lý khi click Edit trên content item
   * - Nếu là quiz: điều hướng đến QuizBuilderPage
   * - Nếu là video/document: mở LessonModal để chỉnh sửa
   * - Assignment: TODO
   * @param sectionId - ID của section chứa content item
   * @param lessonId - ID của lesson chứa content item
   * @param contentItem - Content item cần chỉnh sửa
   */
  const handleEditContentItem = (sectionId: string, lessonId: string, contentItem: ContentItemData) => {
    if (contentItem.type === 'quiz' && courseId) {
      // Điều hướng đến QuizBuilderPage với quizId (nếu có) hoặc tạo mới
      // TODO: Khi tích hợp API, cần lấy quizId thực từ contentItem
      navigate(generateRoute.instructor.quizCreate(courseId));
      return;
    }

    if (contentItem.type === 'video' || contentItem.type === 'document') {
      // Mở LessonModal để chỉnh sửa video/document
      setEditingContentItem({ sectionId, lessonId, contentItem });
      setLessonForm({
        title: contentItem.title,
        content_type: contentItem.type as LessonContentType,
        duration_minutes: contentItem.duration_minutes || 0,
        is_preview: contentItem.is_preview || false,
        video_url: '', // TODO: Lấy từ contentItem khi có API
      });
      setIsLessonModalOpen(true);
      return;
    }

    // TODO: Mở modal chỉnh sửa cho assignment
    console.log('Edit content:', contentItem);
  };

  /**
   * Đóng LessonModal và reset state
   */
  const handleCloseLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingContentItem(null);
    setLessonForm({
      title: '',
      content_type: 'video',
      duration_minutes: 0,
      is_preview: false,
      video_url: '',
    });
  };

  /**
   * Lưu thay đổi từ LessonModal
   */
  const handleSaveLessonModal = () => {
    if (!editingContentItem) return;

    const { sectionId, lessonId, contentItem } = editingContentItem;

    // Cập nhật content item với dữ liệu từ form
    handleUpdateContentItem(sectionId, lessonId, contentItem.id, {
      title: lessonForm.title,
      type: lessonForm.content_type as ContentType,
      duration_minutes: lessonForm.duration_minutes,
      is_preview: lessonForm.is_preview,
    });

    handleCloseLessonModal();
  };

  /**
   * Cập nhật content item
   * @param sectionId - ID của section
   * @param lessonId - ID của lesson
   * @param contentId - ID của content item
   * @param updates - Các trường cần cập nhật
   * TODO: API call - PUT /api/instructor/content/:contentId
   */
  const handleUpdateContentItem = (
    sectionId: string,
    lessonId: string,
    contentId: string,
    updates: Partial<ContentItemData>
  ) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
          ...s,
          lessons: s.lessons.map(l =>
            l.id === lessonId
              ? {
                ...l,
                contentItems: l.contentItems.map(c =>
                  c.id === contentId ? { ...c, ...updates } : c
                )
              }
              : l
          )
        }
        : s
    ));
  };

  /**
   * Xóa content item
   * @param sectionId - ID của section
   * @param lessonId - ID của lesson
   * @param contentId - ID của content item cần xóa
   * TODO: API call - DELETE /api/instructor/content/:contentId
   */
  const handleDeleteContentItem = (sectionId: string, lessonId: string, contentId: string) => {
    if (confirm('Delete this content item?')) {
      setSections(sections.map(s =>
        s.id === sectionId
          ? {
            ...s,
            lessons: s.lessons.map(l =>
              l.id === lessonId
                ? {
                  ...l,
                  contentItems: l.contentItems.filter(c => c.id !== contentId)
                }
                : l
            )
          }
          : s
      ));
    }
  };

  // ================== SAVE & NAVIGATION ==================

  /**
   * Lưu toàn bộ curriculum
   * TODO: API call - PUT /api/instructor/courses/:courseId/curriculum
   */
  const handleSave = () => {
    console.log('Saving curriculum:', sections);
    // TODO: Implement API call to save curriculum
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  // ================== RENDER ==================

  return (
    <MainLayout showSidebar>
    <PageWrapper>
      {/* Page Header với breadcrumb và nút Save */}
      <PageHeader
        title="Curriculum Builder"
        breadcrumbs={['Courses', 'Curriculum']}
      />

      {/* Step Wizard */}
      <StepWizard currentStep={2} steps={steps} />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header với nút Save */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Build Your Curriculum</h1>
            <p className="text-gray-600 mt-1">
              Organize your course content into sections, lessons, and learning materials
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Curriculum
          </Button>
        </div>

        {/* Curriculum Content */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No sections yet. Add your first section to get started.</p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                  <DragHandle />
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
                      Section {sectionIndex + 1}:
                    </span>
                    <InlineEditInput
                      value={section.title}
                      onSave={(newTitle) => handleUpdateSectionTitle(section.id, newTitle)}
                      placeholder="Type section name..."
                      className="text-lg"
                    />
                  </button>
                  <ActionGroup
                    onEdit={() => {/* Inline edit handled by InlineEditInput */ }}
                    onDelete={() => handleDeleteSection(section.id)}
                  />
                </div>

                {/* Section Content */}
                {section.isExpanded && (
                  <div className="p-4">
                    {section.lessons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No lessons in this section yet.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <TimelineConnector
                            key={lesson.id}
                            isLast={lessonIndex === section.lessons.length - 1}
                          >
                            {/* Lesson Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <DragHandle className="text-gray-500" />
                              <span className="font-medium text-gray-700">
                                Lesson {lessonIndex + 1}:
                              </span>
                              <InlineEditInput
                                value={lesson.title}
                                onSave={(newTitle) => handleUpdateLessonTitle(section.id, lesson.id, newTitle)}
                                placeholder="Type lesson name..."
                              />
                              <ActionGroup
                                onDelete={() => handleDeleteLesson(section.id, lesson.id)}
                              />
                            </div>

                            {/* Content Items */}
                            <div className="space-y-2 ml-8">
                              {lesson.contentItems.map((contentItem) => (
                                <ContentItem
                                  key={contentItem.id}
                                  type={contentItem.type}
                                  title={contentItem.title}
                                  duration={contentItem.duration_minutes}
                                  isPreview={contentItem.is_preview}
                                  onEdit={() => handleEditContentItem(section.id, lesson.id, contentItem)}
                                  onDelete={() => handleDeleteContentItem(section.id, lesson.id, contentItem.id)}
                                />
                              ))}

                              {/* Add Content Buttons */}
                              <div className="mt-4">
                                <ContentTypeSelector
                                  onSelect={(type) => handleAddContentItem(section.id, lesson.id, type)}
                                />
                              </div>
                            </div>
                          </TimelineConnector>
                        ))}
                      </div>
                    )}

                    {/* Add Lesson Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleAddLesson(section.id)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Section Button */}
        <div className="text-center">
          <Button onClick={handleAddSection} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Lesson Modal for editing video/document content */}
      <LessonModal
        isOpen={isLessonModalOpen}
        editingLesson={editingContentItem ? {
          id: editingContentItem.contentItem.id,
          title: editingContentItem.contentItem.title,
          content_type: editingContentItem.contentItem.type as LessonContentType,
          duration_minutes: editingContentItem.contentItem.duration_minutes || 0,
          is_preview: editingContentItem.contentItem.is_preview || false,
          order_index: 0,
          video_url: '',
        } : null}
        lessonForm={lessonForm}
        onFormChange={setLessonForm}
        onSave={handleSaveLessonModal}
        onClose={handleCloseLessonModal}
      />
    </PageWrapper>
    </MainLayout>
  );
}

export default CurriculumBuilderPage;
