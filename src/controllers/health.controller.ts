// ==========================================
// StarNova API - Health Check Controller
// ==========================================

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DatabaseConnection from '../database/connection';
import RedisCache from '../database/redis';
import config from '../config';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  const start = Date.now();

  const mongoStatus = await DatabaseConnection.healthCheck();
  const redisStatus = RedisCache.getStatus();

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.swagger.version,
    services: {
      mongodb: mongoStatus,
      redis: {
        status: redisStatus ? 'connected' : 'disconnected',
      },
      api: {
        status: 'running',
        responseTime: Date.now() - start,
      },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    pid: process.pid,
    nodeVersion: process.version,
  };

  const httpStatus = mongoStatus.status === 'healthy' ? 200 : 503;
  res.status(httpStatus).json(status);
};
