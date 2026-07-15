// ==========================================
// StarNova API - Winston Logger Configuration
// ==========================================

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Create log directory if it doesn't exist
const logDir = path.resolve(config.logging.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  }),
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 && meta.stack
      ? `\n${meta.stack}`
      : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Write all logs to combined file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to separate file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Write request logs
    new winston.transports.File({
      filename: path.join(logDir, 'requests.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

// Create a stream for Morgan integration
export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Request logger helper
export const logRequest = (
  method: string,
  endpoint: string,
  statusCode: number,
  responseTime: number,
  ip: string,
  apiKey?: string,
  userId?: string,
  error?: string,
): void => {
  const logData = {
    method,
    endpoint,
    statusCode,
    responseTime: `${responseTime}ms`,
    ip,
    apiKey: apiKey || 'anonymous',
    userId: userId || 'anonymous',
    error: error || null,
  };

  if (statusCode >= 400) {
    logger.warn('API Request Failed', logData);
  } else {
    logger.info('API Request', logData);
  }
};

// Audit log for sensitive operations
export const auditLog = (
  action: string,
  userId: string,
  details: Record<string, unknown>,
  ip?: string,
): void => {
  logger.info('AUDIT', {
    action,
    userId,
    ...details,
    ip: ip || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

export default logger;
