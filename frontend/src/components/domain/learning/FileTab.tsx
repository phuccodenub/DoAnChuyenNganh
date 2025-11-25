import { Search, Download, FileArchive, FileText } from 'lucide-react';

interface CourseFile {
  id: string;
  name: string;
  size: string;
  type: 'archive' | 'document';
}

/**
 * FileTab - Tab tài liệu/tệp trong sidebar
 * 
 * Features:
 * - Search files
 * - Display file list with icons
 * - Download files
 */
export function FileTab() {
  // Mock data - sẽ được thay thế bằng API call sau
  const mockFiles: CourseFile[] = [
    {
      id: '1',
      name: 'Tài liệu học tập.zip',
      size: '20.23kb',
      type: 'archive'
    },
    {
      id: '2',
      name: 'JavaScript Cơ Bản.pdf',
      size: '1.5mb',
      type: 'document'
    },
    {
      id: '3',
      name: 'Ví dụ Code.zip',
      size: '450kb',
      type: 'archive'
    }
  ];

  const handleDownload = (file: CourseFile) => {
    // TODO: Implement file download
    console.log('Downloading file:', file.name);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tệp..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mockFiles.map((file) => (
          <div 
            key={file.id} 
            className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            {/* File Icon */}
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              {file.type === 'archive' ? (
                <FileArchive className="w-5 h-5 text-gray-600" />
              ) : (
                <FileText className="w-5 h-5 text-gray-600" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {file.size}
              </p>
            </div>

            {/* Download Button */}
            <button 
              onClick={() => handleDownload(file)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              title="Tải xuống"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
