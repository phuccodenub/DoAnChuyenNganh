/**
 * Video Understanding V2
 *
 * Pipeline (deterministic):
 * 1) Download video (public URL only)
 * 2) Extract audio via ffmpeg
 * 3) Speech-to-text via Groq Whisper
 * 4) Sample frames via ffmpeg
 * 5) Vision caption/OCR via Groq vision model
 * 6) Fusion via Groq reasoning model to produce a structured JSON result
 *
 * Safety:
 * - Hard limits on download size, frame count, and timeouts
 * - YouTube URLs are NOT supported by this v2 pipeline (no downloader included)
 */

import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';
import logger from '../../../utils/logger.util';
import env from '../../../config/env.config';
import { parseJsonFromLlmText } from '../../../utils/llm-json.util';
import { GroqProvider, OpenAIChatMessage } from '../providers/groq.provider';

export interface VideoUnderstandingV2Result {
  transcript: string;
  keyPoints: string[];
  summary: string;
  duration: number;
  timeline?: Array<{ t: number; type: 'speech' | 'slide' | 'diagram'; text: string; source: 'stt' | 'vision' }>;
  slideOutline?: Array<{ tStart?: number; tEnd?: number; title?: string; bullets?: string[]; ocr?: string }>;
  metadata: {
    providers: {
      stt: { provider: 'groq'; model: string };
      vision?: { provider: 'groq'; model: string };
      fusion: { provider: 'groq'; model: string };
    };
    debug?: {
      framesAnalyzed?: number;
      frameIntervalSec?: number;
      audioSecondsChunked?: number;
    };
  };
}

function toInt(value: string | undefined, defaultValue: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : defaultValue;
}

function toFloat(value: string | undefined, defaultValue: number): number {
  const n = value ? parseFloat(value) : NaN;
  return Number.isFinite(n) ? n : defaultValue;
}

export class VideoUnderstandingV2Service {
  private groq: GroqProvider;

  private readonly ffmpegPath: string;
  private readonly ffprobePath: string;

  private readonly maxDownloadBytes: number;
  private readonly maxFrames: number;
  private readonly frameIntervalSec: number;
  private readonly frameMaxWidth: number;
  private readonly pipelineTimeoutMs: number;


  private readonly speechModel: string;
  private readonly visionModel: string;
  private readonly fusionModel: string;

  constructor() {
    if (!env.ai.groq.apiKey) {
      throw new Error('GROQ_API_KEY is required for Video Understanding V2');
    }

    this.groq = new GroqProvider({
      apiKey: env.ai.groq.apiKey,
      model: env.ai.groq.models.default,
      temperature: 0.3,
      maxTokens: 4096,
      timeout: 60_000,
    });

    this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    this.ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';

    const maxMb = toInt(process.env.AI_VIDEO_MAX_DOWNLOAD_MB, 100);
    this.maxDownloadBytes = Math.max(10, maxMb) * 1024 * 1024;

    this.maxFrames = Math.max(0, toInt(process.env.AI_VIDEO_MAX_FRAMES, 40));
    this.frameIntervalSec = Math.max(1, toInt(process.env.AI_VIDEO_FRAME_INTERVAL_SEC, 15));
    this.frameMaxWidth = Math.max(320, toInt(process.env.AI_VIDEO_FRAME_MAX_WIDTH, 1280));

    const pipelineTimeoutMin = Math.max(1, toInt(process.env.AI_VIDEO_PIPELINE_TIMEOUT_MIN, 12));
    this.pipelineTimeoutMs = pipelineTimeoutMin * 60_000;

    this.speechModel = process.env.GROQ_MODEL_SPEECH || env.ai.groq.models.speech;
    this.visionModel = process.env.GROQ_MODEL_VISION || env.ai.groq.models.vision;
    this.fusionModel = process.env.GROQ_MODEL_REASONING || env.ai.groq.models.reasoning;

  }

