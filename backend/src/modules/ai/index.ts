/**
 * AI Module
 * Exports for AI features (Legacy + New)
 */

// Legacy exports (keep for backward compatibility)
export { AIService } from './ai.service';
export { AIController } from './ai.controller';
export * from './ai.types';
export { default as aiRoutes } from './ai.routes';

// New AI System exports
export { AITutorService } from './services/ai-tutor.service';
export { AICacheService, aiCacheService } from './services/ai-cache.service';
export { AIChatRepository } from './repositories/ai-chat.repository';
export { AIChatGateway } from './gateways/ai-chat.gateway';
export { AIControllerV2 } from './controllers/ai-v2.controller';
export { default as aiRoutesV2 } from './routes/ai-v2.routes';

// Providers
export { BaseAIProvider } from './providers/base.provider';
export { ProxyPalProvider } from './providers/proxypal.provider';
export { GroqProvider } from './providers/groq.provider';
export { GoogleAIProvider } from './providers/google-ai.provider';

// Orchestrator
export { AIOrchestrator } from './orchestrator/ai-orchestrator';



