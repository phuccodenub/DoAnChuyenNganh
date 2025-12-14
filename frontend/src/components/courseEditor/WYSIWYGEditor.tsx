import { useState, useRef, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Link,
    List,
    ListOrdered,
    Quote,
    Code,
    Type
} from 'lucide-react';

interface WYSIWYGEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function WYSIWYGEditor({ value, onChange, placeholder }: WYSIWYGEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                const rect = range.getBoundingClientRect();
                setToolbarPosition({
                    top: rect.top - 50,
                    left: rect.left + rect.width / 2 - 100
                });
                setShowToolbar(true);
            } else {
                setShowToolbar(false);
            }
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="relative">
            {/* Floating Toolbar */}
            {showToolbar && (
                <div
                    className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg p-2 flex gap-1"
                    style={{
                        top: toolbarPosition.top,
                        left: toolbarPosition.left,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        onClick={() => execCommand('bold')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Đậm"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => execCommand('italic')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Nghiêng"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => execCommand('underline')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Gạch chân"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-600 mx-1" />
                    <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Danh sách dấu đầu dòng"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Danh sách đánh số"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-600 mx-1" />
                    <button
                        onClick={() => {
                            const url = prompt('Nhập URL:');
                            if (url) execCommand('createLink', url);
                        }}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Chèn liên kết"
                    >
                        <Link className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => execCommand('formatBlock', 'blockquote')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Trích dẫn"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => execCommand('formatBlock', 'pre')}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Khối mã"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                className="min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-sm max-w-none"
                data-placeholder={placeholder || 'Bắt đầu viết mô tả khóa học của bạn...'}
                style={{
                    outline: 'none'
                }}
            />
        </div>
    );
}