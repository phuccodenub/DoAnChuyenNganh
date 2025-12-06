import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, FileText, Target, RotateCcw, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQuiz, useQuizQuestions, useStartQuiz, useSubmitQuiz, useCurrentAttempt, useQuizAttempt, useQuizAttempts } from '@/hooks/useQuizData';
import { useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/services/api/quiz.api';
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
  const { data: allAttempts } = useQuizAttempts(quizId!); // Lấy tất cả attempts để tính số lần đã làm
  
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();
  const queryClient = useQueryClient();

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Convert duration_minutes để kiểm tra có giới hạn thời gian không
  const durationMinutes = quiz?.duration_minutes != null ? Number(quiz.duration_minutes) : 0;
  const hasTimeLimit = durationMinutes > 0;

  // Initialize from current attempt if exists
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === 'in_progress') {
      setQuizStarted(true);
      setAttemptId(currentAttempt.id);
      if (hasTimeLimit) {
        // Calculate remaining time only when có giới hạn
        const elapsed = Math.floor(
          (Date.now() - new Date(currentAttempt.started_at).getTime()) / 1000
        );
        const remaining = durationMinutes * 60 - elapsed;
        setTimeRemaining(Math.max(0, remaining));
      } else {
        setTimeRemaining(0);
      }
    }
  }, [currentAttempt, quiz, hasTimeLimit, durationMinutes]);

  // Timer countdown (chỉ chạy khi có giới hạn thời gian)
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0 || !hasTimeLimit) return;

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
  }, [quizStarted, timeRemaining, hasTimeLimit]);

  const handleStartQuiz = async () => {
    try {
      const attempt = await startQuizMutation.mutateAsync(quizId!);
      setAttemptId(attempt.id);
      setQuizStarted(true);
      if (hasTimeLimit) {
        setTimeRemaining(durationMinutes * 60);
      } else {
        setTimeRemaining(0);
      }
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
    const effectiveAttemptId = attemptId || currentAttempt?.id;

    if (!effectiveAttemptId) {
      console.error('[QuizPage] No attemptId found when submitting quiz', {
        attemptId,
        currentAttempt,
      });
      alert('Không tìm thấy lượt làm bài để nộp. Vui lòng tải lại trang và thử lại.');
      return;
    }

    try {
      // Convert local answers thành array QuizAnswerDto để gửi lên BE
      const answersPayload = (questions || [])
        .map((q) => {
          const ans = answers.find((a) => a.questionId === q.id)?.answer;
          if (!ans) return null;

          if (q.question_type === 'multiple_choice') {
            const selected = Array.isArray(ans) ? ans.map(String) : [String(ans)];
            return {
              question_id: q.id,
              selected_options: selected,
            };
          }

          // single_choice / true_false
          const selectedId = Array.isArray(ans) ? String(ans[0]) : String(ans);
          return {
            question_id: q.id,
            selected_option_id: selectedId,
          };
        })
        .filter(Boolean) as {
          question_id: string;
          selected_option_id?: string;
          selected_options?: string[];
        }[];

      await submitQuizMutation.mutateAsync({
        attemptId: effectiveAttemptId,
        answers: answersPayload,
      });

      // Invalidate queries để refetch attempts list
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'current-attempt'] });

      // Prefetch đầy đủ data cho results page trước khi navigate
      await queryClient.prefetchQuery({
        queryKey: ['quiz-attempts', effectiveAttemptId],
        queryFn: () => quizApi.getAttempt(effectiveAttemptId),
        staleTime: 0, // Force refetch để lấy data mới nhất
      });

      navigate(ROUTES.STUDENT.QUIZ_RESULTS.replace(':attemptId', effectiveAttemptId));
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Không thể nộp bài. Vui lòng thử lại.');
    }
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) return;
    try {
      const answersPayload = (questions || [])
        .map((q) => {
          const ans = answers.find((a) => a.questionId === q.id)?.answer;
          if (!ans) return null;

          if (q.question_type === 'multiple_choice') {
            const selected = Array.isArray(ans) ? ans.map(String) : [String(ans)];
            return {
              question_id: q.id,
              selected_options: selected,
            };
          }

          const selectedId = Array.isArray(ans) ? String(ans[0]) : String(ans);
          return {
            question_id: q.id,
            selected_option_id: selectedId,
          };
        })
        .filter(Boolean) as {
          question_id: string;
          selected_option_id?: string;
          selected_options?: string[];
        }[];

      await submitQuizMutation.mutateAsync({
        attemptId,
        answers: answersPayload,
      });

      // Invalidate queries để refetch attempts list
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'current-attempt'] });

      // Prefetch đầy đủ data cho results page trước khi navigate
      await queryClient.prefetchQuery({
        queryKey: ['quiz-attempts', attemptId],
        queryFn: () => quizApi.getAttempt(attemptId),
        staleTime: 0, // Force refetch để lấy data mới nhất
      });

      alert('Hết giờ! Bài kiểm tra đã được nộp tự động.');
      navigate(ROUTES.STUDENT.QUIZ_RESULTS.replace(':attemptId', attemptId));
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
    // Lấy số lần đã làm từ API (chỉ tính các attempts đã submit, không tính in_progress)
    // Đếm số lần đã làm (đã submit hoặc đã graded)
    // Kiểm tra cả status và submitted_at để đảm bảo chính xác
    const submittedAttempts = allAttempts 
      ? allAttempts.filter((a: any) => {
          // Nếu có submitted_at thì đã submit
          if (a.submitted_at != null) return true;
          // Hoặc nếu có status là submitted/graded
          if (a.status === 'submitted' || a.status === 'graded') return true;
          return false;
        })
      : [];
    
    const attemptsUsed = submittedAttempts.length;
    
    // Tìm attempt đã submit gần nhất để hiển thị nút "Xem kết quả"
    const latestSubmittedAttempt = submittedAttempts.length > 0
      ? submittedAttempts.sort((a: any, b: any) => {
          const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
          const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
          return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
        })[0]
      : null;
    
    // Convert và xử lý dữ liệu từ API (có thể là string hoặc number)
    // Đảm bảo lấy đúng từ quiz object
    const durationMinutes = quiz?.duration_minutes != null ? Number(quiz.duration_minutes) : 0;
    const passingScore = quiz?.passing_score != null ? Number(quiz.passing_score) : 0;
    const maxAttempts = quiz?.max_attempts != null ? Number(quiz.max_attempts) : 0;
    
    const attemptsRemaining =
      !quiz?.is_practice && maxAttempts > 0 ? Math.max(0, maxAttempts - attemptsUsed) : null;

    const durationLabel =
      durationMinutes > 0
        ? `${durationMinutes} phút`
        : 'Không giới hạn thời gian';

    const passingScoreLabel =
      passingScore > 0
        ? `${Math.round(passingScore)}%`
        : quiz?.is_practice
          ? 'Không áp dụng'
          : '-';

    // Tính tổng điểm từ questions, đảm bảo format đúng
    const totalPoints = (questions || []).reduce((sum, q) => {
      const points = q.points != null ? Number(q.points) : 0;
      return sum + points;
    }, 0);

    return (
      <div className="min-h-screen bg-gray-50/50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header - No background */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-gray-600 text-base leading-relaxed">
                {quiz.description}
              </p>
            )}
          </div>

          {/* Practice Quiz Notice */}
            {quiz.is_practice && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">Bài luyện tập</p>
                    <p className="text-amber-800">
                      Bài kiểm tra này không tính điểm vào tổng kết khóa học. Bạn có thể làm nhiều lần để luyện tập.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

          {/* Quiz Information Card */}
          <Card className="mb-6 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Thông tin bài kiểm tra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thời gian */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Thời gian
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {durationLabel}
                    </p>
                  </div>
                </div>

                {/* Số câu hỏi */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Số câu hỏi
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {questions?.length || 0} câu
                    </p>
                  </div>
                </div>

                {/* Tổng điểm */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
              </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Tổng điểm
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {totalPoints.toFixed(2)} điểm
                </p>
              </div>
                </div>

                {/* Điểm đạt */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
              </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Điểm đạt
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {passingScoreLabel}
                </p>
              </div>
            </div>

                {/* Lần làm còn lại */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 sm:col-span-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Lần làm còn lại
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {quiz.is_practice || !maxAttempts
                        ? 'Không giới hạn'
                        : attemptsRemaining !== null
                          ? `${attemptsRemaining} / ${maxAttempts} lần`
                          : 'Không giới hạn'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - hiển thị nút Xem kết quả nếu đã có attempt đã submit */}
          {latestSubmittedAttempt && (
            <div className="mb-6">
              <Button 
                onClick={() => {
                  navigate(ROUTES.STUDENT.QUIZ_RESULTS.replace(':attemptId', latestSubmittedAttempt.id));
                }}
                variant="outline"
                className="w-full h-14 text-base font-semibold border-2 hover:bg-gray-50 transition-colors"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Xem kết quả
                </span>
              </Button>
            </div>
          )}

          {/* Important Notes */}
          {(!quiz.is_practice && maxAttempts > 0 && (attemptsRemaining ?? 0) <= 0) ? (
            <Card className="mb-6 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-semibold">Bạn đã hết lượt làm bài kiểm tra này.</p>
                    <p className="text-red-800 mt-1">
                      Vui lòng liên hệ giảng viên nếu bạn cần thêm lượt làm bài.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            ) : (
              <>
              <Card className="mb-6 border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                      <ul className="space-y-1.5 text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Bài kiểm tra sẽ được nộp tự động khi hết giờ (nếu có giới hạn thời gian)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Câu trả lời được lưu tự động khi bạn chuyển câu hỏi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Không thể quay lại chỉnh sửa sau khi đã nộp bài</span>
                        </li>
                        {quiz.shuffle_questions && (
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Thứ tự câu hỏi được xáo trộn ngẫu nhiên</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nút Bắt đầu làm bài - hiển thị nếu còn lượt hoặc là practice quiz */}
                <Button 
                  onClick={handleStartQuiz}
                disabled={startQuizMutation.isPending || (attemptsRemaining !== null && attemptsRemaining <= 0)}
                className="w-full h-14 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                  size="lg"
                >
                {startQuizMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang bắt đầu...
                  </span>
                ) : (
                  'Bắt đầu làm bài'
                )}
                </Button>
              </>
            )}
        </div>
      </div>
    );
  }

  // Nếu quiz không có câu hỏi nào
  if (!questions.length) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-gray-700 font-semibold">
              Bài kiểm tra này hiện chưa có câu hỏi nào.
            </p>
            <p className="text-sm text-gray-500">
              Vui lòng liên hệ giảng viên để cấu hình câu hỏi cho bài kiểm tra.
            </p>
            <Button onClick={() => navigate(-1)} className="mt-2">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz taking screen
  const safeIndex = Math.min(currentQuestionIndex, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[safeIndex];
  const progress = ((safeIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Timer & Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-5 h-5 ${
                    hasTimeLimit && timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
                  }`}
                />
                <span
                  className={`font-semibold ${
                    hasTimeLimit && timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {hasTimeLimit ? formatTime(timeRemaining) : 'Không giới hạn thời gian'}
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
          {/* Trắc nghiệm: 1 đáp án / nhiều đáp án / Đúng-Sai */}
          {(currentQuestion.question_type === 'multiple_choice' ||
            currentQuestion.question_type === 'single_choice' ||
            currentQuestion.question_type === 'true_false') && (
            <div className="space-y-3">
              {currentQuestion.options?.map((answer: any, idx: number) => {
                const currentAnswer = getCurrentAnswer(currentQuestion.id);
                const isMultiple =
                  currentQuestion.question_type === 'multiple_choice';
                const isSelected = isMultiple
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
                        if (isMultiple) {
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