  async analyzeFromUrl(videoUrl: string): Promise<VideoUnderstandingV2Result> {
    if (this.isYouTubeUrl(videoUrl)) {
      throw new Error(
        'Video Understanding V2 hiện không hỗ trợ YouTube URL (không tích hợp downloader). ' +
          'Hãy dùng AI_VIDEO_PIPELINE=legacy (Gemini) hoặc cung cấp direct downloadable video file URL.'
      );
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-video-v2-'));
    const timeoutAt = Date.now() + this.pipelineTimeoutMs;

    try {
      const videoPath = path.join(tmpDir, `video-${Date.now()}.bin`);
      await this.downloadToFile(videoUrl, videoPath);
      this.assertNotTimedOut(timeoutAt, 'after download');

      const duration = await this.tryGetDurationSeconds(videoPath);
      this.assertNotTimedOut(timeoutAt, 'after duration probe');

      const audioPath = path.join(tmpDir, 'audio.wav');
      await this.extractAudio(videoPath, audioPath);
      this.assertNotTimedOut(timeoutAt, 'after audio extraction');

      const transcript = await this.transcribeAudio(audioPath);
      this.assertNotTimedOut(timeoutAt, 'after transcription');

      // Vision stage (optional): only if maxFrames > 0
      let framesAnalyzed = 0;
      const visionFindings: Array<{ t: number; ocr?: string; caption?: string }> = [];

      if (this.maxFrames > 0) {
        const framesDir = path.join(tmpDir, 'frames');
        fs.mkdirSync(framesDir, { recursive: true });
        const framePaths = await this.extractFrames(videoPath, framesDir);
        framesAnalyzed = framePaths.length;

        for (let i = 0; i < framePaths.length; i++) {
          this.assertNotTimedOut(timeoutAt, `before frame ${i + 1}`);
          const t = i * this.frameIntervalSec;
          try {
            const res = await this.analyzeFrame(framePaths[i]);
            if (res.ocr || res.caption) {
              visionFindings.push({ t, ocr: res.ocr, caption: res.caption });
            }
          } catch (e: any) {
            // Do not fail the entire pipeline if a single frame fails.
            logger.warn('[VideoV2] Vision frame analysis failed', {
              message: e?.message,
              frame: path.basename(framePaths[i]),
            });
          }
        }
      }

      const fused = await this.fuse({ transcript, duration, visionFindings });
      this.assertNotTimedOut(timeoutAt, 'after fusion');

      return {
        transcript: fused.transcript || transcript,
        keyPoints: fused.keyPoints || [],
        summary: fused.summary || '',
        duration: fused.duration || duration || 0,
        timeline: fused.timeline,
        slideOutline: fused.slideOutline,
        metadata: {
          providers: {
            stt: { provider: 'groq', model: this.speechModel },
            vision: this.maxFrames > 0 ? { provider: 'groq', model: this.visionModel } : undefined,
            fusion: { provider: 'groq', model: this.fusionModel },
          },
          debug: {
            framesAnalyzed,
            frameIntervalSec: this.frameIntervalSec,
          },
        },
      };
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }

  }

  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  private async downloadToFile(url: string, outPath: string): Promise<void> {
    const resp = await axios.get(url, { responseType: 'stream', timeout: 180_000 });
    const contentLength = parseInt(resp.headers['content-length'] || '0', 10);

    if (contentLength > 0 && contentLength > this.maxDownloadBytes) {
      throw new Error(
        `Video file too large: ${(contentLength / 1024 / 1024).toFixed(1)}MB exceeds ${(
          this.maxDownloadBytes /
          1024 /
          1024
        ).toFixed(1)}MB limit`
      );
    }

    await new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(outPath);
      let total = 0;

      resp.data.on('data', (chunk: Buffer) => {
        total += chunk.length;
        if (total > this.maxDownloadBytes) {
          writer.destroy(new Error('Video file exceeds size limit during download'));
          try {
            resp.data.destroy();
          } catch {
            // ignore
          }
        }
      });

      resp.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async runCmd(
    bin: string,
    args: string[],
    opts?: { cwd?: string; timeoutMs?: number }
  ): Promise<{ stdout: string; stderr: string }> {
    return await new Promise((resolve, reject) => {
      const child = spawn(bin, args, {
        cwd: opts?.cwd,
        windowsHide: true,
      });

      let stdout = '';
      let stderr = '';

      const timer = opts?.timeoutMs
        ? setTimeout(() => {
            try {
              child.kill('SIGKILL');
            } catch {
              // ignore
            }
            reject(new Error(`Command timeout: ${bin} ${args.join(' ')}`));
          }, opts.timeoutMs)
        : null;

      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));

      child.on('error', (err) => {
        if (timer) clearTimeout(timer);
        reject(err);
      });

      child.on('close', (code) => {
        if (timer) clearTimeout(timer);
        if (code === 0) return resolve({ stdout, stderr });
        reject(new Error(`Command failed (${code}): ${bin} ${args.join(' ')}\n${stderr}`));
      });
    });
  }

