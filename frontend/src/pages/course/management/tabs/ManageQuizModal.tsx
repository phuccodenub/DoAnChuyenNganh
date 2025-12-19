import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus, Trash2, Edit2, CheckCircle, XCircle, Settings, Save } from 'lucide-react';
import { quizApi, type Question, type UpdateQuizData, type CreateQuestionData } from '@/services/api/quiz.api';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInstructorQuizQuestions, useDeleteQuestion, useInstructorQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useInstructorQuiz';
import { AiQuizGenerator } from '@/components/instructor/AiQuizGenerator';
import { lessonApi } from '@/services/api/lesson.api';
import { CreateQuestionModal } from './CreateQuestionModal';

interface ManageQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
  totalPoints?: number; // Tổng điểm của quiz
}

/**
 * ManageQuizModal
 * 
 * Modal để quản lý quiz: xem danh sách câu hỏi, thêm, sửa, xóa câu hỏi
 */
export function ManageQuizModal({
  isOpen,
  onClose,
  quizId,
  quizTitle,
  totalPoints = 100, // Mặc định 100 điểm
}: ManageQuizModalProps) {
  const queryClient = useQueryClient();
  // Chỉ fetch khi modal mở để tránh refetch gây side-effects (vd: redirect unauthorized)
  const effectiveQuizId = isOpen ? quizId : '';
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [isImportingFromAI, setIsImportingFromAI] = useState(false);
  
  const { data: questionsData, isLoading } = useInstructorQuizQuestions(effectiveQuizId);
  const { data: quizData, refetch: refetchQuiz, isLoading: isLoadingQuiz } = useInstructorQuiz(effectiveQuizId);
  const deleteQuestionMutation = useDeleteQuestion();
  const updateQuizMutation = useUpdateQuiz();
  const deleteQuizMutation = useDeleteQuiz();
  
  // Xử lý quiz data - đảm bảo lấy đúng từ response
  let quiz: any = null;
  if (quizData) {
    // quizApi.getQuiz có thể trả về Quiz trực tiếp hoặc nested trong { data: Quiz }
    if (quizData.id) {
      quiz = quizData;
    } else if ((quizData as any).data && (quizData as any).data.id) {
      quiz = (quizData as any).data;
    }
  }

  // Xác định quiz thuộc section hay course level
  const isSectionLevel = !!quiz?.section_id;
  const isCourseLevel = !!quiz?.course_id && !quiz?.section_id;

  // Fetch section trực tiếp nếu quiz thuộc section
  const { data: sectionData } = useQuery({
    queryKey: ['section', quiz?.section_id],
    queryFn: () => lessonApi.getSection(quiz!.section_id!),
    enabled: isSectionLevel && isOpen,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
  
  const section = sectionData || null;

  // Fetch tất cả sections nếu quiz thuộc course level
  // Lưu ý: Instructor cần includeUnpublished=true để thấy tất cả sections (kể cả chưa publish)
  const { data: courseSectionsData, isLoading: isLoadingCourseSections, error: courseSectionsError } = useQuery({
    queryKey: ['course-sections', quiz?.course_id, 'instructor'],
    queryFn: () => lessonApi.getCourseSections(quiz!.course_id!, true), // includeUnpublished=true cho instructor
    enabled: isCourseLevel && isOpen && !!quiz?.course_id,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const courseSections = Array.isArray(courseSectionsData) ? courseSectionsData : [];
  
  // Debug log để kiểm tra
  useEffect(() => {
    if (isOpen && isCourseLevel) {
      console.log('[ManageQuizModal] Course Sections Debug:', {
        courseId: quiz?.course_id,
        isCourseLevel,
        courseSectionsData,
        courseSections,
        courseSectionsLength: courseSections.length,
        isLoadingCourseSections,
        courseSectionsError,
        firstSection: courseSections[0],
        allSections: courseSections,
      });
    }
  }, [isOpen, isCourseLevel, quiz?.course_id, courseSectionsData, courseSections, isLoadingCourseSections, courseSectionsError]);

  // Fetch full lesson content từ API
  // - Nếu section level: fetch lessons của section đó
  // - Nếu course level: fetch lessons của tất cả sections
  const { data: lessonsWithContent = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ['lessons-content', section?.id, quiz?.course_id, isSectionLevel ? 'section' : 'course'],
    queryFn: async () => {
      let allLessons: any[] = [];

      if (isSectionLevel && section?.lessons) {
        // Section level: chỉ fetch lessons của section đó
        allLessons = section.lessons;
      } else if (isCourseLevel && courseSections.length > 0) {
        // Course level: collect lessons từ tất cả sections
        courseSections.forEach((sec: any) => {
          if (sec.lessons && Array.isArray(sec.lessons)) {
            allLessons.push(...sec.lessons);
          }
        });
      }

      if (allLessons.length === 0) return [];

      // Fetch song song tất cả lessons để tối ưu performance
      const lessonPromises = allLessons.map((lesson: any) => 
        lessonApi.getLesson(lesson.id).catch((err) => {
          console.error(`[ManageQuizModal] Error fetching lesson ${lesson.id}:`, err);
          return null;
        })
      );
      
      const fetchedLessons = await Promise.all(lessonPromises);
      return fetchedLessons.filter((l): l is any => l !== null);
    },
    enabled: isOpen && (
      (isSectionLevel && !!section?.lessons && section.lessons.length > 0) ||
      (isCourseLevel && courseSections.length > 0)
    ),
    staleTime: 10 * 60 * 1000, // Cache 10 phút - không fetch lại nếu đã có
    gcTime: 30 * 60 * 1000, // Giữ cache 30 phút
  });

  // Debug log để kiểm tra data
  useEffect(() => {
    if (isOpen) {
      console.log('[ManageQuizModal] Quiz data:', {
        quizData,
        quiz,
        quizId,
        hasQuiz: !!quiz,
        quizTitle: quiz?.title,
        courseId: quiz?.course_id,
        sectionId: quiz?.section_id,
        duration_minutes: quiz?.duration_minutes,
        passing_score: quiz?.passing_score,
        max_attempts: quiz?.max_attempts,
        is_published: quiz?.is_published,
      });
      
      console.log('[ManageQuizModal] Section data:', {
        section,
        sectionId: quiz?.section_id,
        hasSection: !!section,
        sectionTitle: section?.title,
        lessonsCount: section?.lessons?.length || 0,
        isLoadingLessons,
        lessonsWithContentCount: lessonsWithContent.length
      });
    }
  }, [isOpen, quizData, quiz, quizId, section, isLoadingLessons, lessonsWithContent]);
  
  // Đảm bảo questions luôn là array
  // Xử lý cả trường hợp response là array trực tiếp hoặc nested trong object
  let questions: Question[] = [];
  if (questionsData) {
    if (Array.isArray(questionsData)) {
      questions = questionsData;
    } else if ((questionsData as any).data && Array.isArray((questionsData as any).data)) {
      questions = (questionsData as any).data;
    } else if ((questionsData as any).questions && Array.isArray((questionsData as any).questions)) {
      questions = (questionsData as any).questions;
    }
  }
  
  
  // Helper function để extract text từ lesson content
  const extractLessonText = (content: string, maxLength: number = 3000): string => {
    if (!content) return '';
    
    let textContent = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Loại bỏ script
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Loại bỏ style
      .replace(/<[^>]+>/g, ' ') // Loại bỏ HTML tags, thay bằng space
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (textContent && textContent.length > 0) {
      return textContent.length > maxLength 
        ? textContent.substring(0, maxLength) + '...' 
        : textContent;
    }
    return '';
  };

  // Chuẩn bị nội dung nguồn cho AI Quiz Generator: 
  // - Nếu quiz thuộc section: dùng nội dung section + lessons
  // - Nếu quiz thuộc course level: dùng nội dung tất cả sections + lessons
  // - Nếu không: dùng quiz title + description + câu hỏi hiện có
  const aiSourceContent = useMemo(() => {
    const parts: string[] = [];
    
    // Trường hợp 1: Quiz thuộc section (section level)
    if (isSectionLevel && section) {
      parts.push(`# ${section.title || 'Chương'}`);
      if (section.description) {
        parts.push(`## Mô tả chương\n${section.description}`);
      }
      
      // Sử dụng lessons với full content từ API (nếu có), fallback về section.lessons
      const lessonsToUse = lessonsWithContent.length > 0 
        ? lessonsWithContent 
        : (section.lessons || []);
      
      if (lessonsToUse.length > 0) {
        parts.push('\n## Nội dung bài học trong chương');
        lessonsToUse
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .forEach((lesson: any, idx: number) => {
            parts.push(`\n### Bài ${idx + 1}: ${lesson.title || 'Chưa có tiêu đề'}`);
            if (lesson.description) {
              parts.push(`**Mô tả:** ${lesson.description}`);
            }
            
            const textContent = extractLessonText(lesson.content);
            if (textContent) {
              parts.push(`**Nội dung:**\n${textContent}`);
            }
          });
      } else {
        parts.push('\n⚠️ Chương này chưa có bài học nào. Vui lòng thêm bài học trước khi tạo quiz.');
      }
    } 
    // Trường hợp 2: Quiz thuộc course level (không có section_id)
    else if (isCourseLevel) {
      parts.push(`# ${quiz?.title || 'Quiz Khóa Học'}`);
      if (quiz?.description) {
        parts.push(`## Mô tả quiz\n${quiz.description}`);
      }
      
      // Nếu đang loading sections, hiển thị message
      if (isLoadingCourseSections) {
        parts.push('\n⚠️ Đang tải nội dung khóa học...');
      } 
      // Nếu đã có sections
      else if (courseSections.length > 0) {
        parts.push('\n## Nội dung khóa học (tất cả các chương)');
        
        // Duyệt qua tất cả sections và lessons
        courseSections
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .forEach((sec: any, secIdx: number) => {
            parts.push(`\n### Chương ${secIdx + 1}: ${sec.title || 'Chưa có tiêu đề'}`);
            if (sec.description) {
              parts.push(`**Mô tả chương:** ${sec.description}`);
            }
            
            // Lấy lessons từ lessonsWithContent (đã fetch đầy đủ) hoặc từ section
            // Ưu tiên dùng lessonsWithContent vì đã có full content, nếu không có thì dùng sec.lessons
            let sectionLessons: any[] = [];
            if (lessonsWithContent.length > 0) {
              // Filter lessons theo section_id
              sectionLessons = lessonsWithContent.filter((l: any) => {
                // Check cả section_id và section.id (có thể là string hoặc number)
                return String(l.section_id) === String(sec.id) || 
                       String(l.section?.id) === String(sec.id) ||
                       (l.section && String(l.section) === String(sec.id));
              });
            }
            
            // Fallback về sec.lessons nếu không có trong lessonsWithContent
            if (sectionLessons.length === 0 && sec.lessons && sec.lessons.length > 0) {
              sectionLessons = sec.lessons;
            }
            
            if (sectionLessons.length > 0) {
              sectionLessons
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .forEach((lesson: any, lessonIdx: number) => {
                  parts.push(`\n#### Bài ${lessonIdx + 1}: ${lesson.title || 'Chưa có tiêu đề'}`);
                  if (lesson.description) {
                    parts.push(`**Mô tả:** ${lesson.description}`);
                  }
                  
                  // Extract content từ lesson
                  // Nếu lesson từ lessonsWithContent thì đã có full content
                  // Nếu lesson từ sec.lessons thì có thể chỉ có metadata, nhưng vẫn thử extract
                  const textContent = extractLessonText(lesson.content, 2000); // Giảm xuống 2000 cho course level vì có nhiều lessons
                  if (textContent) {
                    parts.push(`**Nội dung:**\n${textContent}`);
                  } else if (lesson.content_type) {
                    // Nếu không có content text nhưng có content_type, thêm thông tin
                    parts.push(`**Loại nội dung:** ${lesson.content_type}`);
                  }
                });
            } else {
              parts.push(`\n⚠️ Chương này chưa có bài học nào.`);
            }
          });
        
        // Thêm thông tin debug nếu không có lessons
        if (lessonsWithContent.length === 0 && !isLoadingLessons) {
          parts.push(`\n\n⚠️ Lưu ý: Chưa tải được nội dung đầy đủ của các bài học. Đang sử dụng metadata từ sections.`);
        }
      } 
      // Nếu không có sections
      else {
        parts.push('\n⚠️ Khóa học này chưa có chương nào. Vui lòng thêm chương và bài học trước khi tạo quiz.');
      }
    } 
    // Trường hợp 3: Fallback - không có section hoặc course
    else {
      parts.push(`# ${quiz?.title || 'Quiz'}`);
      if (quiz?.description) {
        parts.push(`## Mô tả\n${quiz.description}`);
      } else {
        parts.push('\n⚠️ Quiz này không thuộc chương hoặc khóa học nào. Vui lòng liên kết quiz với một chương hoặc khóa học để AI có thể tạo câu hỏi dựa trên nội dung bài học.');
      }
    }
    
    // Thêm câu hỏi hiện có (nếu có) để AI tránh trùng lặp
    if (questions.length > 0) {
      parts.push('\n\n## Câu hỏi hiện có trong quiz (để tham khảo, tránh trùng lặp)');
      questions.forEach((q, idx) => {
        parts.push(`### Câu ${idx + 1}: ${q.question_text}`);
      });
    }
    
    const finalContent = parts.join('\n\n');
    
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('[ManageQuizModal] AI Source Content:', {
        isSectionLevel,
        isCourseLevel,
        hasSection: !!section,
        sectionTitle: section?.title,
        sectionId: section?.id,
        courseId: quiz?.course_id,
        sectionIdFromQuiz: quiz?.section_id,
        courseSectionsCount: courseSections.length,
        isLoadingCourseSections,
        lessonsCount: section?.lessons?.length || 0,
        lessonsWithContentCount: lessonsWithContent.length,
        isLoadingLessons,
        contentLength: finalContent.length,
        preview: finalContent.substring(0, 1000), // Tăng preview length để debug
        fullContent: finalContent // Log full content để debug
      });
    }
    
    return finalContent;
  }, [quiz, section, courseSections, questions, lessonsWithContent, isLoadingLessons, isLoadingCourseSections, isSectionLevel, isCourseLevel]);
  
  // Tính tổng điểm từ các câu hỏi hiện có, hoặc sử dụng totalPoints từ props
  // Nếu có quiz data, có thể lấy từ đó, hoặc tính từ tổng điểm các câu hỏi
  const calculatedTotalPoints = totalPoints || (questions.length > 0 
    ? questions.reduce((sum, q) => sum + (q.points || 0), 0)
    : 100);
  
  // Debug log
  console.log('[ManageQuizModal] Questions data:', {
    questionsData,
    questionsCount: questions.length,
    isArray: Array.isArray(questionsData),
    hasData: !!(questionsData as any)?.data,
    hasQuestions: !!(questionsData as any)?.questions,
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    // Dùng trực tiếp mutation; toast & cập nhật cache đã được xử lý trong hook useDeleteQuestion
    deleteQuestionMutation.mutate({ questionId, quizId });
  };

  const handleQuestionCreated = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    queryClient.invalidateQueries({ queryKey: ['instructor-quiz-questions', quizId] });
  };

  const handleUpdateQuiz = async (data: UpdateQuizData) => {
    try {
      await updateQuizMutation.mutateAsync({ quizId, data });
      toast.success('Đã cập nhật thông tin quiz thành công');
      setIsEditQuizOpen(false);
      refetchQuiz();
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', quizId] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật quiz');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa quiz này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setIsDeletingQuiz(true);
    try {
      await deleteQuizMutation.mutateAsync(quizId);
      toast.success('Đã xóa quiz thành công');
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa quiz');
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !isQuestionModalOpen && !isEditQuizOpen} onClose={onClose} title={`Quản lý: ${quiz?.title || quizTitle}`} size="lg">
        <ModalBody>
          <div className="space-y-6">
            {/* Loading state */}
            {isLoadingQuiz && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải thông tin quiz...</span>
              </div>
            )}

            {/* Quiz Info Section */}
            {!isLoadingQuiz && quiz && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title || 'Chưa có tiêu đề'}</h3>
                    {quiz.description && (
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => setIsEditQuizOpen(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={handleDeleteQuiz}
                      variant="danger"
                      size="sm"
                      className="gap-2"
                      disabled={isDeletingQuiz}
                    >
                      {isDeletingQuiz ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Xóa quiz
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.duration_minutes != null && Number(quiz.duration_minutes) > 0 
                        ? `${Number(quiz.duration_minutes)} phút` 
                        : 'Không giới hạn'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Điểm đạt</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.passing_score != null && Number(quiz.passing_score) > 0 
                        ? `${Number(quiz.passing_score).toFixed(0)}%` 
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Số lần làm</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.max_attempts != null && Number(quiz.max_attempts) > 0 
                        ? `${Number(quiz.max_attempts)} lần` 
                        : 'Không giới hạn'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.is_published ? (
                        <span className="text-green-600">Đã xuất bản</span>
                      ) : (
                        <span className="text-gray-500">Bản nháp</span>
                      )}
                    </p>
                  </div>
                </div>
                {/* Additional info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loại quiz</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.is_practice ? (
                        <span className="text-purple-600">Luyện tập</span>
                      ) : (
                        <span className="text-blue-600">Tính điểm</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Xáo trộn câu hỏi</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quiz.shuffle_questions ? 'Có' : 'Không'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error state - nếu không có quiz data */}
            {!isLoadingQuiz && !quiz && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">Không thể tải thông tin quiz. Vui lòng thử lại.</p>
              </div>
            )}

            {/* Header với nút thêm câu hỏi */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Danh sách câu hỏi</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tổng cộng: {questions.length} câu hỏi
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddQuestion} className="gap-2" variant="outline">
                  <Plus className="w-4 h-4" />
                  Thêm thủ công
                </Button>
              </div>
            </div>

            {/* AI Quiz Generator */}
            <AiQuizGenerator
              courseContent={aiSourceContent}
              onQuestionsGenerated={async (generated) => {
                if (!generated || generated.length === 0) return;

                try {
                  setIsImportingFromAI(true);

                  // Map câu hỏi từ AI sang CreateQuestionData để lưu trực tiếp vào quiz
                  const startOrder = questions.length;
                  const payloads: CreateQuestionData[] = generated.map(
                    (q: any, index: number): CreateQuestionData => {
                      const aiType: string = q.type || 'single_choice';
                      let question_type: CreateQuestionData['question_type'] = 'single_choice';

                      if (aiType === 'true_false') {
                        question_type = 'true_false';
                      } else if (aiType === 'multiple_choice') {
                        // Nhiều đáp án đúng
                        question_type = 'multiple_choice';
                      } else {
                        // Mặc định: 1 đáp án đúng
                        question_type = 'single_choice';
                      }

                      // Chuẩn hoá options: bỏ tiền tố "A. ", "B) ", "1) " nếu AI lỡ thêm
                      const rawOptionsInput: string[] = Array.isArray(q.options) ? q.options : [];
                      const rawOptions = rawOptionsInput.map((opt) => {
                        if (typeof opt !== 'string') return '';
                        const trimmed = opt.trim();
                        // Remove prefix patterns: "A. ", "B) ", "1. ", "1) "
                        const cleaned = trimmed.replace(/^[A-Z]\s*[\.\)]\s*/i, '').replace(/^[0-9]+\s*[\.\)]\s*/, '');
                        return cleaned.trim();
                      });
                      const correct = q.correctAnswer;

                      // Chuẩn hoá danh sách index đáp án đúng (0-based)
                      const correctIndexes: number[] = [];

                      const pushIndex = (idx: number) => {
                        if (!Number.isNaN(idx) && idx >= 0 && idx < rawOptions.length && !correctIndexes.includes(idx)) {
                          correctIndexes.push(idx);
                        }
                      };

                      if (Array.isArray(correct)) {
                        // multiple_choice: mảng index hoặc chữ cái
                        correct.forEach((item) => {
                          if (typeof item === 'number') {
                            pushIndex(item);
                          } else if (typeof item === 'string') {
                            const upper = item.trim().toUpperCase();
                            if (/^[0-9]+$/.test(upper)) {
                              pushIndex(Number(upper));
                            } else if (upper >= 'A' && upper <= 'Z') {
                              pushIndex(upper.charCodeAt(0) - 65);
                            }
                          }
                        });
                      } else if (typeof correct === 'number') {
                        pushIndex(correct);
                      } else if (typeof correct === 'string') {
                        // single_choice: 1 index hoặc 1 chữ cái
                        const upper = correct.trim().toUpperCase();
                        if (/^[0-9]+$/.test(upper)) {
                          pushIndex(Number(upper));
                        } else if (upper >= 'A' && upper <= 'Z') {
                          pushIndex(upper.charCodeAt(0) - 65);
                        }
                      }

                      const options =
                        rawOptions.length > 0
                          ? rawOptions.map((opt, optIdx) => ({
                              option_text: opt,
                              is_correct:
                                question_type === 'true_false'
                                  ? false
                                  : correctIndexes.includes(optIdx),
                              order_index: optIdx,
                            }))
                          : undefined;

                      return {
                        question_text: q.question || '',
                        question_type,
                        points: 1, // Mặc định 1 điểm, instructor có thể chỉnh sau
                        order_index: startOrder + index,
                        explanation: q.explanation,
                        options,
                      };
                    }
                  );

                  const created = await quizApi.bulkAddQuestions(quizId, payloads);

                  toast.success(`Đã thêm ${created.length} câu hỏi từ AI vào quiz`);
                  // Refetch danh sách câu hỏi để hiển thị ngay
                  queryClient.invalidateQueries({
                    queryKey: ['instructor-quiz-questions', quizId],
                  });
                } catch (error: any) {
                  console.error('[ManageQuizModal] Import AI questions error:', error);
                  toast.error(
                    error?.response?.data?.message ||
                      'Không thể thêm câu hỏi từ AI vào quiz. Vui lòng thử lại.'
                  );
                } finally {
                  setIsImportingFromAI(false);
                }
              }}
            />

            {/* Danh sách câu hỏi */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Chưa có câu hỏi nào</p>
                <Button onClick={handleAddQuestion} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Câu {index + 1}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {question.question_type === 'single_choice' 
                              ? 'Trắc nghiệm' 
                              : question.question_type === 'multiple_choice'
                              ? 'Nhiều đáp án'
                              : 'Đúng/Sai'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {question.points} điểm
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-2">
                          {question.question_text}
                        </p>
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-1 mt-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.id || `option-${question.id}-${optIndex}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                {option.is_correct ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className={option.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                  {option.option_text || option.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            Giải thích: {question.explanation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create/Edit Question Modal */}
      {isQuestionModalOpen && (
        <CreateQuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
          quizId={quizId}
          onQuestionCreated={handleQuestionCreated}
          orderIndex={questions.length}
          editingQuestion={editingQuestion}
          totalPoints={calculatedTotalPoints}
        />
      )}

      {/* Edit Quiz Modal */}
      {isEditQuizOpen && quiz && (
        <EditQuizModal
          isOpen={isEditQuizOpen}
          onClose={() => setIsEditQuizOpen(false)}
          quiz={quiz}
          onUpdate={handleUpdateQuiz}
        />
      )}
    </>
  );
}

/**
 * EditQuizModal - Modal để chỉnh sửa thông tin quiz
 */
interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: any;
  onUpdate: (data: UpdateQuizData) => Promise<void>;
}

function EditQuizModal({ isOpen, onClose, quiz, onUpdate }: EditQuizModalProps) {
  const [formData, setFormData] = useState<UpdateQuizData>({
    title: '',
    description: '',
    duration_minutes: 0,
    passing_score: 0,
    max_attempts: 0,
    shuffle_questions: false,
    show_correct_answers: true,
    is_published: false,
    is_practice: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && quiz) {
      // Convert tất cả giá trị sang đúng kiểu dữ liệu
      const duration = quiz.duration_minutes != null ? Number(quiz.duration_minutes) : 0;
      const passingScore = quiz.passing_score != null ? Number(quiz.passing_score) : 0;
      const maxAttempts = quiz.max_attempts != null ? Number(quiz.max_attempts) : 0;
      
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        duration_minutes: duration,
        passing_score: passingScore,
        max_attempts: maxAttempts,
        shuffle_questions: Boolean(quiz.shuffle_questions),
        show_correct_answers: quiz.show_correct_answers !== undefined ? Boolean(quiz.show_correct_answers) : true,
        is_published: Boolean(quiz.is_published),
        is_practice: Boolean(quiz.is_practice),
      });
    }
  }, [isOpen, quiz]);

  const handleInputChange = (field: keyof UpdateQuizData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error('Vui lòng nhập tiêu đề quiz');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(formData);
    } catch (error) {
      // Error đã được xử lý trong onUpdate
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa Quiz" size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tiêu đề quiz"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả quiz (tùy chọn)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Grid: Duration, Passing Score, Max Attempts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian (phút)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.duration_minutes ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                    handleInputChange('duration_minutes', val);
                  }}
                  placeholder="0 = không giới hạn"
                />
                <p className="text-xs text-gray-500 mt-1">0 = không giới hạn</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm đạt (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.passing_score ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                    handleInputChange('passing_score', val);
                  }}
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lần làm
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.max_attempts ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                    handleInputChange('max_attempts', val);
                  }}
                  placeholder="0 = không giới hạn"
                />
                <p className="text-xs text-gray-500 mt-1">0 = không giới hạn</p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.shuffle_questions || false}
                  onChange={(e) => handleInputChange('shuffle_questions', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Xáo trộn thứ tự câu hỏi</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_correct_answers !== false}
                  onChange={(e) => handleInputChange('show_correct_answers', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hiển thị đáp án đúng sau khi nộp bài</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Xuất bản quiz</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_practice || false}
                  onChange={(e) => handleInputChange('is_practice', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Bài luyện tập (không tính điểm)</span>
              </label>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

