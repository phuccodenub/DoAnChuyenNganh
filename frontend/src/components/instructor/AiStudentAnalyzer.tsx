import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAnalyzeStudents } from '@/hooks/useAi';
import { Sparkles, Loader2, Users, TrendingUp, AlertTriangle, Award, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiStudentAnalyzerProps {
  courseId: string;
  studentIds?: string[];
}

export function AiStudentAnalyzer({ courseId, studentIds }: AiStudentAnalyzerProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const analyzeStudents = useAnalyzeStudents();

  const handleAnalyze = async () => {
    try {
      const result = await analyzeStudents.mutateAsync({
        courseId,
        studentIds,
      });

      setAnalysis(result);
      toast.success('Đã phân tích học viên thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phân tích học viên');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <CardTitle className="text-lg">AI Phân Tích Học Viên</CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Phân tích hiệu suất và đưa ra insights về học viên
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nhấn nút bên dưới để AI phân tích học viên trong khóa học
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={analyzeStudents.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {analyzeStudents.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Phân Tích Học Viên
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Course Analytics Summary */}
            {analysis.courseAnalytics && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Thống kê tổng quan:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-700">Tổng học viên</p>
                    <p className="text-lg font-bold text-blue-900">
                      {analysis.courseAnalytics.totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Tiến độ trung bình</p>
                    <p className="text-lg font-bold text-blue-900">
                      {analysis.courseAnalytics.averageProgress?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Điểm trung bình</p>
                    <p className="text-lg font-bold text-blue-900">
                      {analysis.courseAnalytics.averageScore?.toFixed(1)}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Tỷ lệ hoàn thành</p>
                    <p className="text-lg font-bold text-blue-900">
                      {analysis.courseAnalytics.completionRate?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {analysis.courseAnalytics?.insights && analysis.courseAnalytics.insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Insights:</h4>
                <div className="space-y-2">
                  {analysis.courseAnalytics.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                      <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-900">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.courseAnalytics?.recommendations && analysis.courseAnalytics.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Đề xuất:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {analysis.courseAnalytics.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Student Analyses */}
            {analysis.studentAnalyses && analysis.studentAnalyses.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Phân tích từng học viên:</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analysis.studentAnalyses.map((student: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-gray-900">{student.studentName}</h5>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-600">
                              Tiến độ: {student.overallProgress}%
                            </span>
                            <span className="text-xs text-gray-600">
                              Điểm TB: {student.averageScore}/10
                            </span>
                          </div>
                        </div>
                        <Badge className={getRiskColor(student.riskLevel)}>
                          {student.riskLevel === 'high' ? 'Rủi ro cao' :
                           student.riskLevel === 'medium' ? 'Rủi ro trung bình' : 'An toàn'}
                        </Badge>
                      </div>

                      {student.strengths && student.strengths.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-green-700 mb-1">Điểm mạnh:</p>
                          <ul className="list-disc list-inside text-xs text-green-800 ml-2">
                            {student.strengths.map((strength: string, sIdx: number) => (
                              <li key={sIdx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {student.weaknesses && student.weaknesses.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-red-700 mb-1">Điểm yếu:</p>
                          <ul className="list-disc list-inside text-xs text-red-800 ml-2">
                            {student.weaknesses.map((weakness: string, wIdx: number) => (
                              <li key={wIdx}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {student.recommendations && student.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-blue-700 mb-1">Đề xuất:</p>
                          <ul className="list-disc list-inside text-xs text-blue-800 ml-2">
                            {student.recommendations.map((rec: string, rIdx: number) => (
                              <li key={rIdx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setAnalysis(null)}
              variant="outline"
              className="w-full"
            >
              Phân tích lại
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

