import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  FileText,
  Monitor,
  ArrowLeft,
  AlertCircle,
  ClipboardList,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check
} from 'lucide-react';
import { marked } from 'marked';
// Prism.js for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import { MainLayout } from '@/layouts/MainLayout';
import { PageWrapper } from '@/components/courseEditor';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CurriculumTree } from '@/components/domain/lesson/CurriculumTree';
import { DocumentViewer } from '@/components/domain/lesson/DocumentViewer';
import { useLesson, useCourseContent, useMarkLessonComplete, useLessonProgress, useUpdateProgress, useCourseBookmarks } from '@/hooks/useLessonData';
import { AiAssistantCard } from '@/components/domain/lesson/AiAssistantCard';
import { AIChatPanel } from '@/components/domain/ai';
import { AISummaryPanel } from '@/components/student/AISummaryPanel';
import { useCourse, useCourseProgress } from '@/hooks/useCoursesData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { toast } from 'react-hot-toast';
import type { Lesson, Section, LessonDetail } from '@/services/api/lesson.api';
import { httpClient } from '@/services/http/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi, type Quiz } from '@/services/api/quiz.api';
import { assignmentApi, type Assignment } from '@/services/api/assignment.api';

/**
 * Convert R2 URL to proxy URL to avoid CORS issues
 */
function getVideoProxyUrl(videoUrl: string): string {
  // Check if it's an R2 URL (contains .r2.dev)
  if (videoUrl.includes('.r2.dev')) {
    const baseURL = httpClient.defaults.baseURL || '/api/v1.3.0';
    return `${baseURL}/media/video-proxy?url=${encodeURIComponent(videoUrl)}`;
  }
  // Return original URL for YouTube, Vimeo, or other sources
  return videoUrl;
}

/**
 * Convert structured data patterns thành HTML tables
 * Detects patterns like:
 * - **Toán Tử:** `+=` | **Ví dụ:** `x += 5` | **Tương đương với:** `x = x + 5`
 */
function convertStructuredDataToTables(html: string): string {
  // Detect pattern: các đoạn có format giống bảng
  // Pattern: **Toán Tử:** `+=` | **Ví dụ:** `x += 5` | **Tương đương với:** `x = x + 5`
  
  // Group các dòng liên tiếp có cùng pattern thành table
  const lines = html.split('\n');
  const tableGroups: Array<{ start: number; end: number; headers: string[]; rows: string[][] }> = [];
  let currentGroup: { start: number; headers: string[]; rows: string[][] } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect dòng có format: **Label:** value | **Label:** value | ...
    const parts = line.split('|').map(p => p.trim()).filter(p => p);
    const hasTablePattern = parts.length >= 2 && parts.some(p => /\*\*[^*]+\*\*:/.test(p));
    
    if (hasTablePattern) {
      // Extract headers từ dòng đầu tiên
      if (!currentGroup) {
        const headers: string[] = [];
        parts.forEach(part => {
          const labelMatch = part.match(/\*\*([^*]+)\*\*:/);
          if (labelMatch) {
            headers.push(labelMatch[1].trim());
          }
        });
        
        if (headers.length > 0) {
          currentGroup = {
            start: i,
            headers: headers,
            rows: []
          };
        }
      }
      
      // Extract row data
      if (currentGroup) {
        const row: string[] = [];
        parts.forEach(part => {
          const valueMatch = part.match(/\*\*[^*]+\*\*:\s*(.+)/);
          if (valueMatch) {
            row.push(valueMatch[1].trim());
          }
        });
        
        if (row.length === currentGroup.headers.length) {
          currentGroup.rows.push(row);
        }
      }
    } else {
      // Kết thúc group nếu có
      if (currentGroup && currentGroup.rows.length > 0) {
        tableGroups.push({
          start: currentGroup.start,
          end: i - 1,
          headers: currentGroup.headers,
          rows: currentGroup.rows
        });
      }
      currentGroup = null;
    }
  }
  
  // Kết thúc group cuối cùng
  if (currentGroup && currentGroup.rows.length > 0) {
    tableGroups.push({
      start: currentGroup.start,
      end: lines.length - 1,
      headers: currentGroup.headers,
      rows: currentGroup.rows
    });
  }
  
  // Convert các groups thành tables (từ cuối lên để không làm lệch index)
  let result = html;
  for (let g = tableGroups.length - 1; g >= 0; g--) {
    const group = tableGroups[g];
    const { headers, rows } = group;
    
    // Build HTML table
    let tableHtml = '<table><thead><tr>';
    headers.forEach(header => {
      tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => {
        // Preserve code formatting và các formatting khác
        const cellContent = cell
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');
        tableHtml += `<td>${cellContent}</td>`;
      });
      tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table>';
    
    // Replace trong HTML (tính toán vị trí chính xác)
    const beforeLines = lines.slice(0, group.start);
    const afterLines = lines.slice(group.end + 1);
    const beforeText = beforeLines.join('\n');
    const afterText = afterLines.join('\n');
    
    result = beforeText + (beforeText ? '\n' : '') + tableHtml + (afterText ? '\n' : '') + afterText;
    
    // Update lines array để tiếp tục xử lý
    lines.splice(group.start, group.end - group.start + 1, tableHtml);
  }
  
  return result;
}

/**
 * Component để hiển thị nội dung bài học theo content_type
 * Tự động đánh dấu hoàn thành khi học sinh xem bài học
 */
