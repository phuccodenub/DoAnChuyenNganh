import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus, Trash2, Edit2, CheckCircle, XCircle, Settings, Save } from 'lucide-react';
import { quizApi, type Question, type UpdateQuizData } from '@/services/api/quiz.api';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInstructorQuizQuestions, useDeleteQuestion, useInstructorQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useInstructorQuiz';
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

  // Debug log để kiểm tra data
  useEffect(() => {
    if (isOpen) {
      console.log('[ManageQuizModal] Quiz data:', {
        quizData,
        quiz,
        quizId,
        hasQuiz: !!quiz,
        quizTitle: quiz?.title,
        duration_minutes: quiz?.duration_minutes,
        passing_score: quiz?.passing_score,
        max_attempts: quiz?.max_attempts,
        is_published: quiz?.is_published,
      });
    }
  }, [isOpen, quizData, quiz, quizId]);
  
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
              <Button onClick={handleAddQuestion} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm câu hỏi
              </Button>
            </div>

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

