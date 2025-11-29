import { Edit, Trash2 } from 'lucide-react';

interface ActionGroupProps {
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}

export function ActionGroup({ onEdit, onDelete, className = '' }: ActionGroupProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                >
                    <Edit className="w-4 h-4" />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}