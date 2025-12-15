import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Upload,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileText,
    MessageSquare,
    ArrowLeft,
    Home,
    BookOpen,
    Calendar,
    X,
    Eye,
    Image,
    File,
    ExternalLink,
    Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Submission, AssignmentStats } from './types';
import { ROUTES } from '@/constants/routes';
import { useGradeSubmission } from '@/hooks/useAssignments';
import { AiFeedbackGenerator } from '@/components/instructor';
import toast from 'react-hot-toast';

/**
 * SubmissionsTab Component
 *
 * Hiển thị danh sách bài nộp của học viên cho một assignment cụ thể.
 * Bao gồm:
 * - Khu vực Tổng quan (Header Stats): Breadcrumb, Metric Cards
 * - Thanh công cụ & Bộ lọc (Toolbar & Filters): Tìm kiếm, lọc trạng thái, nhóm, nút tác vụ
 * - Danh sách bài nộp (Main Data Table): Bảng với các cột Sinh viên, Trạng thái, Ngày nộp, File/Nội dung, Điểm số, Feedback, Hành động
 *
 * TODO: API call - GET /api/instructor/courses/:courseId/assignments/:assignmentId/submissions
 * TODO: API call - GET /api/instructor/courses/:courseId/assignments/:assignmentId/stats
 * TODO: API call - POST /api/instructor/submissions/:submissionId/grade (quick grade)
 * TODO: API call - POST /api/instructor/assignments/:assignmentId/download-all
 * TODO: API call - POST /api/instructor/assignments/:assignmentId/import-grades
 * TODO: API call - POST /api/instructor/assignments/:assignmentId/release-grades
 */
interface SubmissionsTabProps {
    submissions: Submission[];
    assignmentStats: AssignmentStats;
    assignmentTitle: string;
    courseTitle: string;
    courseId: string;
    assignmentId: string;
    assignmentInstructions?: string; // Instructions for the assignment
    assignmentQuestions?: any[]; // For auto-grading
    onBack: () => void; // Callback để quay lại danh sách assignments
}

/**
 * getStatusBadge - Hàm lấy badge trạng thái cho submission
 * @param status - Trạng thái submission ('pending' | 'graded' | 'missing')
 * @param isLate - Có nộp muộn không
 * @param lateDuration - Thời gian trễ (optional)
 * @returns JSX.Element - Badge component
 */
