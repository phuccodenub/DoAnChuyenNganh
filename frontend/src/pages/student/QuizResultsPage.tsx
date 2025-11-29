import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES, generateRoute } from '@/constants/routes';
// Badge component - simplified inline
import { useQuizAttempt } from '@/hooks/useQuizData';

/**
 * QuizResultsPage - Student
 * 
 * Hiển thị kết quả bài kiểm tra:
 * - Score display (điểm, phần trăm)
 * - Pass/Fail badge
 * - Time taken
 * - Attempts remaining
 * - Question review
 * - Retry button
 * - Vietnamese UI
 */

export function QuizResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const { data: attempt, isLoading } = useQuizAttempt(attemptId!);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const handleToggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy kết quả bài kiểm tra</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quiz = attempt.quiz;
  const score = attempt.score || 0;
  const totalPoints = attempt.max_score || 100;
  const percentage = Math.round((score / totalPoints) * 100);
  const passed = percentage >= (quiz?.passing_score || 70);
  const timeTaken = attempt.time_spent_minutes || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div>
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {score}/{totalPoints}
              </h1>
              <p className="text-2xl font-semibold text-gray-600">
                {percentage}%
              </p>
            </div>

            <span className={`inline-block px-4 py-2 text-base font-medium rounded ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {passed ? '✓ Đạt' : '✗ Không đạt'}
            </span>

            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Thời gian: {timeTaken} phút</span>
              </div>
              <div>
                Điểm đạt: {quiz?.passing_score}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>{quiz?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Câu đúng</p>
              <p className="font-semibold text-green-600">
                {(attempt as any).correct_answers || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Câu sai</p>
              <p className="font-semibold text-red-600">
                {(attempt as any).incorrect_answers || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa làm</p>
              <p className="font-semibold text-gray-600">
                {(attempt as any).unanswered || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lần làm</p>
              <p className="font-semibold text-gray-900">
                {(attempt as any).attempt_number || 1}/{(quiz as any)?.max_attempts}
              </p>
            </div>
          </div>

          {!passed && ((quiz as any)?.max_attempts || 1) > ((attempt as any).attempt_number || 1) && (
            <div className="pt-4 border-t">
              <Button onClick={() => navigate(-1)} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Làm lại
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Review */}
      {attempt.questions && attempt.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempt.questions.map((question: any, idx: number) => {
                const isExpanded = expandedQuestions.includes(question.id);
                const isCorrect = question.is_correct;

                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => handleToggleQuestion(question.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900">
                          Câu {idx + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {question.points} điểm
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 bg-gray-50">
                        <p className="text-gray-900">{question.question_text}</p>

                        {question.student_answer && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Câu trả lời của bạn:
                            </p>
                            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {question.student_answer}
                            </p>
                          </div>
                        )}

                        {!isCorrect && question.correct_answer && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Đáp án đúng:
                            </p>
                            <p className="text-sm text-green-700">
                              {question.correct_answer}
                            </p>
                          </div>
                        )}

                        {question.feedback && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">{question.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.STUDENT.DASHBOARD)}
        >
          Về Dashboard
        </Button>
        {quiz && (
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                (quiz as any).course_id
                  ? generateRoute.student.learning(String((quiz as any).course_id))
                  : ROUTES.STUDENT.DASHBOARD
              )
            }
          >
            Về khóa học
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuizResultsPage;
