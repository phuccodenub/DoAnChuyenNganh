import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { assignmentApi } from '@/services/api/assignment.api';
import { aiApi } from '@/services/api/ai.api';
import { AlertCircle, Bot, Brain, CheckCircle, Code2, FileText, RefreshCw, Save, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AiGraderTabProps {
  courseId: string;
  courseTitle: string;
}

type RubricItem = {
  name: string;
  description: string;
  points: number;
};

type CodeIssue = {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
};

type GradingBreakdownItem = {
  criterion: string;
  achieved: number;
  max: number;
  comment: string;
};

type AiGradeResult = {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: GradingBreakdownItem[];
  feedback: string;
  suggestions?: string[];
  codeIssues?: CodeIssue[];
  strengths?: string[];
  improvements?: string[];
  comments?: { section: string; text: string; type: 'positive' | 'constructive' }[];
  metadata?: {
    gradedAt: string | Date;
    model: string;
    processingTime: number;
    gradedBy: 'ai' | 'teacher';
  };
};

export function AiGraderTab({ courseId, courseTitle }: AiGraderTabProps) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [gradingType, setGradingType] = useState<'code' | 'essay' | 'assignment'>('essay');
  const [language, setLanguage] = useState('typescript');
  const [topic, setTopic] = useState('');
  const [rubricItems, setRubricItems] = useState<RubricItem[]>([
    { name: 'Correctness', description: 'Đúng yêu cầu, logic chuẩn', points: 40 },
    { name: 'Quality', description: 'Chất lượng, rõ ràng, dễ đọc', points: 25 },
    { name: 'Performance', description: 'Hiệu năng hợp lý', points: 20 },
    { name: 'Security', description: 'Bảo mật và xử lý lỗi', points: 15 },
  ]);
  const [draftRubricName, setDraftRubricName] = useState('');
  const [aiResult, setAiResult] = useState<AiGradeResult | null>(null);
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [manualContent, setManualContent] = useState('');
  const [overrideScore, setOverrideScore] = useState<number | ''>('');
  const [overrideFeedback, setOverrideFeedback] = useState('');

  const assignmentsQuery = useQuery({
    queryKey: ['ai-grader-assignments', courseId],
    queryFn: () => assignmentApi.getCourseAssignments(courseId),
    enabled: !!courseId,
  });

  const submissionsQuery = useQuery({
    queryKey: ['ai-grader-submissions', selectedAssignmentId],
    queryFn: () => assignmentApi.getAssignmentSubmissions(selectedAssignmentId, 1, 200),
    enabled: !!selectedAssignmentId,
  });

  const submissionDetailsQuery = useQuery({
    queryKey: ['ai-grader-submission-detail', selectedSubmissionId],
    queryFn: () => assignmentApi.getSubmissionById(selectedSubmissionId),
    enabled: !!selectedSubmissionId,
  });

  const selectedAssignment = useMemo(() => {
    return assignmentsQuery.data?.find((assignment) => assignment.id === selectedAssignmentId);
  }, [assignmentsQuery.data, selectedAssignmentId]);

  const assignmentRubric = submissionDetailsQuery.data?.assignment?.rubric || selectedAssignment?.rubric || null;

  const selectedSubmission = useMemo(() => {
    return submissionsQuery.data?.rows?.find((submission) => submission.id === selectedSubmissionId);
  }, [submissionsQuery.data, selectedSubmissionId]);

  const submissionDetail = submissionDetailsQuery.data || null;

  const submissionContent = useMemo(() => {
    if (submissionDetail?.submission_text) return submissionDetail.submission_text;
    if (selectedSubmission?.submission_text) return selectedSubmission.submission_text;
    return '';
  }, [submissionDetail, selectedSubmission]);

  const resolvedContent = submissionContent || manualContent;
  const submissionFileUrls = useMemo(() => {
    const fromDetail = submissionDetail?.file_urls;
    if (fromDetail && fromDetail.length > 0) return fromDetail;
    const fromList = selectedSubmission?.file_urls;
    if (fromList && fromList.length > 0) return fromList;
    const rawFileUrl = (submissionDetail as any)?.file_url || (selectedSubmission as any)?.file_url;
    if (!rawFileUrl) return [] as string[];
    try {
      const parsed = JSON.parse(rawFileUrl);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return [rawFileUrl];
    }
    return [rawFileUrl];
  }, [submissionDetail, selectedSubmission]);
  const hasFileSubmission = submissionFileUrls.length > 0;

  const canGrade = Boolean(selectedAssignmentId && selectedSubmissionId && (resolvedContent.trim() || hasFileSubmission));

  const displayedContent = manualContent || submissionContent;

  const totalRubricPoints = useMemo(() => {
    return rubricItems.reduce((sum, item) => sum + (Number.isFinite(item.points) ? item.points : 0), 0);
  }, [rubricItems]);

  const handleAddRubricItem = () => {
    setRubricItems((prev) => [...prev, { name: '', description: '', points: 0 }]);
  };

  const handleUseAssignmentRubric = () => {
    if (!assignmentRubric || !Array.isArray(assignmentRubric)) {
      toast.error('Assignment chưa có rubric');
      return;
    }
    setRubricItems(
      assignmentRubric.map((item: RubricItem) => ({
        name: item.name || '',
        description: item.description || '',
        points: typeof item.points === 'number' ? item.points : Number(item.points || 0),
      }))
    );
    setDraftRubricName('');
    toast.success('Đã áp dụng rubric từ assignment');
  };

  const handleUpdateRubricItem = (index: number, field: keyof RubricItem, value: string | number) => {
    setRubricItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveRubricItem = (index: number) => {
    setRubricItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateRubric = () => {
    if (rubricItems.length === 0) {
      toast.error('Rubric không được để trống');
      return false;
    }

    const invalid = rubricItems.some((item) => !item.name.trim() || item.points <= 0);
    if (invalid) {
      toast.error('Mỗi tiêu chí cần có tên và điểm > 0');
      return false;
    }

    return true;
  };

  const handleGradeWithAi = async () => {
    if (!selectedAssignment || !selectedSubmission) {
      toast.error('Chọn assignment và submission trước');
      return;
    }

    if (!validateRubric()) {
      return;
    }

    if (!resolvedContent.trim() && !hasFileSubmission) {
      toast.error('Bài nộp không có nội dung để chấm');
      return;
    }

    if (gradingType === 'essay' && !topic.trim()) {
      toast.error('Vui lòng nhập chủ đề bài luận');
      return;
    }

    try {
      setAiResult(null);
      const payload = {
        submissionId: selectedSubmission.id,
        assignmentId: selectedAssignment.id,
        courseId,
        rubric: rubricItems,
        ...(gradingType === 'code'
          ? {
              code: resolvedContent,
              language,
            }
          : {
              essay: resolvedContent,
              topic: topic.trim(),
            }),
      };

      let result: AiGradeResult;
      if (gradingType === 'code') {
        result = await aiApi.gradeCode(payload as any);
      } else if (gradingType === 'essay') {
        result = await aiApi.gradeEssay(payload as any);
      } else {
        result = await aiApi.gradeAssignment({
          submissionId: selectedSubmission.id,
          assignmentId: selectedAssignment.id,
          courseId,
          rubric: rubricItems,
        });
      }

      if (!result) {
        throw new Error('AI grader response empty');
      }

      setAiResult(result as AiGradeResult);
      setOverrideScore(result.score ?? '');
      setOverrideFeedback(result.feedback || '');
      toast.success('AI đã chấm điểm xong');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể chấm điểm bằng AI');
    }
  };

  const handleSaveGrade = async () => {
    if (!aiResult || !selectedSubmission) {
      toast.error('Chưa có kết quả AI để lưu');
      return;
    }

    setIsSavingGrade(true);
    try {
      await assignmentApi.saveAiGrading(selectedSubmission.id, {
        aiResult,
        rubric: rubricItems,
        overwriteScore: false,
      });
      toast.success('Đã lưu kết quả AI');
      submissionDetailsQuery.refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu kết quả AI');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleApplyAiScore = async () => {
    if (!aiResult || !selectedSubmission) {
      toast.error('Chưa có kết quả AI');
      return;
    }

    setIsSavingGrade(true);
    try {
      await assignmentApi.saveAiGrading(selectedSubmission.id, {
        aiResult,
        rubric: rubricItems,
        overwriteScore: true,
      });
      toast.success('Đã áp dụng điểm AI cho bài nộp');
      submissionDetailsQuery.refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu điểm AI');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!selectedSubmission) {
      toast.error('Chọn bài nộp trước');
      return;
    }

    if (overrideScore === '' || Number.isNaN(Number(overrideScore))) {
      toast.error('Điểm override không hợp lệ');
      return;
    }

    if (!selectedAssignment?.max_score) {
      toast.error('Không xác định được điểm tối đa');
      return;
    }

    if (Number(overrideScore) > Number(selectedAssignment.max_score)) {
      toast.error('Điểm override vượt quá điểm tối đa');
      return;
    }

    setIsSavingGrade(true);
    try {
      await assignmentApi.gradeSubmission(selectedSubmission.id, {
        score: Number(overrideScore),
        feedback: overrideFeedback.trim() || undefined,
      });
      toast.success('Đã lưu điểm thủ công');
      submissionDetailsQuery.refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu điểm thủ công');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleResetResult = () => {
    setAiResult(null);
  };

  const selectedScore = typeof submissionDetail?.score === 'number'
    ? submissionDetail.score
    : submissionDetail?.score
    ? Number(submissionDetail.score)
    : undefined;

  const selectedFeedback = submissionDetail?.feedback || '';

  const hasSavedAiResult = Boolean(submissionDetail?.ai_grader_last);

  const submissions = submissionsQuery.data?.rows || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-blue-600" />
              AI Grader - {courseTitle || 'Course'}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Chấm bài bằng AI, quản lý rubric và lưu kết quả.</p>
          </div>
          <Button variant="outline" onClick={() => submissionsQuery.refetch()} disabled={!selectedAssignmentId}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tải lại bài nộp
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {submissionDetailsQuery.isLoading && selectedSubmissionId && (
            <div className="lg:col-span-3 flex items-center gap-2 text-sm text-gray-500">
              <Spinner />
              Đang tải chi tiết bài nộp...
            </div>
          )}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Assignment</label>
            {assignmentsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner />
                Đang tải bài tập...
              </div>
            ) : assignmentsQuery.data && assignmentsQuery.data.length > 0 ? (
              <select
                value={selectedAssignmentId}
                onChange={(e) => {
                  setSelectedAssignmentId(e.target.value);
                  setSelectedSubmissionId('');
                  setManualContent('');
                  setAiResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Chọn bài tập</option>
                {assignmentsQuery.data.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                Không có bài tập
              </div>
            )}

            <label className="text-sm font-medium text-gray-700">Submission</label>
            {submissionsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner />
                Đang tải bài nộp...
              </div>
            ) : submissions.length > 0 ? (
              <select
                value={selectedSubmissionId}
                onChange={(e) => {
                  setSelectedSubmissionId(e.target.value);
                  setManualContent('');
                  setOverrideScore('');
                  setOverrideFeedback('');
                  setAiResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Chọn bài nộp</option>
                {submissions.map((submission) => (
                  <option key={submission.id} value={submission.id}>
                    {submission.student?.first_name || ''} {submission.student?.last_name || ''} · {new Date(
                      submission.submitted_at
                    ).toLocaleString('vi-VN')}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                Chưa có bài nộp
              </div>
            )}

            {selectedSubmission && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Thông tin bài nộp</span>
                  <Badge variant={selectedSubmission.status === 'graded' ? 'success' : 'default'}>
                    {selectedSubmission.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                  </Badge>
                </div>
                <p className="mt-2">Học viên: {selectedSubmission.student?.first_name} {selectedSubmission.student?.last_name}</p>
                <p>Bài tập: {selectedAssignment?.title}</p>
                {submissionDetail?.graded_at && (
                  <p>Chấm lần cuối: {new Date(submissionDetail.graded_at).toLocaleString('vi-VN')}</p>
                )}
              </div>
            )}

            <label className="text-sm font-medium text-gray-700">Loại chấm</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={gradingType === 'essay' ? 'primary' : 'outline'}
                onClick={() => setGradingType('essay')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Bài luận
              </Button>
              <Button
                variant={gradingType === 'code' ? 'primary' : 'outline'}
                onClick={() => setGradingType('code')}
                className="flex-1"
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code
              </Button>
              <Button
                variant={gradingType === 'assignment' ? 'primary' : 'outline'}
                onClick={() => setGradingType('assignment')}
                className="flex-1"
              >
                <Bot className="w-4 h-4 mr-2" />
                Text/File
              </Button>
            </div>

            {gradingType === 'essay' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Chủ đề bài luận</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Impact of AI on Education"
                />
              </div>
            )}

            {gradingType === 'assignment' && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Dùng cho assignment text/file/both, hệ thống sẽ lấy nội dung file nếu có.</p>
                {hasFileSubmission && (
                  <p>Đã phát hiện {submissionFileUrls.length} file đính kèm.</p>
                )}
              </div>
            )}

            {gradingType === 'code' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Ngôn ngữ code</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                </select>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700">Nội dung bài nộp</label>
                <textarea
                  value={displayedContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder={
                    submissionContent
                      ? 'Đang lấy nội dung từ submission. Bạn có thể chỉnh sửa nếu cần.'
                      : 'Submission không có text. Dán code/bài luận tại đây.'
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {submissionContent && (
                  <p className="text-xs text-gray-500 mt-1">Đã phát hiện nội dung từ submission.</p>
                )}
              </div>
              <Button className="w-full" onClick={handleGradeWithAi} disabled={!canGrade}>
                <Wand2 className="w-4 h-4 mr-2" />
                Chấm bằng AI
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Rubric</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleAddRubricItem}>
                  Thêm tiêu chí
                </Button>
                <Button variant="ghost" size="sm" onClick={handleUseAssignmentRubric} disabled={!assignmentRubric}>
                  Dùng rubric của assignment
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {rubricItems.map((item, idx) => (
                <Card key={idx} className="border border-gray-200">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => handleUpdateRubricItem(idx, 'name', e.target.value)}
                        placeholder="Tên tiêu chí"
                      />
                      <Input
                        type="number"
                        value={item.points}
                        onChange={(e) => handleUpdateRubricItem(idx, 'points', Number(e.target.value))}
                        className="w-24"
                        min={0}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveRubricItem(idx)}>
                        Xóa
                      </Button>
                    </div>
                    <Input
                      value={item.description}
                      onChange={(e) => handleUpdateRubricItem(idx, 'description', e.target.value)}
                      placeholder="Mô tả chi tiết"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Tổng điểm rubric</span>
              <Badge variant="default">{totalRubricPoints}</Badge>
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên bộ rubric (tuỳ chọn)</label>
              <Input
                value={draftRubricName}
                onChange={(e) => setDraftRubricName(e.target.value)}
                placeholder="Ví dụ: Rubric Code Assignment 1"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  if (!selectedAssignmentId) {
                    toast.error('Chọn assignment trước');
                    return;
                  }
                  if (!validateRubric()) {
                    return;
                  }
                  try {
                    await assignmentApi.updateAssignment(selectedAssignmentId, {
                      rubric: rubricItems,
                    });
                    setDraftRubricName('');
                    toast.success('Đã lưu rubric cho assignment');
                    assignmentsQuery.refetch();
                    submissionDetailsQuery.refetch();
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message || 'Không thể lưu rubric');
                  }
                }}
              >
                Lưu rubric vào assignment
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Kết quả AI</label>
            {!aiResult ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                <Brain className="w-6 h-6 mx-auto mb-2" />
                {hasSavedAiResult ? 'Chưa tải lại kết quả AI (hãy chấm lại nếu cần).' : 'Chưa có kết quả AI.'}
              </div>
            ) : (
              <div className="space-y-3">
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900 font-medium">Điểm AI</span>
                      <span className="text-xl font-bold text-blue-700">
                        {aiResult.score}/{aiResult.maxScore}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700">Tỷ lệ: {aiResult.percentage}%</div>
                    {aiResult.metadata && (
                      <div className="text-xs text-blue-700">
                        Model: {aiResult.metadata.model} · {aiResult.metadata.processingTime}ms
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(selectedScore !== undefined || selectedFeedback) && (
                  <Card className="border border-green-200 bg-green-50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-900 font-medium">Điểm hiện tại</span>
                        <span className="text-xl font-bold text-green-700">
                          {selectedScore !== undefined ? selectedScore : 'Chưa có'}
                        </span>
                      </div>
                      {selectedFeedback && (
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{selectedFeedback}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Phân tích rubric</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {aiResult.breakdown?.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.criterion}</span>
                          <span className="text-sm text-gray-700">
                            {item.achieved}/{item.max}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Feedback tổng</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">
                    {aiResult.feedback}
                  </CardContent>
                </Card>

                {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Gợi ý cải thiện</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-gray-600">
                      {aiResult.suggestions.map((suggestion, idx) => (
                        <p key={idx}>- {suggestion}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {aiResult.codeIssues && aiResult.codeIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Code issues</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {aiResult.codeIssues.map((issue, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">
                            {issue.type.toUpperCase()} {issue.line ? `Line ${issue.line}` : ''}
                          </span>
                          <p className="text-gray-600">{issue.message}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col gap-2">
                  <Button onClick={handleSaveGrade} variant="outline" disabled={isSavingGrade}>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu kết quả AI
                  </Button>
                  <Button onClick={handleApplyAiScore} disabled={isSavingGrade}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Áp dụng điểm AI
                  </Button>
                  <Button onClick={handleResetResult} variant="ghost">
                    Làm mới kết quả
                  </Button>
                </div>

                {aiResult.metadata && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      Kết quả chấm bởi AI • {aiResult.metadata.model} • {new Date(
                        aiResult.metadata.gradedAt
                      ).toLocaleString('vi-VN')}
                    </div>
                  </div>
                )}

                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Override bởi giảng viên</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Điểm mới"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <textarea
                      value={overrideFeedback}
                      onChange={(e) => setOverrideFeedback(e.target.value)}
                      placeholder="Nhận xét của giảng viên (tuỳ chọn)"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <Button onClick={handleSaveOverride} disabled={isSavingGrade}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu điểm override
                    </Button>
                  </CardContent>
                </Card>

                {submissionDetail?.ai_grader_history && Array.isArray(submissionDetail.ai_grader_history) && submissionDetail.ai_grader_history.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Lịch sử AI Grader</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {submissionDetail.ai_grader_history.map((entry: any, idx: number) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Lần {idx + 1}</span>
                            <span>{entry?.savedAt ? new Date(entry.savedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                          </div>
                          {entry?.aiResult?.score !== undefined && (
                            <div className="mt-2 font-medium text-gray-900">
                              Điểm: {entry.aiResult.score}/{entry.aiResult.maxScore || '-'}
                            </div>
                          )}
                          {entry?.aiResult?.feedback && (
                            <p className="text-gray-600 mt-1 line-clamp-3">{entry.aiResult.feedback}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
