import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus } from 'lucide-react';
import { quizApi, type CreateQuizData } from '@/services/api/quiz.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateRoute } from '@/constants/routes';
import { CreateQuestionModal } from './CreateQuestionModal';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  sectionId?: string;
  lessonId?: string;
  onQuizCreated?: (quizId: string, title: string) => void | Promise<void>; // Cho phép async
  createdQuizId?: string; // Nếu đã có quizId, chỉ thêm câu hỏi
}

/**
 * CreateQuizModal
 * 
 * Modal để tạo quiz mới với các thông tin cơ bản
 * Sau khi tạo, có thể redirect đến QuizBuilderPage để thêm questions
 */
export function CreateQuizModal({
  isOpen,
  onClose,
  courseId,
  sectionId,
  lessonId,
  onQuizCreated,
  createdQuizId,
}: CreateQuizModalProps) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(createdQuizId || null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateQuizData>({
    title: '',
    description: '',
    // Nếu có sectionId, không truyền course_id (quiz sẽ gắn với section)
    course_id: sectionId ? undefined : courseId,
    section_id: sectionId,
    duration_minutes: 30,
    passing_score: 70,
    max_attempts: 0, // 0 = không giới hạn (mặc định)
    shuffle_questions: false,
    show_correct_answers: true,
    is_published: false,
    is_practice: false, // Mặc định là Graded Quiz
  });
  // Tổng điểm mặc định của quiz (100 điểm) - dùng để tính điểm tự động cho mỗi câu hỏi
  const DEFAULT_TOTAL_POINTS = 100;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (createdQuizId) {
        // Nếu đã có quizId, chỉ cần mở modal thêm câu hỏi
        setCurrentQuizId(createdQuizId);
        setIsQuestionModalOpen(true);
      } else {
        setFormData({
          title: '',
          description: '',
          // Nếu có lessonId hoặc sectionId (sẽ tạo lesson sau), không truyền course_id
          course_id: (lessonId || sectionId) ? undefined : courseId,
          lesson_id: lessonId,
          duration_minutes: 30,
          passing_score: 70,
          max_attempts: 0, // 0 = không giới hạn (mặc định)
          shuffle_questions: false,
          show_correct_answers: true,
          is_published: false,
          is_practice: false, // Mặc định là Graded Quiz
        });
        setCurrentQuizId(null);
      }
    }
  }, [isOpen, courseId, lessonId, sectionId, createdQuizId]);

  const handleInputChange = (field: keyof CreateQuizData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề quiz');
      return;
    }

    setIsCreating(true);
    try {
      // Logic tạo Quiz:
      // 1. Nếu có sectionId (tạo từ section), gửi section_id, không gửi course_id
      // 2. Nếu không có sectionId (tạo cấp course), gửi course_id, không gửi section_id
      const finalCourseId = sectionId ? undefined : (formData.course_id || courseId);
      const finalSectionId = sectionId || formData.section_id || undefined;

      const payload: CreateQuizData = {
        ...formData,
        // Đảm bảo XOR: 
        // - Nếu có sectionId, chỉ gửi section_id, không gửi course_id
        // - Nếu không có sectionId, gửi course_id (quiz cấp course)
        ...(finalCourseId !== undefined ? { course_id: finalCourseId } : {}),
        ...(finalSectionId !== undefined ? { section_id: finalSectionId } : {}),
      };

      console.log('[CreateQuizModal] Creating quiz with payload:', {
        payload,
        sectionId,
        courseId,
        formData,
      });

      const newQuiz = await quizApi.createQuiz(payload);
      
      console.log('[CreateQuizModal] Quiz created:', {
        newQuiz,
        quizId: newQuiz.id,
        hasQuizId: !!newQuiz.id,
        hasSectionId: !!newQuiz.section_id,
        hasCourseId: !!newQuiz.course_id,
      });
      
      // Validate quizId
      if (!newQuiz.id) {
        console.error('[CreateQuizModal] newQuiz.id is undefined!', newQuiz);
        toast.error('Đã tạo quiz nhưng không thể lấy ID của quiz');
        return;
      }
      
      toast.success('Đã tạo quiz thành công!');
      
      // Call callback if provided - đảm bảo title được truyền đúng
      // Nếu có sectionId, đợi callback hoàn thành (tạo lesson và update quiz) trước khi mở modal
      if (onQuizCreated) {
        const quizTitle = newQuiz.title || formData.title || 'Bài kiểm tra';
        console.log('[CreateQuizModal] Calling onQuizCreated with:', { quizId: newQuiz.id, quizTitle });
        
        if (sectionId) {
          // Nếu tạo từ Section, đợi callback hoàn thành (tạo lesson và link quiz) trước khi mở modal
          await onQuizCreated(newQuiz.id, quizTitle);
        } else {
          // Nếu không có sectionId, gọi callback nhưng không đợi
          onQuizCreated(newQuiz.id, quizTitle);
        }
      }
      
      // Set current quiz ID và mở modal thêm câu hỏi
      setCurrentQuizId(newQuiz.id);
      setIsQuestionModalOpen(true);
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo quiz');
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuestionCreated = () => {
    // Sau khi thêm câu hỏi, có thể đóng modal hoặc tiếp tục thêm
    // Có thể để người dùng quyết định
  };

  const handleFinishAddingQuestions = () => {
    setIsQuestionModalOpen(false);
    onClose();
    // Redirect to QuizBuilderPage để quản lý quiz
    if (currentQuizId) {
      navigate(generateRoute.instructor.quizCreate(courseId), {
        state: { quizId: currentQuizId, sectionId },
      });
    }
  };

  // Nếu đã có quizId và chỉ cần thêm câu hỏi
  if (createdQuizId && isOpen) {
    return (
      <CreateQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          onClose();
        }}
        quizId={createdQuizId}
        onQuestionCreated={handleQuestionCreated}
        totalPoints={DEFAULT_TOTAL_POINTS}
      />
    );
  }

  return (
    <>
      <Modal isOpen={isOpen && !isQuestionModalOpen} onClose={onClose} title="Tạo bài kiểm tra mới" size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  id="quiz-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài kiểm tra"
                  required
                  disabled={isCreating}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="quiz-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  id="quiz-description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Nhập mô tả bài kiểm tra (tùy chọn)"
                  rows={3}
                  disabled={isCreating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <label htmlFor="quiz-duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút)
                  </label>
                  <Input
                    id="quiz-duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes || 30}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 30)}
                    disabled={isCreating}
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label htmlFor="quiz-passing-score" className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm đạt (%)
                  </label>
                  <Input
                    id="quiz-passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score || 70}
                    onChange={(e) => handleInputChange('passing_score', parseInt(e.target.value) || 70)}
                    disabled={isCreating}
                  />
                </div>

                {/* Max Attempts */}
                <div>
                  <label htmlFor="quiz-max-attempts" className="block text-sm font-medium text-gray-700 mb-2">
                    Số lần làm tối đa
                  </label>
                  <Input
                    id="quiz-max-attempts"
                    type="number"
                    min="0"
                    value={formData.max_attempts ?? 0}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      handleInputChange('max_attempts', value);
                    }}
                    disabled={isCreating}
                    placeholder="0 = không giới hạn"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.max_attempts === 0 || !formData.max_attempts 
                      ? 'Không giới hạn số lần làm bài' 
                      : `Học viên có thể làm tối đa ${formData.max_attempts} lần`}
                  </p>
                </div>

              </div>

              {/* Quiz Type: Practice vs Graded */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại bài kiểm tra
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="quiz-type"
                      value="graded"
                      checked={!formData.is_practice}
                      onChange={() => handleInputChange('is_practice', false)}
                      disabled={isCreating}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Bài kiểm tra tính điểm</div>
                      <div className="text-xs text-gray-500">Điểm số sẽ được tính vào tổng kết khóa học</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="quiz-type"
                      value="practice"
                      checked={formData.is_practice === true}
                      onChange={() => handleInputChange('is_practice', true)}
                      disabled={isCreating}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Bài luyện tập</div>
                      <div className="text-xs text-gray-500">Không tính điểm, có thể làm nhiều lần</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quiz-shuffle-questions"
                    checked={formData.shuffle_questions || false}
                    onChange={(e) => handleInputChange('shuffle_questions', e.target.checked)}
                    disabled={isCreating}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label htmlFor="quiz-shuffle-questions" className="text-sm text-gray-700 cursor-pointer">
                    Xáo trộn thứ tự câu hỏi
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quiz-show-correct-answers"
                    checked={formData.show_correct_answers !== false}
                    onChange={(e) => handleInputChange('show_correct_answers', e.target.checked)}
                    disabled={isCreating}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label htmlFor="quiz-show-correct-answers" className="text-sm text-gray-700 cursor-pointer">
                    Hiển thị đáp án đúng sau khi nộp bài
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quiz-published"
                    checked={formData.is_published || false}
                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                    disabled={isCreating}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label htmlFor="quiz-published" className="text-sm text-gray-700 cursor-pointer">
                    Xuất bản ngay
                  </label>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.title.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo và thêm câu hỏi
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Question Modal - Mở sau khi tạo quiz */}
      {currentQuizId && (
        <CreateQuestionModal
          isOpen={isQuestionModalOpen}
          onClose={handleFinishAddingQuestions}
          quizId={currentQuizId}
          onQuestionCreated={() => {
            // Sau khi thêm câu hỏi, có thể tiếp tục thêm hoặc đóng
            // Modal sẽ không tự đóng, người dùng phải click "Hủy" hoặc "Hoàn thành"
          }}
          totalPoints={DEFAULT_TOTAL_POINTS}
        />
      )}
    </>
  );
}

