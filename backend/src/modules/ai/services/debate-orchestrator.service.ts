/**
 * Debate Orchestrator Service
 * Multi-agent debate workflow with optional judge arbitration
 */

import crypto from 'crypto';
import logger from '../../../utils/logger.util';
import env from '../../../config/env.config';
import { parseJsonFromLlmText } from '../../../utils/llm-json.util';
import DebateHistory from '../../../models/debate-history.model';
import { ProxyPalProvider } from '../providers/proxypal.provider';
import { GoogleAIProvider } from '../providers/google-ai.provider';
import { AIOrchestrator } from '../orchestrator/ai-orchestrator';
import { redisHelpers } from '../../../config/redis.config';

export type DebateType = 'project_design' | 'curriculum' | 'content_review' | 'decision';
export type DebateDecision = 'approved' | 'needs_revision' | 'rejected';

export interface DebateRequest {
  topic: string;
  context: string;
  debateType: DebateType;
  maxRounds?: number;
  initiatedBy: string;
  courseId?: string;
}

export interface DebateAgentPosition {
  position: string;
  reasoning: string;
  keyPoints: string[];
}

export interface DebateRound {
  round: number;
  agentA: DebateAgentPosition;
  agentB: DebateAgentPosition;
  agreement: number;
  highlights: string[];
}

export interface DebateResult {
  debateId: string;
  topic: string;
  debateType: DebateType;
  rounds: DebateRound[];
  consensus: string;
  disagreement: number;
  requiresJudge: boolean;
  judgeDecision?: string;
  decision: DebateDecision;
  createdAt: Date;
}

interface JudgeSummary {
  recommendation?: DebateDecision;
  winner?: 'agent_a' | 'agent_b' | 'tie';
  reasoning?: string;
  keyPoints?: string[];
}

export class DebateOrchestratorService {
  private agentAProvider: ProxyPalProvider;
  private agentBProvider: ProxyPalProvider;
  private fallbackProvider: GoogleAIProvider;
  private judgeProvider: ProxyPalProvider; // GPT-5.2 for judging
  private orchestrator: AIOrchestrator;

  private readonly cachePrefix = 'ai:debate:';

  constructor() {
    this.agentAProvider = new ProxyPalProvider({
      baseUrl: env.ai.proxypal.baseUrl,
      apiKey: env.ai.proxypal.apiKey,
      model: 'gpt-5.2',
      temperature: 0.7,
      maxTokens: 4096,
      timeout: env.ai.proxypal.timeout,
    });

    this.agentBProvider = new ProxyPalProvider({
      baseUrl: env.ai.proxypal.baseUrl,
      apiKey: env.ai.proxypal.apiKey,
      model: 'qwen3-coder-plus',
      temperature: 0.7,
      maxTokens: 4096,
      timeout: env.ai.proxypal.timeout,
    });

    this.fallbackProvider = new GoogleAIProvider({
      apiKey: env.ai.gemini.apiKeys[0],
      model: env.ai.gemini.models.flash3,
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 60000,
    });

    // Judge provider - ProxyPal GPT-5.2
    this.judgeProvider = new ProxyPalProvider({
      baseUrl: env.ai.proxypal.baseUrl,
      apiKey: env.ai.proxypal.apiKey,
      model: (env.ai.proxypal?.models?.premium as any) || 'gpt-5.2',
      temperature: env.ai.debate.judgeTemperature,
      maxTokens: 4096,
      timeout: env.ai.proxypal.timeout,
    });

    logger.info('[Debate] Judge provider initialized with ProxyPal GPT-5.2');

    this.orchestrator = new AIOrchestrator();
  }

