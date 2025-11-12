import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// Badge simplified inline
import { useAssignment, useSubmission, useSubmitAssignment, useUploadFile } from '@/hooks/useAssignmentData';

/**
 * AssignmentPage - Student
 * 
 * Student nộp bài tập:
 * - Assignment info display
 * - Deadline countdown
 * - Submission form (text + file)
 * - File upload với drag-drop
 * - Upload progress
 * - Submission status
 * - Vietnamese UI
 */

export function AssignmentPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: assignment, isLoading: assignmentLoading } = useAssignment(Number(assignmentId));
  const { data: submission } = useSubmission(Number(assignmentId));
  
  const submitMutation = useSubmitAssignment();
  const uploadMutation = useUploadFile();

  const [submissionText, setSubmissionText] = useState(submission?.submission_text || '');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max from assignment config)
    const maxSizeMB = assignment?.max_file_size_mb || 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploadProgress(0);
      const result = await uploadMutation.mutateAsync({
        assignmentId: Number(assignmentId),
        file,
      });
      
      setUploadedFiles([...uploadedFiles, {
        name: file.name,
        url: result.url,
        size: file.size,
      }]);
      setUploadProgress(100);
      
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload file thất bại. Vui lòng thử lại.');
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (url: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.url !== url));
  };

  const handleSubmit = async () => {
    if (!submissionText && uploadedFiles.length === 0) {
      alert('Vui lòng nhập nội dung hoặc upload file');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn nộp bài?')) {
      return;
    }

    try {
      await submitMutation.mutateAsync({
        assignmentId: Number(assignmentId),
        payload: {
          submission_text: submissionText,
          file_urls: uploadedFiles.map(f => f.url),
        },
      });
      
      alert('Nộp bài thành công!');
      navigate(`/student/courses/${courseId}`);
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Nộp bài thất bại. Vui lòng thử lại.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTimeRemaining = (): string | null => {
    if (!assignment?.due_date) return null;
    
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Đã hết hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
    if (hours > 0) return `Còn ${hours} giờ`;
    return 'Sắp hết hạn';
  };

  if (assignmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy bài tập</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();
  const isOverdue = timeRemaining === 'Đã hết hạn';
  const isNearDeadline = timeRemaining && timeRemaining.includes('giờ');
  const alreadySubmitted = submission?.status === 'submitted';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>{assignment.title}</CardTitle>
              {timeRemaining && (
                <div className={`flex items-center gap-2 mt-2 ${isOverdue ? 'text-red-600' : isNearDeadline ? 'text-orange-600' : 'text-gray-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{timeRemaining}</span>
                </div>
              )}
            </div>
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded">
              {assignment.max_points} điểm
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignment.description && (
            <p className="text-gray-700">{assignment.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
            <div>
              <p className="text-gray-600">Hạn nộp</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {assignment.due_date ? new Date(assignment.due_date).toLocaleString('vi-VN') : 'Chưa có'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Hình thức nộp</p>
              <p className="font-medium text-gray-900 mt-1">
                {(assignment as any).submission_type === 'text' && 'Nhập văn bản'}
                {(assignment as any).submission_type === 'file' && 'Upload file'}
                {(assignment as any).submission_type === 'both' && 'Văn bản + File'}
              </p>
            </div>
          </div>

          {assignment.instructions && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn:</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Status */}
      {alreadySubmitted && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Đã nộp bài</p>
                <p className="text-sm text-gray-600">
                  Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}
                </p>
                {submission.score !== null && (
                  <p className="text-sm text-gray-600">
                    Điểm: {submission.score}/{assignment.max_points}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {!alreadySubmitted && !isOverdue && (
        <>
          {/* Text Submission */}
          {((assignment as any).submission_type === 'text' || (assignment as any).submission_type === 'both') && (
            <Card>
              <CardHeader>
                <CardTitle>Nộp bài văn bản</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Nhập nội dung bài làm của bạn..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </CardContent>
            </Card>
          )}

          {/* File Upload */}
          {((assignment as any).submission_type === 'file' || (assignment as any).submission_type === 'both') && (
            <Card>
              <CardHeader>
                <CardTitle>Upload file</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    Click để chọn file hoặc kéo thả vào đây
                  </p>
                  <p className="text-sm text-gray-500">
                    Tối đa {assignment.max_file_size_mb || 10}MB
                  </p>
                  {assignment.allowed_file_types && assignment.allowed_file_types.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cho phép: {assignment.allowed_file_types.join(', ').toUpperCase()}
                    </p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept={assignment.allowed_file_types?.map((t: string) => `.${t}`).join(',')}
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đang upload...</span>
                      <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">File đã upload:</p>
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.url)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/student/courses/${courseId}`)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="gap-2"
            >
              {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </>
      )}

      {/* Overdue Warning */}
      {isOverdue && !alreadySubmitted && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Đã hết hạn nộp bài</p>
                {assignment.allow_late_submission && (
                  <p className="text-sm text-gray-600">
                    Nộp muộn sẽ bị trừ {assignment.late_penalty_percent}% điểm mỗi ngày
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AssignmentPage;
