// ==========================================
// StarNova API - Request Logger Middleware
// ==========================================

import { Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';
import { AuthenticatedRequest } from '../types';
import { stream } from '../utils/logger';
import { logRequest } from '../utils/logger';
import RequestLog from '../models/RequestLog';

// Morgan HTTP request logger
export const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream },
);

// Request ID middleware
export const requestId = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  req.requestId = uuidv4();
  next();
};

// Request timing middleware
export const requestTimer = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  req.startTime = Date.now();
  next();
};

// Detailed request logger
export const detailedLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  // Capture end event
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      const clientIp = requestIp.getClientIp(req) || req.ip || 'unknown';
      const geo = geoip.lookup(clientIp);

      // Get request body (sanitized)
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
      if (sanitizedBody.secret) sanitizedBody.secret = '[REDACTED]';

      // Log to logger
      logRequest(
        req.method,
        req.originalUrl,
        res.statusCode,
        responseTime,
        clientIp,
        req.apiKey?.key,
        req.user?._id?.toString(),
        res.statusCode >= 400 ? res.statusMessage : undefined,
      );

      // Save to database (skip for static files and health checks)
      if (!req.originalUrl.startsWith('/health') && !req.originalUrl.startsWith('/uploads')) {
        const logEntry = new RequestLog({
          apiKey: req.apiKey?.key,
          user: req.user?._id,
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          ip: clientIp,
          country: geo?.country || 'Unknown',
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer,
          headers: {
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent'],
            referer: req.headers.referer,
            origin: req.headers.origin,
          },
          query: req.query as Record<string, unknown>,
          body: sanitizedBody,
          responseSize: parseInt(res.getHeader('content-length') as string || '0', 10),
          cached: res.getHeader('x-cache') === 'HIT',
          error: res.statusCode >= 400 ? res.statusMessage : undefined,
          timestamp: new Date(),
        });

        // Don't await - fire and forget for performance
        logEntry.save().catch((err) => {
          console.error('Failed to save request log:', err);
        });
      }
    } catch (error) {
      console.error('Logger middleware error:', error);
    }
  });

  next();
};

// IP logger middleware
export const ipLogger = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const clientIp = requestIp.getClientIp(req) || req.ip || 'unknown';
  req.ip = clientIp;
  next();
};
