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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Submission, AssignmentStats } from './types';
import { ROUTES } from '@/constants/routes';

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

export function SubmissionsTab({
    submissions,
    assignmentStats,
    assignmentTitle,
    courseTitle,
    courseId,
    assignmentId,
    onBack
}: SubmissionsTabProps) {
    const navigate = useNavigate();

    // State cho filters và search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded' | 'missing'>('all');
    const [groupFilter, setGroupFilter] = useState('all');

    /**
     * handleGradeSubmission - Hàm xử lý chấm bài, điều hướng đến GradingPage
     * @param submissionId - ID của submission
     */
    const handleGradeSubmission = (submissionId: string) => {
        // TODO: Navigate to grading page with submission context
        // navigate(`/instructor/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`);
        navigate(ROUTES.INSTRUCTOR.GRADES); // Temporary navigation to general grading page
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
     * handleQuickGrade - Hàm chấm điểm nhanh inline
     * @param submissionId - ID submission
     * @param score - Điểm số
     */
    const handleQuickGrade = async (submissionId: string, score: number) => {
        try {
            // TODO: API call - POST /api/instructor/submissions/:submissionId/quick-grade
            console.log('Quick grade:', submissionId, score);
            alert(`Đã cập nhật điểm ${score} cho bài nộp`);
        } catch (error) {
            console.error('Quick grade failed:', error);
            alert('Cập nhật điểm thất bại. Vui lòng thử lại.');
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
                                            <div className="flex flex-col gap-1">
                                                {submission.file_urls && submission.file_urls.length > 0 ? (
                                                    submission.file_urls.map((url: string, idx: number) => (
                                                        <button
                                                            key={idx}
                                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                                            onClick={() => window.open(url, '_blank')}
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            {url}
                                                        </button>
                                                    ))
                                                ) : submission.submission_text ? (
                                                    <span className="text-sm text-gray-600">Có nội dung text</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Không có file</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Điểm số */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {submission.status === 'graded' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {submission.score}/{submission.max_points}
                                                    </span>
                                                </div>
                                            ) : submission.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={submission.max_points}
                                                        placeholder="..."
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                        onBlur={(e) => {
                                                            const score = parseFloat(e.target.value);
                                                            if (!isNaN(score)) {
                                                                handleQuickGrade(submission.id, score);
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-500">/{submission.max_points}</span>
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
        </div>
    );
}

export default SubmissionsTab;