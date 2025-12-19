import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
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
    FileVideo,   // Icon mới
    FileText,    // Icon cho PDF
    MoreVertical, // Icon cho menu mở rộng
    Sparkles,    // Icon cho prettier code
    Copy         // Icon cho copy code
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Lesson, ContentType, contentTypeLabels } from './types';
import { lessonApi, type LessonMaterial } from '@/services/api/lesson.api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useGenerateLessonContent } from '@/hooks/useAi';

// Cập nhật Interface
interface LessonFormData {
    title: string;
    content_type: ContentType;
    duration_minutes: number;
    is_preview: boolean;
    video_url: string; // URL video (youtube/vimeo hoặc url file đã upload)
    video_file?: File | null; // File video để upload
    content?: string; // Nội dung chi tiết (cho text/document)
    description?: string; // Mô tả bài học
}

interface LessonModalProps {
    isOpen: boolean;
    editingLesson: (Lesson & { materials?: import('@/services/api/lesson.api').LessonMaterial[]; content?: string; section_id?: string }) | null;
    lessonForm: LessonFormData;
    onFormChange: (form: LessonFormData) => void;
    onSave: (form?: LessonFormData) => void; // Cho phép truyền form trực tiếp
    onClose: () => void;
    isUploading?: boolean;
    uploadProgress?: number;
    courseTitle?: string; // Thông tin course để dùng cho AI
    courseDescription?: string;
    sectionTitle?: string; // Tên section để context tốt hơn
    courseLevel?: 'beginner' | 'intermediate' | 'advanced';
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
    courseTitle,
    courseDescription,
    sectionTitle,
    courseLevel,
}: LessonModalProps) {
    const queryClient = useQueryClient();
    const generateLessonContent = useGenerateLessonContent();
    // State cơ bản
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(lessonForm.title);
    const [content, setContent] = useState('');
    const documentEditorRef = useRef<HTMLDivElement>(null); // Editor cho document content
    const descriptionEditorRef = useRef<HTMLDivElement>(null); // Editor cho description
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    
    // State cho floating toolbar khi bôi đen text
    const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
    const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });
    const floatingToolbarRef = useRef<HTMLDivElement>(null);

    // State cho Video
    const [videoSourceTab, setVideoSourceTab] = useState<'upload' | 'external'>('upload');
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // PDF upload state
    const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
    const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    
    // Get existing PDF materials from lesson
    const existingPdfMaterials = editingLesson?.materials?.filter(m => 
        m.file_type === 'application/pdf' || m.file_extension === '.pdf'
    ) || [];
    
    // Debug log để kiểm tra materials
    console.log('[LessonModal] Existing PDF materials:', {
        hasEditingLesson: !!editingLesson,
        hasMaterials: !!editingLesson?.materials,
        materialsCount: editingLesson?.materials?.length || 0,
        pdfMaterialsCount: existingPdfMaterials.length,
        allMaterials: editingLesson?.materials,
        pdfMaterials: existingPdfMaterials
    });

    // Helper: Convert structured data patterns thành HTML tables
    const convertStructuredDataToTables = (html: string): string => {
        // Detect pattern: các đoạn có format giống bảng
        // Pattern: **Toán Tử:** `+=` | **Ví dụ:** `x += 5` | **Tương đương với:** `x = x + 5`
        
        // Tìm các đoạn có nhiều dòng với cùng pattern
        const tableRegex = /((?:\*\*[^*]+\*\*:\s*[^|\n]+\s*\|\s*)+)/g;
        let result = html;
        let match;
        
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
                    let cellContent = cell
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
    };

    // Helper: Detect language từ code content
    const detectLanguage = (code: string): string => {
        if (!code) return '';
        
        const trimmed = code.trim();
        
        // Python - Ưu tiên cao nhất vì có thể có {} và : (dictionary)
        if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('print(') || 
            trimmed.includes('if __name__') || trimmed.includes('lambda ') || trimmed.includes('class ') ||
            trimmed.includes('my_dict') || trimmed.includes('dict(') || 
            trimmed.match(/["'][\w\s]+["']\s*:/) || // Dictionary pattern: "key": value
            trimmed.match(/\w+\s*=\s*\{.*\}/)) { // Variable assignment with {}
            return 'python';
        }
        
        // JavaScript/TypeScript
        if (trimmed.includes('function ') || trimmed.includes('const ') || trimmed.includes('let ') || 
            trimmed.includes('var ') || trimmed.includes('console.') || trimmed.includes('=>')) {
            return 'javascript';
        }
        
        // Java
        if (trimmed.includes('public class') || trimmed.includes('public static') || 
            trimmed.includes('System.out') || trimmed.includes('@Override')) {
            return 'java';
        }
        
        // C/C++
        if (trimmed.includes('#include') || trimmed.includes('int main') || trimmed.includes('std::')) {
            return 'cpp';
        }
        
        // C#
        if (trimmed.includes('using System') || trimmed.includes('namespace ') || trimmed.includes('public void')) {
            return 'csharp';
        }
        
        // SQL/PLSQL
        if (trimmed.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i) || 
            trimmed.includes('BEGIN') || trimmed.includes('END;') || trimmed.includes('DECLARE')) {
            return 'sql';
        }
        
        // HTML
        if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE') || trimmed.match(/<[a-z]+[^>]*>/i)) {
            return 'html';
        }
        
        // CSS - Chỉ detect nếu có CSS selector pattern (không phải dictionary)
        // CSS thường có selector như .class, #id, hoặc tag name trước {
        if ((trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) &&
            (trimmed.match(/^[.#]?\w+\s*\{/) || trimmed.match(/^\w+\s*\{/) || trimmed.includes('@media') || trimmed.includes('@keyframes'))) {
            return 'css';
        }
        
        // JSON - Nếu có { và " nhưng không phải Python/JavaScript
        if (trimmed.trim().startsWith('{') && trimmed.includes('"') && !trimmed.includes('def ') && !trimmed.includes('function ')) {
            return 'json';
        }
        
        return '';
    };

    // Helper: Đảm bảo code blocks có class language-xxx (auto-detect nếu thiếu)
    const ensureCodeBlockLanguage = (html: string): string => {
        if (!html) return '';
        
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        const codeBlocks = temp.querySelectorAll('pre code');
        codeBlocks.forEach((codeEl) => {
            const codeElement = codeEl as HTMLElement;
            // Kiểm tra xem đã có class language-xxx chưa
            const hasLanguageClass = codeElement.className && /language-/.test(codeElement.className);
            
            if (!hasLanguageClass) {
                // Auto-detect language từ code content
                const codeText = codeElement.textContent || '';
                const detectedLang = detectLanguage(codeText);
                if (detectedLang) {
                    codeElement.className = `language-${detectedLang}`;
                }
            }
        });
        
        return temp.innerHTML;
    };

    // Helper: Wrap code blocks với header và body structure (giống LessonDetailPage)
    const wrapCodeBlocksWithHeader = (container: HTMLElement) => {
        if (!container) return;
        
        const preElements = container.querySelectorAll('pre:not(.code-block-body pre)');
        preElements.forEach((pre) => {
            // Kiểm tra xem đã được wrap chưa
            if (pre.parentElement?.classList.contains('code-block-wrapper')) {
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
                // Auto-detect language từ code content
                const detectedLang = detectLanguage(codeText);
                if (detectedLang) {
                    language = detectedLang;
                    code.className = `language-${detectedLang}`;
                }
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
        });
    };

    // Helper: Normalize HTML content để đảm bảo code blocks không bị merge với text
    const normalizeEditorContent = (html: string): string => {
        if (!html) return '';
        
        // QUAN TRỌNG: Preserve line breaks trong code blocks trước khi normalize
        // Convert <br> trong code blocks thành \n để preserve line breaks
        html = html.replace(
          /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
          (match, codeContent) => {
            // Thay thế <br> trong code bằng \n
            let fixedCode = codeContent
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/&lt;br\s*\/?&gt;/gi, '\n');
            
            // QUAN TRỌNG: Preserve spaces và tabs (indentation)
            fixedCode = fixedCode.replace(/&nbsp;/g, ' ');
            
            // Normalize tabs thành 4 spaces (Python standard)
            fixedCode = fixedCode.replace(/\t/g, '    ');
            
            // Decode HTML entities nhưng preserve \n và spaces
            const lineBreakMarker = '___PRESERVE_LB___';
            const spaceMarker = '___PRESERVE_SPACE___';
            
            // Preserve multiple consecutive spaces (indentation)
            fixedCode = fixedCode.replace(/( {2,})/g, (match: string) => {
              return match.split('').map(() => spaceMarker).join('');
            });
            
            fixedCode = fixedCode.replace(/\n/g, lineBreakMarker);
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = fixedCode;
            fixedCode = tempDiv.textContent || tempDiv.innerText || fixedCode;
            
            // Restore spaces và line breaks
            fixedCode = fixedCode.replace(new RegExp(spaceMarker, 'g'), ' ');
            fixedCode = fixedCode.replace(new RegExp(lineBreakMarker, 'g'), '\n');
            
            // Escape HTML để preserve line breaks và spaces
            const escapeHtml = (text: string) => {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
            };
            
            return `<pre><code>${escapeHtml(fixedCode)}</code></pre>`;
          }
        );
        
        // Tạo temporary div để parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Strategy: Tách tất cả code blocks ra khỏi paragraphs và ngược lại
        // 1. QUAN TRỌNG: Tách các <p> tags và block elements khác ra khỏi <pre> tags (vấn đề chính)
        const allPre = Array.from(temp.querySelectorAll('pre'));
        allPre.forEach((pre) => {
            // Tìm tất cả <p> tags và các block elements khác nằm trong <pre>
            const paragraphsInPre = Array.from(pre.querySelectorAll('p'));
            const codeElement = pre.querySelector('code');
            
            if (paragraphsInPre.length > 0) {
                // Tách <pre> thành: phần code + các paragraphs bên ngoài
                const fragment = document.createDocumentFragment();
                
                // Clone phần code (nếu có) - chỉ lấy phần code thực sự
                if (codeElement) {
                    const preClone = document.createElement('pre');
                    // Chỉ clone phần code, không clone các <p> tags
                    const codeClone = codeElement.cloneNode(true) as HTMLElement;
                    // Loại bỏ các <p> tags có thể nằm trong code
                    const pInCode = codeClone.querySelectorAll('p');
                    pInCode.forEach((p) => {
                        // Thay thế <p> bằng text content của nó
                        const text = p.textContent || '';
                        const textNode = document.createTextNode(text);
                        p.replaceWith(textNode);
                    });
                    preClone.appendChild(codeClone);
                    fragment.appendChild(preClone);
                }
                
                // Tách các paragraphs ra ngoài (sau code block)
                paragraphsInPre.forEach((p) => {
                    // Clone paragraph nhưng loại bỏ các <code> rỗng
                    const pClone = p.cloneNode(true) as HTMLElement;
                    const emptyCodes = pClone.querySelectorAll('code');
                    emptyCodes.forEach((code) => {
                        const codeText = code.textContent || '';
                        // Nếu code rỗng hoặc chỉ có whitespace, xóa nó
                        if (!codeText.trim()) {
                            code.remove();
                        }
                    });
                    
                    // Chỉ thêm paragraph nếu còn nội dung thực sự
                    const hasContent = pClone.textContent?.trim() || pClone.querySelector('img, br, strong, em');
                    if (hasContent) {
                        fragment.appendChild(pClone);
                    }
                });
                
                // Thay thế <pre> bằng fragment
                pre.replaceWith(fragment);
            } else if (codeElement) {
                // Nếu không có <p> trong <pre> nhưng có các block elements khác, cũng cần xử lý
                // Đảm bảo <pre> chỉ chứa <code>
                const children = Array.from(pre.childNodes);
                const nonCodeElements = children.filter(node => 
                    node.nodeType === Node.ELEMENT_NODE && 
                    (node as Element).tagName !== 'CODE'
                );
                
                if (nonCodeElements.length > 0) {
                    // Tách các elements không phải code ra ngoài
                    const fragment = document.createDocumentFragment();
                    const preClone = document.createElement('pre');
                    preClone.appendChild(codeElement.cloneNode(true) as HTMLElement);
                    fragment.appendChild(preClone);
                    
                    nonCodeElements.forEach((el) => {
                        if (el.nodeType === Node.ELEMENT_NODE) {
                            const element = el as Element;
                            // Nếu là block element, wrap trong <p>
                            if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                                fragment.appendChild(element.cloneNode(true));
                            } else {
                                const p = document.createElement('p');
                                p.appendChild(element.cloneNode(true));
                                fragment.appendChild(p);
                            }
                        }
                    });
                    
                    pre.replaceWith(fragment);
                }
            }
        });
        
        // 2. Tìm tất cả <pre> elements và đảm bảo chúng không nằm trong <p>
        const allPreAfter = Array.from(temp.querySelectorAll('pre'));
        allPreAfter.forEach((pre) => {
            let current: HTMLElement | null = pre.parentElement;
            // Tìm paragraph cha gần nhất
            while (current && current !== temp && current.tagName !== 'P') {
                current = current.parentElement;
            }
            
            if (current && current.tagName === 'P') {
                // Code block nằm trong paragraph, cần tách ra
                const p = current;
                const preClone = pre.cloneNode(true) as HTMLElement;
                
                // Tách paragraph thành: phần trước + pre + phần sau
                const fragment = document.createDocumentFragment();
                
                // Phần trước pre
                const beforeNodes: Node[] = [];
                let node = p.firstChild;
                while (node && node !== pre) {
                    const next = node.nextSibling;
                    beforeNodes.push(node.cloneNode(true));
                    node = next;
                }
                
                if (beforeNodes.length > 0) {
                    const beforeText = beforeNodes.map(n => n.textContent || '').join('').trim();
                    if (beforeText) {
                        const pBefore = document.createElement('p');
                        beforeNodes.forEach(n => pBefore.appendChild(n));
                        fragment.appendChild(pBefore);
                    }
                }
                
                // Thêm pre
                fragment.appendChild(preClone);
                
                // Phần sau pre
                const afterNodes: Node[] = [];
                node = pre.nextSibling;
                while (node) {
                    const next = node.nextSibling;
                    afterNodes.push(node.cloneNode(true));
                    node = next;
                }
                
                if (afterNodes.length > 0) {
                    const afterText = afterNodes.map(n => n.textContent || '').join('').trim();
                    if (afterText) {
                        const pAfter = document.createElement('p');
                        afterNodes.forEach(n => pAfter.appendChild(n));
                        fragment.appendChild(pAfter);
                    }
                }
                
                // Thay thế paragraph
                p.replaceWith(fragment);
            }
        });
        
        // 3. Tìm các <code> elements không có <pre> wrapper và có nhiều dòng -> convert thành code block
        const allCode = Array.from(temp.querySelectorAll('code'));
        allCode.forEach((code) => {
            const parent = code.parentElement;
            const textContent = code.textContent || '';
            const hasNewlines = textContent.includes('\n');
            const isLongCode = textContent.length > 50;
            
            // Nếu code nằm trong paragraph và có vẻ là code block (nhiều dòng hoặc dài)
            if (parent && parent.tagName === 'P' && (hasNewlines || isLongCode)) {
                // Check xem đã có pre wrapper chưa (code không nằm trong pre)
                const hasPreWrapper = code.closest('pre') !== null;
                if (!hasPreWrapper) {
                    // Tạo pre wrapper
                    const pre = document.createElement('pre');
                    const codeClone = code.cloneNode(true) as HTMLElement;
                    pre.appendChild(codeClone);
                    
                    // Tách paragraph
                    const p = parent;
                    const beforeText = p.textContent?.substring(0, p.textContent.indexOf(code.textContent || '')) || '';
                    const afterText = p.textContent?.substring(p.textContent.indexOf(code.textContent || '') + (code.textContent?.length || 0)) || '';
                    
                    const fragment = document.createDocumentFragment();
                    if (beforeText.trim()) {
                        const pBefore = document.createElement('p');
                        pBefore.textContent = beforeText.trim();
                        fragment.appendChild(pBefore);
                    }
                    fragment.appendChild(pre);
                    if (afterText.trim()) {
                        const pAfter = document.createElement('p');
                        pAfter.textContent = afterText.trim();
                        fragment.appendChild(pAfter);
                    }
                    
                    p.replaceWith(fragment);
                }
            }
        });
        
        // 4. Đảm bảo tất cả <pre> đều có <code> bên trong
        const allPreFinal = temp.querySelectorAll('pre');
        allPreFinal.forEach((pre) => {
            if (!pre.querySelector('code')) {
                const code = document.createElement('code');
                while (pre.firstChild) {
                    code.appendChild(pre.firstChild);
                }
                pre.appendChild(code);
            }
        });
        
        // 5. Loại bỏ empty paragraphs
        const allP = temp.querySelectorAll('p');
        allP.forEach((p) => {
            const text = p.textContent || '';
            if (!text.trim() && !p.querySelector('img, br, code')) {
                p.remove();
            }
        });
        
        // 6. Loại bỏ whitespace thừa ở đầu/cuối code blocks
        const allPreClean = temp.querySelectorAll('pre');
        allPreClean.forEach((pre) => {
            const code = pre.querySelector('code');
            if (code) {
                // Loại bỏ text nodes trống ở đầu
                while (code.firstChild && 
                       code.firstChild.nodeType === Node.TEXT_NODE && 
                       !code.firstChild.textContent?.trim()) {
                    const first = code.firstChild;
                    if (first) code.removeChild(first);
                }
                // Loại bỏ <br> ở đầu
                while (code.firstChild && code.firstChild.nodeName === 'BR') {
                    const first = code.firstChild;
                    if (first) code.removeChild(first);
                }
                // Loại bỏ text nodes trống ở cuối
                while (code.lastChild && 
                       code.lastChild.nodeType === Node.TEXT_NODE && 
                       !code.lastChild.textContent?.trim()) {
                    const last = code.lastChild;
                    if (last) code.removeChild(last);
                }
                // Loại bỏ <br> ở cuối
                while (code.lastChild && code.lastChild.nodeName === 'BR') {
                    const last = code.lastChild;
                    if (last) code.removeChild(last);
                }
            }
        });
        
        return temp.innerHTML;
    };

    // Helper: convert markdown/plain text -> HTML (including GFM, line breaks)
    const renderHtmlFromContent = (raw: string): string => {
        const trimmed = (raw || '').trim();
        if (!trimmed) return '';
        let html = marked.parse(trimmed, { breaks: true, gfm: true });
        
        // Fix: Normalize code blocks - loại bỏ leading/trailing whitespace và normalize indentation
        html = (html as string).replace(
          /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
          (match, codeAttributes, codeContent) => {
            // Extract class="language-xxx" từ codeAttributes để preserve
            const langMatch = codeAttributes.match(/class=["']([^"']*language-([^"'\s]+)[^"']*)["']/);
            const langClass = langMatch ? langMatch[1] : '';
            
            // Fix heading tags trong code blocks (nếu có)
            let fixedContent = codeContent
              .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, (_hMatch: string, hText: string) => {
                return hText;
              });
            
            // Normalize whitespace:
            // 1. Split thành các dòng
            const lines = fixedContent.split('\n');
            
            // 2. Loại bỏ leading/trailing empty lines
            let startIdx = 0;
            let endIdx = lines.length - 1;
            while (startIdx < lines.length && lines[startIdx].trim() === '') startIdx++;
            while (endIdx >= startIdx && lines[endIdx].trim() === '') endIdx--;
            
            if (startIdx > endIdx) {
              const codeTag = langClass ? `<code class="${langClass}"></code>` : '<code></code>';
              return `<pre>${codeTag}</pre>`;
            }
            
            const codeLines = lines.slice(startIdx, endIdx + 1);
            
            // 3. Giữ nguyên code như trong DB (không normalize indentation)
            // Chỉ normalize empty lines
            const normalizedLines = codeLines.map((line: string) => {
              // Nếu là dòng trống hoàn toàn, trả về empty string
              if (line.trim() === '') return '';
              // Giữ nguyên line với tất cả indentation
              return line;
            });
            
            fixedContent = normalizedLines.join('\n');
            
            // 4. Loại bỏ multiple empty lines liên tiếp
            fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n');
            
            // Preserve language class nếu có
            const codeTag = langClass ? `<code class="${langClass}">` : '<code>';
            return `<pre>${codeTag}${fixedContent}</code></pre>`;
          }
        );
        
        // Convert structured data patterns thành tables
        html = convertStructuredDataToTables(html as string);
        
        // Remove stray tags like </tên_gói> that AI might emit
        html = (html as string).replace(/<\/?tên_gói>/gi, '');
        return html;
    };

    // Effect: Reset state khi mở modal và load content vào editor
    useEffect(() => {
        if (isOpen) {
            setTempTitle(lessonForm.title);
            // Load content và description từ lessonForm hoặc editingLesson
            const contentToLoad = lessonForm.content || (editingLesson as any)?.content || '';
            setContent(contentToLoad);
            
            // Reset PDF file state khi mở lesson khác (khi editingLesson.id thay đổi)
            setSelectedPdfFile(null);
            setPdfUploadProgress(0);
            setIsUploadingPdf(false);
            if (pdfInputRef.current) {
                pdfInputRef.current.value = '';
            }
            
            // Debug log
            console.log('[LessonModal] Loading content:', {
                lessonFormContent: lessonForm.content,
                editingLessonContent: (editingLesson as any)?.content,
                contentToLoad,
                content_type: lessonForm.content_type,
                editingLessonId: editingLesson?.id,
                existingMaterials: editingLesson?.materials?.length || 0
            });
            
            // Set content vào editor sau khi DOM đã render
            setTimeout(() => {
                if (lessonForm.content_type === 'document' && documentEditorRef.current) {
                    // Content từ DB là HTML, hiển thị trực tiếp (không cần convert markdown)
                    // Chỉ convert nếu là markdown (có dấu hiệu markdown)
                    const isMarkdown = /^#{1,6}\s|^\*\*|^```|^\s*[-*+]\s/.test(contentToLoad.trim());
                    let html = isMarkdown ? renderHtmlFromContent(contentToLoad) : contentToLoad;
                    // Đảm bảo code blocks có class language-xxx
                    html = ensureCodeBlockLanguage(html);
                    documentEditorRef.current.innerHTML = html;
                    // Wrap code blocks với header/body structure
                    wrapCodeBlocksWithHeader(documentEditorRef.current);
                    console.log('[LessonModal] Set content to document editor:', { contentToLoad, isMarkdown, html });
                } else if (descriptionEditorRef.current) {
                    // Dùng cho text, link, video (description)
                    // Content từ DB là HTML, hiển thị trực tiếp (không cần convert markdown)
                    const isMarkdown = /^#{1,6}\s|^\*\*|^```|^\s*[-*+]\s/.test((contentToLoad || '').trim());
                    let html = isMarkdown ? renderHtmlFromContent(contentToLoad || '') : (contentToLoad || '');
                    // Đảm bảo code blocks có class language-xxx
                    html = ensureCodeBlockLanguage(html);
                    descriptionEditorRef.current.innerHTML = html;
                    // Wrap code blocks với header/body structure
                    wrapCodeBlocksWithHeader(descriptionEditorRef.current);
                    console.log('[LessonModal] Set content to description editor:', { contentToLoad, isMarkdown, html });
                }
            }, 100); // Tăng timeout để đảm bảo DOM đã render
            
            // Logic để detect đang dùng url ngoài hay file upload dựa trên video_url có thể thêm ở đây
        } else {
            // Reset content khi đóng modal
            setContent('');
            setSelectedPdfFile(null);
            setPdfUploadProgress(0);
            setIsUploadingPdf(false);
        }
    }, [isOpen, lessonForm.content, lessonForm.content_type, editingLesson?.id]);

    // Effect: Wrap code blocks khi content thay đổi trong editor (debounced)
    useEffect(() => {
        if (!isOpen) return;
        
        const timeoutId = setTimeout(() => {
            if (lessonForm.content_type === 'document' && documentEditorRef.current) {
                wrapCodeBlocksWithHeader(documentEditorRef.current);
            } else if (descriptionEditorRef.current) {
                wrapCodeBlocksWithHeader(descriptionEditorRef.current);
            }
        }, 300); // Debounce 300ms
        
        return () => clearTimeout(timeoutId);
    }, [content, isOpen, lessonForm.content_type]);
    
    // Đóng menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
            if (floatingToolbarRef.current && !floatingToolbarRef.current.contains(event.target as Node)) {
                setShowFloatingToolbar(false);
            }
        };
        
        if (showMoreMenu || showFloatingToolbar) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMoreMenu, showFloatingToolbar]);

    // Effect: Hiển thị floating toolbar khi có text selection
    useEffect(() => {
        if (!isOpen) return;
        
        const editor = getCurrentEditor();
        if (!editor) return;
        
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                setShowFloatingToolbar(false);
                return;
            }
            
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().trim();
            
            // Chỉ hiển thị nếu có text được chọn và selection nằm trong editor
            if (selectedText && editor.contains(range.commonAncestorContainer)) {
                try {
                    const rect = range.getBoundingClientRect();
                    const editorRect = editor.getBoundingClientRect();
                    
                    // Tính toán vị trí floating toolbar (phía trên selection)
                    const top = rect.top + window.scrollY - 50; // 50px phía trên
                    const left = rect.left + window.scrollX + (rect.width / 2) - 100; // Giữa selection, offset 100px để center toolbar
                    
                    setFloatingToolbarPosition({ top, left });
                    setShowFloatingToolbar(true);
                } catch (e) {
                    // Nếu không lấy được rect, ẩn toolbar
                    setShowFloatingToolbar(false);
                }
            } else {
                setShowFloatingToolbar(false);
            }
        };
        
        // Listen to selection changes
        document.addEventListener('selectionchange', handleSelectionChange);
        editor.addEventListener('mouseup', handleSelectionChange);
        editor.addEventListener('keyup', handleSelectionChange);
        
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            editor.removeEventListener('mouseup', handleSelectionChange);
            editor.removeEventListener('keyup', handleSelectionChange);
        };
    }, [isOpen, lessonForm.content_type]);

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
    const execCommand = (command: string, value?: string, editor?: HTMLDivElement | null) => {
        document.execCommand(command, false, value);
        const targetEditor = editor || (lessonForm.content_type === 'document' ? documentEditorRef.current : descriptionEditorRef.current);
        targetEditor?.focus();
    };

    // Helper để lấy editor ref hiện tại
    const getCurrentEditor = () => {
        return lessonForm.content_type === 'document' 
            ? documentEditorRef.current 
            : descriptionEditorRef.current;
    };

    // ... (Giữ nguyên các hàm handleBold, handleItalic v.v...)
    const handleBold = () => execCommand('bold', undefined, getCurrentEditor());
    const handleItalic = () => execCommand('italic', undefined, getCurrentEditor());
    const handleUnderline = () => execCommand('underline', undefined, getCurrentEditor());
    const handleStrikethrough = () => execCommand('strikeThrough', undefined, getCurrentEditor());
    const handleAlignLeft = () => execCommand('justifyLeft', undefined, getCurrentEditor());
    const handleAlignCenter = () => execCommand('justifyCenter', undefined, getCurrentEditor());
    const handleAlignRight = () => execCommand('justifyRight', undefined, getCurrentEditor());
    const handleAlignJustify = () => execCommand('justifyFull', undefined, getCurrentEditor());
    const handleUnorderedList = () => execCommand('insertUnorderedList', undefined, getCurrentEditor());
    const handleOrderedList = () => execCommand('insertOrderedList', undefined, getCurrentEditor());
    const handleBlockquote = () => execCommand('formatBlock', 'blockquote', getCurrentEditor());
    
    // Helper: Format code với indentation chuẩn (1 tab = 3 spaces)
    const formatCode = (code: string): string => {
        if (!code || !code.trim()) return code;
        
        // Normalize tabs thành 3 spaces
        let normalized = code.replace(/\t/g, '   '); // 1 tab = 3 spaces
        
        const lines = normalized.split('\n');
        let formatted: string[] = [];
        let indentLevel = 0;
        const indentSize = 3; // 1 tab = 3 spaces
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Preserve empty lines
            if (!line.trim()) {
                formatted.push('');
                continue;
            }
            
            // Tính indent hiện tại từ leading spaces/tabs
            const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';
            const currentIndent = leadingWhitespace.length;
            
            // Loại bỏ leading whitespace để xử lý
            const trimmedLine = line.trim();
            
            // Giảm indent nếu gặp closing brackets/braces
            if (trimmedLine.match(/^[\}\)\]\]]/)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Format line với indent mới
            const newIndent = ' '.repeat(indentLevel * indentSize);
            formatted.push(newIndent + trimmedLine);
            
            // Tăng indent nếu gặp opening brackets/braces hoặc Python keywords với :
            if (trimmedLine.match(/[\{\(\[\[]\s*$/) || // Opening brackets ở cuối
                (trimmedLine.match(/:\s*$/) && // Python: có : ở cuối
                 trimmedLine.match(/^\s*(if|elif|else|for|while|def|class|try|except|finally|with|async\s+def)\s+.*:\s*$/))) {
                indentLevel++;
            }
        }
        
        return formatted.join('\n');
    };
    
    const handleCode = () => {
        const editor = getCurrentEditor();
        if (!editor) return;
        
        editor.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        // Detect language tự động từ code (nếu có text được chọn)
        let detectedLang = selectedText ? detectLanguage(selectedText) : '';
        
        // Hỏi ngôn ngữ (có thể skip để dùng auto-detect)
        const languageInput = prompt(
            `Nhập ngôn ngữ (ví dụ: python, javascript, java, sql, plsql, html, css, json, bash)\n` +
            `Để trống để tự động detect từ code: ${detectedLang ? `(phát hiện: ${detectedLang})` : ''}`,
            detectedLang || ''
        );
        
        // Sử dụng ngôn ngữ được chọn hoặc auto-detect
        const finalLang = languageInput?.trim() || detectedLang || '';
        const langClass = finalLang ? ` class="language-${finalLang}"` : '';
        
        // Tạo code block HTML
        const codeContent = selectedText || '// Nhập code của bạn ở đây';
        const codeBlock = `<pre><code${langClass}>${codeContent}</code></pre>`;
        
        // Nếu có text được chọn, thay thế nó
        if (selectedText) {
            range.deleteContents();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = codeBlock;
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            range.insertNode(fragment);
        } else {
            // Nếu không có text được chọn, chèn code block tại vị trí cursor
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = codeBlock;
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            range.insertNode(fragment);
        }
        
        // Đặt cursor vào trong code block
        const codeElement = editor.querySelector('pre code:last-of-type');
        if (codeElement) {
            const newRange = document.createRange();
            newRange.selectNodeContents(codeElement);
            newRange.collapse(false); // Collapse to end
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        
        // Update content state
        setContent(editor.innerHTML);
        onFormChange({ ...lessonForm, content: editor.innerHTML });
        
        // Wrap code blocks với header/body structure
        setTimeout(() => {
            wrapCodeBlocksWithHeader(editor);
        }, 50);
    };
    
    // Prettier code: Format code đã chọn
    const handlePrettierCode = () => {
        const editor = getCurrentEditor();
        if (!editor) return;
        
        editor.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            toast.error('Vui lòng chọn đoạn code cần format');
            return;
        }
        
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();
        
        if (!selectedText) {
            toast.error('Vui lòng chọn đoạn code cần format');
            return;
        }
        
        // Format code với 1 tab = 3 spaces
        const formatted = formatCode(selectedText);
        
        if (formatted === selectedText) {
            toast.info('Code đã được format đúng');
            return;
        }
        
        // Thay thế text đã chọn bằng code đã format
        range.deleteContents();
        const textNode = document.createTextNode(formatted);
        range.insertNode(textNode);
        
        // Select formatted code
        const newRange = document.createRange();
        newRange.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Update content state
        setContent(editor.innerHTML);
        onFormChange({ ...lessonForm, content: editor.innerHTML });
        
        toast.success('Đã format code!');
    };
    
    const handleUndo = () => execCommand('undo', undefined, getCurrentEditor());
    const handleRedo = () => execCommand('redo', undefined, getCurrentEditor());
    const handleHeading1 = () => execCommand('formatBlock', 'h1', getCurrentEditor());
    const handleHeading2 = () => execCommand('formatBlock', 'h2', getCurrentEditor());
    const handleHeading3 = () => execCommand('formatBlock', 'h3', getCurrentEditor());
    const handleParagraph = () => execCommand('formatBlock', 'p', getCurrentEditor());

    const handleInsertLink = () => {
        const url = prompt('Nhập URL:');
        if (url) execCommand('createLink', url, getCurrentEditor());
    };

    const handleInsertImage = () => {
        const url = prompt('Nhập URL hình ảnh:');
        if (url) execCommand('insertImage', url, getCurrentEditor());
    };

    // --- Xử lý Video Attachment ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) { // Giới hạn 500MB
                alert('File quá lớn! Vui lòng chọn file dưới 500MB.');
                return;
            }
            setSelectedVideoFile(file);
            // Tạo URL ảo để preview - KHÔNG revoke vì cần dùng cho video player
            const objectUrl = URL.createObjectURL(file);
            
            // Tự động tính duration từ video
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const durationMinutes = Math.ceil(video.duration / 60);
                onFormChange({ 
                    ...lessonForm, 
                    video_url: objectUrl,
                    video_file: file, // Lưu file để upload sau
                    duration_minutes: durationMinutes > 0 ? durationMinutes : 1
                });
            };
            video.onerror = () => {
                // Fallback nếu không đọc được metadata
                onFormChange({ ...lessonForm, video_url: objectUrl, video_file: file, duration_minutes: 1 });
            };
            video.src = objectUrl;
        }
    };

    const handleRemoveVideo = () => {
        setSelectedVideoFile(null);
        onFormChange({ ...lessonForm, video_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Xử lý PDF Upload ---
    const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate PDF
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Vui lòng chọn file PDF');
            return;
        }

        // Giới hạn 50MB
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File PDF không được vượt quá 50MB');
            return;
        }

        setSelectedPdfFile(file);
        
        // Upload PDF ngay lập tức
        if (editingLesson?.id) {
            setIsUploadingPdf(true);
            setPdfUploadProgress(0);
            
            try {
                const material = await lessonApi.uploadMaterial(
                    editingLesson.id,
                    file,
                    `Tài liệu PDF cho bài học: ${lessonForm.title}`,
                    (progress) => setPdfUploadProgress(progress)
                );
                
                toast.success('Đã tải PDF lên thành công!');
                
                // Clear selected file và invalidate queries để refetch lesson data
                setSelectedPdfFile(null);
                if (pdfInputRef.current) pdfInputRef.current.value = '';
                
                // Invalidate queries để refetch lesson data với materials mới
                // Invalidate tất cả queries liên quan đến course sections
                queryClient.invalidateQueries({ 
                    predicate: (query) => {
                        const key = query.queryKey;
                        return (
                            (Array.isArray(key) && key.includes('sections')) ||
                            (typeof key[0] === 'string' && key[0].includes('section'))
                        );
                    }
                });
                
                // Trigger parent to refetch sections
                onSave();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Không thể tải PDF lên');
                setSelectedPdfFile(null);
            } finally {
                setIsUploadingPdf(false);
                setPdfUploadProgress(0);
            }
        }
    };

    const handleRemovePdf = () => {
        setSelectedPdfFile(null);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    };
    
    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
        
        try {
            await lessonApi.deleteMaterial(materialId);
            toast.success('Đã xóa tài liệu');
            
            // Invalidate queries to refetch lesson data
            if (editingLesson?.id && editingLesson.section_id) {
                queryClient.invalidateQueries({ queryKey: ['course-sections', editingLesson.section_id] });
                queryClient.invalidateQueries({ queryKey: ['lesson', editingLesson.id] });
            }
            
            // Trigger parent to refetch sections
            onSave();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể xóa tài liệu');
        }
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
                        {/* Luôn hiển thị input để user có thể nhập title trực tiếp */}
                        <input
                            type="text"
                            value={lessonForm.title}
                            onChange={(e) => onFormChange({ ...lessonForm, title: e.target.value })}
                            placeholder="Nhập tiêu đề bài học..."
                            className="flex-1 px-3 py-1.5 text-lg font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================== BODY SCROLLABLE ================== */}
                <div className="flex-1 overflow-y-auto">

                    {/* 1. LESSON META */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
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
                            
                            {/* Chỉ hiển thị thời lượng khi đã có video */}
                            {lessonForm.content_type === 'video' && lessonForm.video_url && lessonForm.duration_minutes > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Thời lượng: {lessonForm.duration_minutes} phút
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center ml-auto">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={lessonForm.is_preview}
                                        onChange={(e) => onFormChange({ ...lessonForm, is_preview: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Cho phép xem trước</span>
                                </label>
                            </div>
                        </div>

                        {/* Mô tả ngắn bài học (description) */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả ngắn bài học
                            </label>
                            <textarea
                                value={lessonForm.description || ''}
                                onChange={(e) => onFormChange({ ...lessonForm, description: e.target.value })}
                                placeholder="Nhập mô tả ngắn gọn tóm tắt nội dung chính của bài học (hiển thị ở đầu trang học viên)..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 space-y-4">
                            {/* PDF Upload Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        Tài liệu PDF
                                    </h3>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                    {/* Hiển thị materials đã có sẵn */}
                                    {existingPdfMaterials.length > 0 && (
                                        <div className="space-y-2">
                                            {existingPdfMaterials.map((material) => (
                                                <div key={material.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{material.file_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {material.file_size ? `${(material.file_size / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMaterial(material.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                                                        title="Xóa PDF"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Upload area - chỉ hiển thị nếu chưa có file đang upload */}
                                    {!selectedPdfFile && (
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => pdfInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                accept="application/pdf,.pdf"
                                                className="hidden"
                                                ref={pdfInputRef}
                                                onChange={handlePdfSelect}
                                                disabled={isUploadingPdf || !editingLesson?.id}
                                            />
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">Click để tải PDF lên</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF (Max 50MB)</p>
                                        </div>
                                    )}
                                    
                                    {/* File đang upload */}
                                    {selectedPdfFile && (
                                        <div className="space-y-2">
                                            {isUploadingPdf ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-700">{selectedPdfFile.name}</span>
                                                        <span className="text-blue-600 font-medium">{pdfUploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${pdfUploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <FileText className="w-5 h-5 text-green-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{selectedPdfFile.name}</p>
                                                        <p className="text-xs text-gray-500">{(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                    <button
                                                        onClick={handleRemovePdf}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Xóa PDF"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Document Content Editor */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-blue-600" />
                                        Nội dung Tài liệu (Tùy chọn)
                                    </h3>
                                </div>

                                {/* Document Editor */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Toolbar cho Document - Chỉ hiển thị các nút thường dùng nhất */}
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1 flex-wrap relative">
                                        {/* Format cơ bản - Thường dùng nhất */}
                                        <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={handleBold} title="Đậm" />
                                        <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={handleItalic} title="Nghiêng" />
                                        <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={handleUnderline} title="Gạch chân" />
                                        <ToolbarDivider />
                                        
                                        {/* Headings - Thường dùng */}
                                        <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={handleHeading1} title="Heading 1" />
                                        <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={handleHeading2} title="Heading 2" />
                                        <ToolbarButton icon={<Heading3 className="w-4 h-4" />} onClick={handleHeading3} title="Heading 3" />
                                        <ToolbarDivider />
                                        
                                        {/* Lists - Thường dùng */}
                                        <ToolbarButton icon={<List className="w-4 h-4" />} onClick={handleUnorderedList} title="Danh sách dấu đầu dòng" />
                                        <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={handleOrderedList} title="Danh sách đánh số" />
                                        <ToolbarDivider />
                                        
                                        {/* Insert - Thường dùng */}
                                        <ToolbarButton icon={<Link className="w-4 h-4" />} onClick={handleInsertLink} title="Chèn liên kết" />
                                        <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={handleInsertImage} title="Chèn hình ảnh" />
                                        <ToolbarButton icon={<Code className="w-4 h-4" />} onClick={handleCode} title="Khối mã (Code Block)" />
                                        <ToolbarButton icon={<Sparkles className="w-4 h-4" />} onClick={handlePrettierCode} title="Format code (Prettier)" />
                                        <ToolbarDivider />
                                        
                                        {/* Undo/Redo - Thường dùng */}
                                        <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={handleUndo} title="Hoàn tác" />
                                        <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={handleRedo} title="Làm lại" />
                                        
                                        {/* Menu mở rộng - Gộp các tùy chọn ít dùng */}
                                        <ToolbarDivider />
                                        <div className="relative">
                                            <ToolbarButton 
                                                icon={<MoreVertical className="w-4 h-4" />} 
                                                onClick={() => setShowMoreMenu(!showMoreMenu)} 
                                                title="Thêm tùy chọn" 
                                            />
                                            {showMoreMenu && (
                                                <div 
                                                    ref={moreMenuRef}
                                                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Format ít dùng */}
                                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Định dạng</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleStrikethrough();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Strikethrough className="w-4 h-4" />
                                                        <span>Gạch ngang</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleParagraph();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Type className="w-4 h-4" />
                                                        <span>Đoạn văn (Paragraph)</span>
                                                    </button>
                                                    
                                                    <div className="border-t border-gray-200 my-1" />
                                                    
                                                    {/* Căn chỉnh */}
                                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Căn chỉnh</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleAlignLeft();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <AlignLeft className="w-4 h-4" />
                                                        <span>Căn trái</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleAlignCenter();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <AlignCenter className="w-4 h-4" />
                                                        <span>Căn giữa</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleAlignRight();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <AlignRight className="w-4 h-4" />
                                                        <span>Căn phải</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleAlignJustify();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <AlignJustify className="w-4 h-4" />
                                                        <span>Căn đều</span>
                                                    </button>
                                                    
                                                    <div className="border-t border-gray-200 my-1" />
                                                    
                                                    {/* Chèn ít dùng */}
                                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Chèn</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleBlockquote();
                                                            setShowMoreMenu(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Quote className="w-4 h-4" />
                                                        <span>Trích dẫn</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Editor Area */}
                                    <div className="p-6">
                                        <div
                                            ref={documentEditorRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="min-h-[400px] outline-none prose prose-sm max-w-none text-gray-700 lesson-content"
                                            data-placeholder="Nhập nội dung tài liệu chi tiết..."
                                            onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. TEXT/LINK CONTENT EDITOR - Hiển thị khi content_type là 'text' hoặc 'link' */}
                    {(lessonForm.content_type === 'text' || lessonForm.content_type === 'link') && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 space-y-4">
                            {lessonForm.content_type === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL Liên kết
                                    </label>
                                    <input
                                        type="url"
                                        value={lessonForm.video_url || ''}
                                        onChange={(e) => onFormChange({ ...lessonForm, video_url: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}
                            
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {lessonForm.content_type === 'text' ? 'Nội dung bài học' : 'Mô tả liên kết'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* Nút tạo nội dung bằng AI - chỉ hiển thị cho text lesson */}
                                        {lessonForm.content_type === 'text' && editingLesson && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        toast.loading('Đang tạo nội dung bằng AI...', { id: 'generate-content' });
                                                        
                                                        const result = await generateLessonContent.mutateAsync({
                                                            lessonTitle: lessonForm.title,
                                                            lessonDescription: lessonForm.description || lessonForm.title,
                                                            courseTitle: courseTitle || 'Khóa học',
                                                            courseDescription: courseDescription || '',
                                                            sectionTitle: sectionTitle || '',
                                                            level: courseLevel || 'beginner',
                                                        });
                                                        
                                                        // AI trả về HTML, kiểm tra xem có phải markdown không
                                                        // Nếu có dấu hiệu markdown (##, **, ```), convert sang HTML
                                                        // Nếu đã là HTML (có <h1>, <p>, etc.), dùng trực tiếp
                                                        const isMarkdown = /^#{1,6}\s|^\*\*|^```|^\s*[-*+]\s/.test(result.content.trim());
                                                        let html = isMarkdown ? renderHtmlFromContent(result.content) : result.content;
                                                        // Đảm bảo code blocks có class language-xxx
                                                        html = ensureCodeBlockLanguage(html);
                                                        
                                                        if (descriptionEditorRef.current) {
                                                            descriptionEditorRef.current.innerHTML = html;
                                                            // Wrap code blocks với header/body structure
                                                            wrapCodeBlocksWithHeader(descriptionEditorRef.current);
                                                            // Lưu HTML vào state và form (không phải markdown)
                                                            setContent(html);
                                                            onFormChange({ ...lessonForm, content: html });
                                                        }
                                                        
                                                        toast.success('Đã tạo nội dung bằng AI!', { id: 'generate-content' });
                                                    } catch (error: any) {
                                                        console.error('Error generating lesson content:', error);
                                                        toast.error(error?.response?.data?.message || 'Không thể tạo nội dung', { id: 'generate-content' });
                                                    }
                                                }}
                                                disabled={generateLessonContent.isPending || !lessonForm.title.trim()}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                title="Tạo nội dung chi tiết bằng AI"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                {generateLessonContent.isPending ? 'Đang tạo...' : 'Tạo bằng AI'}
                                            </button>
                                        )}
                                        {/* Toolbar - Chỉ hiển thị các nút thường dùng nhất */}
                                        <div className="flex items-center gap-1 flex-wrap relative">
                                            {/* Format cơ bản - Thường dùng nhất */}
                                            <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={handleBold} title="Đậm" />
                                            <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={handleItalic} title="Nghiêng" />
                                            <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={handleUnderline} title="Gạch chân" />
                                            <ToolbarDivider />
                                            
                                            {/* Headings - Thường dùng */}
                                            <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={handleHeading1} title="Heading 1" />
                                            <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={handleHeading2} title="Heading 2" />
                                            <ToolbarButton icon={<Heading3 className="w-4 h-4" />} onClick={handleHeading3} title="Heading 3" />
                                            <ToolbarDivider />
                                            
                                            {/* Lists - Thường dùng */}
                                            <ToolbarButton icon={<List className="w-4 h-4" />} onClick={handleUnorderedList} title="Danh sách dấu đầu dòng" />
                                            <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={handleOrderedList} title="Danh sách đánh số" />
                                            <ToolbarDivider />
                                            
                                            {/* Insert - Thường dùng */}
                                            <ToolbarButton icon={<Link className="w-4 h-4" />} onClick={handleInsertLink} title="Chèn liên kết" />
                                            <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={handleInsertImage} title="Chèn hình ảnh" />
                                            <ToolbarButton icon={<Code className="w-4 h-4" />} onClick={handleCode} title="Khối mã (Code Block)" />
                                            <ToolbarButton icon={<Sparkles className="w-4 h-4" />} onClick={handlePrettierCode} title="Format code (Prettier)" />
                                            <ToolbarDivider />
                                            
                                            {/* Undo/Redo - Thường dùng */}
                                            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={handleUndo} title="Hoàn tác" />
                                            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={handleRedo} title="Làm lại" />
                                            
                                            {/* Menu mở rộng - Gộp các tùy chọn ít dùng */}
                                            <ToolbarDivider />
                                            <div className="relative">
                                                <ToolbarButton 
                                                    icon={<MoreVertical className="w-4 h-4" />} 
                                                    onClick={() => setShowMoreMenu(!showMoreMenu)} 
                                                    title="Thêm tùy chọn" 
                                                />
                                                {showMoreMenu && (
                                                    <div 
                                                        ref={moreMenuRef}
                                                        className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* Format ít dùng */}
                                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Định dạng</div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleStrikethrough();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <Strikethrough className="w-4 h-4" />
                                                            <span>Gạch ngang</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleParagraph();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <Type className="w-4 h-4" />
                                                            <span>Đoạn văn (Paragraph)</span>
                                                        </button>
                                                        
                                                        <div className="border-t border-gray-200 my-1" />
                                                        
                                                        {/* Căn chỉnh */}
                                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Căn chỉnh</div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAlignLeft();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <AlignLeft className="w-4 h-4" />
                                                            <span>Căn trái</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAlignCenter();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <AlignCenter className="w-4 h-4" />
                                                            <span>Căn giữa</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAlignRight();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <AlignRight className="w-4 h-4" />
                                                            <span>Căn phải</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAlignJustify();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <AlignJustify className="w-4 h-4" />
                                                            <span>Căn đều</span>
                                                        </button>
                                                        
                                                        <div className="border-t border-gray-200 my-1" />
                                                        
                                                        {/* Chèn ít dùng */}
                                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Chèn</div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleBlockquote();
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                        >
                                                            <Quote className="w-4 h-4" />
                                                            <span>Trích dẫn</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div
                                        ref={descriptionEditorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="min-h-[400px] p-6 outline-none prose prose-sm max-w-none text-gray-700 lesson-content"
                                        data-placeholder={lessonForm.content_type === 'text' ? 'Nhập nội dung bài học...' : 'Nhập mô tả về liên kết...'}
                                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. DESCRIPTION EDITOR - Chỉ hiển thị cho video (không phải document, text, link) */}
                    {lessonForm.content_type !== 'document' && 
                     lessonForm.content_type !== 'text' && 
                     lessonForm.content_type !== 'link' && (
                        <div className="flex flex-col min-h-[400px]">
                            <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">Mô tả bài học</h3>
                                {/* Toolbar nhỏ gọn hơn */}
                                <div className="flex items-center gap-1 scale-90 origin-right">
                                    <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={handleBold} title="Đậm" />
                                    <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={handleItalic} title="Nghiêng" />
                                    <ToolbarButton icon={<List className="w-4 h-4" />} onClick={handleUnorderedList} title="Danh sách" />
                                    <ToolbarButton icon={<Image className="w-4 h-4" />} onClick={handleInsertImage} title="Hình ảnh" />
                                </div>
                            </div>

                            <div className="flex-1 p-6 bg-white">
                                <div
                                    ref={descriptionEditorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="min-h-[200px] outline-none prose prose-sm max-w-none text-gray-700 lesson-content"
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
                            onClick={() => {
                                // Lấy content trực tiếp từ editor (không dùng state vì có thể chưa sync)
                                // QUAN TRỌNG: Preserve line breaks trong code blocks
                                let rawContent = lessonForm.content_type === 'document'
                                    ? (documentEditorRef.current?.innerHTML || '')
                                    : (descriptionEditorRef.current?.innerHTML || '');
                                
                                // Preserve line breaks VÀ indentation trong code blocks
                                rawContent = rawContent.replace(
                                  /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
                                  (match, codeContent) => {
                                    // Thay thế <br> trong code bằng \n
                                    let fixedCode = codeContent.replace(/<br\s*\/?>/gi, '\n');
                                    
                                    // QUAN TRỌNG: Preserve spaces và tabs (indentation)
                                    fixedCode = fixedCode.replace(/&nbsp;/g, ' ');
                                    
                                    // Normalize tabs thành 4 spaces (Python standard)
                                    fixedCode = fixedCode.replace(/\t/g, '    ');
                                    
                                    // Decode HTML entities nhưng preserve \n và spaces
                                    const lineBreakMarker = '___PRESERVE_LB___';
                                    const spaceMarker = '___PRESERVE_SPACE___';
                                    
                                    // Preserve multiple consecutive spaces (indentation)
                                    fixedCode = fixedCode.replace(/( {2,})/g, (match: string) => {
                                      return match.split('').map(() => spaceMarker).join('');
                                    });
                                    
                                    fixedCode = fixedCode.replace(/\n/g, lineBreakMarker);
                                    
                                    const tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = fixedCode;
                                    fixedCode = tempDiv.textContent || tempDiv.innerText || fixedCode;
                                    
                                    // Restore spaces và line breaks
                                    fixedCode = fixedCode.replace(new RegExp(spaceMarker, 'g'), ' ');
                                    fixedCode = fixedCode.replace(new RegExp(lineBreakMarker, 'g'), '\n');
                                    
                                    // Escape HTML để preserve line breaks và spaces
                                    const escapeHtml = (text: string) => {
                                      const div = document.createElement('div');
                                      div.textContent = text;
                                      return div.innerHTML;
                                    };
                                    
                                    return `<pre><code>${escapeHtml(fixedCode)}</code></pre>`;
                                  }
                                );
                                
                                // Sanitize và normalize content
                                const sanitizeContent = (html: string): string => {
                                    if (!html) return '';
                                    // Tạo temporary div để parse HTML
                                    const temp = document.createElement('div');
                                    temp.innerHTML = html;
                                    // Lấy text content (loại bỏ HTML tags)
                                    const textContent = temp.textContent || temp.innerText || '';
                                    // Nếu chỉ có whitespace hoặc empty, return empty string
                                    if (textContent.trim().length === 0) {
                                        return '';
                                    }
                                    // Nếu có nội dung thực sự, return HTML đã được clean
                                    return html.trim();
                                };
                                
                                // Normalize content để đảm bảo code blocks không bị merge với text
                                const normalizedContent = normalizeEditorContent(rawContent);
                                const contentToSave = sanitizeContent(normalizedContent);
                                
                                console.log('[LessonModal] Saving content:', {
                                    content_type: lessonForm.content_type,
                                    rawContentLength: rawContent.length,
                                    contentLength: contentToSave.length,
                                    contentPreview: contentToSave.substring(0, 100),
                                    hasDocumentEditor: !!documentEditorRef.current,
                                    hasDescriptionEditor: !!descriptionEditorRef.current,
                                    documentEditorHTML: documentEditorRef.current?.innerHTML?.substring(0, 50),
                                    descriptionEditorHTML: descriptionEditorRef.current?.innerHTML?.substring(0, 50)
                                });
                                
                                // Update form với content từ editor
                                // Với document type, nếu không có content nhưng đã upload PDF, vẫn cho phép save
                                // Với text/link, lưu vào content field
                                const updatedForm = {
                                    ...lessonForm,
                                    // Giữ nguyên description do user nhập/AI sinh ở field riêng
                                    description: lessonForm.description || undefined,
                                    // Content: lưu nội dung chi tiết (tùy theo loại)
                                    content: (lessonForm.content_type === 'text' || lessonForm.content_type === 'link') 
                                        ? (contentToSave || undefined)
                                        : (lessonForm.content_type === 'document' ? (contentToSave || undefined) : lessonForm.content),
                                };
                                
                                onFormChange(updatedForm);
                                
                                // Gọi onSave với form đã được update để đảm bảo có content
                                onSave(updatedForm);
                            }}
                            disabled={!lessonForm.title.trim()}
                            className="min-w-[120px]"
                        >
                            {editingLesson ? 'Cập nhật' : 'Tạo bài học'}
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Floating Toolbar - Hiển thị khi có text được chọn */}
            {showFloatingToolbar && (
                <div
                    ref={floatingToolbarRef}
                    className="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
                    style={{
                        top: `${floatingToolbarPosition.top}px`,
                        left: `${floatingToolbarPosition.left}px`,
                        transform: 'translateX(-50%)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => { handleBold(); setShowFloatingToolbar(false); }} title="Đậm" />
                    <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => { handleItalic(); setShowFloatingToolbar(false); }} title="Nghiêng" />
                    <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => { handleUnderline(); setShowFloatingToolbar(false); }} title="Gạch chân" />
                    <ToolbarDivider />
                    <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={() => { execCommand('formatBlock', 'h1', getCurrentEditor()); setShowFloatingToolbar(false); }} title="Tiêu đề 1" />
                    <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={() => { execCommand('formatBlock', 'h2', getCurrentEditor()); setShowFloatingToolbar(false); }} title="Tiêu đề 2" />
                    <ToolbarButton icon={<Heading3 className="w-4 h-4" />} onClick={() => { execCommand('formatBlock', 'h3', getCurrentEditor()); setShowFloatingToolbar(false); }} title="Tiêu đề 3" />
                    <ToolbarDivider />
                    <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => { handleUnorderedList(); setShowFloatingToolbar(false); }} title="Danh sách" />
                    <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => { handleOrderedList(); setShowFloatingToolbar(false); }} title="Danh sách có thứ tự" />
                    <ToolbarDivider />
                    <ToolbarButton icon={<Code className="w-4 h-4" />} onClick={() => { handleCode(); setShowFloatingToolbar(false); }} title="Khối mã" />
                    <ToolbarButton icon={<Sparkles className="w-4 h-4" />} onClick={() => { handlePrettierCode(); setShowFloatingToolbar(false); }} title="Format code" />
                </div>
            )}
        </div>
    );
}

export default LessonModal;