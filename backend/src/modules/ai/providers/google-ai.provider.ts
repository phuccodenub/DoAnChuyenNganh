/**
 * Google AI Provider
 * Google AI Studio (Free Tier) - Gemini Flash
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../../utils/logger.util';
import { BaseAIProvider, AIProviderConfig, AIGenerateRequest, AIGenerateResponse } from './base.provider';

export interface GoogleAIConfig extends Omit<AIProviderConfig, 'apiKey'> {
  apiKey: string;
}

export class GoogleAIProvider extends BaseAIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: GoogleAIConfig) {
    super('Google AI', {
      ...config,
      model: config.model || 'gemini-2.5-flash',
    });

    if (!config.apiKey) {
      throw new Error('Google AI API key is required');
    }

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.model });

    logger.info(`[GoogleAIProvider] Initialized with model: ${this.config.model}`);
  }

  async generateContent(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const startTime = Date.now();

    try {
      let prompt = request.prompt;
      
      // Add system prompt if provided
      if (request.systemPrompt) {
        prompt = `${request.systemPrompt}\n\n${prompt}`;
      }

      const generationConfig = {
        temperature: request.temperature ?? this.config.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? this.config.maxTokens ?? 8192,
      };

      if (request.stream && request.onChunk) {
        // Streaming response
        const result = await this.model.generateContentStream(prompt, { generationConfig });

        let fullText = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          request.onChunk?.(chunkText);
        }

        const latency = Date.now() - startTime;
        const response = await result.response;
        const usage = this.extractUsage(response);

        return {
          text: fullText,
          model: this.config.model,
          usage,
          latency,
        };
      } else {
        // Non-streaming response
        const result = await this.model.generateContent(prompt, { generationConfig });
        const response = result.response;
        const text = response.text();
        const usage = this.extractUsage(response);
        const latency = Date.now() - startTime;

        return {
          text,
          model: this.config.model,
          usage,
          latency,
        };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      logger.error('[GoogleAIProvider] Error:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        details: error.details || error.error,
      });

      // Handle rate limiting
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error('Google AI rate limit exceeded. Please try again later.');
      }

      throw error;
    }
  }

  private extractUsage(response: any): AIGenerateResponse['usage'] {
    try {
      let usage: any = undefined;
      
      if (typeof response.usageMetadata === 'function') {
        usage = response.usageMetadata();
      } else if (response.usageMetadata) {
        usage = response.usageMetadata;
      }

      if (usage) {
        return {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        };
      }
    } catch (e) {
      // Ignore usage extraction errors
    }
    
    return undefined;
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}
