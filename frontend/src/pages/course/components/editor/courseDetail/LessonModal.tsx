import { useState, useRef, useEffect } from 'react';
import {
    X,
    Pencil,
    Check,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    Image,
    Video,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Quote,
    Code,
    Undo,
    Redo,
    Type,
    Heading1,
    Heading2,
    Heading3,
    UploadCloud, // Icon mới
    MonitorPlay, // Icon mới
    Trash2,      // Icon mới
    FileVideo    // Icon mới
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Lesson, ContentType, contentTypeLabels } from './types';

// Cập nhật Interface
interface LessonFormData {
    title: string;
    content_type: ContentType;
    duration_minutes: number;
    is_preview: boolean;
    video_url: string; // URL video (youtube/vimeo hoặc url file đã upload)
}

interface LessonModalProps {
    isOpen: boolean;
    editingLesson: Lesson | null;
    lessonForm: LessonFormData;
    onFormChange: (form: LessonFormData) => void;
    onSave: () => void;
    onClose: () => void;
}

// ... (ToolbarButton và ToolbarDivider giữ nguyên) ...
interface ToolbarButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    title: string;
    disabled?: boolean;
}

function ToolbarButton({ icon, onClick, active, title, disabled }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-md transition-colors ${active
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

export function LessonModal({
    isOpen,
    editingLesson,
    lessonForm,
    onFormChange,
    onSave,
    onClose,
}: LessonModalProps) {
    // State cơ bản
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(lessonForm.title);
    const [content, setContent] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);

    // State cho Video
    const [videoSourceTab, setVideoSourceTab] = useState<'upload' | 'external'>('upload');
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect: Reset state khi mở modal
    useEffect(() => {
        if (isOpen) {
            setTempTitle(lessonForm.title);
            // Logic để detect đang dùng url ngoài hay file upload dựa trên video_url có thể thêm ở đây
        }
    }, [isOpen, lessonForm.title]);

    if (!isOpen) return null;

    // --- Xử lý Tiêu đề ---
    const handleStartEditTitle = () => {
        setTempTitle(lessonForm.title);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        onFormChange({ ...lessonForm, title: tempTitle });
        setIsEditingTitle(false);
    };

    const handleCancelEditTitle = () => {
        setTempTitle(lessonForm.title);
        setIsEditingTitle(false);
    };

    // --- Xử lý Editor Toolbar (Giữ nguyên các hàm execCommand cũ) ---
    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    // ... (Giữ nguyên các hàm handleBold, handleItalic v.v...)
    const handleBold = () => execCommand('bold');
    const handleItalic = () => execCommand('italic');
    const handleUnderline = () => execCommand('underline');
    const handleStrikethrough = () => execCommand('strikeThrough');
    const handleAlignLeft = () => execCommand('justifyLeft');
    const handleAlignCenter = () => execCommand('justifyCenter');
    const handleAlignRight = () => execCommand('justifyRight');
    const handleAlignJustify = () => execCommand('justifyFull');
    const handleUnorderedList = () => execCommand('insertUnorderedList');
    const handleOrderedList = () => execCommand('insertOrderedList');
    const handleBlockquote = () => execCommand('formatBlock', 'blockquote');
    const handleCode = () => execCommand('formatBlock', 'pre');
    const handleUndo = () => execCommand('undo');
    const handleRedo = () => execCommand('redo');
    const handleHeading1 = () => execCommand('formatBlock', 'h1');
    const handleHeading2 = () => execCommand('formatBlock', 'h2');
    const handleHeading3 = () => execCommand('formatBlock', 'h3');
    const handleParagraph = () => execCommand('formatBlock', 'p');

    const handleInsertLink = () => {
        const url = prompt('Nhập URL:');
        if (url) execCommand('createLink', url);
    };

    const handleInsertImage = () => {
        const url = prompt('Nhập URL hình ảnh:');
        if (url) execCommand('insertImage', url);
    };

    // --- Xử lý Video Attachment ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // Giới hạn 100MB ví dụ
                alert('File quá lớn! Vui lòng chọn file dưới 100MB.');
                return;
            }
            setSelectedVideoFile(file);
            // Tạo URL ảo để preview
            const objectUrl = URL.createObjectURL(file);
            onFormChange({ ...lessonForm, video_url: objectUrl });
        }
    };

    const handleRemoveVideo = () => {
        setSelectedVideoFile(null);
        onFormChange({ ...lessonForm, video_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getVideoIdFromUrl = (url: string) => {
        // Hàm helper đơn giản để lấy ID youtube/vimeo cho thumbnail (nếu cần)
        // Đây chỉ là check cơ bản
        if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('vimeo')) return 'vimeo';
        return 'html5';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] flex flex-col overflow-hidden">

                {/* ================== HEADER ================== */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề bài học..."
                                    className="flex-1 px-3 py-1.5 text-lg font-semibold border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelEditTitle();
                                    }}
                                />
                                <button onClick={handleSaveTitle} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">
                                    <Check className="w-5 h-5" />
                                </button>
                                <button onClick={handleCancelEditTitle} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-gray-900 truncate">
                                    {lessonForm.title || 'Bài học mới'}
                                </h2>
                                <button onClick={handleStartEditTitle} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================== BODY SCROLLABLE ================== */}
                <div className="flex-1 overflow-y-auto">

                    {/* 1. LESSON META */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Loại nội dung</label>
                            <select
                                value={lessonForm.content_type}
                                onChange={(e) => onFormChange({ ...lessonForm, content_type: e.target.value as ContentType })}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                                    <option key={type} value={type}>{contentTypeLabels[type]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Thời lượng (phút)</label>
                            <input
                                type="number"
                                value={lessonForm.duration_minutes}
                                onChange={(e) => onFormChange({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                                min={0}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={lessonForm.is_preview}
                                    onChange={(e) => onFormChange({ ...lessonForm, is_preview: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Cho phép xem trước (Preview)</span>
                            </label>
                        </div>
                    </div>

                    {/* 2. VIDEO ATTACHMENT SECTION - Chỉ hiển thị khi content_type là 'video' */}
                    {lessonForm.content_type === 'video' && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Video className="w-4 h-4 text-blue-600" />
                                    Nội dung Video
                                </h3>

                                {/* Tabs Switcher */}
                                <div className="flex bg-gray-200 p-1 rounded-lg">
                                    <button
                                        onClick={() => setVideoSourceTab('upload')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoSourceTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Tải lên File
                                    </button>
                                    <button
                                        onClick={() => setVideoSourceTab('external')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoSourceTab === 'external' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Link Ngoài (Youtube/Vimeo)
                                    </button>
                                </div>
                            </div>

                            {/* Video Input Area */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                {!lessonForm.video_url ? (
                                    // STATE: Chưa có video
                                    videoSourceTab === 'upload' ? (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                            />
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">Click để tải video lên</p>
                                            <p className="text-xs text-gray-500 mt-1">MP4, WebM hoặc Ogg (Max 100MB)</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Link className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Dán link Youtube hoặc Vimeo vào đây..."
                                                    onBlur={(e) => onFormChange({ ...lessonForm, video_url: e.target.value })}
                                                />
                                            </div>
                                            <Button disabled={!lessonForm.video_url} onClick={() => { }}>
                                                Kiểm tra
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    // STATE: Đã có video (Preview)
                                    <div className="space-y-3">
                                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                                            {videoSourceTab === 'upload' || getVideoIdFromUrl(lessonForm.video_url) === 'html5' ? (
                                                <video
                                                    src={lessonForm.video_url}
                                                    controls
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                // Demo embed cho Youtube/Vimeo (Cần logic parse URL thực tế kỹ hơn)
                                                <iframe
                                                    src={lessonForm.video_url.replace('watch?v=', 'embed/')}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allowFullScreen
                                                />
                                            )}

                                            {/* Overlay Remove Button */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={handleRemoveVideo}
                                                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                                                    title="Xóa video"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {selectedVideoFile ? (
                                                <>
                                                    <FileVideo className="w-4 h-4 text-blue-600" />
                                                    <span className="truncate max-w-md">{selectedVideoFile.name}</span>
                                                    <span className="text-gray-400">({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MonitorPlay className="w-4 h-4 text-green-600" />
                                                    <span className="truncate max-w-md">{lessonForm.video_url}</span>
                                                </>
                                            )}
                                            <button
                                                onClick={handleRemoveVideo}
                                                className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Thay đổi video khác
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2.5. DOCUMENT EDITOR SECTION - Chỉ hiển thị khi content_type là 'document' */}
                    {lessonForm.content_type === 'document' && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-blue-600" />
                                    Nội dung Tài liệu
                                </h3>
                            </div>

                            {/* Document Editor */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {/* Toolbar cho Document */}
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1 flex-wrap">
                                    <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={handleBold} title="Bold" />
                                    <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={handleItalic} title="Italic" />
                                    <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={handleUnderline} title="Underline" />
                                    <ToolbarButton icon={<Strikethrough className="w-4 h-4" />} onClick={handleStrikethrough} title="Strikethrough" />
                                    <ToolbarDivider />
                                    <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={handleHeading1} title="Heading 1" />
                                    <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={handleHeading2} title="Heading 2" />
                                    <ToolbarButton icon={<Heading3 className="w-4 h-4" />} onClick={handleHeading3} title="Heading 3" />
                                    <ToolbarButton icon={<Type className="w-4 h-4" />} onClick={handleParagraph} title="Paragraph" />
                                    <ToolbarDivider />
                                    <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={handleAlignLeft} title="Align Left" />
                                    <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={handleAlignCenter} title="Align Center" />
                                    <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={handleAlignRight} title="Align Right" />
                                    <ToolbarButton icon={<AlignJustify className="w-4 h-4" />} onClick={handleAlignJustify} title="Justify" />
                                    <ToolbarDivider />
                                    <ToolbarButton icon={<List className="w-4 h-4" />} onClick={handleUnorderedList} title="Bullet List" />
                                    <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={handleOrderedList} title="Numbered List" />
                                    <ToolbarDivider />
                                    <ToolbarButton icon={<Link className="w-4 h-4" />} onClick={handleInsertLink} title="Insert Link" />
                                    <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={handleInsertImage} title="Insert Image" />
                                    <ToolbarButton icon={<Code className="w-4 h-4" />} onClick={handleCode} title="Code Block" />
                                    <ToolbarButton icon={<Quote className="w-4 h-4" />} onClick={handleBlockquote} title="Quote" />
                                    <ToolbarDivider />
                                    <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={handleUndo} title="Undo" />
                                    <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={handleRedo} title="Redo" />
                                </div>

                                {/* Editor Area */}
                                <div className="p-6">
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="min-h-[400px] outline-none prose prose-sm max-w-none text-gray-700"
                                        data-placeholder="Nhập nội dung tài liệu chi tiết..."
                                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. DESCRIPTION EDITOR - Ẩn khi content_type là 'document' vì đã có editor riêng */}
                    {lessonForm.content_type !== 'document' && (
                        <div className="flex flex-col min-h-[400px]">
                            <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">Mô tả bài học</h3>
                                {/* Toolbar nhỏ gọn hơn */}
                                <div className="flex items-center gap-1 scale-90 origin-right">
                                    <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={handleBold} title="Bold" />
                                    <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={handleItalic} title="Italic" />
                                    <ToolbarButton icon={<List className="w-4 h-4" />} onClick={handleUnorderedList} title="List" />
                                    <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={handleInsertImage} title="Image" />
                                    {/* Video button ở đây để chèn vào body text nếu cần, nhưng đã có phần attachment ở trên */}
                                </div>
                            </div>

                            <div className="flex-1 p-6 bg-white">
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="min-h-[200px] outline-none prose prose-sm max-w-none text-gray-700"
                                    data-placeholder="Nhập chi tiết bài học, tài liệu bổ sung..."
                                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ================== FOOTER ================== */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {editingLesson ? 'Đang chỉnh sửa' : 'Tạo mới'} • {contentTypeLabels[lessonForm.content_type]}
                        {lessonForm.content_type === 'video' && lessonForm.video_url && ' • Video đã đính kèm'}
                        {lessonForm.content_type === 'document' && ' • Tài liệu có thể chỉnh sửa'}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Hủy bỏ
                        </Button>
                        <Button
                            onClick={onSave}
                            disabled={!lessonForm.title.trim()}
                            className="min-w-[120px]"
                        >
                            {editingLesson ? 'Cập nhật' : 'Tạo bài học'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LessonModal;