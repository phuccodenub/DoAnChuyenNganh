import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronDown, ChevronRight, ClipboardList, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import {
  TimelineConnector,
  DragHandle,
  InlineEditInput,
  ActionGroup,
  ContentTypeSelector,
  ContentItem,
} from '@/components/courseEditor';
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
import { useInstructorCourseDetail } from '@/hooks/useInstructorCourse';
import { generateRoute } from '@/constants/routes';
import { Loader2 } from 'lucide-react';
import { LessonModal } from '@/pages/instructor/components/courseDetail/LessonModal';
import { ContentType as LessonContentType } from '@/pages/instructor/components/courseDetail/types';
import { mediaApi } from '@/services/api/media.api';
import { quizApi } from '@/services/api/quiz.api';
import { CreateQuizModal } from './CreateQuizModal';
import { ManageQuizModal } from './ManageQuizModal';
import { useInstructorQuizzes, useDeleteQuiz } from '@/hooks/useInstructorQuiz';
import { useCourseAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '@/hooks/useAssignments';
import { Input } from '@/components/ui/Input';

interface CurriculumTabProps {
  courseId: string;
}

/**
 * CurriculumTab
 * 
 * Tab quản lý nội dung khóa học (sections và lessons)
 */
export function CurriculumTab({ courseId }: CurriculumTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sectionsResponse, isLoading, refetch } = useCourseSections(courseId);
  const { data: courseData } = useInstructorCourseDetail(courseId); // Lấy course info để dùng cho AI
  const course = courseData?.data;
  const [sections, setSections] = useState<(CourseSection & { isExpanded: boolean })[]>([]);
  
  // Lesson Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ sectionId: string; lesson: CourseLesson } | null>(null);
  
  // Quiz Modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>();
  const [isManageQuizModalOpen, setIsManageQuizModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState<string>('');
  
  // Assignment Modal state (cho section-level)
  const [isSectionAssignmentModalOpen, setIsSectionAssignmentModalOpen] = useState(false);
  const [selectedAssignmentSectionId, setSelectedAssignmentSectionId] = useState<string | undefined>();
  
  // Fetch quizzes for the course
  const { data: quizzesResponse, refetch: refetchQuizzes, isLoading: isLoadingQuizzes } = useInstructorQuizzes({ 
    course_id: courseId,
    page: 1,
    limit: 100, // Lấy tất cả quizzes
  });
  const quizzes = Array.isArray(quizzesResponse?.data) ? quizzesResponse.data : [];
  
  // Debug: Log tất cả quizzes để xem structure
  console.log('[CurriculumTab] All quizzes from API:', quizzes.map((q: any) => ({
    id: q.id,
    title: q.title,
    section_id: q.section_id,
    course_id: q.course_id,
    hasSectionId: !!q.section_id,
    hasCourseId: !!q.course_id,
    section_idValue: q.section_id,
    course_idValue: q.course_id
  })));
  
  // Lưu thứ tự ban đầu của quizzes từ API (trước khi sort)
  const courseLevelQuizzesRaw = quizzes.filter((q: any) => {
    const hasSectionId = q.section_id != null && q.section_id !== '';
    const hasCourseId = q.course_id != null && q.course_id !== '';
    return !hasSectionId && hasCourseId;
  });
  
  const courseLevelQuizzes = courseLevelQuizzesRaw
    .map((q: any, index: number) => ({ ...q, _quizOriginalIndex: index }))
    .sort((a: any, b: any) => {
      // Ưu tiên sắp xếp theo order_index nếu có
      if (a.order_index != null && b.order_index != null) {
        return (a.order_index || 0) - (b.order_index || 0);
      }
      // Nếu không có order_index, sắp xếp theo created_at (cũ nhất trước)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB; // ASC: cũ nhất trước
    });
  
  // Debug logs
  useEffect(() => {
    console.log('[CurriculumTab] Quizzes data:', {
      quizzesResponse,
      quizzesResponseType: typeof quizzesResponse,
      quizzesResponseKeys: quizzesResponse ? Object.keys(quizzesResponse) : null,
      quizzesResponseData: quizzesResponse?.data,
      quizzesResponseDataType: typeof quizzesResponse?.data,
      quizzesResponseDataIsArray: Array.isArray(quizzesResponse?.data),
      quizzes,
      quizzesLength: quizzes.length,
      courseLevelQuizzes,
      courseLevelQuizzesLength: courseLevelQuizzes.length,
      courseId,
    });
    
    // Log từng quiz để xem structure và kiểm tra created_at
    if (quizzes.length > 0) {
      console.log('[CurriculumTab] First quiz:', quizzes[0]);
      console.log('[CurriculumTab] First quiz keys:', Object.keys(quizzes[0]));
      console.log('[CurriculumTab] First quiz created_at:', quizzes[0].created_at);
      console.log('[CurriculumTab] All quizzes:', quizzes);
      
      // Log course-level quizzes để kiểm tra created_at
      if (courseLevelQuizzes.length > 0) {
        console.log('[CurriculumTab] Course-level quizzes with created_at check:');
        courseLevelQuizzes.forEach((q: any, index: number) => {
          console.log(`[CurriculumTab] Quiz ${index + 1}:`, {
            id: q.id,
            title: q.title,
            created_at: q.created_at,
            created_atType: typeof q.created_at,
            hasCreatedAt: 'created_at' in q,
            allKeys: Object.keys(q)
          });
        });
      }
    }
  }, [quizzesResponse, quizzes, courseLevelQuizzes, courseId]);

  // Assignments (course-level)
  const { data: assignmentsResponse, refetch: refetchAssignments } = useCourseAssignments(courseId);
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : [];
  
  // Lưu thứ tự ban đầu của assignments từ API (trước khi sort)
  const courseLevelAssignmentsRaw = assignments.filter((a: any) => !a.section_id && a.course_id);
  
  const courseLevelAssignments = courseLevelAssignmentsRaw
    .map((a: any, index: number) => ({ ...a, _assignmentOriginalIndex: index }))
    .sort((a: any, b: any) => {
      // Ưu tiên sắp xếp theo order_index nếu có
      if (a.order_index != null && b.order_index != null) {
        return (a.order_index || 0) - (b.order_index || 0);
      }
      // Nếu không có order_index, sắp xếp theo created_at (cũ nhất trước)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB; // ASC: cũ nhất trước
    });

  // Kết hợp sections, quizzes và assignments và sắp xếp cùng nhau theo thứ tự tạo
  // Lưu thứ tự ban đầu từ API response (trước khi sort) để dùng khi không có created_at
  const courseLevelContent = [
    ...courseLevelQuizzes.map((q: any) => ({ 
      ...q, 
      type: 'quiz' as const,
      _originalApiIndex: courseLevelQuizzesRaw.findIndex((raw: any) => raw.id === q.id)
    })),
    ...courseLevelAssignments.map((a: any) => ({ 
      ...a, 
      type: 'assignment' as const,
      _originalApiIndex: courseLevelAssignmentsRaw.length + courseLevelAssignmentsRaw.findIndex((raw: any) => raw.id === a.id)
    }))
  ].sort((a: any, b: any) => {
    // Ưu tiên sắp xếp theo order_index nếu có
    if (a.order_index != null && b.order_index != null) {
      return (a.order_index || 0) - (b.order_index || 0);
    }
    // Nếu không có order_index, sắp xếp theo created_at (cũ nhất trước)
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateA - dateB; // ASC: cũ nhất trước
  });

  // Kết hợp tất cả items (sections, course-level quizzes, course-level assignments) và sort theo thứ tự tạo
  // Lưu thứ tự ban đầu để dùng làm fallback khi không có created_at
  // Sections đã được sort theo order_index từ backend, nên giữ nguyên thứ tự
  // Course-level content cũng đã được sort theo created_at hoặc order_index
  const sectionsWithIndex = sections.map((s: any, index: number) => ({ 
    ...s, 
    type: 'section' as const,
    _originalIndex: index // Lưu thứ tự ban đầu
  }));
  
  // Lưu thứ tự ban đầu của course-level content (đã được sort trong courseLevelContent)
  const courseLevelContentWithIndex = courseLevelContent.map((item: any, index: number) => ({
    ...item,
    _originalIndex: sections.length + index // Lưu thứ tự ban đầu (sau tất cả sections)
  }));

  const allCurriculumItems = [
    ...sectionsWithIndex,
    ...courseLevelContentWithIndex
  ].sort((a: any, b: any) => {
    // Sắp xếp theo created_at (cũ nhất trước)
    // Nếu không có created_at:
    // - Với sections: dùng order_index để tạo timestamp giả
    // - Với quizzes/assignments: dùng thứ tự ban đầu trong mảng để tạo timestamp giả
    const getDate = (item: any): number => {
      if (item.created_at) {
        return new Date(item.created_at).getTime();
      }
      // Nếu là section và có order_index, tạo timestamp giả dựa trên order_index
      if (item.type === 'section' && item.order_index != null) {
        // Giả sử mỗi section cách nhau 1 giây, bắt đầu từ timestamp cũ (2020-01-01)
        const baseTimestamp = new Date('2020-01-01').getTime();
        return baseTimestamp + (item.order_index || 0) * 1000;
      }
      // Nếu không có created_at và không phải section, dùng thứ tự ban đầu từ API
      // Tính timestamp giả dựa trên thứ tự ban đầu từ API response, bắt đầu sau sections
      const baseTimestamp = new Date('2020-01-01').getTime();
      const maxSectionOrderIndex = sections.length > 0 
        ? Math.max(...sections.map((s: any) => s.order_index ?? 0)) 
        : -1;
      // Quizzes/assignments bắt đầu sau section cuối cùng, dùng _originalApiIndex để tính
      // _originalApiIndex là thứ tự ban đầu từ API response (trước khi sort)
      const originalApiIndex = item._originalApiIndex ?? (item._originalIndex - sections.length);
      return baseTimestamp + (maxSectionOrderIndex + 1 + originalApiIndex) * 1000;
    };
    
    const dateA = getDate(a);
    const dateB = getDate(b);
    
    return dateA - dateB; // ASC: cũ nhất trước
  });

  // Debug log để kiểm tra thứ tự sắp xếp
  useEffect(() => {
    const getDate = (item: any): number => {
      if (item.created_at) {
        return new Date(item.created_at).getTime();
      }
      if (item.type === 'section' && item.order_index != null) {
        const baseTimestamp = new Date('2020-01-01').getTime();
        return baseTimestamp + (item.order_index || 0) * 1000;
      }
      // Nếu không có created_at và không phải section, dùng thứ tự ban đầu
      const baseTimestamp = new Date('2020-01-01').getTime();
      const maxSectionOrderIndex = sections.length > 0 
        ? Math.max(...sections.map((s: any) => s.order_index ?? 0)) 
        : -1;
      return baseTimestamp + (maxSectionOrderIndex + 1 + (item._originalIndex - sections.length)) * 1000;
    };

    console.log('[CurriculumTab] ===== DEBUG: Curriculum Items Sorting =====');
    console.log('[CurriculumTab] Total items:', allCurriculumItems.length);
    console.log('[CurriculumTab] Sections count:', sections.length);
    console.log('[CurriculumTab] Course-level content count:', courseLevelContent.length);
    console.log('[CurriculumTab] Sorted items with dates:');
    
    allCurriculumItems.forEach((item: any, index: number) => {
      const computedDate = getDate(item);
      const dateFormatted = computedDate === Infinity 
        ? 'Infinity (newest)' 
        : new Date(computedDate).toISOString();
      
      console.log(`[CurriculumTab] ${index + 1}. ${item.type.toUpperCase()}:`, {
        title: item.title || item.name || 'Untitled',
        created_at: item.created_at || 'N/A',
        order_index: item.order_index ?? 'N/A',
        _originalIndex: item._originalIndex ?? 'N/A',
        _originalApiIndex: item._originalApiIndex ?? 'N/A',
        computedDate,
        computedDateFormatted: dateFormatted
      });
    });
    
    console.log('[CurriculumTab] ===== END DEBUG =====');
  }, [allCurriculumItems, sections.length, courseLevelContent.length]);

  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();
  const deleteQuizMutation = useDeleteQuiz();
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null); // Assignment đang edit
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(100);
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentAllowLate, setAssignmentAllowLate] = useState(false);
  const [assignmentSubmissionType, setAssignmentSubmissionType] = useState<'text' | 'file' | 'both'>('text');
  const [assignmentPublish, setAssignmentPublish] = useState(false);
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    content_type: LessonContentType;
    duration_minutes: number;
    is_preview: boolean;
    video_url: string;
    video_file?: File | null;
    content?: string;
    description?: string;
  }>({
    title: '',
    content_type: 'video',
    duration_minutes: 0,
    is_preview: false,
    video_url: '',
    video_file: null,
    content: '',
    description: '',
  });

  useEffect(() => {
    if (sectionsResponse?.data) {
      const responseData = sectionsResponse.data as any;
      const sectionsData = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || []);
      
      // Debug log để kiểm tra content
      console.log('[CurriculumTab] Sections data:', sectionsData);
      sectionsData.forEach((section: CourseSection) => {
        section.lessons?.forEach((lesson: any) => {
          console.log('[CurriculumTab] Lesson:', {
            id: lesson.id,
            title: lesson.title,
            order_index: lesson.order_index,
            content: lesson.content,
            description: lesson.description,
            hasContent: !!lesson.content,
            materials: lesson.materials,
            materialsCount: lesson.materials?.length || 0
          });
        });
      });
      
      setSections(
        sectionsData.map((section: CourseSection) => ({
          ...section,
          isExpanded: true,
          // Đảm bảo lessons được sort theo order_index
          lessons: section.lessons?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || []
        }))
      );
    }
  }, [sectionsResponse]);

  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection(courseId);
  const deleteSectionMutation = useDeleteSection(courseId);
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  const handleAddSection = async () => {
    // Tính order_index kế tiếp dựa trên giá trị hiện có để tránh trùng unique (course_id, order_index)
    const nextOrderIndex =
      sections.length > 0
        ? Math.max(...sections.map(s => s.order_index ?? 0)) + 1
        : 0;
    try {
      const newSection = await createSectionMutation.mutateAsync({
        course_id: courseId,
        title: 'New Section',
        order_index: nextOrderIndex,
      });
      setSections([...sections, { ...newSection.data, isExpanded: true }]);
      toast.success('Đã tạo section mới');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo section');
    }
  };

  const handleUpdateSectionTitle = async (sectionId: string, newTitle: string) => {
    try {
      await updateSectionMutation.mutateAsync({ sectionId, data: { title: newTitle } });
      setSections(sections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s));
      toast.success('Đã cập nhật section');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật section');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Xóa section này và tất cả nội dung bên trong?')) return;
    try {
      await deleteSectionMutation.mutateAsync(sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
      toast.success('Đã xóa section');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa section');
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const handleCreateCourseAssignment = async () => {
    if (!assignmentTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập');
      return;
    }
    try {
      if (editingAssignment) {
        // Update assignment
        await updateAssignmentMutation.mutateAsync({
          assignmentId: editingAssignment.id,
            data: {
              title: assignmentTitle.trim(),
              description: assignmentDescription.trim() || undefined,
              instructions: assignmentInstructions.trim() || undefined,
              max_score: assignmentMaxScore || 100,
            submission_type: assignmentSubmissionType || 'text',
            allow_late_submission: assignmentAllowLate,
            due_date: assignmentDueDate ? assignmentDueDate : undefined,
            is_published: assignmentPublish,
          },
        });
        toast.success('Đã cập nhật bài tập');
      } else {
        // Create assignment - kiểm tra xem có sectionId không
        const isSectionLevel = !!selectedAssignmentSectionId;
        await createAssignmentMutation.mutateAsync({
          ...(isSectionLevel ? { section_id: selectedAssignmentSectionId } : { course_id: courseId }),
          title: assignmentTitle.trim(),
          description: assignmentDescription.trim() || undefined,
          instructions: assignmentInstructions.trim() || undefined,
          max_score: assignmentMaxScore || 100,
          submission_type: assignmentSubmissionType || 'text', // Đảm bảo luôn có giá trị
          allow_late_submission: assignmentAllowLate,
          due_date: assignmentDueDate ? assignmentDueDate : undefined,
          is_published: assignmentPublish,
        } as any);
        toast.success(isSectionLevel ? 'Đã tạo bài tập trong section' : 'Đã tạo bài tập cấp khóa');
      }
      // Reset form
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentInstructions('');
      setAssignmentMaxScore(100);
      setAssignmentDueDate('');
      setAssignmentAllowLate(false);
      setAssignmentSubmissionType('text');
      setAssignmentPublish(false);
      setEditingAssignment(null);
      setIsAssignmentModalOpen(false);
      setIsSectionAssignmentModalOpen(false);
      setSelectedAssignmentSectionId(undefined);
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (editingAssignment ? 'Không thể cập nhật bài tập' : 'Không thể tạo bài tập'));
    }
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setAssignmentTitle(assignment.title || '');
    setAssignmentDescription(assignment.description || '');
    // Đảm bảo instructions được load (có thể là null, undefined, hoặc empty string)
    setAssignmentInstructions(assignment.instructions ?? '');
    setAssignmentMaxScore(assignment.max_score || 100);
    setAssignmentDueDate(assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '');
    setAssignmentAllowLate(assignment.allow_late_submission || false);
    setAssignmentSubmissionType(assignment.submission_type || 'text');
    setAssignmentPublish(assignment.is_published || false);
    
    // Debug log để kiểm tra instructions
    if (process.env.NODE_ENV === 'development') {
      console.log('[CurriculumTab] Editing assignment:', {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        instructionsType: typeof assignment.instructions,
        hasInstructions: assignment.instructions != null,
        allKeys: Object.keys(assignment)
      });
    }
    
    // Phân biệt section-level và course-level (giống quiz)
    if (assignment.section_id) {
      setSelectedAssignmentSectionId(assignment.section_id);
      setIsSectionAssignmentModalOpen(true);
    } else {
      setSelectedAssignmentSectionId(undefined);
      setIsAssignmentModalOpen(true);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Xóa bài tập này?')) return;
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
      toast.success('Đã xóa bài tập');
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa bài tập');
    }
  };

  const handleToggleAssignmentPublish = async (assignmentId: string, isPublished: boolean) => {
    try {
      await updateAssignmentMutation.mutateAsync({
        assignmentId,
        data: { is_published: !isPublished },
      });
      toast.success(!isPublished ? 'Đã publish assignment' : 'Đã unpublish assignment');
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteCourseAssignment = async (assignmentId: string) => {
    if (!confirm('Xóa assignment cấp khóa này?')) return;
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
      toast.success('Đã xóa assignment');
      refetchAssignments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa assignment');
    }
  };

  const handleDeleteCourseQuiz = async (quizId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quiz cấp khóa này?')) return;
    try {
      await deleteQuizMutation.mutateAsync(quizId);
      toast.success('Đã xóa quiz');
      refetchQuizzes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa quiz');
    }
  };

  const handleAddLesson = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    try {
      // Không gửi order_index, để backend tự động tính (tránh conflict với unique constraint)
      const newLesson = await createLessonMutation.mutateAsync({
        section_id: sectionId,
        title: 'New Lesson',
        content_type: 'video',
        // Không gửi order_index - backend sẽ tự động tính max order_index + 1
      });
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson.data] } : s
      ));
      toast.success('Đã tạo lesson mới');
      refetch(); // Refetch để đảm bảo data sync
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo lesson');
    }
  };

  const handleUpdateLessonTitle = async (sectionId: string, lessonId: string, newTitle: string) => {
    try {
      await updateLessonMutation.mutateAsync({ lessonId, data: { title: newTitle } });
      setSections(sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: (s.lessons || []).map(l => l.id === lessonId ? { ...l, title: newTitle } : l) }
          : s
      ));
      toast.success('Đã cập nhật lesson');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật lesson');
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Xóa lesson này?')) return;
    try {
      await deleteLessonMutation.mutateAsync(lessonId);
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, lessons: (s.lessons || []).filter(l => l.id !== lessonId) } : s
      ));
      toast.success('Đã xóa lesson');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa lesson');
    }
  };

  const handleEditContentItem = async (sectionId: string, lesson: CourseLesson) => {
    if (lesson.content_type === 'quiz') {
      // Refetch quizzes để đảm bảo có data mới nhất
      try {
        const { data: freshQuizzesResponse } = await refetchQuizzes();
        
        // Xử lý nested data structure: có thể là { data: [...] } hoặc { data: { data: [...] } }
        let quizzesList: any[] = [];
        const responseData = freshQuizzesResponse as any;
        if (responseData) {
          if (Array.isArray(responseData.data)) {
            quizzesList = responseData.data;
          } else if (responseData.data && Array.isArray(responseData.data.data)) {
            // Nested structure: { data: { data: [...] } }
            quizzesList = responseData.data.data;
          }
        }
        
        // Debug logs
        console.log('[CurriculumTab] Searching for quiz:', {
          lessonTitle: lesson.title,
          quizzesCount: quizzesList.length,
          quizzes: quizzesList.map((q: any) => ({ id: q.id, title: q.title })),
          rawResponse: freshQuizzesResponse,
          responseStructure: {
            hasData: !!responseData?.data,
            isDataArray: Array.isArray(responseData?.data),
            hasNestedData: !!responseData?.data?.data,
            isNestedDataArray: Array.isArray(responseData?.data?.data),
          },
        });
        
        // Tìm quiz gắn với section của lesson này
        const section = sections.find(s => s.id === lesson.section_id);
        let matchingQuiz = section 
          ? quizzesList.find((q: any) => q.section_id === section.id)
          : null;

        // Backward-compatible: nếu chưa có section_id, fallback match theo title
        if (!matchingQuiz) {
          matchingQuiz = quizzesList.find((q: any) => {
            const quizTitle = (q.title || '').trim();
            const lessonTitle = (lesson.title || '').trim();
            return quizTitle.toLowerCase() === lessonTitle.toLowerCase();
          });
        }
        
        if (matchingQuiz) {
          console.log('[CurriculumTab] Found matching quiz:', matchingQuiz);
          setSelectedQuizId(matchingQuiz.id);
          setSelectedQuizTitle(matchingQuiz.title);
          setIsManageQuizModalOpen(true);
        } else {
          // Nếu không tìm thấy, có thể quiz chưa được tạo hoặc title khác
          console.warn('[CurriculumTab] No matching quiz found for lesson:', lesson.title);
          // Hiển thị thông báo và đề xuất tạo quiz mới
          toast.error('Không tìm thấy quiz tương ứng. Vui lòng tạo quiz mới.');
          // Hoặc có thể navigate đến QuizBuilderPage
          navigate(generateRoute.instructor.quizCreate(courseId));
        }
      } catch (error) {
        console.error('[CurriculumTab] Error fetching quizzes:', error);
        toast.error('Không thể tải danh sách quiz. Vui lòng thử lại.');
      }
      return;
    }

    // Mở LessonModal để chỉnh sửa cho video, document, text, link
    if (lesson.content_type === 'video' || lesson.content_type === 'document' || 
        lesson.content_type === 'text' || lesson.content_type === 'link') {
      setEditingLesson({ sectionId, lesson });
      setLessonForm({
        title: lesson.title,
        content_type: lesson.content_type as LessonContentType,
        duration_minutes: lesson.duration_minutes || 0,
        is_preview: lesson.is_free_preview || false,
        video_url: lesson.video_url || '',
        video_file: null,
        content: lesson.content || '',
        description: lesson.description || '',
      });
      setIsLessonModalOpen(true);
      return;
    }

    // Xử lý assignment riêng
    if (lesson.content_type === 'assignment') {
      // TODO: Mở modal chỉnh sửa assignment
      console.log('Edit assignment lesson:', lesson);
      toast('Chức năng chỉnh sửa assignment đang được phát triển', { icon: 'ℹ️' });
      return;
    }

    console.log('Edit lesson (unknown type):', lesson);
  };

  const handleCloseLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
      setLessonForm({
        title: '',
        content_type: 'video',
        duration_minutes: 0,
        is_preview: false,
        video_url: '',
        video_file: null,
        content: '',
        description: '',
      });
  };

  const handleSaveLessonModal = async (formToSave?: typeof lessonForm) => {
    if (!editingLesson) return;

    const { sectionId, lesson } = editingLesson;
    
    // Dùng form từ parameter nếu có, nếu không thì dùng lessonForm từ state
    const form = formToSave || lessonForm;

    try {
      let videoUrl = form.video_url;

      // Upload video file to R2 if there's a new file (blob URL indicates new upload)
      if (form.video_file && form.video_url?.startsWith('blob:')) {
        toast.loading('Đang tải video lên...', { id: 'upload-video' });
        
        try {
          const uploadResult = await mediaApi.uploadLessonVideo(
            form.video_file,
            courseId,
            lesson.id
          );
          videoUrl = uploadResult.data.url;
          toast.success('Tải video thành công!', { id: 'upload-video' });
        } catch (uploadError: any) {
          console.error('Error uploading video:', uploadError);
          toast.error('Không thể tải video lên. Vui lòng thử lại.', { id: 'upload-video' });
          return;
        }
      }

      // Chỉ include content/description nếu có giá trị thực sự (không phải empty string)
      const updatePayload: any = {
        title: form.title,
        content_type: form.content_type,
        duration_minutes: form.duration_minutes,
        is_free_preview: form.is_preview,
      };
      
      // Chỉ thêm video_url nếu có giá trị (sau khi upload)
      if (videoUrl) {
        updatePayload.video_url = videoUrl;
      }
      
      // Chỉ thêm content nếu có giá trị thực sự (không phải empty string hoặc chỉ whitespace)
      if (form.content && form.content.trim().length > 0) {
        updatePayload.content = form.content;
      }
      
      // Chỉ thêm description nếu có giá trị thực sự
      if (form.description && form.description.trim().length > 0) {
        updatePayload.description = form.description;
      }
      
      // Debug log để kiểm tra data gửi lên
      console.log('[CurriculumTab] Updating lesson with payload:', {
        lessonId: lesson.id,
        hasContent: !!updatePayload.content,
        hasDescription: !!updatePayload.description,
        contentLength: updatePayload.content?.length || 0,
        contentPreview: updatePayload.content?.substring(0, 100) || 'empty',
        usingFormFromParam: !!formToSave,
        payloadKeys: Object.keys(updatePayload)
      });
      
      const updatedLesson = await updateLessonMutation.mutateAsync({
        lessonId: lesson.id,
        data: updatePayload,
      });
      
      // Debug log để kiểm tra response
      console.log('[CurriculumTab] Lesson updated, response:', {
        hasContent: !!(updatedLesson?.data?.content),
        hasDescription: !!(updatedLesson?.data?.description),
        contentLength: updatedLesson?.data?.content?.length || 0
      });
      
      // Update local state với data từ response (bao gồm content và description)
      const updatedLessonData = updatedLesson?.data || updatedLesson;
      setSections(sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              lessons: (s.lessons || []).map(l =>
                l.id === lesson.id
                  ? {
                      ...l,
                      title: lessonForm.title,
                      content_type: lessonForm.content_type,
                      duration_minutes: lessonForm.duration_minutes,
                      is_free_preview: lessonForm.is_preview,
                      video_url: lessonForm.video_url || undefined,
                      content: updatedLessonData?.content || lessonForm.content || l.content,
                      description: updatedLessonData?.description || lessonForm.description || l.description,
                    }
                  : l
              )
            }
          : s
      ));
      
      toast.success('Đã cập nhật lesson');
      handleCloseLessonModal();
      refetch(); // Refetch để đảm bảo data sync từ server
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật lesson';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>
          <p className="text-gray-600 mt-1">Quản lý nội dung khóa học</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tất cả items (Sections, Quizzes, Assignments) được sắp xếp theo thứ tự tạo */}
        {allCurriculumItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">Chưa có nội dung nào.</p>
          </div>
        ) : (
          allCurriculumItems.map((item: any, itemIndex: number) => {
            // Render Section
            if (item.type === 'section') {
              const section = item as CourseSection & { isExpanded: boolean };
              const sectionIndex = sections.findIndex(s => s.id === section.id);
              // Debug: Log section info cho tất cả sections
              console.log(`[CurriculumTab] Section ${sectionIndex + 1} info:`, {
                sectionId: section.id,
                sectionTitle: section.title,
                sectionIdType: typeof section.id,
                sectionIdString: String(section.id).trim(),
                allQuizzesWithSectionId: quizzes.filter((q: any) => q.section_id).map((q: any) => ({
                  id: q.id,
                  title: q.title,
                  section_id: q.section_id,
                  section_idType: typeof q.section_id,
                  section_idString: q.section_id ? String(q.section_id).trim() : null,
                  matches: q.section_id ? String(q.section_id).trim() === String(section.id).trim() : false
                }))
              });
              return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <DragHandle />
                <button 
                  onClick={() => toggleSection(section.id)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Toggle section"
                >
                  {section.isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold text-gray-900">Chương {sectionIndex + 1}:</span>
                  <InlineEditInput
                    value={section.title}
                    onSave={(newTitle) => handleUpdateSectionTitle(section.id, newTitle)}
                    placeholder="Nhập tên chương..."
                    className="text-lg"
                  />
                  {section.lessons && section.lessons.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({section.lessons.length} {section.lessons.length === 1 ? 'bài học' : 'bài học'})
                    </span>
                  )}
                </div>
                <ActionGroup onDelete={() => handleDeleteSection(section.id)} />
              </div>

              {section.isExpanded && (
                <div className="p-4">
                  {(() => {
                    // Kiểm tra xem section có nội dung nào không (lessons, quizzes, assignments)
                    const hasLessons = section.lessons && section.lessons.length > 0;
                    const sectionQuizzes = quizzes.filter((q: any) => {
                      const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
                      const currentSectionId = section.id ? String(section.id).trim() : null;
                      return quizSectionId === currentSectionId && quizSectionId !== null;
                    });
                    const hasQuizzes = sectionQuizzes.length > 0;
                    const sectionAssignments = assignments.filter((a: any) => {
                      const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
                      const currentSectionId = section.id ? String(section.id).trim() : null;
                      return assignmentSectionId === currentSectionId && assignmentSectionId !== null;
                    });
                    const hasAssignments = sectionAssignments.length > 0;
                    const hasContent = hasLessons || hasQuizzes || hasAssignments;
                    
                    if (!hasContent) {
                      return (
                        <>
                          <div className="text-center py-8 text-gray-500">
                            Chưa có nội dung nào. Thêm bài học hoặc quiz để bắt đầu.
                          </div>
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <ContentTypeSelector
                              onSelect={async (type) => {
                                const currentSection = sections.find(s => s.id === section.id);
                                if (currentSection) {
                                  // Nếu là quiz, mở modal tạo quiz
                                  if (type === 'quiz') {
                                    setSelectedSectionId(section.id);
                                    setIsQuizModalOpen(true);
                                    return;
                                  }
                                  
                                  // Nếu là assignment, mở modal tạo assignment (giống quiz)
                                  if (type === 'assignment') {
                                    setSelectedAssignmentSectionId(section.id);
                                    setIsSectionAssignmentModalOpen(true);
                                    return;
                                  }
                                  
                                  // Các loại khác tạo lesson trực tiếp
                                  try {
                                    // Không gửi order_index, để backend tự động tính (tránh conflict với unique constraint)
                                    const newLesson = await createLessonMutation.mutateAsync({
                                      section_id: section.id,
                                      title: `New ${type}`,
                                      content_type: type,
                                      // Không gửi order_index - backend sẽ tự động tính max order_index + 1
                                    });
                                    setSections(sections.map(s =>
                                      s.id === section.id ? { ...s, lessons: [...(s.lessons || []), newLesson.data] } : s
                                    ));
                                    toast.success(`Đã tạo ${type} mới`);
                                    refetch(); // Refetch để đảm bảo data sync
                                  } catch (error: any) {
                                    toast.error(error?.response?.data?.message || `Không thể tạo ${type}`);
                                  }
                                }
                              }}
                            />
                            <Button onClick={() => handleAddLesson(section.id)} variant="outline" className="gap-2 mt-4">
                              <Plus className="w-4 h-4" />
                              Thêm bài học
                            </Button>
                          </div>
                        </>
                      );
                    }
                    
                    return (
                      <>
                        {hasLessons && (
                          <div className="space-y-6">
                            {section.lessons.map((lesson, lessonIndex) => (
                              <TimelineConnector key={lesson.id} isLast={lessonIndex === (section.lessons?.length || 0) - 1}>
                                <div className="flex items-center gap-3 mb-3">
                                  <DragHandle className="text-gray-500" />
                                  <span className="font-medium text-gray-700">Bài học {lessonIndex + 1}:</span>
                                  <InlineEditInput
                                    value={lesson.title}
                                    onSave={(newTitle) => handleUpdateLessonTitle(section.id, lesson.id, newTitle)}
                                    placeholder="Nhập tên bài học..."
                                  />
                                  <ActionGroup
                                    onEdit={() => handleEditContentItem(section.id, lesson)}
                                    onDelete={() => handleDeleteLesson(section.id, lesson.id)}
                                  />
                                </div>
                                <div className="ml-8">
                                  {/* Hiển thị lesson content dựa trên content_type */}
                                  {(lesson.content_type === 'video' || lesson.content_type === 'document' || 
                                    lesson.content_type === 'quiz' || lesson.content_type === 'assignment') && (() => {
                                    // Tìm quiz/assignment tương ứng để lấy is_practice
                                    let isPractice: boolean | undefined = undefined;
                                    if (lesson.content_type === 'quiz') {
                                      const matchingQuiz = quizzes.find((q: any) => {
                                        const quizTitle = (q.title || '').trim();
                                        const lessonTitle = (lesson.title || '').trim();
                                        return quizTitle.toLowerCase() === lessonTitle.toLowerCase();
                                      });
                                      isPractice = matchingQuiz?.is_practice;
                                    }
                                    // TODO: Tương tự cho assignment khi có assignment list
                                    
                                    return (
                                      <ContentItem
                                        type={lesson.content_type as 'video' | 'document' | 'quiz' | 'assignment'}
                                        title={lesson.title}
                                        duration={lesson.duration_minutes}
                                        isPreview={lesson.is_free_preview}
                                        isPractice={isPractice}
                                        onEdit={() => handleEditContentItem(section.id, lesson)}
                                        onDelete={() => handleDeleteLesson(section.id, lesson.id)}
                                      />
                                    );
                                  })()}
                                </div>
                              </TimelineConnector>
                            ))}
                          </div>
                        )}
                            
                        {/* Hiển thị quiz/assignment gắn với section (section-level) - Render cả khi không có lessons */}
                        {quizzes
                          .filter((q: any) => {
                            const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
                            const currentSectionId = section.id ? String(section.id).trim() : null;
                            const matches = quizSectionId === currentSectionId && quizSectionId !== null;
                            
                            // Debug: Log quiz "Bài test 15p" để kiểm tra
                            if (q.title && q.title.includes('Bài test 15p')) {
                              console.log('[CurriculumTab] Quiz "Bài test 15p" filter check:', {
                                quizId: q.id,
                                quizTitle: q.title,
                                quizSectionId,
                                quizSectionIdType: typeof q.section_id,
                                currentSectionId,
                                currentSectionIdType: typeof section.id,
                                sectionTitle: section.title,
                                matches,
                                rawQuizSectionId: q.section_id,
                                rawSectionId: section.id
                              });
                            }
                            
                            return matches;
                          })
                          .map((quiz: any) => (
                            <div key={`section-quiz-${quiz.id}`} className="mt-4">
                              <ContentItem
                                type="quiz"
                                title={quiz.title}
                                duration={quiz.duration_minutes}
                                isPreview={false}
                                isPractice={quiz.is_practice}
                                onEdit={() => {
                                  setSelectedQuizId(quiz.id);
                                  setSelectedQuizTitle(quiz.title);
                                  setIsManageQuizModalOpen(true);
                                }}
                                  onDelete={() => handleDeleteCourseQuiz(quiz.id)}
                              />
                            </div>
                          ))}
                  
                        {assignments
                          .filter((a: any) => {
                            const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
                            const currentSectionId = section.id ? String(section.id).trim() : null;
                            return assignmentSectionId === currentSectionId && assignmentSectionId !== null;
                          })
                          .map((assignment: any) => (
                            <div key={`section-assignment-${assignment.id}`} className="mt-4">
                              <ContentItem
                                type="assignment"
                                title={assignment.title}
                                duration={assignment.duration_minutes}
                                isPreview={false}
                                isPractice={assignment.is_practice}
                                onEdit={() => handleEditAssignment(assignment)}
                                onDelete={() => handleDeleteAssignment(assignment.id)}
                              />
                            </div>
                          ))}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <ContentTypeSelector
                            onSelect={async (type) => {
                              const currentSection = sections.find(s => s.id === section.id);
                              if (currentSection) {
                                // Nếu là quiz, mở modal tạo quiz
                                if (type === 'quiz') {
                                  setSelectedSectionId(section.id);
                                  setIsQuizModalOpen(true);
                                  return;
                                }
                                
                                // Nếu là assignment, mở modal tạo assignment (giống quiz)
                                if (type === 'assignment') {
                                  setSelectedAssignmentSectionId(section.id);
                                  setIsSectionAssignmentModalOpen(true);
                                  return;
                                }
                                
                                // Các loại khác tạo lesson trực tiếp
                                try {
                                  const newLesson = await createLessonMutation.mutateAsync({
                                    section_id: section.id,
                                    title: `New ${type}`,
                                    content_type: type,
                                    order_index: currentSection.lessons?.length || 0,
                                  });
                                  setSections(sections.map(s =>
                                    s.id === section.id ? { ...s, lessons: [...(s.lessons || []), newLesson.data] } : s
                                  ));
                                  toast.success(`Đã tạo ${type} mới`);
                                } catch (error: any) {
                                  toast.error(error?.response?.data?.message || `Không thể tạo ${type}`);
                                }
                              }
                            }}
                          />
                          <Button onClick={() => handleAddLesson(section.id)} variant="outline" className="gap-2 mt-4">
                            <Plus className="w-4 h-4" />
                            Add Lesson
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            );
            }

            // Render Quiz (course-level)
            if (item.type === 'quiz') {
              return (
                <div key={`quiz-${item.id}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-gray-900">Quiz:</span>
                      <span className="text-lg text-gray-900">{item.title}</span>
                      {item.description && (
                        <span className="text-sm text-gray-500 ml-2">- {item.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuizId(item.id);
                          setSelectedQuizTitle(item.title);
                          setIsManageQuizModalOpen(true);
                        }}
                      >
                        Quản lý
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCourseQuiz(item.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Assignment (course-level)
            if (item.type === 'assignment') {
              return (
                <div key={`assignment-${item.id}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-gray-900">Assignment:</span>
                      <span className="text-lg text-gray-900">{item.title}</span>
                      {item.description && (
                        <span className="text-sm text-gray-500 ml-2">- {item.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAssignment(item)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAssignmentPublish(item.id, item.is_published)}
                      >
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCourseAssignment(item.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {/* Action buttons at the bottom */}
      <div className="flex items-center justify-center gap-3">
        <Button onClick={handleAddSection} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
        <Button
          onClick={() => {
            setSelectedSectionId(undefined);
            setSelectedLessonId(undefined);
            setIsQuizModalOpen(true);
          }}
          variant="outline"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Quiz
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedAssignmentSectionId(undefined); // Đảm bảo là course-level
            setIsAssignmentModalOpen(true);
          }}
          className="gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Add Assignment
        </Button>
      </div>

      {/* Lesson Modal for editing video/document content */}
      <LessonModal
        isOpen={isLessonModalOpen}
        editingLesson={editingLesson ? (() => {
          const lessonData = {
            id: editingLesson.lesson.id,
            title: editingLesson.lesson.title,
            content_type: editingLesson.lesson.content_type as LessonContentType,
            duration_minutes: editingLesson.lesson.duration_minutes || 0,
            is_preview: editingLesson.lesson.is_free_preview || false,
            order_index: editingLesson.lesson.order_index,
            video_url: editingLesson.lesson.video_url || '',
            materials: editingLesson.lesson.materials,
          };
          console.log('[CurriculumTab] Passing lesson to modal:', {
            lessonId: lessonData.id,
            materials: lessonData.materials,
            materialsCount: lessonData.materials?.length || 0
          });
          return lessonData;
        })() : null}
        lessonForm={lessonForm}
        onFormChange={setLessonForm}
        onSave={(updatedForm) => {
          // Nếu có updatedForm từ modal, dùng nó trực tiếp; nếu không, dùng lessonForm hiện tại
          if (updatedForm) {
            setLessonForm(updatedForm);
            // Gọi handleSaveLessonModal với form mới (không cần setTimeout vì đã có form)
            handleSaveLessonModal(updatedForm);
          } else {
            handleSaveLessonModal();
          }
        }}
        onClose={handleCloseLessonModal}
        courseTitle={course?.title}
        courseDescription={course?.description}
        sectionTitle={editingLesson ? sections.find(s => s.id === editingLesson.sectionId)?.title : undefined}
        courseLevel={course?.level as 'beginner' | 'intermediate' | 'advanced' | undefined}
      />

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setSelectedSectionId(undefined);
          setSelectedLessonId(undefined);
        }}
        courseId={courseId}
        sectionId={selectedSectionId}
        lessonId={selectedLessonId}
        onQuizCreated={async (quizId, title) => {
          console.log('[CurriculumTab] onQuizCreated called:', { quizId, title, selectedSectionId });
          
          // Validate quizId
          if (!quizId) {
            console.error('[CurriculumTab] quizId is undefined in onQuizCreated callback');
            toast.error('Đã tạo quiz nhưng không thể lấy ID của quiz');
            return;
          }

          // Nếu tạo quiz từ section, quiz đã được tạo với section_id rồi
          // Chỉ cần refresh data để hiển thị quiz mới
          if (selectedSectionId) {
            // Invalidate tất cả queries liên quan đến quizzes
            queryClient.invalidateQueries({ 
              queryKey: ['instructor-quizzes'],
              exact: false // Invalidate tất cả queries bắt đầu với 'instructor-quizzes'
            });
            // Đợi một chút để đảm bảo data được refresh
            setTimeout(() => {
            refetch();
              refetchQuizzes();
            }, 100);
            toast.success('Đã tạo quiz thành công');
            return;
          }

          // Nếu tạo quiz cấp course (không có sectionId), chỉ cần refresh
          queryClient.invalidateQueries({ 
            queryKey: ['instructor-quizzes'],
            exact: false
          });
          setTimeout(() => {
            refetch();
            refetchQuizzes();
          }, 100);
          toast.success('Đã tạo quiz thành công');
        }}
      />

      {/* Create Assignment Modal (dùng chung cho cả course-level và section-level) */}
      <Modal
        isOpen={isAssignmentModalOpen || isSectionAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setIsSectionAssignmentModalOpen(false);
          setEditingAssignment(null);
          setSelectedAssignmentSectionId(undefined);
          // Reset form khi đóng
          setAssignmentTitle('');
          setAssignmentDescription('');
          setAssignmentMaxScore(100);
          setAssignmentDueDate('');
          setAssignmentAllowLate(false);
          setAssignmentSubmissionType('text');
          setAssignmentPublish(false);
        }}
        title={
          editingAssignment 
            ? "Chỉnh sửa Assignment" 
            : selectedAssignmentSectionId
            ? "Tạo Assignment trong Section"
            : "Tạo Assignment cấp khóa"
        }
        size="md"
      >
        <ModalBody>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Tiêu đề</label>
              <Input
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Nhập tiêu đề assignment"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Mô tả (tuỳ chọn)</label>
              <Input
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                placeholder="Mô tả ngắn về assignment"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Câu hỏi/Yêu cầu</label>
              <textarea
                value={assignmentInstructions}
                onChange={(e) => setAssignmentInstructions(e.target.value)}
                placeholder="Nhập câu hỏi hoặc yêu cầu chi tiết của assignment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700">Điểm tối đa</label>
                <Input
                  type="number"
                  value={assignmentMaxScore}
                  onChange={(e) => setAssignmentMaxScore(Number(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Hạn nộp (optional)</label>
                <Input
                  type="datetime-local"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignmentAllowLate}
                  onChange={(e) => setAssignmentAllowLate(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Cho phép nộp trễ</span>
              </div>
              <div>
                <label className="text-sm text-gray-700">Loại nộp bài</label>
                <select
                  value={assignmentSubmissionType}
                  onChange={(e) => setAssignmentSubmissionType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                  <option value="both">Text + File</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={assignmentPublish}
                onChange={(e) => setAssignmentPublish(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Publish ngay</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => {
            setIsAssignmentModalOpen(false);
            setIsSectionAssignmentModalOpen(false);
          }}>
            Hủy
          </Button>
          <Button 
            onClick={handleCreateCourseAssignment} 
            className="ml-2"
            disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
          >
            {createAssignmentMutation.isPending || updateAssignmentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : editingAssignment ? (
              'Cập nhật'
            ) : (
              'Tạo assignment'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Manage Quiz Modal */}
      {selectedQuizId && (
        <ManageQuizModal
          isOpen={isManageQuizModalOpen}
          onClose={() => {
            setIsManageQuizModalOpen(false);
            setSelectedQuizId(null);
            setSelectedQuizTitle('');
          }}
          quizId={selectedQuizId}
          quizTitle={selectedQuizTitle}
        />
      )}
    </div>
  );
}

