import { useEffect, useState } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, Printer, List, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useMarkLessonComplete } from '@/hooks/useLessonData';
import { Button } from '@/components/ui/Button';

interface DocumentViewerProps {
  lessonId: string;
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
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handlePrint = () => {
    window.open(documentUrl, '_blank')?.print();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Construct PDF URL with page parameter
  const pdfUrlWithPage = documentType === 'pdf' 
    ? `${documentUrl}#page=${currentPage}&zoom=${zoom}`
    : documentUrl;

  if (documentType === 'pdf') {
    return (
      <div className={`bg-white rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header với Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <h3 className="font-medium text-gray-900 truncate">
              {title || 'Tài liệu học tập'}
            </h3>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2 min-w-[80px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleFullscreen}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                title="Toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                title="In"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                title="Tải xuống"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* PDF viewer */}
        <div 
          className="relative bg-gray-100 overflow-auto"
          style={{ 
            height: isFullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 180px)',
          }}
        >
          <div 
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`,
            }}
          >
            <iframe
              src={pdfUrlWithPage}
              className="w-full h-full border-0"
              title={title || 'Document'}
            />
          </div>
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
