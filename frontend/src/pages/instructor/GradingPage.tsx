import { useState } from 'react';
import { CheckCircle, Clock, Edit, Search, Filter, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardNew';
import { Button } from '@/components/ui/ButtonNew';
import { Input } from '@/components/ui/InputNew';

/**
 * GradingPage - Instructor
 * 
 * Chấm điểm submissions:
 * - Course selector dropdown
 * - Submission list với filters (type, status, sort)
 * - Grading modal (points + feedback)
 * - Bulk grading support
 * - Vietnamese UI
 */

type SubmissionType = 'all' | 'assignment' | 'quiz';
type SubmissionStatus = 'all' | 'pending' | 'graded';
type SortBy = 'date' | 'student';

interface Submission {
  id: number;
  student: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
  type: 'assignment' | 'quiz';
  title: string;
  submitted_at: string;
  is_late: boolean;
  status: 'pending' | 'graded';
  score?: number;
  max_points: number;
  submission_text?: string;
  file_urls?: string[];
}

export function GradingPage() {
  // Mock data
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [typeFilter, setTypeFilter] = useState<SubmissionType>('all');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus>('pending');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  // Grading form
  const [gradingForm, setGradingForm] = useState({
    score: 0,
    feedback: '',
  });

  // Mock submissions
  const mockSubmissions: Submission[] = [
    {
      id: 1,
      student: { id: 1, full_name: 'Nguyễn Văn A', avatar_url: '' },
      type: 'assignment',
      title: 'Bài tập 1: Xây dựng component React',
      submitted_at: '2024-01-15T10:30:00',
      is_late: false,
      status: 'pending',
      max_points: 100,
      submission_text: 'Đây là bài làm của em...',
      file_urls: ['file1.pdf', 'file2.zip'],
    },
    {
      id: 2,
      student: { id: 2, full_name: 'Trần Thị B', avatar_url: '' },
      type: 'quiz',
      title: 'Kiểm tra giữa kỳ - React Hooks',
      submitted_at: '2024-01-14T15:20:00',
      is_late: true,
      status: 'graded',
      score: 85,
      max_points: 100,
    },
  ];

  const filteredSubmissions = mockSubmissions.filter(sub => {
    if (typeFilter !== 'all' && sub.type !== typeFilter) return false;
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (searchQuery && !sub.student.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleGrade = (submission: Submission) => {
    setCurrentSubmission(submission);
    setGradingForm({
      score: submission.score || 0,
      feedback: '',
    });
    setShowGradingModal(true);
  };

  const handleSaveGrade = async () => {
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Chấm điểm thành công!');
      setShowGradingModal(false);
      setCurrentSubmission(null);
    } catch (error) {
      console.error('Grade submission failed:', error);
      alert('Chấm điểm thất bại. Vui lòng thử lại.');
    }
  };

  const handleBulkGrade = async () => {
    if (selectedSubmissions.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài nộp');
      return;
    }

    const score = prompt('Nhập điểm chung cho tất cả (0-100):');
    if (!score) return;

    try {
      // TODO: Implement bulk grade API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Đã chấm ${selectedSubmissions.length} bài nộp!`);
      setSelectedSubmissions([]);
    } catch (error) {
      console.error('Bulk grade failed:', error);
      alert('Chấm điểm hàng loạt thất bại.');
    }
  };

  const handleExportGrades = () => {
    // TODO: Implement CSV export
    alert('Đang xuất file CSV...');
  };

  const toggleSelection = (id: number) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const getAvatarUrl = (student: Submission['student']) => {
    return student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&size=80&background=3B82F6&color=fff`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chấm điểm</h1>
          <p className="text-gray-600 mt-1">Quản lý và chấm điểm bài nộp của học viên</p>
        </div>
        <Button onClick={handleExportGrades} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên học viên..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SubmissionType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              <option value="assignment">Bài tập</option>
              <option value="quiz">Bài kiểm tra</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ chấm</option>
              <option value="graded">Đã chấm</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Đã chọn <span className="font-semibold">{selectedSubmissions.length}</span> bài nộp
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkGrade}>
              Chấm hàng loạt
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSubmissions([])}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Không có bài nộp nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  {submission.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={() => toggleSelection(submission.id)}
                      className="w-5 h-5 text-blue-600 rounded mt-1"
                    />
                  )}

                  {/* Student Avatar */}
                  <img
                    src={getAvatarUrl(submission.student)}
                    alt={submission.student.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {submission.student.full_name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            submission.type === 'assignment'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {submission.type === 'assignment' ? 'Bài tập' : 'Bài kiểm tra'}
                          </span>
                          <span className="text-sm text-gray-600">{submission.title}</span>
                          {submission.is_late && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                              Nộp muộn
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}
                        </p>
                      </div>

                      {/* Score/Action */}
                      <div className="flex items-center gap-3">
                        {submission.status === 'graded' ? (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {submission.score}/{submission.max_points}
                            </p>
                            <p className="text-xs text-gray-500">Đã chấm</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              Tối đa: {submission.max_points} điểm
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Grading Modal */}
      {showGradingModal && currentSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Chấm điểm: {currentSubmission.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Học viên: {currentSubmission.student.full_name}
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
                {currentSubmission.file_urls && currentSubmission.file_urls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">File đính kèm:</p>
                    {currentSubmission.file_urls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <div className="space-y-4 pt-4 border-t">
                <Input
                  type="number"
                  label={`Điểm (0 - ${currentSubmission.max_points}) *`}
                  value={gradingForm.score}
                  onChange={(e) => setGradingForm({ ...gradingForm, score: Number(e.target.value) })}
                  min={0}
                  max={currentSubmission.max_points}
                  required
                />

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
              >
                Hủy
              </Button>
              <Button onClick={handleSaveGrade}>
                Lưu điểm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradingPage;
