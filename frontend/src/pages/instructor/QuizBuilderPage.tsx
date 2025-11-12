import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Eye, Trash2, Edit, GripVertical } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';

/**
 * QuizBuilderPage
 * 
 * Tạo/chỉnh sửa bài kiểm tra:
 * - Quiz info (title, description, time limit, attempts)
 * - Question management (add/edit/delete/reorder)
 * - Question types: Multiple Choice, True/False
 * - Answer options với correct marking
 * - Points configuration
 * - Vietnamese UI
 * 
 * NOTE: Essay questions NOT supported
 * - Backend ENUM only has: single_choice, multiple_choice, true_false
 * - Backend auto-grading system cannot handle essay questions
 * - Essay requires manual grading system (future enhancement)
 */

type QuestionType = 'multiple_choice' | 'true_false';

interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  type: QuestionType;
  question_text: string;
  points: number;
  answers: Answer[];
}

export function QuizBuilderPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!quizId;

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit_minutes: 60,
    max_attempts: 1,
    passing_score: 70,
  });

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Question form state
  const [questionForm, setQuestionForm] = useState<Question>({
    id: 0,
    type: 'multiple_choice',
    question_text: '',
    points: 10,
    answers: [
      { id: 1, text: '', is_correct: false },
      { id: 2, text: '', is_correct: false },
    ],
  });

  const questionTypeLabels: Record<QuestionType, string> = {
    multiple_choice: 'Nhiều lựa chọn',
    true_false: 'Đúng/Sai',
  };

  const handleAddQuestion = () => {
    setQuestionForm({
      id: Date.now(),
      type: 'multiple_choice',
      question_text: '',
      points: 10,
      answers: [
        { id: 1, text: '', is_correct: false },
        { id: 2, text: '', is_correct: false },
      ],
    });
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionForm({ ...question });
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? questionForm : q));
    } else {
      setQuestions([...questions, questionForm]);
    }
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Xóa câu hỏi này?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const handleAddAnswer = () => {
    setQuestionForm({
      ...questionForm,
      answers: [
        ...questionForm.answers,
        { id: Date.now(), text: '', is_correct: false },
      ],
    });
  };

  const handleRemoveAnswer = (answerId: number) => {
    if (questionForm.answers.length <= 2) {
      alert('Cần ít nhất 2 đáp án');
      return;
    }
    setQuestionForm({
      ...questionForm,
      answers: questionForm.answers.filter(a => a.id !== answerId),
    });
  };

  const handleUpdateAnswer = (answerId: number, text: string) => {
    setQuestionForm({
      ...questionForm,
      answers: questionForm.answers.map(a => 
        a.id === answerId ? { ...a, text } : a
      ),
    });
  };

  const handleToggleCorrect = (answerId: number) => {
    setQuestionForm({
      ...questionForm,
      answers: questionForm.answers.map(a => 
        a.id === answerId ? { ...a, is_correct: !a.is_correct } : a
      ),
    });
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    if (type === 'true_false') {
      setQuestionForm({
        ...questionForm,
        type,
        answers: [
          { id: 1, text: 'Đúng', is_correct: false },
          { id: 2, text: 'Sai', is_correct: false },
        ],
      });
    } else {
      // multiple_choice - keep existing answers or reset
      setQuestionForm({
        ...questionForm,
        type,
      });
    }
  };

  const handleSave = (action: 'draft' | 'publish') => {
    // TODO: Implement API call
    console.log('Save quiz:', action, { quizForm, questions });
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
          </h1>
          <p className="text-gray-600 mt-1">
            {totalPoints > 0 && `Tổng: ${questions.length} câu hỏi • ${totalPoints} điểm`}
          </p>
        </div>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài kiểm tra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Tiêu đề *"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            placeholder="VD: Kiểm tra giữa kỳ - React Hooks"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              placeholder="Mô tả về bài kiểm tra..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Thời gian (phút)"
              value={quizForm.time_limit_minutes}
              onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: Number(e.target.value) })}
              min={1}
            />

            <Input
              type="number"
              label="Số lần làm tối đa"
              value={quizForm.max_attempts}
              onChange={(e) => setQuizForm({ ...quizForm, max_attempts: Number(e.target.value) })}
              min={1}
            />

            <Input
              type="number"
              label="Điểm đạt (%)"
              value={quizForm.passing_score}
              onChange={(e) => setQuizForm({ ...quizForm, passing_score: Number(e.target.value) })}
              min={0}
              max={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Câu hỏi</CardTitle>
          <Button onClick={handleAddQuestion} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            Câu {idx + 1}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {questionTypeLabels[question.type]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {question.points} điểm
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{question.question_text}</p>
                        
                        {question.answers.length > 0 && (
                          <div className="space-y-1">
                            {question.answers.map((answer, ansIdx) => (
                              <div
                                key={answer.id}
                                className={`text-xs px-2 py-1 rounded flex items-center gap-2 ${
                                  answer.is_correct
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'bg-white text-gray-600'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + ansIdx)}.</span>
                                <span>{answer.text}</span>
                                {answer.is_correct && (
                                  <span className="ml-auto text-green-600">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>

            <div className="space-y-4">
              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại câu hỏi *
                </label>
                <div className="flex gap-3">
                  {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleQuestionTypeChange(type)}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        questionForm.type === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {questionTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu hỏi *
                </label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Points */}
              <Input
                type="number"
                label="Điểm *"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })}
                min={1}
                required
              />

              {/* Answers - Multiple Choice */}
              {questionForm.type === 'multiple_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Đáp án *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAnswer}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Thêm đáp án
                    </button>
                  </div>
                  <div className="space-y-2">
                    {questionForm.answers.map((answer, idx) => (
                      <div key={answer.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={answer.is_correct}
                          onChange={() => handleToggleCorrect(answer.id)}
                          className="w-4 h-4 text-green-600 rounded"
                          title="Đáp án đúng"
                        />
                        <span className="text-sm font-medium text-gray-600 w-6">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => handleUpdateAnswer(answer.id, e.target.value)}
                          placeholder="Nhập đáp án..."
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {questionForm.answers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAnswer(answer.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ Tick vào ô để đánh dấu đáp án đúng
                  </p>
                </div>
              )}

              {/* Answers - True/False */}
              {questionForm.type === 'true_false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đáp án đúng *
                  </label>
                  <div className="space-y-2">
                    {questionForm.answers.map((answer) => (
                      <label
                        key={answer.id}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          checked={answer.is_correct}
                          onChange={() => {
                            setQuestionForm({
                              ...questionForm,
                              answers: questionForm.answers.map(a => ({
                                ...a,
                                is_correct: a.id === answer.id,
                              })),
                            });
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {answer.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveQuestion}>
                  {editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.INSTRUCTOR.MY_COURSES)}
        >
          Hủy
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu nháp
          </Button>

          <Button onClick={() => handleSave('publish')} className="gap-2">
            <Eye className="w-4 h-4" />
            Xuất bản
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizBuilderPage;
