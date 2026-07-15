// ==========================================
// StarNova API - Admin Controller
// ==========================================

import { Response, NextFunction } from 'express';
import User from '../models/User';
import ApiKey from '../models/ApiKey';
import RequestLog from '../models/RequestLog';
import Analytics from '../models/Analytics';
import Payment from '../models/Payment';
import Settings from '../models/Settings';
import Plan from '../models/Plan';
import { AuthenticatedRequest } from '../types';
import { successResponse, getPaginationMeta, getPaginationParams, asyncHandler } from '../utils/helpers';
import { ApiError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

// ---- Dashboard Stats ----
export const getDashboardStats = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const [totalUsers, totalApiKeys, totalRequests, activeKeys, recentPayments] = await Promise.all([
      User.countDocuments(),
      ApiKey.countDocuments(),
      RequestLog.countDocuments(),
      ApiKey.countDocuments({ isActive: true }),
      Payment.countDocuments({ status: 'success' }),
    ]);

    const stats = {
      totalUsers,
      totalApiKeys,
      totalRequests,
      activeKeys,
      totalPayments: recentPayments,
      uptime: process.uptime(),
    };

    res.status(200).json(successResponse(stats));
  },
);

// ---- User Management ----
export const getUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { page, limit } = getPaginationParams(req.query as any);
    const search = (req.query.search as string) || '';
    const role = req.query.role as string;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json(
      successResponse(users, 'Users retrieved', getPaginationMeta(total, page, limit)),
    );
  },
);

export const getUserDetail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.params.id).populate('apiKeys');
    if (!user) throw new ApiError(404, 'User not found');

    const usageStats = await RequestLog.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
    ]);

    res.status(200).json(successResponse({ user: user.toJSON(), usageStats: usageStats[0] || { totalRequests: 0, avgResponseTime: 0 } }));
  },
);

export const banUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = req.body.reason || 'Violation of terms of service';
    await user.save();

    // Disable all API keys
    await ApiKey.updateMany(
      { user: user._id },
      { isActive: false, isDisabled: true, disabledReason: user.banReason },
    );

    logger.info(`User banned: ${user._id} - Reason: ${user.banReason}`);
    res.status(200).json(successResponse(null, 'User banned'));
  },
);

export const unbanUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.isBanned = false;
    user.bannedAt = undefined;
    user.banReason = undefined;
    await user.save();

    await ApiKey.updateMany(
      { user: user._id },
      { isActive: true, isDisabled: false, disabledReason: undefined },
    );

    logger.info(`User unbanned: ${user._id}`);
    res.status(200).json(successResponse(null, 'User unbanned'));
  },
);

// ---- API Key Management (Admin) ----
export const getApiKeys = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { page, limit } = getPaginationParams(req.query as any);
    const skip = (page - 1) * limit;

    const [keys, total] = await Promise.all([
      ApiKey.find()
        .populate('user', 'email username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApiKey.countDocuments(),
    ]);

    res.status(200).json(
      successResponse(keys, 'API Keys retrieved', getPaginationMeta(total, page, limit)),
    );
  },
);

// ---- Analytics ----
export const getAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const days = parseInt(req.query.days as string || '7', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      date: { $gte: startDate.toISOString().split('T')[0] },
    }).sort({ date: 1 });

    res.status(200).json(successResponse(analytics));
  },
);

// ---- Settings Management ----
export const getSettings = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const settings = await Settings.find().sort({ group: 1, key: 1 });
    res.status(200).json(successResponse(settings));
  },
);

export const updateSetting = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { key, value, description, type, group, isPublic } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, description, type, group, isPublic },
      { upsert: true, new: true },
    );

    logger.info(`Setting updated: ${key} = ${JSON.stringify(value)}`);
    res.status(200).json(successResponse(setting, 'Setting updated'));
  },
);

// ---- Maintenance Mode ----
export const setMaintenance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { enabled, message } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: enabled, type: 'boolean', group: 'system' },
      { upsert: true, new: true },
    );

    if (message) {
      await Settings.findOneAndUpdate(
        { key: 'maintenance_message' },
        { value: message, type: 'string', group: 'system' },
        { upsert: true },
      );
    }

    const status = enabled ? 'enabled' : 'disabled';
    logger.info(`Maintenance mode ${status}`);
    res.status(200).json(successResponse({ enabled }, `Maintenance mode ${status}`));
  },
);

// ---- System Logs ----
export const getLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { page, limit } = getPaginationParams(req.query as any);
    const level = req.query.level as string;

    const filter: any = {};
    if (level) filter.level = level;

    const skip = (page - 1) * limit;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const logs = await RequestLog.find({ timestamp: { $gte: startOfDay } })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(successResponse(logs));
  },
);