  async startDebate(request: DebateRequest): Promise<DebateResult> {
    const debateId = crypto.randomUUID();
    const rawMaxRounds = request.maxRounds ?? env.ai.debate.maxRounds;
    const maxRounds = Math.max(1, Math.min(rawMaxRounds, 5));

    await this.assertWithinDailyLimit(request.initiatedBy);

    logger.info(`[Debate] Starting debate ${debateId}: ${request.topic}`);

    const systemPromptA = this.buildSystemPromptA(request.debateType);
    const systemPromptB = this.buildSystemPromptB(request.debateType);

    const rounds: DebateRound[] = [];

    // Stage 1: Initial round
    const initRound = await this.executeDebateRound({
      roundNumber: 0,
      topic: request.topic,
      context: request.context,
      systemPromptA,
      systemPromptB,
      previousRound: null,
      agentAInstructions: null,
    });
    rounds.push(initRound);

    // Stage 2: Debate rounds
    for (let i = 1; i < maxRounds; i++) {
      const previous = rounds[i - 1];
      const round = await this.executeDebateRound({
        roundNumber: i,
        topic: request.topic,
        context: request.context,
        systemPromptA,
        systemPromptB,
        previousRound: previous,
        agentAInstructions: `Bạn vừa bị phê bình như sau: ${previous.agentB.position}. Hãy phản biện rõ ràng.`,
      });
      rounds.push(round);
    }

    const averageAgreement = this.calculateAverageAgreement(rounds);
    const disagreement = Math.max(0, Math.min(100, 100 - averageAgreement));
    const requiresJudge = this.shouldEscalateToJudge(disagreement);

    let judgeDecision: string | undefined;
    let judgeSummary: JudgeSummary | undefined;

    if (requiresJudge) {
      try {
        const judgeOutput = await this.callJudge(rounds, request);
        judgeDecision = judgeOutput.raw;
        judgeSummary = judgeOutput.parsed;
      } catch (error: any) {
        logger.warn('[Debate] Judge call failed:', {
          message: error.message,
          status: error.response?.status,
          details: error.response?.data,
        });
      }
    }

    const decision = this.makeDecision(disagreement, judgeSummary?.recommendation);

    const result: DebateResult = {
      debateId,
      topic: request.topic,
      debateType: request.debateType,
      rounds,
      consensus: this.synthesizeConsensus(rounds),
      disagreement,
      requiresJudge: requiresJudge && !!judgeDecision,
      judgeDecision,
      decision,
      createdAt: new Date(),
    };

    if (!env.ai.proxypal.enabled) {
      logger.warn('[Debate] ProxyPal disabled; using cloud providers for debate');
    }

    const now = new Date();

    await DebateHistory.create({
      id: debateId,
      topic: request.topic,
      context: request.context,
      debate_type: request.debateType,
      rounds,
      result,
      disagreement,
      requires_judge: result.requiresJudge,
      judge_decision: result.judgeDecision,
      decision: result.decision,
      initiated_by: request.initiatedBy,
      course_id: request.courseId,
      created_at: now,
      updated_at: now,
    });

    await this.cacheResult(debateId, result);
    await this.trackDebateUsage(request.initiatedBy);
    await this.maybeTrackJudgeUsage(result.requiresJudge);

    return result;
  }

  async getDebateResult(debateId: string): Promise<DebateResult | null> {
    const cached = await this.getCachedResult(debateId);
    if (cached) return cached;

    const record = await DebateHistory.findOne({ where: { id: debateId } });
    if (!record) return null;

    const data = record.get({ plain: true }) as any;
    const result = data.result as DebateResult;
    await this.cacheResult(debateId, result);
    return result;
  }

  async getDebateHistory(debateId: string): Promise<DebateRound[] | null> {
    const record = await DebateHistory.findOne({ where: { id: debateId } });
    if (!record) return null;

    const data = record.get({ plain: true }) as any;
    return data.rounds || null;
  }

  async arbitrateDebate(debateId: string): Promise<{ judgeDecision: string; parsed?: JudgeSummary } | null> {
    const record = await DebateHistory.findOne({ where: { id: debateId } });
    if (!record) return null;

    const data = record.get({ plain: true }) as any;
    const rounds: DebateRound[] = data.rounds || [];

    const judgeOutput = await this.callJudge(rounds, {
      topic: data.topic,
      context: data.context,
      debateType: data.debate_type,
      initiatedBy: data.initiated_by,
      courseId: data.course_id,
      maxRounds: rounds.length,
    });

    await record.update({
      judge_decision: judgeOutput.raw,
      requires_judge: true,
      decision: this.makeDecision(data.disagreement, judgeOutput.parsed?.recommendation),
      updated_at: new Date(),
    });

    const result = (data.result || {}) as DebateResult;
    const updatedResult: DebateResult = {
      ...result,
      judgeDecision: judgeOutput.raw,
      requiresJudge: true,
      decision: this.makeDecision(data.disagreement, judgeOutput.parsed?.recommendation),
    };

    await record.update({ result: updatedResult });
    await this.cacheResult(debateId, updatedResult);
    await this.maybeTrackJudgeUsage(true);

    return { judgeDecision: judgeOutput.raw, parsed: judgeOutput.parsed };
  }

