/**
 * Groq AI Provider
 * Fast inference for Llama 3 70B (Free Tier)
 */

import axios, { AxiosInstance } from 'axios';
import logger from '../../../utils/logger.util';
import { BaseAIProvider, AIProviderConfig, AIGenerateRequest, AIGenerateResponse } from './base.provider';

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

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}
