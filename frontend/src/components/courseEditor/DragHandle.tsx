import { GripVertical } from 'lucide-react';

interface DragHandleProps {
    className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
    return (
        <div className={`cursor-move text-gray-400 hover:text-gray-600 transition-colors ${className}`}>
            <GripVertical className="w-5 h-5" />
        </div>
    );
}