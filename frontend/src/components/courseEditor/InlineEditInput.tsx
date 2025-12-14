import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface InlineEditInputProps {
    value: string;
    onSave: (newValue: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    className?: string;
}

export function InlineEditInput({
    value,
    onSave,
    onCancel,
    placeholder = 'Nhấp để chỉnh sửa...',
    className = ''
}: InlineEditInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setTempValue(value);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (tempValue.trim() && tempValue !== value) {
            onSave(tempValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
        onCancel?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className={`px-2 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
                />
                <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Lưu"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={handleCancel}
                    className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                    title="Hủy"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <span
            onClick={handleStartEdit}
            className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors ${className}`}
            title="Nhấp để chỉnh sửa"
        >
            {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </span>
    );
}