  private async executeDebateRound(params: {
    roundNumber: number;
    topic: string;
    context: string;
    systemPromptA: string;
    systemPromptB: string;
    previousRound: DebateRound | null;
    agentAInstructions: string | null;
  }): Promise<DebateRound> {
    const { roundNumber, topic, context, systemPromptA, systemPromptB, previousRound, agentAInstructions } = params;

    const promptA = this.buildAgentPrompt({
      round: roundNumber,
      topic,
      context,
      systemPrompt: systemPromptA,
      previous: previousRound,
      instructions: agentAInstructions,
      agentLabel: 'Agent A',
    });

    const responseA = await this.generateWithPriorityProvider({
      prompt: promptA,
      systemPrompt: systemPromptA,
      agent: 'A',
    });

    const positionA = this.parseAgentResponse(responseA.text);

    const promptB = this.buildAgentPrompt({
      round: roundNumber,
      topic,
      context,
      systemPrompt: systemPromptB,
      previous: previousRound,
      instructions: `Quan điểm của Agent A:\n${positionA.position}\n\nHãy phê bình và đưa ra quan điểm khác nếu cần.`,
      agentLabel: 'Agent B',
    });

    let responseB;
    try {
      responseB = await this.generateWithPriorityProvider({
        prompt: promptB,
        systemPrompt: systemPromptB,
        agent: 'B',
      });
    } catch (error: any) {
      logger.warn('[Debate] Agent B provider failed, falling back to orchestrator', { message: error.message });
      responseB = await this.orchestrator.generate(promptB, {
        systemPrompt: systemPromptB,
        maxTokens: 4096,
      });
    }

    const positionB = this.parseAgentResponse(responseB.text);

    const agreement = this.calculateAgreement(positionA.position, positionB.position);
    const highlights = this.extractHighlights(positionA, positionB);

    return {
      round: roundNumber + 1,
      agentA: positionA,
      agentB: positionB,
      agreement,
      highlights,
    };
  }

  private async generateWithPriorityProvider(params: {
    prompt: string;
    systemPrompt: string;
    agent: 'A' | 'B';
  }) {
    const { prompt, systemPrompt, agent } = params;

    const preferredProvider = agent === 'A' ? this.agentAProvider : this.agentBProvider;

    if (env.ai.proxypal.enabled && preferredProvider.isAvailable()) {
      return preferredProvider.generateContent({
        prompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4096,
      });
    }

    try {
      return await this.fallbackProvider.generateContent({
        prompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4096,
      });
    } catch (error: any) {
      logger.warn('[Debate] Fallback provider failed, using orchestrator', error.message);
      return this.orchestrator.generate(prompt, {
        systemPrompt,
        maxTokens: 4096,
      });
    }
  }

  private async callJudge(rounds: DebateRound[], request: DebateRequest): Promise<{ raw: string; parsed?: JudgeSummary }> {
    const debateContext = this.serializeDebate(rounds, request);

    const judgePrompt = `Bạn là trọng tài không thiên vị cho cuộc tranh biện AI.

VẤN ĐỀ:
${request.topic}

BỐI CẢNH:
${request.context}

NỘI DUNG TRANH BIỆN:
${debateContext}

NHIỆM VỤ:
1. Đánh giá lập luận của từng agent.
2. Nêu điểm mạnh/yếu.
3. Đưa ra quyết định cuối cùng.

OUTPUT JSON (chỉ JSON):
{
  "winner": "agent_a" | "agent_b" | "tie",
  "reasoning": "...",
  "recommendation": "approved" | "needs_revision" | "rejected",
  "keyPoints": ["...", "..."]
}`;

    const response = await this.judgeProvider.generateContent({
      prompt: judgePrompt,
      temperature: env.ai.debate.judgeTemperature,
      maxTokens: 4096,
    });

    const parsed = this.parseJudgeResponse(response.text);
    return { raw: response.text, parsed };
  }

  private buildSystemPromptA(debateType: DebateType): string {
    const basePrompt = `Bạn là chuyên gia lý thuyết và kiến trúc sư phần mềm.
Vai trò: Đề xuất hướng tiếp cận lý tưởng, logic và best practices.

Hướng dẫn:
- Tuân thủ SOLID và design patterns phù hợp.
- Tập trung vào tính mở rộng và maintainability.
- Đưa ví dụ hoặc cấu trúc rõ ràng.`;

    return this.addDebateTypeContext(basePrompt, debateType);
  }

