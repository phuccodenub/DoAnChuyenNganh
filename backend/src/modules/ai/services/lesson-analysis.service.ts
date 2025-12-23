/**
 * Lesson Analysis Service
 * 
 * Main service for analyzing lessons with AI
 * - Full lesson analysis (content + video)
 * - Summary generation
 * - Video analysis with Gemini 3 Pro
 * - Context extraction for AI Tutor
 */

import logger from '../../../utils/logger.util';
import AILessonAnalysis, { AILessonAnalysisAttributes } from '../models/ai-lesson-analysis.model';
import Lesson from '../../../models/lesson.model';
import { proxyPalHealthCheck } from './proxypal-health.service';
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';

interface VideoAnalysisResult {
  transcript: string;
  keyPoints: string[];
  duration: number;
  summary: string;
}

interface LessonAnalysisResult {
  summary: string;
  keyConcepts: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedStudyTime: number;
  videoAnalysis?: VideoAnalysisResult;
}

export class LessonAnalysisService {
  private proxyPalProvider: ProxyPalProvider;
  private googleProvider: GoogleAIProvider;

  constructor() {
    // Initialize providers
    // Use PROXYPAL_BASE_URL from .env
    // NOTE: If running in Docker and ProxyPal is on host, use host.docker.internal in .env
    // Default to 127.0.0.1 for local development
    const proxypalBaseUrl = process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1';
    
    this.proxyPalProvider = new ProxyPalProvider({
      baseUrl: proxypalBaseUrl,
      model: 'gemini-3-pro-preview',
      temperature: 0.3,
      maxTokens: 4096,
    });

    this.googleProvider = new GoogleAIProvider({
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 2048,
    });
  }

