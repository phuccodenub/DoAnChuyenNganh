import { useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { useMarkLessonComplete } from '@/hooks/useLessonData';

interface DocumentViewerProps {
  lessonId: number;
  documentUrl: string;
  documentType?: 'pdf' | 'markdown' | 'html';
  title?: string;
}

/**
 * DocumentViewer Component
 * 
 * Hiển thị document content:
 * - PDF viewer (iframe)
 * - Markdown renderer
 * - HTML content
 */
export function DocumentViewer({
  lessonId,
  documentUrl,
  documentType = 'pdf',
  title,
}: DocumentViewerProps) {
  const { mutate: markComplete } = useMarkLessonComplete();

  // Auto-mark as complete after viewing for a while
  useEffect(() => {
    const timer = setTimeout(() => {
      markComplete(lessonId);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [lessonId, markComplete]);

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  if (documentType === 'pdf') {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              {title || 'Tài liệu học tập'}
            </h3>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải xuống</span>
          </button>
        </div>

        {/* PDF viewer */}
        <div className="relative" style={{ height: 'calc(100vh - 250px)' }}>
          <iframe
            src={documentUrl}
            className="w-full h-full"
            title={title || 'Document'}
          />
        </div>
      </div>
    );
  }

  if (documentType === 'markdown') {
    return (
      <div className="bg-white rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              {title || 'Tài liệu học tập'}
            </h3>
          </div>
        </div>

        {/* Markdown content */}
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Markdown rendering sẽ được implement với thư viện như react-markdown
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Document URL: {documentUrl}
          </p>
        </div>
      </div>
    );
  }

  // HTML content
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">
            {title || 'Tài liệu học tập'}
          </h3>
        </div>
      </div>

      {/* HTML viewer */}
      <div className="relative" style={{ height: 'calc(100vh - 250px)' }}>
        <iframe
          src={documentUrl}
          className="w-full h-full"
          title={title || 'Document'}
        />
      </div>
    </div>
  );
}

export default DocumentViewer;