  private buildSystemPromptB(debateType: DebateType): string {
    const basePrompt = `Bạn là senior developer thực chiến.
Vai trò: Phê bình tính khả thi, rủi ro và chi phí thực tế.

Hướng dẫn:
- Cân nhắc thời gian phát triển và vận hành.
- Chỉ ra điểm yếu về performance hoặc complexity.
- Đề xuất giải pháp thực dụng.`;

    return this.addDebateTypeContext(basePrompt, debateType);
  }

  private addDebateTypeContext(prompt: string, debateType: DebateType): string {
    switch (debateType) {
      case 'project_design':
        return `${prompt}\n\nTrọng tâm: kiến trúc, patterns, triển khai.`;
      case 'curriculum':
        return `${prompt}\n\nTrọng tâm: cấu trúc khóa học, lộ trình, chuẩn đầu ra.`;
      case 'content_review':
        return `${prompt}\n\nTrọng tâm: chất lượng nội dung, tính chính xác, mức độ phù hợp.`;
      case 'decision':
        return `${prompt}\n\nTrọng tâm: quyết định trọng yếu, so sánh phương án.`;
      default:
        return prompt;
    }
  }

  private buildAgentPrompt(params: {
    round: number;
    topic: string;
    context: string;
    systemPrompt: string;
    previous: DebateRound | null;
    instructions: string | null;
    agentLabel: string;
  }): string {
    const { round, topic, context, previous, instructions, agentLabel } = params;

    return `${agentLabel} - Vòng ${round + 1}

CHỦ ĐỀ:
${topic}

BỐI CẢNH:
${context}

${previous ? `VÒNG TRƯỚC:\n${JSON.stringify(previous, null, 2)}\n\n` : ''}${
      instructions || 'Hãy đưa ra quan điểm đầu tiên của bạn.'
    }

OUTPUT JSON (chỉ JSON):
{
  "position": "...",
  "reasoning": "...",
  "keyPoints": ["...", "..."]
}`;
  }

  private parseAgentResponse(text: string): DebateAgentPosition {
    const parsed = this.extractJson(text) as any;

    if (parsed && parsed.position) {
      return {
        position: String(parsed.position).trim(),
        reasoning: String(parsed.reasoning || '').trim(),
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String) : [],
      };
    }