function LessonContentView({ lesson, onAutoComplete }: { lesson: LessonDetail; onAutoComplete?: () => void }) {
  const navigate = useNavigate();

  // ====== Quiz metadata: ưu tiên dùng quiz_id từ BE thay vì match theo title ======
  const courseId = lesson.course?.id || (lesson.section as any)?.course?.id;
  const isQuizLesson = lesson.content_type === 'quiz';
  const quizIdFromLesson = (lesson as any).quiz_id as string | undefined;

  const { data: resolvedQuiz } = useQuery<Quiz | null>({
    queryKey: ['lesson-quiz-by-id', quizIdFromLesson],
    queryFn: async () => {
      if (!quizIdFromLesson) return null;
      return await quizApi.getQuiz(quizIdFromLesson);
    },
    enabled: !!quizIdFromLesson && isQuizLesson,
    staleTime: 60 * 1000,
  });

  // Debug: Log content để kiểm tra format
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonContentView] Rendering lesson:', {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        contentType: lesson.content_type,
        hasContent: !!lesson.content,
        contentLength: lesson.content?.length || 0,
        contentPreview: lesson.content?.substring(0, 200) || 'KHÔNG CÓ NỘI DUNG',
        contentStartsWithHTML: lesson.content?.trim().startsWith('<') || false,
      });
    }
  }, [lesson.id, lesson.content, lesson.content_type, lesson.title]);

  if (lesson.content_type === 'video') {
    // Kiểm tra nếu là YouTube/Vimeo URL
    const isYouTube = lesson.video_url?.includes('youtube.com') || lesson.video_url?.includes('youtu.be');
    const isVimeo = lesson.video_url?.includes('vimeo.com');
    const isExternalVideo = isYouTube || isVimeo;
    
    // Kiểm tra nếu là blob URL (tạm thời, không hợp lệ)
    const isBlobUrl = lesson.video_url?.startsWith('blob:');
    
    // Lấy content/description để hiển thị (ưu tiên content, sau đó description)
    const contentToRender = lesson.content || lesson.description || '';
    const contentRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasAutoCompletedRef = useRef(false);
    
    // Set innerHTML trực tiếp vào DOM element (hỗ trợ Markdown)
    useEffect(() => {
      if (contentRef.current && contentToRender) {
        const raw = contentToRender.trim();
        // Luôn parse qua markdown để thống nhất format (kể cả khi có sẵn HTML)
        let html = marked.parse(raw, { breaks: true, gfm: true });
        // Loại bỏ các tag lạ còn sót (ví dụ </tên_gói> do AI sinh)
        html = (html as string).replace(/<\/?tên_gói>/gi, '');
        contentRef.current.innerHTML = '';
        contentRef.current.innerHTML = html;
      }
    }, [contentToRender]);

    // Auto-mark complete cho text content: khi scroll đến cuối hoặc sau 30 giây
    useEffect(() => {
      if (!contentToRender || hasAutoCompletedRef.current || lesson.is_completed) return;

      // Timer: tự động mark sau 30 giây nếu có content
      const timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, 30000); // 30 giây

      let scrollTimer: NodeJS.Timeout;

      // Scroll detection: mark khi scroll đến cuối
      const handleScroll = () => {
        if (hasAutoCompletedRef.current || lesson.is_completed) return;
        
        const element = contentRef.current;
        if (!element) return;

        const scrollTop = element.scrollTop || window.scrollY;
        const scrollHeight = element.scrollHeight || document.documentElement.scrollHeight;
        const clientHeight = element.clientHeight || window.innerHeight;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Nếu scroll đến 90% cuối cùng
        if (scrollPercentage >= 0.9) {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
              hasAutoCompletedRef.current = true;
              onAutoComplete();
            }
          }, 2000); // Đợi 2 giây để đảm bảo user thực sự đọc
        }
      };

      const element = contentRef.current;
      if (element) {
        element.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);
      }

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
        if (element) {
          element.removeEventListener('scroll', handleScroll);
          window.removeEventListener('scroll', handleScroll);
        }
      };
    }, [contentToRender, lesson.is_completed, onAutoComplete]);

    // Handle video ended - tự động mark complete
    const handleVideoEnded = () => {
      if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
        hasAutoCompletedRef.current = true;
        onAutoComplete();
      }
    };

    // Handle YouTube/Vimeo: track time-based (khó track chính xác, dùng fallback timer)
    useEffect(() => {
      if (!isExternalVideo || hasAutoCompletedRef.current || lesson.is_completed) return;

      // Với YouTube/Vimeo, dùng timer dựa trên duration (nếu có) hoặc 60 giây
      const estimatedDuration = lesson.duration_minutes ? lesson.duration_minutes * 60 * 1000 : 60000;
      const timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, Math.min(estimatedDuration, 120000)); // Tối đa 2 phút

      return () => clearTimeout(timer);
    }, [isExternalVideo, lesson.duration_minutes, lesson.is_completed, onAutoComplete]);
    
    return (
      <div className="space-y-6">
        {/* Nội dung tài liệu (content) - Hiển thị bình thường, giống hệt phần PDF */}
        {contentToRender && (
          <div 
            ref={contentRef}
            className="max-w-none lesson-content"
            style={{
              whiteSpace: 'normal',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              color: '#333'
            }}
          />
        )}

        {/* Video Player - Hiển thị ở dưới */}
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {lesson.video_url && !isBlobUrl ? (
            isExternalVideo ? (
              // YouTube/Vimeo embed
              <iframe
                src={
                  isYouTube
                    ? lesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                    : lesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')
                }
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // Direct video file (R2 hoặc server) - sử dụng proxy để tránh CORS
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                src={lesson.video_url ? getVideoProxyUrl(lesson.video_url) : ''}
                crossOrigin="anonymous"
                onEnded={handleVideoEnded}
                onError={(e) => {
                  console.error('[LessonContentView] Video playback error:', {
                    originalUrl: lesson.video_url,
                    proxyUrl: lesson.video_url ? getVideoProxyUrl(lesson.video_url) : '',
                    error: e
                  });
                }}
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {isBlobUrl ? 'Video đang được tải lên...' : 'Video chưa được tải lên'}
                </p>
                {isBlobUrl && (
                  <p className="text-sm text-gray-400 mt-2">
                    Vui lòng đợi video được upload hoàn tất
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (lesson.content_type === 'document' || lesson.content_type === 'text') {
    // Lấy tất cả PDF materials
    const pdfMaterials = lesson.materials?.filter(
      (m) => m.file_extension?.toLowerCase() === '.pdf' || 
             m.file_type === 'application/pdf' || 
             m.file_type?.includes('pdf')
    ) || [];

    // Lấy content để hiển thị
    const contentToRender = lesson.content || '';
    const contentRef = useRef<HTMLDivElement>(null);
    const hasAutoCompletedRef = useRef(false);
    
    // Helper: Normalize code blocks để đảm bảo comment # Ví dụ X: không bị parse thành heading
    const normalizeCodeBlocks = (text: string): string => {
      if (!text) return text;
      
      // Tìm tất cả code blocks (```...```)
      const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
      const normalized = text;
      let match;
      
      while ((match = codeBlockRegex.exec(text)) !== null) {
        const [fullMatch, lang, code] = match;
        // Nếu code block có comment bắt đầu bằng # Ví dụ X: ở dòng đầu tiên
        // Đảm bảo nó được giữ nguyên trong code block
        const lines = code.split('\n');
        const firstLine = lines[0]?.trim() || '';
        
        // Nếu dòng đầu là comment # Ví dụ X: nhưng không có trong code block đúng cách
        // Thì không cần làm gì vì đã nằm trong code block rồi
        // Vấn đề có thể là khi parse markdown, nó bị escape hoặc parse sai
        // Nên ta đảm bảo code block được wrap đúng
        if (firstLine.startsWith('# Ví dụ') && !fullMatch.includes(firstLine)) {
          // Code block đã đúng format, không cần sửa
          continue;
        }
      }
      
      return normalized;
    };

    // Set innerHTML trực tiếp vào DOM element (hỗ trợ Markdown)
    useEffect(() => {
      if (contentRef.current && contentToRender) {
        // Clear content trước khi set để tránh hiển thị giá trị cũ
        contentRef.current.innerHTML = '';
        const raw = contentToRender.trim();
        
        // Normalize code blocks trước khi parse
        const normalized = normalizeCodeBlocks(raw);
        
        // Luôn parse qua markdown để thống nhất format (kể cả khi có sẵn HTML)
        // QUAN TRỌNG: breaks: true để preserve line breaks trong code blocks
        let html = marked.parse(normalized, { 
          breaks: true, 
          gfm: true
        }) as string;
        
        // Fix: Normalize code blocks - QUAN TRỌNG: preserve line breaks
        html = (html as string).replace(
          /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
          (match, codeContent) => {
            // Debug: log để kiểm tra code content
            if (process.env.NODE_ENV === 'development') {
              console.log('[LessonDetailPage] Code content before processing:', {
                hasNewlines: codeContent.includes('\n'),
                newlineCount: (codeContent.match(/\n/g) || []).length,
                length: codeContent.length,
                preview: codeContent.substring(0, 200)
              });
            }
            
            // QUAN TRỌNG: Preserve line breaks VÀ indentation (tabs/spaces) từ đầu
            // Nếu codeContent đã có \n, giữ nguyên
            // Nếu codeContent có <br>, convert thành \n
            let fixedContent = codeContent
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/&lt;br\s*\/?&gt;/gi, '\n');
            
            // QUAN TRỌNG: Preserve spaces và tabs
            // Thay thế &nbsp; bằng space thật (không phải non-breaking space)
            // Nhưng cần preserve multiple spaces (indentation)
            fixedContent = fixedContent.replace(/&nbsp;/g, ' ');
            
            // Preserve tabs: convert &nbsp;&nbsp;&nbsp;&nbsp; (4 spaces) thành tab nếu có pattern
            // Hoặc giữ nguyên tabs nếu có \t
            fixedContent = fixedContent.replace(/\t/g, '    '); // Normalize tabs thành 4 spaces
            
            // Decode HTML entities nhưng preserve \n và spaces
            // Thay thế \n và multiple spaces tạm thời bằng markers
            const lineBreakMarker = '___PRESERVE_LINE_BREAK___';
            const spaceMarker = '___PRESERVE_SPACE___';
            
            // Preserve multiple consecutive spaces (indentation)
            fixedContent = fixedContent.replace(/( {2,})/g, (match: string) => {
              return match.split('').map(() => spaceMarker).join('');
            });
            
            fixedContent = fixedContent.replace(/\n/g, lineBreakMarker);
            
            // Decode HTML entities
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = fixedContent;
            fixedContent = tempDiv.textContent || tempDiv.innerText || fixedContent;
            
            // Restore line breaks và spaces
            fixedContent = fixedContent.replace(new RegExp(spaceMarker, 'g'), ' ');
            fixedContent = fixedContent.replace(new RegExp(lineBreakMarker, 'g'), '\n');
            
            // Fix heading tags trong code blocks (nếu có)
            fixedContent = fixedContent
              .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (_hMatch: string, hText: string) => {
                return hText;
              });
            
            // Nếu code không có line breaks nhưng có vẻ là multi-line code (có keywords Python)
            // Thử restore line breaks dựa trên syntax patterns
            if (!fixedContent.includes('\n') && fixedContent.length > 50) {
              // Thử detect và restore line breaks dựa trên Python syntax
              // Pattern: def, if, for, while, try, except, with thường có : và line break sau đó
              const pythonPatterns = [
                /(def\s+\w+\s*\([^)]*\):)([^\n]+)/g,  // def function(): code
                /(if\s+[^:]+:)([^\n]+)/g,              // if condition: code
                /(elif\s+[^:]+:)([^\n]+)/g,            // elif condition: code
                /(else\s*:)([^\n]+)/g,                 // else: code
                /(for\s+[^:]+:)([^\n]+)/g,             // for item in items: code
                /(while\s+[^:]+:)([^\n]+)/g,           // while condition: code
                /(try\s*:)([^\n]+)/g,                  // try: code
                /(except\s+[^:]+:)([^\n]+)/g,          // except Error: code
                /(with\s+[^:]+:)([^\n]+)/g,            // with open(...): code
                /(return\s+[^\n]+)([a-z])/gi,          // return value tiếp theo là chữ thường (có thể là dòng mới)
              ];
              
              let restored = fixedContent;
              pythonPatterns.forEach(pattern => {
                restored = restored.replace(pattern, (match: string, p1: string, p2: string) => {
                  // Nếu p2 không phải là whitespace và không bắt đầu bằng keyword, thêm line break
                  if (p2 && !p2.trim().match(/^(def|if|elif|else|for|while|try|except|with|return|import|from)\s/)) {
                    return p1 + '\n    ' + p2; // Thêm indentation
                  }
                  return match;
                });
              });
              
              // Chỉ dùng restored nếu nó có line breaks
              if (restored.includes('\n')) {
                fixedContent = restored;
                if (process.env.NODE_ENV === 'development') {
                  console.log('[LessonDetailPage] Đã restore line breaks cho code block');
                }
              } else {
                // Không thể restore, log warning
                if (process.env.NODE_ENV === 'development') {
                  console.warn('[LessonDetailPage] Code block không có line breaks, không thể tự động restore');
                }
              }
            }
            
            // Normalize whitespace:
            // 1. Split thành các dòng - đảm bảo preserve line breaks
            const lines = fixedContent.split(/\r?\n/);
            
            // 2. Loại bỏ leading/trailing empty lines
            let startIdx = 0;
            let endIdx = lines.length - 1;
            while (startIdx < lines.length && lines[startIdx].trim() === '') startIdx++;
            while (endIdx >= startIdx && lines[endIdx].trim() === '') endIdx--;
            
            if (startIdx > endIdx) {
              return `<pre><code></code></pre>`;
            }
            
            const codeLines = lines.slice(startIdx, endIdx + 1);
            
            // 3. Giữ nguyên code như trong DB - QUAN TRỌNG: preserve line breaks VÀ indentation
            // Không normalize indentation, giữ nguyên tabs/spaces
            const normalizedLines = codeLines.map((line: string) => {
              if (line.trim() === '') return '';
              // Preserve toàn bộ line bao gồm leading spaces/tabs (indentation)
              return line;
            });
            
            // Join lại với \n để preserve line breaks
            fixedContent = normalizedLines.join('\n');
            
            // 4. Loại bỏ multiple empty lines liên tiếp
            fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n');
            
            // Escape HTML để đảm bảo code được hiển thị đúng
            // QUAN TRỌNG: \n sẽ được CSS white-space: pre preserve
            const escapeHtml = (text: string) => {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
            };
            
            // Return với escaped HTML - \n sẽ được preserve bởi white-space: pre
            return `<pre><code>${escapeHtml(fixedContent)}</code></pre>`;
          }
        );
        
        // Convert structured data patterns thành tables (trước khi set innerHTML)
        html = convertStructuredDataToTables(html);
        
        // Loại bỏ các tag lạ còn sót (ví dụ </tên_gói> do AI sinh)
        html = html.replace(/<\/?tên_gói>/gi, '');
        contentRef.current.innerHTML = html;
        
        // Wrap code blocks với header và body structure
        // Chỉ select các pre chưa được wrap (không nằm trong .code-block-body)
        const preElements = contentRef.current.querySelectorAll('pre:not(.code-block-body pre)');
        preElements.forEach((pre) => {
          // Kiểm tra xem đã được wrap chưa - check cả parent và grandparent
          if (pre.parentElement?.classList.contains('code-block-wrapper') || 
              pre.parentElement?.classList.contains('code-block-body') ||
              pre.closest('.code-block-wrapper')) {
            return;
          }

          const code = pre.querySelector('code');
          if (!code) return;

          const codeText = code.textContent || '';
          
          // Detect language
          let language = '';
          const existingClass = code.className.match(/language-(\w+)/);
          if (existingClass) {
            language = existingClass[1];
          } else {
            // Detect language từ code content - Ưu tiên Python (có thể có {} và : trong dictionary)
            if (codeText.includes('def ') || codeText.includes('import ') || codeText.includes('print(') || 
                codeText.includes('if __name__') || codeText.includes('class ') || codeText.includes('lambda ') ||
                codeText.includes('my_dict') || codeText.includes('dict(') || 
                codeText.match(/["'][\w\s]+["']\s*:/) || // Dictionary pattern: "key": value
                codeText.match(/\w+\s*=\s*\{.*\}/)) { // Variable assignment with {}
              language = 'python';
            } else if (codeText.includes('function ') || codeText.includes('const ') || codeText.includes('let ') || codeText.includes('console.')) {
              language = 'javascript';
            } else if (codeText.includes('public class') || codeText.includes('public static') || codeText.includes('System.out')) {
              language = 'java';
            } else if (codeText.includes('#include') || codeText.includes('int main')) {
              language = 'cpp';
            } else if (codeText.includes('using ') && codeText.includes('namespace')) {
              language = 'cpp';
            } else if (codeText.includes('using System') || codeText.includes('namespace ')) {
              language = 'csharp';
            } else if (codeText.trim().startsWith('{') && codeText.includes('"') && !codeText.includes('def ') && !codeText.includes('function ')) {
              language = 'json';
            } else if (codeText.includes('#!/bin/bash') || codeText.includes('#!/bin/sh')) {
              language = 'bash';
            } else if (codeText.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i) || 
                       codeText.includes('BEGIN') || codeText.includes('END;') || codeText.includes('DECLARE')) {
              language = 'sql';
            } else if ((codeText.includes('{') && codeText.includes('}') && codeText.includes(':')) &&
                       (codeText.match(/^[.#]?\w+\s*\{/) || codeText.match(/^\w+\s*\{/) || codeText.includes('@media') || codeText.includes('@keyframes'))) {
              language = 'css';
            }
          }

          // Set language class
          if (language) {
            code.className = `language-${language}`;
          }

          // Tạo wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'code-block-wrapper';

          // Tạo header
          const header = document.createElement('div');
          header.className = 'code-block-header';
          
          // Language label
          const langLabel = document.createElement('span');
          langLabel.className = 'code-block-lang';
          langLabel.textContent = language || 'code';
          // Thêm class để style khác khi không có ngôn ngữ
          if (!language) {
            langLabel.classList.add('code-block-lang-unknown');
          }
          
          // Copy button
          const copyBtn = document.createElement('button');
          copyBtn.className = 'code-block-copy-btn';
          copyBtn.setAttribute('aria-label', 'Copy code');
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          
          // Copy functionality
          copyBtn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(codeText);
              copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
              copyBtn.classList.add('copied');
              setTimeout(() => {
                copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyBtn.classList.remove('copied');
              }, 2000);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          });

          header.appendChild(langLabel);
          header.appendChild(copyBtn);

          // Tạo body
          const body = document.createElement('div');
          body.className = 'code-block-body';
          body.appendChild(pre.cloneNode(true));

          // Wrap structure
          wrapper.appendChild(header);
          wrapper.appendChild(body);

          // Replace pre với wrapper
          pre.replaceWith(wrapper);

          // Highlight code trong body
          const newCode = body.querySelector('code');
          if (newCode && language) {
            Prism.highlightElement(newCode as HTMLElement);
          }
        });
      }
    }, [contentToRender]);

    // Auto-mark complete: khi scroll đến cuối hoặc sau 30 giây
    useEffect(() => {
      if (hasAutoCompletedRef.current || lesson.is_completed) return;

      // Timer: tự động mark sau 30 giây
      const timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, 30000); // 30 giây

      let scrollTimer: NodeJS.Timeout;

      // Scroll detection: mark khi scroll đến cuối
      const handleScroll = () => {
        if (hasAutoCompletedRef.current || lesson.is_completed) return;
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Nếu scroll đến 90% cuối cùng
        if (scrollPercentage >= 0.9) {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
              hasAutoCompletedRef.current = true;
              onAutoComplete();
            }
          }, 2000); // Đợi 2 giây để đảm bảo user thực sự đọc
        }
      };

      window.addEventListener('scroll', handleScroll);
      // Trigger ngay để check nếu content ngắn
      handleScroll();

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
        window.removeEventListener('scroll', handleScroll);
      };
    }, [lesson.is_completed, onAutoComplete]);
    
    // Debug: Log để kiểm tra
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonContentView] Before render:', {
        type: typeof contentToRender,
        length: contentToRender.length,
        firstChars: contentToRender.substring(0, 50),
        hasHTMLTags: contentToRender.includes('<'),
        hasEscapedTags: contentToRender.includes('&lt;'),
        pdfMaterialsCount: pdfMaterials.length,
        hasContent: !!contentToRender
      });
    }

    return (
      <div className="space-y-6">
        {/* Nội dung tài liệu (content) - Hiển thị bình thường */}
        {contentToRender && (
          <div 
            ref={contentRef}
            className="max-w-none lesson-content"
            style={{
              whiteSpace: 'normal',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              color: '#333'
            }}
          />
        )}

        {/* File PDF (materials) - Hiển thị thêm ở dưới nếu có */}
        {pdfMaterials.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Tài liệu PDF</h3>
            </div>
            {pdfMaterials.map((pdfMaterial, index) => (
              <div key={pdfMaterial.id} className={index > 0 ? 'border-t border-gray-200' : ''}>
                <DocumentViewer
                  lessonId={lesson.id}
                  documentUrl={pdfMaterial.file_url}
                  title={pdfMaterial.file_name || lesson.title}
                  documentType="pdf"
                />
              </div>
            ))}
          </div>
        )}

        {/* Nếu không có cả content và PDF */}
        {!contentToRender && pdfMaterials.length === 0 && (
          <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nội dung bài học đang được cập nhật.</p>
          </div>
        )}
      </div>
    );
  }

  // Quiz lesson: điều hướng sang trang làm bài kiểm tra
  if (lesson.content_type === 'quiz') {
    const effectiveQuizId =
      (lesson as any).quiz_id as string | undefined || resolvedQuiz?.id;
    const practiceFlag =
      lesson.is_practice !== undefined ? lesson.is_practice : resolvedQuiz?.is_practice;

    if (!courseId || !effectiveQuizId) {
      return (
        <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Bài kiểm tra này đang được cấu hình. Vui lòng quay lại sau khi giảng viên hoàn tất liên kết.
          </p>
        </div>
      );
    }

    const handleStartQuiz = () => {
      navigate(generateRoute.student.quiz(courseId!, effectiveQuizId));
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{lesson.title}</CardTitle>
              {practiceFlag !== undefined && (
                <Badge 
                  variant={practiceFlag ? "warning" : "success"} 
                  size="md"
                >
                  {practiceFlag ? 'Luyện tập' : 'Tính điểm'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.description && (
              <p className="text-gray-700">{lesson.description}</p>
            )}

            {lesson.is_practice && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Bài luyện tập</p>
                    <p>
                      Bài kiểm tra này không tính điểm vào tổng kết khóa học. 
                      Bạn có thể làm nhiều lần để luyện tập.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Thời lượng ước tính: {lesson.duration_minutes || 15} phút
                </span>
              </div>
              <Button onClick={handleStartQuiz}>
                Bắt đầu làm bài kiểm tra
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assignment lesson: điều hướng sang trang giao bài tập
  if (lesson.content_type === 'assignment') {
    const courseId = lesson.course?.id;
    const assignmentId = (lesson as any).assignment_id as string | undefined;

    if (!courseId || !assignmentId) {
      return (
        <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Bài tập này đang được cấu hình. Vui lòng quay lại sau khi giảng viên hoàn tất liên kết.
          </p>
        </div>
      );
    }

    const handleViewAssignment = () => {
      navigate(generateRoute.student.assignment(courseId, assignmentId));
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{lesson.title}</CardTitle>
              {lesson.is_practice !== undefined && (
                <Badge 
                  variant={lesson.is_practice ? "warning" : "success"} 
                  size="md"
                >
                  {lesson.is_practice ? 'Luyện tập' : 'Tính điểm'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.description && (
              <p className="text-gray-700">{lesson.description}</p>
            )}

            {lesson.is_practice && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Bài luyện tập</p>
                    <p>
                      Bài tập này không tính điểm vào tổng kết khóa học. 
                      Bạn có thể nộp nhiều lần để luyện tập.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Thời lượng ước tính: {lesson.duration_minutes || 30} phút
                </span>
              </div>
              <Button onClick={handleViewAssignment}>
                Xem chi tiết bài tập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: loại bài học chưa hỗ trợ giao diện riêng
  return (
    <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-500">Loại bài học này sẽ có giao diện riêng.</p>
    </div>
  );
}

/**
 * LessonDetailPage - Trang xem chi tiết bài học
 * 
 * Features:
 * - Hiển thị nội dung bài học (video/document)
 * - Navigation giữa các bài học
 * - Sidebar với danh sách bài học
 * - Mark as complete
 */
export function LessonDetailPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lessonData, isLoading: isLessonLoading, error: lessonError } = useLesson(lessonId!);
  const { data: lessonProgress } = useLessonProgress(lessonId!);
  const { data: courseContent, isLoading: isContentLoading } = useCourseContent(courseId!);
  const { data: courseData } = useCourse(courseId!);
  const { isAuthenticated } = useAuth();
  const { mutate: markComplete } = useMarkLessonComplete();
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const { data: bookmarks } = useCourseBookmarks(courseId!);
  
  // Fetch progress data để có thông tin completion status
  const { data: progressData } = useCourseProgress(courseId!, isUserEnrolled);

  // Check enrollment status
  useEffect(() => {
    if (!courseId) {
      setIsUserEnrolled(false);
      return;
    }
    const cachedEnrolled = queryClient.getQueryData<{ data?: { courses?: any[] } }>(
      QUERY_KEYS.courses.enrolled()
    );
    const isCachedEnrollment = cachedEnrolled?.data?.courses?.some(
      (enrolledCourse) => String(enrolledCourse.id) === String(courseId)
    );
    setIsUserEnrolled(Boolean(courseData?.is_enrolled) || Boolean(isCachedEnrollment));
  }, [courseData?.is_enrolled, courseId, queryClient]);

  // Fetch tất cả quizzes và assignments (bao gồm cả course-level và section-level)
  const { data: allQuizzes } = useQuery<Quiz[]>({
    queryKey: ['all-quizzes', courseId],
    queryFn: async () => {
      try {
        // Lấy tất cả quizzes với limit lớn để đảm bảo không bị thiếu
        const res = await quizApi.getQuizzes({ course_id: courseId!, status: 'published', limit: 1000 });
        const list = Array.isArray(res?.data) ? res.data : [];
        return list.filter((q: any) => q.is_published);
      } catch (error: any) {
        // Nếu lỗi 401/403 (chưa đăng nhập hoặc không có quyền), trả về mảng rỗng
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('[LessonDetailPage] No permission to fetch quizzes, returning empty array');
          return [];
        }
        throw error;
      }
    },
    enabled: !!courseId && isAuthenticated,
    staleTime: 60 * 1000,
  });

  const { data: allAssignments } = useQuery<Assignment[]>({
    queryKey: ['all-assignments', courseId],
    queryFn: async () => {
      try {
        const res = await assignmentApi.getAssignments(courseId!);
        const list = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
            ? res
            : [];
        return list.filter((a: any) => a.is_published);
      } catch (error: any) {
        // Nếu lỗi 401/403 (chưa đăng nhập hoặc không có quyền), trả về mảng rỗng
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('[LessonDetailPage] No permission to fetch assignments, returning empty array');
          return [];
        }
        throw error;
      }
    },
    enabled: !!courseId && isAuthenticated,
    staleTime: 60 * 1000,
  });

  const hasLessonLink = (item: { lesson_id?: string | null }) =>
    Boolean(item.lesson_id && String(item.lesson_id).trim());

  // Filter course-level và section-level quizzes/assignments
  const courseLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    if (hasLessonLink(q)) return false;
    const hasSectionId = q.section_id != null && q.section_id !== '';
    const hasCourseId = q.course_id != null && q.course_id !== '';
    return !hasSectionId && hasCourseId;
  });

  const sectionLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    if (hasLessonLink(q)) return false;
    const hasSectionId = q.section_id != null && q.section_id !== '';
    return hasSectionId;
  });

  const courseLevelAssignments = (allAssignments || []).filter((a: any) => {
    if (hasLessonLink(a)) return false;
    const hasSectionId = a.section_id != null && a.section_id !== '';
    const hasCourseId = a.course_id != null && a.course_id !== '';
    return !hasSectionId && hasCourseId;
  });

  const sectionLevelAssignments = (allAssignments || []).filter((a: any) => {
    if (hasLessonLink(a)) return false;
    const hasSectionId = a.section_id != null && a.section_id !== '';
    return hasSectionId;
  });

  // lessonApi.getLesson đã unwrap data rồi (return response.data.data), nên lessonData là LessonDetail trực tiếp
  const lesson: LessonDetail | undefined = lessonData;
  const course = courseData;

  // Debug: Kiểm tra lessonId và lesson.id có khớp không
  useEffect(() => {
    if (lesson && lessonId) {
      if (lesson.id !== lessonId) {
        console.warn('[LessonDetailPage] Lesson ID mismatch!', {
          urlLessonId: lessonId,
          lessonIdFromData: lesson.id,
          lessonTitle: lesson.title
        });
      }
    }
  }, [lesson, lessonId]);
  
  // Sử dụng sections từ courseContent (nếu authenticated) hoặc course.sections (public fallback)
  // Nếu courseContent.sections là empty array, vẫn fallback về course.sections (giống DetailPage)
  let curriculumSections = (courseContent?.sections && courseContent.sections.length > 0) 
    ? courseContent.sections 
    : (course?.sections ?? []);

  // Fetch completion status cho quizzes/assignments (batch)
  const { data: quizCompletionStatus } = useQuery({
    queryKey: ['quiz-completion-status', courseId, isUserEnrolled],
    queryFn: async () => {
      if (!isUserEnrolled) return { completed_quiz_ids: [] };
      return quizApi.getCompletionStatus(courseId!);
    },
    enabled: !!isUserEnrolled && !!courseId,
    staleTime: 60 * 1000,
  });

  const { data: assignmentCompletionStatus } = useQuery({
    queryKey: ['assignment-completion-status', courseId, isUserEnrolled],
    queryFn: async () => {
      if (!isUserEnrolled) return { completed_assignment_ids: [] };
      return assignmentApi.getCompletionStatus(courseId!);
    },
    enabled: !!isUserEnrolled && !!courseId,
    staleTime: 60 * 1000,
  });

  // Tạo map để lookup completion status
  const completedLessonIds = new Set(
    progressData?.sections?.flatMap((s: any) => 
      s.lessons?.filter((l: any) => l.is_completed).map((l: any) => l.lesson_id) || []
    ) || []
  );

  const completedQuizIds = new Set(
    quizCompletionStatus?.completed_quiz_ids || []
  );

  const completedAssignmentIds = new Set(
    assignmentCompletionStatus?.completed_assignment_ids || []
  );

  // Merge section-level quizzes và assignments vào sections và thêm completion status
  curriculumSections = curriculumSections.map((section: any) => {
    const sectionQuizzes = sectionLevelQuizzes.filter((q: any) => {
      const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
      const currentSectionId = section.id ? String(section.id).trim() : null;
      return quizSectionId === currentSectionId && quizSectionId !== null;
    });

    const sectionAssignments = sectionLevelAssignments.filter((a: any) => {
      const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
      const currentSectionId = section.id ? String(section.id).trim() : null;
      return assignmentSectionId === currentSectionId && assignmentSectionId !== null;
    });

    // Merge completion status từ progressData vào lessons
    const sectionProgress = progressData?.sections?.find((s: any) => s.section_id === section.id);
    const completedLessonMap = new Map(
      sectionProgress?.lessons?.map((l: any) => [l.lesson_id, l.is_completed]) || []
    );

    // Tạo lesson items từ quizzes và assignments với completion status
    const quizLessons = sectionQuizzes.map((quiz: any) => ({
      id: `quiz-${quiz.id}`,
      title: quiz.title,
      content_type: 'quiz' as const,
      section_id: quiz.section_id,
      order_index: quiz.order_index || 999,
      is_practice: quiz.is_practice,
      is_free_preview: false,
      duration_minutes: quiz.duration_minutes,
      quiz_id: quiz.id,
      is_completed: !quiz.is_practice && completedQuizIds.has(quiz.id), // Chỉ tính non-practice quizzes
    }));

    const assignmentLessons = sectionAssignments.map((assignment: any) => ({
      id: `assignment-${assignment.id}`,
      title: assignment.title,
      content_type: 'assignment' as const,
      section_id: assignment.section_id,
      order_index: assignment.order_index || 999,
      is_practice: assignment.is_practice,
      is_free_preview: false,
      duration_minutes: assignment.duration_minutes,
      assignment_id: assignment.id,
      is_completed: !assignment.is_practice && completedAssignmentIds.has(assignment.id), // Chỉ tính non-practice assignments
    }));

    return {
      ...section,
      lessons: [
        ...(section.lessons || []).map((lesson: any) => ({
          ...lesson,
          is_completed: completedLessonMap.get(lesson.id) || completedLessonIds.has(lesson.id) || false,
        })),
        ...quizLessons,
        ...assignmentLessons,
      ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    };
  });

  const sections = curriculumSections;

  // Debug: Log để kiểm tra lesson và courseContent
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonDetailPage] Current lesson:', {
        lessonId,
        lessonTitle: lesson?.title,
        lessonIdFromData: lesson?.id,
        hasLesson: !!lesson,
        lessonDataKeys: lessonData ? Object.keys(lessonData) : [],
        hasContent: !!lesson?.content,
        contentLength: lesson?.content?.length || 0,
        contentPreview: lesson?.content?.substring(0, 100) || 'KHÔNG CÓ NỘI DUNG',
        contentType: lesson?.content_type,
        courseContentSectionsCount: courseContent?.sections?.length || 0,
        courseDataSectionsCount: courseData?.sections?.length || 0,
        finalSectionsCount: sections.length,
      });
    }
  }, [lessonId, lesson, lessonData, courseContent, courseData, sections]);

  // Tìm lesson hiện tại và các lesson liên quan
  const currentLesson = lesson;
  const allLessons: Array<{ lesson: Lesson; section: Section }> = [];
  sections.forEach((section: Section) => {
    // Sort lessons theo order_index trước khi thêm vào allLessons
    const sortedLessons = (section.lessons || []).sort((a, b) => 
      (a.order_index || 0) - (b.order_index || 0)
    );
    sortedLessons.forEach((lesson: Lesson) => {
      allLessons.push({ lesson, section });
    });
  });
  const currentIndex = allLessons.findIndex(item => item.lesson.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkComplete = () => {
    if (!lessonId) return;
    updateProgressMutation.mutate(
      { lessonId, data: { completion_percentage: 100 } },
      {
      onSuccess: () => {
        toast.success('Đã đánh dấu hoàn thành bài học');
        // Refetch lesson data để cập nhật is_completed status
        queryClient.invalidateQueries({
          queryKey: ['lesson', lessonId],
        });
        queryClient.invalidateQueries({
          queryKey: ['lesson-progress', lessonId],
        });
        if (courseId) {
          // Invalidate course content để cập nhật progress
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.lessons.content(courseId),
          });
          queryClient.invalidateQueries({
            queryKey: ['course-progress', courseId],
          });
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Không thể đánh dấu hoàn thành');
      },
    });
  };

  const updateProgressMutation = useUpdateProgress();
  const isBookmarked = lessonProgress?.bookmarked ?? false;

  const handleToggleBookmark = () => {
    if (!lessonId) return;
    const nextState = !isBookmarked;
    updateProgressMutation.mutate(
      { lessonId, data: { bookmarked: nextState } },
      {
        onSuccess: () => {
          toast.success(nextState ? 'Đã lưu bài học' : 'Đã bỏ lưu bài học');
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Không thể cập nhật bookmark');
        }
      }
    );
  };

  const handleNavigateToLesson = (targetLessonId: string) => {
    // Xử lý quiz/assignment items (có id dạng quiz-${id} hoặc assignment-${id})
    if (targetLessonId.startsWith('quiz-')) {
      const quizId = targetLessonId.replace('quiz-', '');
      navigate(generateRoute.student.quiz(courseId!, quizId));
      return;
    }

    if (targetLessonId.startsWith('assignment-')) {
      const assignmentId = targetLessonId.replace('assignment-', '');
      navigate(`/student/courses/${courseId}/assignments/${assignmentId}`);
      return;
    }

    // Lesson thông thường
    navigate(generateRoute.student.lesson(courseId!, targetLessonId));
  };

  // Kiểm tra xem lesson có khớp với lessonId trong URL không
  // Tránh hiển thị lesson cũ khi đang chuyển sang lesson mới
  const isLessonMatching = lesson && lessonId && lesson.id === lessonId;

  // Hiển thị loading nếu đang fetch hoặc lesson không khớp với URL
  if (isLessonLoading || isContentLoading || !isLessonMatching) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
          <p className="ml-4 text-gray-600">Đang tải bài học...</p>
        </div>
      </PageWrapper>
    );
  }

  // Hiển thị error nếu có lỗi hoặc không tìm thấy lesson
  if (lessonError || !lesson) {
    return (
      <PageWrapper>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài học</h2>
            <p className="text-gray-500 mb-4">
              Bài học này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button onClick={() => navigate(generateRoute.courseDetail(courseId!))}>
              Quay lại khóa học
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
        <div className="max-w-8xl mx-auto">
          {/* Header với breadcrumb */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(generateRoute.courseDetail(courseId!))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại khóa học
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to={ROUTES.COURSES} className="hover:text-gray-700">Khóa học</Link>
              <span>/</span>
              <Link 
                to={generateRoute.courseDetail(courseId!)} 
                className="hover:text-gray-700"
              >
                {course?.title || 'Khóa học'}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{lesson.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Lesson Content */}
              <Card>
                <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                      {/* Chỉ hiển thị description nếu nó khác với content và không phải HTML */}
                      {lesson.description && 
                       lesson.description.trim() && 
                       !lesson.description.trim().startsWith('<') &&
                       lesson.description !== lesson.content && (
                        <p className="text-gray-600 mt-2">{lesson.description}</p>
                      )}
                    </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant={isBookmarked ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={handleToggleBookmark}
                      disabled={updateProgressMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      <span>{isBookmarked ? 'Đã lưu' : 'Lưu bài học'}</span>
                    </Button>
                  </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {lesson && isLessonMatching ? (
                    <LessonContentView 
                      key={lesson.id} 
                      lesson={lesson} 
                      onAutoComplete={handleMarkComplete}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Spinner size="lg" />
                      <p className="mt-4 text-gray-600">Đang tải nội dung bài học...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Summary Panel - Uses cached analysis from instructor */}
              <AISummaryPanel lessonId={lesson.id} />

              {/* AI Assistant - For chat interactions */}
              <AiAssistantCard
                courseTitle={course?.title}
                courseDescription={course?.description}
                lessonTitle={lesson.title}
                lessonId={lesson.id}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => prevLesson && handleNavigateToLesson(prevLesson.lesson.id)}
                  disabled={!prevLesson}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Bài trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => nextLesson && handleNavigateToLesson(nextLesson.lesson.id)}
                  disabled={!nextLesson}
                >
                  Bài tiếp theo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  {/* Sections - hiển thị trước */}
                  {sections.length > 0 && (
                    <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
                <CurriculumTree
                  sections={sections}
                  activeLessonId={lessonId}
                  onLessonClick={handleNavigateToLesson}
                  isPreviewMode={false}
                />
              </div>
                  )}

                  {/* Course-level Quizzes - hiển thị sau sections, cùng cấp */}
                  {courseLevelQuizzes?.map((quiz) => {
                    const isCompleted = !quiz.is_practice && completedQuizIds.has(quiz.id);
                    return (
                      <div
                        key={`quiz-${quiz.id}`}
                        className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(generateRoute.student.quiz(courseId!, quiz.id))}
                      >
                        <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Quiz: {quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>
                          )}
            </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}

                  {/* Course-level Assignments - hiển thị sau sections, cùng cấp */}
                  {courseLevelAssignments?.map((asmt) => {
                    const isCompleted = !asmt.is_practice && completedAssignmentIds.has(asmt.id);
                    return (
                      <div
                        key={`assignment-${asmt.id}`}
                        className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/student/courses/${courseId}/assignments/${asmt.id}`)}
                      >
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Assignment: {asmt.title}</h3>
                          {asmt.description && (
                            <p className="text-xs text-gray-500 mt-1">{asmt.description}</p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}

                  {/* Bookmarked lessons */}
                  {bookmarks && bookmarks.length > 0 && (
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Bài học đã lưu</h3>
                        <Bookmark className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {bookmarks.map((item) => (
                          <button
                            key={item.lesson_id}
                            onClick={() => handleNavigateToLesson(item.lesson_id)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-100 flex items-start gap-2"
                          >
                            <div className="text-xs text-gray-500 min-w-[36px]">
                              {item.section_title}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.lesson_title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Panel - Floating button */}
          {isUserEnrolled && <AIChatPanel courseId={courseId} lessonId={lessonId} />}
        </div>
    </PageWrapper>
  );
}

export default LessonDetailPage;

