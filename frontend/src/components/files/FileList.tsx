import React, { useState } from 'react';
import {
  File,
  FileText,
  Image,
  Download,
  Trash2,
  Share2,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { useCourseFiles, useDeleteFile, useShareFile } from '@/hooks/useFiles';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface FileListProps {
  courseId: string;
  onFileDeleted?: (fileId: string) => void;
}

/**
 * File List Component
 * Displays course files with download, share, and delete options
 */
export function FileList({ courseId, onFileDeleted }: FileListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCourseFiles(courseId, page, 20);
  const { mutate: deleteFile } = useDeleteFile();
  const { mutate: shareFile } = useShareFile();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(fileId, {
        onSuccess: () => {
          onFileDeleted?.(fileId);
        },
      });
    }
  };

  const handleShare = (fileId: string) => {
    shareFile({ fileId, expiration: 7 * 24 * 60 * 60 }); // 7 days
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data?.files || data.files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <File className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                File Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Size
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Uploaded By
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Date
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.files.map((file) => (
              <tr
                key={file.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mimeType)}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.fileType}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {formatFileSize(file.fileSize)}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {file.uploadedBy}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatDistanceToNow(new Date(file.createdAt), {
                    addSuffix: true,
                  })}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.originalName;
                        link.click();
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(file.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * 20 + 1} to{' '}
            {Math.min(page * 20, data.total)} of {data.total} files
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= data.total}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileList;
