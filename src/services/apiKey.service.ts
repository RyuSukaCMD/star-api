// ==========================================
// StarNova API - API Key Service
// ==========================================

import ApiKey from '../models/ApiKey';
import User from '../models/User';
import config from '../config';
import { ApiError } from '../middlewares/errorHandler';
import { generateApiKey, addDays, addMonths } from '../utils/helpers';
import logger from '../utils/logger';
import RedisCache from '../database/redis';

class ApiKeyService {
  // Create new API key
  async create(
    userId: string,
    data: {
      name: string;
      dailyLimit?: number;
      monthlyLimit?: number;
      expiresAt?: string;
      whitelistIps?: string[];
      permissions?: string[];
    },
  ): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    // Check API key limit per plan
    const keyCount = await ApiKey.countDocuments({ user: userId });
    const maxKeys = user.plan === 'free' ? 3 : user.plan === 'basic' ? 10 : user.plan === 'premium' ? 50 : 100;

    if (keyCount >= maxKeys) {
      throw new ApiError(400, `Maximum ${maxKeys} API keys allowed for ${user.plan} plan`);
    }

    const planLimits: Record<string, { daily: number; monthly: number }> = {
      free: { daily: 100, monthly: 3000 },
      basic: { daily: 1000, monthly: 30000 },
      premium: { daily: 10000, monthly: 300000 },
      enterprise: { daily: 100000, monthly: 3000000 },
    };

    const limits = planLimits[user.plan] || planLimits.free;

    const key = generateApiKey(config.apiKey.prefix, config.apiKey.length);

    const apiKey = await ApiKey.create({
      key,
      prefix: config.apiKey.prefix,
      name: data.name,
      user: userId,
      plan: user.plan,
      dailyLimit: data.dailyLimit || limits.daily,
      monthlyLimit: data.monthlyLimit || limits.monthly,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      whitelistIps: data.whitelistIps || [],
      permissions: data.permissions || [],
    });

    // Add to user's apiKeys array
    user.apiKeys.push(apiKey._id);
    await user.save();

    logger.info(`API Key created for user ${userId}: ${apiKey._id}`);

    return apiKey.toJSON();
  }

  // Get all API keys for user
  async getAll(userId: string, page = 1, limit = 10): Promise<{ keys: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [keys, total] = await Promise.all([
      ApiKey.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApiKey.countDocuments({ user: userId }),
    ]);

    return { keys, total };
  }

  // Get single API key
  async getById(keyId: string, userId: string): Promise<any> {
    const key = await ApiKey.findOne({ _id: keyId, user: userId });
    if (!key) throw new ApiError(404, 'API Key not found');
    return key.toJSON();
  }

  // Update API key
  async update(
    keyId: string,
    userId: string,
    data: {
      name?: string;
      dailyLimit?: number;
      monthlyLimit?: number;
      expiresAt?: Date | null;
      whitelistIps?: string[];
      permissions?: string[];
    },
  ): Promise<any> {
    const key = await ApiKey.findOne({ _id: keyId, user: userId });
    if (!key) throw new ApiError(404, 'API Key not found');

    if (data.name) key.name = data.name;
    if (data.dailyLimit) key.dailyLimit = data.dailyLimit;
    if (data.monthlyLimit) key.monthlyLimit = data.monthlyLimit;
    if (data.expiresAt !== undefined) key.expiresAt = data.expiresAt;
    if (data.whitelistIps) key.whitelistIps = data.whitelistIps;
    if (data.permissions) key.permissions = data.permissions;

    await key.save();

    // Invalidate cache
    await RedisCache.del(`apikey:${key.key}`);

    return key.toJSON();
  }

  // Delete API key
  async delete(keyId: string, userId: string): Promise<void> {
    const key = await ApiKey.findOne({ _id: keyId, user: userId });
    if (!key) throw new ApiError(404, 'API Key not found');

    // Remove from user's array
    await User.findByIdAndUpdate(userId, {
      $pull: { apiKeys: keyId },
    });

    await ApiKey.deleteOne({ _id: keyId });
    await RedisCache.del(`apikey:${key.key}`);

    logger.info(`API Key deleted: ${keyId}`);
  }

  // Toggle API key active status
  async toggle(keyId: string, userId: string): Promise<any> {
    const key = await ApiKey.findOne({ _id: keyId, user: userId });
    if (!key) throw new ApiError(404, 'API Key not found');

    key.isActive = !key.isActive;
    await key.save();

    await RedisCache.del(`apikey:${key.key}`);

    return key.toJSON();
  }

  // Regenerate API key
  async regenerate(keyId: string, userId: string): Promise<any> {
    const key = await ApiKey.findOne({ _id: keyId, user: userId });
    if (!key) throw new ApiError(404, 'API Key not found');

    const newKey = generateApiKey(config.apiKey.prefix, config.apiKey.length);

    // Cache old key for invalidation
    await RedisCache.del(`apikey:${key.key}`);

    key.key = newKey;
    key.usageCount = 0;
    key.dailyUsage = 0;
    key.monthlyUsage = 0;
    await key.save();

    return key.toJSON();
  }

  // Verify API key (for middleware)
  async verify(key: string): Promise<any> {
    // Check cache first
    const cached = await RedisCache.get(`apikey:${key}`);
    if (cached) return cached;

    const keyDoc = await ApiKey.findOne({ key });
    if (!keyDoc) return null;

    // Cache for 5 minutes
    await RedisCache.set(`apikey:${key}`, keyDoc.toJSON(), 300);

    return keyDoc.toJSON();
  }

  // Admin: Get all API keys
  async adminGetAll(page = 1, limit = 20): Promise<{ keys: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [keys, total] = await Promise.all([
      ApiKey.find()
        .populate('user', 'email username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApiKey.countDocuments(),
    ]);

    return { keys, total };
  }
}

export default new ApiKeyService();