  /**
   * Analyze full lesson (content + video if exists)
   */
  async analyzeLesson(lessonId: string): Promise<any> {
    try {
      logger.info(`[LessonAnalysis] Starting full analysis for lesson ${lessonId}`);

      // Find or create analysis record
      let analysis = await AILessonAnalysis.findOne({
        where: { lesson_id: lessonId },
      });

      if (!analysis) {
        analysis = await AILessonAnalysis.create({
          lesson_id: lessonId,
          status: 'processing',
          processing_started_at: new Date(),
        });
      } else {
        await analysis.update({
          status: 'processing',
          processing_started_at: new Date(),
          version: analysis.version + 1,
        });
      }

      // Fetch lesson data
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new Error(`Lesson ${lessonId} not found`);
      }

      // Analyze video if exists
      let videoAnalysis: VideoAnalysisResult | undefined;
      if (lesson.video_url && lesson.content_type === 'video') {
        try {
          videoAnalysis = await this.analyzeVideoContent(lesson.video_url);
          logger.info(`[LessonAnalysis] Video analysis completed for lesson ${lessonId}`);
        } catch (error: any) {
          logger.warn(`[LessonAnalysis] Video analysis failed: ${error.message}`);
          // Continue without video analysis
        }
      }

      // Analyze text content
      const contentAnalysis = await this.analyzeTextContent(
        lesson.title,
        lesson.content || '',
        lesson.description || '',
        videoAnalysis?.transcript
      );

      // Generate comprehensive summary
      const summary = await this.generateComprehensiveSummary(
        lesson.title,
        lesson.content || '',
        lesson.description || '',
        videoAnalysis
      );

      // Update analysis record
      await analysis.update({
        summary,
        summary_language: 'vi',
        video_transcript: videoAnalysis?.transcript || null,
        video_key_points: videoAnalysis?.keyPoints || null,
        video_duration_analyzed: videoAnalysis?.duration || null,
        content_key_concepts: contentAnalysis.keyConcepts,
        content_difficulty_level: contentAnalysis.difficultyLevel,
        estimated_study_time: contentAnalysis.estimatedStudyTime,
        status: 'completed',
        processing_completed_at: new Date(),
        analyzed_by: 'proxypal',
        model_used: 'gemini-3-pro-preview',
      });

      logger.info(`[LessonAnalysis] ✅ Full analysis completed for lesson ${lessonId}`);
      return analysis;

    } catch (error: any) {
      logger.error(`[LessonAnalysis] Analysis failed for lesson ${lessonId}:`, error);

      // Update status to failed
      await AILessonAnalysis.update(
        {
          status: 'failed',
          error_message: error.message,
        },
        {
          where: { lesson_id: lessonId },
        }
      );

      throw error;
    }
  }

  /**
   * Generate summary only (lighter operation)
   */
  async generateSummary(lessonId: string): Promise<any> {
    try {
      logger.info(`[LessonAnalysis] Generating summary for lesson ${lessonId}`);

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new Error(`Lesson ${lessonId} not found`);
      }

      // Find or create analysis record
      let analysis = await AILessonAnalysis.findOne({
        where: { lesson_id: lessonId },
      });

      if (!analysis) {
        analysis = await AILessonAnalysis.create({
          lesson_id: lessonId,
          status: 'processing',
        });
      }

      // Generate summary
      const summary = await this.generateComprehensiveSummary(
        lesson.title,
        lesson.content || '',
        lesson.description || ''
      );

      await analysis.update({
        summary,
        summary_language: 'vi',
        status: 'completed',
        processing_completed_at: new Date(),
        analyzed_by: 'proxypal',
        model_used: 'gemini-3-pro-preview',
      });

      logger.info(`[LessonAnalysis] ✅ Summary generated for lesson ${lessonId}`);
      return analysis;

    } catch (error: any) {
      logger.error(`[LessonAnalysis] Summary generation failed:`, error);
      throw error;
    }
  }

  /**
   * Analyze video only
   */
  async analyzeVideo(lessonId: string): Promise<any> {
    try {
      logger.info(`[LessonAnalysis] Analyzing video for lesson ${lessonId}`);

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson || !lesson.video_url) {
        throw new Error(`Lesson ${lessonId} has no video`);
      }

      const videoAnalysis = await this.analyzeVideoContent(lesson.video_url);

      let analysis = await AILessonAnalysis.findOne({
        where: { lesson_id: lessonId },
      });

      if (!analysis) {
        analysis = await AILessonAnalysis.create({
          lesson_id: lessonId,
          status: 'processing',
        });
      }

      await analysis.update({
        video_transcript: videoAnalysis.transcript,
        video_key_points: videoAnalysis.keyPoints,
        video_duration_analyzed: videoAnalysis.duration,
        status: 'completed',
        processing_completed_at: new Date(),
        analyzed_by: 'proxypal',
        model_used: 'gemini-3-pro-preview',
      });

      logger.info(`[LessonAnalysis] ✅ Video analyzed for lesson ${lessonId}`);
      return analysis;

    } catch (error: any) {
      logger.error(`[LessonAnalysis] Video analysis failed:`, error);
      throw error;
    }
  }

  /**
   * Analyze video content with Gemini 3 Pro (multimodal)
   */
  private async analyzeVideoContent(videoUrl: string): Promise<VideoAnalysisResult> {
    try {
      // Check if ProxyPal is available
      const proxyPalAvailable = await proxyPalHealthCheck.isAvailable();
      if (!proxyPalAvailable) {
        throw new Error('ProxyPal is offline, cannot analyze video');
      }

      // Prepare video URL (handle R2 and YouTube)
      const processedUrl = this.prepareVideoUrl(videoUrl);

      const prompt = `Phân tích video bài giảng này và cung cấp:

1. **Transcript (Phiên bản đầy đủ):** Chuyển đổi toàn bộ nội dung âm thanh thành text (tiếng Việt hoặc tiếng Anh tuỳ video)

2. **Key Points (5-7 điểm chính):** Những điểm quan trọng nhất được đề cập trong video

3. **Tóm tắt (Summary):** Tóm tắt ngắn gọn nội dung video (3-5 câu)

4. **Duration:** Thời lượng video (giây)

Format trả về dưới dạng JSON:
\`\`\`json
{
  "transcript": "...",
  "keyPoints": ["...", "..."],
  "summary": "...",
  "duration": 0
}
\`\`\``;

      const response = await this.proxyPalProvider.generateContent({
        prompt,
        systemPrompt: 'Bạn là trợ lý AI chuyên phân tích video bài giảng. Trả lời chính xác theo format JSON được yêu cầu.',
        maxTokens: 4096,
        temperature: 0.3,
      });

      // Parse JSON response
      const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response.text;
      const result = JSON.parse(jsonStr);

      return {
        transcript: result.transcript || '',
        keyPoints: result.keyPoints || [],
        summary: result.summary || '',
        duration: result.duration || 0,
      };

    } catch (error: any) {
      logger.error('[LessonAnalysis] Video analysis error:', error);
      throw new Error(`Failed to analyze video: ${error.message}`);
    }
  }

  /**
   * Analyze text content
   */
  private async analyzeTextContent(
    title: string,
    content: string,
    description: string,
    videoTranscript?: string
  ): Promise<{
    keyConcepts: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    estimatedStudyTime: number;
  }> {
    const fullText = `
Tiêu đề: ${title}

Mô tả: ${description}

Nội dung:
${content}

${videoTranscript ? `Transcript video:\n${videoTranscript}` : ''}
    `.trim();

    const prompt = `Phân tích bài học sau và trả về JSON với các thông tin:

${fullText}

Trả về format:
\`\`\`json
{
  "keyConcepts": ["Khái niệm 1", "Khái niệm 2", ...],
  "difficultyLevel": "beginner|intermediate|advanced",
  "estimatedStudyTime": 30
}
\`\`\`

- keyConcepts: 5-10 khái niệm chính trong bài học
- difficultyLevel: Độ khó của bài học
- estimatedStudyTime: Thời gian học ước tính (phút)
`;

    try {
      const proxyPalAvailable = await proxyPalHealthCheck.isAvailable();
      const provider = proxyPalAvailable ? this.proxyPalProvider : this.googleProvider;

      const response = await provider.generateContent({
        prompt,
        systemPrompt: 'Bạn là trợ lý AI chuyên phân tích nội dung bài học. Trả lời chính xác theo format JSON.',
        maxTokens: 1024,
        temperature: 0.2,
      });

      const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response.text;
      const result = JSON.parse(jsonStr);

      return {
        keyConcepts: result.keyConcepts || [],
        difficultyLevel: result.difficultyLevel || 'intermediate',
        estimatedStudyTime: result.estimatedStudyTime || 30,
      };
    } catch (error: any) {
      logger.warn('[LessonAnalysis] Content analysis failed, using defaults:', error.message);
      return {
        keyConcepts: [],
        difficultyLevel: 'intermediate',
        estimatedStudyTime: 30,
      };
    }
  }

  /**
   * Generate comprehensive summary
   */
  private async generateComprehensiveSummary(
    title: string,
    content: string,
    description: string,
    videoAnalysis?: VideoAnalysisResult
  ): Promise<string> {
    const fullContent = `
# ${title}

## Mô tả
${description}

## Nội dung bài học
${content}

${videoAnalysis ? `
## Nội dung từ video
${videoAnalysis.summary}

### Những điểm chính:
${videoAnalysis.keyPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}
` : ''}
    `.trim();

    const prompt = `Tạo bản tóm tắt chi tiết cho bài học sau. Tóm tắt phải:

1. Ngắn gọn, súc tích (200-400 từ)
2. Bao gồm những điểm chính
3. Dễ hiểu cho học viên
4. Sử dụng markdown formatting
5. Bao gồm code examples nếu có

Bài học:
${fullContent}

Tóm tắt:`;

    try {
      const proxyPalAvailable = await proxyPalHealthCheck.isAvailable();
      const provider = proxyPalAvailable ? this.proxyPalProvider : this.googleProvider;

      const response = await provider.generateContent({
        prompt,
        systemPrompt: 'Bạn là trợ lý AI chuyên tạo tóm tắt bài học. Tạo tóm tắt chi tiết, dễ hiểu với markdown formatting.',
        maxTokens: 2048,
        temperature: 0.4,
      });

      return response.text;
    } catch (error: any) {
      logger.error('[LessonAnalysis] Summary generation failed:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Prepare video URL for analysis
   */
  private prepareVideoUrl(videoUrl: string): string {
    // YouTube URLs can be used directly
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return videoUrl;
    }

    // R2 URLs - need to ensure they're accessible
    if (videoUrl.includes('.r2.dev') || videoUrl.includes('cloudflare')) {
      // If R2 URL is private, we'd need signed URL here
      // For now, assume it's public or backend can access it
      return videoUrl;
    }

    return videoUrl;
  }

  /**
   * Get lesson analysis for AI Tutor context
   */
  async getLessonContext(lessonId: string): Promise<string> {
    try {
      const analysis = await AILessonAnalysis.findOne({
        where: { lesson_id: lessonId, status: 'completed' },
      });

      if (!analysis) {
        return '';
      }

      let context = `# Context về bài học\n\n`;
      
      if (analysis.summary) {
        context += `## Tóm tắt bài học:\n${analysis.summary}\n\n`;
      }

      if (analysis.content_key_concepts && Array.isArray(analysis.content_key_concepts)) {
        context += `## Các khái niệm chính:\n`;
        context += analysis.content_key_concepts.map((c: string) => `- ${c}`).join('\n');
        context += `\n\n`;
      }

      if (analysis.video_key_points && Array.isArray(analysis.video_key_points)) {
        context += `## Điểm chính từ video:\n`;
        context += analysis.video_key_points.map((p: string, idx: number) => `${idx + 1}. ${p}`).join('\n');
        context += `\n\n`;
      }

      return context;
    } catch (error: any) {
      logger.error('[LessonAnalysis] Failed to get lesson context:', error);
      return '';
    }
  }
}
