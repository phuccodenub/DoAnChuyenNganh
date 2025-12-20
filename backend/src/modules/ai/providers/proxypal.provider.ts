/**
 * ProxyPal AI Provider
 * Local AI gateway cho Gemini 3 Pro và Qwen 3 Coder
 */

import axios, { AxiosInstance } from 'axios';
import logger from '../../../utils/logger.util';
import { BaseAIProvider, AIProviderConfig, AIGenerateRequest, AIGenerateResponse } from './base.provider';

export interface ProxyPalConfig extends AIProviderConfig {
  baseUrl: string; // http://127.0.0.1:8317 (use IP, not localhost!)
  model: 'gemini-3-pro-preview' | 'qwen3-coder-plus' | 'qwen3-coder-flash';
}

export class ProxyPalProvider extends BaseAIProvider {
  private client: AxiosInstance;
  private available: boolean = false;

  constructor(config: ProxyPalConfig) {
    super('ProxyPal', config);
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if provided
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    // Normalize baseUrl - remove trailing /v1 if present (will be added in API paths)
    let baseUrl = config.baseUrl || 'http://127.0.0.1:8317';
    baseUrl = baseUrl.replace(/\/v1\/?$/, ''); // Remove /v1 suffix to avoid duplication
    // Use 127.0.0.1 instead of localhost to avoid IPv6 issues in Node.js 17+
    baseUrl = baseUrl.replace('localhost', '127.0.0.1');
    
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 60000,
      headers,
    });

    // Check availability on initialization
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    try {
      const response = await this.client.get('/v1/models', { timeout: 5000 });
      this.available = response.status === 200;
      if (this.available) {
        logger.info(`[ProxyPalProvider] Connected successfully - ${response.data?.data?.length || 0} models available`);
      }
    } catch (error: any) {
      this.available = false;
      logger.warn(`[ProxyPalProvider] Not available - ${error.message}`);
    }
  }

  async generateContent(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const startTime = Date.now();

    if (!this.isAvailable()) {
      throw new Error('ProxyPal is not available. Make sure ProxyPal is running on localhost:8317');
    }

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
        max_tokens: request.maxTokens ?? this.config.maxTokens ?? 4096,
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
        const response = await this.client.post('/v1/chat/completions', payload);

        const text = response.data.choices?.[0]?.message?.content || '';
        const usage = response.data.usage;
        const latency = Date.now() - startTime;

        return {
          text,
          model: this.config.model,
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
      logger.error('[ProxyPalProvider] Error:', error.message);
      
      // Check if ProxyPal is down
      if (error.code === 'ECONNREFUSED') {
        this.available = false;
        throw new Error('ProxyPal is not running. Please start ProxyPal and try again.');
      }
      
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  async refreshAvailability(): Promise<void> {
    await this.checkAvailability();
  }
}
