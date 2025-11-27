import { Video, FileText, ListChecks, FileQuestion, Clock } from 'lucide-react';

interface ContentItemProps {
    type: 'video' | 'document' | 'quiz' | 'assignment';
    title: string;
    duration?: number; // in minutes
    isPreview?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ContentItem({ type, title, duration, isPreview, onEdit, onDelete }: ContentItemProps) {
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
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{title}</span>
                    {isPreview && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            Preview
                        </span>
                    )}
                </div>
                {duration && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{duration} minutes</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                    >
                        <span className="text-xs">Edit</span>
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <span className="text-xs">Delete</span>
                    </button>
                )}
            </div>
        </div>
    );
}