const getStatusBadge = (status: Submission['status'], isLate: boolean, lateDuration?: string): JSX.Element => {
    if (status === 'missing') {
        return (
            <Badge variant="danger" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Chưa nộp
            </Badge>
        );
    }

    if (isLate) {
        return (
            <Badge variant="warning" className="gap-1 bg-orange-100 text-orange-700">
                <Clock className="w-3 h-3" />
                Nộp muộn {lateDuration && `(${lateDuration})`}
            </Badge>
        );
    }

    if (status === 'graded') {
        return (
            <Badge variant="default" className="gap-1 bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Đã chấm
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="gap-1">
            <Clock className="w-3 h-3" />
            Chờ chấm
        </Badge>
    );
};

/**
 * formatDateTime - Hàm format ngày giờ theo định dạng Việt Nam
 * @param dateString - Chuỗi ISO date
 * @returns string - Ngày giờ đã format
 */
const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'Chưa nộp';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * getAvatarUrl - Hàm lấy URL avatar của sinh viên
 * @param studentAvatar - URL avatar từ data
 * @param studentName - Tên sinh viên để tạo avatar mặc định
 * @returns string - URL avatar
 */
const getAvatarUrl = (studentAvatar?: string, studentName?: string): string => {
    if (studentAvatar) return studentAvatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName || 'Unknown')}&size=40&background=3B82F6&color=fff`;
};

/**
 * getFileNameFromUrl - Trích xuất tên file từ URL
 */
const getFileNameFromUrl = (url: string | null | undefined): string => {
    if (!url || url === 'null' || url === 'undefined') return 'file';
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || 'file';
        // Decode URI component and remove any query params
        return decodeURIComponent(filename.split('?')[0]);
    } catch {
        return url.split('/').pop()?.split('?')[0] || 'file';
    }
};

/**
 * getFileType - Xác định loại file từ URL hoặc tên file
 */
const getFileType = (url: string | null | undefined): 'image' | 'pdf' | 'document' | 'other' => {
    if (!url || url === 'null' || url === 'undefined') return 'other';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/)) return 'image';
    if (lowerUrl.match(/\.pdf(\?|$)/)) return 'pdf';
    if (lowerUrl.match(/\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf)(\?|$)/)) return 'document';
    return 'other';
};

/**
 * getFileIcon - Lấy icon phù hợp với loại file
 */
const getFileIcon = (url: string | null | undefined) => {
    const type = getFileType(url);
    switch (type) {
        case 'image': return <Image className="w-4 h-4 text-green-600" />;
        case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
        case 'document': return <FileText className="w-4 h-4 text-blue-600" />;
        default: return <File className="w-4 h-4 text-gray-600" />;
    }
};

/**
 * FilePreview - Component hiển thị preview file với UI cải thiện
 */
const FilePreview = ({ url, compact = false }: { url: string | null | undefined; compact?: boolean }) => {
    // Handle null/undefined URLs
    if (!url || url === 'null' || url === 'undefined') {
        return (
            <div className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50">
                <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">File không khả dụng</p>
            </div>
        );
    }

    const fileType = getFileType(url);
    const fileName = getFileNameFromUrl(url);

    if (fileType === 'image') {
        return (
            <div className="relative group">
                <img 
                    src={url} 
                    alt={fileName}
                    className={`w-full object-contain rounded-lg border border-gray-200 bg-gray-50 ${compact ? 'max-h-[250px]' : 'max-h-[400px]'}`}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                        <ExternalLink className="w-5 h-5 text-gray-700" />
                    </a>
                </div>
            </div>
        );
    }

    if (fileType === 'pdf') {
        return (
            <div className={`border border-gray-200 rounded-lg overflow-hidden bg-gray-50 ${compact ? 'h-[300px]' : 'h-[450px]'}`}>
                <iframe
                    src={`${url}#view=FitH`}
                    title={fileName}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    // For other file types, show a download prompt
    return (
        <div className="border border-gray-200 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Preview không khả dụng cho định dạng này</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Download className="w-4 h-4" />
                Tải xuống
            </a>
        </div>
    );
};

