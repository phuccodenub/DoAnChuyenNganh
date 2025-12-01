import { useState } from 'react';
import { BookOpen, FileText, Video, Link as LinkIcon, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VideoPlayer } from './VideoPlayer';
import { DocumentViewer } from './DocumentViewer';
import type { Lesson, LessonMaterial } from '@/services/api/lesson.api';

interface LessonPlayerProps {
  lesson: Lesson;
  materials?: LessonMaterial[];
  onComplete?: () => void;
  isCompleted?: boolean;
  showCompleteButton?: boolean;
}

/**
 * LessonPlayer Component
 * 
 * Component tổng hợp để hiển thị và play lesson content:
 * - Video player (nếu có video material)
 * - Document viewer (nếu có document material)
 * - Materials list (files, links)
 * - Complete button
 */
export function LessonPlayer({
  lesson,
  materials = [],
  onComplete,
  isCompleted = false,
  showCompleteButton = true,
}: LessonPlayerProps) {
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);

  // Phân loại materials theo file_type và file_extension
  const isVideoFile = (m: LessonMaterial) => {
    const ext = m.file_extension?.toLowerCase();
    const type = m.file_type?.toLowerCase();
    return (
      ext === 'mp4' ||
      ext === 'webm' ||
      ext === 'ogg' ||
      type?.includes('video') ||
      lesson.content_type === 'video'
    );
  };

  const isDocumentFile = (m: LessonMaterial) => {
    const ext = m.file_extension?.toLowerCase();
    const type = m.file_type?.toLowerCase();
    return (
      ext === 'pdf' ||
      ext === 'doc' ||
      ext === 'docx' ||
      ext === 'ppt' ||
      ext === 'pptx' ||
      type?.includes('pdf') ||
      type?.includes('document') ||
      lesson.content_type === 'document'
    );
  };

  const isLinkFile = (m: LessonMaterial) => {
    return (
      m.file_url?.startsWith('http://') ||
      m.file_url?.startsWith('https://') ||
      lesson.content_type === 'link'
    );
  };

  const videoMaterials = materials.filter(isVideoFile);
  const documentMaterials = materials.filter(isDocumentFile);
  const linkMaterials = materials.filter(isLinkFile);
  const otherMaterials = materials.filter(
    (m) => !isVideoFile(m) && !isDocumentFile(m) && !isLinkFile(m)
  );

  // Material hiện tại đang hiển thị
  const activeMaterial = materials[activeMaterialIndex];

  const getMaterialIcon = (material: LessonMaterial) => {
    if (isVideoFile(material)) return <Video className="w-5 h-5" />;
    if (isLinkFile(material)) return <LinkIcon className="w-5 h-5" />;
    if (isDocumentFile(material)) return <FileText className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          {lesson.description && (
            <p className="text-gray-600 mt-2">{lesson.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <Card>
        <CardContent className="p-0">
          {/* Video Player */}
          {videoMaterials.length > 0 && (
            <div className="aspect-video bg-black rounded-t-lg">
              <VideoPlayer
                src={videoMaterials[0].file_url || ''}
                title={videoMaterials[0].title || lesson.title}
                onComplete={onComplete}
              />
            </div>
          )}

          {/* Document Viewer */}
          {documentMaterials.length > 0 && !videoMaterials.length && (
            <div className="min-h-[600px]">
              <DocumentViewer
                src={documentMaterials[0].file_url || ''}
                title={documentMaterials[0].title || lesson.title}
              />
            </div>
          )}

          {/* Text Content */}
          {lesson.content && lesson.content_type === 'text' && !videoMaterials.length && !documentMaterials.length && (
            <div className="p-6 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          )}

          {/* No content message */}
          {materials.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Chưa có nội dung cho bài học này</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials List */}
      {materials.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tài liệu học tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materials.map((material, index) => (
                <button
                  key={material.id}
                  onClick={() => setActiveMaterialIndex(index)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                    ${
                      activeMaterialIndex === index
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {getMaterialIcon(material)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {material.title || `Tài liệu ${index + 1}`}
                    </p>
                    {material.description && (
                      <p className="text-sm text-gray-600 truncate">{material.description}</p>
                    )}
                  </div>
                  {isDocumentFile(material) && (
                    <Download className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* External Links */}
      {linkMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liên kết ngoài</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linkMaterials.map((material) => (
                <a
                  key={material.id}
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {material.title || material.file_url}
                    </p>
                    {material.description && (
                      <p className="text-sm text-gray-600 truncate">{material.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      {showCompleteButton && !isCompleted && (
        <Card>
          <CardContent className="p-6">
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đánh dấu đã hoàn thành
            </button>
          </CardContent>
        </Card>
      )}

      {isCompleted && (
        <Card>
          <CardContent className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <BookOpen className="w-5 h-5" />
              <p className="font-medium">Bạn đã hoàn thành bài học này</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

