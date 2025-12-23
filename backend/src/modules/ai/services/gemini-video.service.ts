/**
 * Gemini Video Service (Direct Gemini API via REST)
 *
 * Why:
 * - ProxyPal currently uses OpenAI-style /chat/completions and does not attach video/file inputs.
 * - Gemini API video understanding requires passing a YouTube URL or a file reference (Files API) / inline_data.
 *
 * This service implements:
 * - YouTube URL → send directly as file_data.file_uri
 * - Remote mp4/webm (R2, etc.) → download; inline_data if small; else upload via Files API (resumable) then reference
 */

import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Buffer } from 'node:buffer';
import logger from '../../../utils/logger.util';

type GeminiPart =
  | { text: string }
  | {
      file_data: {
        file_uri: string;
        mime_type?: string;
      };
    }
  | {
      inline_data: {
        data: string; // base64
        mime_type: string;
      };
    };

interface GenerateWithVideoInput {
  videoUrl: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model: string; // e.g. "gemini-3-pro-preview" or "gemini-2.5-flash"
}

export class GeminiVideoService {
  private client: AxiosInstance;
  private apiKey: string;

  // Keep safe margin under 20MB request size guidance (base64 expands ~4/3).
  private inlineMaxBytes = 12 * 1024 * 1024;
  // Maximum video file size to download (100MB) - prevent abuse
  private maxDownloadBytes = 100 * 1024 * 1024;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is required for video analysis via Gemini API');
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com',
      timeout: 180_000,
      headers: {
        'x-goog-api-key': this.apiKey,
      },
    });
  }

  async generateWithVideo(input: GenerateWithVideoInput): Promise<string> {
    const { videoUrl, prompt, systemPrompt, temperature, maxOutputTokens, model } = input;

    const parts: GeminiPart[] = [{ text: prompt }];

    if (this.isYouTubeUrl(videoUrl)) {
      // Docs: can pass YouTube URLs directly as part of generateContent request.
      parts.push({
        file_data: {
          file_uri: videoUrl,
        },
      });
      return await this.generateContent({ model, systemPrompt, temperature, maxOutputTokens, parts });
    }

    // Non-YouTube: try inline for small videos, otherwise upload via Files API.
    const tmp = await this.downloadToTempFile(videoUrl);
    try {
      if (tmp.sizeBytes <= this.inlineMaxBytes) {
        const base64 = Buffer.from(fs.readFileSync(tmp.filePath) as any).toString('base64');
        parts.push({
          inline_data: {
            data: base64,
            mime_type: tmp.mimeType,
          },
        });
        return await this.generateContent({ model, systemPrompt, temperature, maxOutputTokens, parts });
      }

      try {
        const uploaded = await this.uploadFileResumable(tmp.filePath, tmp.mimeType);
        const fileUri = uploaded.uri || uploaded.file?.uri || uploaded.fileUri;
        const mimeType = uploaded.mimeType || uploaded.file?.mimeType || tmp.mimeType;
        if (!fileUri) {
          throw new Error('Gemini Files API upload succeeded but did not return file URI');
        }

        await this.waitForFileActive(uploaded.name || uploaded.file?.name || fileUri);

        parts.push({
          file_data: {
            file_uri: fileUri,
            mime_type: mimeType,
          },
        });

        return await this.generateContent({ model, systemPrompt, temperature, maxOutputTokens, parts });
      } catch (e: any) {
        // Fallback: some environments may allow passing a public mp4 URL directly as file_uri.
        // If this fails too, we propagate the original error for visibility.
        logger.warn('[GeminiVideoService] Files API upload failed; trying file_data with public URL as fallback', {
          error: e?.message,
        });

        parts.push({
          file_data: {
            file_uri: videoUrl,
            mime_type: tmp.mimeType,
          },
        });
        return await this.generateContent({ model, systemPrompt, temperature, maxOutputTokens, parts });
      }
    } finally {
      try {
        fs.unlinkSync(tmp.filePath);
      } catch {
        // ignore
      }
      try {
        fs.rmSync(path.dirname(tmp.filePath), { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  private async generateContent(opts: {
    model: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
    parts: GeminiPart[];
  }): Promise<string> {
    const { model, systemPrompt, temperature, maxOutputTokens, parts } = opts;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      generationConfig: {
        temperature: temperature ?? 0.3,
        maxOutputTokens: maxOutputTokens ?? 4096,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const url = `/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const resp = await this.client.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    const text =
      resp.data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') ||
      resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '';

    return text;
  }

  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  private async downloadToTempFile(videoUrl: string): Promise<{ filePath: string; mimeType: string; sizeBytes: number }> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-video-'));
    const filePath = path.join(tmpDir, `video-${Date.now()}.bin`);

    const resp = await axios.get(videoUrl, { responseType: 'stream', timeout: 180_000 });
    const mimeType = (resp.headers['content-type'] as string) || 'video/mp4';
    const contentLength = parseInt(resp.headers['content-length'] || '0', 10);

    // Check file size limit before downloading
    if (contentLength > 0 && contentLength > this.maxDownloadBytes) {
      throw new Error(`Video file too large: ${(contentLength / 1024 / 1024).toFixed(1)}MB exceeds ${this.maxDownloadBytes / 1024 / 1024}MB limit`);
    }

    await new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      resp.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stat = fs.statSync(filePath);
    
    // Double-check actual size after download
    if (stat.size > this.maxDownloadBytes) {
      fs.rmSync(filePath, { force: true });
      fs.rmSync(tmpDir, { force: true, recursive: true });
      throw new Error(`Video file too large: ${(stat.size / 1024 / 1024).toFixed(1)}MB exceeds ${this.maxDownloadBytes / 1024 / 1024}MB limit`);
    }
    
    return { filePath, mimeType, sizeBytes: stat.size };
  }

  private async uploadFileResumable(filePath: string, mimeType: string): Promise<any> {
    const stat = fs.statSync(filePath);

    // Start resumable upload session
    const startResp = await this.client.post(
      '/upload/v1beta/files',
      {
        file: {
          display_name: path.basename(filePath),
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': String(stat.size),
          'X-Goog-Upload-Header-Content-Type': mimeType,
        },
        // some environments return upload URL in headers only
        validateStatus: (s) => s >= 200 && s < 300,
      }
    );

    const uploadUrl =
      (startResp.headers['x-goog-upload-url'] as string) ||
      (startResp.headers['X-Goog-Upload-URL'] as string) ||
      (startResp.headers['x-goog-upload-url'.toLowerCase()] as string);

    if (!uploadUrl) {
      logger.warn('[GeminiVideoService] Missing x-goog-upload-url header from upload start response', {
        headers: startResp.headers,
      });
      throw new Error('Failed to start Gemini resumable upload (missing upload URL)');
    }

    const stream = fs.createReadStream(filePath);

    const uploadResp = await axios.put(uploadUrl, stream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(stat.size),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      timeout: 300_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (s) => s >= 200 && s < 300,
    });

    return uploadResp.data;
  }

  private async waitForFileActive(fileNameOrUri: string): Promise<void> {
    const started = Date.now();
    const timeoutMs = 180_000;
    const pollMs = 2000;

    const name = this.normalizeFileName(fileNameOrUri);
    if (!name) return;

    while (Date.now() - started < timeoutMs) {
      try {
        const resp = await this.client.get(`/v1beta/${name}`);
        const state = (resp.data?.state || resp.data?.file?.state || '').toString().toUpperCase();
        if (!state || state === 'ACTIVE' || state === 'READY' || state === 'SUCCEEDED') {
          return;
        }
      } catch {
        // ignore transient
      }
      await new Promise((r) => setTimeout(r, pollMs));
    }
    logger.warn('[GeminiVideoService] Timed out waiting for uploaded file to become ACTIVE', { fileNameOrUri });
  }

  private normalizeFileName(fileNameOrUri: string): string | null {
    // Accept:
    // - "files/abc123"
    // - "https://.../v1beta/files/abc123" (file uri)
    // - other URIs we can't normalize → return null
    if (!fileNameOrUri) return null;

    if (fileNameOrUri.startsWith('files/')) return fileNameOrUri;

    try {
      const u = new URL(fileNameOrUri);
      const idx = u.pathname.indexOf('/v1beta/');
      if (idx >= 0) {
        return u.pathname.slice(idx + '/v1beta/'.length).replace(/^\/+/, '');
      }
      // maybe direct /v1beta/files/...
      const parts = u.pathname.split('/').filter(Boolean);
      const v1betaIdx = parts.indexOf('v1beta');
      if (v1betaIdx >= 0) {
        return parts.slice(v1betaIdx + 1).join('/');
      }
      // fallback: last 2 segments if looks like files/<id>
      const filesIdx = parts.indexOf('files');
      if (filesIdx >= 0 && parts[filesIdx + 1]) return `files/${parts[filesIdx + 1]}`;
    } catch {
      // not URL
    }

    if (fileNameOrUri.includes('files/')) {
      const m = fileNameOrUri.match(/files\/[a-zA-Z0-9_-]+/);
      if (m?.[0]) return m[0];
    }
    return null;
  }
}


