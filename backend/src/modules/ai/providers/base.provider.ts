/**
 * Base AI Provider
 * Interface cho tất cả AI providers
 */

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIGenerateRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export interface AIGenerateResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  latency: number;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  protected name: string;

  constructor(name: string, config: AIProviderConfig) {
    this.name = name;
    this.config = config;
  }

  abstract generateContent(request: AIGenerateRequest): Promise<AIGenerateResponse>;

  abstract isAvailable(): boolean;

  getName(): string {
    return this.name;
  }

  getModel(): string {
    return this.config.model;
  }
}
