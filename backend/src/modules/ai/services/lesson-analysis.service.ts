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
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GeminiVideoService } from './gemini-video.service';

interface VideoAnalysisResult {
  transcript: string;
  keyPoints: string[];
  duration: number;
  summary: string;
  metadata?: { provider: string; model: string };
}

interface LessonAnalysisResult {
  summary: string;
  keyConcepts: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedStudyTime: number;
  videoAnalysis?: VideoAnalysisResult;
}

export class LessonAnalysisService {
  private proxyPalProviders: Map<string, ProxyPalProvider>;
  private geminiVideoService: GeminiVideoService | null = null;
  // Priority order: Start with GPT models (more stable in ProxyPal), then Gemini as fallback
  private readonly PROXYPAL_MODELS = ['gpt-5.2', 'gpt-5.1', 'gpt-5'];

  constructor() {
    // Initialize providers
    // Use PROXYPAL_BASE_URL from .env
    // NOTE: If running in Docker and ProxyPal is on host, use host.docker.internal in .env
    // Default to 127.0.0.1 for local development
    const proxypalBaseUrl = process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1';
    const proxypalApiKey = process.env.PROXYPAL_API_KEY || 'proxypal-local';
    
    // Create multiple ProxyPal providers with different models for fallback
    this.proxyPalProviders = new Map();
    this.PROXYPAL_MODELS.forEach(model => {
      this.proxyPalProviders.set(model, new ProxyPalProvider({
        baseUrl: proxypalBaseUrl,
        apiKey: proxypalApiKey,
        model: model as any,
        temperature: 0.3,
        maxTokens: 4096,
      }));
    });

    // Direct Gemini API for VIDEO understanding (ProxyPal chat/completions cannot attach video/file inputs)
    try {
      if (process.env.GEMINI_API_KEY) {
        this.geminiVideoService = new GeminiVideoService(process.env.GEMINI_API_KEY);
      }
    } catch (e: any) {
      logger.warn('[LessonAnalysis] GeminiVideoService not available:', e?.message);
      this.geminiVideoService = null;
    }
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
        const analysisData = analysis.get({ plain: true }) as AILessonAnalysisAttributes;
        await analysis.update({
          status: 'processing',
          processing_started_at: new Date(),
          version: (analysisData.version || 0) + 1,
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
          // Don't log full error object (may have circular refs from axios)
          logger.warn('[LessonAnalysis] Video analysis failed', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            status: error?.response?.status,
            lessonId
          });
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

      // Determine last used provider/model for audit
      const lastUsedProvider = videoAnalysis?.metadata?.provider || summary.metadata.provider || contentAnalysis.metadata.provider;
      const lastUsedModel = videoAnalysis?.metadata?.model || summary.metadata.model || contentAnalysis.metadata.model;

      // Update analysis record
      await analysis.update({
        summary: summary.text,
        summary_language: 'vi',
        video_transcript: videoAnalysis?.transcript || null,
        video_key_points: videoAnalysis?.keyPoints || null,
        video_duration_analyzed: videoAnalysis?.duration || null,
        content_key_concepts: contentAnalysis.keyConcepts,
        content_difficulty_level: contentAnalysis.difficultyLevel,
        estimated_study_time: contentAnalysis.estimatedStudyTime,
        status: 'completed',
        processing_completed_at: new Date(),
        analyzed_by: lastUsedProvider,
        model_used: lastUsedModel,
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
        summary: summary.text,
        summary_language: 'vi',
        status: 'completed',
        processing_completed_at: new Date(),
        analyzed_by: summary.metadata.provider,
        model_used: summary.metadata.model,
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
        analyzed_by: videoAnalysis.metadata.provider,
        model_used: videoAnalysis.metadata.model,
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
  private async analyzeVideoContent(videoUrl: string): Promise<VideoAnalysisResult & { metadata: { provider: string; model: string } }> {
    try {
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

      // Primary: Direct Gemini API video understanding (supports YouTube URL / inline_data / Files API)
      if (!this.geminiVideoService) {
        throw new Error('GEMINI_API_KEY chưa được cấu hình để phân tích video (cần Gemini API trực tiếp).');
      }

      const model = process.env.GEMINI_VIDEO_MODEL || 'gemini-3-pro-preview';
      const text = await this.geminiVideoService.generateWithVideo({
        videoUrl: processedUrl,
        prompt,
        systemPrompt: 'Bạn là trợ lý AI chuyên phân tích video bài giảng. Trả lời chính xác theo format JSON được yêu cầu.',
        temperature: 0.3,
        maxOutputTokens: 4096,
        model,
      });

      const metadata = { provider: 'google-direct', model };
      logger.info(`[LessonAnalysis] Video analysis completed with ${model} (direct Gemini API)`);

      // Parse JSON response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      const result = JSON.parse(jsonStr);

      return {
        transcript: result.transcript || '',
        keyPoints: result.keyPoints || [],
        summary: result.summary || '',
        duration: result.duration || 0,
        metadata,
      };

    } catch (error: any) {
      logger.error('[LessonAnalysis] Video analysis error', {
        message: error?.message || 'Unknown error',
        code: error?.code,
        status: error?.response?.status,
        url: videoUrl
      });
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
    metadata: { provider: string; model: string };
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
      // Try each ProxyPal model
      for (const modelName of this.PROXYPAL_MODELS) {
        const provider = this.proxyPalProviders.get(modelName)!;
        
        try {
          logger.info(`[LessonAnalysis] Content analysis with ProxyPal ${modelName}`);

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
            metadata: { provider: 'proxypal', model: modelName },
          };
        } catch (modelError: any) {
          logger.warn('[LessonAnalysis] Content analysis failed', {
            model: modelName,
            message: modelError?.message || 'Unknown error',
            status: modelError?.response?.status
          });
          continue;
        }
      }
      
      // All models failed, return defaults
      throw new Error('All ProxyPal models failed for content analysis');
      
    } catch (error: any) {
      logger.warn('[LessonAnalysis] Content analysis failed, using defaults:', error.message);
      return {
        keyConcepts: [],
        difficultyLevel: 'intermediate',
        estimatedStudyTime: 30,
        metadata: { provider: 'none', model: 'none' },
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
    videoAnalysis?: VideoAnalysisResult & { metadata?: { provider: string; model: string } }
  ): Promise<{ text: string; metadata: { provider: string; model: string } }> {
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
      // Try each ProxyPal model in order until one succeeds
      const errors: string[] = [];
      
      for (const modelName of this.PROXYPAL_MODELS) {
        const provider = this.proxyPalProviders.get(modelName)!;
        
        try {
          logger.info(`[LessonAnalysis] Attempting summary generation with ProxyPal ${modelName}`);
          
          const response = await provider.generateContent({
            prompt,
            systemPrompt: 'Bạn là trợ lý AI chuyên tạo tóm tắt bài học. Tạo tóm tắt chi tiết, dễ hiểu với markdown formatting.',
            maxTokens: 2048,
            temperature: 0.4,
          });

          logger.info(`[LessonAnalysis] ✅ Summary generated successfully with ProxyPal ${modelName}`);
          return { text: response.text, metadata: { provider: 'proxypal', model: modelName } };
          
        } catch (modelError: any) {
          const errorDetails = {
            model: modelName,
            message: modelError?.message || 'Unknown error',
            status: modelError?.response?.status,
            statusText: modelError?.response?.statusText,
            code: modelError?.code
          };
          logger.warn('[LessonAnalysis] ProxyPal model failed', errorDetails);
          errors.push(`${modelName}: ${errorDetails.message} (status: ${errorDetails.status || 'N/A'})`);
          // Continue to next model
        }
      }
      
      // All ProxyPal models failed
      throw new Error(`All ProxyPal models failed. Errors: ${errors.join('; ')}`);
      
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
      
      const analysisData = analysis.get({ plain: true }) as AILessonAnalysisAttributes;
      
      if (analysisData.summary) {
        context += `## Tóm tắt bài học:\n${analysisData.summary}\n\n`;
      }

      if (analysisData.content_key_concepts && Array.isArray(analysisData.content_key_concepts)) {
        context += `## Các khái niệm chính:\n`;
        context += analysisData.content_key_concepts.map((c: string) => `- ${c}`).join('\n');
        context += `\n\n`;
      }

      if (analysisData.video_key_points && Array.isArray(analysisData.video_key_points)) {
        context += `## Điểm chính từ video:\n`;
        context += analysisData.video_key_points.map((p: string, idx: number) => `${idx + 1}. ${p}`).join('\n');
        context += `\n\n`;
      }

      return context;
    } catch (error: any) {
      logger.error('[LessonAnalysis] Failed to get lesson context:', error);
      return '';
    }
  }
}
