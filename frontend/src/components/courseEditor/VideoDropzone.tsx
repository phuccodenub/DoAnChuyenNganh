import { useState, useRef } from 'react';
import { Upload, X, Video } from 'lucide-react';

interface VideoDropzoneProps {
    label: string;
    value?: string;
    onChange: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    maxDuration?: number; // in seconds
}

export function VideoDropzone({
    label,
    value,
    onChange,
    accept = 'video/*',
    maxSize = 100,
    maxDuration = 300
}: VideoDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Check video duration (this is approximate and may not work in all browsers)
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            if (video.duration > maxDuration) {
                alert(`Video duration must be less than ${maxDuration} seconds`);
                return;
            }
            onChange(file);
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        };
        video.src = URL.createObjectURL(file);
    };

    const removeFile = () => {
        onChange(null);
        setPreview(null);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : preview
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {preview ? (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <video
                                src={preview}
                                controls
                                className="max-w-full max-h-48 rounded-lg shadow-md"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile();
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{fileName}</p>
                            <p className="text-sm text-gray-600">Click to change video</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Video className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900">Upload promotional video</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag and drop a video here, or click to browse
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                MP4 up to {maxSize}MB, max {maxDuration}s
                            </p>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}