/**
 * AI Orchestrator
 * Quản lý và lựa chọn AI provider phù hợp cho từng loại task
 */

import logger from '../../../utils/logger.util';
import env from '../../../config/env.config';
import { BaseAIProvider, AIGenerateRequest, AIGenerateResponse } from '../providers/base.provider';
import { ProxyPalProvider, ProxyPalConfig } from '../providers/proxypal.provider';
import { GroqProvider, GroqConfig } from '../providers/groq.provider';
import { GoogleAIProvider, GoogleAIConfig } from '../providers/google-ai.provider';

export type QuestionType = 'simple' | 'complex' | 'code' | 'math';
export type QuestionComplexity = 'low' | 'medium' | 'high';

export interface QuestionClassification {
  type: QuestionType;
  complexity: QuestionComplexity;
  requiresCode?: boolean;
  requiresSpeed?: boolean;
  requiresDeepThinking?: boolean;
  requiresExplanation?: boolean;
}

export interface ProviderSelection {
  provider: BaseAIProvider;
  reason: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier2-google' | 'tier2-proxypal';
}

export class AIOrchestrator {
  private providers: Map<string, BaseAIProvider> = new Map();
  private fallbackChain: string[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    try {
      // Tier 1: Groq (Fast + Free) - Multiple specialized models
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        // Groq Default (Llama 3.3 70B) - General purpose
        const groqDefault = new GroqProvider({
          apiKey: groqKey,
          model: process.env.GROQ_MODEL_DEFAULT || 'llama-3.3-70b-versatile',
          temperature: 0.7,
          maxTokens: 2048,
        });
        this.providers.set('groq-default', groqDefault);
        this.fallbackChain.push('groq-default');
        
        // Groq Math (Qwen 3 32B) - For mathematical reasoning
        const groqMath = new GroqProvider({
          apiKey: groqKey,
          model: process.env.GROQ_MODEL_MATH || 'qwen-3-32b',
          temperature: 0.7,
          maxTokens: 2048,
        });
        this.providers.set('groq-math', groqMath);
        
        // Groq Reasoning (Llama 3.3 70B) - For complex reasoning
        const groqReasoning = new GroqProvider({
          apiKey: groqKey,
          model: process.env.GROQ_MODEL_REASONING || 'llama-3.3-70b-versatile',
          temperature: 0.7,
          maxTokens: 2048,
        });
        this.providers.set('groq-reasoning', groqReasoning);
        
        logger.info('[AIOrchestrator] Groq providers initialized (default, math, reasoning)');
      }

      // Tier 2: ProxyPal (Local) - Unlimited, Free, Slower
      // IMPORTANT: 
      // - For local: Use http://127.0.0.1:8317/v1 (not localhost to avoid IPv6 issues)
      // - For Docker: Use http://host.docker.internal:8317/v1 (to access host machine)
      const proxypalEnabled = process.env.PROXYPAL_ENABLED === 'true';
      const proxypalUrl = process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1';
      const proxypalKey = process.env.PROXYPAL_API_KEY || 'proxypal-local';
      
      if (proxypalEnabled) {
        // ProxyPal - GPT 5 (best for long-form content analysis)
        // Note: Gemini models are blocked in ProxyPal, using GPT instead
        const proxypalGPT = new ProxyPalProvider({
          baseUrl: proxypalUrl,
          apiKey: proxypalKey,
          model: 'gpt-5',
          temperature: 0.7,
          maxTokens: 8192,
          timeout: 60000,
        });
        this.providers.set('proxypal-gpt', proxypalGPT);
        
        // Add to fallback chain (after groq-default, before google)
        if (!this.fallbackChain.includes('proxypal-gpt')) {
          this.fallbackChain.push('proxypal-gpt');
        }

        // ProxyPal - Qwen Coder Plus (32K context, best for code review)
        const proxypalQwenPlus = new ProxyPalProvider({
          baseUrl: proxypalUrl,
          apiKey: proxypalKey,
          model: 'qwen3-coder-plus',
          temperature: 0.7,
          maxTokens: 4096,
          timeout: 60000,
        });
        this.providers.set('proxypal-qwen-plus', proxypalQwenPlus);

        // ProxyPal - Qwen Coder Flash (128K context, fast code generation)
        const proxypalQwenFlash = new ProxyPalProvider({
          baseUrl: proxypalUrl,
          apiKey: proxypalKey,
          model: 'qwen3-coder-flash',
          temperature: 0.7,
          maxTokens: 8192,
          timeout: 60000,
        });
        this.providers.set('proxypal-qwen-flash', proxypalQwenFlash);
        
        logger.info('[AIOrchestrator] ProxyPal providers initialized (3 models)');
      }

      // Tier 3: Google AI Studio (Free but LIMITED - Multi-Model + Multi-Key Strategy)
      // STRATEGY: Task-specific routing + Multi-API-key rotation
      // Each model × Each API key: 20 RPD → With 3 keys × 5 models = 300 RPD total
      const googleKeys = env.ai.gemini.apiKeys;
      if (googleKeys.length > 0) {
        const googleConfig = env.ai.gemini;
        
        // For each model, create multiple provider instances (one per API key)
        // This allows rotating between keys when one exhausts quota
        
        // Google Model 1: gemini-3-flash (Best for code/complex tasks)
        googleKeys.forEach((apiKey, index) => {
          const google3Flash = new GoogleAIProvider({
            apiKey: apiKey,
            model: googleConfig.models.flash3,
            temperature: googleConfig.temperature,
            maxTokens: googleConfig.maxTokens,
          });
          const providerId = index === 0 ? 'google-3-flash' : `google-3-flash-key${index + 1}`;
          this.providers.set(providerId, google3Flash);
        });
        
        // Google Model 2: gemini-2.5-flash (General purpose)
        googleKeys.forEach((apiKey, index) => {
          const google25Flash = new GoogleAIProvider({
            apiKey: apiKey,
            model: googleConfig.models.flash25,
            temperature: googleConfig.temperature,
            maxTokens: googleConfig.maxTokens,
          });
          const providerId = index === 0 ? 'google-2.5-flash' : `google-2.5-flash-key${index + 1}`;
          this.providers.set(providerId, google25Flash);
        });
        
        // Google Model 3: gemini-2.5-flash-lite (Fast simple queries)
        googleKeys.forEach((apiKey, index) => {
          const googleFlashLite = new GoogleAIProvider({
            apiKey: apiKey,
            model: googleConfig.models.flashLite,
            temperature: googleConfig.temperature,
            maxTokens: googleConfig.maxTokens,
          });
          const providerId = index === 0 ? 'google-2.5-flash-lite' : `google-2.5-flash-lite-key${index + 1}`;
          this.providers.set(providerId, googleFlashLite);
        });
        
        // TTS Model: gemini-2.5-flash-tts (Text-to-speech, counted separately)
        googleKeys.forEach((apiKey, index) => {
          const googleFlashTTS = new GoogleAIProvider({
            apiKey: apiKey,
            model: googleConfig.models.flashTTS,
            temperature: googleConfig.temperature,
            maxTokens: googleConfig.maxTokens,
          });
          const providerId = index === 0 ? 'google-2.5-flash-tts' : `google-2.5-flash-tts-key${index + 1}`;
          this.providers.set(providerId, googleFlashTTS);
        });
        
        const coreCapacity = googleKeys.length * 3 * 20; // keys × 3 core models × RPD
        logger.info(`[AIOrchestrator] Google AI initialized (3 core models × ${googleKeys.length} keys, ${coreCapacity} RPD total)`);
        logger.info('[AIOrchestrator] Task-based routing: code→3-flash-preview, general→2.5-flash, fast→lite, tts→separate');
      }

      logger.info(`[AIOrchestrator] Initialized ${this.providers.size} providers`);
      logger.info(`[AIOrchestrator] Intelligent routing enabled (not simple fallback chain)`);
    } catch (error) {
      logger.error('[AIOrchestrator] Error initializing providers:', error);
    }
  }

  /**
   * Phân loại câu hỏi dựa trên nội dung
   */
  classifyQuestion(message: string): QuestionClassification {
    const lowerMessage = message.toLowerCase();

    // Code-related keywords
    const codeKeywords = ['code', 'function', 'class', 'method', 'debug', 'error', 'bug', 
                          'programming', 'syntax', 'algorithm', 'lỗi', 'thuật toán', 
                          'hàm', 'chương trình', 'javascript', 'python', 'java', 'typescript'];
    const hasCodeKeywords = codeKeywords.some(kw => lowerMessage.includes(kw));

    // Math-related keywords
    const mathKeywords = ['calculate', 'solve', 'equation', 'math', 'formula', 'theorem',
                          'tính', 'giải', 'phương trình', 'công thức', 'định lý', 'số học'];
    const hasMathKeywords = mathKeywords.some(kw => lowerMessage.includes(kw));

    // Complexity indicators
    const isComplex = message.length > 200 || 
                      message.split('\n').length > 5 ||
                      message.includes('explain') ||
                      message.includes('why') ||
                      message.includes('how does') ||
                      message.includes('tại sao') ||
                      message.includes('giải thích');

    // Code questions
    if (hasCodeKeywords) {
      return {
        type: 'code',
        complexity: 'high',
        requiresCode: true,
      };
    }

    // Math questions
    if (hasMathKeywords) {
      return {
        type: 'math',
        complexity: 'medium',
        requiresExplanation: true,
      };
    }

    // Complex questions
    if (isComplex) {
      return {
        type: 'complex',
        complexity: 'high',
        requiresDeepThinking: true,
      };
    }

    // Simple questions
    return {
      type: 'simple',
      complexity: 'low',
      requiresSpeed: true,
    };
  }

  /**
   * Chọn provider phù hợp dựa trên classification với intelligent routing
   * Priority: Task-specific model > API key rotation > Fallback
   */
  selectProvider(classification: QuestionClassification): ProviderSelection {
    // ========================================
    // TIER 1: Math specialized (Groq Qwen)
    // ========================================
    if (classification.type === 'math') {
      const groqMath = this.providers.get('groq-math');
      if (groqMath?.isAvailable()) {
        return {
          provider: groqMath,
          reason: 'Qwen 3 32B specialized for mathematical reasoning',
          tier: 'tier1',
        };
      }
    }

    // ========================================
    // TIER 2: Code tasks (Google 3-Flash > ProxyPal Qwen)
    // ========================================
    if (classification.type === 'code') {
      // Try Google 3-Flash first (best code quality)
      const google3Flash = this.tryGoogleProvider('google-3-flash');
      if (google3Flash) {
        return {
          provider: google3Flash,
          reason: 'Gemini 3 Flash - best for code generation/review',
          tier: 'tier2-google',
        };
      }
      
      // Fallback to ProxyPal Qwen Coder
      const qwenPlus = this.providers.get('proxypal-qwen-plus');
      if (qwenPlus?.isAvailable()) {
        return {
          provider: qwenPlus,
          reason: 'ProxyPal Qwen Coder Plus - code review',
          tier: 'tier2-proxypal',
        };
      }
      
      const qwenFlash = this.providers.get('proxypal-qwen-flash');
      if (qwenFlash?.isAvailable()) {
        return {
          provider: qwenFlash,
          reason: 'ProxyPal Qwen Coder Flash - fast code generation',
          tier: 'tier2-proxypal',
        };
      }
    }

    // ========================================
    // TIER 3: Complex reasoning (Google 3-Flash-Preview > Groq Reasoning)
    // Note: Robotics model removed (not relevant for LMS)
    // ========================================
    if (classification.complexity === 'high' && classification.requiresDeepThinking) {
      // Try Google 3-Flash-Preview (best quality, handles complex tasks)
      const google3Flash = this.tryGoogleProvider('google-3-flash');
      if (google3Flash) {
        return {
          provider: google3Flash,
          reason: 'Gemini 3 Flash Preview - complex reasoning & analysis',
          tier: 'tier2-google',
        };
      }
      
      // Fallback to Groq Reasoning
      const groqReasoning = this.providers.get('groq-reasoning');
      if (groqReasoning?.isAvailable()) {
        return {
          provider: groqReasoning,
          reason: 'Llama 3.3 70B for complex reasoning',
          tier: 'tier1',
        };
      }
      
      // Last resort: ProxyPal GPT
      const proxypalGpt = this.providers.get('proxypal-gpt');
      if (proxypalGpt?.isAvailable()) {
        return {
          provider: proxypalGpt,
          reason: 'ProxyPal GPT - highest reasoning',
          tier: 'tier2-proxypal',
        };
      }
    }

    // ========================================
    // TIER 4: Fast simple queries (Lite > Groq Default)
    // ========================================
    if (classification.requiresSpeed || classification.complexity === 'low') {
      // 30% traffic to Google Flash Lite (distribute load)
      if (Math.random() < 0.3) {
        const googleLite = this.tryGoogleProvider('google-2.5-flash-lite');
        if (googleLite) {
          return {
            provider: googleLite,
            reason: 'Gemini Flash Lite - fast simple queries',
            tier: 'tier2-google',
          };
        }
      }
      
      // 70% to Groq Default (fastest)
      const groqDefault = this.providers.get('groq-default');
      if (groqDefault?.isAvailable()) {
        return {
          provider: groqDefault,
          reason: 'Llama 3.3 70B for fast general responses',
          tier: 'tier1',
        };
      }
    }

    // ========================================
    // TIER 5: General queries (Distribute 40% Google, 60% Groq)
    // ========================================
    const useGoogle = Math.random() < 0.4;
    
    if (useGoogle) {
      // Try Google 2.5 Flash (general purpose)
      const google25Flash = this.tryGoogleProvider('google-2.5-flash');
      if (google25Flash) {
        return {
          provider: google25Flash,
          reason: 'Gemini 2.5 Flash - general purpose',
          tier: 'tier2-google',
        };
      }
    }
    
    // Default: Groq Default
    const groqDefault = this.providers.get('groq-default');
    if (groqDefault?.isAvailable()) {
      return {
        provider: groqDefault,
        reason: 'Llama 3.3 70B - default provider',
        tier: 'tier1',
      };
    }

    // ========================================
    // FINAL FALLBACK: Try any available provider
    // ========================================
    // Try all 3 core Google models with key rotation (robotics removed)
    for (const modelBase of ['google-3-flash', 'google-2.5-flash', 'google-2.5-flash-lite']) {
      const provider = this.tryGoogleProvider(modelBase);
      if (provider) {
        return {
          provider,
          reason: `Fallback to ${modelBase}`,
          tier: 'tier2-google',
        };
      }
    }
    
    // Try ProxyPal
    const proxypalGpt = this.providers.get('proxypal-gpt');
    if (proxypalGpt?.isAvailable()) {
      return {
        provider: proxypalGpt,
        reason: 'Last resort: ProxyPal GPT',
        tier: 'tier2-proxypal',
      };
    }

    throw new Error('No AI provider available. Please check your configuration.');
  }

  /**
   * Try Google provider with API key rotation
   * Returns first available provider instance for the given model
   */
  private tryGoogleProvider(modelBase: string): BaseAIProvider | null {
    // Try primary provider first
    const primary = this.providers.get(modelBase);
    if (primary?.isAvailable()) {
      return primary;
    }
    
    // Try rotated keys (key2, key3, etc.)
    const keyCount = env.ai.gemini.apiKeys.length;
    for (let i = 2; i <= keyCount; i++) {
      const providerId = `${modelBase}-key${i}`;
      const provider = this.providers.get(providerId);
      if (provider?.isAvailable()) {
        logger.info(`[AIOrchestrator] Rotated to API key ${i} for ${modelBase}`);
        return provider;
      }
    }
    
    return null;
  }

  /**
   * Generate content với automatic provider selection
   */
  async generate(
    message: string,
    options?: {
      classification?: QuestionClassification;
      preferredProvider?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      onChunk?: (chunk: string) => void;
    }
  ): Promise<AIGenerateResponse & { provider: string; tier: string }> {
    // Classify if not provided
    const classification = options?.classification || this.classifyQuestion(message);
    
    logger.info(`[AIOrchestrator] Question classified as: ${classification.type} (${classification.complexity})`);

    // Select provider
    let selection: ProviderSelection;
    
    if (options?.preferredProvider) {
      const provider = this.providers.get(options.preferredProvider);
      if (provider?.isAvailable()) {
        selection = {
          provider,
          reason: 'User preferred provider',
          tier: 'tier1',
        };
      } else {
        logger.warn(`[AIOrchestrator] Preferred provider ${options.preferredProvider} not available`);
        selection = this.selectProvider(classification);
      }
    } else {
      selection = this.selectProvider(classification);
    }

    logger.info(`[AIOrchestrator] Selected: ${selection.provider.getName()} (${selection.reason})`);

    // Generate content
    const request: AIGenerateRequest = {
      prompt: message,
      systemPrompt: options?.systemPrompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      stream: options?.stream,
      onChunk: options?.onChunk,
    };

    try {
      const response = await selection.provider.generateContent(request);
      
      return {
        ...response,
        provider: selection.provider.getName(),
        tier: selection.tier,
      };
    } catch (error: any) {
      logger.error(`[AIOrchestrator] Error with ${selection.provider.getName()}:`, {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      });
      
      // Try fallback
      logger.info('[AIOrchestrator] Attempting fallback...');
      
      for (const providerName of this.fallbackChain) {
        if (providerName === selection.provider.getName().toLowerCase()) {
          continue; // Skip the failed provider
        }
        
        const fallbackProvider = this.providers.get(providerName);
        if (fallbackProvider?.isAvailable()) {
          try {
            logger.info(`[AIOrchestrator] Trying fallback: ${fallbackProvider.getName()}`);
            const response = await fallbackProvider.generateContent(request);
            
            return {
              ...response,
              provider: fallbackProvider.getName(),
              tier: 'tier1',
            };
          } catch (fallbackError: any) {
            logger.error(`[AIOrchestrator] Fallback ${fallbackProvider.getName()} failed:`, fallbackError.message);
            continue;
          }
        }
      }
      
      throw new Error(`All AI providers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): Array<{ name: string; model: string; available: boolean }> {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      model: provider.getModel(),
      available: provider.isAvailable(),
    }));
  }
}
