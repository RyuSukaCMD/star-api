// ==========================================
// StarNova API - Redis Cache Client
// ==========================================

import { createClient, RedisClientType } from 'redis';
import config from '../config';
import logger from '../utils/logger';

class RedisCache {
  private static instance: RedisCache;
  private client: RedisClientType;
  private isConnected = false;
  private isEnabled = true;

  private constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries reached, disabling cache');
            this.isEnabled = false;
            return false;
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: config.redis.password || undefined,
      database: config.redis.db,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
      this.isEnabled = true;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.client.connect();
    } catch (error) {
      logger.warn('Redis connection failed, cache will be disabled:', error);
      this.isEnabled = false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error('Error disconnecting Redis:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.warn(`Redis set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.warn(`Redis del error for key ${key}:`, error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.warn(`Redis delPattern error for ${pattern}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected) return false;
    try {
      return (await this.client.exists(key)) > 0;
    } catch (error) {
      return false;
    }
  }

  async increment(key: string, by = 1): Promise<number | null> {
    if (!this.isEnabled || !this.isConnected) return null;
    try {
      return await this.client.incrBy(key, by);
    } catch (error) {
      logger.warn(`Redis increment error for key ${key}:`, error);
      return null;
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.isEnabled || !this.isConnected) return null;
    try {
      return await this.client.ttl(key);
    } catch (error) {
      return null;
    }
  }

  async flushAll(): Promise<boolean> {
    if (!this.isEnabled || !this.isConnected) return false;
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.warn('Redis flushAll error:', error);
      return false;
    }
  }

  generateKey(prefix: string, ...args: string[]): string {
    return `${prefix}:${args.join(':')}`;
  }

  getStatus(): boolean {
    return this.isConnected && this.isEnabled;
  }
}

export default RedisCache.getInstance();
