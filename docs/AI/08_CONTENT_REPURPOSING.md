# 📹 HỆ THỐNG XỬ LÝ & TÁI DÙNG NỘI DUNG

**Tài liệu:** 08 - Content Repurposing  
**Phiên bản:** 2.0  
**Cập nhật:** 17 tháng 12, 2025  
**Ưu tiên:** P1 (Chi phí cao, giá trị kinh doanh cao)

---

## 📖 TỔNG QUAN

Hệ thống Content Repurposing cho phép giáo viên tải lên video, tài liệu, hoặc bài giảng và tự động chuyển đổi thành các định dạng khác: tóm tắt, flashcard, ghi chú học tập, câu hỏi ôn tập.

### Giá trị kinh doanh
- 🎥 **Video → 6 định dạng:** Transcript, tóm tắt, flashcard, ghi chú, QA, outline
- 📄 **PDF → Học liệu:** Text extraction, structure analysis, interactive elements
- ⏱️ **Tiết kiệm thời gian:** 1 video → 4-6 tiếng công làm → 20 phút xử lý
- 💰 **Chi phí thấp:** Dùng Gemini 3 Pro's 2M token context (xử lý 2-3 tiếng video)

### Trường hợp sử dụng
1. **Video lectures:** Chuyển thành tài liệu học
2. **PDF textbooks:** Tạo flashcard + quiz
3. **Webinars:** Tóm tắt + action items
4. **Documentation:** Chuyển thành blog + tutorial

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Luồng xử lý nội dung (Content Processing Flow)

```
┌──────────────────────────────────────────────────┐
│         GIÁO VIÊN TẢI LÊN NỘI DUNG              │
│  Video/PDF → Tiêu đề → Chọn định dạng output   │
└────────────────┬─────────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
      VIDEO   PDF    DOCUMENT
        │        │        │
        ▼        ▼        ▼
     Transcribe Extract  Parse
     (Whisper)  (PyPDF)  (Text)
        │        │        │
        └────────┼────────┘
                 │
     ┌───────────▼────────────┐
     │  CONTENT ANALYSIS      │
     │ (Gemini 3 Pro Preview) │
     │  - Tìm chủ đề chính     │
     │  - Tìm key concepts     │
     │  - Tìm ví dụ           │
     └───────────┬────────────┘
                 │
     ┌───────────▼────────────┐
     │  GENERATE FORMATS      │
     └───────────┬────────────┘
                 │
     ┌───────────┴──────────────┬─────────────┬──────────────┐
     │                          │             │              │
  SUMMARY                   FLASHCARDS   STUDY NOTES     Q&A
  (100-200 từ)             (10-20)      (Bullet list)  (10-15)
     │                          │             │              │
     ▼                          ▼             ▼              ▼
  LƯU CACHE & DATABASE
    (Redis + PostgreSQL)
     │
     ▼
  GIÁO VIÊN TẢI VỀ
  (JSON/PDF/Markdown)
```

### Kiến trúc xử lý

```
CONTENT REPURPOSING ORCHESTRATOR
│
├─ Ingestion Service
│  ├─ VideoProcessor (Whisper API)
│  ├─ PDFExtractor (PyPDF2)
│  └─ DocumentParser (TextRank)
│
├─ Content Analyzer
│  ├─ Gemini 3 Pro Preview (2M tokens)
│  ├─ Semantic extraction
│  └─ Structure understanding
│
└─ Format Generators
   ├─ SummaryGenerator
   ├─ FlashcardGenerator
   ├─ StudyNotesGenerator
   └─ QAGenerator
```

---

## 💻 TRIỂN KHAI BACKEND

### Content Repurposing Controller

