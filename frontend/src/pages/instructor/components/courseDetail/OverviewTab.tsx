import {
    Users,
    TrendingUp,
    Award,
    FileText,
    BarChart3,
    AlertTriangle,
    Clock,
    MoreHorizontal,
    MessageSquare,
    BookOpen,
    Settings,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    CourseStats,
    Student,
    TabType,
    ActivityDataPoint,
    LessonCompletionData,
    RecentSubmission,
    AcademicAlert
} from './types';

/**
 * OverviewTab Component
 *
 * Trang tổng quan khóa học cho giảng viên với layout 3 hàng:
 * - Row 1: 4 KPI Cards (Total Enrolled, Avg. Progress, Avg. Score, Pending Grading)
 * - Row 2: 2 Charts (Student Activity Timeline, Lesson Completion Drop-off)
 * - Row 3: 2 Actionable Lists (Recent Submissions, Academic Alerts)
 *
 * @param stats - Thống kê khóa học (CourseStats)
 * @param students - Danh sách học viên (Student[])
 * @param onTabChange - Hàm callback khi chuyển tab (tab: TabType) => void
 * @returns JSX.Element - Component React hiển thị overview
 */
export function OverviewTab({
    stats,
    students,
    onTabChange
}: {
    stats: CourseStats;
    students: Student[];
    onTabChange: (tab: TabType) => void;
}): JSX.Element {
    // ================== MOCK DATA FOR CHARTS & LISTS ==================
    // TODO: Replace with real API data

    /**
     * Mock data cho Student Activity Timeline
     * API cần: GET /api/instructor/courses/:courseId/analytics/activity-timeline
     * Params: { start_date: string, end_date: string, granularity: 'day' | 'week' }
     * Return: ActivityDataPoint[]
     */
    const activityData: ActivityDataPoint[] = [
        { date: '2025-11-20', hours_studied: 45, sessions_count: 12 },
        { date: '2025-11-21', hours_studied: 52, sessions_count: 15 },
        { date: '2025-11-22', hours_studied: 38, sessions_count: 10 },
        { date: '2025-11-23', hours_studied: 61, sessions_count: 18 },
        { date: '2025-11-24', hours_studied: 29, sessions_count: 8 },
        { date: '2025-11-25', hours_studied: 55, sessions_count: 16 },
        { date: '2025-11-26', hours_studied: 48, sessions_count: 14 },
    ];

    /**
     * Mock data cho Lesson Completion Drop-off
     * API cần: GET /api/instructor/courses/:courseId/analytics/lesson-completion
     * Params: { section_id?: string }
     * Return: LessonCompletionData[]
     */
    const lessonCompletionData: LessonCompletionData[] = [
        { lesson_id: '1', lesson_title: 'Giới thiệu React', section_title: 'Chương 1', completion_percentage: 95, total_students: 98, completed_students: 93 },
        { lesson_id: '2', lesson_title: 'Cài đặt môi trường', section_title: 'Chương 1', completion_percentage: 87, total_students: 98, completed_students: 85 },
        { lesson_id: '3', lesson_title: 'JSX Cơ bản', section_title: 'Chương 2', completion_percentage: 78, total_students: 98, completed_students: 76 },
        { lesson_id: '4', lesson_title: 'Components', section_title: 'Chương 2', completion_percentage: 65, total_students: 98, completed_students: 64 },
        { lesson_id: '5', lesson_title: 'State Management', section_title: 'Chương 3', completion_percentage: 52, total_students: 98, completed_students: 51 },
    ];

    /**
     * Mock data cho Recent Submissions
     * API cần: GET /api/instructor/courses/:courseId/submissions/recent
     * Params: { limit: number, status: 'pending' | 'graded' }
     * Return: RecentSubmission[]
     */
    const recentSubmissions: RecentSubmission[] = [
        {
            id: '1',
            student_id: 's1',
            student_name: 'Nguyễn Văn A',
            assignment_title: 'Bài tập React Components',
            lesson_title: 'Components',
            submitted_at: '2025-11-27T10:30:00Z',
            time_ago: '2 hours ago'
        },
        {
            id: '2',
            student_id: 's2',
            student_name: 'Trần Thị B',
            assignment_title: 'Project: Todo App',
            lesson_title: 'State Management',
            submitted_at: '2025-11-27T08:15:00Z',
            time_ago: '4 hours ago'
        },
        {
            id: '3',
            student_id: 's3',
            student_name: 'Lê Văn C',
            assignment_title: 'Quiz: JSX Syntax',
            lesson_title: 'JSX Cơ bản',
            submitted_at: '2025-11-26T16:45:00Z',
            time_ago: '1 day ago'
        },
    ];

    /**
     * Mock data cho Academic Alerts
     * API cần: GET /api/instructor/courses/:courseId/alerts/academic
     * Params: { severity?: 'low' | 'medium' | 'high', limit: number }
     * Return: AcademicAlert[]
     */
    const academicAlerts: AcademicAlert[] = [
        {
            id: '1',
            student_id: 's4',
            student_name: 'Phạm Thị D',
            alert_type: 'low_progress',
            message: 'Tiến độ chỉ 15% sau 2 tuần',
            severity: 'high',
            created_at: '2025-11-26T09:00:00Z'
        },
        {
            id: '2',
            student_id: 's5',
            student_name: 'Hoàng Văn E',
            alert_type: 'missing_deadline',
            message: 'Chưa nộp bài tập Components (quá hạn 3 ngày)',
            severity: 'medium',
            created_at: '2025-11-25T14:30:00Z'
        },
        {
            id: '3',
            student_id: 's6',
            student_name: 'Đỗ Thị F',
            alert_type: 'inactive',
            message: 'Không hoạt động 7 ngày',
            severity: 'low',
            created_at: '2025-11-24T11:15:00Z'
        },
    ];

    // ================== HELPER FUNCTIONS ==================

    /**
     * Render star rating component inline
     * @param rating - Số sao (0-5)
     * @returns JSX.Element
     */
    const renderStars = (rating: number): JSX.Element => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        ★
                    </div>
                ))}
            </div>
        );
    };

    /**
     * Get color class based on score
     * @param score - Điểm số (0-10)
     * @returns string - Tailwind color class
     */
    const getScoreColor = (score: number): string => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    /**
     * Get severity color for alerts
     * @param severity - Mức độ nghiêm trọng
     * @returns string - Tailwind color class
     */
    const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // ================== EVENT HANDLERS ==================

    /**
     * Handle grading a submission
     * @param submissionId - ID của submission
     */
    const handleGradeSubmission = (submissionId: string): void => {
        // TODO: Navigate to grading page
        // API: POST /api/instructor/submissions/:submissionId/grade
        console.log('Grade submission:', submissionId);
    };

    /**
     * Handle contacting student about alert
     * @param studentId - ID của học viên
     * @param alertType - Loại cảnh báo
     */
    const handleContactStudent = (studentId: string, alertType: string): void => {
        // TODO: Open messaging modal or navigate to student detail
        // API: POST /api/instructor/messages/send
        console.log('Contact student:', studentId, 'about:', alertType);
    };

    // ================== RENDER ==================

    return (
        <div className="space-y-6">
            {/* ROW 1: SUMMARY KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Enrolled */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Sĩ số lớp</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.total_students}/{stats.max_students} slots
                                    {stats.new_students_this_week > 0 && (
                                        <span className="text-green-600 ml-1">
                                            +{stats.new_students_this_week} tuần này
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Progress */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Tiến độ TB</p>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12">
                                        {/* Radial Progress Bar */}
                                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#E5E7EB"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#3B82F6"
                                                strokeWidth="3"
                                                strokeDasharray={`${stats.avg_progress}, 100`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-900">{stats.avg_progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Score */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Điểm TB</p>
                                <p className={`text-2xl font-bold ${getScoreColor(stats.avg_score)}`}>
                                    {stats.avg_score.toFixed(1)}/10
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {renderStars(Math.round(stats.avg_score / 2))}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Grading */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Chờ chấm</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.pending_grading}</p>
                                <p className="text-xs text-gray-500 mt-1">bài nộp</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        {stats.pending_grading > 0 && (
                            <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => onTabChange('students')} // TODO: Navigate to grading page
                            >
                                Chấm ngay
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ROW 2: ANALYTICS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Activity Timeline */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Hoạt động học tập
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Simple Bar Chart Simulation */}
                            <div className="flex items-end gap-2 h-32">
                                {activityData.map((data, index) => (
                                    <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-blue-500 rounded-t"
                                            style={{
                                                height: `${(data.hours_studied / 70) * 100}%`,
                                                minHeight: '4px'
                                            }}
                                        />
                                        <span className="text-xs text-gray-500">
                                            {new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>7 ngày qua</span>
                                <span>Tổng: {activityData.reduce((sum, d) => sum + d.hours_studied, 0)} giờ</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lesson Completion Drop-off */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Phễu hoàn thành
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lessonCompletionData.map((lesson) => (
                                <div key={lesson.lesson_id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-900">{lesson.lesson_title}</span>
                                        <span className="text-gray-500">{lesson.completion_percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${lesson.completion_percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {lesson.completed_students}/{lesson.total_students} học viên
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ROW 3: ACTIONABLE WIDGETS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Submissions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Bài nộp gần đây
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentSubmissions.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Chưa có bài nộp nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSubmissions.map((submission) => (
                                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {submission.student_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{submission.student_name}</p>
                                                <p className="text-xs text-gray-500">{submission.assignment_title}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {submission.time_ago}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleGradeSubmission(submission.id)}
                                        >
                                            Chấm
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Academic Alerts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Cảnh báo học vụ
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {academicAlerts.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertTriangle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Không có cảnh báo nào</p>
                                <p className="text-xs text-gray-400 mt-1">Tất cả học viên đều ổn</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {academicAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                                                {alert.student_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-gray-900">{alert.student_name}</p>
                                                    <Badge
                                                        className={`text-xs ${getSeverityColor(alert.severity)}`}
                                                    >
                                                        {alert.severity === 'high' ? 'Cao' :
                                                            alert.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">{alert.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(alert.created_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleContactStudent(alert.student_id, alert.alert_type)}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Empty State for New Courses */}
            {stats.total_students === 0 && (
                <Card className="border-dashed border-2">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Khóa học chưa kích hoạt</h3>
                        <p className="text-gray-500 mb-6">
                            Hãy mời học viên tham gia hoặc xuất bản nội dung để bắt đầu theo dõi tiến độ.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button onClick={() => onTabChange('curriculum')}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Thêm nội dung
                            </Button>
                            <Button variant="outline" onClick={() => onTabChange('settings')}>
                                <Settings className="w-4 h-4 mr-2" />
                                Cài đặt
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default OverviewTab;
