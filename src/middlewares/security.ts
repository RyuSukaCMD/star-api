// ==========================================
// StarNova API - Security Middleware
// ==========================================

import { Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { AuthenticatedRequest } from '../types';
import config from '../config';
import { errorResponse } from '../utils/helpers';

// Helmet security headers (configured)
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// MongoDB injection sanitization
export const sanitize = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }: { req: any; key: string }) => {
    console.warn(`Sanitized ${key} in request from ${req.ip}`);
  },
});

// Maintenance mode check
export const maintenanceCheck = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (config.maintenance.mode) {
    // Allow admins and health checks
    if (req.user?.role === 'admin' || req.user?.role === 'owner' || req.originalUrl === '/health') {
      next();
      return;
    }

    res.status(503).json(
      errorResponse(config.maintenance.message, 'MaintenanceMode', 503),
    );
    return;
  }
  next();
};

// Input sanitization for common attacks
export const sanitizeInput = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove potential NoSQL injection patterns
        req.body[key] = req.body[key]
          .replace(/\$\{/g, '')
          .replace(/^\$gt/, '')
          .replace(/^\$ne/, '')
          .replace(/^\$regex/, '')
          .replace(/^\$where/, '')
          .replace(/^\$exists/, '');
      }
    });
  }
  next();
};