**File:** `backend/src/modules/ai/content-repurposing.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ContentRepurposingService } from './services/content-repurposing.service';

@Controller('api/v1/ai/content')
export class ContentRepurposingController {
  constructor(private contentService: ContentRepurposingService) {}

  /**
   * Upload và xử lý video
   * POST /api/v1/ai/content/upload/video
   */
  @Post('upload/video')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title: string;
      formats: ('summary' | 'flashcards' | 'notes' | 'qa' | 'transcript' | 'outline')[];
      courseId: string;
    }
  ) {
    return await this.contentService.processVideo({
      file,
      title: body.title,
      formats: body.formats,
      courseId: body.courseId,
      uploadedBy: req.user.id
    });
  }

  /**
   * Upload và xử lý PDF
   * POST /api/v1/ai/content/upload/pdf
   */
  @Post('upload/pdf')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title: string;
      formats: ('summary' | 'flashcards' | 'notes' | 'qa' | 'outline')[];
      courseId: string;
    }
  ) {
    return await this.contentService.processPDF({
      file,
      title: body.title,
      formats: body.formats,
      courseId: body.courseId,
      uploadedBy: req.user.id
    });
  }

  /**
   * Lấy kết quả xử lý
   * GET /api/v1/ai/content/:contentId
   */
  @Get(':contentId')
  @UseGuards(AuthGuard('jwt'))
  async getContent(@Param('contentId') contentId: string) {
    return await this.contentService.getContent(contentId);
  }

  /**
   * Download định dạng cụ thể
   * GET /api/v1/ai/content/:contentId/download/:format
   */
  @Get(':contentId/download/:format')
  @UseGuards(AuthGuard('jwt'))
  async downloadFormat(
    @Param('contentId') contentId: string,
    @Param('format') format: string
  ) {
    return await this.contentService.downloadFormat(contentId, format);
  }
}
```

### Content Repurposing Service

