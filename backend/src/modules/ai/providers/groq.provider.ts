/**
 * Groq AI Provider
 * Fast inference for Llama 3 70B (Free Tier)
 *
 * Notes:
 * - Groq exposes an OpenAI-compatible API surface under https://api.groq.com/openai
 * - This provider keeps the existing text `generateContent()` API stable.
 * - We additionally support:
 *   - Generic chat completions with arbitrary OpenAI-style messages (incl. multimodal content parts)
 *   - Speech-to-text via /v1/audio/transcriptions (Whisper)
 */

import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import logger from '../../../utils/logger.util';
import { BaseAIProvider, AIProviderConfig, AIGenerateRequest, AIGenerateResponse } from './base.provider';

export type OpenAIChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type OpenAIChatMessage =
  | { role: OpenAIChatRole; content: string; name?: string }
  // multimodal content parts (OpenAI-style)
  | {
      role: OpenAIChatRole;
      content: Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >;
      name?: string;
    };

export interface GroqTranscribeRequest {
  filePath: string;
  model?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

export interface GroqConfig extends Omit<AIProviderConfig, 'apiKey'> {
  apiKey: string;
}

export class GroqProvider extends BaseAIProvider {
  private client: AxiosInstance;

  constructor(config: GroqConfig) {
    super('Groq', {
      ...config,
      model: config.model || 'llama-3.3-70b-versatile',
    });

    if (!config.apiKey) {
      throw new Error('Groq API key is required');
    }

    this.client = axios.create({
      baseURL: 'https://api.groq.com/openai',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    logger.info(`[GroqProvider] Initialized with model: ${this.config.model}`);
  }

  async generateContent(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const startTime = Date.now();

    try {
      const messages = [];

      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt,
      });

      const payload = {
        model: this.config.model,
        messages,
        temperature: request.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? this.config.maxTokens ?? 2048,
        stream: request.stream ?? false,
      };

      if (request.stream && request.onChunk) {
        // Streaming response
        const response = await this.client.post('/v1/chat/completions', payload, {
          responseType: 'stream',
        });

        let fullText = '';

        return new Promise((resolve, reject) => {
          response.data.on('data', (chunk: Buffer) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim());

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    fullText += content;
                    request.onChunk?.(content);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          });

          response.data.on('end', () => {
            const latency = Date.now() - startTime;
            resolve({
              text: fullText,
              model: this.config.model,
              latency,
            });
          });

          response.data.on('error', reject);
        });
      } else {
        // Non-streaming response
        logger.info(`[GroqProvider] Calling model: ${this.config.model}`);
        const response = await this.client.post('/v1/chat/completions', payload);

        const text = response.data.choices?.[0]?.message?.content || '';
        const usage = response.data.usage;
        const latency = Date.now() - startTime;
        const actualModel = response.data.model || this.config.model;

        logger.info(`[GroqProvider] Response from model: ${actualModel}, latency: ${latency}ms`);

        return {
          text,
          model: actualModel, // Use actual model from response
          usage: usage ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          } : undefined,
          latency,
        };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      logger.error('[GroqProvider] Error:', error.response?.data || error.message);

      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error('Groq rate limit exceeded. Please try again later.');
      }

      throw error;
    }
  }

  /**
   * OpenAI-compatible chat completion with arbitrary messages.
   * This is required for multimodal prompts (e.g. vision models with image inputs).
   */
  async chatCompletion(opts: {
    messages: OpenAIChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIGenerateResponse> {
    const startTime = Date.now();
    const payload = {
      model: opts.model || this.config.model,
      messages: opts.messages,
      temperature: opts.temperature ?? this.config.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? this.config.maxTokens ?? 2048,
      stream: false,
    };

    try {
      logger.info(`[GroqProvider] ChatCompletion calling model: ${payload.model}`);
      const response = await this.client.post('/v1/chat/completions', payload);

      const text = response.data.choices?.[0]?.message?.content || '';
      const usage = response.data.usage;
      const latency = Date.now() - startTime;
      const actualModel = response.data.model || payload.model;

      return {
        text,
        model: actualModel,
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
            }
          : undefined,
        latency,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      logger.error('[GroqProvider] ChatCompletion error:', error.response?.data || error.message);
      if (error.response?.status === 429) {
        throw new Error('Groq rate limit exceeded. Please try again later.');
      }
      // Attach latency context
      error.latency = latency;
      throw error;
    }
  }

  /**
   * Speech-to-text via OpenAI-compatible audio transcriptions endpoint.
   *
   * IMPORTANT:
   * - This method assumes the Groq account supports the chosen Whisper model.
   * - If the endpoint/model is unavailable, the caller should handle the error and/or fall back.
   */
  async transcribeAudio(req: GroqTranscribeRequest): Promise<{ text: string; model?: string; latency: number }> {
    const startTime = Date.now();
    if (!req.filePath) throw new Error('filePath is required for audio transcription');
    if (!fs.existsSync(req.filePath)) throw new Error(`Audio file not found: ${req.filePath}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(req.filePath));
    form.append('model', req.model || (this.config.model as any));

    if (req.language) form.append('language', req.language);
    if (req.prompt) form.append('prompt', req.prompt);
    if (typeof req.temperature === 'number') form.append('temperature', String(req.temperature));
    if (req.responseFormat) form.append('response_format', req.responseFormat);

    try {
      const resp = await this.client.post('/v1/audio/transcriptions', form, {
        headers: {
          ...form.getHeaders(),
        },
        // STT can take longer for longer audio
        timeout: Math.max(this.config.timeout || 30000, 180000),
      });

      const latency = Date.now() - startTime;
      const text: string =
        (typeof resp.data === 'string' ? resp.data : resp.data?.text) ||
        resp.data?.transcript ||
        '';

      return { text, model: resp.data?.model, latency };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      logger.error('[GroqProvider] Transcription error:', error.response?.data || error.message);
      if (error.response?.status === 429) {
        throw new Error('Groq rate limit exceeded. Please try again later.');
      }
      error.latency = latency;
      throw error;
    }
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}
