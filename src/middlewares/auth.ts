// ==========================================
// StarNova API - Authentication Middleware
// ==========================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiKey from '../models/ApiKey';
import config from '../config';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/helpers';

// ---- JWT Authentication ----
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(errorResponse('Authentication required', 'No token provided', 401));
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json(errorResponse('User not found', 'Invalid token', 401));
      return;
    }

    if (!user.isActive || user.isBanned) {
      res.status(403).json(errorResponse('Account is inactive or banned', 'Access denied', 403));
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json(errorResponse('Token has expired', 'Token expired', 401));
      return;
    }
    logger.error('JWT Authentication error:', error);
    res.status(401).json(errorResponse('Invalid token', 'Authentication failed', 401));
  }
};

// ---- Optional JWT Authentication ----
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.isBanned) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

// ---- API Key Authentication ----
export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;

    if (!apiKey) {
      res.status(401).json(errorResponse('API key is required', 'Missing API key', 401));
      return;
    }

    const keyDoc = await ApiKey.findOne({ key: apiKey });

    if (!keyDoc) {
      res.status(401).json(errorResponse('Invalid API key', 'API key not found', 401));
      return;
    }

    if (!keyDoc.isActive || keyDoc.isDisabled) {
      res.status(403).json(errorResponse('API key is disabled', 'API key inactive', 403));
      return;
    }

    if (keyDoc.expiresAt && new Date() > keyDoc.expiresAt) {
      res.status(403).json(errorResponse('API key has expired', 'API key expired', 403));
      return;
    }

    // Check daily limit
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (keyDoc.lastDailyReset < todayStart) {
      keyDoc.dailyUsage = 0;
      keyDoc.lastDailyReset = now;
    }

    if (keyDoc.dailyUsage >= keyDoc.dailyLimit) {
      res.status(429).json(errorResponse('Daily request limit exceeded', 'Rate limit exceeded', 429));
      return;
    }

    // Check monthly limit
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (keyDoc.lastMonthlyReset < monthStart) {
      keyDoc.monthlyUsage = 0;
      keyDoc.lastMonthlyReset = now;
    }

    if (keyDoc.monthlyUsage >= keyDoc.monthlyLimit) {
      res.status(429).json(errorResponse('Monthly request limit exceeded', 'Rate limit exceeded', 429));
      return;
    }

    // Check whitelist IPs
    if (keyDoc.whitelistIps.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress || '';
      const allowed = keyDoc.whitelistIps.some(
        (ip) => ip === clientIp || (ip.includes('*') && clientIp.startsWith(ip.replace('*', ''))),
      );
      if (!allowed) {
        res.status(403).json(errorResponse('IP address not allowed', 'IP forbidden', 403));
        return;
      }
    }

    // Update usage
    keyDoc.dailyUsage += 1;
    keyDoc.monthlyUsage += 1;
    keyDoc.usageCount += 1;
    keyDoc.lastUsed = now;
    await keyDoc.save();

    req.apiKey = keyDoc;
    next();
  } catch (error) {
    logger.error('API Key authentication error:', error);
    res.status(500).json(errorResponse('Authentication error', 'Server error', 500));
  }
};

// ---- Role-based Authorization ----
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required', 'Not authenticated', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(errorResponse('Insufficient permissions', 'Forbidden', 403));
      return;
    }

    next();
  };
};

// ---- Admin Only ----
export const adminOnly = authorize('admin', 'owner');

// ---- Owner Only ----
export const ownerOnly = authorize('owner');