  private assertNotTimedOut(deadlineMs: number, stage: string): void {
    if (Date.now() > deadlineMs) {
      throw new Error(`Video V2 pipeline timeout ${stage}`);
    }
  }


  private async tryGetDurationSeconds(videoPath: string): Promise<number> {
    try {
      const { stdout } = await this.runCmd(
        this.ffprobePath,
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', videoPath],
        { timeoutMs: 30_000 }
      );
      const val = toFloat(stdout.trim(), 0);
      return val > 0 ? Math.round(val) : 0;
    } catch {
      return 0;
    }
  }

  private async extractAudio(videoPath: string, outAudioPath: string): Promise<void> {
    // Whisper works well with mono 16kHz PCM
    await this.runCmd(
      this.ffmpegPath,
      ['-y', '-i', videoPath, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', outAudioPath],
      { timeoutMs: 180_000 }
    );
  }

  private async extractFrames(videoPath: string, framesDir: string): Promise<string[]> {
    // Extract at 1 frame / interval seconds and downscale to limit memory.
    const outPattern = path.join(framesDir, 'frame-%04d.jpg');

    const vf = `fps=1/${this.frameIntervalSec},scale=${this.frameMaxWidth}:-1`;

    // We cannot reliably limit number of output frames via ffmpeg alone across all builds,
    // so we extract and then slice.
    await this.runCmd(
      this.ffmpegPath,
      ['-y', '-i', videoPath, '-vf', vf, outPattern],
      { timeoutMs: 180_000 }
    );

    const all = fs
      .readdirSync(framesDir)
      .filter((f) => f.startsWith('frame-') && (f.endsWith('.jpg') || f.endsWith('.png')))
      .sort();

    const sliced = all.slice(0, this.maxFrames);
    return sliced.map((f) => path.join(framesDir, f));
  }

  private async transcribeAudio(audioPath: string): Promise<string> {
    logger.info('[VideoV2] Transcribing audio with Groq Whisper', { model: this.speechModel });
    const res = await this.groq.transcribeAudio({
      filePath: audioPath,
      model: this.speechModel,
      responseFormat: 'json',
      temperature: 0,
    });

    return (res.text || '').trim();
  }

  private async analyzeFrame(framePath: string): Promise<{ ocr?: string; caption?: string }> {
    const b64 = Buffer.from(fs.readFileSync(framePath) as any).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${b64}`;

    const messages: OpenAIChatMessage[] = [
      {
        role: 'system',
        content:
          'Bạn là trợ lý AI chuyên OCR/caption cho slide/whiteboard trong video bài giảng. ' +
          'Trả lời đúng JSON, không thêm chữ thừa.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Hãy phân tích ảnh frame này và trả về JSON:\n' +
              '{"ocr":"(text đọc được trên ảnh, nếu có)","caption":"(mô tả ngắn nội dung ảnh)"}\n' +
              '- ocr: chỉ text nhìn thấy (nếu không có, để "")\n' +
              '- caption: 1-2 câu mô tả nội dung chính (slide, code, diagram, whiteboard...).',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ],
      },
    ];

    logger.info('[VideoV2] Vision analyzing frame', { model: this.visionModel, frame: path.basename(framePath) });

    const resp = await this.groq.chatCompletion({
      model: this.visionModel,
      messages,
      temperature: 0.2,
      maxTokens: 512,
    });

    const parsed = parseJsonFromLlmText<any>(resp.text, { required: true });
    const ocr = typeof parsed.ocr === 'string' ? parsed.ocr.trim() : '';
    const caption = typeof parsed.caption === 'string' ? parsed.caption.trim() : '';

    return {
      ocr: ocr || undefined,
      caption: caption || undefined,
    };
  }

  private async fuse(input: {
    transcript: string;
    duration: number;
    visionFindings: Array<{ t: number; ocr?: string; caption?: string }>;
  }): Promise<Partial<VideoUnderstandingV2Result>> {
    const { transcript, duration, visionFindings } = input;

    // Keep prompt size bounded
    const transcriptTrimmed = transcript.length > 80_000 ? transcript.slice(0, 80_000) + '...[TRUNCATED]' : transcript;
    const findingsTrimmed = visionFindings.slice(0, 120).map((f) => ({
      t: f.t,
      ocr: (f.ocr || '').slice(0, 2000),
      caption: (f.caption || '').slice(0, 800),
    }));

    const prompt =
      'Hãy hợp nhất dữ liệu phân tích video bài giảng và trả về JSON đúng schema sau.\n' +
      'Không bịa nội dung không có trong transcript/vision. Nếu thiếu thì để rỗng hoặc bỏ trường.\n\n' +
      'Schema (JSON):\n' +
      '{\n' +
      '  "transcript": "string",\n' +
      '  "keyPoints": ["string"],\n' +
      '  "summary": "string",\n' +
      '  "duration": number,\n' +
      '  "timeline": [ {"t": number, "type": "speech|slide|diagram", "text": "string", "source": "stt|vision"} ],\n' +
      '  "slideOutline": [ {"tStart": number, "tEnd": number, "title": "string", "bullets": ["string"], "ocr": "string"} ]\n' +
      '}\n\n' +
      `Known duration (seconds, may be 0): ${duration}\n\n` +
      'TRANSCRIPT (from STT):\n' +
      transcriptTrimmed +
      '\n\n' +
      'VISION FINDINGS (frames with approximate timestamps):\n' +
      JSON.stringify(findingsTrimmed, null, 2);

    logger.info('[VideoV2] Fusing transcript + vision findings', { model: this.fusionModel });

    const resp = await this.groq.generateContent({
      prompt,
      systemPrompt:
        'Bạn là trợ lý AI chuyên tổng hợp video bài giảng. ' +
        'Chỉ dùng dữ liệu đã cung cấp. Ưu tiên correctness. Trả về JSON hợp lệ.',
      temperature: 0.2,
      maxTokens: 2048,
    });

    const parsed = parseJsonFromLlmText<any>(resp.text, { required: true });

    return {
      transcript: typeof parsed.transcript === 'string' ? parsed.transcript : transcript,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      duration: typeof parsed.duration === 'number' ? parsed.duration : duration,
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : undefined,
      slideOutline: Array.isArray(parsed.slideOutline) ? parsed.slideOutline : undefined,
      metadata: {
        providers: {
          stt: { provider: 'groq', model: this.speechModel },
          vision: { provider: 'groq', model: this.visionModel },
          fusion: { provider: 'groq', model: this.fusionModel },
        },
      },
    };
  }
}
