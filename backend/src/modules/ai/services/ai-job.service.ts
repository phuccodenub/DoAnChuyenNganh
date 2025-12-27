import crypto from 'crypto';
import { createClient, RedisClientType } from 'redis';
import logger from '../../../utils/logger.util';

export type AIJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface AIJob<T = unknown> {
  id: string;
  status: AIJobStatus;
  result?: T;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, unknown>;
}

interface StoredJob extends Omit<AIJob, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export class AIJobService {
  private readonly jobs = new Map<string, AIJob>();
  private readonly ttlMs = 60 * 60 * 1000; // 1 hour
  private readonly keyPrefix = 'ai:jobs:';
  private client: RedisClientType | null = null;
  private connected = false;

  constructor() {
    this.initializeRedis();
  }

  createJob(meta?: Record<string, unknown>) {
    const id = crypto.randomUUID();
    const now = new Date();
    const job: AIJob = {
      id,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
      meta,
    };
    this.jobs.set(id, job);
    this.persistJob(job).catch(() => undefined);
    this.scheduleCleanup(id);
    return job;
  }

  async getJob(id: string) {
    const memoryJob = this.jobs.get(id);
    if (memoryJob) return memoryJob;

    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const raw = await this.client.get(`${this.keyPrefix}${id}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredJob;
      const job: AIJob = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
      this.jobs.set(id, job);
      return job;
    } catch (error) {
      logger.warn('[AIJobService] Failed to read job from Redis');
      return null;
    }
  }

  startJob<T>(id: string, handler: () => Promise<T>) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'processing';
    job.updatedAt = new Date();
    this.persistJob(job).catch(() => undefined);

    void handler()
      .then((result) => {
        job.status = 'completed';
        job.result = result as unknown;
        job.updatedAt = new Date();
        this.persistJob(job).catch(() => undefined);
      })
      .catch((error: any) => {
        job.status = 'failed';
        job.error = error?.message || 'Job failed';
        job.updatedAt = new Date();
        this.persistJob(job).catch(() => undefined);
      });
  }

  private async persistJob(job: AIJob) {
    if (!this.connected || !this.client) return;
    const key = `${this.keyPrefix}${job.id}`;
    const payload: StoredJob = {
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
    await this.client.set(key, JSON.stringify(payload), {
      PX: this.ttlMs,
    });
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({
        url: redisUrl,
        database: 3,
      });
      this.client.on('error', (err) => {
        logger.warn('[AIJobService] Redis error:', err);
        this.connected = false;
      });
      this.client.on('connect', () => {
        this.connected = true;
        logger.info('[AIJobService] Connected to Redis');
      });
      await this.client.connect();
    } catch (error) {
      logger.warn('[AIJobService] Redis not available, using memory jobs only');
      this.client = null;
      this.connected = false;
    }
  }

  private scheduleCleanup(id: string) {
    setTimeout(() => {
      this.jobs.delete(id);
    }, this.ttlMs);
  }
}

export const aiJobService = new AIJobService();
