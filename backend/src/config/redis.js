/**
 * Redis Configuration
 * Redis client setup for caching and real-time data
 */

const redis = require('redis');
const logger = require('./logger');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis connection attempts exceeded');
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('end', () => {
  logger.warn('Redis client connection ended');
});

redisClient.on('reconnecting', (params) => {
  logger.info('Redis client reconnecting:', params);
});

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// Helper functions for common Redis operations

/**
 * Set a key-value pair with optional expiration
 */
async function setData(key, value, expireInSeconds = null) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (expireInSeconds) {
      await redisClient.setEx(key, expireInSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
}

/**
 * Get a value by key
 */
async function getData(key) {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not JSON
    }
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
}

/**
 * Delete a key
 */
async function deleteData(key) {
  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    logger.error('Redis DELETE error:', error);
    return false;
  }
}

/**
 * Check if key exists
 */
async function exists(key) {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Redis EXISTS error:', error);
    return false;
  }
}

/**
 * Set expiration time for a key
 */
async function expire(key, seconds) {
  try {
    const result = await redisClient.expire(key, seconds);
    return result === 1;
  } catch (error) {
    logger.error('Redis EXPIRE error:', error);
    return false;
  }
}

/**
 * Add item to a set
 */
async function addToSet(setKey, value) {
  try {
    const result = await redisClient.sAdd(setKey, value);
    return result > 0;
  } catch (error) {
    logger.error('Redis SADD error:', error);
    return false;
  }
}

/**
 * Remove item from a set
 */
async function removeFromSet(setKey, value) {
  try {
    const result = await redisClient.sRem(setKey, value);
    return result > 0;
  } catch (error) {
    logger.error('Redis SREM error:', error);
    return false;
  }
}

/**
 * Get all members of a set
 */
async function getSetMembers(setKey) {
  try {
    const members = await redisClient.sMembers(setKey);
    return members;
  } catch (error) {
    logger.error('Redis SMEMBERS error:', error);
    return [];
  }
}

/**
 * Get set size
 */
async function getSetSize(setKey) {
  try {
    const size = await redisClient.sCard(setKey);
    return size;
  } catch (error) {
    logger.error('Redis SCARD error:', error);
    return 0;
  }
}

/**
 * Publish a message to a channel
 */
async function publish(channel, message) {
  try {
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const result = await redisClient.publish(channel, stringMessage);
    return result;
  } catch (error) {
    logger.error('Redis PUBLISH error:', error);
    return 0;
  }
}

/**
 * Cache user session data
 */
async function cacheUserSession(userId, sessionData, expireInSeconds = 3600) {
  const key = `session:${userId}`;
  return await setData(key, sessionData, expireInSeconds);
}

/**
 * Get cached user session
 */
async function getUserSession(userId) {
  const key = `session:${userId}`;
  return await getData(key);
}

/**
 * Cache online users in a course
 */
async function addOnlineUser(courseId, userId) {
  const key = `online_users:${courseId}`;
  return await addToSet(key, userId.toString());
}

/**
 * Remove user from online list
 */
async function removeOnlineUser(courseId, userId) {
  const key = `online_users:${courseId}`;
  return await removeFromSet(key, userId.toString());
}

/**
 * Get online users for a course
 */
async function getOnlineUsers(courseId) {
  const key = `online_users:${courseId}`;
  return await getSetMembers(key);
}

/**
 * Cache chat message temporarily
 */
async function cacheChatMessage(courseId, message, expireInSeconds = 3600) {
  const key = `chat_temp:${courseId}:${Date.now()}`;
  return await setData(key, message, expireInSeconds);
}

module.exports = {
  redisClient,
  connectRedis,
  setData,
  getData,
  deleteData,
  exists,
  expire,
  addToSet,
  removeFromSet,
  getSetMembers,
  getSetSize,
  publish,
  cacheUserSession,
  getUserSession,
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
  cacheChatMessage
};