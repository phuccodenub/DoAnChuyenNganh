import { useState } from 'react';
import {
    FileText,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Assignment } from './types';

/**
 * AssignmentsListTab Component
 *
 * Hiển thị danh sách bài tập trong khóa học.
 * Khi nhấn vào một bài tập, sẽ chuyển đến SubmissionsTab để xem bài nộp.
 *
 * TODO: API call - GET /api/instructor/courses/:courseId/assignments
 */
interface AssignmentsListTabProps {
    assignments: Assignment[];
    onSelectAssignment: (assignment: Assignment) => void;
    onCreateAssignment?: () => void;
}

/**
 * formatDate - Hàm format ngày theo định dạng Việt Nam
 * @param dateString - Chuỗi ISO date
 * @returns string - Ngày đã format
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

/**
 * getTimeRemaining - Hàm tính thời gian còn lại đến deadline
 * @param dueDate - Ngày deadline
 * @returns object - Thông tin thời gian còn lại
 */
const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs <= 0) {
        return { isOverdue: true, text: 'Đã quá hạn' };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return { isOverdue: false, text: `${days} ngày ${hours} giờ` };
    } else if (hours > 0) {
        return { isOverdue: false, text: `${hours} giờ` };
    } else {
        return { isOverdue: false, text: 'Sắp hết hạn' };
    }
};

/**
 * getAssignmentTypeIcon - Hàm lấy icon cho loại assignment
 * @param type - Loại assignment
 * @returns JSX.Element - Icon component
 */
const getAssignmentTypeIcon = (type: Assignment['type']) => {
    return type === 'assignment' ? (
        <FileText className="w-5 h-5 text-blue-600" />
    ) : (
        <CheckCircle className="w-5 h-5 text-green-600" />
    );
};

/**
 * getAssignmentTypeLabel - Hàm lấy label cho loại assignment
 * @param type - Loại assignment
 * @returns string - Label
 */
const getAssignmentTypeLabel = (type: Assignment['type']) => {
    return type === 'assignment' ? 'Bài tập' : 'Bài kiểm tra';
};

export function AssignmentsListTab({
    assignments,
    onSelectAssignment,
    onCreateAssignment
}: AssignmentsListTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'assignment' | 'quiz'>('all');

    // Filter assignments dựa trên search và type
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = !searchQuery ||
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = typeFilter === 'all' || assignment.type === typeFilter;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bài tập và bài kiểm tra</h2>
                    <p className="text-sm text-gray-500">{assignments.length} bài tập trong khóa học</p>
                </div>
                {onCreateAssignment && (
                    <Button onClick={onCreateAssignment} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo bài tập mới
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm bài tập..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="assignment">Bài tập</option>
                            <option value="quiz">Bài kiểm tra</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Assignments List */}
            <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Không có bài tập nào</p>
                            {onCreateAssignment && (
                                <Button onClick={onCreateAssignment} className="mt-4">
                                    Tạo bài tập đầu tiên
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredAssignments.map((assignment) => {
                        const timeRemaining = getTimeRemaining(assignment.due_date);

                        return (
                            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                {getAssignmentTypeIcon(assignment.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-1">
                                                            {assignment.title}
                                                        </h3>
                                                        {assignment.description && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {assignment.description}
                                                            </p>
                                                        )}

                                                        {/* Meta info */}
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <Badge variant="default" className="text-xs">
                                                                    {getAssignmentTypeLabel(assignment.type)}
                                                                </Badge>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                Hạn: {formatDate(assignment.due_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {assignment.max_score} điểm
                                                            </span>
                                                        </div>

                                                        {/* Associated lesson */}
                                                        {assignment.lesson_title && (
                                                            <p className="text-sm text-gray-600">
                                                                Thuộc bài học: {assignment.lesson_title}
                                                                {assignment.section_title && ` (${assignment.section_title})`}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Status & Action */}
                                                    <div className="flex flex-col items-end gap-3">
                                                        {/* Time remaining */}
                                                        <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${timeRemaining.isOverdue
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {timeRemaining.isOverdue ? (
                                                                <AlertTriangle className="w-4 h-4" />
                                                            ) : (
                                                                <Clock className="w-4 h-4" />
                                                            )}
                                                            {timeRemaining.text}
                                                        </div>

                                                        {/* Action button */}
                                                        <Button
                                                            size="sm"
                                                            onClick={() => onSelectAssignment(assignment)}
                                                            className="gap-2"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Xem bài nộp
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default AssignmentsListTab;