import { Video, FileText, ListChecks, FileQuestion } from 'lucide-react';

interface ContentTypeSelectorProps {
    onSelect: (type: 'video' | 'document' | 'quiz' | 'assignment') => void;
    className?: string;
}

export function ContentTypeSelector({ onSelect, className = '' }: ContentTypeSelectorProps) {
    const contentTypes = [
        {
            type: 'video' as const,
            label: 'Video',
            icon: Video,
            color: 'text-blue-600 hover:bg-blue-50'
        },
        {
            type: 'document' as const,
            label: 'Document',
            icon: FileText,
            color: 'text-green-600 hover:bg-green-50'
        },
        {
            type: 'quiz' as const,
            label: 'Quiz',
            icon: ListChecks,
            color: 'text-purple-600 hover:bg-purple-50'
        },
        {
            type: 'assignment' as const,
            label: 'Assignment',
            icon: FileQuestion,
            color: 'text-orange-600 hover:bg-orange-50'
        }
    ];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {contentTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                    key={type}
                    onClick={() => onSelect(type)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 ${color} transition-colors`}
                    title={`Add ${label}`}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}