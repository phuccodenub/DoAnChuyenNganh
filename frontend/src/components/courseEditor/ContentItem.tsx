import { Video, FileText, ListChecks, FileQuestion, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ContentItemProps {
    type: 'video' | 'document' | 'quiz' | 'assignment';
    title: string;
    duration?: number; // in minutes
    isPreview?: boolean;
    isPractice?: boolean; // true = Practice, false = Graded (chỉ áp dụng cho quiz/assignment)
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ContentItem({ type, title, duration, isPreview, isPractice, onEdit, onDelete }: ContentItemProps) {
    const getIcon = () => {
        switch (type) {
            case 'video': return Video;
            case 'document': return FileText;
            case 'quiz': return ListChecks;
            case 'assignment': return FileQuestion;
            default: return FileText;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'video': return 'text-blue-600';
            case 'document': return 'text-green-600';
            case 'quiz': return 'text-purple-600';
            case 'assignment': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const Icon = getIcon();

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <Icon className={`w-5 h-5 ${getColor()}`} />
            <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{title}</span>
                    {isPreview && (
                        <Badge variant="info" size="sm">
                            Xem trước
                        </Badge>
                    )}
                    {(type === 'quiz' || type === 'assignment') && isPractice !== undefined && (
                        <Badge 
                            variant={isPractice ? "warning" : "success"} 
                            size="sm"
                        >
                            {isPractice ? 'Luyện tập' : 'Tính điểm'}
                        </Badge>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa"
                    >
                        <span className="text-xs">Chỉnh sửa</span>
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                    >
                        <span className="text-xs">Xóa</span>
                    </button>
                )}
            </div>
        </div>
    );
}