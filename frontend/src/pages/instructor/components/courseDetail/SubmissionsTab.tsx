import { useState, useEffect } from 'react';
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
    User,
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
    
    // State cho modal chi tiết bài nộp (bên trái)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isClosingDetailModal, setIsClosingDetailModal] = useState(false);
    const [detailContent, setDetailContent] = useState<{
        type: 'text' | 'file';
        content?: string;
        fileUrl?: string;
        fileName?: string;
    } | null>(null);

    // Hook để chấm bài
    const gradeSubmissionMutation = useGradeSubmission();

    // Cập nhật state khi submissions thay đổi (sau khi lưu điểm)
    useEffect(() => {
        if (selectedSubmission) {
            const updatedSubmission = submissions.find(s => s.id === selectedSubmission.id);
            if (updatedSubmission) {
                // Chỉ cập nhật nếu có thay đổi để tránh loop
                if (updatedSubmission.feedback !== selectedSubmission.feedback || 
                    updatedSubmission.score !== selectedSubmission.score) {
                    setSelectedSubmission(updatedSubmission);
                    setGradingScore(updatedSubmission.score || 0);
                    setGradingFeedback(updatedSubmission.feedback || '');
                }
            }
        }
    }, [submissions, selectedSubmission?.id]);
    
    // Khi modal mở, đảm bảo load submission mới nhất từ props
    useEffect(() => {
        if (showGradingModal && selectedSubmission) {
            const latestSubmission = submissions.find(s => s.id === selectedSubmission.id);
            if (latestSubmission) {
                // Cập nhật state với dữ liệu mới nhất
                setSelectedSubmission(latestSubmission);
                setGradingScore(latestSubmission.score || 0);
                // Đảm bảo feedback được load, kể cả khi là empty string
                setGradingFeedback(latestSubmission.feedback || '');
                
                console.log('[SubmissionsTab] Updated submission state:', {
                    id: latestSubmission.id,
                    score: latestSubmission.score,
                    hasFeedback: !!latestSubmission.feedback,
                    feedbackLength: latestSubmission.feedback?.length || 0,
                    feedbackPreview: latestSubmission.feedback?.substring(0, 50) || 'empty'
                });
            }
        }
    }, [showGradingModal, submissions, selectedSubmission?.id]);

    // Handler để đóng modal chi tiết với animation
    const handleCloseDetailModal = () => {
        setIsClosingDetailModal(true);
        setTimeout(() => {
            setShowDetailModal(false);
            setIsClosingDetailModal(false);
            setDetailContent(null);
        }, 300); // Đợi animation hoàn thành (300ms)
    };

    /**
     * handleGradeSubmission - Hàm xử lý chấm bài, mở modal chấm bài chi tiết
     * @param submissionId - ID của submission
     */
    const handleGradeSubmission = (submissionId: string) => {
        // Luôn tìm submission mới nhất từ props để đảm bảo có feedback đã lưu
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) {
            console.warn('[SubmissionsTab] Submission not found:', submissionId);
            return;
        }

        // Debug log để kiểm tra
        console.log('[SubmissionsTab] Opening modal for submission:', {
            id: submission.id,
            studentName: submission.student_name,
            score: submission.score,
            hasFeedback: !!submission.feedback,
            feedbackLength: submission.feedback?.length || 0,
            feedbackPreview: submission.feedback ? submission.feedback.substring(0, 100) : 'NO FEEDBACK'
        });

        // Đảm bảo load feedback đã lưu (kể cả khi là empty string)
        const feedbackToLoad = submission.feedback ?? '';
        
        setSelectedSubmission(submission);
        setGradingScore(submission.score || 0);
        setGradingFeedback(feedbackToLoad); // Load feedback đã lưu
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
            
            toast.success('Đã lưu điểm và feedback thành công!');
            setShowGradingModal(false);
            setSelectedSubmission(null);
            // Reset state để lần mở tiếp theo load từ submissions mới
            setGradingScore(0);
            setGradingFeedback('');
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

            {/* Container cho cả 2 modal khi modal chi tiết mở */}
            {showGradingModal && selectedSubmission && (() => {
                const maxScore = Number(selectedSubmission.max_score) || 100;
                
                // Nếu modal chi tiết đang mở, render cả 2 modal cạnh nhau
                if (showDetailModal && detailContent) {
                    return (
                        <div className="fixed inset-0 z-50 flex">
                            {/* Backdrop chung */}
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => {
                                    setShowGradingModal(false);
                                    handleCloseDetailModal();
                                }}
                                aria-hidden="true"
                            />
                            
                            {/* Container cho 2 modal cạnh nhau với khoảng cách */}
                            <div className="relative w-full flex items-center justify-center gap-4 px-4">
                                {/* Modal chi tiết - Bên trái (55%) */}
                                <div 
                                    className={`w-[55%] max-w-3xl h-[90vh] bg-white shadow-2xl rounded-lg transition-transform duration-300 ease-out ${
                                        isClosingDetailModal ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                                    }`}
                                    style={!isClosingDetailModal ? { animation: 'slideInFromLeft 0.3s ease-out' } : {}}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="h-full flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {detailContent.type === 'text' ? 'Chi tiết nội dung bài nộp' : `Chi tiết file: ${detailContent.fileName}`}
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {selectedSubmission?.student_name} - {selectedSubmission?.assignment_title}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleCloseDetailModal}
                                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                aria-label="Đóng"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {detailContent.type === 'text' ? (
                                                <div className="prose prose-sm max-w-none">
                                                    <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {detailContent.content}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="h-full">
                                                    {detailContent.fileUrl && (
                                                        <FilePreview url={detailContent.fileUrl} />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200 flex-shrink-0 flex items-center justify-end gap-3">
                                            {detailContent.type === 'file' && detailContent.fileUrl && (
                                                <>
                                                    <a
                                                        href={detailContent.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Mở trong tab mới
                                                    </a>
                                                    <a
                                                        href={detailContent.fileUrl}
                                                        download
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Tải xuống
                                                    </a>
                                                </>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={handleCloseDetailModal}
                                            >
                                                Đóng
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal chấm bài - Bên phải (40%) */}
                                <div 
                                    className="w-[40%] max-w-2xl h-[90vh] bg-white shadow-2xl rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="h-full flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                            <h2 className="text-xl font-semibold text-gray-900">Chấm bài</h2>
                                            <button
                                                onClick={() => {
                                                    setShowGradingModal(false);
                                                    handleCloseDetailModal();
                                                }}
                                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                aria-label="Đóng"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {(() => {
                                                return (
                                                    <div className="space-y-6">
                                                        {/* Thông tin học viên và bài nộp */}
                                                        <Card variant="bordered">
                                                            <CardHeader>
                                                                <CardTitle className="text-lg">Thông tin bài nộp</CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="relative flex-shrink-0">
                                                                        <img
                                                                            src={getAvatarUrl(selectedSubmission.student_avatar, selectedSubmission.student_name)}
                                                                            alt={selectedSubmission.student_name}
                                                                            className="w-16 h-16 rounded-full bg-gray-200 object-cover"
                                                                        />
                                                                        {selectedSubmission.status === 'graded' && (
                                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="w-4 h-4 text-gray-500" />
                                                                            <span className="font-semibold text-gray-900">{selectedSubmission.student_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                                            <span className="text-gray-700">{selectedSubmission.assignment_title}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <Calendar className="w-4 h-4" />
                                                                                Nộp lúc: {formatDateTime(selectedSubmission.submitted_at)}
                                                                            </span>
                                                                            {selectedSubmission.status === 'graded' && selectedSubmission.graded_at && (
                                                                                <span className="flex items-center gap-1.5">
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                    Chấm lần cuối: {formatDateTime(selectedSubmission.graded_at)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {selectedSubmission.is_late && (
                                                                                <Badge variant="warning" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                                                                    Nộp muộn {selectedSubmission.late_duration && `(${selectedSubmission.late_duration})`}
                                                                                </Badge>
                                                                            )}
                                                                            <Badge 
                                                                                variant={selectedSubmission.status === 'graded' ? 'success' : 'default'}
                                                                                className={selectedSubmission.status === 'graded' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}
                                                                            >
                                                                                {selectedSubmission.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Grading Form */}
                                                        <Card variant="bordered">
                                                            <CardHeader>
                                                                <CardTitle className="text-lg flex items-center gap-2">
                                                                    <Award className="w-5 h-5 text-blue-600" />
                                                                    Chấm điểm
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-5">
                                                                {/* Score Input */}
                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                                        Điểm số <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            max={maxScore}
                                                                            step="0.5"
                                                                            value={gradingScore}
                                                                            onChange={(e) => setGradingScore(parseFloat(e.target.value) || 0)}
                                                                            className="w-28 text-center text-xl font-bold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg py-2.5"
                                                                        />
                                                                        <span className="text-gray-400 text-xl">/</span>
                                                                        <span className="text-xl font-bold text-gray-700">
                                                                            {maxScore.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    {/* Quick score buttons */}
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {[0, 25, 50, 75, 100].map(percent => {
                                                                            const score = Math.round((percent / 100) * maxScore * 10) / 10;
                                                                            const isActive = Math.abs(gradingScore - score) < 0.01;
                                                                            return (
                                                                                <button
                                                                                    key={percent}
                                                                                    onClick={() => setGradingScore(score)}
                                                                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[65px] ${
                                                                                        isActive
                                                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
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
                                                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                                        Nhận xét / Feedback
                                                                    </label>
                                                                    <textarea
                                                                        value={gradingFeedback}
                                                                        onChange={(e) => setGradingFeedback(e.target.value)}
                                                                        placeholder="Nhập nhận xét cho học viên..."
                                                                        rows={7}
                                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm text-gray-700 leading-relaxed transition-colors bg-white"
                                                                    />
                                                                    {/* Quick feedback templates */}
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        {['Tốt', 'Cần cải thiện', 'Chưa đạt yêu cầu'].map(template => (
                                                                            <button
                                                                                key={template}
                                                                                onClick={() => setGradingFeedback(prev => prev ? `${prev}\n${template}` : template)}
                                                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-transparent hover:border-gray-300"
                                                                            >
                                                                                + {template}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200 flex-shrink-0 flex items-center justify-end gap-3">
                                            <p className="text-sm text-gray-500 flex-1">
                                                {selectedSubmission.status === 'graded' && selectedSubmission.graded_at && (
                                                    <>Chấm lần cuối: {formatDateTime(selectedSubmission.graded_at)}</>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowGradingModal(false);
                                                        handleCloseDetailModal();
                                                    }}
                                                    disabled={gradeSubmissionMutation.isPending}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    onClick={handleSaveGrade}
                                                    disabled={gradeSubmissionMutation.isPending || gradingScore < 0 || gradingScore > maxScore}
                                                    isLoading={gradeSubmissionMutation.isPending}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Lưu điểm
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                // Nếu chỉ có modal chấm bài, render bình thường
                return (
                <Modal 
                    isOpen={showGradingModal} 
                    onClose={() => setShowGradingModal(false)} 
                    size="6xl"
                    title="Chấm bài"
                >
                    <div className="space-y-6">
                        {/* Thông tin học viên và bài nộp */}
                        <Card variant="bordered">
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin bài nộp</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={getAvatarUrl(selectedSubmission.student_avatar, selectedSubmission.student_name)}
                                            alt={selectedSubmission.student_name}
                                            className="w-16 h-16 rounded-full bg-gray-200 object-cover"
                                        />
                                        {selectedSubmission.status === 'graded' && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="font-semibold text-gray-900">{selectedSubmission.student_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-700">{selectedSubmission.assignment_title}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                Nộp lúc: {formatDateTime(selectedSubmission.submitted_at)}
                                            </span>
                                            {selectedSubmission.status === 'graded' && selectedSubmission.graded_at && (
                                                <span className="flex items-center gap-1.5">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Chấm lần cuối: {formatDateTime(selectedSubmission.graded_at)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedSubmission.is_late && (
                                                <Badge variant="warning" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                                    Nộp muộn {selectedSubmission.late_duration && `(${selectedSubmission.late_duration})`}
                                                </Badge>
                                            )}
                                            <Badge 
                                                variant={selectedSubmission.status === 'graded' ? 'success' : 'default'}
                                                className={selectedSubmission.status === 'graded' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}
                                            >
                                                {selectedSubmission.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content - 2 columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Submission Content */}
                            <Card variant="bordered">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Nội dung bài nộp
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Text submission */}
                                    {selectedSubmission.submission_text ? (
                                        <button
                                    onClick={() => {
                                        setDetailContent({
                                            type: 'text',
                                            content: selectedSubmission.submission_text,
                                        });
                                        setIsClosingDetailModal(false);
                                        setShowDetailModal(true);
                                    }}
                                            className="w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 hover:border-blue-300 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-500">Nội dung văn bản</span>
                                                <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
                                                {selectedSubmission.submission_text}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-2 font-medium">Click để xem chi tiết →</p>
                                        </button>
                                    ) : (
                                        !selectedSubmission.file_urls?.length && (
                                            <p className="text-sm text-gray-400 italic text-center py-4">
                                                Không có nội dung văn bản
                                            </p>
                                        )
                                    )}

                                    {/* File attachments */}
                                    {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                File đính kèm ({selectedSubmission.file_urls.length})
                                            </p>
                                            {selectedSubmission.file_urls.map((url, index) => {
                                                const fileName = getFileNameFromUrl(url);
                                                const isPreviewOpen = previewFileUrl === url;
                                                
                                                return (
                                                    <Card key={index} variant="bordered" padding="none" className="overflow-hidden">
                                                        {/* File header */}
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                {getFileIcon(url)}
                                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                                    {fileName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setDetailContent({
                                                                            type: 'file',
                                                                            fileUrl: url,
                                                                            fileName: fileName,
                                                                        });
                                                                        setShowDetailModal(true);
                                                                    }}
                                                                    className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                                    Xem chi tiết
                                                                </Button>
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center gap-1.5 h-7 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    Mở
                                                                </a>
                                                                <a
                                                                    href={url}
                                                                    download
                                                                    className="inline-flex items-center justify-center gap-1.5 h-7 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                    Tải
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!selectedSubmission.submission_text && (!selectedSubmission.file_urls || selectedSubmission.file_urls.length === 0) && (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Không có nội dung bài nộp</p>
                                        </div>
                                    )}

                                    {/* AI Feedback Generator */}
                                    <AiFeedbackGenerator
                                        assignmentId={assignmentId}
                                        submissionId={selectedSubmission.id}
                                        submissionContent={selectedSubmission.submission_text || ''}
                                        fileUrls={selectedSubmission.file_urls}
                                        studentName={selectedSubmission.student_name}
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
                                </CardContent>
                            </Card>

                            {/* Right: Grading Form */}
                            <Card variant="bordered">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Chấm điểm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {/* Score Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Điểm số <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={maxScore}
                                                step="0.5"
                                                value={gradingScore}
                                                onChange={(e) => setGradingScore(parseFloat(e.target.value) || 0)}
                                                className="w-28 text-center text-xl font-bold border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg py-2.5"
                                            />
                                            <span className="text-gray-400 text-xl">/</span>
                                            <span className="text-xl font-bold text-gray-700">
                                                {maxScore.toFixed(2)}
                                            </span>
                                        </div>
                                        {/* Quick score buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {[0, 25, 50, 75, 100].map(percent => {
                                                const score = Math.round((percent / 100) * maxScore * 10) / 10;
                                                const isActive = Math.abs(gradingScore - score) < 0.01;
                                                return (
                                                    <button
                                                        key={percent}
                                                        onClick={() => setGradingScore(score)}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[65px] ${
                                                            isActive
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
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
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Nhận xét / Feedback
                                        </label>
                                        <textarea
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                            placeholder="Nhập nhận xét cho học viên..."
                                            rows={7}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm text-gray-700 leading-relaxed transition-colors bg-white"
                                        />
                                        {/* Quick feedback templates */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {['Tốt', 'Cần cải thiện', 'Chưa đạt yêu cầu'].map(template => (
                                                <button
                                                    key={template}
                                                    onClick={() => setGradingFeedback(prev => prev ? `${prev}\n${template}` : template)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-transparent hover:border-gray-300"
                                                >
                                                    + {template}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <ModalFooter>
                        <div className="flex items-center justify-between w-full">
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
                                    disabled={gradeSubmissionMutation.isPending || gradingScore < 0 || gradingScore > maxScore}
                                    isLoading={gradeSubmissionMutation.isPending}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Lưu điểm
                                </Button>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>
                );
            })()}
        </div>
    );
}

export default SubmissionsTab;