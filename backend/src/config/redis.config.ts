import { createClient } from 'redis';
import logger from '@utils/logger.util';

// Get Redis configuration from environment variables
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

// Redis client configuration - use host/port directly instead of URL
const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    family: 4 // Force IPv4
  }
});

// Redis connection events
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('end', () => {
  logger.info('Redis client disconnected');
});

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    logger.info('Redis connection established successfully');
  } catch (error: unknown) {
    logger.error('Unable to connect to Redis:', error);
    throw error;
  }
}

// Redis helper functions
export const redisHelpers = {
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
    } catch (error: unknown) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  },

  async get(key: string): Promise<string | Buffer | null> {
    try {
      return await redisClient.get(key);
    } catch (error: unknown) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error: unknown) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error: unknown) {
      logger.error('Redis EXISTS error:', error);
      throw error;
    }
  }
};

export { redisClient };

