import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { quizApi, type CreateQuestionData, type UpdateQuestionData, type Question } from '@/services/api/quiz.api';
import toast from 'react-hot-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useInstructorQuizQuestions, useUpdateQuestion, useAddQuestion } from '@/hooks/useInstructorQuiz';

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  onQuestionCreated?: () => void;
  orderIndex?: number;
  editingQuestion?: Question | null; // Nếu có, sẽ ở chế độ edit
  totalPoints?: number; // Tổng điểm của quiz để tính điểm tự động cho mỗi câu hỏi
}

/**
 * CreateQuestionModal
 * 
 * Modal để thêm câu hỏi mới vào quiz
 * Hỗ trợ: single_choice, multiple_choice, true_false
 */
export function CreateQuestionModal({
  isOpen,
  onClose,
  quizId,
  onQuestionCreated,
  orderIndex: initialOrderIndex,
  editingQuestion,
  totalPoints = 100, // Mặc định 100 điểm
}: CreateQuestionModalProps) {
  const queryClient = useQueryClient();
  // Chỉ fetch questions khi modal đang mở để tránh call 401/redirect khi đóng
  const effectiveQuizId = isOpen ? quizId : '';
  const { data: existingQuestionsData, isLoading: isLoadingQuestions } = useInstructorQuizQuestions(effectiveQuizId);
  const updateQuestionMutation = useUpdateQuestion();
  const addQuestionMutation = useAddQuestion();
  const [isCreating, setIsCreating] = useState(false);
  const isEditMode = !!editingQuestion;
  
  // Đảm bảo existingQuestions là array
  const existingQuestions = Array.isArray(existingQuestionsData) ? existingQuestionsData : [];
  
  // Tính orderIndex tự động dựa trên số câu hỏi hiện có
  const orderIndex = initialOrderIndex !== undefined ? initialOrderIndex : existingQuestions.length;
  
  // Tính điểm tự động: tổng điểm / (số câu hỏi hiện có + 1 câu mới)
  // Nếu đang edit, giữ nguyên điểm của câu hỏi đó
  const totalQuestions = isEditMode ? existingQuestions.length : existingQuestions.length + 1;
  const autoCalculatedPoints = totalQuestions > 0 ? totalPoints / totalQuestions : totalPoints;
  
  const [questionType, setQuestionType] = useState<'single_choice' | 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'>('single_choice');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: '1', option_text: '', is_correct: false },
    { id: '2', option_text: '', is_correct: false },
  ]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'true' | 'false'>('true');

  // Reset form when modal opens/closes or load editing question
  useEffect(() => {
    if (isOpen) {
      if (editingQuestion) {
        // Load data from editing question
        setQuestionType(editingQuestion.question_type);
        setQuestionText(editingQuestion.question_text);
        setExplanation(editingQuestion.explanation || '');
        
        if (editingQuestion.question_type === 'true_false') {
          // Tìm đáp án đúng cho true/false
          const correctOption = editingQuestion.options?.find(opt => opt.is_correct);
          setTrueFalseAnswer(correctOption?.option_text === 'Đúng' || correctOption?.text === 'Đúng' ? 'true' : 'false');
        } else {
          // Load options
          setOptions(
            editingQuestion.options?.map((opt, idx) => ({
              id: opt.id || idx.toString(),
              option_text: opt.option_text || opt.text || '',
              is_correct: opt.is_correct || false,
            })) || [
              { id: '1', option_text: '', is_correct: false },
              { id: '2', option_text: '', is_correct: false },
            ]
          );
        }
      } else {
        // Reset form for new question
        // Tính lại điểm tự động dựa trên số câu hỏi hiện có
        const newTotalQuestions = existingQuestions.length + 1;
        const newAutoPoints = newTotalQuestions > 0 ? totalPoints / newTotalQuestions : totalPoints;
        
        setQuestionType('single_choice');
        setQuestionText('');
        setExplanation('');
        setOptions([
          { id: '1', option_text: '', is_correct: false },
          { id: '2', option_text: '', is_correct: false },
        ]);
        setTrueFalseAnswer('true');
      }
    }
  }, [isOpen, editingQuestion, existingQuestions.length, totalPoints]);

  // Update options when question type changes
  useEffect(() => {
    if (questionType === 'true_false') {
      // True/False chỉ cần 2 options cố định
      setOptions([
        { id: 'true', option_text: 'Đúng', is_correct: trueFalseAnswer === 'true' },
        { id: 'false', option_text: 'Sai', is_correct: trueFalseAnswer === 'false' },
      ]);
    } else if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      // Đảm bảo có ít nhất 2 options
      if (options.length < 2) {
        setOptions([
          { id: '1', option_text: '', is_correct: false },
          { id: '2', option_text: '', is_correct: false },
        ]);
      }
    }
  }, [questionType, trueFalseAnswer]);

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now().toString(), option_text: '', is_correct: false }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error('Cần ít nhất 2 đáp án');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id: string, field: 'option_text' | 'is_correct', value: string | boolean) => {
    setOptions(options.map(opt => {
      if (opt.id === id) {
        const updated = { ...opt, [field]: value };
        // Nếu là single_choice và đánh dấu đúng, bỏ chọn các options khác
        if (field === 'is_correct' && value === true && questionType === 'single_choice') {
          return updated;
        }
        return updated;
      }
      // Nếu là single_choice và đánh dấu đúng, bỏ chọn option hiện tại
      if (field === 'is_correct' && value === true && questionType === 'single_choice') {
        return { ...opt, is_correct: false };
      }
      return opt;
    }));
  };

  const handleTrueFalseChange = (value: 'true' | 'false') => {
    setTrueFalseAnswer(value);
    setOptions([
      { id: 'true', option_text: 'Đúng', is_correct: value === 'true' },
      { id: 'false', option_text: 'Sai', is_correct: value === 'false' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent, shouldCloseAfterSubmit = false) => {
    if (e) {
      e.preventDefault();
    }

    if (!questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (questionType !== 'true_false') {
      // Validate options
      if (options.some(opt => !opt.option_text.trim())) {
        toast.error('Vui lòng điền đầy đủ các đáp án');
        return;
      }

      if (!options.some(opt => opt.is_correct)) {
        toast.error('Vui lòng chọn ít nhất 1 đáp án đúng');
        return;
      }

      if (questionType === 'single_choice' && options.filter(opt => opt.is_correct).length > 1) {
        toast.error('Câu hỏi trắc nghiệm chỉ có 1 đáp án đúng');
        return;
      }
    }

    setIsCreating(true);
    try {
      // Note: addQuestionMutation và updateQuestionMutation đã tự động invalidate queries và show toast
      if (isEditMode && editingQuestion) {
        // Update existing question
        const updateData: UpdateQuestionData = {
          question_text: questionText,
          question_type: questionType,
          explanation: explanation || undefined,
          options: questionType === 'true_false' 
            ? [
                { option_text: 'Đúng', is_correct: trueFalseAnswer === 'true', order_index: 0 },
                { option_text: 'Sai', is_correct: trueFalseAnswer === 'false', order_index: 1 },
              ]
            : options.map((opt, idx) => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                order_index: idx,
              })),
        };

        await updateQuestionMutation.mutateAsync({
          questionId: editingQuestion.id,
          quizId,
          data: updateData,
        });
        
        // Call callback
        if (onQuestionCreated) {
          onQuestionCreated();
        }
        
        // Đóng modal sau khi update
        onClose();
      } else {
        // Create new question
        const questionData: CreateQuestionData = {
          question_text: questionText,
          question_type: questionType,
          order_index: orderIndex,
          explanation: explanation || undefined,
          options: questionType === 'true_false' 
            ? [
                { option_text: 'Đúng', is_correct: trueFalseAnswer === 'true', order_index: 0 },
                { option_text: 'Sai', is_correct: trueFalseAnswer === 'false', order_index: 1 },
              ]
            : options.map((opt, idx) => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                order_index: idx,
              })),
        };

        await addQuestionMutation.mutateAsync({ quizId, data: questionData });
        
        // Call callback
        if (onQuestionCreated) {
          onQuestionCreated();
        }
        
        // Nếu shouldCloseAfterSubmit = true, đóng modal
        if (shouldCloseAfterSubmit) {
          onClose();
        } else {
          // Reset form để thêm câu hỏi tiếp theo (không đóng modal)
          // Tính lại điểm tự động cho câu hỏi tiếp theo (số câu hỏi đã tăng lên 1)
          const updatedQuestions = existingQuestions.length + 1;
          const newAutoPoints = updatedQuestions > 0 ? totalPoints / updatedQuestions : totalPoints;
          
          setQuestionText('');
          setExplanation('');
          if (questionType === 'true_false') {
            setTrueFalseAnswer('true');
          } else {
            setOptions([
              { id: '1', option_text: '', is_correct: false },
              { id: '2', option_text: '', is_correct: false },
            ]);
          }
        }
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} question:`, error);
      toast.error(error?.response?.data?.message || `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} câu hỏi`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    // Nếu có dữ liệu, submit và đóng modal
    if (questionText.trim()) {
      // Tạo một synthetic event để submit
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent, true);
    } else {
      // Nếu không có dữ liệu, chỉ đóng modal
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-6">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại câu hỏi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  key="single_choice"
                  type="button"
                  onClick={() => setQuestionType('single_choice')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    questionType === 'single_choice'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={isCreating}
                >
                  Trắc nghiệm
                </button>
                <button
                  key="multiple_choice"
                  type="button"
                  onClick={() => setQuestionType('multiple_choice')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    questionType === 'multiple_choice'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={isCreating}
                >
                  Nhiều đáp án
                </button>
                <button
                  key="true_false"
                  type="button"
                  onClick={() => setQuestionType('true_false')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    questionType === 'true_false'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={isCreating}
                >
                  Đúng/Sai
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung câu hỏi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Nhập nội dung câu hỏi"
                rows={3}
                required
                disabled={isCreating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Points */}
            

            {/* True/False Answer */}
            {questionType === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đáp án đúng <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    key="true"
                    type="button"
                    onClick={() => handleTrueFalseChange('true')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      trueFalseAnswer === 'true'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isCreating}
                  >
                    Đúng
                  </button>
                  <button
                    key="false"
                    type="button"
                    onClick={() => handleTrueFalseChange('false')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      trueFalseAnswer === 'false'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isCreating}
                  >
                    Sai
                  </button>
                </div>
              </div>
            )}

            {/* Options for single_choice and multiple_choice */}
            {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Đáp án <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={isCreating}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm đáp án
                  </Button>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <input
                          type={questionType === 'multiple_choice' ? 'checkbox' : 'radio'}
                          checked={option.is_correct}
                          onChange={(e) => handleOptionChange(option.id, 'is_correct', e.target.checked)}
                          disabled={isCreating}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <Input
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(option.id, 'option_text', e.target.value)}
                        placeholder={`Đáp án ${index + 1}`}
                        disabled={isCreating}
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option.id)}
                          disabled={isCreating}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {option.is_correct && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {questionType === 'single_choice' 
                    ? 'Chọn 1 đáp án đúng' 
                    : 'Có thể chọn nhiều đáp án đúng'}
                </p>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label htmlFor="question-explanation" className="block text-sm font-medium text-gray-700 mb-2">
                Giải thích (tùy chọn)
              </label>
              <textarea
                id="question-explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Nhập giải thích cho đáp án đúng (sẽ hiển thị sau khi học viên nộp bài)"
                rows={2}
                disabled={isCreating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleComplete}
            disabled={isCreating}
          >
            Hoàn thành
          </Button>
          <Button
            type="submit"
            disabled={isCreating || !questionText.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang thêm...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {isEditMode ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