**File:** `backend/src/modules/ai/services/content-repurposing.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ProxyPalService } from './providers/proxypal.service';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';
import axios from 'axios';

interface ProcessingRequest {
  file: Express.Multer.File;
  title: string;
  formats: string[];
  courseId: string;
  uploadedBy: string;
}

interface ContentOutput {
  contentId: string;
  title: string;
  originalFile: string;
  formats: {
    summary?: string;
    flashcards?: any[];
    notes?: string;
    qa?: any[];
    transcript?: string;
    outline?: string;
  };
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

@Injectable()
export class ContentRepurposingService {
  private proxypal: ProxyPalService;
  private redis: Redis;
  private uploadDir = './uploads/content';

  constructor() {
    this.proxypal = new ProxyPalService();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      db: 2
    });

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Xử lý video
   */
  async processVideo(request: ProcessingRequest): Promise<ContentOutput> {
    const contentId = this.generateContentId();
    console.log(`[Content] Processing video: ${contentId}`);

    // Lưu file tạm thời
    const videoPath = path.join(this.uploadDir, `${contentId}.mp4`);
    fs.writeFileSync(videoPath, request.file.buffer);

    try {
      // Stage 1: Extract audio & transcribe
      console.log('[Content] Stage 1: Transcription');
      const audioPath = await this.extractAudio(videoPath, contentId);
      const transcript = await this.transcribeAudio(audioPath);

      // Stage 2: Analyze content
      console.log('[Content] Stage 2: Content Analysis');
      const analysis = await this.analyzeContent(transcript, request.title);

      // Stage 3: Generate formats
      console.log('[Content] Stage 3: Format Generation');
      const output: ContentOutput = {
        contentId,
        title: request.title,
        originalFile: videoPath,
        formats: {},
        status: 'processing',
        createdAt: new Date()
      };

      // Tạo từng format
      if (request.formats.includes('summary')) {
        output.formats.summary = await this.generateSummary(transcript, analysis);
      }

      if (request.formats.includes('flashcards')) {
        output.formats.flashcards = await this.generateFlashcards(transcript, analysis);
      }

      if (request.formats.includes('notes')) {
        output.formats.notes = await this.generateStudyNotes(transcript, analysis);
      }

      if (request.formats.includes('qa')) {
        output.formats.qa = await this.generateQA(transcript, analysis);
      }

      if (request.formats.includes('transcript')) {
        output.formats.transcript = transcript;
      }

      if (request.formats.includes('outline')) {
        output.formats.outline = await this.generateOutline(transcript, analysis);
      }

      output.status = 'completed';

      // Cache result
      await this.redis.setex(
        `content:${contentId}`,
        30 * 24 * 60 * 60, // 30 ngày
        JSON.stringify(output)
      );

      // Save to database
      await this.saveToDatabase(output);

      return output;
    } catch (error) {
      console.error(`[Content] Error processing video ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Xử lý PDF
   */
  async processPDF(request: ProcessingRequest): Promise<ContentOutput> {
    const contentId = this.generateContentId();
    console.log(`[Content] Processing PDF: ${contentId}`);

    const pdfPath = path.join(this.uploadDir, `${contentId}.pdf`);
    fs.writeFileSync(pdfPath, request.file.buffer);

    try {
      // Extract text từ PDF
      console.log('[Content] Stage 1: PDF Text Extraction');
      const text = await this.extractPDFText(pdfPath);

      // Analyze content
      console.log('[Content] Stage 2: Content Analysis');
      const analysis = await this.analyzeContent(text, request.title);

      // Generate formats
      const output: ContentOutput = {
        contentId,
        title: request.title,
        originalFile: pdfPath,
        formats: {},
        status: 'processing',
        createdAt: new Date()
      };

      if (request.formats.includes('summary')) {
        output.formats.summary = await this.generateSummary(text, analysis);
      }

      if (request.formats.includes('flashcards')) {
        output.formats.flashcards = await this.generateFlashcards(text, analysis);
      }

      if (request.formats.includes('notes')) {
        output.formats.notes = await this.generateStudyNotes(text, analysis);
      }

      if (request.formats.includes('qa')) {
        output.formats.qa = await this.generateQA(text, analysis);
      }

      if (request.formats.includes('outline')) {
        output.formats.outline = await this.generateOutline(text, analysis);
      }

      output.status = 'completed';

      await this.redis.setex(
        `content:${contentId}`,
        30 * 24 * 60 * 60,
        JSON.stringify(output)
      );

      await this.saveToDatabase(output);
      return output;
    } catch (error) {
      console.error(`[Content] Error processing PDF ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Extract audio từ video (ffmpeg)
   */
  private async extractAudio(videoPath: string, contentId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioPath = path.join(this.uploadDir, `${contentId}.wav`);
      const command = `ffmpeg -i "${videoPath}" -q:a 9 -n "${audioPath}"`;

      exec(command, (error) => {
        if (error) reject(error);
        else resolve(audioPath);
      });
    });
  }

  /**
   * Transcribe audio (Whisper API)
   */
  private async transcribeAudio(audioPath: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioPath));
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
          }
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Phân tích nội dung (Gemini 3 Pro - 2M tokens)
   */
  private async analyzeContent(text: string, title: string): Promise<any> {
    const prompt = `Phân tích chi tiết nội dung sau:

TIÊU ĐỀ: ${title}

NỘI DUNG:
${text.substring(0, 500000)} # Truncate để phù hợp 2M token

PHÂN TÍCH YÊU CẦU:
1. Xác định 5-10 chủ đề chính
2. Xác định 10-15 khái niệm quan trọng
3. Tìm các ví dụ đáng ghi nhớ
4. Xác định kết quả học tập chính
5. Đánh giá mức độ khó

OUTPUT JSON:
{
  "mainTopics": ["topic1", ...],
  "keyConceptsWithDefinitions": {"concept1": "definition1", ...},
  "examples": ["example1", ...],
  "learningOutcomes": ["outcome1", ...],
  "difficulty": "beginner|intermediate|advanced",
  "keyTakeaways": ["takeaway1", ...]
}`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.3
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return { mainTopics: [], keyConceptsWithDefinitions: {} };
    }
  }

  /**
   * Tạo tóm tắt
   */
  private async generateSummary(text: string, analysis: any): Promise<string> {
    const prompt = `Viết tóm tắt chi tiết (150-200 từ) cho nội dung sau:

${text.substring(0, 10000)}

Chủ đề chính: ${analysis.mainTopics?.join(', ')}
Kết quả học tập: ${analysis.learningOutcomes?.join(', ')}

Tóm tắt phải:
- Rõ ràng và dễ hiểu
- Bao hàm các điểm chính
- Phù hợp cho học sinh`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.7
    });

    return response.text;
  }

  /**
   * Tạo flashcards
   */
  private async generateFlashcards(text: string, analysis: any): Promise<any[]> {
    const prompt = `Tạo 15-20 flashcard cho nội dung sau:

${text.substring(0, 10000)}

Khái niệm chính: ${Object.keys(analysis.keyConceptsWithDefinitions || {}).join(', ')}

Mỗi flashcard có:
{
  "front": "Câu hỏi hoặc khái niệm",
  "back": "Định nghĩa hoặc câu trả lời",
  "concept": "Khái niệm liên quan",
  "difficulty": "easy|medium|hard"
}

Trả về mảng JSON`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.5
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return [];
    }
  }

  /**
   * Tạo ghi chú học tập
   */
  private async generateStudyNotes(text: string, analysis: any): Promise<string> {
    const prompt = `Tạo ghi chú học tập (bullet points) từ nội dung sau:

${text.substring(0, 10000)}

Format:
# Tiêu đề chính
## Tiêu đề phụ
- Điểm quan trọng 1
- Điểm quan trọng 2
  - Chi tiết thêm

Ghi chú phải:
- Dễ quét nhanh
- Có cấu trúc rõ ràng
- Phù hợp cho ôn tập`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.7
    });

    return response.text;
  }

  /**
   * Tạo Q&A
   */
  private async generateQA(text: string, analysis: any): Promise<any[]> {
    const prompt = `Tạo 10-15 cặp câu hỏi-trả lời từ nội dung:

${text.substring(0, 10000)}

Trả về mảng JSON:
[
  {
    "question": "Câu hỏi",
    "answer": "Trả lời chi tiết",
    "concept": "Khái niệm liên quan",
    "type": "definition|explanation|application"
  }
]`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.6
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return [];
    }
  }

  /**
   * Tạo outline
   */
  private async generateOutline(text: string, analysis: any): Promise<string> {
    const prompt = `Tạo outline chi tiết từ nội dung:

${text.substring(0, 10000)}

Format:
1. Tiêu đề chính 1
   1.1 Tiêu đề phụ
   1.2 Tiêu đề phụ
2. Tiêu đề chính 2
   ...

Outline phải:
- Cấu trúc logic
- Dễ theo dõi
- Phù hợp cho giảng dạy`;

    const response = await this.proxypal.generateContent({
      model: 'gemini-3-pro-preview',
      prompt,
      temperature: 0.5
    });

    return response.text;
  }

  /**
   * Extract text từ PDF
   */
  private async extractPDFText(pdfPath: string): Promise<string> {
    const { PdfReader } = require('pdfreader');

    return new Promise((resolve, reject) => {
      const text: string[] = [];
      new PdfReader().parseFileItems(pdfPath, (err: Error, item: any) => {
        if (err) reject(err);
        if (!item) return resolve(text.join('\n'));
        if (item.text) text.push(item.text);
      });
    });
  }

  /**
   * Lấy content
   */
  async getContent(contentId: string): Promise<ContentOutput> {
    const cached = await this.redis.get(`content:${contentId}`);
    if (cached) return JSON.parse(cached);

    // Load từ database
    const record = await this.getFromDatabase(contentId);
    return record;
  }

  /**
   * Download định dạng
   */
  async downloadFormat(contentId: string, format: string): Promise<any> {
    const content = await this.getContent(contentId);

    if (format === 'json') {
      return content.formats;
    }

    if (format === 'pdf') {
      // Generate PDF từ formats
      return this.generatePDF(content);
    }

    if (format === 'markdown') {
      return this.generateMarkdown(content);
    }
  }

  private generateContentId(): string {
    return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveToDatabase(output: ContentOutput): Promise<void> {
    // Save to PostgreSQL
  }

  private async getFromDatabase(contentId: string): Promise<ContentOutput> {
    // Get from PostgreSQL
    return {} as ContentOutput;
  }

  private async generatePDF(content: ContentOutput): Promise<Buffer> {
    // Generate PDF using PDFKit
    return Buffer.from('');
  }

  private async generateMarkdown(content: ContentOutput): Promise<string> {
    let markdown = `# ${content.title}\n\n`;

    if (content.formats.summary) {
      markdown += `## Tóm tắt\n\n${content.formats.summary}\n\n`;
    }

    if (content.formats.outline) {
      markdown += `## Outline\n\n${content.formats.outline}\n\n`;
    }

    if (content.formats.notes) {
      markdown += `## Ghi chú học tập\n\n${content.formats.notes}\n\n`;
    }

    if (content.formats.flashcards) {
      markdown += `## Flashcards\n\n`;
      content.formats.flashcards.forEach((fc, idx) => {
        markdown += `### Flashcard ${idx + 1}\n\n**Q:** ${fc.front}\n\n**A:** ${fc.back}\n\n`;
      });
    }

    if (content.formats.qa) {
      markdown += `## Q&A\n\n`;
      content.formats.qa.forEach((qa, idx) => {
        markdown += `### Q${idx + 1}: ${qa.question}\n\n${qa.answer}\n\n`;
      });
    }

    return markdown;
  }
}
```

---

## 🎨 TRIỂN KHAI FRONTEND

### Content Upload Component

**File:** `frontend/src/features/instructor/components/ContentUploadPanel.tsx`

```typescript
import React, { useState } from 'react';
import { api } from '@/services/api';
import { useDropzone } from 'react-dropzone';

export const ContentUploadPanel: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['summary']);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const isVideo = file.type.startsWith('video/');
      const isPDF = file.type === 'application/pdf';

      if (!isVideo && !isPDF) {
        alert('Vui lòng tải lên video hoặc PDF');
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || file.name);
        formData.append('formats', JSON.stringify(selectedFormats));
        formData.append('courseId', 'current-course-id');

        const endpoint = isVideo
          ? '/ai/content/upload/video'
          : '/ai/content/upload/pdf';

        const response = await api.post(endpoint, formData, {
          onUploadProgress: (progress) => {
            setProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });

        alert('Xử lý nội dung thành công!');
        console.log('Result:', response.data);
      } catch (error) {
        alert('Lỗi xử lý nội dung');
        console.error(error);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  });

  const formatOptions = [
    { id: 'summary', label: 'Tóm tắt' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'notes', label: 'Ghi chú học tập' },
    { id: 'qa', label: 'Câu hỏi-Trả lời' },
    { id: 'transcript', label: 'Phiên dịch (video)' },
    { id: 'outline', label: 'Outline' }
  ];

  return (
    <div className="content-upload space-y-6">
      <div className="upload-area">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            📁 Kéo thả hoặc nhấp để tải lên video/PDF
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Video tối đa 500MB, PDF tối đa 100MB
          </p>
        </div>
      </div>

      {uploading && (
        <div className="progress-bar">
          <div className="text-sm mb-2">Đang xử lý... {progress}%</div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="title-input">
        <label className="block text-sm font-semibold mb-2">
          Tiêu đề nội dung
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề..."
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div className="format-selection">
        <label className="block text-sm font-semibold mb-3">
          Chọn định dạng output
        </label>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((format) => (
            <label key={format.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFormats.includes(format.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFormats([...selectedFormats, format.id]);
                  } else {
                    setSelectedFormats(
                      selectedFormats.filter((f) => f !== format.id)
                    );
                  }
                }}
              />
              <span>{format.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## ⚙️ CẤU HÌNH

**File:** `backend/.env`

```bash
# Content Repurposing
CONTENT_UPLOAD_DIR=./uploads/content
CONTENT_MAX_VIDEO_SIZE=524288000 # 500MB
CONTENT_MAX_PDF_SIZE=104857600 # 100MB
CONTENT_CACHE_TTL=2592000 # 30 ngày

# Transcription
OPENAI_API_KEY=sk-...
WHISPER_MODEL=whisper-1

# Processing
CONTENT_PARALLEL_FORMATS=4
CONTENT_GEMINI_CHUNK_SIZE=500000
```

---

## 🧪 KIỂM THỬ

```typescript
describe('Content Repurposing', () => {
  it('should process video successfully', async () => {
    const videoFile = new File(['video data'], 'test.mp4', {
      type: 'video/mp4'
    });

    const result = await service.processVideo({
      file: videoFile,
      title: 'Test Video',
      formats: ['summary', 'flashcards'],
      courseId: 'course-1',
      uploadedBy: 'teacher-1'
    });

    expect(result.status).toBe('completed');
    expect(result.formats.summary).toBeTruthy();
    expect(result.formats.flashcards?.length).toBeGreaterThan(0);
  });

  it('should extract text from PDF', async () => {
    const pdfFile = new File(['pdf data'], 'test.pdf', {
      type: 'application/pdf'
    });

    const result = await service.processPDF({
      file: pdfFile,
      title: 'Test PDF',
      formats: ['outline', 'qa'],
      courseId: 'course-1',
      uploadedBy: 'teacher-1'
    });

    expect(result.formats.outline).toBeTruthy();
    expect(result.formats.qa?.length).toBeGreaterThan(0);
  });
});
```

---

## 📚 LIÊN QUAN

- **Trước:** [07_DEBATE_WORKFLOW.md](07_DEBATE_WORKFLOW.md)
- **Tiếp:** [09_ADAPTIVE_LEARNING.md](09_ADAPTIVE_LEARNING.md)
- **Chiến lược:** [02_INFRASTRUCTURE.md](02_INFRASTRUCTURE.md)

---

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 17 tháng 12, 2025
