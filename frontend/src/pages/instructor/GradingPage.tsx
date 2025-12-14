import { useState, useMemo } from 'react';
import { CheckCircle, Clock, Edit, Search, Filter, FileText, Download, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { usePendingSubmissions, useGradeSubmission, useInstructorCourses } from '@/hooks/useInstructorCourse';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

/**
 * GradingPage - Instructor
 * 
 * Chấm điểm submissions (Real Data):
 * - Pending submissions list
 * - Grading modal (score + feedback)
 * - Filter by search
 * - Vietnamese UI
 */

interface PendingSubmission {
  id: string;
  assignment_id: string;
  assignment_title: string;
  course_id: string;
  course_title: string;
  max_score: number;
  due_date: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  submitted_at: string;
  is_late: boolean;
  submission_text?: string;
  file_url?: string;
}

export function GradingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<PendingSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Grading form
  const [gradingForm, setGradingForm] = useState({
    score: 0,
    feedback: '',
  });

  // Fetch pending submissions
  const { data: pendingData, isLoading, refetch } = usePendingSubmissions({ 
    page: currentPage, 
    limit: itemsPerPage 
  });
  
  const gradeMutation = useGradeSubmission();

  const submissions = pendingData?.data?.submissions || [];
  const pagination = pendingData?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  // Filter by search
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter(sub => 
      sub.student.name.toLowerCase().includes(query) ||
      sub.assignment_title.toLowerCase().includes(query) ||
      sub.course_title.toLowerCase().includes(query)
    );
  }, [submissions, searchQuery]);

  const handleGrade = (submission: PendingSubmission) => {
    setCurrentSubmission(submission);
    setGradingForm({
      score: 0,
      feedback: '',
    });
    setShowGradingModal(true);
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    // Validate score
    if (gradingForm.score < 0 || gradingForm.score > currentSubmission.max_score) {
      toast.error(`Điểm phải từ 0 đến ${currentSubmission.max_score}`);
      return;
    }

    try {
      await gradeMutation.mutateAsync({
        submissionId: currentSubmission.id,
        data: {
          score: gradingForm.score,
          feedback: gradingForm.feedback || undefined,
        }
      });
      
      toast.success('Chấm điểm thành công!');
      setShowGradingModal(false);
      setCurrentSubmission(null);
      refetch();
    } catch (error: any) {
      console.error('Grade submission failed:', error);
      toast.error(error?.response?.data?.message || 'Chấm điểm thất bại. Vui lòng thử lại.');
    }
  };

  const handleExportGrades = () => {
    // TODO: Implement CSV export
    toast('Tính năng xuất CSV đang được phát triển');
  };

  const toggleSelection = (id: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const getAvatarUrl = (student: PendingSubmission['student']) => {
    return student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=80&background=3B82F6&color=fff`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chấm điểm</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total > 0 
              ? `Có ${pagination.total} bài nộp đang chờ chấm điểm`
              : 'Không có bài nộp nào chờ chấm điểm'
            }
          </p>
        </div>
        <Button onClick={handleExportGrades} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, bài tập, hoặc khóa học..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                <p className="text-sm text-gray-600">Chờ chấm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.is_late).length}
                </p>
                <p className="text-sm text-gray-600">Nộp muộn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => !s.is_late).length}
                </p>
                <p className="text-sm text-gray-600">Đúng hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có bài nộp nào chờ chấm điểm</p>
              <p className="text-gray-400 text-sm mt-1">Các bài nộp mới sẽ xuất hiện ở đây</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => toggleSelection(submission.id)}
                    className="w-5 h-5 text-blue-600 rounded mt-1"
                  />

                  {/* Student Avatar */}
                  <img
                    src={getAvatarUrl(submission.student)}
                    alt={submission.student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {submission.student.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Bài tập
                          </span>
                          <span className="text-sm text-gray-600">{submission.assignment_title}</span>
                          {submission.is_late && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                              Nộp muộn
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Khóa học: {submission.course_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')} 
                          <span className="text-gray-400 ml-2">
                            ({formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true, locale: vi })})
                          </span>
                        </p>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">
                          Tối đa: {submission.max_score} điểm
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleGrade(submission)}
                          className="gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Chấm điểm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Grading Modal */}
      {showGradingModal && currentSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Chấm điểm: {currentSubmission.assignment_title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Học viên: {currentSubmission.student.name} ({currentSubmission.student.email})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Khóa học: {currentSubmission.course_title}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Submission Content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bài làm của học viên:</h3>
                {currentSubmission.submission_text && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-3">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {currentSubmission.submission_text}
                    </p>
                  </div>
                )}
                {currentSubmission.file_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">File đính kèm:</p>
                    <a 
                      href={currentSubmission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 flex-1">Xem file đính kèm</span>
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </a>
                  </div>
                )}
                {!currentSubmission.submission_text && !currentSubmission.file_url && (
                  <p className="text-gray-500 italic">Không có nội dung bài nộp</p>
                )}
              </div>

              {/* Grading Form */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm (0 - {currentSubmission.max_score}) *
                  </label>
                  <input
                    type="number"
                    value={gradingForm.score}
                    onChange={(e) => setGradingForm({ ...gradingForm, score: Number(e.target.value) })}
                    min={0}
                    max={currentSubmission.max_score}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét
                  </label>
                  <textarea
                    value={gradingForm.feedback}
                    onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                    placeholder="Nhập nhận xét cho học viên..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGradingModal(false);
                  setCurrentSubmission(null);
                }}
                disabled={gradeMutation.isPending}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSaveGrade}
                disabled={gradeMutation.isPending}
              >
                {gradeMutation.isPending ? 'Đang lưu...' : 'Lưu điểm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
