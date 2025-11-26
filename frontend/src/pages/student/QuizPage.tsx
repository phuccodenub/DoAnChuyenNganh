import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuiz, useQuizQuestions, useStartQuiz, useSubmitAnswer, useSubmitQuiz, useCurrentAttempt } from '@/hooks/useQuizData';
import { ROUTES } from '@/constants/routes';

/**
 * QuizPage - Student
 * 
 * Student làm bài kiểm tra:
 * - Quiz info display
 * - Start quiz button
 * - Question display with navigation
 * - Answer selection (radio/checkbox/textarea)
 * - Timer countdown
 * - Submit confirmation
 * - Auto-submit when time's up
 * - Vietnamese UI
 */

interface Answer {
  questionId: string;
  answer: string | string[];
}

export function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId!);
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(quizId!);
  const { data: currentAttempt } = useCurrentAttempt(quizId!);
  
  const startQuizMutation = useStartQuiz();
  const submitAnswerMutation = useSubmitAnswer();
  const submitQuizMutation = useSubmitQuiz();

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Initialize from current attempt if exists
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === 'in_progress') {
      setQuizStarted(true);
      setAttemptId(currentAttempt.id);
      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - new Date(currentAttempt.started_at).getTime()) / 1000);
      const remaining = (quiz?.duration_minutes || 0) * 60 - elapsed;
      setTimeRemaining(Math.max(0, remaining));
    }
  }, [currentAttempt, quiz]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const handleStartQuiz = async () => {
    try {
      const attempt = await startQuizMutation.mutateAsync(quizId!);
      setAttemptId(attempt.id);
      setQuizStarted(true);
      setTimeRemaining((quiz?.duration_minutes || 60) * 60);
      setAnswers([]);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert('Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { questionId, answer } : a);
      }
      return [...prev, { questionId, answer }];
    });

    // Auto-save answer
    if (attemptId) {
      submitAnswerMutation.mutate({
        attemptId,
        questionId,
        answer,
      });
    }
  };

  const getCurrentAnswer = (questionId: string): string | string[] => {
    return answers.find(a => a.questionId === questionId)?.answer || '';
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitClick = () => {
    const unanswered = questions?.filter(q => !answers.find(a => a.questionId === q.id)).length || 0;
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
      return;
    }
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId) return;

    try {
      const result = await submitQuizMutation.mutateAsync(attemptId);
      navigate(`/student/quizzes/${attemptId}/results`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Không thể nộp bài. Vui lòng thử lại.');
    }
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) return;
    try {
      await submitQuizMutation.mutateAsync(attemptId);
      alert('Hết giờ! Bài kiểm tra đã được nộp tự động.');
      navigate(`/student/quizzes/${attemptId}/results`);
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !questions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy bài kiểm tra</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    const attemptsUsed = currentAttempt ? 1 : 0; // TODO: Get from API
    const attemptsRemaining = quiz.max_attempts - attemptsUsed;

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.description && (
              <p className="text-gray-700">{quiz.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-semibold text-gray-900">{quiz.duration_minutes} phút</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số câu hỏi</p>
                <p className="font-semibold text-gray-900">{questions.length} câu</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm đạt</p>
                <p className="font-semibold text-gray-900">{quiz.passing_score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lần làm còn lại</p>
                <p className="font-semibold text-gray-900">{attemptsRemaining}/{quiz.max_attempts}</p>
              </div>
            </div>

            {attemptsRemaining <= 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Bạn đã hết lượt làm bài kiểm tra này.</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Lưu ý:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Bài kiểm tra sẽ được nộp tự động khi hết giờ</li>
                        <li>Câu trả lời được lưu tự động</li>
                        <li>Không thể quay lại sau khi nộp bài</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleStartQuiz}
                  disabled={startQuizMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {startQuizMutation.isPending ? 'Đang bắt đầu...' : 'Bắt đầu làm bài'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz taking screen
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Timer & Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}`} />
                <span className={`font-semibold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Câu {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>
            <Button 
              onClick={handleSubmitClick}
              variant="outline"
              disabled={submitQuizMutation.isPending}
            >
              Nộp bài
            </Button>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="flex-1">
              Câu {currentQuestionIndex + 1}: {currentQuestion.question_text}
            </CardTitle>
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded">
              {currentQuestion.points} điểm
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Multiple Choice / True False */}
          {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
            <div className="space-y-3">
              {currentQuestion.options?.map((answer: any, idx: number) => {
                const currentAnswer = getCurrentAnswer(currentQuestion.id);
                const isSelected = currentQuestion.question_type === 'multiple_choice'
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(answer.id.toString())
                  : currentAnswer === answer.id.toString();

                return (
                  <label
                    key={answer.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type={currentQuestion.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                      checked={isSelected}
                      onChange={(e) => {
                        if (currentQuestion.question_type === 'multiple_choice') {
                          const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                          const newAnswer = e.target.checked
                            ? [...current, answer.id.toString()]
                            : current.filter(id => id !== answer.id.toString());
                          handleAnswerChange(currentQuestion.id, newAnswer);
                        } else {
                          handleAnswerChange(currentQuestion.id, answer.id.toString());
                        }
                      }}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="ml-2 text-gray-900">{answer.text}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Essay */}
          {currentQuestion.question_type === 'essay' && (
            <div>
              <textarea
                value={getCurrentAnswer(currentQuestion.id) as string}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Câu hỏi tự luận sẽ được giảng viên chấm thủ công
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Câu trước
        </Button>

        <div className="text-sm text-gray-600">
          {answers.length}/{questions.length} câu đã trả lời
        </div>

        <Button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="gap-2"
        >
          Câu sau
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận nộp bài</h3>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể thay đổi câu trả lời sau khi nộp.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitQuizMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={submitQuizMutation.isPending}
              >
                {submitQuizMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