    const fallbackPosition = text.trim();
    return {
      position: fallbackPosition.slice(0, 800),
      reasoning: fallbackPosition.slice(800, 1400),
      keyPoints: [],
    };
  }

  private parseJudgeResponse(text: string): JudgeSummary | undefined {
    const parsed = this.extractJson(text) as any;
    if (!parsed) return undefined;

    const recommendation = this.normalizeDecision(parsed.recommendation);

    return {
      winner: parsed.winner,
      reasoning: parsed.reasoning,
      recommendation,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String) : [],
    };
  }

  private normalizeDecision(value: string | undefined): DebateDecision | undefined {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized.includes('approve')) return 'approved';
    if (normalized.includes('needs')) return 'needs_revision';
    if (normalized.includes('reject')) return 'rejected';
    return undefined;
  }

  private extractJson(text: string): unknown | null {
    try {
      return parseJsonFromLlmText<unknown>(text, { required: false });
    } catch {
      return null;
    }
  }

  private calculateAverageAgreement(rounds: DebateRound[]): number {
    if (!rounds.length) return 50;
    const total = rounds.reduce((sum, round) => sum + round.agreement, 0);
    return total / rounds.length;
  }

  private calculateAgreement(positionA: string, positionB: string): number {
    const keywordsA = this.extractKeywords(positionA);
    const keywordsB = this.extractKeywords(positionB);

    if (keywordsA.length === 0 || keywordsB.length === 0) {
      return 50;
    }

    const setA = new Set(keywordsA);
    const setB = new Set(keywordsB);
    const intersection = Array.from(setA).filter((word) => setB.has(word));
    const union = new Set([...setA, ...setB]);

    const agreementRatio = intersection.length / Math.max(1, union.size);
    return Math.round(agreementRatio * 100);
  }

  private shouldEscalateToJudge(disagreement: number): boolean {
    return disagreement >= env.ai.debate.disagreementThreshold;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'và', 'là', 'của', 'trong', 'một', 'để', 'cho', 'với', 'các', 'những',
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'are', 'was',
      'be', 'in', 'on', 'to', 'of', 'is', 'as', 'it', 'an', 'by', 'at', 'or',
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }

  private extractHighlights(positionA: DebateAgentPosition, positionB: DebateAgentPosition): string[] {
    const highlights = [...positionA.keyPoints, ...positionB.keyPoints]
      .filter((item) => item && item.trim().length > 0)
      .slice(0, 6);

    if (highlights.length > 0) return highlights;

    return [
      positionA.position.slice(0, 120),
      positionB.position.slice(0, 120),
    ].filter(Boolean);
  }

  private synthesizeConsensus(rounds: DebateRound[]): string {
    return rounds
      .map((round) => `Vòng ${round.round}: Đồng ý ${round.agreement}%\n- A: ${round.agentA.position}\n- B: ${round.agentB.position}`)
      .join('\n\n');
  }

  private serializeDebate(rounds: DebateRound[], request: DebateRequest): string {
    return JSON.stringify({
      topic: request.topic,
      debateType: request.debateType,
      rounds,
    }, null, 2);
  }

  private makeDecision(disagreement: number, judgeRecommendation?: DebateDecision): DebateDecision {
    if (judgeRecommendation) return judgeRecommendation;

    if (disagreement > 70) return 'rejected';
    if (disagreement > 40) return 'needs_revision';
    return 'approved';
  }

  private async getCachedResult(debateId: string): Promise<DebateResult | null> {
    const cacheKey = `${this.cachePrefix}${debateId}`;

    try {
      const cached = await redisHelpers.get(cacheKey);
      if (!cached) return null;
      return JSON.parse(cached.toString()) as DebateResult;
    } catch (error) {
      return null;
    }
  }

  private async cacheResult(debateId: string, result: DebateResult): Promise<void> {
    const cacheKey = `${this.cachePrefix}${debateId}`;
    const ttl = env.ai.debate.cacheTtl;

    try {
      await redisHelpers.set(cacheKey, JSON.stringify(result), ttl);
    } catch (error) {
      logger.warn('[Debate] Failed to cache result');
    }
  }

  private async trackDebateUsage(userId: string): Promise<void> {
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `ai:debate:usage:${dateKey}:${userId}`;

    try {
      const currentValue = await redisHelpers.get(cacheKey);
      const currentCount = currentValue ? Number.parseInt(currentValue.toString(), 10) : 0;
      const nextCount = currentCount + 1;

      await redisHelpers.set(cacheKey, String(nextCount), 24 * 60 * 60);

      if (nextCount > env.ai.debate.dailyLimit) {
        logger.warn('[Debate] Daily debate limit exceeded', { userId, nextCount });
      }
    } catch (error) {
      logger.warn('[Debate] Failed to track debate usage');
    }
  }

  private async assertWithinDailyLimit(userId: string): Promise<void> {
    if (env.ai.debate.dailyLimit <= 0) return;

    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `ai:debate:usage:${dateKey}:${userId}`;

    try {
      const currentValue = await redisHelpers.get(cacheKey);
      const currentCount = currentValue ? Number.parseInt(currentValue.toString(), 10) : 0;

      if (currentCount >= env.ai.debate.dailyLimit) {
        throw new Error('Debate daily limit exceeded');
      }
    } catch (error: any) {
      if (error?.message === 'Debate daily limit exceeded') {
        throw error;
      }
      // If Redis is unavailable, do not block the request.
    }
  }

  private async maybeTrackJudgeUsage(requiresJudge: boolean): Promise<void> {
    if (!requiresJudge || env.ai.debate.judgeCallsMonthlyMax <= 0) return;

    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const cacheKey = `ai:debate:judge:${monthKey}`;

    try {
      const currentValue = await redisHelpers.get(cacheKey);
      const currentCount = currentValue ? Number.parseInt(currentValue.toString(), 10) : 0;
      const nextCount = currentCount + 1;

      await redisHelpers.set(cacheKey, String(nextCount), 31 * 24 * 60 * 60);

      if (nextCount > env.ai.debate.judgeCallsMonthlyMax) {
        logger.warn('[Debate] Monthly judge limit exceeded', { nextCount });
      }
    } catch (error) {
      logger.warn('[Debate] Failed to track judge usage');
    }
  }
}
