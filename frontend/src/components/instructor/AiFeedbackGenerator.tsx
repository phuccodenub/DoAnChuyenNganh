import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGenerateFeedback, useAutoGrade } from '@/hooks/useAi';
import { Sparkles, Loader2, CheckCircle, FileText, Award, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiFeedbackGeneratorProps {
  assignmentId: string;
  submissionId: string;
  submissionContent: string;
  fileUrls?: string[];
  studentName?: string; // Tên học viên để AI sử dụng đúng
  assignmentInstructions: string;
  rubric?: any;
  maxScore?: number;
  assignmentQuestions?: any[];
  submissionAnswers?: Record<string, any>;
  onFeedbackGenerated?: (feedback: any) => void;
  onAutoGraded?: (grade: any) => void;
}

export function AiFeedbackGenerator({
  assignmentId,
  submissionId,
  submissionContent,
  fileUrls,
  assignmentInstructions,
  rubric,
  maxScore,
  assignmentQuestions,
  submissionAnswers,
  onFeedbackGenerated,
  onAutoGraded,
}: AiFeedbackGeneratorProps) {
  const [generatedFeedback, setGeneratedFeedback] = useState<any>(null);
  const [autoGradeResult, setAutoGradeResult] = useState<any>(null);
  
  const generateFeedback = useGenerateFeedback();
  const autoGrade = useAutoGrade();

  const handleGenerateFeedback = async () => {
    try {
      const result = await generateFeedback.mutateAsync({
        assignmentId,
        submissionId,
        submissionContent,
        fileUrls,
        studentName,
        assignmentInstructions,
        rubric,
        maxScore,
      });

      setGeneratedFeedback(result);
      toast.success('Đã tạo feedback thành công');
      
      if (onFeedbackGenerated) {
        onFeedbackGenerated(result);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo feedback');
    }
  };

  const handleAutoGrade = async () => {
    if (!assignmentQuestions || !submissionAnswers) {
      toast.error('Thiếu thông tin câu hỏi hoặc câu trả lời');
      return;
    }

    try {
      const result = await autoGrade.mutateAsync({
        assignmentId,
        submissionId,
        submissionAnswers,
        assignmentQuestions,
      });

      setAutoGradeResult(result);
      toast.success('Đã chấm điểm tự động thành công');
      
      if (onAutoGraded) {
        onAutoGraded(result);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể chấm điểm tự động');
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-grade for objective questions */}
      {assignmentQuestions && submissionAnswers && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">AI Chấm Điểm Tự Động</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Chấm điểm tự động cho câu hỏi trắc nghiệm
            </p>
          </CardHeader>
          <CardContent>
            {!autoGradeResult ? (
              <Button
                onClick={handleAutoGrade}
                disabled={autoGrade.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {autoGrade.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang chấm điểm...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Chấm Điểm Tự Động
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">Điểm số:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {autoGradeResult.score}/{autoGradeResult.maxScore}
                    </span>
                  </div>
                  <div className="text-sm text-green-800">
                    Tỷ lệ: {autoGradeResult.percentage}%
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900 text-sm">Chi tiết từng câu:</h5>
                  {autoGradeResult.gradedQuestions?.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm ${
                        q.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={q.isCorrect ? 'text-green-900' : 'text-red-900'}>
                          Câu {idx + 1}: {q.isCorrect ? '✓ Đúng' : '✗ Sai'}
                        </span>
                        <span className={q.isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {q.points}/{q.maxPoints} điểm
                        </span>
                      </div>
                      {q.feedback && (
                        <p className="text-xs text-gray-700 mt-1">{q.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setAutoGradeResult(null)}
                  variant="outline"
                  className="w-full"
                >
                  Chấm lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate feedback for subjective questions */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Tạo Feedback</CardTitle>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Tạo feedback chi tiết và xây dựng cho bài nộp
          </p>
        </CardHeader>
        <CardContent>
          {!generatedFeedback ? (
            <Button
              onClick={handleGenerateFeedback}
              disabled={generateFeedback.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generateFeedback.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo feedback...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo Feedback với AI
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {generatedFeedback.feedback?.score !== undefined && maxScore && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">Điểm đề xuất:</span>
                    <span className="text-2xl font-bold text-purple-700">
                      {generatedFeedback.feedback.score}/{maxScore}
                    </span>
                  </div>
                  {generatedFeedback.suggestedGrade && (
                    <div className="text-sm text-purple-800">
                      Grade: {generatedFeedback.suggestedGrade}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Feedback tổng thể:</h5>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {generatedFeedback.feedback?.feedback}
                </div>
              </div>

              {generatedFeedback.feedback?.strengths && generatedFeedback.feedback.strengths.length > 0 && (
                <div>
                  <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Điểm mạnh:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800 ml-2">
                    {generatedFeedback.feedback.strengths.map((strength: string, idx: number) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedFeedback.feedback?.improvements && generatedFeedback.feedback.improvements.length > 0 && (
                <div>
                  <h5 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Cần cải thiện:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-orange-800 ml-2">
                    {generatedFeedback.feedback.improvements.map((improvement: string, idx: number) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedFeedback.feedback?.detailedComments && generatedFeedback.feedback.detailedComments.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Nhận xét chi tiết:</h5>
                  <div className="space-y-2">
                    {generatedFeedback.feedback.detailedComments.map((comment: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {comment.section}
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                        {comment.score !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Điểm: {comment.score}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (onFeedbackGenerated) {
                      onFeedbackGenerated(generatedFeedback);
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sử dụng Feedback này
                </Button>
                <Button
                  onClick={() => setGeneratedFeedback(null)}
                  variant="outline"
                >
                  Tạo lại
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