export function SubmissionsTab({
    submissions,
    assignmentStats,
    assignmentTitle,
    courseTitle,
    courseId,
    assignmentId,
    assignmentInstructions,
    assignmentQuestions,
    onBack
}: SubmissionsTabProps) {
    const navigate = useNavigate();

    // State cho filters và search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded' | 'missing'>('all');
    const [groupFilter, setGroupFilter] = useState('all');

    // State cho modal chấm bài
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradingScore, setGradingScore] = useState<number>(0);
    const [gradingFeedback, setGradingFeedback] = useState<string>('');
    
    // State cho file preview
    const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

    // Hook để chấm bài
    const gradeSubmissionMutation = useGradeSubmission();

    /**
     * handleGradeSubmission - Hàm xử lý chấm bài, mở modal chấm bài chi tiết
     * @param submissionId - ID của submission
     */
    const handleGradeSubmission = (submissionId: string) => {
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) return;

        setSelectedSubmission(submission);
        setGradingScore(submission.score || 0);
        setGradingFeedback(submission.feedback || '');
        setShowGradingModal(true);
    };

    /**
     * handleSaveGrade - Hàm lưu điểm và feedback
     */
    const handleSaveGrade = async () => {
        if (!selectedSubmission) return;

        if (gradingScore < 0 || gradingScore > selectedSubmission.max_score) {
            alert(`Điểm phải từ 0 đến ${selectedSubmission.max_score}`);
            return;
        }

        try {
            await gradeSubmissionMutation.mutateAsync({
                submissionId: selectedSubmission.id,
                data: {
                    score: gradingScore,
                    feedback: gradingFeedback || undefined,
                },
            });
            setShowGradingModal(false);
            setSelectedSubmission(null);
        } catch (error) {
            // Error đã được xử lý trong hook
        }
    };

    /**
     * handleDownloadAll - Hàm tải xuống tất cả bài nộp
     */
    const handleDownloadAll = async () => {
        try {
            // TODO: API call - POST /api/instructor/assignments/:assignmentId/download-all
            alert('Đang tải xuống tất cả bài nộp...');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Tải xuống thất bại. Vui lòng thử lại.');
        }
    };

    /**
     * handleImportGrades - Hàm nhập bảng điểm từ Excel
     */
    const handleImportGrades = async () => {
        try {
            // TODO: API call - POST /api/instructor/assignments/:assignmentId/import-grades
            alert('Chức năng nhập bảng điểm đang được phát triển...');
        } catch (error) {
            console.error('Import failed:', error);
            alert('Nhập bảng điểm thất bại. Vui lòng thử lại.');
        }
    };

    /**
     * handleReleaseGrades - Hàm công bố điểm
     */
    const handleReleaseGrades = async () => {
        if (!confirm('Bạn có chắc muốn công bố điểm cho tất cả học viên?')) return;

        try {
            // TODO: API call - POST /api/instructor/assignments/:assignmentId/release-grades
            alert('Đã công bố điểm thành công!');
        } catch (error) {
            console.error('Release grades failed:', error);
            alert('Công bố điểm thất bại. Vui lòng thử lại.');
        }
    };

    /**
     * handleQuickGrade - Hàm chấm điểm nhanh inline (chỉ điểm, không có feedback)
     * @param submissionId - ID submission
     * @param score - Điểm số
     */
    const handleQuickGrade = async (submissionId: string, score: number) => {
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) return;

        if (score < 0 || score > submission.max_score) {
            alert(`Điểm phải từ 0 đến ${submission.max_score}`);
            return;
        }

        try {
            await gradeSubmissionMutation.mutateAsync({
                submissionId,
                data: {
                    score,
                    feedback: submission.feedback || undefined,
                },
            });
        } catch (error) {
            // Error đã được xử lý trong hook
        }
    };

    // Filter submissions dựa trên search và status
    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = !searchQuery ||
            sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.student_mssv && sub.student_mssv.includes(searchQuery));

        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 hover:text-blue-600 text-blue-600 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách bài tập
                </button>
                <span className="text-gray-400">|</span>
                <span className="text-gray-900 font-medium">{assignmentTitle}</span>
                <span className="text-gray-400">&gt;</span>
                <span className="text-gray-900 font-medium">Bài nộp</span>
            </nav>

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tổng số sinh viên */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng số sinh viên</p>
                                <p className="text-2xl font-bold text-gray-900">{assignmentStats.total_students}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Đã nộp */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đã nộp</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {assignmentStats.submitted_count}/{assignmentStats.total_students}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Cần chấm */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Cần chấm</p>
                                <p className="text-2xl font-bold text-orange-600">{assignmentStats.pending_grading_count}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Điểm trung bình */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Điểm trung bình</p>
                                <p className="text-2xl font-bold text-blue-600">{assignmentStats.average_score.toFixed(1)}</p>
                                <p className="text-xs text-gray-500">
                                    Thời hạn: {assignmentStats.is_overdue ? 'Đã quá hạn' : assignmentStats.time_remaining}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc MSSV..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ chấm</option>
                            <option value="graded">Đã chấm</option>
                            <option value="missing">Chưa nộp</option>
                        </select>

                        {/* Group Filter */}
                        <select
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả nhóm</option>
                            <option value="group1">Nhóm 1</option>
                            <option value="group2">Nhóm 2</option>
                        </select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-2">
                                <Download className="w-4 h-4" />
                                Tải xuống tất cả
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleImportGrades} className="gap-2">
                                <Upload className="w-4 h-4" />
                                Nhập bảng điểm
                            </Button>
                            <Button size="sm" onClick={handleReleaseGrades} className="gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Công bố điểm
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Danh sách bài nộp</CardTitle>
                    <p className="text-sm text-gray-600">
                        Hiển thị {filteredSubmissions.length} trên {submissions.length} bài nộp
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sinh viên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày nộp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File/Nội dung
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm số
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Feedback
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubmissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50">
                                        {/* Sinh viên */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getAvatarUrl(submission.student_avatar, submission.student_name)}
                                                    alt={submission.student_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{submission.student_name}</p>
                                                    {submission.student_mssv && (
                                                        <p className="text-sm text-gray-500">MSSV: {submission.student_mssv}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(submission.status, submission.is_late, submission.late_duration)}
                                        </td>

                                        {/* Ngày nộp */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDateTime(submission.submitted_at)}
                                        </td>

                                        {/* File/Nội dung */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 max-w-[200px]">
                                                {submission.file_urls && submission.file_urls.length > 0 ? (
                                                    submission.file_urls.slice(0, 2).map((url: string, idx: number) => (
                                                        <button
                                                            key={idx}
                                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm text-left"
                                                            onClick={() => window.open(url, '_blank')}
                                                            title={getFileNameFromUrl(url)}
                                                        >
                                                            {getFileIcon(url)}
                                                            <span className="truncate max-w-[150px]">{getFileNameFromUrl(url)}</span>
                                                        </button>
                                                    ))
                                                ) : submission.submission_text ? (
                                                    <span className="text-sm text-gray-600">Có nội dung text</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Không có file</span>
                                                )}
                                                {submission.file_urls && submission.file_urls.length > 2 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{submission.file_urls.length - 2} file khác
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Điểm số */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {submission.status === 'graded' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {submission.score}/{submission.max_score}
                                                    </span>
                                                </div>
                                            ) : submission.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={submission.max_score}
                                                        placeholder="..."
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                        onBlur={(e) => {
                                                            const score = parseFloat(e.target.value);
                                                            if (!isNaN(score)) {
                                                                handleQuickGrade(submission.id, score);
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-500">/{submission.max_score}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>

                                        {/* Feedback */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {submission.feedback ? (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-sm">Có</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Chưa có</span>
                                            )}
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Button
                                                size="sm"
                                                onClick={() => handleGradeSubmission(submission.id)}
                                                disabled={submission.status === 'missing'}
                                            >
                                                Chấm bài
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSubmissions.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không có bài nộp nào phù hợp với bộ lọc</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal chấm bài chi tiết - Full-size Professional Design */}
            {showGradingModal && selectedSubmission && (
                <Modal isOpen={showGradingModal} onClose={() => setShowGradingModal(false)} size="6xl">
                    {/* Header với gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={getAvatarUrl(selectedSubmission.student_avatar, selectedSubmission.student_name)}
                                    alt={selectedSubmission.student_name}
                                    className="w-14 h-14 rounded-full border-2 border-white/30 shadow-lg"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedSubmission.student_name}</h3>
                                    <p className="text-sm text-blue-100 mt-1">{selectedSubmission.assignment_title}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGradingModal(false)}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <ModalBody className="p-0">
                        <div className="divide-y divide-gray-200">
                            {/* Info Bar */}
                            <div className="px-8 py-4 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-5 text-sm">
                                    <span className="flex items-center gap-1.5 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        Nộp lúc: {formatDateTime(selectedSubmission.submitted_at)}
                                    </span>
                                    {selectedSubmission.is_late && (
                                        <Badge variant="warning" className="bg-orange-100 text-orange-700 text-xs">
                                            Nộp muộn {selectedSubmission.late_duration && `(${selectedSubmission.late_duration})`}
                                        </Badge>
                                    )}
                                </div>
                                <Badge 
                                    variant={selectedSubmission.status === 'graded' ? 'success' : 'default'}
                                    className={selectedSubmission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                >
                                    {selectedSubmission.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                                </Badge>
                            </div>

                            {/* Main Content - 2 columns on larger screens */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                                {/* Left: Submission Content */}
                                <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto">
                                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Nội dung bài nộp
                                    </h4>

                                    {/* Text submission */}
                                    {selectedSubmission.submission_text ? (
                                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {selectedSubmission.submission_text}
                                            </p>
                                        </div>
                                    ) : (
                                        !selectedSubmission.file_urls?.length && (
                                            <p className="text-sm text-gray-400 italic">Không có nội dung văn bản</p>
                                        )
                                    )}

                                    {/* File attachments */}
                                    {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-gray-600">
                                                File đính kèm ({selectedSubmission.file_urls.length})
                                            </p>
                                            {selectedSubmission.file_urls.map((url, index) => {
                                                const fileName = getFileNameFromUrl(url);
                                                const isPreviewOpen = previewFileUrl === url;
                                                
                                                return (
                                                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                        {/* File header */}
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {getFileIcon(url)}
                                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                                    {fileName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => setPreviewFileUrl(isPreviewOpen ? null : url)}
                                                                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                                        isPreviewOpen 
                                                                            ? 'bg-blue-100 text-blue-700' 
                                                                            : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    {isPreviewOpen ? 'Ẩn' : 'Xem'}
                                                                </button>
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    Mở
                                                                </a>
                                                                <a
                                                                    href={url}
                                                                    download
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                    Tải
                                                                </a>
                                                            </div>
                                                        </div>
                                                        {/* File preview */}
                                                        {isPreviewOpen && (
                                                            <div className="p-3">
                                                                <FilePreview url={url} compact />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!selectedSubmission.submission_text && (!selectedSubmission.file_urls || selectedSubmission.file_urls.length === 0) && (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">Không có nội dung bài nộp</p>
                                        </div>
                                    )}

                                    {/* AI Feedback Generator */}
                                    <AiFeedbackGenerator
                                        assignmentId={assignmentId}
                                        submissionId={selectedSubmission.id}
                                        submissionContent={selectedSubmission.submission_text || selectedSubmission.file_urls?.join('\n') || ''}
                                        assignmentInstructions={assignmentInstructions || assignmentTitle}
                                        maxScore={selectedSubmission.max_score}
                                        assignmentQuestions={assignmentQuestions}
                                        submissionAnswers={{}}
                                        onFeedbackGenerated={(feedback) => {
                                            if (feedback.feedback?.score !== undefined) {
                                                setGradingScore(feedback.feedback.score);
                                            }
                                            if (feedback.feedback?.feedback) {
                                                setGradingFeedback(feedback.feedback.feedback);
                                            }
                                            toast.success('Đã tạo feedback từ AI');
                                        }}
                                        onAutoGraded={(grade) => {
                                            setGradingScore(grade.score);
                                            toast.success('Đã chấm điểm tự động');
                                        }}
                                    />
                                </div>

                                {/* Right: Grading Form */}
                                <div className="p-8 space-y-6 bg-gray-50/50">
                                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Chấm điểm
                                    </h4>

                                    {/* Score Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Điểm số <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={selectedSubmission.max_score}
                                                    step="0.5"
                                                    value={gradingScore}
                                                    onChange={(e) => setGradingScore(parseFloat(e.target.value) || 0)}
                                                    className="w-24 text-center text-lg font-semibold"
                                                />
                                            </div>
                                            <span className="text-gray-500">/</span>
                                            <span className="text-lg font-semibold text-gray-700">{selectedSubmission.max_score}</span>
                                        </div>
                                        {/* Quick score buttons */}
                                        <div className="flex gap-2 mt-3">
                                            {[0, 25, 50, 75, 100].map(percent => {
                                                const score = Math.round((percent / 100) * selectedSubmission.max_score * 10) / 10;
                                                return (
                                                    <button
                                                        key={percent}
                                                        onClick={() => setGradingScore(score)}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                                            gradingScore === score
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {percent}%
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhận xét / Feedback
                                        </label>
                                        <textarea
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                            placeholder="Nhập nhận xét cho học viên..."
                                            rows={5}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                        />
                                        {/* Quick feedback templates */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['Tốt', 'Cần cải thiện', 'Chưa đạt yêu cầu'].map(template => (
                                                <button
                                                    key={template}
                                                    onClick={() => setGradingFeedback(prev => prev ? `${prev}\n${template}` : template)}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    + {template}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {selectedSubmission.status === 'graded' && selectedSubmission.graded_at && (
                                <>Chấm lần cuối: {formatDateTime(selectedSubmission.graded_at)}</>
                            )}
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowGradingModal(false)}
                                disabled={gradeSubmissionMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSaveGrade}
                                disabled={gradeSubmissionMutation.isPending || gradingScore < 0 || gradingScore > selectedSubmission.max_score}
                                className="gap-2"
                            >
                                {gradeSubmissionMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Lưu điểm
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default SubmissionsTab;