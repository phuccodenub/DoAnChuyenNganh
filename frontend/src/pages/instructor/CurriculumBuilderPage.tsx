import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, ChevronDown, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MainLayout } from '@/layouts/MainLayout';
import toast from 'react-hot-toast';

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
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Import hooks và types
import {
  useCourseSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  type CourseSection,
  type CourseLesson,
} from '@/hooks/useInstructorCourse';

/**
 * CurriculumBuilderPage
 *
 * Quản lý nội dung khóa học theo cấu trúc phân cấp 2 cấp:
 * Section (Chương) > Lesson (Bài học - mỗi lesson là một content item)
 *
 * Sử dụng PageWrapper và PageHeader để có layout nhất quán.
 * Tích hợp hoàn toàn với API backend.
 */

type ContentType = 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';

interface SectionWithExpanded extends CourseSection {
  isExpanded: boolean;
}

export function CurriculumBuilderPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { routes, navigateTo, canPerform } = useRoleBasedNavigation();

  if (!courseId) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Course ID không hợp lệ</p>
          </div>
        </PageWrapper>
      </MainLayout>
    );
  }

  // ================== DATA FETCHING ==================
  const { data: sectionsResponse, isLoading, error, refetch } = useCourseSections(courseId);
  
  // Transform API data to include isExpanded state
  const [sections, setSections] = useState<SectionWithExpanded[]>([]);

  useEffect(() => {
    if (sectionsResponse?.data) {
      const responseData = sectionsResponse.data as any;
      const sectionsData = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || []);
      
      setSections(
        sectionsData.map((section: CourseSection) => ({
          ...section,
          isExpanded: true, // Default expanded
        }))
      );
    }
  }, [sectionsResponse]);

  // ================== MUTATIONS ==================
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection(courseId);
  const deleteSectionMutation = useDeleteSection(courseId);
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  // ================== LESSON MODAL STATE ==================
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    sectionId: string;
    lesson: CourseLesson;
  } | null>(null);

  // Form state for LessonModal
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content_type: 'video' as LessonContentType,
    duration_minutes: 0,
    is_preview: false,
    video_url: '',
  });

  // Step wizard data - sử dụng role-based routes
  const steps = [
    {
      id: 'landing',
      title: 'Course Landing',
      description: 'Basic info & description',
      route: routes.courseEdit(courseId || 'new'),
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
   * Thêm một section mới
   */
  const handleAddSection = async () => {
    try {
      const newSection = await createSectionMutation.mutateAsync({
        course_id: courseId,
        title: 'New Section',
        order_index: sections.length,
      });
      
      // Add to local state with expanded
      setSections([
        ...sections,
        {
          ...newSection.data,
          isExpanded: true,
        },
      ]);
      
      toast.success('Đã tạo section mới');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể tạo section';
      toast.error(message);
    }
  };

  /**
   * Cập nhật tiêu đề của section
   */
  const handleUpdateSectionTitle = async (sectionId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }

    try {
      await updateSectionMutation.mutateAsync({
        sectionId,
        data: { title: newTitle },
      });
      
      // Update local state
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, title: newTitle } : s
      ));
      
      toast.success('Đã cập nhật section');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật section';
      toast.error(message);
    }
  };

  /**
   * Xóa section
   */
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Xóa section này và tất cả nội dung bên trong?')) {
      return;
    }

    try {
      await deleteSectionMutation.mutateAsync(sectionId);
      
      // Remove from local state
      setSections(sections.filter(s => s.id !== sectionId));
      
      toast.success('Đã xóa section');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể xóa section';
      toast.error(message);
    }
  };

  /**
   * Toggle trạng thái expanded/collapsed của section
   */
  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  // ================== LESSON MANAGEMENT ==================

  /**
   * Thêm lesson mới vào section
   */
  const handleAddLesson = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const newLesson = await createLessonMutation.mutateAsync({
        section_id: sectionId,
        title: 'New Lesson',
        content_type: 'video',
        order_index: section.lessons.length,
      });
      
      // Update local state
      setSections(sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, newLesson.data] }
          : s
      ));
      
      toast.success('Đã tạo lesson mới');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể tạo lesson';
      toast.error(message);
    }
  };

  /**
   * Cập nhật tiêu đề của lesson
   */
  const handleUpdateLessonTitle = async (sectionId: string, lessonId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }

    try {
      await updateLessonMutation.mutateAsync({
        lessonId,
        data: { title: newTitle },
      });
      
      // Update local state
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
      
      toast.success('Đã cập nhật lesson');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật lesson';
      toast.error(message);
    }
  };

  /**
   * Xóa lesson
   */
  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Xóa lesson này?')) {
      return;
    }

    try {
      await deleteLessonMutation.mutateAsync(lessonId);
      
      // Remove from local state
      setSections(sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
          : s
      ));
      
      toast.success('Đã xóa lesson');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể xóa lesson';
      toast.error(message);
    }
  };

  // ================== CONTENT ITEM MANAGEMENT ==================

  /**
   * Thêm content item mới (tạo lesson mới với content_type)
   */
  const handleAddContentItem = async (sectionId: string, type: ContentType) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const newLesson = await createLessonMutation.mutateAsync({
        section_id: sectionId,
        title: `New ${type}`,
        content_type: type,
        order_index: section.lessons.length,
      });
      
      // Update local state
      setSections(sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, newLesson.data] }
          : s
      ));
      
      toast.success(`Đã tạo ${type} mới`);
    } catch (error: any) {
      const message = error?.response?.data?.message || `Không thể tạo ${type}`;
      toast.error(message);
    }
  };

  /**
   * Xử lý khi click Edit trên lesson/content item
   */
  const handleEditContentItem = (sectionId: string, lessonId: string, contentItem: ContentItemData) => {
    if (contentItem.type === 'quiz' && courseId) {
      // Điều hướng đến QuizBuilderPage với quizId (nếu có) hoặc tạo mới
      // TODO: Khi tích hợp API, cần lấy quizId thực từ contentItem
      // Sử dụng role-based navigation
      if (canPerform.createQuiz) {
        navigateTo.quizCreate(courseId);
      } else {
        // Admin không có quyền tạo quiz, redirect về course detail
        navigateTo.courseDetail(courseId);
      }
      return;
    }

    // Tìm lesson từ contentItem để edit
    const section = sections.find(s => s.id === sectionId);
    const lesson = section?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.content_type === 'video' || lesson.content_type === 'document') {
      // Mở LessonModal để chỉnh sửa
      setEditingLesson({ sectionId, lesson });
      setLessonForm({
        title: lesson.title,
        content_type: lesson.content_type as LessonContentType,
        duration_minutes: lesson.duration_minutes || 0,
        is_preview: lesson.is_free_preview || false,
        video_url: lesson.video_url || '',
      });
      setIsLessonModalOpen(true);
      return;
    }

    // TODO: Mở modal chỉnh sửa cho assignment
    console.log('Edit lesson:', lesson);
  };

  /**
   * Đóng LessonModal và reset state
   */
  const handleCloseLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
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
  const handleSaveLessonModal = async () => {
    if (!editingLesson) return;

    const { sectionId, lesson } = editingLesson;

    try {
      await updateLessonMutation.mutateAsync({
        lessonId: lesson.id,
        data: {
          title: lessonForm.title,
          content_type: lessonForm.content_type,
          duration_minutes: lessonForm.duration_minutes,
          is_free_preview: lessonForm.is_preview,
          video_url: lessonForm.video_url || undefined,
        },
      });
      
      // Update local state
      setSections(sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map(l =>
                l.id === lesson.id
                  ? {
                      ...l,
                      title: lessonForm.title,
                      content_type: lessonForm.content_type,
                      duration_minutes: lessonForm.duration_minutes,
                      is_free_preview: lessonForm.is_preview,
                      video_url: lessonForm.video_url || undefined,
                    }
                  : l
              )
            }
          : s
      ));
      
      toast.success('Đã cập nhật lesson');
      handleCloseLessonModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật lesson';
      toast.error(message);
    }
  };

  /**
   * Xóa content item (lesson)
   */
  const handleDeleteContentItem = async (sectionId: string, lessonId: string) => {
    await handleDeleteLesson(sectionId, lessonId);
  };

  // ================== SAVE & NAVIGATION ==================

  /**
   * Lưu toàn bộ curriculum (refetch để đảm bảo data sync)
   */
  const handleSave = () => {
    console.log('Saving curriculum:', sections);
    // TODO: Implement API call to save curriculum
    // Sử dụng role-based navigation
    navigateTo.myCourses();
  };

  // ================== LOADING & ERROR STATES ==================

  if (isLoading) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải curriculum...</span>
          </div>
        </PageWrapper>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải curriculum</h3>
            <p className="text-gray-600 mb-4">Đã có lỗi xảy ra khi tải nội dung khóa học.</p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </div>
        </PageWrapper>
      </MainLayout>
    );
  }

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
                Organize your course content into sections and lessons
              </p>
            </div>
            <Button onClick={handleSave} className="gap-2" disabled={deleteSectionMutation.isPending || createSectionMutation.isPending}>
              <Save className="w-4 h-4" />
              Save Curriculum
            </Button>
          </div>

          {/* Curriculum Content */}
          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">Chưa có section nào. Thêm section đầu tiên để bắt đầu.</p>
                <Button onClick={handleAddSection} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
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
                          Chưa có lesson nào trong section này.
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
                                  onEdit={() => handleEditContentItem(section.id, lesson)}
                                  onDelete={() => handleDeleteLesson(section.id, lesson.id)}
                                />
                              </div>

                              {/* Content Item Display */}
                              <div className="ml-8">
                                {(lesson.content_type === 'video' || 
                                  lesson.content_type === 'document' || 
                                  lesson.content_type === 'quiz' || 
                                  lesson.content_type === 'assignment') && (
                                  <ContentItem
                                    type={lesson.content_type as 'video' | 'document' | 'quiz' | 'assignment'}
                                    title={lesson.title}
                                    duration={lesson.duration_minutes}
                                    isPreview={lesson.is_free_preview}
                                    onEdit={() => handleEditContentItem(section.id, lesson)}
                                    onDelete={() => handleDeleteContentItem(section.id, lesson.id)}
                                  />
                                )}
                                {(lesson.content_type === 'text' || lesson.content_type === 'link') && (
                                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                                    <span className="ml-2 text-xs text-gray-500">({lesson.content_type})</span>
                                  </div>
                                )}
                              </div>
                            </TimelineConnector>
                          ))}
                        </div>
                      )}

                      {/* Add Content Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="mb-4">
                          <ContentTypeSelector
                            onSelect={(type) => handleAddContentItem(section.id, type)}
                          />
                        </div>
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
          {sections.length > 0 && (
            <div className="text-center">
              <Button onClick={handleAddSection} variant="outline" className="gap-2" disabled={createSectionMutation.isPending}>
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </div>
          )}
        </div>

        {/* Lesson Modal for editing video/document content */}
        <LessonModal
          isOpen={isLessonModalOpen}
          editingLesson={editingLesson ? {
            id: editingLesson.lesson.id,
            title: editingLesson.lesson.title,
            content_type: editingLesson.lesson.content_type as LessonContentType,
            duration_minutes: editingLesson.lesson.duration_minutes || 0,
            is_preview: editingLesson.lesson.is_free_preview || false,
            order_index: editingLesson.lesson.order_index,
            video_url: editingLesson.lesson.video_url || '',
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
