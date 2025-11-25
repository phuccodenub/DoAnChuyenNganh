import React, { useRef, useState } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadFiles } from '@/hooks/useFiles';
import clsx from 'clsx';

interface FileUploadProps {
  courseId?: string;
  maxFiles?: number;
  maxSize?: number; // bytes
  acceptedTypes?: string[];
  onFilesUploaded?: (files: any[]) => void;
}

/**
 * File Upload Component with Drag & Drop
 * Supports multiple files with progress tracking
 */
export function FileUpload({
  courseId,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  onFilesUploaded,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadFiles, isPending, progress } = useUploadFiles();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Validate file count
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(
          `File "${file.name}" exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
        );
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    uploadFiles(
      { files: selectedFiles, courseId },
      {
        onSuccess: (data) => {
          setSelectedFiles([]);
          onFilesUploaded?.(data.map((r) => r.file));
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-700 font-medium mb-1">Drag and drop files here</p>
        <p className="text-sm text-gray-500 mb-4">
          or{' '}
          <button
            onClick={handleBrowse}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            browse
          </button>
        </p>

        <p className="text-xs text-gray-500">
          Maximum {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                {/* Progress or Status */}
                {isPending && progress[file.name] !== undefined ? (
                  <div className="w-24">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${progress[file.name]}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-right">
                      {progress[file.name]}%
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRemoveFile(index)}
                    disabled={isPending}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isPending || selectedFiles.length === 0}
            className={clsx(
              'w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors',
              isPending || selectedFiles.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            )}
          >
            {isPending ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
